import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountsService } from '../src/accounts/accounts.service.js';
import { RateLimitGuard } from '../src/common/rate-limit.guard.js';
import { DatabaseService } from '../src/db/database.service.js';
import { VerificationGateway } from '../src/verifier/verification.gateway.js';
import { VerifierController } from '../src/verifier/verifier.controller.js';
import { VerifierService } from '../src/verifier/verifier.service.js';

const MASTER_KEY = Buffer.alloc(32, 'kunci-uji').toString('base64');
const LONG_PEPPER = 'a'.repeat(64);

/**
 * Validasi rahasia yang menyangkut keamanan produksi, dipisahkan dari alur fungsional.
 *
 * - Verifier live tanpa EID_VERIFIER_CALLBACK_SECRET = callback bisa dipalsukan.
 * - NIK_PEPPER kosong/pendek di produksi = akun lama tidak dikenali lagi bila
 *   dirotasi, dan fallback ke value dev membuka sidik jari NIK publik.
 */
describe('Validasi rahasia saat boot / callback (e2e)', () => {
  let app: INestApplication<App>;

  afterEach(async () => {
    await app?.close();
    app = undefined as unknown as INestApplication<App>;
  });

  it('menolak menyala di produksi ketika verifier live tanpa rahasia callback', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PARAKARSA_MASTER_KEY = MASTER_KEY;
    process.env.NIK_PEPPER = LONG_PEPPER;
    process.env.DATABASE_FILE = ':memory:';
    process.env.EID_VERIFIER_CLIENT_ID = 'client';
    process.env.EID_VERIFIER_CLIENT_SECRET = 'secret';
    process.env.EID_VERIFIER_SCHEMA_ID = 'schema';
    process.env.EID_VERIFIER_CALLBACK_SECRET = '';

    // Di versi Nest ini constructor provider jalan saat compile() dan
    // OnModuleInit saat init(), jadi keduanya dibungkus try/catch.
    let caught: unknown;
    try {
      const moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
        providers: [DatabaseService, AccountsService, VerifierService, VerificationGateway],
      }).compile();
      await moduleRef.init();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toMatch(/EID_VERIFIER_CALLBACK_SECRET/);
  });

  it('menolak callback verifier live tanpa rahasia (403) — lapisan jaga runtime', async () => {
    // Skenario yang sama di produksi tidak pernah sampai ke sini karena boot
    // sudah menolak (test di atas). Di luar produksi pun mode live tanpa rahasia
    // tidak boleh menerima callback, sehingga konfigurasi salah tetap abs.
    process.env.NODE_ENV = 'development';
    process.env.PARAKARSA_MASTER_KEY = '';
    process.env.NIK_PEPPER = '';
    process.env.DATABASE_FILE = ':memory:';
    process.env.EID_VERIFIER_CLIENT_ID = 'client';
    process.env.EID_VERIFIER_CLIENT_SECRET = 'secret';
    process.env.EID_VERIFIER_SCHEMA_ID = 'schema';
    process.env.EID_VERIFIER_CALLBACK_SECRET = '';

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      controllers: [VerifierController],
      providers: [
        RateLimitGuard,
        DatabaseService,
        AccountsService,
        VerifierService,
        VerificationGateway,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    await request(app.getHttpServer())
      .post('/api/v1/callback/e-id')
      .send({ verification_id: 'sesi-apa-saja', status: 'approved' })
      .expect(403);
  });

  it('menolak menyala di produksi tanpa NIK_PEPPER yang memadai', async () => {
    process.env.NODE_ENV = 'production';
    process.env.NIK_PEPPER = '';
    process.env.PARAKARSA_MASTER_KEY = MASTER_KEY;
    process.env.DATABASE_FILE = ':memory:';

    let caught: unknown;
    try {
      const moduleRef = await Test.createTestingModule({
        imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
        providers: [DatabaseService, AccountsService],
      }).compile();
      await moduleRef.init();
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toMatch(/NIK_PEPPER/);
  });

  it('tetap longgar di luar produksi, bahkan ketika NIK_PEPPER pendek', async () => {
    process.env.NODE_ENV = 'development';
    process.env.NIK_PEPPER = 'short';
    process.env.PARAKARSA_MASTER_KEY = '';
    process.env.DATABASE_FILE = ':memory:';

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      providers: [DatabaseService, AccountsService],
    }).compile();

    await expect(moduleRef.init()).resolves.toBe(moduleRef);
  });
});
