"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

/** EP pillars from the PRD: Talenta, Market, Tata Kelola across six axes. */
export const dnaAxes = [
  { axis: "Kepemimpinan", score: 78, pillar: "Talenta" },
  { axis: "Ketahanan Tim", score: 71, pillar: "Talenta" },
  { axis: "Inovasi Produk", score: 88, pillar: "Market" },
  { axis: "Jangkauan Pasar", score: 64, pillar: "Market" },
  { axis: "Tata Kelola", score: 59, pillar: "Tata Kelola" },
  { axis: "Kepatuhan Legal", score: 83, pillar: "Tata Kelola" },
] as const;

/**
 * PRD 2.1.4 — meteran komposisi EP: rata-rata tiap pilar, bukan tiap sumbu.
 * Diturunkan dari dnaAxes supaya angka pilar dan radar tidak bisa berbeda.
 */
export const epPillars = ["Talenta", "Market", "Tata Kelola"].map((pillar) => {
  const axes = dnaAxes.filter((axis) => axis.pillar === pillar);
  return {
    pillar,
    score: Math.round(axes.reduce((sum, axis) => sum + axis.score, 0) / axes.length),
    axes: axes.map((axis) => axis.axis),
  };
});

export const epScore = Math.round(
  dnaAxes.reduce((sum, a) => sum + a.score, 0) / dnaAxes.length,
);

export function DnaRadar() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <RadarChart data={[...dnaAxes]} outerRadius="70%">
          <PolarGrid stroke="var(--color-hairline)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="score"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.16}
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--color-primary)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
