import type { Metadata } from "next";
import { publishDueContent } from "@/platform/content/scheduled-publishing";
import Link from "next/link";
import { PublicationCatalog } from "@/components/public/publication-catalog";
import { PublicFooter } from "@/components/public/public-footer";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { examplePublication } from "@/lib/example-publication";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";
import {getHostedAuthConfiguration} from "@/platform/identity/hosted-auth";
import {hostedPublications} from "@/platform/content/hosted-publications";


export const metadata: Metadata = {
  title: "Publikasi & Edukasi | KPI PPMI Mesir",
  description: "Materi publik KPI PPMI Mesir tentang edukasi interaksi, pencegahan, dan prinsip penanganan sesuai mandat organisasi.", alternates: { languages: { id: "/publik/publikasi", en: "/en/publications" } }
};

export const dynamic = "force-dynamic";

export default async function PublicationsPage(): Promise<React.JSX.Element> {
  const localPreview = isTestAuthEnabled();
  const published = localPreview ? await publishDueContent(getLocalContentRepository()).then((repository) => repository.listPublished()) : [];
  // CMS records store a generic href; each published article has its own page by slug.
  const articles = published.map((record) => ({ ...record, href: `/publik/publikasi/${record.slug}` }));
  const publications = localPreview ? (articles.length ? articles : [examplePublication]) : getHostedAuthConfiguration() ? await hostedPublications("id") : [];
  return <div className="kp-site kp-library">
    <section className="kp-library-hero" aria-labelledby="library-title">
      <div className="kp-wrap kp-library-hero__inner">
        
        <h1 id="library-title">Materi edukasi dan publikasi KPI</h1>
        <p>Materi tentang norma interaksi, pencegahan persoalan, hak setiap pihak, dan cara kerja KPI.</p>
              </div>
    </section>

    <section className="kp-library-catalog" id="koleksi" aria-labelledby="catalog-title"><div className="kp-wrap"><div className="kp-library-section-head"><div><h2 id="catalog-title">Semua materi</h2></div><p>{localPreview ? "Koleksi ini memuat konten contoh untuk meninjau tampilan dan alur baca. Publikasi resmi akan tampil setelah persetujuan KPI." : "Publikasi resmi akan tampil setelah proses editorial dan persetujuan KPI selesai."}</p></div>{publications.length ? <PublicationCatalog publications={publications} /> : <p>Belum ada publikasi resmi yang tersedia.</p>}</div></section>

    <section className="kp-wrap kp-library-contact"><div><h2>Ada hal yang ingin disampaikan?</h2><p>Baca alur aspirasi lebih dulu.</p></div><Link className="kp-button kp-button--white" href="/publik/aspirasi">Lihat alur aspirasi</Link></section>

    <PublicFooter />
  </div>;
}
