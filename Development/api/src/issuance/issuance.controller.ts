import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { checkPrivateCode } from '../common/private-code.js';
import { RateLimit, RateLimitGuard } from '../common/rate-limit.guard.js';
import type { IssuanceWebhook, VerifyRequest } from '../eid/eid.types.js';

/**
 * The two issuer-side callbacks from the e.id techdoc.
 *
 *   default_verify_url  — called MID-flow; our answer decides whether the
 *                         credential is issued at all. Must reply within 300s.
 *   default_webhook_url — called at the END; reports the outcome only.
 *
 * Both are registered under Profile -> Update Profile in the e.id dashboard.
 */
@Controller('callback/e-id')
@UseGuards(RateLimitGuard)
export class IssuanceController {
  private readonly logger = new Logger(IssuanceController.name);

  constructor(private readonly config: ConfigService) {}

  /**
   * Verification endpoint. Every name in the schema's required_fields must be
   * present in `data` or the gateway fails the run even when success is true.
   */
  @Post('verify')
  @RateLimit(120)
  verify(@Body() body: VerifyRequest) {
    const expected = this.config.get<string>('EID_SCHEMA_PRIVATE_CODE');
    if (!checkPrivateCode(expected, body.private_code, 'issuance verify')) {
      return { success: false };
    }

    const member = findMember(body.identifier_no, body.email);
    if (!member) {
      this.logger.warn(`Rejected verify call: no member for ${body.email ?? body.identifier_no}`);
      return { success: false };
    }

    return {
      success: true,
      data: {
        fullname: member.fullname,
        email: member.email,
        nik: member.nik,
        membership_tier: member.tier,
        generated_credential_id: `PARAKARSA-2026-${member.id}`,
      },
    };
  }

  /**
   * Result notification. Ack fast — the gateway only needs a 2xx.
   * Dijaga rahasia yang sama dengan /verify: tanpa itu, siapa pun bisa
   * menyuntikkan catatan penerbitan palsu ke log kita.
   */
  @Post('webhook')
  @RateLimit(120)
  webhook(@Body() body: IssuanceWebhook) {
    const expected = this.config.get<string>('EID_SCHEMA_PRIVATE_CODE');
    if (!checkPrivateCode(expected, body.private_code, 'issuance webhook')) {
      return { received: false };
    }

    this.logger.log(
      `Auto-issuance ${body.issuance_id ?? '?'}: status=${body.status ?? '?'} ` +
        `kyc=${body.kyc_status ?? '?'} credential=${body.credential_id ?? 'none'}` +
        (body.error_message ? ` error=${body.error_message}` : ''),
    );
    return { received: true };
  }
}

/**
 * Stand-in for the member directory.
 * ponytail: in-memory lookup, swap for the Postgres query once the DB exists.
 */
const members = [
  {
    id: '000123',
    fullname: 'Irfan Fakhri Muhammad',
    email: 'mitra@parakarsa.id',
    nik: '3204000000000001',
    tier: 'gold',
  },
];

function findMember(identifierNo?: string, email?: string) {
  if (!identifierNo && !email) return undefined;
  return members.find(
    (member) =>
      (identifierNo != null && member.nik === identifierNo) ||
      (email != null && member.email.toLowerCase() === email.toLowerCase()),
  );
}
