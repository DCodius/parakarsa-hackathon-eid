import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

/**
 * Envelope Encryption AES-256-GCM (PRD 3.1).
 *
 * Tiap akun punya kunci datanya sendiri (DEK) yang dipakai mengenkripsi kolom
 * berisi data pribadi. DEK itu sendiri disimpan dalam keadaan terenkripsi oleh
 * kunci induk (KEK) yang hidup di environment, bukan di database.
 *
 * Akibatnya: pencuri yang membawa berkas database tetap tidak bisa membaca
 * nama, email, atau telepon siapa pun — dan merotasi kunci induk cukup
 * mengenkripsi ulang DEK per baris, bukan seluruh isi tabel.
 */
const ALGORITHM = 'aes-256-gcm';
const KEY_BYTES = 32;
const IV_BYTES = 12;
const PREFIX = 'enc:v1:';

/** GCM menghasilkan tiga bagian; semuanya perlu disimpan untuk bisa dibuka. */
function seal(key: Buffer, plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const body = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return [
    PREFIX + iv.toString('base64'),
    cipher.getAuthTag().toString('base64'),
    body.toString('base64'),
  ].join('.');
}

function open(key: Buffer, payload: string): string {
  const [head, tag, body] = payload.split('.');
  const decipher = createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(head.slice(PREFIX.length), 'base64'),
  );
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  // Tag GCM diperiksa saat final(): ciphertext yang diutak-atik melempar di sini.
  return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString(
    'utf8',
  );
}

export function isSealed(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.startsWith(PREFIX);
}

export class Envelope {
  constructor(private readonly masterKey: Buffer) {}

  /** Kunci data baru untuk satu akun, langsung dalam bentuk terbungkus. */
  createDataKey(): { wrapped: string; key: Buffer } {
    const key = randomBytes(KEY_BYTES);
    return { wrapped: seal(this.masterKey, key.toString('base64')), key };
  }

  unwrapDataKey(wrapped: string): Buffer {
    return Buffer.from(open(this.masterKey, wrapped), 'base64');
  }

  /** Nilai kosong dibiarkan apa adanya: tidak ada gunanya mengenkripsi null. */
  encryptField(key: Buffer, value: string | null | undefined): string | null {
    if (value == null || value === '') return null;
    return seal(key, value);
  }

  /**
   * Nilai yang belum terbungkus dikembalikan apa adanya, supaya baris lama dari
   * sebelum enkripsi dipasang tetap terbaca sampai sempat dimigrasikan.
   */
  decryptField(key: Buffer, value: string | null | undefined): string | undefined {
    if (value == null) return undefined;
    return isSealed(value) ? open(key, value) : value;
  }
}

/**
 * Kunci induk wajib ada di produksi. Di pengembangan dipakai kunci tetap yang
 * bukan rahasia, supaya `npm run start:dev` tidak menuntut persiapan — dan
 * supaya jelas bahwa data dev memang tidak dilindungi.
 */
export function loadMasterKey(configured: string | undefined, production: boolean): Buffer {
  if (configured) {
    const key = Buffer.from(configured, 'base64');
    if (key.length !== KEY_BYTES) {
      throw new Error(
        `PARAKARSA_MASTER_KEY harus 32 byte dalam base64 (dapat ${key.length} byte). ` +
          'Buat dengan: openssl rand -base64 32',
      );
    }
    return key;
  }

  if (production) {
    throw new Error(
      'PARAKARSA_MASTER_KEY belum diisi. Tanpa kunci induk, data pribadi akan tersimpan ' +
        'tanpa perlindungan. Buat dengan: openssl rand -base64 32',
    );
  }

  return Buffer.alloc(KEY_BYTES, 'parakarsa-dev-key');
}
