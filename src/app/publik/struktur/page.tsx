import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconBuildingCommunity, IconInfoCircle } from "@tabler/icons-react";
import { publicDivisions } from "@/lib/public-organization";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = {
  title: "Struktur Organisasi | KPI PPMI Mesir",
  description: "Kedudukan KPI sebagai Badan Semi Otonom PPMI Mesir dengan tiga divisi dan satu subbidang."
};

export default function PublicStructurePage(): React.JSX.Element {
  return <div className="kp-site kp-organization-page">
    <section className="kp-org-hero" aria-labelledby="structure-title"><div className="kp-wrap"><p className="kp-eyebrow"><span /> Struktur organisasi</p><h1 id="structure-title">Kedudukan jelas.<br /><em>Fungsi saling terhubung.</em></h1><p>KPI berkedudukan sebagai Badan Semi Otonom PPMI Mesir. Peta ini memperlihatkan divisi dan fungsi yang dapat diketahui publik; susunan personel menunggu data resmi yang layak dipublikasikan.</p></div></section>
    <section className="kp-wrap kp-org-map" aria-labelledby="map-title"><div className="kp-org-map__heading"><div><p className="kp-eyebrow">Peta kerja publik</p><h2 id="map-title">Tiga divisi dan satu subbidang.</h2></div><p>Media & Publikasi berada di bawah Pencegahan & Edukasi. Setiap unit mendukung mandat KPI sesuai fungsi dan kewenangannya.</p></div><div className="kp-org-root"><IconBuildingCommunity size={31} stroke={1.4} aria-hidden="true" /><span>Dalam naungan</span><strong>PPMI Mesir</strong></div><div className="kp-org-link" aria-hidden="true" /><div className="kp-org-core"><Image src="/brand/kpi-ppmi-mesir-logo.png" alt="" width={56} height={56} /><div><span>Badan Semi Otonom</span><strong>Komisi Peduli Interaksi</strong></div></div><div className="kp-org-branches" aria-label="Tiga divisi dan satu subbidang KPI">{publicDivisions.map((division) => <Link href={`/publik/divisi/${division.slug}`} key={division.slug}><Image src={division.mark} alt={`Lambang ${division.name}`} width={82} height={90} /><span>{division.unitType} · {division.englishName}</span><strong>{division.name}</strong><IconArrowUpRight size={18} aria-hidden="true" /></Link>)}</div></section>
    <section className="kp-org-note"><div className="kp-wrap"><IconInfoCircle size={25} stroke={1.5} aria-hidden="true" /><p><strong>Catatan publikasi.</strong> Bagan ini menjelaskan fungsi dan ruang kerja. Susunan jabatan, periode aktif, serta keanggotaan akan tampil setelah data resmi tersedia dan disetujui untuk umum.</p></div></section>
    <section className="kp-wrap kp-org-cta"><div><p className="kp-eyebrow">Kenali ruang kerja</p><h2>Lihat tugas setiap unit.</h2><p>Pelajari fokus tiga divisi dan subbidang Media & Publikasi.</p></div><Link className="kp-button kp-button--red" href="/publik/divisi">Profil unit kerja <IconArrowRight size={18} aria-hidden="true" /></Link></section>
    <PublicFooter />
  </div>;
}
