"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight } from "@tabler/icons-react";
import { findPublicDivision } from "@/lib/public-organization";

const labels: Record<string, string> = {
  publik: "Informasi publik",
  publikasi: "Publikasi & edukasi",
  "contoh-peran-kpi": "Artikel contoh",
  aspirasi: "Aspirasi & pelacakan",
  pengaduan: "Layanan pengaduan",
  struktur: "Struktur organisasi",
  divisi: "Profil divisi",
  kegiatan: "Kegiatan & dokumentasi",
  kabar: "Kabar & catatan",
  layanan: "Layanan publik",
  masuk: "Login pengurus",
  portal: "Portal pengurus",
  workspace: "Workspace",
  tugas: "Tugas",
  dokumen: "Dokumen",
  rapat: "Rapat",
  kasus: "Kasus & notifikasi",
  keuangan: "Keuangan",
  akses: "Akses & identitas",
  editor: "Redaksi",
  evaluasi: "Evaluasi & knowledge",
  handover: "Handover",
  ai: "AI terkendali",
  katalog: "Katalog layar"
};

export function Breadcrumbs(): React.JSX.Element | null {
  const pathname = usePathname();
  if (pathname.startsWith("/portal")) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;

  return <nav className="kp-breadcrumb" aria-label="Jejak halaman">
    <Link href="/">Beranda</Link>
    {segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const last = index === segments.length - 1;
      const label = labels[segment] ?? findPublicDivision(segment)?.name ?? segment;
      return <span key={href}><IconChevronRight size={14} aria-hidden="true" />{last ? <span aria-current="page">{label}</span> : <Link href={href}>{label}</Link>}</span>;
    })}
  </nav>;
}
