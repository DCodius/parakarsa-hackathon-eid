/** EP pillars from the PRD: Talenta, Market, Tata Kelola across six axes. */
export const dnaAxes = [
  { axis: "Kepemimpinan", score: 78, pillar: "Talenta" },
  { axis: "Ketahanan Tim", score: 71, pillar: "Talenta" },
  { axis: "Inovasi Produk", score: 88, pillar: "Market" },
  { axis: "Jangkauan Pasar", score: 64, pillar: "Market" },
  { axis: "Tata Kelola", score: 59, pillar: "Tata Kelola" },
  { axis: "Kepatuhan Legal", score: 83, pillar: "Tata Kelola" },
] as const;

export type DnaAxis = { axis: string; score: number; pillar: string };

/**
 * PRD 2.1.4 — meteran komposisi EP: rata-rata tiap pilar, bukan tiap sumbu.
 * Diturunkan dari sumbu supaya angka pilar dan radar tidak bisa berbeda.
 */
export function pillarsOf(axes: readonly DnaAxis[]) {
  return ["Talenta", "Market", "Tata Kelola"].map((pillar) => {
    const members = axes.filter((axis) => axis.pillar === pillar);
    return {
      pillar,
      score: Math.round(members.reduce((sum, axis) => sum + axis.score, 0) / members.length),
      axes: members.map((axis) => axis.axis),
    };
  });
}

export function scoreOf(axes: readonly DnaAxis[]): number {
  return Math.round(axes.reduce((sum, axis) => sum + axis.score, 0) / axes.length);
}

export const epPillars = pillarsOf(dnaAxes);
export const epScore = scoreOf(dnaAxes);

/** Satu bukti LMS menaikkan pilar Talenta; dibatasi agar tidak bisa digenjot. */
export const EVIDENCE_BONUS = 4;
export const EVIDENCE_CAP = 12;

/**
 * PRD 2.1.4 — berkas yang diunggah tidak berhenti jadi nama file: ia menggeser
 * pilar Talenta pada radar, karena itulah bukti kelulusan LMS yang dinilai.
 */
export function axesWithEvidence(evidenceCount: number): DnaAxis[] {
  const bonus = Math.min(evidenceCount * EVIDENCE_BONUS, EVIDENCE_CAP);
  return dnaAxes.map((axis) => ({
    ...axis,
    score: axis.pillar === "Talenta" ? Math.min(100, axis.score + bonus) : axis.score,
  }));
}

/**
 * PRD 3.3 — NIK tidak pernah tampil utuh di DNA Portfolio, karena dokumen itu
 * bisa diunduh siapa pun. Yang dibuktikan adalah statusnya, bukan angkanya.
 */
export function maskNik(nik: string): string {
  const digits = nik.replace(/\D/g, "");
  if (digits.length < 8) return "••••";
  return `${digits.slice(0, 4)} •••• •••• ${digits.slice(-4)}`;
}
