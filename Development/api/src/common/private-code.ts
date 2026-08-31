import { ForbiddenException, Logger } from '@nestjs/common';

const logger = new Logger('PrivateCode');

/**
 * Rahasia bersama yang membuktikan sebuah callback benar-benar datang dari e.id.
 * Dipakai tiga endpoint callback, jadi aturannya ditulis sekali di sini —
 * termasuk aturan bahwa rahasia yang belum diisi berarti pemeriksaan dilewati
 * (mode pengembangan), bukan semua permintaan ditolak.
 */
export function checkPrivateCode(expected: string | undefined, provided: string | undefined, source: string): boolean {
  if (!expected) return true;
  if (provided === expected) return true;

  logger.warn(`Menolak panggilan ${source}: private_code tidak cocok`);
  return false;
}

/** Versi yang melempar 403 — untuk endpoint yang tidak punya bentuk balasan "gagal". */
export function assertPrivateCode(expected: string | undefined, provided: string | undefined, source: string): void {
  if (!checkPrivateCode(expected, provided, source)) {
    throw new ForbiddenException('private_code tidak cocok');
  }
}
