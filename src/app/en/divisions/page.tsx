import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PublicFooter } from "@/components/public/public-footer";
import { divisionsEn } from "@/lib/public-en";
import { publicDivisions } from "@/lib/public-organization";

export const metadata: Metadata = { title: "Divisions | KPI PPMI Egypt", description: "Three divisions and one subdivision that support KPI's mandate.", alternates: { languages: { id: "/publik/divisi", en: "/en/divisions" } } };

export default function EnglishDivisionsPage(): React.JSX.Element {
  return <div className="kp-site kp-organization-page" lang="en">
    <section className="kp-org-hero kp-org-hero--compact" aria-labelledby="divisions-title"><div className="kp-wrap"><p className="kp-en-note">English preview. This translation is pending review by KPI.</p><h1 id="divisions-title">Divisions and subdivision</h1><p>Media and Publication is a subdivision under Prevention and Education. Together, these four units carry out KPI&apos;s mandate for Indonesian students in Egypt.</p></div></section>
    <section className="kp-wrap kp-division-directory" aria-label="Division and subdivision profiles">{publicDivisions.map((division, index) => <article key={division.slug}><div className="kp-division-directory__identity"><Image src={division.mark} alt={`${division.englishName} emblem`} width={116} height={126} /></div><div><p>{divisionsEn[division.slug].unitType}</p><h2>{division.englishName}</h2><p>{divisionsEn[division.slug].summary}</p></div><Link href={`/en/divisions/${division.slug}`}>View profile</Link></article>)}</section>
    <PublicFooter locale="en" />
  </div>;
}
