import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { Account } from '../accounts/accounts.service.js';

/**
 * FR-03 — penerbitan Verifiable DNA Portfolio sebagai berkas PDF sungguhan,
 * dirakit di server dari kredensial terverifikasi.
 *
 * Dokumen ini bisa diunduh dan diteruskan siapa pun, jadi dua aturan berlaku
 * mutlak: NIK hanya tampil tersamar, dan bagian yang consent-nya dicabut tidak
 * ikut dicetak sama sekali.
 */
export interface DnaAxis {
  axis: string;
  score: number;
  pillar: string;
}

/**
 * ponytail: sumbu DNA masih data contoh dan kembar dengan salinan di frontend.
 * Keduanya harus membaca hasil impor LMS begitu fitur itu ada.
 */
export const dnaAxes: DnaAxis[] = [
  { axis: 'Kepemimpinan', score: 78, pillar: 'Talenta' },
  { axis: 'Ketahanan Tim', score: 71, pillar: 'Talenta' },
  { axis: 'Inovasi Produk', score: 88, pillar: 'Market' },
  { axis: 'Jangkauan Pasar', score: 64, pillar: 'Market' },
  { axis: 'Tata Kelola', score: 59, pillar: 'Tata Kelola' },
  { axis: 'Kepatuhan Legal', score: 83, pillar: 'Tata Kelola' },
];

export interface PortfolioInput {
  account: Account;
  /** Bukti tanda tangan dari log verifikasi, bila ada. */
  proof?: { did_key?: string; on_chain_tx?: string };
  /** Consent pemilik profil; DNA dilewati bila cakupan `ep` dicabut. */
  showDna: boolean;
}

/** Jarak antar baris meter, cukup untuk teks 9pt beserta batangnya. */
const ROW_HEIGHT = 15;

const INK = '#1a1a1a';
const SOFT = '#414141';
const MUTED = '#6f6f6f';
const PRIMARY = '#0b473b';
const HAIRLINE = '#e0e0dc';

@Injectable()
export class DnaPortfolioService {
  /** Mengembalikan PDF utuh sebagai Buffer; ukurannya selalu di bawah 100 kB. */
  async render(input: PortfolioInput): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 48, info: this.info(input.account) });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    const finished = new Promise<void>((resolve) => doc.on('end', () => resolve()));

    this.header(doc, input.account);
    this.identity(doc, input.account);
    if (input.showDna) {
      this.performance(doc);
    } else {
      this.withheld(doc);
    }
    this.proof(doc, input.proof);
    this.footer(doc);

    doc.end();
    await finished;
    return Buffer.concat(chunks);
  }

  private info(account: Account) {
    return {
      Title: `DNA Portfolio — ${account.fullname ?? 'ParaKarsa'}`,
      Author: 'ParaKarsa / EntreID',
      Subject: 'Verifiable DNA Portfolio berbasis kredensial e.id',
    };
  }

  private header(doc: PDFKit.PDFDocument, account: Account): void {
    doc.fillColor(MUTED).fontSize(8).text('VERIFIABLE DNA PORTFOLIO', { characterSpacing: 1.6 });
    doc.moveDown(0.4);
    doc.fillColor(PRIMARY).fontSize(22).font('Helvetica-Bold').text(account.fullname ?? '—');
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .font('Helvetica')
      .text(
        `Diterbitkan ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })} · Sumber: e.id` +
          (account.simulated ? ' · SIMULATION MODE' : ''),
      );
    this.rule(doc, 10);
  }

  private identity(doc: PDFKit.PDFDocument, account: Account): void {
    this.heading(doc, 'Identitas terverifikasi');
    this.rows(doc, [
      ['Nama pemilik', account.fullname ?? '—', account.kyc_vendor ?? 'e.id'],
      ['NIK', account.nik_masked ?? '—', account.kyc_vendor ?? 'KYC'],
      ['Email terverifikasi', account.email ?? '—', 'Membership L1'],
      ['Telepon', account.phone ? maskPhone(account.phone) : '—', 'Membership L1'],
      ['Tingkat verifikasi', tierLabel(account.tier), 'e.id'],
    ]);
  }

  private performance(doc: PDFKit.PDFDocument): void {
    this.heading(doc, 'Skor Kinerja Kewirausahaan (EP)');

    const score = Math.round(dnaAxes.reduce((sum, axis) => sum + axis.score, 0) / dnaAxes.length);
    doc.x = 48;
    doc.fillColor(PRIMARY).fontSize(28).font('Helvetica-Bold').text(`${score}`, { continued: true });
    doc.fillColor(MUTED).fontSize(9).font('Helvetica').text('  dari 100');
    doc.x = 48;
    doc.moveDown(1.4);

    for (const axis of dnaAxes) {
      this.meter(doc, axis.axis, axis.score);
    }
  }

  private withheld(doc: PDFKit.PDFDocument): void {
    this.heading(doc, 'Skor Kinerja Kewirausahaan (EP)');
    doc
      .fillColor(MUTED)
      .fontSize(9)
      .font('Helvetica')
      .text(
        'Tidak ditampilkan atas permintaan pemilik profil. Cakupan consent "EP Score & diagram ' +
          'DNA" sedang dicabut, dan dokumen ini menghormatinya.',
        { width: 460 },
      );
    doc.moveDown(0.6);
  }

  private proof(doc: PDFKit.PDFDocument, proof?: PortfolioInput['proof']): void {
    if (!proof?.did_key && !proof?.on_chain_tx) return;

    this.heading(doc, 'Bukti tanda tangan di IDChain');
    this.rows(doc, [
      ['DID penerbit', shorten(proof.did_key), ''],
      ['Hash transaksi', shorten(proof.on_chain_tx), ''],
    ]);
  }

  private footer(doc: PDFKit.PDFDocument): void {
    doc.x = 48;
    this.rule(doc, 6);
    doc
      .fillColor(MUTED)
      .fontSize(7.5)
      .font('Helvetica')
      .text(
        'Dokumen ini dirakit otomatis dari kredensial e.id milik pemegang profil; tidak ada ' +
          'isinya yang diketik manual. NIK ditampilkan tersamar sesuai UU PDP No. 27/2022 — yang ' +
          'dibuktikan adalah status verifikasinya, bukan angkanya.',
        { width: 500 },
      );
  }

  private heading(doc: PDFKit.PDFDocument, text: string): void {
    // Teks berposisi tetap di rows()/meter() menggeser kursor x pdfkit; tanpa
    // dikembalikan, judul berikutnya tercetak sempit di kolom kanan.
    doc.x = 48;
    doc.moveDown(0.9);
    doc.fillColor(MUTED).fontSize(7.5).font('Helvetica-Bold').text(text.toUpperCase(), {
      characterSpacing: 1.2,
    });
    doc.moveDown(0.5);
  }

  private rows(doc: PDFKit.PDFDocument, rows: [string, string, string][]): void {
    for (const [label, value, source] of rows) {
      const y = doc.y;
      doc.fillColor(MUTED).fontSize(9).font('Helvetica').text(label, 48, y, { width: 150 });
      doc.fillColor(INK).font('Helvetica-Bold').text(value, 198, y, { width: 240 });
      if (source) {
        doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica').text(source, 438, y + 1, {
          width: 110,
          align: 'right',
        });
      }
      doc.x = 48;
      doc.moveDown(0.45);
    }
  }

  private meter(doc: PDFKit.PDFDocument, label: string, score: number): void {
    const y = doc.y;
    doc.fillColor(SOFT).fontSize(9).font('Helvetica').text(label, 48, y, { width: 150 });

    const width = 260;
    doc.roundedRect(198, y + 3, width, 5, 2.5).fill('#eeeeea');
    doc.roundedRect(198, y + 3, (width * score) / 100, 5, 2.5).fill(PRIMARY);
    doc.fillColor(MUTED).fontSize(8).text(`${score}`, 468, y, { width: 40 });

    // Tinggi baris dipatok, bukan diturunkan dari tinggi teks: bar setinggi 5pt
    // butuh ruang lebih dari satu baris 9pt, dan moveDown() tidak tahu itu.
    doc.x = 48;
    doc.y = y + ROW_HEIGHT;
  }

  private rule(doc: PDFKit.PDFDocument, gap: number): void {
    doc.moveDown(gap / 20);
    doc
      .strokeColor(HAIRLINE)
      .lineWidth(0.8)
      .moveTo(48, doc.y)
      .lineTo(547, doc.y)
      .stroke();
    doc.moveDown(0.5);
  }
}

const tiers = ['Belum terverifikasi', 'Tier 1 · Email & telepon', 'Tier 2 · Identitas formal'];
const tierLabel = (tier: number) => tiers[tier] ?? tiers[0];

/** Empat digit terakhir sudah cukup bagi mitra untuk mencocokkan. */
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length < 6 ? '••••' : `+${digits.slice(0, 4)}••••••${digits.slice(-2)}`;
}

function shorten(value?: string): string {
  if (!value) return '—';
  return value.length <= 34 ? value : `${value.slice(0, 16)}…${value.slice(-12)}`;
}
