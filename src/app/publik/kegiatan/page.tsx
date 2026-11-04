export const dynamic = "force-dynamic";
import {HostedPublicFeed} from "@/components/public/hosted-public-feed";
import type { Metadata } from "next";
import Link from "next/link";
import { IconCamera, IconHeartHandshake, IconMessages, IconUsersGroup } from "@tabler/icons-react";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { PublicFooter } from "@/components/public/public-footer";
import { publicDocumentation } from "@/lib/public-content";

export const metadata: Metadata = {
  title: "Kegiatan & Dokumentasi | KPI PPMI Mesir",
  description: "Dokumentasi kegiatan KPI PPMI Mesir dalam dialog, edukasi, dan koordinasi bersama Masisir."
};

export default async function PublicActivitiesPage(): Promise<React.JSX.Element> {
  return <div className="kp-site kp-content-hub">
    <section className="kp-content-hero" aria-labelledby="activities-title"><div className="kp-wrap"><h1 id="activities-title">Kegiatan dan dokumentasi KPI</h1><p>Lihat dokumentasi kegiatan KPI dalam membangun pemahaman interaksi, bertukar pandangan, dan berkoordinasi dengan pihak terkait.</p><div className="kp-content-hero__actions"><a className="kp-button kp-button--red" href="#dokumentasi">Lihat dokumentasi</a><Link className="kp-button kp-button--outline" href="/publik/kabar">Baca kabar KPI</Link></div></div></section>
    <section className="kp-wrap kp-content-markers" aria-label="Ragam dokumentasi"><div><IconMessages size={23} stroke={1.45} aria-hidden="true" /><strong>Dialog</strong><span>Ruang untuk mendengar dan memahami.</span></div><div><IconUsersGroup size={23} stroke={1.45} aria-hidden="true" /><strong>Kolaborasi</strong><span>Kerja bersama lintas ruang dan peran.</span></div><div><IconHeartHandshake size={23} stroke={1.45} aria-hidden="true" /><strong>Kebersamaan</strong><span>Relasi yang saling menjaga.</span></div></section>
    <section className="kp-content-gallery" id="dokumentasi" aria-labelledby="documentation-title"><div className="kp-wrap"><div className="kp-content-section-head"><div><h2 id="documentation-title">Galeri foto</h2></div><p>Gunakan tombol arah atau geser koleksi untuk melihat foto. Pilih foto untuk membukanya dalam tampilan penuh.</p></div><PhotoGallery photos={publicDocumentation} /></div></section>
    <section className="kp-wrap kp-content-next" aria-labelledby="next-title"><div><h2 id="next-title">Materi terkait</h2></div><div><Link href="/publik/publikasi"><span>Publikasi</span><strong>Baca materi tentang interaksi dan peran KPI</strong></Link><Link href="/publik/aspirasi"><span>Aspirasi</span><strong>Pahami jalur menyampaikan informasi</strong></Link></div></section>
    <HostedPublicFeed category="EVENT" title="Agenda dan catatan kegiatan"/><PublicFooter />
  </div>;
}
