"use client";

import { useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";

/**
 * Satu probe GET /auth/app per mount: bila gateway e.id tak terjangkau (hari
 * ini sandbox membalas 403), pengunjung tahu jalur QR Simulation tetap hidup.
 * Tombol SSO tetap aktif apa pun hasilnya — redirect gagal kini menjelaskan
 * dirinya sendiri di /profile.
 */
export function EidGatewayHint() {
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    let active = true;
    const probe = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/v1/auth/app`, {
          cache: "no-store",
          // Gateway lambat atau mati dianggap tak terjangkau, bukan menggantung.
          signal: AbortSignal.timeout(5000),
        });
        if (active && !response.ok) setUnreachable(true);
      } catch {
        if (active) setUnreachable(true);
      }
    };
    void probe();
    return () => {
      active = false;
    };
  }, []);

  if (!unreachable) return null;

  return (
    <p className="mt-1.5 text-center text-xs leading-relaxed text-accent">
      Gateway e.id belum terjangkau — tombol ini kemungkinan gagal. Coba QR Simulation di atas.
    </p>
  );
}
