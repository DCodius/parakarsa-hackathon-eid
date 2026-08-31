"use client";

import { Button } from "@/components/ui";

/** Dialog cetak browser sekaligus jalur "Simpan sebagai PDF" — tanpa dependensi. */
export function PrintButton() {
  return (
    <Button onClick={() => window.print()}>
      <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
        <path
          d="M4.5 6V2.5h7V6M4.5 12H3.5A1.5 1.5 0 0 1 2 10.5v-3A1.5 1.5 0 0 1 3.5 6h9A1.5 1.5 0 0 1 14 7.5v3a1.5 1.5 0 0 1-1.5 1.5h-1M4.5 10h7v3.5h-7Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      Unduh PDF
    </Button>
  );
}
