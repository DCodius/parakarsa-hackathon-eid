import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { readFileSync, rmSync } from 'node:fs';
import { AccountsService } from '../src/accounts/accounts.service.js';
import { Envelope, loadMasterKey } from '../src/common/envelope.js';
import { DatabaseService } from '../src/db/database.service.js';

const DB_FILE = 'data/test-envelope.db';

/**
 * PRD 3.1 — Envelope Encryption AES-256-GCM. Yang diuji bukan sekadar bisa
 * bolak-balik, tapi bahwa berkas databasenya sendiri tidak memuat nama siapa pun.
 */
describe('Envelope encryption (e2e)', () => {
  let accounts: AccountsService;
  let database: DatabaseService;

  beforeAll(async () => {
    rmSync(DB_FILE, { force: true });
    process.env.DATABASE_FILE = DB_FILE;
    process.env.PARAKARSA_MASTER_KEY = Buffer.alloc(32, 'kunci-uji').toString('base64');

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      providers: [DatabaseService, AccountsService],
    }).compile();

    await moduleRef.init();
    accounts = moduleRef.get(AccountsService);
    database = moduleRef.get(DatabaseService);
  });

  afterAll(() => {
    database.onModuleDestroy();
    rmSync(DB_FILE, { force: true });
    rmSync(`${DB_FILE}-wal`, { force: true });
    rmSync(`${DB_FILE}-shm`, { force: true });
  });

  it('menyimpan data pribadi dalam keadaan tersegel, tapi mengembalikannya utuh', () => {
    const saved = accounts.upsertFromClaims(
      {
        name: 'Siti Rahmawati',
        email: 'siti@usahamu.id',
        phone_number: '6281200000001',
        nik: '3204000000009999',
        kyc_vendor: 'Vida',
      },
      { simulated: false },
    );

    expect(saved.fullname).toBe('Siti Rahmawati');
    expect(saved.nik_masked).toBe('3204 •••• •••• 9999');

    const raw = database.db.prepare('SELECT fullname, email, data_key FROM accounts WHERE id = ?').get(saved.id) as {
      fullname: string;
      email: string;
      data_key: string;
    };
    expect(raw.fullname.startsWith('enc:v1:')).toBe(true);
    expect(raw.email).not.toContain('siti@usahamu.id');
    expect(raw.data_key.startsWith('enc:v1:')).toBe(true);
  });

  it('tidak meninggalkan nama itu terbaca di dalam berkas database', () => {
    // WAL perlu dilipat dulu supaya isinya benar-benar berada di berkas utama.
    database.db.exec('PRAGMA wal_checkpoint(FULL)');
    const bytes = readFileSync(DB_FILE).toString('latin1');

    expect(bytes).not.toContain('Siti Rahmawati');
    expect(bytes).not.toContain('siti@usahamu.id');
    expect(bytes).not.toContain('3204000000009999');
  });

  it('menolak membuka data dengan kunci induk yang salah', () => {
    const row = database.db.prepare('SELECT data_key FROM accounts LIMIT 1').get() as {
      data_key: string;
    };
    const attacker = new Envelope(Buffer.alloc(32, 'kunci-salah'));

    expect(() => attacker.unwrapDataKey(row.data_key)).toThrow();
  });

  it('menyegel baris lama yang tertinggal dari sebelum enkripsi dipasang', () => {
    database.db
      .prepare(
        `INSERT INTO accounts (id, fullname, email, nik_hash, tier, simulated, created_at, updated_at)
         VALUES ('lama', 'Budi Santoso', 'budi@usahamu.id', 'hash-lama', 1, 0, '2026-01-01', '2026-01-01')`,
      )
      .run();

    expect(accounts.sealLegacyRows()).toBeGreaterThan(0);

    const raw = database.db.prepare("SELECT fullname FROM accounts WHERE id = 'lama'").get() as {
      fullname: string;
    };
    expect(raw.fullname.startsWith('enc:v1:')).toBe(true);
    expect(accounts.byId('lama')?.fullname).toBe('Budi Santoso');
  });

  it('menuntut kunci induk di produksi, dan memakai kunci dev di luar itu', () => {
    expect(() => loadMasterKey(undefined, true)).toThrow(/PARAKARSA_MASTER_KEY/);
    expect(loadMasterKey(undefined, false)).toHaveLength(32);
    expect(() => loadMasterKey('terlalu-pendek', true)).toThrow(/32 byte/);
  });
});
