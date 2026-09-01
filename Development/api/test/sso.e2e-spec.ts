import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { createHash } from 'node:crypto';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountsService } from '../src/accounts/accounts.service.js';
import { AuthController } from '../src/auth/auth.controller.js';
import { DatabaseService } from '../src/db/database.service.js';
import { EidService } from '../src/eid/eid.service.js';

const APP_URL = 'http://localhost:3000';
const SSO_EMAIL = 'parakarsadevops@example.com';
const SSO_TOKEN = 'sso-token-abc';

/** Profil yang dipulangkan gateway e.id setelah penukaran kode (tier 1 = email+phone). */
function ssoProfile() {
  return {
    email: SSO_EMAIL,
    profile: {
      fullname: 'Dewi Paramita',
      phonenumber: '+6281234567890',
      tier: 1,
    },
  };
}

/** Kunci akun SSO dihitung persis seperti AccountsService: sha256("sso:" + email). */
function ssoHash(email: string = SSO_EMAIL): string {
  return createHash('sha256').update(`sso:${email}`).digest('hex');
}

/**
 * SSO callback dijalankan di atas EidService sungguhan (bukan mock), supaya
 * alur penukaran kode → profil → akun → sesi diuji apa adanya. Jaringan diganti
 * stub `fetch` yang menjawab setiap panggilan ke gateway e.id.
 */
describe('e.id SSO callback — menerbitkan akun ParaKarsa (e2e)', () => {
  let app: INestApplication<App>;
  let database: DatabaseService;

  beforeAll(async () => {
    process.env.DATABASE_FILE = ':memory:';
    process.env.APP_URL = APP_URL;
    process.env.EID_CLIENT_ID = 'test-client';
    process.env.EID_CLIENT_SECRET = 'test-secret';
    process.env.EID_CALLBACK_URL = 'http://localhost:4000/api/v1/callback/e-id';
    process.env.EID_BASE_URL = 'https://api-dev.e.id';

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      controllers: [AuthController],
      providers: [DatabaseService, AccountsService, EidService],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.use(cookieParser());
    await app.init();
    database = app.get(DatabaseService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** Stub untuk gateway: token selalu sama, profil bisa ditutup, atau gagal total. */
  function stubFetch(overrides: { profile?: unknown; fail?: boolean } = {}) {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (overrides.fail) throw new Error('network unreachable');
        const address = String(url);
        if (address.includes('/get-token')) {
          return new Response(JSON.stringify({ status: true, data: { token: SSO_TOKEN } }), {
            status: 200,
          });
        }
        if (address.includes('/get-profile')) {
          return new Response(
            JSON.stringify({ status: true, data: overrides.profile ?? ssoProfile() }),
            { status: 200 },
          );
        }
        return new Response(JSON.stringify({ status: false, message: 'not-found' }), {
          status: 404,
        });
      }),
    );
  }

  function runCallback(code = 'good-code') {
    return request(app.getHttpServer()).get(`/api/v1/callback/e-id?code=${code}`);
  }

  /** String cookie pk_session utuh (berisi atribut), bila callback memasangnya. */
  function pkSessionOf(res: { headers: Record<string, unknown> }): string | undefined {
    const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
    return cookies?.find((cookie) => cookie.startsWith('pk_session='));
  }

  function ssoRowCount(): number {
    return (database.db.prepare('SELECT COUNT(*) AS c FROM accounts').get() as { c: number }).c;
  }

  it('menerbitkan akun dan sesi ParaKarsa lalu mengarahkan ke /profile', async () => {
    stubFetch();

    const res = await runCallback().expect(302);
    expect(res.headers.location).toBe(`${APP_URL}/profile`);

    const pk = pkSessionOf(res);
    expect(pk).toBeDefined();
    expect(pk!).toContain('HttpOnly');

    const me = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', pk!.split(';')[0])
      .expect(200);
    expect(me.body.authenticated).toBe(true);
    expect(me.body.profile.email).toBe(SSO_EMAIL);
    expect(me.body.profile.profile.fullname).toBe('Dewi Paramita');
    expect(me.body.profile.profile.tier).toBe(1);

    const row = database.db
      .prepare('SELECT tier FROM accounts WHERE sso_email_hash = ?')
      .get(ssoHash()) as { tier: number } | undefined;
    expect(row).toBeDefined();
    expect(row!.tier).toBe(1);
  });

  it('mengenali alamat email yang sama sebagai satu akun, bukan akun baru', async () => {
    stubFetch();

    await runCallback().expect(302);
    await runCallback().expect(302);

    const count = database.db
      .prepare('SELECT COUNT(*) AS c FROM accounts WHERE sso_email_hash = ?')
      .get(ssoHash()) as { c: number };
    expect(count.c).toBe(1);
  });

  it('mengarahkan ke /profile dengan code=gateway saat gateway tidak terjangkau', async () => {
    stubFetch({ fail: true });

    const res = await runCallback().expect(302);
    expect(res.headers.location).toContain(`${APP_URL}/profile?error=`);
    expect(res.headers.location).toContain('code=gateway');
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('tidak menerbitkan akun dan menandai code=no-email bila profil tanpa email', async () => {
    stubFetch({ profile: { profile: { fullname: 'Tanpa Email' } } });

    const before = ssoRowCount();
    const res = await runCallback().expect(302);
    expect(res.headers.location).toContain('code=no-email');
    expect(ssoRowCount()).toBe(before);

    // eid_token tetap dipasang (fallback), pk_session tidak.
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies[0]).toContain('eid_token=');
    expect(cookies.some((cookie) => cookie.startsWith('pk_session='))).toBe(false);
  });

  it('menaikkan tier 0 menjadi 1 — login SSO membuktikan kepemilikan email', async () => {
    stubFetch({ profile: { email: 'unverified@example.com', profile: { tier: 0 } } });

    await runCallback().expect(302);

    const row = database.db
      .prepare('SELECT tier FROM accounts WHERE sso_email_hash = ?')
      .get(ssoHash('unverified@example.com')) as { tier: number } | undefined;
    expect(row).toBeDefined();
    expect(row!.tier).toBe(1);
  });
});
