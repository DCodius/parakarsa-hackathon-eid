import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountsService } from '../src/accounts/accounts.service.js';
import { RateLimitGuard } from '../src/common/rate-limit.guard.js';
import { DatabaseService } from '../src/db/database.service.js';
import { VerifierController } from '../src/verifier/verifier.controller.js';
import { VerifierService } from '../src/verifier/verifier.service.js';

const CALLBACK_SECRET = 'test-callback-secret';

/**
 * Suite ini menjalankan mode simulasi: kredensial verifier sengaja dikosongkan
 * supaya alur QR bisa diuji utuh tanpa menyentuh gateway e.id.
 */
describe('Verifier QR login (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.EID_VERIFIER_CLIENT_ID = '';
    process.env.EID_VERIFIER_CLIENT_SECRET = '';
    process.env.EID_VERIFIER_SCHEMA_ID = '';
    process.env.EID_VERIFIER_CALLBACK_SECRET = CALLBACK_SECRET;
    process.env.DATABASE_FILE = ':memory:';

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      controllers: [VerifierController],
      providers: [RateLimitGuard, DatabaseService, AccountsService, VerifierService],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function newSession() {
    const res = await request(app.getHttpServer()).post('/api/v1/verifier/sessions').expect(201);
    return res.body as { id: string; qr: string; simulated: boolean; status: string };
  }

  it('terbitkan sesi QR dan tandai sebagai simulasi saat kredensial verifier kosong', async () => {
    const session = await newSession();

    expect(session.status).toBe('waiting');
    expect(session.simulated).toBe(true);
    expect(session.qr.length).toBeGreaterThan(0);
  });

  it('laporkan status sesi yang sedang ditunggu, dan 404 untuk sesi asing', async () => {
    const session = await newSession();

    const res = await request(app.getHttpServer())
      .get(`/api/v1/verifier/sessions/${session.id}`)
      .expect(200);
    expect(res.body.status).toBe('waiting');

    await request(app.getHttpServer()).get('/api/v1/verifier/sessions/tidak-ada').expect(404);
  });

  it('majukan simulasi dari menunggu ke dipindai lalu disetujui, lengkap dengan klaim', async () => {
    const session = await newSession();

    const scanned = await request(app.getHttpServer())
      .post(`/api/v1/verifier/sessions/${session.id}/advance`)
      .expect(201);
    expect(scanned.body.status).toBe('scanned');

    const approved = await request(app.getHttpServer())
      .post(`/api/v1/verifier/sessions/${session.id}/advance`)
      .expect(201);
    expect(approved.body.status).toBe('approved');
    expect(approved.body.claims.nik).toHaveLength(16);
    expect(approved.body.claims.kyc_vendor).toBe('Vida');
    expect(approved.body.proof.on_chain_tx).toMatch(/^0x/);
  });

  it('terima callback gateway yang membawa private_code benar', async () => {
    const session = await newSession();

    await request(app.getHttpServer())
      .post('/api/v1/callback/e-id')
      .send({
        verification_id: session.id,
        status: 'approved',
        private_code: CALLBACK_SECRET,
        claims: { name: 'Siti Aminah', nik: '3204000000000002', kyc_vendor: 'Vida' },
        signature_proof: { did_key: 'did:idchain:0xabc', on_chain_tx: '0xdef' },
      })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/verifier/sessions/${session.id}`)
      .expect(200);
    expect(res.body.status).toBe('approved');
    expect(res.body.claims.name).toBe('Siti Aminah');
  });

  it('tolak callback tanpa private_code yang cocok', async () => {
    const session = await newSession();

    await request(app.getHttpServer())
      .post('/api/v1/callback/e-id')
      .send({ verification_id: session.id, status: 'approved', private_code: 'salah' })
      .expect(403);

    const res = await request(app.getHttpServer())
      .get(`/api/v1/verifier/sessions/${session.id}`)
      .expect(200);
    expect(res.body.status).toBe('waiting');
  });

  it('membatasi laju pembuatan sesi supaya memori tidak bisa digelembungkan', async () => {
    // Test lain di berkas ini sudah memakai sebagian jatah, jadi yang diuji
    // adalah bahwa jatahnya memang habis — bukan angka pastinya.
    let lastStatus = 0;
    for (let attempt = 0; attempt < 40 && lastStatus !== 429; attempt += 1) {
      lastStatus = (await request(app.getHttpServer()).post('/api/v1/verifier/sessions')).status;
    }

    expect(lastStatus).toBe(429);
  });

  it('tolak callback untuk sesi yang tidak pernah kita minta', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/callback/e-id')
      .send({ verification_id: 'sesi-karangan', status: 'approved', private_code: CALLBACK_SECRET })
      .expect(503);
  });
});
