import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowUpRight, IconLanguage, IconShieldCheck } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";
import { servicesEn } from "@/lib/public-en";

export const metadata: Metadata = { title: "Public services | KPI PPMI Egypt", description: "A directory of KPI's public information: mandate, divisions, education, activities, and the aspiration flow.", alternates: { languages: { id: "/publik/layanan", en: "/en/services" } } };

export default function EnglishServicesPage(): React.JSX.Element {
  return <div className="kp-site kp-service-page" lang="en">
    <section className="kp-service-hero" aria-labelledby="service-title"><div className="kp-wrap"><p className="kp-en-note">English preview. This translation is pending review by KPI.</p><p className="kp-eyebrow"><span /> Public services</p><h1 id="service-title">KPI information,<br /><em>for what you need.</em></h1><p>Find explanations of KPI&apos;s mandate and divisions, educational material, activity documentation, and guidance on sharing aspirations and complaints.</p></div></section>
    <section className="kp-wrap kp-service-directory" aria-labelledby="directory-title"><div className="kp-service-directory__head"><div><p className="kp-eyebrow">Information directory</p><h2 id="directory-title">Choose a topic.</h2></div><p>Pages marked “Indonesian” are only available in Bahasa Indonesia for now, including the aspiration and complaint flows. Internal documents and personal data are never listed here.</p></div>
      <div className="kp-service-grid">{servicesEn.map((service, index) => <Link href={service.href} hrefLang={service.english ? "en" : "id"} key={service.title}><div><span>0{index + 1}</span>{service.english ? null : <IconLanguage size={22} stroke={1.45} aria-hidden="true" />}</div><p>{service.category}{service.english ? "" : " · Indonesian"}</p><strong>{service.title}</strong><small>{service.description}</small><IconArrowUpRight className="kp-service-grid__arrow" size={20} aria-hidden="true" /></Link>)}</div>
    </section>
    <section className="kp-wrap kp-service-safe"><IconShieldCheck size={30} stroke={1.4} aria-hidden="true" /><div><p className="kp-eyebrow">A safe public space</p><h2>Clear information, with boundaries kept.</h2><p>Public pages contain material and documentation that can be shared. Internal details, personal data, and handling processes are only shown with the proper basis and approval.</p></div></section>
    <PublicFooter locale="en" />
  </div>;
}
