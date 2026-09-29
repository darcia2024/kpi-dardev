import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconBook2, IconFileText, IconMessageCircle, IconShieldCheck } from "@tabler/icons-react";
import { PublicationCatalog } from "@/components/public/publication-catalog";
import { PublicFooter } from "@/components/public/public-footer";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { examplePublication } from "@/lib/example-publication";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";


export const metadata: Metadata = {
  title: "Publikasi & Edukasi | KPI PPMI Mesir",
  description: "Materi publik KPI PPMI Mesir tentang edukasi interaksi, pencegahan, dan prinsip penanganan sesuai mandat organisasi."
};

export const dynamic = "force-dynamic";

export default async function PublicationsPage(): Promise<React.JSX.Element> {
  const localPreview = isTestAuthEnabled();
  const published = localPreview ? await getLocalContentRepository().listPublished() : [];
  const publications = localPreview ? (published.length ? published : [examplePublication]) : [];
  return <div className="kp-site kp-library">
    <section className="kp-library-hero" aria-labelledby="library-title">
      <div className="kp-wrap kp-library-hero__inner">
        <p className="kp-eyebrow"><span /> Ruang pengetahuan KPI</p>
        <h1 id="library-title">Pahami interaksi.<br /><em>Kenali peran KPI.</em></h1>
        <p>Jelajahi materi tentang norma interaksi, pencegahan persoalan, hak setiap pihak, dan cara KPI bekerja sesuai mandat organisasi.</p>
        <div className="kp-library-hero__actions"><a className="kp-button kp-button--red" href="#koleksi">Jelajahi koleksi <IconArrowRight size={18} aria-hidden="true" /></a><Link className="kp-button kp-button--outline" href="/publik">Tentang KPI <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
      </div>
      <div className="kp-wrap kp-library-ribbon" aria-label="Cakupan materi publik"><span><IconBook2 size={20} aria-hidden="true" /> Edukasi interaksi</span><span><IconShieldCheck size={20} aria-hidden="true" /> Prinsip perlindungan</span><span><IconFileText size={20} aria-hidden="true" /> Panduan yang jelas</span></div>
    </section>

    <section className="kp-wrap kp-library-feature" aria-labelledby="featured-title">
      <div className="kp-library-feature__copy"><p className="kp-eyebrow">Pilihan utama</p><h2 id="featured-title">Mandat yang jelas.<br />Proses yang adil.</h2><p>Kenali peran KPI dalam pencegahan, pengawasan, dan penanganan persoalan interaksi, beserta prinsip yang membatasi setiap kewenangan.</p><Link className="kp-text-link" href="/publik">Baca profil dan mandat KPI <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
      <div className="kp-library-feature__visual" aria-hidden="true"><div className="kp-library-book"><div><Image src="/brand/kpi-ppmi-mesir-logo.png" alt="" width={46} height={46} /><span>KPI PPMI Mesir</span></div><strong>Peduli.<br />Pahami.<br />Hormati.</strong><small>Ringkasan pedoman<br />Komisi Peduli Interaksi</small></div><div className="kp-library-note"><IconShieldCheck size={26} stroke={1.5} /><span>Martabat dan hak setiap pihak menjadi bagian dari setiap proses.</span></div></div>
    </section>

    <section className="kp-library-catalog" id="koleksi" aria-labelledby="catalog-title"><div className="kp-wrap"><div className="kp-library-section-head"><div><p className="kp-eyebrow">Koleksi publik</p><h2 id="catalog-title">Baca sesuai kebutuhanmu.</h2></div><p>{localPreview ? "Koleksi ini memuat konten contoh untuk meninjau tampilan dan alur baca. Publikasi resmi akan tampil setelah persetujuan KPI." : "Publikasi resmi akan tampil setelah proses editorial dan persetujuan KPI selesai."}</p></div>{publications.length ? <PublicationCatalog publications={publications} /> : <p>Belum ada publikasi resmi yang tersedia.</p>}</div></section>

    <section className="kp-wrap kp-library-contact"><div><p className="kp-eyebrow">Ruang penyampaian</p><h2>Ada hal yang ingin disampaikan?</h2><p>Pelajari alur aspirasi lebih dulu agar informasi dapat diterima dengan jelas dan bertanggung jawab.</p></div><Link className="kp-button kp-button--white" href="/publik/aspirasi">Lihat alur aspirasi <IconMessageCircle size={18} aria-hidden="true" /></Link></section>

    <PublicFooter />
  </div>;
}
