import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconArrowRight, IconCheck, IconUsers } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";
import { divisionsEn } from "@/lib/public-en";
import { findPublicDivision, publicDivisions } from "@/lib/public-organization";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams(): Array<{ slug: string }> { return publicDivisions.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const division = findPublicDivision(slug);
  return division ? { title: `${division.englishName} | KPI PPMI Egypt`, description: divisionsEn[slug].summary, alternates: { languages: { id: `/publik/divisi/${slug}`, en: `/en/divisions/${slug}` } } } : { title: "Division | KPI PPMI Egypt" };
}

export default async function EnglishDivisionPage({ params }: Props): Promise<React.JSX.Element> {
  const division = findPublicDivision((await params).slug);
  if (!division) notFound();
  const english = divisionsEn[division.slug];
  const unit = english.unitType.toLowerCase();
  return <div className="kp-site kp-organization-page" lang="en">
    <section className="kp-wrap kp-division-detail" aria-labelledby="division-title">
      <Link className="kp-org-back" href="/en/divisions"><IconArrowLeft size={18} aria-hidden="true" /> All units</Link>
      <div className="kp-division-detail__hero"><div><p className="kp-eyebrow">{english.unitType} · {division.name}</p><h1 id="division-title">{division.englishName}</h1><p>{english.summary}</p><div className="kp-division-detail__meta"><IconUsers size={20} stroke={1.5} aria-hidden="true" /><span>Public profile of this unit&apos;s function</span></div></div><div className="kp-division-detail__mark"><Image src={division.mark} alt={`${division.englishName} emblem`} fill sizes="(max-width: 700px) 160px, 250px" priority /></div></div>
      <div className="kp-division-detail__body"><aside><span>Focus of the role</span><strong>{english.purpose}</strong></aside><section><p className="kp-eyebrow">What this {unit} contributes</p><h2>The {unit}&apos;s role in KPI&apos;s mandate.</h2><ul>{english.contributions.map((item) => <li key={item}><IconCheck size={18} aria-hidden="true" />{item}</li>)}</ul></section></div>
    </section>
    <section className="kp-org-note"><div className="kp-wrap"><p>This page describes the {unit}&apos;s function. Personnel data, assignments, and internal processes are not shown to the public. English preview pending review by KPI.</p></div></section>
    <section className="kp-wrap kp-org-cta"><div><p className="kp-eyebrow">Continue</p><h2>Explore KPI&apos;s other units.</h2><p>See how the divisions and the subdivision work together.</p></div><Link className="kp-button kp-button--red" href="/en/divisions">All divisions <IconArrowRight size={18} aria-hidden="true" /></Link></section>
    <PublicFooter locale="en" />
  </div>;
}
