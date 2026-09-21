import Link from "next/link";
import { IconArrowUpRight, IconBook2, IconMessageCircle, IconScale, IconShieldCheck } from "@tabler/icons-react";

const pillars = [
  { icon: IconBook2, label: "Pencegahan", title: "Membangun pemahaman sebelum masalah berkembang.", text: "Pendidikan interaksi, diskusi, kajian, dan publikasi membantu Masisir mengenali nilai, norma, serta etika dalam kehidupan bersama." },
  { icon: IconScale, label: "Penanganan", title: "Menelaah informasi dengan objektif.", text: "Laporan dan pengaduan diproses secara proporsional, hati-hati, dan sesuai mandat serta kewenangan KPI." },
  { icon: IconShieldCheck, label: "Perlindungan", title: "Menjaga martabat dan kerahasiaan.", text: "Hak, privasi, keamanan, dan kerahasiaan pihak terkait menjadi bagian dari setiap proses yang dijalankan." }
];

export default function PublicHomePage(): React.JSX.Element {
  return (
    <div className="public-shell about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero__main"><p className="eyebrow">Tentang KPI · PPMI Mesir</p><h1 id="about-title">Menjaga kualitas interaksi Masisir dengan cara yang berintegritas.</h1><p className="about-hero__lead">Komisi Peduli Interaksi adalah Badan Semi Otonom PPMI Mesir yang bergerak dalam bidang interaksi, sosial, norma, dan etika mahasiswa serta pelajar Indonesia di Mesir.</p><div className="intro-panel__actions"><Link className="button button--primary" href="/publik/publikasi">Lihat edukasi <IconArrowUpRight aria-hidden="true" className="button-icon" size={17} stroke={1.9} /></Link><Link className="button button--quiet" href="/publik/aspirasi">Sampaikan aspirasi <IconMessageCircle aria-hidden="true" className="button-icon" size={17} stroke={1.9} /></Link></div></div>
        <aside className="about-hero__facts" aria-label="Ringkasan KPI"><div><span>Kedudukan</span><strong>BSO PPMI Mesir</strong></div><div><span>Ruang kerja</span><strong>Interaksi · sosial · norma · etika</strong></div><div><span>Sifat</span><strong>Profesional · akuntabel · nonprofit</strong></div></aside>
      </section>

      <section className="about-context" aria-labelledby="context-title"><div className="section-heading"><p className="eyebrow">Mengapa KPI hadir</p><h2 id="context-title">Interaksi yang sehat membutuhkan ruang yang jelas.</h2></div><div className="about-context__body"><p>Kehidupan bersama Masisir mempertemukan banyak latar belakang, karakter, dan kepentingan. KPI hadir sebagai ikhtiar kelembagaan agar pencegahan, pengawasan, dan penanganan persoalan interaksi dapat berjalan lebih terstruktur, objektif, dan berkelanjutan.</p><p>Mandat ini dijalankan dengan menghormati martabat dan hak setiap orang, menjaga independensi fungsional, serta memastikan setiap proses memiliki dasar dan prosedur yang dapat dipertanggungjawabkan.</p></div></section>

      <section className="about-pillars" aria-labelledby="pillars-title"><div className="section-heading"><p className="eyebrow">Mandat KPI</p><h2 id="pillars-title">Tiga cara kami menjalankan amanah.</h2></div><div className="about-pillars__grid">{pillars.map((pillar) => <article className="about-pillar" key={pillar.label}><pillar.icon aria-hidden="true" className="about-pillar__icon" size={25} stroke={1.7} /><p className="about-pillar__label">{pillar.label}</p><h3>{pillar.title}</h3><p>{pillar.text}</p></article>)}</div></section>

      <section className="about-vision" aria-labelledby="vision-title"><div><p className="eyebrow">Visi KPI</p><h2 id="vision-title">Profesional, berintegritas, independen secara fungsional, dan berkelanjutan.</h2></div><div className="about-vision__copy"><p>Menumbuhkan pola interaksi dan kehidupan sosial Masisir yang berlandaskan nilai-nilai Islam serta kemaslahatan bersama.</p><p className="about-vision__label">Misi kami</p><ul><li>Meningkatkan kualitas pencegahan dan edukasi.</li><li>Menangani permasalahan secara objektif, proporsional, dan sesuai prosedur.</li><li>Memperkuat koordinasi dengan PPMI, kekeluargaan, WIHDAH, dan lembaga terkait.</li><li>Menjaga kerahasiaan, martabat, dan hak setiap pihak.</li></ul></div></section>

      <section className="about-next" aria-labelledby="next-title"><div><p className="eyebrow">Lanjutkan</p><h2 id="next-title">Pilih ruang yang Anda butuhkan.</h2></div><div className="about-next__links"><Link href="/publik/publikasi"><span><IconBook2 aria-hidden="true" size={19} stroke={1.8} /><strong>Publikasi & edukasi</strong></span><IconArrowUpRight aria-hidden="true" size={19} stroke={1.8} /></Link><Link href="/publik/aspirasi"><span><IconMessageCircle aria-hidden="true" size={19} stroke={1.8} /><strong>Laporan & pengaduan</strong></span><IconArrowUpRight aria-hidden="true" size={19} stroke={1.8} /></Link></div></section>
      <footer className="site-footer"><span>KPI PPMI Mesir</span><span>Informasi publik · Mandat · Aspirasi</span></footer>
    </div>
  );
}
