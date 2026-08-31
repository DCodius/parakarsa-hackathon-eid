import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Penyimpanan lokal (PRD 3.1: PostgreSQL/SQLite untuk metadata dan hash log
 * verifikasi). Memakai `node:sqlite` bawaan Node, jadi tidak ada dependensi
 * tambahan maupun server database yang harus hidup di VPS.
 *
 * ponytail: satu berkas SQLite; pindah ke Postgres kalau nanti butuh lebih dari
 * satu instance API menulis bersamaan.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private handle?: DatabaseSync;

  constructor(private readonly config: ConfigService) {}

  get db(): DatabaseSync {
    if (!this.handle) throw new Error('Database belum dibuka');
    return this.handle;
  }

  onModuleInit(): void {
    const file = this.config.get<string>('DATABASE_FILE') ?? 'data/parakarsa.db';
    if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });

    this.handle = new DatabaseSync(file);
    // WAL menjaga pembacaan tetap jalan saat webhook menulis.
    this.handle.exec('PRAGMA journal_mode = WAL');
    this.handle.exec('PRAGMA foreign_keys = ON');
    this.handle.exec(SCHEMA);
    this.migrate();
    this.logger.log(`Database siap di ${file}`);
  }

  /**
   * Menambal database yang dibuat versi sebelumnya. SQLite tidak punya
   * ADD COLUMN IF NOT EXISTS, jadi kolomnya diperiksa dulu.
   */
  private migrate(): void {
    const columns = this.db.prepare('PRAGMA table_info(consent_log)').all() as { name: string }[];
    for (const column of ['prev_hash', 'entry_hash']) {
      if (!columns.some((existing) => existing.name === column)) {
        this.db.exec(`ALTER TABLE consent_log ADD COLUMN ${column} TEXT NOT NULL DEFAULT ''`);
        this.logger.log(`Kolom consent_log.${column} ditambahkan`);
      }
    }
  }

  onModuleDestroy(): void {
    this.handle?.close();
    this.handle = undefined;
  }
}

/**
 * NIK tidak pernah disimpan utuh: yang tersimpan hanya sidik jarinya (untuk
 * mengenali akun yang sama) dan versi tersamar (untuk ditampilkan). Itulah
 * bentuk konkret dari janji "platform hanya memverifikasi" pada UU PDP 27/2022.
 */
const SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts (
  id           TEXT PRIMARY KEY,
  fullname     TEXT,
  email        TEXT,
  phone        TEXT,
  nik_hash     TEXT UNIQUE,
  nik_masked   TEXT,
  kyc_vendor   TEXT,
  tier         INTEGER NOT NULL DEFAULT 0,
  did_key      TEXT,
  simulated    INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL,
  expires_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS consents (
  account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  scope       TEXT NOT NULL,
  granted     INTEGER NOT NULL,
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (account_id, scope)
);

-- Tiap entri mengunci entri sebelumnya lewat prev_hash, jadi satu baris yang
-- diubah atau dihapus diam-diam akan memutus rantai dan langsung ketahuan.
CREATE TABLE IF NOT EXISTS consent_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id  TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  scope       TEXT NOT NULL,
  action      TEXT NOT NULL,
  ref         TEXT NOT NULL,
  at          TEXT NOT NULL,
  prev_hash   TEXT NOT NULL DEFAULT '',
  entry_hash  TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS verification_log (
  verification_id TEXT PRIMARY KEY,
  account_id      TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  status          TEXT NOT NULL,
  did_key         TEXT,
  on_chain_tx     TEXT,
  claims_hash     TEXT NOT NULL,
  simulated       INTEGER NOT NULL DEFAULT 0,
  at              TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consent_log_account ON consent_log(account_id, id DESC);
`;
