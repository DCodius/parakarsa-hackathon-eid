import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountsService } from '../src/accounts/accounts.service.js';
import { AuthController } from '../src/auth/auth.controller.js';
import { DatabaseService } from '../src/db/database.service.js';
import { EidService } from '../src/eid/eid.service.js';
import { IssuanceController } from '../src/issuance/issuance.controller.js';

const APP_URL = 'http://localhost:3000';
const PRIVATE_CODE = 'test-private-code';

/** Stands in for the gateway so the suite never touches the network. */
const eid = {
  loginUrl: () => 'https://api-dev.e.id/api/v1.1/oauth/verify?client_id=x',
  exchangeCode: (code: string) => {
    if (code !== 'good-code') throw new Error('OAUTH.INVALID_OR_EXPIRED_CODE');
    return Promise.resolve({ token: 'token-abc' });
  },
  getProfile: (token: string) =>
    Promise.resolve(token === 'token-abc' ? { email: 'mitra@parakarsa.id' } : null),
  getApp: () => Promise.resolve({ app_name: 'ParaKarsa' }),
};

describe('e.id SSO callback (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.APP_URL = APP_URL;
    process.env.DATABASE_FILE = ':memory:';
    process.env.EID_SCHEMA_PRIVATE_CODE = PRIVATE_CODE;

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      controllers: [AuthController, IssuanceController],
      providers: [DatabaseService, AccountsService, EidService],
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

  it('sends the browser to the e.id consent page', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/auth/login').expect(302);
    expect(res.headers.location).toContain('/oauth/verify');
  });

  it('exchanges the code, sets an httpOnly session cookie, and returns to /profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/callback/e-id?code=good-code')
      .expect(302);

    expect(res.headers.location).toBe(`${APP_URL}/profile`);
    const cookie = (res.headers['set-cookie'] as unknown as string[])[0];
    expect(cookie).toContain('eid_token=token-abc');
    expect(cookie).toContain('HttpOnly');
  });

  it('never sets a cookie when the code is missing or rejected', async () => {
    for (const url of ['/api/v1/callback/e-id', '/api/v1/callback/e-id?code=stale']) {
      const res = await request(app.getHttpServer()).get(url).expect(302);
      expect(res.headers['set-cookie']).toBeUndefined();
      expect(res.headers.location).toContain(`${APP_URL}/profile?error=`);
    }
  });

  it('reads the session back from the cookie, and reports signed out without one', async () => {
    const signedIn = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Cookie', 'eid_token=token-abc')
      .expect(200);
    expect(signedIn.body).toEqual({
      authenticated: true,
      profile: { email: 'mitra@parakarsa.id' },
    });

    const anonymous = await request(app.getHttpServer()).get('/api/v1/auth/me').expect(200);
    expect(anonymous.body).toEqual({ authenticated: false, profile: null });
  });

  it('rejects an issuance verify call that does not carry our private_code', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/callback/e-id/verify')
      .send({ private_code: 'wrong', email: 'mitra@parakarsa.id' })
      .expect(201);
    expect(res.body).toEqual({ success: false });
  });

  it('answers a valid verify call with every field the schema requires', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/callback/e-id/verify')
      .send({ private_code: PRIVATE_CODE, email: 'mitra@parakarsa.id' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      email: 'mitra@parakarsa.id',
      nik: '3204000000000001',
      generated_credential_id: 'PARAKARSA-2026-000123',
    });
  });

  it('refuses to vouch for someone who is not a member', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/callback/e-id/verify')
      .send({ private_code: PRIVATE_CODE, email: 'stranger@example.com' })
      .expect(201);
    expect(res.body).toEqual({ success: false });
  });

  it('acks the issuance webhook', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/callback/e-id/webhook')
      .send({ issuance_id: 'iss-1', status: 'finished', credential_status: 'issued' })
      .expect(201, { received: true });
  });
});
