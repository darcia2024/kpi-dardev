import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconArrowRight, IconCheck, IconUsers } from "@tabler/icons-react";
import { findPublicDivision, publicDivisions } from "@/lib/public-organization";
import { PublicFooter } from "@/components/public/public-footer";

export function generateStaticParams(): Array<{ slug: string }> { return publicDivisions.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const division = findPublicDivision((await params).slug); return { title: division ? `${division.name} | KPI PPMI Mesir` : "Divisi | KPI PPMI Mesir" }; }

export default async function PublicDivisionDetailPage({ params }: { params: Promise<{ slug: string }> }): Promise<React.JSX.Element> {
  const division = findPublicDivision((await params).slug);
  if (!division) notFound();
  return <div className="kp-site kp-organization-page"><section className="kp-wrap kp-division-detail" aria-labelledby="division-title"><Link className="kp-org-back" href="/publik/divisi"><IconArrowLeft size={18} aria-hidden="true" /> Semua unit kerja</Link><div className="kp-division-detail__hero"><div><p className="kp-eyebrow">{division.unitType} · {division.englishName}</p><h1 id="division-title">{division.name}</h1><p>{division.summary}</p><div className="kp-division-detail__meta"><IconUsers size={20} stroke={1.5} aria-hidden="true" /><span>Profil fungsi untuk informasi publik</span></div></div><div className="kp-division-detail__mark"><Image src={division.mark} alt={`Lambang ${division.name}`} fill sizes="(max-width: 700px) 160px, 250px" priority /></div></div><div className="kp-division-detail__body"><aside><span>Fokus peran</span><strong>{division.purpose}</strong></aside><section><p className="kp-eyebrow">Kontribusi {division.unitType.toLowerCase()}</p><h2>Peran {division.unitType.toLowerCase()} dalam mandat KPI.</h2><ul>{division.contributions.map((item) => <li key={item}><IconCheck size={18} aria-hidden="true" />{item}</li>)}</ul></section></div></section><section className="kp-org-note"><div className="kp-wrap"><p>Halaman ini menjelaskan fungsi {division.unitType.toLowerCase()}. Data personel, penugasan, dan proses internal tidak ditampilkan untuk publik.</p></div></section><section className="kp-wrap kp-org-cta"><div><p className="kp-eyebrow">Lanjutkan</p><h2>Kenali struktur kerja KPI.</h2><p>Lihat kedudukan unit kerja dalam peta organisasi publik.</p></div><Link className="kp-button kp-button--red" href="/publik/struktur">Lihat struktur organisasi <IconArrowRight size={18} aria-hidden="true" /></Link></section><PublicFooter /></div>;
}
