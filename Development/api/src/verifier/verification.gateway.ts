import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { PublicSession } from './verifier.types.js';

/**
 * PRD 3.3 — skenario demo day: QR dipindai dari ponsel, dan layar presentasi
 * ikut berubah saat itu juga tanpa menunggu polling.
 *
 * Tiap sesi verifikasi punya ruangnya sendiri, jadi satu layar hanya menerima
 * kabar tentang sesi yang sedang ia tampilkan — bukan sesi pengunjung lain.
 *
 * Jalurnya diletakkan di bawah /api/ supaya melewati blok nginx yang sama
 * dengan REST, dan tidak butuh aturan proxy terpisah.
 */
@WebSocketGateway({
  path: '/api/socket.io',
  cors: {
    origin:
      process.env.NODE_ENV === 'production'
        ? (process.env.APP_URL ?? 'http://localhost:3000')
        : /^http:\/\/localhost:\d+$/,
    credentials: true,
  },
})
export class VerificationGateway {
  private readonly logger = new Logger(VerificationGateway.name);

  @WebSocketServer()
  private server?: Server;

  /** Layar login mendaftar ke sesinya sendiri begitu QR terbit. */
  @SubscribeMessage('watch')
  watch(@MessageBody() sessionId: string, @ConnectedSocket() client: Socket): { watching: string } {
    // Id sesi adalah UUID yang tidak bisa ditebak, jadi mengetahuinya sudah
    // menjadi izin untuk menonton — sama seperti pada rute REST-nya.
    void client.join(room(sessionId));
    return { watching: sessionId };
  }

  @SubscribeMessage('unwatch')
  unwatch(@MessageBody() sessionId: string, @ConnectedSocket() client: Socket): void {
    void client.leave(room(sessionId));
  }

  /**
   * Dipanggil VerifierService tiap kali status sesi berubah. Diam-diam tidak
   * melakukan apa pun bila server belum siap, karena kabar yang hilang di sini
   * tetap tersusul oleh polling di frontend.
   */
  publish(session: PublicSession): void {
    if (!this.server) return;
    this.server.to(room(session.id)).emit('verification:update', session);
    this.logger.debug(`Sesi ${session.id} disiarkan: ${session.status}`);
  }
}

const room = (sessionId: string) => `verification:${sessionId}`;
