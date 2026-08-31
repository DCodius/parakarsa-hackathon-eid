import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { DatabaseService } from '../db/database.service.js';

/** Cakupan data yang bisa dibuka-tutup pemilik akun — FR-04 (DART). */
export const CONSENT_SCOPES = ['identity', 'phone', 'ep', 'third-party'] as const;
export type ConsentScope = (typeof CONSENT_SCOPES)[number];

/** Identitas dasar wajib menyala: tanpa itu akun tidak bisa dibentuk. */
const LOCKED: ConsentScope[] = ['identity'];

const DEFAULTS: Record<ConsentScope, boolean> = {
  identity: true,
  phone: true,
  ep: true,
  'third-party': false,
};

export interface ConsentEntry {
  scope: string;
  action: 'DIBERIKAN' | 'DICABUT';
  ref: string;
  at: string;
  /** Sidik jari entri ini, sekaligus kunci bagi entri berikutnya. */
  entryHash: string;
}

/** Hasil pemeriksaan keutuhan rantai audit — TC-EID-02. */
export interface ChainStatus {
  intact: boolean;
  entries: number;
  /** Hash entri terakhir; inilah yang kelak dijangkarkan ke IDChain. */
  head: string | null;
  /** Terisi nomor entri pertama yang tidak cocok, bila rantai putus. */
  brokenAt?: number;
}

const LOG_LIMIT = 20;

/**
 * FR-04 / TC-EID-02 — pilihan consent dan jejak perubahannya disimpan di sisi
 * server, sehingga pencabutan berlaku untuk semua perangkat dan tetap terbaca
 * saat diperiksa auditor.
 */
@Injectable()
export class ConsentService {
  constructor(private readonly database: DatabaseService) {}

  state(accountId: string): Record<ConsentScope, boolean> {
    const rows = this.database.db
      .prepare('SELECT scope, granted FROM consents WHERE account_id = ?')
      .all(accountId) as { scope: ConsentScope; granted: number }[];

    const state = { ...DEFAULTS };
    for (const row of rows) state[row.scope] = row.granted === 1;
    return state;
  }

  set(accountId: string, scope: string, granted: boolean): ConsentEntry {
    if (!CONSENT_SCOPES.includes(scope as ConsentScope)) {
      throw new BadRequestException(`Cakupan consent tidak dikenal: ${scope}`);
    }
    if (LOCKED.includes(scope as ConsentScope) && !granted) {
      throw new BadRequestException(`Cakupan ${scope} wajib aktif dan tidak bisa dicabut`);
    }

    const at = new Date().toISOString();
    const previous = this.head(accountId);
    this.database.db
      .prepare(
        `INSERT INTO consents (account_id, scope, granted, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(account_id, scope) DO UPDATE SET
           granted = excluded.granted, updated_at = excluded.updated_at`,
      )
      .run(accountId, scope, granted ? 1 : 0, at);

    const action = granted ? 'DIBERIKAN' : 'DICABUT';
    // Diisi hash transaksi begitu head rantai dijangkarkan ke IDChain.
    const ref = `local-${randomUUID().slice(0, 8)}`;
    const entryHash = hashEntry(previous, { accountId, scope, action, ref, at });

    this.database.db
      .prepare(
        `INSERT INTO consent_log (account_id, scope, action, ref, at, prev_hash, entry_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(accountId, scope, action, ref, at, previous, entryHash);

    return { scope, action, ref, at, entryHash };
  }

  log(accountId: string): ConsentEntry[] {
    return this.database.db
      .prepare(
        `SELECT scope, action, ref, at, entry_hash AS entryHash FROM consent_log
         WHERE account_id = ? ORDER BY id DESC LIMIT ?`,
      )
      .all(accountId, LOG_LIMIT) as unknown as ConsentEntry[];
  }

  /** Hash entri terakhir, atau string kosong bila belum ada riwayat. */
  private head(accountId: string): string {
    const row = this.database.db
      .prepare('SELECT entry_hash FROM consent_log WHERE account_id = ? ORDER BY id DESC LIMIT 1')
      .get(accountId) as { entry_hash: string } | undefined;
    return row?.entry_hash ?? '';
  }

  /**
   * Menghitung ulang seluruh rantai dari awal. Satu baris yang diubah atau
   * dihapus langsung membuat hash tidak cocok, dan nomor entrinya dilaporkan.
   */
  verify(accountId: string): ChainStatus {
    const rows = this.database.db
      .prepare(
        `SELECT scope, action, ref, at, prev_hash, entry_hash FROM consent_log
         WHERE account_id = ? ORDER BY id ASC`,
      )
      .all(accountId) as unknown as {
      scope: string;
      action: ConsentEntry['action'];
      ref: string;
      at: string;
      prev_hash: string;
      entry_hash: string;
    }[];

    let previous = '';
    for (const [index, row] of rows.entries()) {
      const expected = hashEntry(previous, { accountId, ...row });
      if (row.prev_hash !== previous || row.entry_hash !== expected) {
        return { intact: false, entries: rows.length, head: previous || null, brokenAt: index + 1 };
      }
      previous = row.entry_hash;
    }

    return { intact: true, entries: rows.length, head: previous || null };
  }
}

/**
 * ponytail: rantai hash lokal. Penjangkaran ke IDChain tinggal menerbitkan
 * nilai `head` ke ledger — isi entrinya tidak perlu ikut keluar.
 */
function hashEntry(
  previous: string,
  entry: { accountId: string; scope: string; action: string; ref: string; at: string },
): string {
  return createHash('sha256')
    .update(`${previous}|${entry.accountId}|${entry.scope}|${entry.action}|${entry.ref}|${entry.at}`)
    .digest('hex');
}
