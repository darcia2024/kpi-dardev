import type { Metadata } from "next";
import Link from "next/link";
import { IconMessageCircle, IconShieldCheck } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";
import { ServiceFinder } from "@/components/public/service-finder";

export const metadata: Metadata = {
  title: "Layanan Publik | KPI PPMI Mesir",
  description: "Direktori informasi publik KPI PPMI Mesir: mandat, divisi, edukasi, kegiatan, dan alur aspirasi.", alternates: { languages: { id: "/publik/layanan", en: "/en/services" } }
};

export default function PublicServicesPage(): React.JSX.Element {
  return <div className="kp-site kp-service-page">
    <section className="kp-service-hero" aria-labelledby="service-title"><div className="kp-wrap"><h1 id="service-title">Layanan informasi KPI</h1><p>Temukan penjelasan mandat dan divisi KPI, materi edukasi interaksi, dokumentasi kegiatan, serta panduan aspirasi dan pengaduan.</p><div><Link className="kp-button kp-button--red" href="#cari-layanan">Cari informasi</Link><Link className="kp-button kp-button--outline" href="/publik/pengaduan">Alur pengaduan <IconMessageCircle size={18} aria-hidden="true" /></Link></div></div></section>
    <section className="kp-wrap kp-service-directory" id="cari-layanan" aria-labelledby="directory-title"><div className="kp-service-directory__head"><div><h2 id="directory-title">Topik</h2></div><p>Gunakan pencarian untuk menemukan halaman publik yang tersedia. Dokumen internal dan data pribadi tidak termasuk dalam direktori ini.</p></div><ServiceFinder /></section>
    <section className="kp-wrap kp-service-safe"><IconShieldCheck size={30} stroke={1.4} aria-hidden="true" /><div><h2>Yang tidak ditampilkan di sini</h2><p>Halaman publik memuat materi dan dokumentasi yang dapat dibagikan. Detail internal, data personal, dan proses penanganan hanya ditampilkan setelah ada dasar serta persetujuan yang tepat.</p></div></section>
    <PublicFooter />
  </div>;
}
