"use client";

import { useState } from "react";
import { eventCities } from "@/lib/data";

export function EventCityFilter() {
  const [city, setCity] = useState<string | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Pill label="All" selected={city === null} onClick={() => setCity(null)} />
      {eventCities.map((name) => (
        <Pill
          key={name}
          label={name}
          selected={city === name}
          onClick={() => setCity(city === name ? null : name)}
        />
      ))}
    </div>
  );
}

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-medium transition ${
        selected ? "bg-primary text-white" : "bg-surface text-ink-soft hover:bg-canvas-alt"
      }`}
    >
      {label}
    </button>
  );
}
