import { Controller, Get, Post, Query, Req, Res, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AccountsService, PK_SESSION_COOKIE, type Account } from '../accounts/accounts.service.js';
import { EidService } from '../eid/eid.service.js';

export const SESSION_COOKIE = 'eid_token';

@Controller()
export class AuthController {
  constructor(
    private readonly eid: EidService,
    private readonly config: ConfigService,
    private readonly accounts: AccountsService,
  ) {}

  private get appUrl(): string {
    return this.config.get<string>('APP_URL') ?? 'http://localhost:3000';
  }

  /** The registered app name/icon, so the frontend can render an accurate button. */
  @Get('auth/app')
  async app() {
    return this.eid.getApp();
  }

  /** Hands the browser off to the e.id login and consent page. */
  @Get('auth/login')
  login(@Res() res: Response) {
    res.redirect(this.eid.loginUrl());
  }

  /**
   * OAuth SSO callback — the URL registered as callback_url on the e.id app.
   * e.id sends the user back here with a single-use authorization code.
   */
  @Get('callback/e-id')
  async callback(@Query('code') code: string | undefined, @Req() req: Request, @Res() res: Response) {
    if (!code) {
      // Echo what e.id actually sent, so a param-name mismatch is visible.
      const query = new URLSearchParams(req.query as Record<string, string>).toString();
      return res.redirect(
        this.failure(
          `Tidak ada authorization code. e.id mengirim: ${query || '(kosong)'}`,
          'eid',
        ),
      );
    }

    try {
      const { token } = await this.eid.exchangeCode(code);
      // eid_token tetap dipasang untuk kompatibilitas dengan sesi lama; sesi
      // ParaKarsa (pk_session) menyusul di bawah bila akun berhasil diterbitkan.
      this.setCookie(res, SESSION_COOKIE, token, req);

      const profile = await this.eid.getProfile(token);
      if (!profile?.email) {
        return res.redirect(
          this.failure(
            'Profil e.id tidak membawa email, sehingga akun ParaKarsa tidak bisa diterbitkan.',
            'no-email',
          ),
        );
      }

      const account = this.accounts.upsertFromSsoProfile(profile);
      if (!account) {
        return res.redirect(
          this.failure('Akun ParaKarsa tidak bisa diterbitkan dari profil ini.', 'no-email'),
        );
      }

      // Akun terbit → sesi ParaKarsa dibuat dan dikunci di cookie httpOnly.
      this.setCookie(res, PK_SESSION_COOKIE, this.accounts.createSession(account.id), req);
      return res.redirect(`${this.appUrl}/profile`);
    } catch (error) {
      return res.redirect(this.failure((error as Error).message, this.errorCode(error)));
    }
  }

  /**
   * Satu pintu bagi frontend untuk membaca sesi, apa pun cara masuknya:
   * sesi ParaKarsa hasil verifikasi QR, atau token OAuth SSO.
   */
  @Get('auth/me')
  async me(@Req() req: Request) {
    const pkToken = req.cookies?.[PK_SESSION_COOKIE] as string | undefined;
    const account = pkToken ? this.accounts.bySessionToken(pkToken) : null;
    if (account) return { authenticated: true, profile: toProfile(account) };

    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!token) return { authenticated: false, profile: null };

    const profile = await this.eid.getProfile(token);
    return { authenticated: profile !== null, profile };
  }

  @Post('auth/logout')
  logout(@Req() req: Request, @Res() res: Response) {
    const pkToken = req.cookies?.[PK_SESSION_COOKIE] as string | undefined;
    if (pkToken) this.accounts.revokeSession(pkToken);

    res.clearCookie(PK_SESSION_COOKIE, { path: '/' });
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.redirect(303, this.appUrl);
  }

  private failure(message: string, code: string): string {
    const url = new URL('/profile', this.appUrl);
    url.searchParams.set('error', message);
    url.searchParams.set('code', code);
    return url.toString();
  }

  /** Gateway yang terblokir (403 sandbox) atau mati = code gateway, sisanya eid. */
  private errorCode(error: unknown): string {
    return error instanceof ServiceUnavailableException ? 'gateway' : 'eid';
  }

  /**
   * Cookie sesi selalu httpOnly, berumur satu jam, dan sama untuk kedua alur
   * (QR verifier & SSO) supaya frontend cukup membaca satu nama.
   */
  private setCookie(res: Response, name: string, value: string, req: Request): void {
    res.cookie(name, value, {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.protocol === 'https',
      path: '/',
      maxAge: 60 * 60 * 1000,
    });
  }
}

/** Akun lokal dipetakan ke bentuk profil e.id supaya frontend tidak perlu tahu asal sesinya. */
function toProfile(account: Account) {
  return {
    email: account.email ?? undefined,
    demo: account.simulated === 1,
    profile: {
      fullname: account.fullname ?? undefined,
      phonenumber: account.phone ?? undefined,
      nik: account.nik_masked ?? undefined,
      kycVendor: account.kyc_vendor ?? undefined,
      tier: account.tier,
    },
  };
}
