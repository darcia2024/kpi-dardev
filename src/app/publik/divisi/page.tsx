import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { publicDivisions } from "@/lib/public-organization";
import { PublicFooter } from "@/components/public/public-footer";

export const metadata: Metadata = { title: "Profil Divisi dan Subbidang | KPI PPMI Mesir", description: "Kenali tiga divisi dan satu subbidang yang mendukung pelaksanaan mandat KPI PPMI Mesir." };

export default function PublicDivisionsPage(): React.JSX.Element {
  return <div className="kp-site kp-organization-page"><section className="kp-org-hero kp-org-hero--compact" aria-labelledby="divisions-title"><div className="kp-wrap"><p className="kp-eyebrow"><span /> Profil unit kerja</p><h1 id="divisions-title">Tiga divisi.<br /><em>Satu subbidang.</em></h1><p>Media & Publikasi merupakan subbidang di bawah Pencegahan & Edukasi. Keempat unit kerja ini saling melengkapi dalam menjalankan mandat KPI untuk Masisir.</p></div></section><section className="kp-wrap kp-division-directory" aria-label="Daftar profil divisi dan subbidang">{publicDivisions.map((division, index) => <article key={division.slug}><div className="kp-division-directory__identity"><span>0{index + 1}</span><Image src={division.mark} alt={`Lambang ${division.name}`} width={116} height={126} /></div><div><p>{division.unitType} · {division.englishName}</p><h2>{division.name}</h2><p>{division.summary}</p></div><Link href={`/publik/divisi/${division.slug}`}>Lihat profil <IconArrowUpRight size={19} aria-hidden="true" /></Link></article>)}</section><PublicFooter /></div>;
}
