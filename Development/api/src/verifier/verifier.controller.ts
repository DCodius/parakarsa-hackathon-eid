import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PK_SESSION_COOKIE } from '../accounts/accounts.service.js';
import { assertPrivateCode } from '../common/private-code.js';
import { RateLimit, RateLimitGuard } from '../common/rate-limit.guard.js';
import { VerifierService } from './verifier.service.js';
import type { PublicSession, VerificationCallback } from './verifier.types.js';

/**
 * PRD FR-01/TC-EID-01 — login lewat pemindaian QR Dompet e.id.
 *
 * Browser hanya bicara ke tiga rute pertama; rute callback dipanggil e.id
 * Gateway dan harus terjangkau dari internet (HTTPS saat di VPS).
 */
@Controller()
@UseGuards(RateLimitGuard)
export class VerifierController {
  constructor(private readonly verifier: VerifierService) {}

  /** QR baru untuk satu percobaan login. Rute tanpa login, jadi paling ketat. */
  @Post('verifier/sessions')
  // Longgar untuk satu ruangan di belakang satu IP wifi, ketat untuk skrip.
  @RateLimit(30)
  create() {
    return this.verifier.createSession();
  }

  /** Dipanggil berkala oleh halaman login sampai holder menyetujui. */
  @Get('verifier/sessions/:id')
  // Dipoll tiap 2 detik per pengunjung; angkanya harus muat untuk satu ruangan.
  @RateLimit(600)
  read(
    @Param('id') id: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = this.verifier.readSession(id);
    if (!session) throw new NotFoundException('Sesi verifikasi tidak ditemukan atau sudah dihapus');
    return this.withSessionCookie(session, request, response);
  }

  /**
   * Memajukan sesi simulasi satu langkah. Sesi live menolak jalan pintas ini,
   * jadi tombol demo tidak akan pernah memalsukan verifikasi sungguhan.
   */
  @Post('verifier/sessions/:id/advance')
  @RateLimit(120)
  advance(
    @Param('id') id: string,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = this.verifier.advanceSimulation(id);
    if (!session) {
      throw new NotFoundException('Sesi simulasi tidak ditemukan — sesi live tidak bisa dimajukan');
    }
    return this.withSessionCookie(session, request, response);
  }

  /**
   * PRD 3.2.3 — hasil verifikasi dari e.id Gateway.
   * POST, sementara callback OAuth SSO memakai GET pada path yang sama.
   */
  @Post('callback/e-id')
  @RateLimit(120)
  callback(@Body() body: VerificationCallback) {
    const secret = this.verifier.callbackSecret;
    // Jaga-jaga lapis kedua: verifier live tanpa rahasia tidak boleh menerima
    // callback apa pun, sekalipun validasi boot di produksi sudah menolak.
    // Mode simulasi (isLive false) tetap longgar supaya alur demo jalan.
    if (this.verifier.isLive && !secret) {
      throw new ForbiddenException('private_code tidak cocok');
    }
    assertPrivateCode(secret, body.private_code, 'verifier callback');

    const session = this.verifier.recordResult(body);
    return { received: true, status: session.status };
  }

  /**
   * Token sesi hanya berpindah lewat cookie httpOnly — browser tidak pernah
   * melihatnya, jadi skrip pihak ketiga tidak bisa mencurinya.
   */
  private withSessionCookie(
    session: PublicSession,
    request: Request,
    response: Response,
  ): PublicSession {
    const token = this.verifier.sessionTokenFor(session.id);
    if (token) {
      response.cookie(PK_SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: request.protocol === 'https',
        path: '/',
        maxAge: 60 * 60 * 1000,
      });
    }
    return session;
  }
}
