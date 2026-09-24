import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconArrowUpRight, IconBook2, IconHeartHandshake, IconShieldCheck, IconScale, IconMessageCircle, IconUsers, IconCheck, IconPlus } from "@tabler/icons-react";
import { LandingMotion } from "@/components/public/landing-motion";
import { publicDivisions } from "@/lib/public-organization";

const responsibilities = [
  { icon: IconBook2, title: "Edukasi & pencegahan", description: "Membantu Masisir memahami norma, etika, dan tanggung jawab dalam berinteraksi melalui pendidikan serta publikasi.", tag: "Membangun pemahaman" },
  { icon: IconMessageCircle, title: "Pengawasan & informasi", description: "Mengamati persoalan interaksi dan menerima informasi untuk diverifikasi sesuai lingkup kewenangan KPI.", tag: "Mengenali persoalan" },
  { icon: IconScale, title: "Penanganan sesuai prosedur", description: "Menelaah dan menangani persoalan secara objektif serta proporsional, dengan menghormati hak setiap pihak.", tag: "Menjaga keadilan" }
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
export default function HomePage(): React.JSX.Element {
  return <div className="kp-site">
    <LandingMotion />
    <section className="kp-hero" aria-labelledby="page-title">
      <div className="kp-wrap kp-hero-top">
        <p className="kp-eyebrow"><span /> Komisi Peduli Interaksi · PPMI Mesir</p>
        <h1 id="page-title">Menjaga interaksi.<br /><span>Melindungi martabat.</span></h1>
        <p className="kp-hero-lead">KPI PPMI Mesir mengedukasi, mengawasi, menerima informasi, dan menangani persoalan interaksi mahasiswa serta pelajar Indonesia di Mesir sesuai mandat organisasi.</p>
        <div className="kp-actions"><Link className="kp-button kp-button--red" href="/publik">Kenali KPI <IconArrowRight aria-hidden="true" size={18} /></Link><Link className="kp-button kp-button--outline" href="/publik/layanan">Lihat layanan & informasi <IconArrowUpRight aria-hidden="true" size={18} /></Link></div>
      </div>
      <div className="kp-wrap kp-visual" aria-label="Ringkasan visual pedoman dan prinsip kerja KPI">
        <div className="kp-visual-caption"><span className="kp-eyebrow">Berangkat dari kepedulian</span><p>Pemahaman yang baik.<br />Proses yang berimbang.<br />Martabat yang terjaga.</p><a href="#prinsip">Kenali prinsip kami <IconArrowUpRight size={18} aria-hidden="true" /></a></div>
        <Link className="kp-publication" href="/publik/publikasi" aria-label="Buka publikasi dan edukasi KPI">
          <div className="kp-publication-brand"><Image src="/brand/kpi-ppmi-mesir-logo.png" alt="" width={42} height={42} /><span>Komisi Peduli Interaksi<br />PPMI Mesir</span></div>
          <div><span className="kp-publication-label">Ringkasan pedoman</span><h2>Peduli.<br />Pahami.<br />Hormati.</h2></div>
          <div className="kp-publication-foot"><span>Nilai dan prinsip<br />interaksi Masisir</span><IconArrowUpRight size={27} aria-hidden="true" /></div>
        </Link>
        <div className="kp-principle-preview"><div className="kp-preview-label"><IconShieldCheck size={22} stroke={1.6} aria-hidden="true" /><span>Landasan setiap proses</span></div><h3>Setiap pihak berhak<br />diperlakukan dengan hormat.</h3><ul>{["Objektif dalam menelaah", "Proporsional dalam bertindak", "Menjaga kerahasiaan"].map(t => <li key={t}><IconCheck size={17} aria-hidden="true" />{t}</li>)}</ul><span className="kp-preview-note">Dirangkum dari Buku Pedoman KPI</span></div>
      </div>
      <div className="kp-wrap kp-hero-links"><Link href="/publik"><IconUsers aria-hidden="true" size={21} /><span>Kenali organisasi</span><IconArrowUpRight aria-hidden="true" size={18} /></Link><Link href="/publik/publikasi"><IconBook2 aria-hidden="true" size={21} /><span>Edukasi & publikasi</span><IconArrowUpRight aria-hidden="true" size={18} /></Link><Link href="/publik/aspirasi"><IconMessageCircle aria-hidden="true" size={21} /><span>Pahami alur aspirasi</span><IconArrowUpRight aria-hidden="true" size={18} /></Link></div>
    </section>

    <section className="kp-wrap kp-section kp-about" id="tentang" aria-labelledby="about-title"><div><p className="kp-eyebrow">01 / Tentang KPI</p><h2 id="about-title">Mandat yang jelas<br />untuk interaksi Masisir.</h2></div><div className="kp-about-copy"><p>Kehidupan Masisir mempertemukan beragam latar belakang, kebiasaan, dan cara pandang. Tata interaksi yang sehat membutuhkan pemahaman bersama serta mekanisme yang jelas ketika persoalan muncul.</p><p>Sebagai Badan Semi Otonom PPMI Mesir, KPI menjalankan pencegahan, edukasi, pengawasan, penerimaan informasi, dan penanganan persoalan interaksi sesuai ketentuan organisasi. Setiap langkah harus menghormati hak dan martabat pihak terkait.</p><Link className="kp-text-link" href="/publik">Baca profil dan mandat KPI <IconArrowUpRight size={18} aria-hidden="true" /></Link></div><div className="kp-about-strip"><span>Bagian dari PPMI Mesir</span><span>Bekerja sesuai mandat organisasi</span><span>Menghormati hak setiap pihak</span></div></section>

    <section className="kp-divisions" id="divisi" aria-labelledby="divisions-title">
      <div className="kp-wrap kp-divisions-head"><p className="kp-eyebrow">Tiga divisi, satu subbidang</p><h2 id="divisions-title">Bergerak bersama<br />dalam satu amanah.</h2><p>Media & Publikasi berada di bawah Pencegahan & Edukasi. Keempat unit kerja saling melengkapi dari penelaahan hingga pendidikan dan publikasi.</p></div>
      <div className="kp-wrap kp-division-grid">
        {publicDivisions.map((division) => <Link className="kp-division-card" href={`/publik/divisi/${division.slug}`} key={division.slug}>
          <div className="kp-division-mark"><Image src={division.mark} alt={`Lambang ${division.name}`} fill sizes="(max-width: 520px) 112px, 136px" /></div>
          <div><span>{division.englishName}</span><h3>{division.name}</h3><p>{division.summary}</p><strong className="kp-division-card__link">Lihat profil <IconArrowUpRight size={16} aria-hidden="true" /></strong></div>
        </Link>)}
      </div>
    </section>

    <section className="kp-role-band" id="peran" aria-labelledby="role-title"><div className="kp-wrap kp-section"><div className="kp-section-head"><div><p className="kp-eyebrow">02 / Peran kami</p><h2 id="role-title">Mencegah persoalan.<br />Menangani sesuai mandat.</h2></div><p>KPI bekerja melalui edukasi, pengawasan, dan penanganan yang objektif. Kewenangan selalu disertai prosedur dan tanggung jawab.</p></div><div className="kp-role-grid">{responsibilities.map(({icon:Icon,title,description,tag},i) => <article className="kp-role" key={title}><div className="kp-role-top"><Icon size={28} stroke={1.5} aria-hidden="true" /><span>0{i+1}</span></div><span className="kp-role-tag">{tag}</span><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>

    <section className="kp-wrap kp-section kp-education" id="edukasi" aria-labelledby="education-title"><div className="kp-education-art"><span className="kp-eyebrow">Pendidikan interaksi</span><IconHeartHandshake className="kp-education-icon" size={108} stroke={.9} aria-hidden="true" /><h3>Belajar memahami.<br />Terbiasa menghormati.</h3><div className="kp-format-list"><span>Diskusi</span><span>Kajian</span><span>Seminar</span><span>Lokakarya</span></div></div><div><p className="kp-eyebrow">03 / Pencegahan & edukasi</p><h2 id="education-title">Interaksi yang sehat<br />dimulai dari pemahaman.</h2><p className="kp-body">Pendidikan interaksi membantu kita mengenali norma, memahami batas, dan menghormati orang lain dalam kehidupan sehari-hari.</p><ul className="kp-editorial-list"><li><strong>Belajar dan berdialog</strong><p>Diskusi, seminar, pelatihan, dan forum untuk memperkuat pemahaman norma serta etika.</p></li><li><strong>Pengetahuan yang dapat dibagikan</strong><p>Penyuluhan, sosialisasi, kampanye, kajian, dan publikasi sebagai bagian dari pencegahan.</p></li></ul><Link className="kp-text-link" href="/publik/publikasi">Jelajahi edukasi & publikasi <IconArrowUpRight size={18} aria-hidden="true" /></Link></div></section>

    <section className="kp-activity-band" id="kegiatan" aria-labelledby="activity-title">
      <div className="kp-wrap kp-section">
        <div className="kp-activity-head">
          <div><p className="kp-eyebrow">04 / Jejak kegiatan</p><h2 id="activity-title">Kepedulian yang hadir<br />di ruang-ruang nyata.</h2></div>
          <p>Mandat KPI dijalankan melalui pertemuan, dialog, edukasi, dan kerja bersama. Dokumentasi ini merekam sebagian proses belajar dan bertumbuh bersama Masisir.</p>
        </div>
        <div className="kp-activity-grid">
          <figure className="kp-activity-main">
            <div className="kp-activity-image"><Image src="/images/kegiatan/forum-kpi-bersama.jpeg" alt="Peserta kegiatan KPI berfoto bersama setelah pertemuan" fill sizes="(max-width: 820px) 100vw, 66vw" /></div>
            <figcaption><span>Ruang kebersamaan</span><p>Pertemuan menjadi tempat menyatukan pemahaman dan menjaga hubungan antarsesama.</p></figcaption>
          </figure>
          <div className="kp-activity-side">
            <figure><div className="kp-activity-image"><Image src="/images/kegiatan/diskusi-kelembagaan.jpeg" alt="Peserta mengikuti diskusi KPI dalam sebuah forum" fill sizes="(max-width: 820px) 100vw, 32vw" /></div><figcaption><span>Koordinasi</span><p>Mendengar, bertukar pandangan, dan merumuskan langkah bersama.</p></figcaption></figure>
            <figure><div className="kp-activity-image"><Image src="/images/kegiatan/ruang-dialog.jpeg" alt="Peserta berdialog dalam kelompok kecil" fill sizes="(max-width: 820px) 100vw, 32vw" /></div><figcaption><span>Dialog</span><p>Percakapan yang terbuka membantu setiap sudut pandang dipahami.</p></figcaption></figure>
          </div>
        </div>
        <div className="kp-activity-closing">
          <div className="kp-activity-closing-image"><Image src="/images/kegiatan/kegiatan-edukasi.jpeg" alt="Peserta berfoto bersama dalam kegiatan edukasi KPI" fill sizes="(max-width: 820px) 100vw, 42vw" /></div>
          <div><span className="kp-activity-index">Dari kegiatan, menjadi pengetahuan bersama</span><h3>Belajar dari pengalaman.<br />Membagikan pemahaman.</h3><p>Setiap forum membuka kesempatan untuk mengenali persoalan dengan lebih utuh, memperkuat kepedulian, dan membawa nilai interaksi sehat ke lingkungan yang lebih luas.</p><Link className="kp-activity-more" href="/publik/kegiatan">Lihat seluruh dokumentasi <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
        </div>
      </div>
    </section>

    <section className="kp-process-band" id="alur" aria-labelledby="process-title"><div className="kp-wrap kp-section kp-process"><div><p className="kp-eyebrow">05 / Penerimaan informasi</p><h2 id="process-title">Didengar dengan saksama.<br />Ditelaah dengan adil.</h2><p className="kp-body">Setiap informasi perlu dipahami konteksnya sebelum ditindaklanjuti. Berikut ringkasan prinsip proses dalam pedoman KPI.</p><div className="kp-process-note"><IconScale size={24} stroke={1.5} aria-hidden="true" /><p>Laporan yang diterima <strong>belum berarti pelanggaran terbukti.</strong> Setiap pihak tetap memiliki hak untuk diperlakukan secara adil.</p></div><Link className="kp-button kp-button--light kp-process-link" href="/publik/aspirasi">Pelajari alur aspirasi <IconArrowUpRight size={18} aria-hidden="true" /></Link></div><ol className="kp-steps">{steps.map(([title,description],i) => <li key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></div></section>

    <section className="kp-wrap kp-section" id="prinsip" aria-labelledby="principles-title"><div className="kp-section-head"><div><p className="kp-eyebrow">06 / Prinsip kerja</p><h2 id="principles-title">Amanah dijaga<br />melalui cara kita bekerja.</h2></div><p>Kewenangan disertai tanggung jawab. Pedoman KPI menempatkan prinsip-prinsip ini dalam pelaksanaan setiap tugas.</p></div><div className="kp-values">{[["Objektivitas", "Menelaah informasi berdasarkan kejelasan dan konteks, tanpa dipengaruhi kepentingan pribadi atau kelompok."],["Proporsionalitas", "Menyesuaikan respons dengan tingkat persoalan, dampak, risiko, dan tujuan penanganan."],["Kerahasiaan", "Membatasi akses terhadap informasi sesuai kewenangan, dengan memperhatikan keamanan pihak terkait."],["Martabat manusia", "Menghormati hak, kehormatan, dan kepentingan setiap orang dalam seluruh proses."],["Kepastian prosedur", "Menjalankan tugas melalui mekanisme yang jelas dan sesuai ketentuan organisasi."],["Akuntabilitas", "Memastikan tindakan dan keputusan dapat dijelaskan serta dipertanggungjawabkan."]].map(([title,description],i) => <article key={title}><span>0{i+1}</span><h3>{title}</h3><p>{description}</p></article>)}</div></section>

    <section className="kp-wrap kp-cooperation"><IconUsers size={36} stroke={1.4} aria-hidden="true" /><div><p className="kp-eyebrow">Tumbuh bersama, bekerja bersama</p><h2>Kepedulian bukan pekerjaan satu pihak.</h2><p>KPI berkoordinasi dengan PPMI Mesir, organisasi kekeluargaan, WIHDAH, dan lembaga terkait sesuai kebutuhan serta kewenangan masing-masing.</p></div><Link className="kp-text-link" href="/publik/struktur">Lihat struktur kerja <IconArrowUpRight size={18} aria-hidden="true" /></Link></section>

    <section className="kp-wrap kp-section kp-faq" id="faq" aria-labelledby="faq-title"><div><p className="kp-eyebrow">07 / Pertanyaan umum</p><h2 id="faq-title">Kenali lebih jelas.<br />Pahami lebih dekat.</h2><p className="kp-body">Beberapa hal yang perlu diketahui tentang peran KPI dan informasi di situs ini.</p></div><div className="kp-faq-list">{questions.map(([question,answer]) => <details key={question}><summary>{question}<IconPlus size={20} aria-hidden="true" /></summary><p>{answer}</p></details>)}</div></section>

    <section className="kp-wrap kp-contact"><div><p className="kp-eyebrow">Ruang informasi untuk Masisir</p><h2>Mulai dari memahami.<br />Lanjutkan dengan kepedulian.</h2><p>Kenali peran KPI, pelajari prinsip interaksi, dan pahami cara menyampaikan informasi dengan bertanggung jawab.</p><div className="kp-actions"><Link href="/publik" className="kp-button kp-button--white">Jelajahi informasi publik <IconArrowRight size={18} aria-hidden="true" /></Link><Link href="/publik/aspirasi" className="kp-button kp-button--light">Lihat alur aspirasi <IconArrowUpRight size={18} aria-hidden="true" /></Link></div><small>Formulir aspirasi masih berupa pratinjau dan belum menerima laporan resmi.</small></div><IconHeartHandshake className="kp-contact-icon" size={150} stroke={.8} aria-hidden="true" /></section>
    <footer className="kp-wrap kp-footer"><div className="kp-footer-top"><Link href="/" className="kp-footer-brand"><Image src="/brand/kpi-ppmi-mesir-logo.png" alt="Logo KPI PPMI Mesir" width={48} height={48}/><span><strong>KPI PPMI Mesir</strong><small>Komisi Peduli Interaksi</small></span></Link><p>Menjaga interaksi.<br />Melindungi martabat.</p><nav aria-label="Navigasi footer"><Link href="/publik">Tentang KPI</Link><Link href="/publik/divisi">Divisi</Link><Link href="/publik/kegiatan">Kegiatan</Link><Link href="/publik/publikasi">Publikasi</Link><Link href="/publik/layanan">Layanan</Link><Link href="/publik/aspirasi">Aspirasi</Link><Link href="/masuk">Login pengurus</Link></nav></div><div className="kp-footer-bottom"><span>KPI PPMI Mesir · Informasi publik</span><span>Ringkasan konten berdasarkan Buku Pedoman KPI.</span></div></footer>
  </div>;
}
