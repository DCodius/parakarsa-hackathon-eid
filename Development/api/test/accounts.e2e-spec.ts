import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountsService } from '../src/accounts/accounts.service.js';
import { AuthController } from '../src/auth/auth.controller.js';
import { ConsentController } from '../src/consent/consent.controller.js';
import { ConsentService } from '../src/consent/consent.service.js';
import { DatabaseService } from '../src/db/database.service.js';
import { EidService } from '../src/eid/eid.service.js';
import { VerifierController } from '../src/verifier/verifier.controller.js';
import { VerifierService } from '../src/verifier/verifier.service.js';

/** Gateway tidak pernah disentuh: token OAuth SSO dianggap selalu kedaluwarsa. */
const eid = { getProfile: () => Promise.resolve(null) };

/**
 * Alur penuh PRD FR-01 → FR-04 di atas database sungguhan (SQLite in-memory):
 * QR disetujui → akun terbit → sesi ParaKarsa → consent tersimpan → keluar.
 */
describe('Akun, sesi, dan consent (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.DATABASE_FILE = ':memory:';
    process.env.EID_VERIFIER_CLIENT_ID = '';
    process.env.EID_VERIFIER_CALLBACK_SECRET = '';
    process.env.APP_URL = 'http://localhost:3000';

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      controllers: [VerifierController, AuthController, ConsentController],
      providers: [DatabaseService, AccountsService, ConsentService, VerifierService, EidService],
    })
      .overrideProvider(EidService)
      .useValue(eid)
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /** Menjalankan satu login QR simulasi sampai selesai, mengembalikan cookie sesi. */
  async function signIn(): Promise<string> {
    const created = await request(app.getHttpServer())
      .post('/api/v1/verifier/sessions')
      .expect(201);
    const id = (created.body as { id: string }).id;

    await request(app.getHttpServer()).post(`/api/v1/verifier/sessions/${id}/advance`).expect(201);
    const approved = await request(app.getHttpServer())
      .post(`/api/v1/verifier/sessions/${id}/advance`)
      .expect(201);

    expect(approved.body.status).toBe('approved');
    expect(approved.body.signedIn).toBe(true);

    const cookies = approved.headers['set-cookie'] as unknown as string[];
    const session = cookies.find((cookie) => cookie.startsWith('pk_session='));
    expect(session).toBeDefined();
    expect(session).toContain('HttpOnly');
    return session!.split(';')[0];
  }

  it('menerbitkan akun dan sesi ParaKarsa dari klaim yang disetujui', async () => {
    const cookie = await signIn();

    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(200);

    expect(me.body.authenticated).toBe(true);
    expect(me.body.profile.profile.fullname).toBe('Irfan Fakhri Muhammad');
    // NIK hanya keluar dalam bentuk tersamar, tidak pernah utuh.
    expect(me.body.profile.profile.nik).toBe('3204 •••• •••• 8901');
    expect(me.body.profile.profile.tier).toBe(2);
    expect(me.body.profile.demo).toBe(true);
  });

  it('mengenali pemilik NIK yang sama sebagai satu akun, bukan akun baru', async () => {
    const first = await signIn();
    const second = await signIn();

    const a = await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', first);
    const b = await request(app.getHttpServer()).get('/api/v1/auth/me').set('Cookie', second);

    expect(first).not.toBe(second);
    expect(a.body.profile.profile.fullname).toBe(b.body.profile.profile.fullname);
  });

  it('menyimpan pencabutan consent beserta jejak auditnya', async () => {
    const cookie = await signIn();

    const revoked = await request(app.getHttpServer())
      .put('/api/v1/consent/third-party')
      .set('Cookie', cookie)
      .send({ granted: false })
      .expect(200);

    expect(revoked.body.granted['third-party']).toBe(false);
    expect(revoked.body.entry.action).toBe('DICABUT');

    const read = await request(app.getHttpServer())
      .get('/api/v1/consent')
      .set('Cookie', cookie)
      .expect(200);
    expect(read.body.granted['third-party']).toBe(false);
    expect(read.body.log[0].scope).toBe('third-party');
  });

  it('menolak pencabutan identitas dasar dan cakupan yang tidak dikenal', async () => {
    const cookie = await signIn();

    await request(app.getHttpServer())
      .put('/api/v1/consent/identity')
      .set('Cookie', cookie)
      .send({ granted: false })
      .expect(400);

    await request(app.getHttpServer())
      .put('/api/v1/consent/apa-saja')
      .set('Cookie', cookie)
      .send({ granted: true })
      .expect(400);
  });

  it('menolak akses consent tanpa sesi', async () => {
    await request(app.getHttpServer()).get('/api/v1/consent').expect(401);
  });

  it('mencabut sesi saat keluar, sehingga cookie lama tidak bisa dipakai lagi', async () => {
    const cookie = await signIn();

    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', cookie)
      .expect(303);

    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', cookie)
      .expect(200);
    expect(me.body.authenticated).toBe(false);
  });
});
