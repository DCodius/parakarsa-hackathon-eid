import { Controller, Get, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AccountsService, PK_SESSION_COOKIE } from '../accounts/accounts.service.js';
import { ConsentService } from '../consent/consent.service.js';
import { DatabaseService } from '../db/database.service.js';
import { DnaPortfolioService } from './dna-portfolio.service.js';

/** FR-03 — berkas PDF yang diterbitkan sistem, bukan hasil cetak browser. */
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly accounts: AccountsService,
    private readonly consent: ConsentService,
    private readonly portfolio: DnaPortfolioService,
    private readonly database: DatabaseService,
  ) {}

  @Get('dna.pdf')
  async dna(@Req() request: Request, @Res() response: Response) {
    const token = request.cookies?.[PK_SESSION_COOKIE] as string | undefined;
    const account = token ? this.accounts.bySessionToken(token) : null;
    if (!account) {
      throw new UnauthorizedException('Masuk dengan e.id untuk menerbitkan DNA Portfolio');
    }

    const proof = this.database.db
      .prepare(
        `SELECT did_key, on_chain_tx FROM verification_log
         WHERE account_id = ? ORDER BY at DESC LIMIT 1`,
      )
      .get(account.id) as { did_key?: string; on_chain_tx?: string } | undefined;

    const pdf = await this.portfolio.render({
      account,
      proof,
      // Dokumen ini beredar bebas, jadi ia harus tunduk pada consent pemiliknya.
      showDna: this.consent.state(account.id).ep,
    });

    response
      .setHeader('Content-Type', 'application/pdf')
      .setHeader('Content-Disposition', 'attachment; filename="dna-portfolio-parakarsa.pdf"')
      .setHeader('Cache-Control', 'no-store')
      .send(pdf);
  }
}
