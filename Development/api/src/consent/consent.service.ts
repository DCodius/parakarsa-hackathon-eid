import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
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
    this.database.db
      .prepare(
        `INSERT INTO consents (account_id, scope, granted, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(account_id, scope) DO UPDATE SET
           granted = excluded.granted, updated_at = excluded.updated_at`,
      )
      .run(accountId, scope, granted ? 1 : 0, at);

    const entry: ConsentEntry = {
      scope,
      action: granted ? 'DIBERIKAN' : 'DICABUT',
      // Diisi hash transaksi begitu log consent dicatat ke IDChain.
      ref: `local-${randomUUID().slice(0, 8)}`,
      at,
    };
    this.database.db
      .prepare('INSERT INTO consent_log (account_id, scope, action, ref, at) VALUES (?, ?, ?, ?, ?)')
      .run(accountId, entry.scope, entry.action, entry.ref, entry.at);

    return entry;
  }

  log(accountId: string): ConsentEntry[] {
    return this.database.db
      .prepare(
        'SELECT scope, action, ref, at FROM consent_log WHERE account_id = ? ORDER BY id DESC LIMIT ?',
      )
      .all(accountId, LOG_LIMIT) as unknown as ConsentEntry[];
  }
}
