import { Body, Controller, Get, Param, Put, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AccountsService, PK_SESSION_COOKIE, type Account } from '../accounts/accounts.service.js';
import { ConsentService } from './consent.service.js';

/** FR-04 — kendali consent milik pemegang akun, bukan milik platform. */
@Controller('consent')
export class ConsentController {
  constructor(
    private readonly accounts: AccountsService,
    private readonly consent: ConsentService,
  ) {}

  @Get()
  read(@Req() request: Request) {
    const account = this.account(request);
    return {
      granted: this.consent.state(account.id),
      log: this.consent.log(account.id),
      chain: this.consent.verify(account.id),
    };
  }

  /** TC-EID-02 — bukti bahwa riwayat consent tidak diubah diam-diam. */
  @Get('verify')
  verify(@Req() request: Request) {
    return this.consent.verify(this.account(request).id);
  }

  @Put(':scope')
  update(
    @Req() request: Request,
    @Param('scope') scope: string,
    @Body() body: { granted?: boolean },
  ) {
    const account = this.account(request);
    const entry = this.consent.set(account.id, scope, body.granted === true);
    return {
      entry,
      granted: this.consent.state(account.id),
      log: this.consent.log(account.id),
      chain: this.consent.verify(account.id),
    };
  }

  /** Consent hanya bisa dibaca dan diubah oleh pemilik akunnya sendiri. */
  private account(request: Request): Account {
    const token = request.cookies?.[PK_SESSION_COOKIE] as string | undefined;
    const account = token ? this.accounts.bySessionToken(token) : null;
    if (!account) throw new UnauthorizedException('Masuk dengan e.id untuk mengatur consent');
    return account;
  }
}
