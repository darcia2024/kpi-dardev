import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconBook2, IconCheck, IconHeartHandshake, IconScale, IconSearch, IconShieldCheck } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";
import { missionsEn, pillarsEn } from "@/lib/public-en";

export const metadata: Metadata = {
  title: "About KPI | KPI PPMI Egypt",
  description: "The Interaction Care Commission (KPI) is a semi-autonomous body of PPMI Egypt working on prevention, education, oversight, and handling of interaction issues.",
  alternates: { languages: { id: "/publik", en: "/en" } }
};

const pillarIcons = [IconBook2, IconScale, IconShieldCheck];

export default function EnglishHomePage(): React.JSX.Element {
  return <div className="kp-public-page" lang="en">
    <section className="kp-public-hero" aria-labelledby="about-title">
      <div className="kp-public-wrap kp-public-hero__grid">
        <div className="kp-public-hero__copy">
          <p className="kp-en-note">English preview. This translation is pending review by KPI; the Indonesian version remains the reference.</p>
          <p className="kp-public-eyebrow"><span /> About KPI · PPMI Egypt</p>
          <h1 id="about-title">Safeguarding interaction.<br /><span>Acting within our mandate.</span></h1>
          <p className="kp-public-lead">The Interaction Care Commission (Komisi Peduli Interaksi) is a semi-autonomous body of PPMI Egypt, the association of Indonesian students in Egypt. It carries out prevention, education, oversight, receipt of information, and handling of interaction issues according to the organisation&apos;s mandate.</p>
          <div className="kp-public-actions"><Link className="kp-public-button kp-public-button--red" href="/en/divisions">Our divisions <IconArrowRight size={18} aria-hidden="true" /></Link><Link className="kp-public-button kp-public-button--quiet" href="/en/services">Public services <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
        <aside className="kp-public-manifesto" aria-label="How KPI works">
          <div className="kp-public-manifesto__brand"><Image src="/brand/kpi-ppmi-mesir-logo.png" alt="" width={46} height={46} /><span>Interaction Care Commission<br />PPMI Egypt</span></div>
          <IconHeartHandshake className="kp-public-manifesto__icon" size={76} stroke={1} aria-hidden="true" />
          <p>Everyone deserves to be heard, understood, and treated with respect.</p>
          <small>Safeguarding interaction · Protecting dignity</small>
        </aside>
      </div>
      <div className="kp-public-wrap kp-public-facts" aria-label="KPI at a glance"><div><span>Position</span><strong>Semi-autonomous body of PPMI Egypt</strong></div><div><span>Field of work</span><strong>Interaction · social · norms · ethics</strong></div><div><span>Character</span><strong>Professional · accountable · non-profit</strong></div></div>
    </section>

    <section className="kp-public-wrap kp-public-section kp-public-context" aria-labelledby="context-title">
      <div><p className="kp-public-eyebrow">01 / Why KPI exists</p><h2 id="context-title">Healthy interaction needs clear space.</h2></div>
      <div className="kp-public-context__copy"><p>Shared life among Indonesian students in Egypt brings together many backgrounds, characters, and interests. KPI helps maintain good interaction within PPMI Egypt through education, oversight, and mechanisms for receiving and handling issues.</p><p>That mandate has limits. KPI works according to the organisation&apos;s rules, respects everyone&apos;s rights, keeps its functional independence, and is accountable for every process.</p><Link className="kp-public-button kp-public-button--quiet" href="/en/divisions">Meet the divisions <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </section>

    <section className="kp-public-mandate" aria-labelledby="pillars-title"><div className="kp-public-wrap kp-public-section"><div className="kp-public-section-head"><div><p className="kp-public-eyebrow">02 / KPI&apos;s mandate</p><h2 id="pillars-title">A clear mandate.<br />A responsible process.</h2></div><p>Education, oversight, receiving information, and handling issues complement one another within KPI&apos;s authority.</p></div><div className="kp-public-pillar-grid">{pillarsEn.map((pillar, index) => { const Icon = pillarIcons[index]; return <article className="kp-public-pillar" key={pillar.label}><div><Icon size={28} stroke={1.5} aria-hidden="true" /><span>0{index + 1}</span></div><p className="kp-public-pillar__label">{pillar.label}</p><h3>{pillar.title}</h3><p>{pillar.text}</p></article>; })}</div></div></section>

    <section className="kp-public-vision" aria-labelledby="vision-title"><div className="kp-public-wrap kp-public-section kp-public-vision__grid"><div><p className="kp-public-eyebrow">03 / Vision</p><h2 id="vision-title">Professional, principled, independent, and sustainable.</h2><p className="kp-public-vision__lead">To foster patterns of interaction and social life among Indonesian students in Egypt grounded in Islamic values and the common good.</p></div><div className="kp-public-missions"><span>Our mission</span>{missionsEn.map((mission) => <div key={mission}><IconCheck size={18} aria-hidden="true" /><p>{mission}</p></div>)}</div></div></section>

    <section className="kp-public-wrap kp-public-next" aria-labelledby="next-title"><div><p className="kp-public-eyebrow">Continue</p><h2 id="next-title">Choose where to go next.</h2><p>Read educational material or look up the information you need.</p></div><div className="kp-public-next__links"><Link href="/en/publications"><span><IconBook2 size={22} stroke={1.6} aria-hidden="true" /><span><small>Public knowledge</small><strong>Publications</strong></span></span><IconArrowUpRight size={20} aria-hidden="true" /></Link><Link href="/en/search"><span><IconSearch size={22} stroke={1.6} aria-hidden="true" /><span><small>Find information</small><strong>Search the site</strong></span></span><IconArrowUpRight size={20} aria-hidden="true" /></Link></div></section>

    <PublicFooter locale="en" />
  </div>;
}
