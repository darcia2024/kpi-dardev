"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronRight } from "@tabler/icons-react";
import { findPublicDivision } from "@/lib/public-organization";

const englishLabels: Record<string, string> = { divisions: "Divisions", services: "Services", publications: "Publications", search: "Search" };

const labels: Record<string, string> = {
  publik: "Informasi publik",
  publikasi: "Publikasi & edukasi",
  cari: "Pencarian",
  "contoh-peran-kpi": "Artikel contoh",
  aspirasi: "Aspirasi & pelacakan",
  pengaduan: "Layanan pengaduan",
  struktur: "Struktur organisasi",
  divisi: "Profil divisi",
  kegiatan: "Kegiatan & dokumentasi",
  kabar: "Kabar & catatan",
  layanan: "Layanan publik",
  masuk: "Login pengurus",
  "lupa-sandi": "Lupa kata sandi",
  "atur-ulang": "Kata sandi baru",
  portal: "Portal pengurus",
  workspace: "Ruang kerja",
  tugas: "Tugas",
  dokumen: "Dokumen",
  rapat: "Rapat",
  kasus: "Kasus & notifikasi",
  keuangan: "Keuangan",
  akses: "Akses & identitas",
  editor: "Redaksi",
  evaluasi: "Evaluasi & rujukan",
  handover: "Serah terima",
  ai: "AI terkendali",
  katalog: "Katalog layar"
};

export function Breadcrumbs(): React.JSX.Element | null {
  const pathname = usePathname();
  if (pathname.startsWith("/portal")) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  if (segments[0] === "en") return <nav className="kp-breadcrumb" aria-label="Breadcrumb" lang="en">
    <Link href="/en">Home</Link>
    {segments.slice(1).map((segment, index) => {
      const href = `/en/${segments.slice(1, index + 2).join("/")}`;
      const last = index === segments.length - 2;
      const label = englishLabels[segment] ?? findPublicDivision(segment)?.englishName ?? segment.replace(/-/g, " ");
      return <span key={href}><IconChevronRight size={14} aria-hidden="true" />{last ? <span aria-current="page">{label}</span> : <Link href={href}>{label}</Link>}</span>;
    })}
  </nav>;

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
