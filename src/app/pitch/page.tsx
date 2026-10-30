import type { Metadata } from "next";
import Image from "next/image";
import { IconDatabase, IconLayoutSidebar, IconWorld } from "@tabler/icons-react";
import { PitchModuleTabs, PitchNav, type PitchModule, type PitchSection } from "@/components/pitch/pitch-interactive";
import "./pitch.css";

export const metadata: Metadata = {
  title: "Pitch Sistem Digital | KPI PPMI Mesir",
  description: "Penjelasan Sistem Digital KPI PPMI Mesir untuk pengurus: isinya apa, cara masuk portal, apa yang sudah jalan, dan apa yang perlu dilakukan sekarang.",
  alternates: { canonical: "/pitch" },
  robots: { index: false, follow: false }
};

const sections: PitchSection[] = [
  { id: "isi", label: "Isinya" }, { id: "kenapa", label: "Kenapa" }, { id: "website", label: "Website" }, { id: "portal", label: "Portal" },
  { id: "alur", label: "Alur laporan" }, { id: "keamanan", label: "Keamanan" }, { id: "masuk", label: "Cara masuk" }, { id: "kesiapan", label: "Kesiapan" },
  { id: "belum", label: "Belum siap" }, { id: "keputusan", label: "Keputusan" }, { id: "langkah", label: "Langkah" }
];

const modules: PitchModule[] = [
  { key: "workspace", label: "Ruang kerja", url: "/portal/workspace", image: "/pitch/p-workspace.jpg", title: "Buka portal, langsung tahu apa yang harus dikerjakan hari ini.", lead: "Halaman pertama setelah masuk. Isinya hanya pekerjaan, rapat, dan pemeriksaan milik akunmu, jadi tidak perlu scroll grup untuk mencari tugas.", ticks: ["Jumlah tugas, yang menunggu dicek, dan yang tersendat", "Hal yang sedang menunggu keputusanmu", "Pencarian tugas, rapat, dan dokumen yang boleh kamu buka"] },
  { key: "tugas", label: "Tugas", url: "/portal/tugas", image: "/pitch/p-tugas.jpg", title: "Tugas baru dianggap selesai setelah dicek orang lain.", lead: "Alurnya: belum dikerjakan → sedang dikerjakan → menunggu diperiksa → selesai. Tahap diperiksa tidak bisa dilompati, termasuk oleh koordinator.", ticks: ["Tampilan papan (kanban) atau tabel", "Subtugas, tugas yang saling bergantung, templat, dan diskusi", "Tanda merah untuk tugas tersendat dan lewat tenggat"] },
  { key: "rapat", label: "Rapat", url: "/portal/rapat", image: "/pitch/p-rapat.jpg", title: "Hasil rapat tersimpan bersama siapa yang hadir dan apa tindak lanjutnya.", lead: "Jadwal memakai waktu Kairo. Undangan, notulen, voting, dan tindak lanjut ada di halaman rapat yang sama.", ticks: ["Konfirmasi hadir dan daftar hadir", "Notulen berversi, disahkan oleh orang lain", "Voting dengan kuorum; tindak lanjut langsung jadi tugas"] },
  { key: "keuangan", label: "Keuangan", url: "/portal/keuangan", image: "/pitch/p-keuangan.jpg", title: "Setiap rupiah, pound Mesir, dan dolar punya jejak.", lead: "Anggaran per pos dalam IDR, EGP, atau USD. Sistem hanya mencatat; uangnya tetap dipegang dan dikirim bendahara seperti biasa.", ticks: ["Pengajuan wajib melampirkan bukti, misalnya foto kuitansi", "Yang mengajukan, memeriksa, dan menyetujui harus orang berbeda", "Rekap pembayaran dan laporan yang bisa diunduh"] },
  { key: "evaluasi", label: "Evaluasi", url: "/portal/evaluasi", image: "/pitch/p-evaluasi.jpg", title: "Penilaian kinerja pengurus yang bisa ditelusuri ke buktinya.", lead: "Nilai memakai kriteria yang jelas bobotnya. Kalau datanya belum ada, nilainya tidak otomatis dianggap nol.", ticks: ["Nilai 0–100 dengan rujukan kriteria", "Diperiksa orang lain; yang dinilai boleh mengajukan keberatan satu kali", "Hasil penilaian per orang bersifat RAHASIA"] },
  { key: "redaksi", label: "Redaksi", url: "/portal/editor", image: "/pitch/p-editor.jpg", title: "Kabar dan rilis KPI ditulis, dicek, baru tayang.", lead: "Naskah baru muncul di website setelah disetujui akun lain. Setiap simpanan jadi versi baru, jadi tidak ada tulisan yang hilang karena ditimpa.", ticks: ["Status draf, menunggu dicek, tayang, dan arsip", "Naskah bahasa Indonesia dan Inggris", "Peringatan kalau naskah memuat data pribadi"] },
  { key: "handover", label: "Serah terima", url: "/portal/handover", image: "/pitch/p-handover.jpg", title: "Ganti kepengurusan tanpa kehilangan arsip.", lead: "Pengurus lama menyusun paket, penerusnya menerima satu per satu. Akses lama tidak ikut diwariskan begitu saja.", ticks: ["Paket berisi dokumen yang sudah diperiksa", "Penerus mengonfirmasi tiap item yang diterima", "Pencabutan akses pengurus lama tetap lewat formulir resmi"] }
];

function Frame({ url, src, alt }: { url: string; src: string; alt: string }): React.JSX.Element {
  return <div className="frame"><div className="frame-bar"><i /><i /><i /><span>{url}</span></div><Image alt={alt} height={900} sizes="(min-width: 820px) 50vw, 100vw" src={src} width={1440} /></div>;
}

function Phone({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }): React.JSX.Element {
  return <div className="phone"><Image alt={alt} height={1688} priority={priority} sizes="230px" src={src} width={780} /></div>;
}

export default function PitchPage(): React.JSX.Element {
  return <div className="pitch">
    <header className="pitch-top">
      <div className="wrap">
        <a className="pitch-brand" href="#atas"><Image alt="Logo KPI PPMI Mesir" height={34} src="/brand/kpi-ppmi-mesir-logo.png" width={34} /><div><b>KPI PPMI Mesir</b><span>Sistem Digital · pitch</span></div></a>
        <PitchNav sections={sections} />
      </div>
    </header>

    <div id="atas">
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <span className="eyebrow">Komisi Peduli Interaksi · PPMI Mesir</span>
            <h1 className="h1">Kerja KPI untuk Masisir, dari laporan pertama sampai serah terima pengurus, <em>tercatat rapi di satu tempat.</em></h1>
            <p className="lead">Tanpa sistem, catatan KPI gampang tercecer di grup WhatsApp, Drive pribadi, dan ingatan pengurus yang sebentar lagi lulus atau pulang ke tanah air. Sistem ini menyatukannya: website untuk Masisir, portal kerja untuk pengurus, dan aturan akses yang menjaga cerita pelapor tetap rahasia.</p>
            <div className="btns"><a className="btn primary" href="#isi">Mulai baca →</a><a className="btn" href="#masuk">Cara masuk portal</a><a className="btn" href="#langkah">Yang perlu dilakukan sekarang</a></div>
            <div className="hero-meta"><span>Per <b>30 Oktober 2026</b></span><span>Pengembang <b>Dar Dev</b></span><span>Alamat <b>kpi-dardev.vercel.app</b></span></div>
          </div>
          <div className="hero-shot">
            <div className="frame"><div className="frame-bar"><i /><i /><i /><span>Beranda situs publik</span></div><Image alt="Beranda situs publik KPI PPMI Mesir dengan judul Menjaga interaksi, Melindungi martabat" height={900} priority sizes="(min-width: 1248px) 1184px, 100vw" src="/pitch/d-beranda.jpg" width={1440} /></div>
            <Phone alt="Beranda situs KPI di layar HP" priority src="/pitch/m-beranda.jpg" />
          </div>
        </div>
      </section>

      <section id="isi">
        <div className="wrap">
          <div className="split">
            <div className="sec-head">
              <span className="eyebrow">Isinya apa</span>
              <h2 className="h2">Satu sistem, <em>tiga bagian.</em></h2>
              <p className="lead">Yang dibuka Masisir dan yang dipakai pengurus ada di satu aplikasi, dengan satu database milik KPI. Tidak ada data yang disimpan di laptop atau akun pribadi pengurus.</p>
              <p className="lead">Semua rancangan, panduan, dan catatan perkembangannya ikut tersimpan, jadi pengurus periode berikutnya bisa melanjutkan tanpa harus mulai dari nol.</p>
            </div>
            <div className="parts">
              <div className="part"><div className="ic"><IconWorld aria-hidden="true" size={22} /></div><div><h3>Website untuk Masisir</h3><p>Siapa KPI, divisinya apa saja, kabar dan publikasi, layanan, serta formulir pengaduan. Ada versi bahasa Indonesia dan Inggris.</p></div></div>
              <div className="part"><div className="ic"><IconLayoutSidebar aria-hidden="true" size={22} /></div><div><h3>Portal pengurus</h3><p>Tempat kerja harian setelah masuk: tugas, rapat, dokumen, keuangan, evaluasi, kasus, redaksi, dan serah terima. Bisa dibuka dari HP.</p></div></div>
              <div className="part"><div className="ic"><IconDatabase aria-hidden="true" size={22} /></div><div><h3>Aturan siapa boleh melihat apa</h3><p>Dijalankan langsung oleh database, bukan cuma disembunyikan dari tampilan. Jadi tidak bisa diakali dengan menebak alamat halaman.</p></div></div>
            </div>
          </div>
          <div className="stats">
            <div className="stat"><b>13</b><span>modul kerja untuk pengurus</span></div>
            <div className="stat"><b>2</b><span>bahasa: Indonesia dan Inggris</span></div>
            <div className="stat"><b>7</b><span>formulir SOP penanganan kasus</span></div>
            <div className="stat"><b>240+</b><span>pemeriksaan otomatis, semuanya lulus</span></div>
          </div>
        </div>
      </section>

      <section className="alt" id="kenapa">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kenapa perlu</span>
            <h2 className="h2">Pengurus datang dan pergi tiap periode. <em>Amanah dan catatannya tidak boleh ikut pergi.</em></h2>
            <p className="lead">Pertanyaan-pertanyaan ini yang sering muncul di kepengurusan. Di bawahnya, apa yang dilakukan sistem.</p>
          </div>
          <div className="grid3">
            <div className="card"><span className="who">Pengurus</span><h3>“Tugas saya yang mana, tenggatnya kapan? Apalagi pas musim imtihan.”</h3><p>Ruang kerja hanya menampilkan tugas, rapat, dan pemeriksaan milik akunmu. Tidak perlu scroll ratusan chat.</p></div>
            <div className="card"><span className="who">Koordinator divisi</span><h3>“Katanya sudah beres. Buktinya mana?”</h3><p>Tugas baru diterima setelah diajukan dengan bukti dan dicek orang lain.</p></div>
            <div className="card"><span className="who">Petugas kasus</span><h3>“Ini cerita teman sendiri. Harus benar-benar rahasia.”</h3><p>Kasus hanya bisa dibuka orang yang ditugaskan. Catatan internal terpisah dari kabar yang dilihat pelapor.</p></div>
            <div className="card"><span className="who">Bendahara</span><h3>“Uang kas dipakai untuk apa, dan siapa yang setuju?”</h3><p>Pengajuan, pemeriksaan, persetujuan, dan pembayaran dipegang orang berbeda. Semua tercatat, dalam rupiah, pound, atau dolar.</p></div>
            <div className="card"><span className="who">Media & Publikasi</span><h3>“Draf rilis jangan sampai tayang duluan.”</h3><p>Naskah hanya muncul di website setelah disetujui akun lain. Draf tidak ikut di pencarian publik.</p></div>
            <div className="card"><span className="who">Pengurus baru</span><h3>“Baru dilantik. Mulai dari mana?”</h3><p>Pengurus lama menyerahkan paket arsip satu per satu, tanpa membuka seluruh arsip lama ke semua orang.</p></div>
          </div>
        </div>
      </section>

      <section id="website">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Website untuk Masisir</span>
            <h2 className="h2">Yang pertama dilihat Masisir: <em>siapa KPI dan ke mana harus bercerita.</em></h2>
            <p className="lead">Sudah online dan bisa dibuka siapa saja. Yang tampil di sini hanya tulisan yang sudah disetujui lewat Redaksi di portal.</p>
          </div>
          <div className="gallery">
            <figure><Frame alt="Halaman layanan pengaduan dengan kartu Kanal resmi sedang disiapkan" src="/pitch/d-pengaduan.jpg" url="/publik/pengaduan" /><figcaption><b>Layanan pengaduan</b><span>Formulir dan tahapannya sudah ada. Sengaja belum dibuka sampai periode aktif dan petugasnya resmi, supaya tidak ada laporan Masisir yang masuk tanpa ada yang menangani.</span></figcaption></figure>
            <figure><Frame alt="Halaman profil divisi KPI" src="/pitch/d-divisi.jpg" url="/publik/divisi" /><figcaption><b>Profil divisi</b><span>Setiap divisi punya halaman sendiri lengkap dengan logonya.</span></figcaption></figure>
            <figure><Frame alt="Versi bahasa Inggris situs KPI" src="/pitch/d-en.jpg" url="/en" /><figcaption><b>Versi bahasa Inggris</b><span>Untuk mitra, kampus, dan pihak luar. Isinya dikelola terpisah dari versi Indonesia.</span></figcaption></figure>
          </div>
          <div className="divs">
            <div className="div"><Image alt="" height={48} src="/brand/divisions/intelligence-operation-mark.png" width={48} /><div><b>Intelijen & Operasional</b><span>Divisi</span></div></div>
            <div className="div"><Image alt="" height={48} src="/brand/divisions/research-analysis-mark.png" width={48} /><div><b>Riset & Analisis</b><span>Divisi</span></div></div>
            <div className="div"><Image alt="" height={48} src="/brand/divisions/prevention-education-mark.png" width={48} /><div><b>Pencegahan & Edukasi</b><span>Divisi</span></div></div>
            <div className="div"><Image alt="" height={48} src="/brand/divisions/media-publication-mark.png" width={48} /><div><b>Media & Publikasi</b><span>Subbidang di bawah Pencegahan & Edukasi</span></div></div>
          </div>
        </div>
      </section>

      <section className="alt" id="portal">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Portal pengurus</span>
            <h2 className="h2">Begini tampilannya <em>setelah pengurus masuk.</em></h2>
            <p className="lead">Klik nama modul untuk melihat layarnya. Isi bertanda TEST adalah data contoh di komputer pengembang, bukan data Masisir sungguhan.</p>
          </div>
          <PitchModuleTabs modules={modules} />
          <div className="sec-head phones-head"><span className="eyebrow">Di HP</span><h3 className="h2">Enak dibuka dari HP, dengan menu bawah untuk modul yang paling sering dipakai.</h3></div>
          <div className="phones">
            <figure><Phone alt="Beranda situs di HP" src="/pitch/m-beranda.jpg" /><figcaption>Website</figcaption></figure>
            <figure><Phone alt="Ruang kerja portal di HP" src="/pitch/m-workspace.jpg" /><figcaption>Ruang kerja</figcaption></figure>
            <figure><Phone alt="Daftar tugas portal di HP" src="/pitch/m-tugas.jpg" /><figcaption>Tugas</figcaption></figure>
          </div>
        </div>
      </section>

      <section id="alur">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Alur laporan</span>
            <h2 className="h2">Perjalanan satu laporan Masisir, <em>dari formulir sampai selesai ditangani.</em></h2>
            <p className="lead">Alurnya sudah terpasang dan diuji otomatis, tapi belum dipakai untuk laporan sungguhan karena kanal pengaduan masih ditutup.</p>
          </div>
          <ol className="flow">
            <li className="step"><span className="who">Masisir</span><b>Mengirim laporan</b><span>Lewat formulir di website, lalu mendapat kode untuk memantau perkembangannya.</span></li>
            <li className="step"><span className="who">Sekretariat</span><b>Menerima dan mencatat</b><span>Laporan masuk ke antrean tertutup. Pengurus lain tidak bisa melihatnya.</span></li>
            <li className="step"><span className="who">Sekretariat</span><b>Menunjuk petugas</b><span>Diteruskan ke divisi Intelijen & Operasional sesuai mandat.</span></li>
            <li className="step"><span className="who">Petugas</span><b>Menangani sesuai SOP</b><span>Tujuh formulir SOP, catatan bukti, dan riwayat perpindahan bukti.</span></li>
            <li className="step"><span className="who">Pemeriksa lain</span><b>Mengecek sebelum ditutup</b><span>Wajib orang yang berbeda dari penyusun dan pemegang kasus.</span></li>
            <li className="step"><span className="who">Masisir</span><b>Memantau perkembangan</b><span>Pelapor hanya melihat kabar untuknya, bukan catatan internal petugas.</span></li>
          </ol>
        </div>
      </section>

      <section className="statement">
        <div className="wrap">
          <h2 className="h2">Yang membuat tidak boleh menyetujui sendiri. <em>Yang menyetujui tidak boleh membayar sendiri.</em></h2>
          <p>Prinsip ini berlaku di tugas, keuangan, evaluasi, redaksi, kasus, dan izin akses. Database yang menolak kalau orangnya sama, jadi tidak bisa dilewati walaupun tombolnya diakali.</p>
        </div>
      </section>

      <section id="keamanan">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Keamanan data</span>
            <h2 className="h2">Setiap orang hanya membuka data <em>yang memang haknya.</em></h2>
            <p className="lead">Mengikuti SOP Kerahasiaan KPI versi 1.1. Karena yang dijaga adalah cerita dan nama baik sesama Masisir.</p>
          </div>
          <div className="grid3">
            <div className="card"><h3>Izin per divisi, periode, dan berkas</h3><p>Seseorang bisa diberi akses ke satu kasus atau satu dokumen saja, tanpa membuka seluruh arsip.</p></div>
            <div className="card"><h3>Admin tidak otomatis bisa membaca</h3><p>Pengelola sistem tidak bisa membuka isi kasus atau penilaian tanpa izin resmi. Pengecualiannya hanya akun super admin KPI yang disetujui tertulis, tercatat, dan bisa dicabut.</p></div>
            <div className="card"><h3>Berkas tertutup</h3><p>Dokumen tidak punya alamat publik. Tautan unduhnya hanya berlaku 60 detik setelah izin dicek.</p></div>
            <div className="card"><h3>Semua tindakan tercatat</h3><p>Setiap pengajuan, persetujuan, dan perubahan menyimpan siapa pelakunya, kapan, dan versi yang mana.</p></div>
            <div className="card"><h3>Halaman pengurus wajib masuk</h3><p>Pengunjung yang belum masuk ditolak di semua halaman dan data internal. Dicek ulang setiap rilis.</p></div>
            <div className="card"><h3>Data KPI tidak dipakai melatih AI</h3><p>Asisten AI hanya membaca sumber yang boleh dibaca penggunanya, dan usulannya harus dikonfirmasi manusia.</p></div>
          </div>
          <p className="note">26 Oktober: celah keamanan serius di Next.js, kerangka yang dipakai aplikasi ini, ketahuan lewat pemeriksaan rutin dan sudah ditambal dengan pembaruan ke versi 16.4.3.</p>
        </div>
      </section>

      <section className="alt" id="masuk">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Cara masuk portal</span>
            <h2 className="h2">Akun dibuat oleh admin KPI. <em>Pengurus tinggal membuat kata sandi sendiri.</em></h2>
            <p className="lead">Tidak ada pendaftaran mandiri, supaya hanya pengurus resmi yang bisa masuk. Alamat masuknya <b>kpi-dardev.vercel.app/masuk</b>.</p>
          </div>
          <ol className="flow">
            <li className="step"><span className="who">Admin KPI</span><b>Mendaftarkan email pengurus</b><span>Di Supabase: Authentication → Users → Add user → Create new user. Isi email pengurus, centang Auto Confirm User, isi kata sandi sementara acak (tidak perlu dikirim).</span></li>
            <li className="step"><span className="who">Pemegang database</span><b>Mengaktifkan akun</b><span>Menjalankan skrip aktivasi akun. Tanpa langkah ini, login ditolak dengan pesan “akun belum diaktifkan”.</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Membuat kata sandi</b><span>Buka kpi-dardev.vercel.app/masuk/lupa-sandi, isi email tadi, lalu klik tautan di email (berlaku 30 menit) untuk membuat kata sandi sendiri.</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Masuk ke portal</b><span>Buka kpi-dardev.vercel.app/masuk, isi email dan kata sandi, klik “Masuk ke portal”.</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Cek profil dan hak akses</b><span>Buka Profil dan Hak akses saya. Kalau modul masih kosong, itu wajar sampai jabatan dan izinmu ditetapkan.</span></li>
            <li className="step"><span className="who">Admin dan pejabat</span><b>Menetapkan jabatan dan izin</b><span>Admin mengisi jabatan di Pengaturan; pengurus mengajukan izin lewat formulir F01; pejabat yang berwenang menyetujui.</span></li>
          </ol>
          <div className="ready">
            <div className="list"><h3><span className="pill info">Kalau gagal masuk</span></h3><ul>
              <li><b>“Email atau kata sandi tidak sesuai, atau akun belum diaktifkan”</b><span>Cek ejaan email. Kalau sudah benar, minta admin memastikan akunmu sudah diaktifkan (langkah 2).</span></li>
              <li><b>Email pembuatan kata sandi tidak datang</b><span>Cek folder Spam/Promosi. Pengirim bawaan hanya mengirim beberapa email per jam, jadi tunggu sebentar sebelum mencoba lagi.</span></li>
              <li><b>Tautan di email sudah kedaluwarsa</b><span>Ulangi dari Lupa kata sandi. Tautan berlaku 30 menit dan hanya sekali pakai.</span></li>
              <li><b>Masuk berhasil, tapi “Penugasan diperlukan”</b><span>Akunmu sudah benar; jabatan atau izinmu yang belum ditetapkan. Hubungi admin KPI.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill ok">Jaga akunmu</span></h3><ul>
              <li><b>Pakai kata sandi khusus untuk portal ini</b><span>Jangan pakai kata sandi yang sama dengan Instagram, email, atau akun lain. Portal ini tidak memakai kode OTP, jadi kata sandi adalah satu-satunya kunci.</span></li>
              <li><b>Jangan pinjamkan akun</b><span>Semua tindakan tercatat atas nama pemilik akun, termasuk persetujuan keuangan dan kasus.</span></li>
              <li><b>Keluar dari HP atau laptop pinjaman</b><span>Klik Keluar setelah selesai, terutama di warnet, laptop teman sakan, atau HP bersama.</span></li>
              <li><b>Masa jabatan selesai</b><span>Akses dicabut lewat formulir pengakhiran (F05), bukan dengan menghapus akun, supaya riwayat kerjamu tetap utuh.</span></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section id="kesiapan">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kesiapan</span>
            <h2 className="h2">Mana yang sudah jalan, <em>mana yang masih menunggu.</em></h2>
            <p className="lead">Hampir semua yang menunggu adalah keputusan resmi KPI. Pengembang sengaja tidak membuat periode, mandat, atau akun pengurus sendiri.</p>
          </div>
          <div className="ready">
            <div className="list"><h3><span className="pill ok">Sudah jalan</span>Terpasang dan bisa dicek</h3><ul>
              <li><b>Website ID dan EN</b><span>Online di kpi-dardev.vercel.app dan diperbarui otomatis setiap ada perubahan kode.</span></li>
              <li><b>Login pengurus</b><span>Memakai database Supabase milik KPI.</span></li>
              <li><b>Database semua modul</b><span>Lengkap terpasang di server production.</span></li>
              <li><b>Super admin KPI</b><span>Aktif untuk akun resmi KPI. Sekarang bisa melihat semua modul; bisa mengubah data setelah periode aktif.</span></li>
              <li><b>Alarm kalau website mati</b><span>Dicek setiap 15 menit. Kalau gagal, pengelola langsung dapat notifikasi.</span></li>
              <li><b>Aturan akses dan pemisahan wewenang</b><span>Diuji otomatis di database terpisah setiap ada perubahan.</span></li>
              <li><b>Formulir dan alur kasus</b><span>Tujuh formulir SOP, 1.114 kolom isian, dan catatan bukti.</span></li>
              <li><b>Tampilan HP dan tablet</b><span>Termasuk menu bawah di portal.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill wait">Menunggu</span>Keputusan dan persiapan</h3><ul>
              <li><b>Pengaktifan periode 2026–2027</b><span>Periodenya mulai 17 Oktober, tapi di sistem masih berstatus “direncanakan” dan harus diaktifkan dengan nomor keputusan resmi.</span><small>Keputusan KPI</small></li>
              <li><b>Mandat dan daftar pengurus resmi</b><span>Belum ada akun pengurus yang bisa diberi izin.</span><small>Keputusan KPI</small></li>
              <li><b>Uji coba bersama pengurus</b><span>Butuh minimal tiga orang dengan peran berbeda.</span><small>KPI dan Dar Dev</small></li>
              <li><b>Pemindai virus untuk berkas</b><span>Berkas yang diunggah tetap ditahan dulu.</span><small>Persetujuan penyedia</small></li>
              <li><b>Asisten AI, email, WhatsApp</b><span>Siap secara teknis, penyedianya belum dipilih.</span><small>Persetujuan penyedia</small></li>
              <li><b>Backup harian</b><span>Backup terenkripsi yang dicek otomatis sudah disiapkan, tapi belum jalan karena akses database untuk backup belum diisi.</span><small>Pemilik repo</small></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section className="alt" id="belum">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Belum sempurna</span>
            <h2 className="h2">Yang belum siap, <em>ditulis apa adanya.</em></h2>
            <p className="lead">Supaya tidak ada yang kaget saat mulai dipakai. Setiap baris menyebut kekurangannya dan apa yang dibutuhkan untuk menutupnya.</p>
          </div>
          <div className="gaps">
            <div className="list"><h3><span className="pill no">Belum bisa dipakai</span></h3><ul>
              <li><b>Semua pekerjaan di portal</b><span>Terkunci selama periode belum aktif dan mandat belum ada, termasuk untuk admin. Portal sudah bisa dibuka dan dilihat.</span><small>Butuh: keputusan periode dan mandat dari KPI</small></li>
              <li><b>Kanal pengaduan untuk Masisir</b><span>Formulirnya ada tapi sengaja ditutup. Pelapor juga belum bisa mengunggah bukti sendiri.</span><small>Butuh: periode aktif, petugas resmi, keputusan soal unggah bukti</small></li>
              <li><b>Unduh dokumen</b><span>Berkas yang diunggah ditahan dan belum bisa diunduh karena belum ada pemindai virus.</span><small>Butuh: penyedia pemindai yang disetujui</small></li>
              <li><b>Pengajuan keuangan dan evaluasi</b><span>Wajib melampirkan bukti yang lolos pemindaian, jadi berhenti di draf selama pemindai belum ada.</span><small>Butuh: penyedia pemindai</small></li>
              <li><b>Jadwal tayang otomatis dan pengingat</b><span>Penjadwal otomatisnya belum dinyalakan, jadi naskah terjadwal dan pengingat tenggat belum berjalan. Naskah tetap bisa ditayangkan manual.</span><small>Butuh: kunci penjadwal di Vercel</small></li>
              <li><b>Asisten AI</b><span>Fiturnya sudah ada, tapi belum tersambung ke penyedia AI mana pun.</span><small>Butuh: pilihan penyedia dan persetujuan pemrosesan data</small></li>
              <li><b>Notifikasi email dan WhatsApp</b><span>Notifikasi hanya muncul di kotak masuk portal.</span><small>Butuh: layanan pengirim</small></li>
            </ul></div>
            <div className="list"><h3><span className="pill wait">Jalan, tapi ada batasnya</span></h3><ul>
              <li><b>Ekspor formulir kasus</b><span>Keluar sebagai halaman cetak yang disimpan jadi PDF lewat browser. Bukan file Word, dan tata letaknya tidak persis sama dengan dokumen asli.</span></li>
              <li><b>Formulir kasus berlabel DRAF</b><span>Status “terverifikasi” hanya catatan petugas, bukan pengesahan. Tanda tangan tidak diverifikasi sistem.</span><small>Butuh: nomor pengesahan SOP dan kategori Sangat Rahasia</small></li>
              <li><b>Keuangan</b><span>Hanya mencatat. Tidak mengirim uang, tidak menghitung kurs rupiah–pound–dolar, dan tidak mengurus pajak.</span></li>
              <li><b>Serah terima</b><span>Menutup paket tidak otomatis mencabut akses pengurus lama. Pencabutan tetap lewat formulir F05.</span></li>
              <li><b>Login</b><span>Cukup email dan kata sandi, tanpa kode OTP. Kata sandi yang kuat dan tidak dipakai ulang jadi pelindung utama akun.</span></li>
              <li><b>Asisten AI, setelah aktif</b><span>Hanya bisa membuat tugas sendiri atau draf rujukan, maksimal 5 sumber dan 100 permintaan per hari per akun.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill info">Belum teruji</span></h3><ul>
              <li><b>Dipakai pengurus sungguhan</b><span>Belum pernah dicoba di website asli oleh beberapa peran sekaligus. Bukti sejauh ini dari pemeriksaan otomatis.</span><small>Butuh: uji coba bersama KPI</small></li>
              <li><b>Klik-per-klik di browser</b><span>53 tes browser sudah mengklik semua modul, tapi di komputer pengembang dengan data latihan, bukan di website asli.</span></li>
              <li><b>Backup dan pemulihan</b><span>Memulihkan database production belum pernah dibuktikan. Isi berkas yang diunggah belum ikut dicadangkan.</span></li>
              <li><b>Lupa kata sandi</b><span>Sudah memakai email pemulihan Supabase, tapi belum dicoba dengan akun asli.</span></li>
              <li><b>Uji penetrasi</b><span>Belum ada uji keamanan oleh pihak luar.</span></li>
            </ul></div>
          </div>
          <div className="list list-wide"><h3><span className="pill no">Teknis, perlu dibereskan</span></h3><ul>
            <li><b>Belum ada tempat uji coba terpisah (staging)</b><span>Setiap perubahan kode langsung tayang di website asli. Belum ada salinan website dan database untuk mencoba dulu.</span><small>Butuh: project Supabase kedua</small></li>
            <li><b>Konten resmi belum lengkap</b><span>Struktur pengurus, kabar, dan dokumen final belum diisi. Website sengaja tidak diisi berita karangan.</span><small>Butuh: bahan dari KPI, lalu dicek lewat Redaksi</small></li>
            <li><b>Kepemilikan akun layanan</b><span>Repo kode, hosting, dan database masih atas nama pengembang. Perlu dipindahkan ke akun milik KPI saat serah terima.</span><small>Butuh: akun resmi KPI di GitHub, Vercel, dan Supabase</small></li>
          </ul></div>
        </div>
      </section>

      <section id="keputusan">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">Perlu diputuskan</span><h2 className="h2">Enam hal yang perlu <em>diputuskan KPI.</em></h2><p className="lead">Tanpa keputusan ini, sistemnya sudah jadi tapi belum bisa dipakai bekerja.</p></div>
          <div className="decide">
            <div className="card urgent"><span className="q" /><h3>Aktifkan periode 2026–2027</h3><p>Paling mendesak. Cukup nomor keputusan resminya; pengaktifannya dikerjakan pengembang dalam hitungan menit.</p></div>
            <div className="card"><span className="q" /><h3>Tetapkan mandat pejabat</h3><p>Siapa memegang apa, di divisi mana, sampai kapan, dan berdasarkan keputusan apa.</p></div>
            <div className="card"><span className="q" /><h3>Tunjuk 3–5 pengurus untuk uji coba</h3><p>Minimal satu pemohon, satu pejabat yang memutuskan, dan satu pelaksana. Kirim nama, jabatan, dan email masing-masing.</p></div>
            <div className="card"><span className="q" /><h3>Pilih penyedia pemindai berkas</h3><p>Tanpa ini, dokumen yang diunggah tidak bisa diunduh atau dipakai sebagai bukti.</p></div>
            <div className="card"><span className="q" /><h3>Putuskan soal AI, email, dan WhatsApp</h3><p>Penyedia mana yang dipakai dan persetujuan pemrosesan datanya.</p></div>
            <div className="card"><span className="q" /><h3>Sahkan SOP</h3><p>Kategori Sangat Rahasia dan nomor pengesahan SOP, supaya formulir kasus tidak lagi berlabel DRAF.</p></div>
          </div>
        </div>
      </section>

      <section className="alt" id="langkah">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">Setelah membaca ini</span><h2 className="h2">Langkah berikutnya, <em>siapa mengerjakan apa.</em></h2></div>
          <div className="road">
            <div className="phase"><span className="when">Sekarang · Ketua dan pengurus inti KPI</span><h3>Kirim tiga hal ke pengembang</h3><ul className="ticks"><li>Nomor keputusan pengaktifan periode 2026–2027</li><li>Nama, jabatan, dan email 3–5 pengurus untuk uji coba</li><li>Nama pejabat yang memberi izin akses dan nomor mandatnya</li></ul></div>
            <div className="phase"><span className="when">Setelah itu · Admin KPI dan pengembang</span><h3>Buka akses dan uji coba bersama</h3><ul className="ticks"><li>Aktifkan periode, buat dan aktifkan akun penguji</li><li>Penguji masuk dan mencoba tugas, rapat, keuangan, dan kasus dengan panduan uji</li><li>Catat temuan, perbaiki, lalu coba ulang</li></ul></div>
            <div className="phase"><span className="when">Sebelum rilis untuk Masisir</span><h3>Rilis resmi dan serah terima</h3><ul className="ticks"><li>Sambungkan pemindai berkas, lalu buka kanal pengaduan</li><li>Nyalakan backup harian dan buktikan pemulihannya</li><li>Pindahkan akun GitHub, Vercel, dan Supabase ke KPI, lalu tanda tangan berita acara serah terima</li></ul></div>
          </div>
        </div>
      </section>

      <section className="close">
        <div className="wrap">
          <span className="eyebrow">Penutup</span>
          <h2 className="h1">Sistemnya sudah dibangun untuk Masisir. <em>Tinggal diaktifkan bersama.</em></h2>
          <p className="lead">Langkah pertama ada di tangan KPI: kirim nomor keputusan periode dan nama pengurus yang ikut uji coba. Setelah itu, akun bisa dibuat dan uji coba langsung dimulai.</p>
          <div className="btns"><a className="btn primary" href="/masuk">Buka halaman masuk</a><a className="btn" href="#atas">↑ Kembali ke atas</a></div>
        </div>
      </section>
    </div>

    <footer className="pitch-footer">
      <div className="wrap">
        <span>Disusun dari kode sistem, dokumen perencanaan, dan catatan perkembangan pengembangan, per 30 Oktober 2026.</span>
        <span>Tangkapan layar portal diambil dari aplikasi di komputer pengembang dengan data contoh bertanda TEST. Tidak ada data Masisir di halaman ini.</span>
      </div>
    </footer>
  </div>;
}
