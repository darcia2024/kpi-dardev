import type { Metadata } from "next";
import Link from "next/link";
import { IconBook2, IconCheck, IconScale, IconSearch, IconShieldCheck } from "@tabler/icons-react";
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
          
          <h1 id="about-title">About KPI <span>PPMI Egypt</span></h1>
          <p className="kp-public-lead">The Interaction Care Commission (Komisi Peduli Interaksi) is a semi-autonomous body of PPMI Egypt, the association of Indonesian students in Egypt. It carries out prevention, education, oversight, receipt of information, and handling of interaction issues according to the organisation&apos;s mandate.</p>
          <div className="kp-public-actions"><Link className="kp-public-button kp-public-button--red" href="/en/divisions">Our divisions</Link><Link className="kp-public-button kp-public-button--quiet" href="/en/services">Public services</Link></div>
        </div>
      </div>
      <div className="kp-public-wrap kp-public-facts" aria-label="KPI at a glance"><div><span>Position</span><strong>Semi-autonomous body of PPMI Egypt</strong></div><div><span>Field of work</span><strong>Interaction · social · norms · ethics</strong></div><div><span>Character</span><strong>Professional · accountable · non-profit</strong></div></div>
    </section>

    <section className="kp-public-wrap kp-public-section kp-public-context" aria-labelledby="context-title">
      <div><h2 id="context-title">Background</h2></div>
      <div className="kp-public-context__copy"><p>Shared life among Indonesian students in Egypt brings together many backgrounds, characters, and interests. KPI helps maintain good interaction within PPMI Egypt through education, oversight, and mechanisms for receiving and handling issues.</p><p>KPI works according to the organisation&apos;s rules, respects everyone&apos;s rights, keeps its functional independence, and is accountable for every process.</p><Link className="kp-public-button kp-public-button--quiet" href="/en/divisions">Meet the divisions</Link></div>
    </section>

    <section className="kp-public-mandate" aria-labelledby="pillars-title"><div className="kp-public-wrap kp-public-section"><div className="kp-public-section-head"><div><h2 id="pillars-title">What KPI is responsible for</h2></div></div><div className="kp-public-pillar-grid">{pillarsEn.map((pillar, index) => { const Icon = pillarIcons[index]; return <article className="kp-public-pillar" key={pillar.label}><div><Icon size={28} stroke={1.5} aria-hidden="true" /></div><h3>{pillar.label}</h3><p>{pillar.text}</p></article>; })}</div></div></section>

    <section className="kp-public-vision" aria-labelledby="vision-title"><div className="kp-public-wrap kp-public-section kp-public-vision__grid"><div><h2 id="vision-title">Vision and mission</h2><p className="kp-public-vision__lead">Professional, principled, independent, and sustainable. To foster patterns of interaction and social life among Indonesian students in Egypt grounded in Islamic values and the common good.</p></div><div className="kp-public-missions"><span>Our mission</span>{missionsEn.map((mission) => <div key={mission}><IconCheck size={18} aria-hidden="true" /><p>{mission}</p></div>)}</div></div></section>

    <section className="kp-public-wrap kp-public-next" aria-labelledby="next-title"><div><h2 id="next-title">Related pages</h2></div><div className="kp-public-next__links"><Link href="/en/publications"><span><IconBook2 size={22} stroke={1.6} aria-hidden="true" /><span><strong>Publications</strong></span></span></Link><Link href="/en/search"><span><IconSearch size={22} stroke={1.6} aria-hidden="true" /><span><strong>Search the site</strong></span></span></Link></div></section>

    <PublicFooter locale="en" />
  </div>;
}
