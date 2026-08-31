import { Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { EidService } from '../eid/eid.service.js';

export const SESSION_COOKIE = 'eid_token';

@Controller()
export class AuthController {
  constructor(
    private readonly eid: EidService,
    private readonly config: ConfigService,
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
      return res.redirect(this.failure(`Tidak ada authorization code. e.id mengirim: ${query || '(kosong)'}`));
    }

    try {
      const { token } = await this.eid.exchangeCode(code);
      res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: req.protocol === 'https',
        path: '/',
        maxAge: 60 * 60 * 1000,
      });
      return res.redirect(`${this.appUrl}/profile`);
    } catch (error) {
      return res.redirect(this.failure((error as Error).message));
    }
  }

  /** The frontend reads the session through here, forwarding the browser's cookie. */
  @Get('auth/me')
  async me(@Req() req: Request) {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    if (!token) return { authenticated: false, profile: null };

    const profile = await this.eid.getProfile(token);
    return { authenticated: profile !== null, profile };
  }

  @Post('auth/logout')
  logout(@Res() res: Response) {
    res.clearCookie(SESSION_COOKIE, { path: '/' });
    res.redirect(303, this.appUrl);
  }

  private failure(message: string): string {
    const url = new URL('/profile', this.appUrl);
    url.searchParams.set('error', message);
    return url.toString();
  }
}
