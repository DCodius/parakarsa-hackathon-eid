import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { io, type Socket } from 'socket.io-client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AccountsService } from '../src/accounts/accounts.service.js';
import { RateLimitGuard } from '../src/common/rate-limit.guard.js';
import { DatabaseService } from '../src/db/database.service.js';
import { VerificationGateway } from '../src/verifier/verification.gateway.js';
import { VerifierController } from '../src/verifier/verifier.controller.js';
import { VerifierService } from '../src/verifier/verifier.service.js';

/**
 * PRD 3.3 — layar presentasi harus ikut berubah saat holder menyetujui di
 * ponselnya, tanpa menunggu polling berikutnya.
 */
describe('Realtime verifikasi (e2e)', () => {
  let app: INestApplication<App>;
  let client: Socket;
  let port: number;

  beforeAll(async () => {
    process.env.DATABASE_FILE = ':memory:';
    process.env.EID_VERIFIER_CLIENT_ID = '';
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
    await app.listen(0);

    const address = app.getHttpServer().address();
    port = typeof address === 'object' && address ? address.port : 0;
  });

  afterAll(async () => {
    client?.disconnect();
    await app.close();
  });

  it('menyiarkan perubahan status ke layar yang menonton sesi itu', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/verifier/sessions')
      .expect(201);
    const sessionId = (created.body as { id: string }).id;

    client = io(`http://127.0.0.1:${port}`, {
      path: '/api/socket.io',
      transports: ['websocket'],
    });
    await new Promise<void>((resolve) => client.on('connect', () => resolve()));
    await new Promise<void>((resolve) => client.emit('watch', sessionId, () => resolve()));

    const updates: { status: string }[] = [];
    const twoUpdates = new Promise<void>((resolve) => {
      client.on('verification:update', (session: { status: string }) => {
        updates.push(session);
        if (updates.length === 2) resolve();
      });
    });

    await request(app.getHttpServer()).post(`/api/v1/verifier/sessions/${sessionId}/advance`);
    await request(app.getHttpServer()).post(`/api/v1/verifier/sessions/${sessionId}/advance`);
    await twoUpdates;

    expect(updates.map((update) => update.status)).toEqual(['scanned', 'approved']);
  });

  it('tidak mengirimkan sesi orang lain ke layar yang tidak menontonnya', async () => {
    const mine = await request(app.getHttpServer()).post('/api/v1/verifier/sessions').expect(201);
    const other = await request(app.getHttpServer()).post('/api/v1/verifier/sessions').expect(201);

    const watcher = io(`http://127.0.0.1:${port}`, {
      path: '/api/socket.io',
      transports: ['websocket'],
    });
    await new Promise<void>((resolve) => watcher.on('connect', () => resolve()));
    await new Promise<void>((resolve) =>
      watcher.emit('watch', (mine.body as { id: string }).id, () => resolve()),
    );

    const leaked: unknown[] = [];
    watcher.on('verification:update', (session) => leaked.push(session));

    await request(app.getHttpServer()).post(
      `/api/v1/verifier/sessions/${(other.body as { id: string }).id}/advance`,
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    expect(leaked).toEqual([]);
    watcher.disconnect();
  });
});
