export const dynamic = "force-dynamic";
import {HostedPublicFeed} from "@/components/public/hosted-public-feed";
import type { Metadata } from "next";
import Link from "next/link";
import { IconNewSection } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Kabar & Catatan | KPI PPMI Mesir",
  description: "Catatan publik tentang mandat KPI PPMI Mesir, edukasi interaksi, dan alur aspirasi."
};

export default async function PublicNewsPage(): Promise<React.JSX.Element> {
  return <div className="kp-site kp-content-hub">
    <section className="kp-content-hero kp-content-hero--news" aria-labelledby="news-title"><div className="kp-wrap"><h1 id="news-title">Kabar dan pengumuman KPI</h1><p>Berita dan pengumuman resmi akan ditampilkan di sini setelah diverifikasi dan disetujui pengurus KPI.</p><Link className="kp-button kp-button--red" href="/publik/publikasi">Jelajahi publikasi</Link></div></section>
    <section className="kp-wrap kp-news-intro" aria-label="Pengantar kabar"><IconNewSection size={28} stroke={1.35} aria-hidden="true" /><p>Halaman Kabar menghimpun informasi publik yang telah disetujui KPI. Berita kegiatan dan pengumuman resmi memerlukan sumber serta tanggal yang terverifikasi sebelum diterbitkan.</p></section>
    <section className="kp-wrap kp-news-empty" aria-label="Status kabar publik"><h2>Syarat pemuatan kabar</h2><p>Berita kegiatan dan pengumuman memerlukan sumber, tanggal, dan persetujuan pengurus sebelum ditampilkan di sini. Sementara itu, Anda dapat membaca profil KPI dan melihat dokumentasi yang sudah tersedia.</p><div><Link className="kp-button kp-button--outline" href="/publik">Tentang KPI</Link><Link className="kp-button kp-button--red" href="/publik/kegiatan">Lihat dokumentasi</Link></div></section>
    <section className="kp-wrap kp-content-next kp-content-next--compact"><div><h2>Kegiatan KPI</h2></div><Link className="kp-button kp-button--outline" href="/publik/kegiatan">Kegiatan & dokumentasi</Link></section>
    <HostedPublicFeed category="NEWS" title="Kabar resmi KPI"/><PublicFooter />
  </div>;
}
