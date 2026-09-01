/**
 * Kode kegagalan callback SSO — cermin errorCode() di API auth.controller:
 *   gateway   sandbox e.id menolak/mati — hari ini api-dev.e.id balas 403
 *   eid       kesalahan e.id lain (authorization code, token, dst.)
 *   no-email  profil e.id tanpa email, akun ParaKarsa tidak jadi diterbitkan
 * Pesan mentah hanya dipakai untuk `eid`; dua kode lain diganti copy yang
 * menjelaskan, supaya halaman tidak terasa seperti dump error sistem.
 */
export type LoginIssue = {
  title: string;
  body: string;
  /** Tautan keluar — hanya gateway, karena jalur QR memang alternatifnya. */
  action?: { href: string; label: string };
};

export function describeLoginIssue(code: string | null, error: string | null): LoginIssue | null {
  if (!error) return null;

  switch (code) {
    case "gateway":
      return {
        title: "Login browser belum sampai ke e.id.",
        body: "Gateway e.id belum terjangkau dari server kami (sandbox masih menolak akses). Login lewat QR simulation tetap tersedia.",
        action: { href: "/login", label: "Coba QR Simulation" },
      };
    case "no-email":
      return {
        title: "Akun ParaKarsa tidak bisa diterbitkan.",
        body: "Akun e.id Anda tidak membawa email, jadi akun ParaKarsa tidak bisa dibuat dari login ini.",
      };
    default:
      // "eid" atau kode tak dikenal: pesan dari gateway ditampilkan apa adanya.
      return { title: "Login e.id tidak selesai.", body: error };
  }
}
