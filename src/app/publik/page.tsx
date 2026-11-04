import Link from "next/link";
import { IconBook2, IconCheck, IconMessageCircle, IconScale, IconShieldCheck } from "@tabler/icons-react";
import { PhotoGallery } from "@/components/public/photo-gallery";
import { PublicFooter } from "@/components/public/public-footer";
import { publicDocumentation as documentation } from "@/lib/public-content";


const pillars = [
  { icon: IconBook2, label: "Pencegahan & edukasi", text: "Pendidikan interaksi, diskusi, kajian, dan publikasi membantu membangun kebiasaan yang menghormati sesama." },
  { icon: IconScale, label: "Pengawasan & informasi", text: "KPI mengawasi persoalan interaksi dan menerima informasi untuk diperiksa konteks serta kesesuaiannya dengan mandat organisasi." },
  { icon: IconShieldCheck, label: "Penanganan", text: "Persoalan ditangani secara objektif dan proporsional dengan menjaga kerahasiaan, hak, serta martabat pihak terkait." }
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
          
          <h1 id="about-title">Tentang KPI <span>PPMI Mesir</span></h1>
          <p className="kp-public-lead">Komisi Peduli Interaksi adalah Badan Semi Otonom PPMI Mesir yang menjalankan pencegahan, edukasi, pengawasan, penerimaan informasi, dan penanganan persoalan interaksi sesuai mandat organisasi.</p>
          <div className="kp-public-actions"><Link className="kp-public-button kp-public-button--red" href="/publik/struktur">Lihat struktur</Link><Link className="kp-public-button kp-public-button--quiet" href="/publik/divisi">Profil divisi</Link></div>
        </div>
      </div>
      <div className="kp-public-wrap kp-public-facts" aria-label="Ringkasan KPI"><div><span>Kedudukan</span><strong>BSO PPMI Mesir</strong></div><div><span>Ruang kerja</span><strong>Interaksi · sosial · norma · etika</strong></div><div><span>Karakter</span><strong>Profesional · akuntabel · nonprofit</strong></div></div>
    </section>

    <section className="kp-public-wrap kp-public-section kp-public-context" aria-labelledby="context-title">
      <div><h2 id="context-title">Latar belakang</h2></div>
      <div className="kp-public-context__copy"><p>Kehidupan bersama Masisir mempertemukan banyak latar belakang, karakter, dan kepentingan. KPI membantu menjaga tata interaksi di lingkungan PPMI Mesir melalui pendidikan, pengawasan, serta mekanisme penerimaan dan penanganan persoalan.</p><p>KPI bekerja sesuai ketentuan organisasi, menghormati hak setiap orang, menjaga independensi fungsional, dan mempertanggungjawabkan setiap proses.</p><Link className="kp-public-button kp-public-button--quiet" href="/publik/divisi">Kenali divisi & subbidang</Link></div>
    </section>

    <section className="kp-public-mandate" aria-labelledby="pillars-title"><div className="kp-public-wrap kp-public-section"><div className="kp-public-section-head"><div><h2 id="pillars-title">Yang menjadi wewenang KPI</h2></div></div><div className="kp-public-pillar-grid">{pillars.map((pillar, index) => <article className="kp-public-pillar" key={pillar.label}><div><pillar.icon size={28} stroke={1.5} aria-hidden="true" /></div><h3>{pillar.label}</h3><p>{pillar.text}</p></article>)}</div></div></section>

    <section className="kp-public-gallery-section kp-public-section" aria-labelledby="gallery-title">
      <div className="kp-public-wrap">
        <div className="kp-public-gallery-head"><div><h2 id="gallery-title">Foto kegiatan KPI</h2></div></div>
        <PhotoGallery photos={documentation} />
      </div>
    </section>

    <section className="kp-public-vision" aria-labelledby="vision-title"><div className="kp-public-wrap kp-public-section kp-public-vision__grid"><div><h2 id="vision-title">Visi dan misi</h2><p className="kp-public-vision__lead">Profesional, berintegritas, independen, dan berkelanjutan. Menumbuhkan pola interaksi dan kehidupan sosial Masisir yang berlandaskan nilai-nilai Islam serta kemaslahatan bersama.</p></div><div className="kp-public-missions"><span>Misi kami</span>{missions.map((mission) => <div key={mission}><IconCheck size={18} aria-hidden="true" /><p>{mission}</p></div>)}</div></div></section>

    <section className="kp-public-wrap kp-public-next" aria-labelledby="next-title"><div><h2 id="next-title">Halaman terkait</h2></div><div className="kp-public-next__links"><Link href="/publik/publikasi"><span><IconBook2 size={22} stroke={1.6} aria-hidden="true" /><span><strong>Publikasi & edukasi</strong></span></span></Link><Link href="/publik/aspirasi"><span><IconMessageCircle size={22} stroke={1.6} aria-hidden="true" /><span><strong>Alur aspirasi</strong></span></span></Link></div></section>

    <PublicFooter />
  </div>;
}
