import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  EidApp,
  EidProfile,
  EidToken,
  Envelope,
} from './eid.types.js';

/**
 * Client for the e.id OAuth SSO API (docs.e.id, v1.1).
 *
 * SSO lives on its own host, separate from the Issuer API:
 *   OAuth SSO  sandbox https://api-dev.e.id      · prod https://api-wallet.e.id
 *   Issuer API sandbox https://gateway-sandbox.e.id · prod https://gateway.e.id
 * Pointing EID_BASE_URL at the Issuer host makes every call 403 at its nginx.
 *
 *   1. GET  /oauth/client/:client_id/:callback_url  registered app name + scopes
 *   2. GET  /oauth/verify?client_id&callback_url    302 to the login/consent page
 *   3. POST /oauth/get-token                        single-use code -> Bearer token
 *   4. GET  /oauth/get-profile?scope=email:profile  the signed-in user's profile
 *
 * Steps 3 and 4 carry the client_secret, which is why they live here and never
 * in the browser.
 */
@Injectable()
export class EidService {
  private readonly logger = new Logger(EidService.name);

  constructor(private readonly config: ConfigService) {}

  private get base(): string {
    return this.config.get<string>('EID_BASE_URL') ?? 'https://api-dev.e.id';
  }

  private get api(): string {
    return `${this.base}/api/v1.1/oauth`;
  }

  private required(key: string): string {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new ServiceUnavailableException(
        `Missing ${key}. Copy .env.example to .env and fill in the e.id credentials.`,
      );
    }
    return value;
  }

  get clientId(): string {
    return this.required('EID_CLIENT_ID');
  }

  get callbackUrl(): string {
    return this.required('EID_CALLBACK_URL');
  }

  /** Step 2 — where to send the user's browser. */
  loginUrl(): string {
    const query = new URLSearchParams({
      client_id: this.clientId,
      callback_url: this.callbackUrl,
    });
    return `${this.api}/verify?${query.toString()}`;
  }

  /** Step 1 — the app name/icon e.id has on file for this client. */
  async getApp(): Promise<EidApp> {
    const path = `${this.api}/client/${this.clientId}/${encodeURIComponent(this.callbackUrl)}`;
    return this.unwrap<EidApp>(await this.fetch(path));
  }

  /** Step 3 — the code is single-use; reusing it returns INVALID_OR_EXPIRED_CODE. */
  async exchangeCode(code: string): Promise<EidToken> {
    const response = await this.fetch(`${this.api}/get-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.required('EID_CLIENT_SECRET'),
        code,
        redirect_uri: this.callbackUrl,
      }),
    });
    return this.unwrap<EidToken>(response);
  }

  /** Step 4 — null rather than throwing, so an expired token reads as logged out. */
  async getProfile(token: string): Promise<EidProfile | null> {
    try {
      const response = await this.fetch(`${this.api}/get-profile?scope=email:profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return this.unwrap<EidProfile>(response);
    } catch (error) {
      this.logger.warn(`Profile lookup failed: ${(error as Error).message}`);
      return null;
    }
  }

  /** The gateway can be slow at venue wifi, so every call is time-boxed. */
  private async fetch(url: string, init: RequestInit = {}): Promise<Response> {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
    } catch (error) {
      throw new ServiceUnavailableException(
        `Tidak bisa menghubungi gateway e.id: ${(error as Error).message}`,
      );
    }
  }

  /** Non-2xx and status:false both mean failure; surface the gateway's code. */
  private async unwrap<T>(response: Response): Promise<T> {
    const body = (await response.json().catch(() => ({}))) as Envelope<T>;
    if (!response.ok || body.status === false || body.data == null) {
      throw new ServiceUnavailableException(
        body.message ?? `Permintaan e.id gagal (HTTP ${response.status})`,
      );
    }
    return body.data;
  }
}
