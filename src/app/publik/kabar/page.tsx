export const dynamic = "force-dynamic";
import {HostedPublicFeed} from "@/components/public/hosted-public-feed";
import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconNewSection } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Kabar & Catatan | KPI PPMI Mesir",
  description: "Catatan publik tentang mandat KPI PPMI Mesir, edukasi interaksi, dan alur aspirasi."
};

export default async function PublicNewsPage(): Promise<React.JSX.Element> {
  return <div className="kp-site kp-content-hub">
    <section className="kp-content-hero kp-content-hero--news" aria-labelledby="news-title"><div className="kp-wrap"><p className="kp-eyebrow"><span /> Kabar & catatan publik</p><h1 id="news-title">Informasi KPI<br /><em>untuk Masisir.</em></h1><p>Berita dan pengumuman resmi akan ditampilkan di sini setelah diverifikasi dan disetujui pengurus KPI.</p><Link className="kp-button kp-button--red" href="/publik/publikasi">Jelajahi publikasi <IconArrowRight size={18} aria-hidden="true" /></Link></div></section>
    <section className="kp-wrap kp-news-intro" aria-label="Pengantar kabar"><IconNewSection size={28} stroke={1.35} aria-hidden="true" /><p>Halaman Kabar menghimpun informasi publik yang telah disetujui KPI. Berita kegiatan dan pengumuman resmi memerlukan sumber serta tanggal yang terverifikasi sebelum diterbitkan.</p></section>
    <section className="kp-wrap kp-news-empty" aria-label="Status kabar publik"><p className="kp-eyebrow">Informasi yang dapat dipertanggungjawabkan</p><h2>Sumber jelas, informasi terverifikasi.</h2><p>Berita kegiatan dan pengumuman memerlukan sumber, tanggal, dan persetujuan pengurus sebelum ditampilkan di sini. Sementara itu, Anda dapat membaca profil KPI dan melihat dokumentasi yang sudah tersedia.</p><div><Link className="kp-button kp-button--outline" href="/publik">Tentang KPI <IconArrowUpRight size={18} aria-hidden="true" /></Link><Link className="kp-button kp-button--red" href="/publik/kegiatan">Lihat dokumentasi <IconArrowUpRight size={18} aria-hidden="true" /></Link></div></section>
    <section className="kp-wrap kp-content-next kp-content-next--compact"><div><p className="kp-eyebrow">Dokumentasi</p><h2>Lihat kegiatan KPI bersama Masisir.</h2></div><Link className="kp-button kp-button--outline" href="/publik/kegiatan">Kegiatan & dokumentasi <IconArrowUpRight size={18} aria-hidden="true" /></Link></section>
    <HostedPublicFeed category="NEWS" title="Kabar resmi KPI"/><PublicFooter />
  </div>;
}
