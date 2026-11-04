import Image from "next/image";
import Link from "next/link";
import { IconBook2, IconScale, IconMessageCircle, IconPlus } from "@tabler/icons-react";
import { publicDivisions } from "@/lib/public-organization";

const responsibilities = [
  { icon: IconBook2, title: "Edukasi dan pencegahan", description: "Membantu Masisir memahami norma, etika, dan tanggung jawab dalam berinteraksi melalui pendidikan dan publikasi." },
  { icon: IconMessageCircle, title: "Pengawasan dan informasi", description: "Mengamati persoalan interaksi dan menerima informasi untuk diverifikasi sesuai lingkup kewenangan KPI." },
  { icon: IconScale, title: "Penanganan sesuai prosedur", description: "Menelaah dan menangani persoalan secara objektif dan proporsional, dengan menghormati hak setiap pihak." }
];
const steps = [
  ["Informasi diterima", "Laporan, pengaduan, atau informasi dari organisasi menjadi bahan awal untuk ditelaah."],
  ["Kejelasan diperiksa", "Verifikasi awal membantu memahami konteks dan menentukan kesesuaian dengan mandat KPI."],
  ["Ditangani sesuai prosedur", "Klarifikasi dan pemeriksaan dilakukan sesuai kebutuhan, kewenangan, serta hak pihak terkait."],
  ["Informasi dijaga", "Akses terhadap informasi terbatas diberikan sesuai kewenangan dan kebutuhan penanganan."]
];
const questions = [
  ["Apa itu KPI PPMI Mesir?", "Komisi Peduli Interaksi (KPI) merupakan Badan Semi Otonom PPMI Mesir. Sesuai mandat organisasi, KPI menjalankan pencegahan, edukasi, pengawasan, penerimaan informasi, dan penanganan persoalan interaksi di lingkungan PPMI Mesir."],
  ["Apakah KPI hanya menangani permasalahan?", "Tidak. Pencegahan dan pendidikan interaksi merupakan bagian penting dari mandat KPI. Bentuknya dapat berupa penyuluhan, diskusi, seminar, kajian, publikasi, dan kerja sama antarlembaga."],
  ["Apakah laporan yang diterima berarti pelanggaran sudah terbukti?", "Tidak. Informasi yang diterima merupakan bahan telaah. Kejelasan, konteks, dan kewenangan perlu diperiksa terlebih dahulu. Proses tetap memperhatikan objektivitas dan praduga tidak bersalah."],
  ["Bagaimana KPI memperlakukan informasi pribadi?", "Pedoman KPI mengatur perlindungan informasi dan pembatasan akses sesuai kewenangan. Kerahasiaan, keamanan, hak, dan martabat pihak terkait menjadi prinsip dalam setiap proses."],
  ["Apakah formulir aspirasi di situs ini sudah menerima laporan resmi?", "Belum. Halaman aspirasi saat ini menampilkan pratinjau alur pengiriman dan pelacakan. Penanganan nyata belum diaktifkan. Jangan mengirim informasi sensitif melalui formulir pratinjau."],
  ["Dengan siapa KPI berkoordinasi?", "KPI berkoordinasi dengan PPMI Mesir, organisasi kekeluargaan, WIHDAH, dan lembaga terkait sesuai kebutuhan dan kewenangan masing-masing. Koordinasi tetap memperhatikan independensi fungsional dan kerahasiaan."]
];
const principles = [
  ["Objektivitas", "Menelaah informasi berdasarkan kejelasan dan konteks, tanpa dipengaruhi kepentingan pribadi atau kelompok."],
  ["Proporsionalitas", "Menyesuaikan respons dengan tingkat persoalan, dampak, risiko, dan tujuan penanganan."],
  ["Kerahasiaan", "Membatasi akses terhadap informasi sesuai kewenangan, dengan memperhatikan keamanan pihak terkait."],
  ["Martabat manusia", "Menghormati hak, kehormatan, dan kepentingan setiap orang dalam seluruh proses."],
  ["Kepastian prosedur", "Menjalankan tugas melalui mekanisme yang jelas dan sesuai ketentuan organisasi."],
  ["Akuntabilitas", "Memastikan tindakan dan keputusan dapat dijelaskan serta dipertanggungjawabkan."]
];
export default function HomePage(): React.JSX.Element {
  return <div className="kp-site">
    <section className="kp-hero" aria-labelledby="page-title">
      <div className="kp-wrap kp-hero-top">
        <h1 id="page-title">Komisi Peduli Interaksi <span>PPMI Mesir</span></h1>
        <p className="kp-hero-lead">KPI adalah Badan Semi Otonom PPMI Mesir. Kami memberi edukasi, mengawasi, menerima informasi, dan menangani persoalan interaksi mahasiswa dan pelajar Indonesia di Mesir.</p>
        <div className="kp-actions"><Link className="kp-button kp-button--red" href="/publik">Tentang KPI</Link><Link className="kp-button kp-button--outline" href="/publik/layanan">Layanan dan informasi</Link></div>
      </div>
      <figure className="kp-wrap kp-hero-photo"><div><Image src="/images/kegiatan/forum-kpi-bersama.jpeg" alt="Peserta kegiatan KPI berfoto bersama setelah pertemuan" fill priority sizes="(max-width: 1280px) 100vw, 1184px" /></div></figure>
    </section>

    <section className="kp-wrap kp-section kp-about" id="tentang" aria-labelledby="about-title"><div><h2 id="about-title">Apa yang dikerjakan KPI?</h2></div><div className="kp-about-copy"><p>Kehidupan Masisir mempertemukan beragam latar belakang, kebiasaan, dan cara pandang. Karena itu perlu pemahaman bersama tentang tata interaksi, dan mekanisme yang jelas ketika ada persoalan.</p><p>KPI menjalankan pencegahan, edukasi, pengawasan, penerimaan informasi, dan penanganan persoalan interaksi sesuai ketentuan organisasi.</p><Link className="kp-text-link" href="/publik">Baca profil dan mandat KPI</Link></div></section>

    <section className="kp-divisions" id="divisi" aria-labelledby="divisions-title">
      <div className="kp-wrap kp-divisions-head"><h2 id="divisions-title">Tiga divisi dan satu subbidang</h2><p>Media &amp; Publikasi berada di bawah Pencegahan &amp; Edukasi.</p></div>
      <div className="kp-wrap kp-division-grid">
        {publicDivisions.map((division) => <Link className="kp-division-card" href={`/publik/divisi/${division.slug}`} key={division.slug}>
          <div className="kp-division-mark"><Image src={division.mark} alt={`Lambang ${division.name}`} fill sizes="(max-width: 520px) 112px, 136px" /></div>
          <div><span>{division.englishName}</span><h3>{division.name}</h3><p>{division.summary}</p><strong className="kp-division-card__link">Lihat profil</strong></div>
        </Link>)}
      </div>
    </section>

    <section className="kp-role-band" id="peran" aria-labelledby="role-title"><div className="kp-wrap kp-section"><div className="kp-section-head"><div><h2 id="role-title">Tiga tugas utama KPI</h2></div></div><div className="kp-role-grid">{responsibilities.map(({icon:Icon,title,description}) => <article className="kp-role" key={title}><div className="kp-role-top"><Icon size={28} stroke={1.5} aria-hidden="true" /></div><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

    <section className="kp-wrap kp-section kp-education" id="edukasi" aria-labelledby="education-title"><div className="kp-education-art"><h3>Bentuk kegiatannya</h3><div className="kp-format-list"><span>Diskusi</span><span>Kajian</span><span>Seminar</span><span>Lokakarya</span></div></div><div><h2 id="education-title">Pendidikan interaksi</h2><p className="kp-body">Pendidikan interaksi membantu kita mengenali norma, memahami batas, dan menghormati orang lain dalam kehidupan sehari-hari.</p><ul className="kp-editorial-list"><li><strong>Belajar dan berdialog</strong><p>Diskusi, seminar, pelatihan, dan forum untuk memperkuat pemahaman norma dan etika.</p></li><li><strong>Materi yang bisa dibagikan</strong><p>Penyuluhan, sosialisasi, kampanye, kajian, dan publikasi.</p></li></ul><Link className="kp-text-link" href="/publik/publikasi">Baca materi edukasi</Link></div></section>

    <section className="kp-activity-band" id="kegiatan" aria-labelledby="activity-title">
      <div className="kp-wrap kp-section">
        <div className="kp-activity-head"><div><h2 id="activity-title">Dokumentasi kegiatan KPI</h2></div></div>
        <div className="kp-activity-grid">
          <figure className="kp-activity-main">
            <div className="kp-activity-image"><Image src="/images/kegiatan/kegiatan-edukasi.jpeg" alt="Peserta berfoto bersama dalam kegiatan edukasi KPI" fill sizes="(max-width: 820px) 100vw, 66vw" /></div>
            <figcaption><p>Kegiatan edukasi KPI</p></figcaption>
          </figure>
          <div className="kp-activity-side">
            <figure><div className="kp-activity-image"><Image src="/images/kegiatan/diskusi-kelembagaan.jpeg" alt="Peserta mengikuti diskusi KPI dalam sebuah forum" fill sizes="(max-width: 820px) 100vw, 32vw" /></div><figcaption><p>Diskusi dalam forum KPI</p></figcaption></figure>
            <figure><div className="kp-activity-image"><Image src="/images/kegiatan/ruang-dialog.jpeg" alt="Peserta berdialog dalam kelompok kecil" fill sizes="(max-width: 820px) 100vw, 32vw" /></div><figcaption><p>Dialog kelompok kecil</p></figcaption></figure>
          </div>
        </div>
        <Link className="kp-text-link" href="/publik/kegiatan">Lihat seluruh dokumentasi</Link>
      </div>
    </section>

    <section className="kp-process-band" id="alur" aria-labelledby="process-title"><div className="kp-wrap kp-section kp-process"><div><h2 id="process-title">Apa yang terjadi setelah laporan masuk?</h2><p className="kp-body">Berikut ringkasan proses dalam pedoman KPI.</p><div className="kp-process-note"><IconScale size={24} stroke={1.5} aria-hidden="true" /><p>Laporan yang diterima <strong>belum berarti pelanggaran terbukti.</strong> Setiap pihak tetap berhak diperlakukan secara adil.</p></div><Link className="kp-button kp-button--light kp-process-link" href="/publik/aspirasi">Pelajari alur aspirasi</Link></div><ol className="kp-steps">{steps.map(([title,description],i) => <li key={title}><span>{i+1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></div></section>

    <section className="kp-wrap kp-section" id="prinsip" aria-labelledby="principles-title"><div className="kp-section-head"><div><h2 id="principles-title">Enam prinsip dari Buku Pedoman KPI</h2></div></div><div className="kp-values">{principles.map(([title,description]) => <article key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></section>

    <section className="kp-wrap kp-cooperation"><div><h2>Koordinasi</h2><p>KPI berkoordinasi dengan PPMI Mesir, organisasi kekeluargaan, WIHDAH, dan lembaga terkait sesuai kebutuhan serta kewenangan masing-masing.</p></div><Link className="kp-text-link" href="/publik/struktur">Lihat struktur kerja</Link></section>

    <section className="kp-wrap kp-section kp-faq" id="faq" aria-labelledby="faq-title"><div><h2 id="faq-title">Pertanyaan yang sering diajukan</h2></div><div className="kp-faq-list">{questions.map(([question,answer]) => <details key={question}><summary>{question}<IconPlus size={20} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>

    <section className="kp-wrap kp-contact"><div><h2>Ada yang ingin disampaikan ke KPI?</h2><p>Baca dulu alur aspirasi, atau kirim email ke <a href="mailto:kpippmimesirofficial@gmail.com">kpippmimesirofficial@gmail.com</a>.</p><div className="kp-actions"><Link href="/publik/aspirasi" className="kp-button kp-button--white">Lihat alur aspirasi</Link></div><small>Formulir aspirasi masih berupa pratinjau dan belum menerima laporan resmi.</small></div></section>
    <footer className="kp-wrap kp-footer"><div className="kp-footer-top"><Link href="/" className="kp-footer-brand"><Image src="/brand/kpi-ppmi-mesir-logo.png" alt="Logo KPI PPMI Mesir" width={48} height={48}/><span><strong>KPI PPMI Mesir</strong><small>Komisi Peduli Interaksi</small></span></Link><p>Badan Semi Otonom PPMI Mesir</p><nav aria-label="Navigasi footer"><Link href="/publik">Tentang KPI</Link><Link href="/publik/divisi">Divisi</Link><Link href="/publik/kegiatan">Kegiatan</Link><Link href="/publik/publikasi">Publikasi</Link><Link href="/publik/layanan">Layanan</Link><Link href="/publik/aspirasi">Aspirasi</Link><Link href="/masuk">Login pengurus</Link></nav></div><div className="kp-footer-bottom"><span>Email resmi: <a href="mailto:kpippmimesirofficial@gmail.com">kpippmimesirofficial@gmail.com</a></span><span>Ringkasan konten berdasarkan Buku Pedoman KPI.</span></div></footer>
  </div>;
}
