"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { dnaAxes, type DnaAxis } from "@/lib/dna";

export function DnaRadar({ axes = dnaAxes }: { axes?: readonly DnaAxis[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer>
        <RadarChart data={[...axes]} outerRadius="70%">
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
