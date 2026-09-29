import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconBook2, IconCheck, IconHeartHandshake, IconMessageCircle, IconScale, IconShieldCheck } from "@tabler/icons-react";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { PublicFooter } from "@/components/public/public-footer";
import { publicDocumentation as documentation } from "@/lib/public-content";


const pillars = [
  { icon: IconBook2, label: "Pencegahan & edukasi", title: "Membantu Masisir memahami batas dan tanggung jawab.", text: "Pendidikan interaksi, diskusi, kajian, dan publikasi membantu membangun kebiasaan yang menghormati sesama." },
  { icon: IconScale, label: "Pengawasan & informasi", title: "Mengenali persoalan sebelum mengambil langkah.", text: "KPI mengawasi persoalan interaksi dan menerima informasi untuk diperiksa konteks serta kesesuaiannya dengan mandat organisasi." },
  { icon: IconShieldCheck, label: "Penanganan", title: "Bertindak sesuai prosedur dan kewenangan.", text: "Persoalan ditangani secara objektif dan proporsional dengan menjaga kerahasiaan, hak, serta martabat pihak terkait." }
];

const missions = [
  "Meningkatkan kualitas pencegahan dan edukasi.",
  "Menangani permasalahan secara objektif, proporsional, dan sesuai prosedur.",
  "Memperkuat koordinasi dengan PPMI, kekeluargaan, WIHDAH, dan lembaga terkait.",
  "Menjaga kerahasiaan, martabat, dan hak setiap pihak."
];


export default function PublicHomePage(): React.JSX.Element {
  return <div className="kp-public-page">
    <section className="kp-public-hero" aria-labelledby="about-title">
      <div className="kp-public-wrap kp-public-hero__grid">
        <div className="kp-public-hero__copy">
          <p className="kp-public-eyebrow"><span /> Tentang KPI · PPMI Mesir</p>
          <h1 id="about-title">Menjaga interaksi.<br /><span>Bertindak sesuai mandat.</span></h1>
          <p className="kp-public-lead">Komisi Peduli Interaksi adalah Badan Semi Otonom PPMI Mesir yang menjalankan pencegahan, edukasi, pengawasan, penerimaan informasi, dan penanganan persoalan interaksi sesuai mandat organisasi.</p>
          <div className="kp-public-actions"><Link className="kp-public-button kp-public-button--red" href="/publik/struktur">Lihat struktur <IconArrowRight size={18} aria-hidden="true" /></Link><Link className="kp-public-button kp-public-button--quiet" href="/publik/divisi">Profil divisi <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
        <aside className="kp-public-manifesto" aria-label="Arah kerja KPI">
          <div className="kp-public-manifesto__brand"><Image src="/brand/kpi-ppmi-mesir-logo.png" alt="" width={46} height={46} /><span>Komisi Peduli Interaksi<br />PPMI Mesir</span></div>
          <IconHeartHandshake className="kp-public-manifesto__icon" size={76} stroke={1} aria-hidden="true" />
          <p>Setiap pihak berhak didengar, dipahami, dan diperlakukan dengan hormat.</p>
          <small>Menjaga interaksi · Melindungi martabat</small>
        </aside>
      </div>
      <div className="kp-public-wrap kp-public-facts" aria-label="Ringkasan KPI"><div><span>Kedudukan</span><strong>BSO PPMI Mesir</strong></div><div><span>Ruang kerja</span><strong>Interaksi · sosial · norma · etika</strong></div><div><span>Karakter</span><strong>Profesional · akuntabel · nonprofit</strong></div></div>
    </section>

    <section className="kp-public-wrap kp-public-section kp-public-context" aria-labelledby="context-title">
      <div><p className="kp-public-eyebrow">01 / Mengapa KPI hadir</p><h2 id="context-title">Interaksi yang sehat membutuhkan ruang yang jelas.</h2></div>
      <div className="kp-public-context__copy"><p>Kehidupan bersama Masisir mempertemukan banyak latar belakang, karakter, dan kepentingan. KPI membantu menjaga tata interaksi di lingkungan PPMI Mesir melalui pendidikan, pengawasan, serta mekanisme penerimaan dan penanganan persoalan.</p><p>Mandat tersebut memiliki batas. KPI bekerja sesuai ketentuan organisasi, menghormati hak setiap orang, menjaga independensi fungsional, dan mempertanggungjawabkan setiap proses.</p><Link className="kp-public-button kp-public-button--quiet" href="/publik/divisi">Kenali divisi & subbidang <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </section>

    <section className="kp-public-mandate" aria-labelledby="pillars-title"><div className="kp-public-wrap kp-public-section"><div className="kp-public-section-head"><div><p className="kp-public-eyebrow">02 / Mandat KPI</p><h2 id="pillars-title">Mandat yang jelas.<br />Proses yang bertanggung jawab.</h2></div><p>Pendidikan, pengawasan, penerimaan informasi, dan penanganan saling melengkapi dalam ruang kewenangan KPI.</p></div><div className="kp-public-pillar-grid">{pillars.map((pillar, index) => <article className="kp-public-pillar" key={pillar.label}><div><pillar.icon size={28} stroke={1.5} aria-hidden="true" /><span>0{index + 1}</span></div><p className="kp-public-pillar__label">{pillar.label}</p><h3>{pillar.title}</h3><p>{pillar.text}</p></article>)}</div></div></section>

    <section className="kp-public-gallery-section kp-public-section" aria-labelledby="gallery-title">
      <div className="kp-public-wrap">
        <div className="kp-public-gallery-head"><div><p className="kp-public-eyebrow">03 / Dokumentasi kegiatan</p><h2 id="gallery-title">Kepedulian tumbuh<br />melalui perjumpaan.</h2></div><p>Potret ruang dialog, pembelajaran, koordinasi, dan kebersamaan yang menghidupkan kerja KPI di tengah Masisir.</p></div>
        <PhotoGallery photos={documentation} />
      </div>
    </section>

    <section className="kp-public-vision" aria-labelledby="vision-title"><div className="kp-public-wrap kp-public-section kp-public-vision__grid"><div><p className="kp-public-eyebrow">04 / Visi KPI</p><h2 id="vision-title">Profesional, berintegritas, independen, dan berkelanjutan.</h2><p className="kp-public-vision__lead">Menumbuhkan pola interaksi dan kehidupan sosial Masisir yang berlandaskan nilai-nilai Islam serta kemaslahatan bersama.</p></div><div className="kp-public-missions"><span>Misi kami</span>{missions.map((mission) => <div key={mission}><IconCheck size={18} aria-hidden="true" /><p>{mission}</p></div>)}</div></div></section>

    <section className="kp-public-wrap kp-public-next" aria-labelledby="next-title"><div><p className="kp-public-eyebrow">Lanjutkan</p><h2 id="next-title">Pilih ruang yang Anda butuhkan.</h2><p>Pelajari materi edukasi atau pahami cara menyampaikan aspirasi dengan bertanggung jawab.</p></div><div className="kp-public-next__links"><Link href="/publik/publikasi"><span><IconBook2 size={22} stroke={1.6} aria-hidden="true" /><span><small>Pengetahuan publik</small><strong>Publikasi & edukasi</strong></span></span><IconArrowUpRight size={20} aria-hidden="true" /></Link><Link href="/publik/aspirasi"><span><IconMessageCircle size={22} stroke={1.6} aria-hidden="true" /><span><small>Sebelum menyampaikan</small><strong>Alur aspirasi</strong></span></span><IconArrowUpRight size={20} aria-hidden="true" /></Link></div></section>

    <PublicFooter />
  </div>;
}
