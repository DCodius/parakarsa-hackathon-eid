import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

/**
 * Pembatas laju sederhana per IP dan per rute.
 *
 * PRD 4.2 memperingatkan ratusan permintaan paralel saat demo day, dan endpoint
 * yang paling rawan justru yang tidak butuh login: tiap POST /verifier/sessions
 * membuat satu entri sesi di memori.
 *
 * @nestjs/throttler belum mendukung NestJS 12 (peer maksimal ^11), jadi ditulis
 * sendiri daripada memaksa versi yang tidak cocok.
 *
 * ponytail: hitungan disimpan di memori proses. Kalau nanti API berjalan lebih
 * dari satu instance, pindahkan hitungannya ke penyimpanan bersama.
 */
const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

const DEFAULT: RateLimitOptions = { limit: 60, windowMs: 60_000 };

/** Menempel di controller atau satu handler; tanpa ini dipakai nilai bawaan. */
export const RateLimit = (limit: number, windowMs = 60_000) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, windowMs } satisfies RateLimitOptions);

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const options =
      this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? DEFAULT;

    const now = Date.now();
    this.prune(now);

    // Di belakang nginx, req.ip sudah berisi X-Forwarded-For berkat trust proxy.
    const key = `${request.ip}:${context.getClass().name}.${context.getHandler().name}`;
    const window = this.hits.get(key);

    if (!window || window.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return true;
    }

    window.count += 1;
    if (window.count > options.limit) {
      throw new HttpException(
        `Terlalu banyak permintaan. Coba lagi dalam ${Math.ceil((window.resetAt - now) / 1000)} detik.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }

  /** Jendela yang sudah lewat dibuang, supaya peta tidak tumbuh tanpa batas. */
  private prune(now: number): void {
    for (const [key, window] of this.hits) {
      if (window.resetAt <= now) this.hits.delete(key);
    }
  }
}
