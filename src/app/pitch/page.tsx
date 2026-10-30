import type { Metadata } from "next";
import Image from "next/image";
import { IconDatabase, IconLayoutSidebar, IconWorld } from "@tabler/icons-react";
import { PitchModuleTabs, PitchNav, type PitchModule, type PitchSection } from "@/components/pitch/pitch-interactive";
import "./pitch.css";

export const metadata: Metadata = {
  title: "Pitch Sistem Digital | KPI PPMI Mesir",
  description: "Penjelasan Sistem Digital KPI PPMI Mesir untuk Sidi Abdul dan pengurus: isinya apa, cara masuk portal, apa yang sudah jalan, dan apa yang perlu dilakukan sekarang.",
  alternates: { canonical: "/pitch" },
  robots: { index: false, follow: false }
};

const sections: PitchSection[] = [
  { id: "isi", label: "Isinya" }, { id: "kenapa", label: "Kenapa" }, { id: "website", label: "Website" }, { id: "portal", label: "Portal" },
  { id: "alur", label: "Alur laporan" }, { id: "keamanan", label: "Keamanan" }, { id: "masuk", label: "Cara masuk" }, { id: "kesiapan", label: "Kesiapan" },
  { id: "belum", label: "Belum siap" }, { id: "keputusan", label: "Keputusan" }, { id: "langkah", label: "Langkah" }
];

const modules: PitchModule[] = [
  { key: "workspace", label: "Ruang kerja", url: "/portal/workspace", image: "/pitch/p-workspace.jpg", title: "Buka portal, langsung kelihatan apa yang harus dikerjakan hari ini.", lead: "Ini halaman pertama setelah masuk. Isinya cuma pekerjaan, rapat, dan pemeriksaan punyamu sendiri, jadi nggak perlu scroll grup buat nyari tugas.", ticks: ["Tugas yang jalan, yang nunggu dicek, dan yang tersendat", "Hal-hal yang lagi nunggu keputusanmu", "Cari tugas, rapat, atau dokumen yang boleh kamu buka"] },
  { key: "tugas", label: "Tugas", url: "/portal/tugas", image: "/pitch/p-tugas.jpg", title: "Tugas baru dianggap beres setelah dicek orang lain.", lead: "Urutannya: belum dikerjakan, sedang dikerjakan, menunggu diperiksa, lalu selesai. Tahap diperiksa nggak bisa dilompati, koordinator pun nggak bisa.", ticks: ["Bisa dilihat sebagai papan (kanban) atau tabel", "Ada subtugas, tugas yang saling nunggu, templat, dan kolom diskusi", "Tugas yang tersendat atau lewat tenggat langsung ditandai"] },
  { key: "rapat", label: "Rapat", url: "/portal/rapat", image: "/pitch/p-rapat.jpg", title: "Hasil rapat tersimpan lengkap: siapa yang hadir dan apa tindak lanjutnya.", lead: "Jadwalnya pakai waktu Kairo. Undangan, notulen, voting, sampai tindak lanjut ada di satu halaman rapat.", ticks: ["Konfirmasi hadir dan daftar hadir", "Notulen punya riwayat versi dan disahkan orang lain", "Voting pakai kuorum; tindak lanjut bisa langsung jadi tugas"] },
  { key: "keuangan", label: "Keuangan", url: "/portal/keuangan", image: "/pitch/p-keuangan.jpg", title: "Setiap rupiah, pound, dan dolar ada jejaknya.", lead: "Anggaran dibagi per pos, bisa dalam IDR, EGP, atau USD. Sistem cuma mencatat; uangnya tetap dipegang dan dikirim bendahara seperti biasa.", ticks: ["Pengajuan wajib pakai bukti, misalnya foto kuitansi", "Yang mengajukan, memeriksa, dan menyetujui harus orang yang beda", "Rekap pembayaran dan laporan bisa diunduh"] },
  { key: "evaluasi", label: "Evaluasi", url: "/portal/evaluasi", image: "/pitch/p-evaluasi.jpg", title: "Penilaian kinerja pengurus yang bisa dilacak sampai ke buktinya.", lead: "Nilainya pakai kriteria yang bobotnya jelas. Kalau datanya belum ada, nilainya nggak otomatis dianggap nol.", ticks: ["Nilai 0–100 lengkap dengan alasan per kriteria", "Dicek orang lain, dan yang dinilai boleh keberatan satu kali", "Hasil penilaian per orang dijaga RAHASIA"] },
  { key: "redaksi", label: "Redaksi", url: "/portal/editor", image: "/pitch/p-editor.jpg", title: "Kabar dan rilis KPI ditulis, dicek, baru tayang.", lead: "Tulisan baru muncul di website setelah disetujui orang lain. Setiap kali disimpan jadi versi baru, jadi nggak ada tulisan yang hilang gara-gara ketimpa.", ticks: ["Status draf, menunggu dicek, tayang, dan arsip", "Bisa bahasa Indonesia dan Inggris", "Ada peringatan kalau tulisan memuat data pribadi"] },
  { key: "handover", label: "Serah terima", url: "/portal/handover", image: "/pitch/p-handover.jpg", title: "Ganti kepengurusan tanpa ada arsip yang hilang.", lead: "Pengurus lama menyiapkan paket, penerusnya menerima satu per satu. Akses lama nggak ikut diwariskan begitu saja.", ticks: ["Paket berisi dokumen yang sudah diperiksa", "Penerus mengonfirmasi setiap item yang diterima", "Akses pengurus lama tetap dicabut lewat formulir resmi"] }
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
            <h1 className="h1">Semua kerja KPI untuk Masisir, dari laporan pertama sampai serah terima pengurus, <em>rapi di satu tempat.</em></h1>
            <p className="lead">Kita semua tahu rasanya: catatan tercecer di grup WhatsApp, file ada di Drive pribadi, dan yang paling paham kasusnya sebentar lagi lulus atau pulang ke tanah air. Sistem ini dibuat supaya hal itu nggak terjadi lagi. Ada website untuk Masisir, portal kerja untuk pengurus, dan aturan akses yang menjaga cerita pelapor tetap rahasia.</p>
            <div className="btns"><a className="btn primary" href="#isi">Mulai baca →</a><a className="btn" href="#masuk">Cara masuk portal</a><a className="btn" href="#langkah">Apa yang perlu dilakukan sekarang</a></div>
            <div className="hero-meta"><span>Per <b>30 Oktober 2026</b></span><span>Dibuat oleh <b>Dar Dev</b></span><span>Untuk <b>Sidi Abdul, Ketua KPI</b></span></div>
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
              <p className="lead">Yang dibuka Masisir dan yang dipakai pengurus ada di satu aplikasi, dengan satu database milik KPI. Nggak ada data yang nyangkut di laptop atau akun pribadi pengurus.</p>
              <p className="lead">Rancangan, panduan, dan catatan perkembangannya juga ikut disimpan. Jadi pengurus periode depan bisa langsung lanjut, nggak perlu mulai dari nol.</p>
            </div>
            <div className="parts">
              <div className="part"><div className="ic"><IconWorld aria-hidden="true" size={22} /></div><div><h3>Website untuk Masisir</h3><p>Siapa KPI, divisinya apa saja, kabar dan publikasi, layanan, sampai formulir pengaduan. Ada versi bahasa Indonesia dan Inggris.</p></div></div>
              <div className="part"><div className="ic"><IconLayoutSidebar aria-hidden="true" size={22} /></div><div><h3>Portal pengurus</h3><p>Tempat kerja sehari-hari setelah masuk: tugas, rapat, dokumen, keuangan, evaluasi, kasus, redaksi, dan serah terima. Enak dibuka dari HP juga.</p></div></div>
              <div className="part"><div className="ic"><IconDatabase aria-hidden="true" size={22} /></div><div><h3>Aturan siapa boleh lihat apa</h3><p>Dijaga langsung oleh database, bukan cuma disembunyikan dari tampilan. Jadi nggak bisa diakali dengan nebak-nebak alamat halaman.</p></div></div>
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
            <h2 className="h2">Pengurus datang dan pergi tiap periode. <em>Amanah dan catatannya jangan sampai ikut pergi.</em></h2>
            <p className="lead">Ini pertanyaan yang sering muncul di kepengurusan, dan jawaban sistemnya.</p>
          </div>
          <div className="grid3">
            <div className="card"><span className="who">Pengurus</span><h3>“Tugasku yang mana, tenggatnya kapan? Apalagi pas musim imtihan.”</h3><p>Ruang kerja cuma menampilkan tugas, rapat, dan pemeriksaan punyamu. Nggak perlu scroll ratusan chat.</p></div>
            <div className="card"><span className="who">Koordinator divisi</span><h3>“Katanya sudah beres. Buktinya mana?”</h3><p>Tugas baru diterima kalau diajukan pakai bukti dan sudah dicek orang lain.</p></div>
            <div className="card"><span className="who">Petugas kasus</span><h3>“Ini cerita teman sendiri. Harus benar-benar rahasia.”</h3><p>Kasus cuma bisa dibuka orang yang ditugaskan. Catatan internal dipisah dari kabar yang dilihat pelapor.</p></div>
            <div className="card"><span className="who">Bendahara</span><h3>“Uang kas dipakai buat apa, siapa yang setuju?”</h3><p>Yang mengajukan, memeriksa, menyetujui, dan membayar orangnya beda-beda. Semuanya tercatat, mau rupiah, pound, atau dolar.</p></div>
            <div className="card"><span className="who">Media & Publikasi</span><h3>“Draf rilis jangan sampai tayang duluan.”</h3><p>Tulisan baru muncul di website setelah disetujui orang lain. Draf juga nggak ikut muncul di pencarian.</p></div>
            <div className="card"><span className="who">Pengurus baru</span><h3>“Baru dilantik. Mulai dari mana, ya?”</h3><p>Pengurus lama menyerahkan arsip satu per satu, tanpa harus membuka seluruh arsip lama ke semua orang.</p></div>
          </div>
        </div>
      </section>

      <section id="website">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Website untuk Masisir</span>
            <h2 className="h2">Yang pertama dilihat Masisir: <em>siapa KPI dan ke mana bisa bercerita.</em></h2>
            <p className="lead">Sudah online dan bisa dibuka siapa saja. Yang tampil di sini cuma tulisan yang sudah disetujui lewat Redaksi di portal.</p>
          </div>
          <div className="gallery">
            <figure><Frame alt="Halaman layanan pengaduan dengan kartu Kanal resmi sedang disiapkan" src="/pitch/d-pengaduan.jpg" url="/publik/pengaduan" /><figcaption><b>Layanan pengaduan</b><span>Formulir dan tahapannya sudah siap. Sengaja belum dibuka sampai periode aktif dan petugasnya resmi, biar nggak ada laporan Masisir yang masuk tapi nggak ada yang pegang.</span></figcaption></figure>
            <figure><Frame alt="Halaman profil divisi KPI" src="/pitch/d-divisi.jpg" url="/publik/divisi" /><figcaption><b>Profil divisi</b><span>Setiap divisi punya halaman sendiri, lengkap dengan logonya.</span></figcaption></figure>
            <figure><Frame alt="Versi bahasa Inggris situs KPI" src="/pitch/d-en.jpg" url="/en" /><figcaption><b>Versi bahasa Inggris</b><span>Buat mitra, kampus, dan pihak luar. Isinya dikelola terpisah dari versi Indonesia.</span></figcaption></figure>
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
            <p className="lead">Klik nama modulnya untuk lihat layarnya. Isi yang bertanda TEST itu data contoh di komputer Dar Dev, bukan data Masisir sungguhan.</p>
          </div>
          <PitchModuleTabs modules={modules} />
          <div className="sec-head phones-head"><span className="eyebrow">Di HP</span><h3 className="h2">Nyaman dibuka dari HP, dengan menu bawah buat modul yang paling sering dipakai.</h3></div>
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
            <p className="lead">Alurnya sudah terpasang dan lolos uji otomatis. Belum dipakai untuk laporan sungguhan karena kanal pengaduannya memang masih ditutup.</p>
          </div>
          <ol className="flow">
            <li className="step"><span className="who">Masisir</span><b>Mengirim laporan</b><span>Lewat formulir di website, lalu dapat kode untuk memantau perkembangannya.</span></li>
            <li className="step"><span className="who">Sekretariat</span><b>Menerima dan mencatat</b><span>Laporan masuk ke antrean tertutup. Pengurus lain nggak bisa melihatnya.</span></li>
            <li className="step"><span className="who">Sekretariat</span><b>Menunjuk petugas</b><span>Diteruskan ke divisi Intelijen & Operasional sesuai mandat.</span></li>
            <li className="step"><span className="who">Petugas</span><b>Menangani sesuai SOP</b><span>Pakai tujuh formulir SOP, catatan bukti, dan riwayat perpindahan bukti.</span></li>
            <li className="step"><span className="who">Pemeriksa lain</span><b>Mengecek sebelum ditutup</b><span>Harus orang yang beda dari penyusun dan pemegang kasus.</span></li>
            <li className="step"><span className="who">Masisir</span><b>Memantau perkembangan</b><span>Pelapor cuma melihat kabar untuknya, bukan catatan internal petugas.</span></li>
          </ol>
        </div>
      </section>

      <section className="statement">
        <div className="wrap">
          <h2 className="h2">Yang membuat nggak boleh menyetujui sendiri. <em>Yang menyetujui nggak boleh membayar sendiri.</em></h2>
          <p>Prinsip ini berlaku di tugas, keuangan, evaluasi, redaksi, kasus, dan izin akses. Database yang menolak kalau orangnya sama, jadi nggak bisa dilewati walaupun tombolnya diakali.</p>
        </div>
      </section>

      <section id="keamanan">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Keamanan data</span>
            <h2 className="h2">Setiap orang cuma bisa membuka data <em>yang memang haknya.</em></h2>
            <p className="lead">Mengikuti SOP Kerahasiaan KPI versi 1.1. Yang dijaga di sini cerita dan nama baik sesama Masisir.</p>
          </div>
          <div className="grid3">
            <div className="card"><h3>Izin per divisi, periode, dan berkas</h3><p>Seseorang bisa dikasih akses ke satu kasus atau satu dokumen saja, tanpa harus membuka seluruh arsip.</p></div>
            <div className="card"><h3>Admin nggak otomatis bisa membaca</h3><p>Pengelola sistem nggak bisa membuka isi kasus atau penilaian tanpa izin resmi. Satu-satunya pengecualian akun super admin KPI, yang disetujui tertulis, tercatat, dan bisa dicabut kapan saja.</p></div>
            <div className="card"><h3>Berkas tertutup</h3><p>Dokumen nggak punya alamat publik. Tautan unduhnya cuma berlaku 60 detik setelah izinnya dicek.</p></div>
            <div className="card"><h3>Semua tindakan tercatat</h3><p>Setiap pengajuan, persetujuan, dan perubahan menyimpan siapa pelakunya, kapan, dan versi yang mana.</p></div>
            <div className="card"><h3>Halaman pengurus wajib masuk</h3><p>Pengunjung yang belum masuk ditolak di semua halaman dan data internal. Ini dicek ulang setiap kali ada rilis.</p></div>
            <div className="card"><h3>Data KPI nggak dipakai melatih AI</h3><p>Asisten AI cuma membaca sumber yang boleh dibaca penggunanya, dan usulannya harus dikonfirmasi manusia.</p></div>
          </div>
          <p className="note">26 Oktober: Dar Dev menemukan celah keamanan serius di Next.js, kerangka yang dipakai aplikasi ini, lewat pemeriksaan rutin, dan sudah ditambal dengan pembaruan ke versi 16.4.3.</p>
        </div>
      </section>

      <section className="alt" id="masuk">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Cara masuk portal</span>
            <h2 className="h2">Akunnya dibuatkan admin KPI. <em>Pengurus tinggal bikin kata sandi sendiri.</em></h2>
            <p className="lead">Nggak ada pendaftaran mandiri, supaya yang bisa masuk cuma pengurus resmi. Alamat masuknya <b>kpi-dardev.vercel.app/masuk</b>.</p>
          </div>
          <ol className="flow">
            <li className="step"><span className="who">Admin KPI</span><b>Mendaftarkan email pengurus</b><span>Di Supabase: Authentication → Users → Add user → Create new user. Isi email pengurus, centang Auto Confirm User, dan isi kata sandi sementara apa saja (nggak perlu dikasih tahu ke pengurus).</span></li>
            <li className="step"><span className="who">Dar Dev</span><b>Mengaktifkan akun</b><span>Menjalankan skrip aktivasi akun di database. Kalau langkah ini terlewat, login ditolak dengan pesan “akun belum diaktifkan”.</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Bikin kata sandi</b><span>Buka kpi-dardev.vercel.app/masuk/lupa-sandi, isi email tadi, lalu klik tautan yang masuk ke email (berlaku 30 menit).</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Masuk ke portal</b><span>Buka kpi-dardev.vercel.app/masuk, isi email dan kata sandi, lalu klik “Masuk ke portal”.</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Cek profil dan hak akses</b><span>Buka Profil dan Hak akses saya. Kalau modulnya masih kosong, tenang, itu wajar sampai jabatan dan izinmu ditetapkan.</span></li>
            <li className="step"><span className="who">Admin dan pejabat</span><b>Menetapkan jabatan dan izin</b><span>Admin mengisi jabatan di Pengaturan, pengurus mengajukan izin lewat formulir F01, lalu pejabat yang berwenang menyetujui.</span></li>
          </ol>
          <div className="ready">
            <div className="list"><h3><span className="pill info">Kalau nggak bisa masuk</span></h3><ul>
              <li><b>Muncul “Email atau kata sandi tidak sesuai, atau akun belum diaktifkan”</b><span>Cek lagi ejaan emailnya. Kalau sudah benar, hubungi admin KPI untuk memastikan akunmu sudah diaktifkan.</span></li>
              <li><b>Email untuk bikin kata sandi nggak datang</b><span>Cek folder Spam atau Promosi. Pengirimnya cuma bisa kirim beberapa email per jam, jadi tunggu sebentar sebelum coba lagi.</span></li>
              <li><b>Tautan di email sudah kedaluwarsa</b><span>Ulangi dari Lupa kata sandi. Tautannya cuma berlaku 30 menit dan sekali pakai.</span></li>
              <li><b>Sudah masuk, tapi muncul “Penugasan diperlukan”</b><span>Akunmu sudah benar, tinggal jabatan atau izinmu yang belum ditetapkan. Hubungi admin KPI.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill ok">Jaga akunmu</span></h3><ul>
              <li><b>Pakai kata sandi khusus buat portal ini</b><span>Jangan samakan dengan Instagram, email, atau akun lain. Portal ini nggak pakai kode OTP, jadi kata sandi adalah satu-satunya kunci.</span></li>
              <li><b>Jangan pinjamkan akun</b><span>Semua tindakan tercatat atas nama pemilik akun, termasuk persetujuan keuangan dan kasus.</span></li>
              <li><b>Keluar dari HP atau laptop pinjaman</b><span>Klik Keluar setelah selesai, apalagi di laptop teman sakan, warnet, atau HP yang dipakai bareng.</span></li>
              <li><b>Kalau masa jabatan selesai</b><span>Aksesnya dicabut lewat formulir pengakhiran (F05), bukan dengan menghapus akun, biar riwayat kerjamu tetap utuh.</span></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section id="kesiapan">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kesiapan</span>
            <h2 className="h2">Mana yang sudah jalan, <em>mana yang masih menunggu.</em></h2>
            <p className="lead">Sebagian besar yang menunggu tinggal keputusan Sidi Abdul sebagai Ketua KPI. Dar Dev sengaja nggak membuat periode, mandat, atau akun pengurus sendiri, karena itu wewenang KPI.</p>
          </div>
          <div className="ready">
            <div className="list"><h3><span className="pill ok">Sudah jalan</span>Terpasang dan bisa dicek</h3><ul>
              <li><b>Website ID dan EN</b><span>Online di kpi-dardev.vercel.app, dan langsung terbarui setiap ada perubahan.</span></li>
              <li><b>Login pengurus</b><span>Pakai database Supabase milik KPI.</span></li>
              <li><b>Database semua modul</b><span>Sudah lengkap terpasang di server production.</span></li>
              <li><b>Super admin KPI</b><span>Sudah aktif untuk akun resmi KPI. Sekarang bisa melihat semua modul, dan bisa mengubah data setelah periode diaktifkan.</span></li>
              <li><b>Alarm kalau website mati</b><span>Dicek setiap 15 menit. Kalau ada masalah, Dar Dev langsung dapat notifikasi.</span></li>
              <li><b>Aturan akses dan pembagian wewenang</b><span>Diuji otomatis setiap ada perubahan.</span></li>
              <li><b>Formulir dan alur kasus</b><span>Tujuh formulir SOP, 1.114 kolom isian, dan catatan bukti.</span></li>
              <li><b>Tampilan HP dan tablet</b><span>Termasuk menu bawah di portal.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill wait">Menunggu</span>Keputusan dan persiapan</h3><ul>
              <li><b>Pengaktifan periode 2026–2027</b><span>Periodenya sudah mulai 17 Oktober, tapi di sistem masih tercatat “direncanakan”. Begitu ada nomor keputusannya, Dar Dev bisa mengaktifkannya dalam hitungan menit.</span><small>Sidi Abdul</small></li>
              <li><b>Mandat dan daftar pengurus resmi</b><span>Belum ada akun pengurus yang bisa dikasih izin.</span><small>Sidi Abdul</small></li>
              <li><b>Uji coba bersama pengurus</b><span>Butuh minimal tiga orang dengan peran yang beda.</span><small>Sidi Abdul dan Dar Dev</small></li>
              <li><b>Pemindai virus untuk berkas</b><span>Dar Dev yang menyiapkan pemindainya. Selama belum aktif, berkas yang diunggah ditahan dulu.</span><small>Dar Dev, setelah disetujui Sidi Abdul</small></li>
              <li><b>Asisten AI, email, dan WhatsApp</b><span>Secara teknis sudah siap. Dar Dev yang menyambungkan layanannya.</span><small>Dar Dev, setelah disetujui Sidi Abdul</small></li>
              <li><b>Backup harian</b><span>Backup terenkripsi yang dicek otomatis sudah disiapkan, tinggal diisi akses database-nya.</span><small>Dar Dev</small></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section className="alt" id="belum">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Belum sempurna</span>
            <h2 className="h2">Yang belum siap, <em>kami tulis apa adanya.</em></h2>
            <p className="lead">Biar nggak ada yang kaget waktu mulai dipakai. Setiap baris menyebut kurangnya di mana dan apa yang dibutuhkan untuk menutupnya.</p>
          </div>
          <div className="gaps">
            <div className="list"><h3><span className="pill no">Belum bisa dipakai</span></h3><ul>
              <li><b>Semua pekerjaan di portal</b><span>Masih terkunci selama periode belum aktif dan mandat belum ada, termasuk untuk admin. Portalnya sendiri sudah bisa dibuka dan dilihat.</span><small>Butuh: keputusan periode dan mandat dari Sidi Abdul</small></li>
              <li><b>Kanal pengaduan untuk Masisir</b><span>Formulirnya ada tapi sengaja ditutup. Pelapor juga belum bisa mengunggah bukti sendiri.</span><small>Butuh: periode aktif, petugas resmi, dan keputusan soal unggah bukti</small></li>
              <li><b>Unduh dokumen</b><span>Berkas yang diunggah ditahan dan belum bisa diunduh, karena pemindai virusnya belum aktif.</span><small>Butuh: persetujuan Sidi Abdul untuk pemindai dari Dar Dev</small></li>
              <li><b>Pengajuan keuangan dan evaluasi</b><span>Wajib melampirkan bukti yang lolos pemindaian, jadi untuk sementara berhenti di draf.</span><small>Butuh: pemindai berkas aktif</small></li>
              <li><b>Jadwal tayang otomatis dan pengingat</b><span>Penjadwal otomatisnya belum dinyalakan, jadi tulisan terjadwal dan pengingat tenggat belum jalan. Tulisan tetap bisa ditayangkan manual.</span><small>Dar Dev</small></li>
              <li><b>Asisten AI</b><span>Fiturnya sudah ada, tapi belum disambungkan ke layanan AI.</span><small>Butuh: persetujuan Sidi Abdul soal pemakaian data</small></li>
              <li><b>Notifikasi email dan WhatsApp</b><span>Untuk sekarang notifikasi cuma muncul di kotak masuk portal.</span><small>Butuh: persetujuan Sidi Abdul, lalu disambungkan Dar Dev</small></li>
            </ul></div>
            <div className="list"><h3><span className="pill wait">Jalan, tapi ada batasnya</span></h3><ul>
              <li><b>Ekspor formulir kasus</b><span>Keluarnya berupa halaman cetak yang disimpan jadi PDF lewat browser. Bukan file Word, dan tata letaknya nggak persis sama dengan dokumen aslinya.</span></li>
              <li><b>Formulir kasus masih berlabel DRAF</b><span>Status “terverifikasi” cuma catatan petugas, belum pengesahan. Tanda tangan nggak diverifikasi sistem.</span><small>Butuh: nomor pengesahan SOP dan kategori Sangat Rahasia</small></li>
              <li><b>Keuangan</b><span>Cuma mencatat. Nggak mengirim uang, nggak menghitung kurs rupiah–pound–dolar, dan nggak mengurus pajak.</span></li>
              <li><b>Serah terima</b><span>Menutup paket nggak otomatis mencabut akses pengurus lama. Pencabutannya tetap lewat formulir F05.</span></li>
              <li><b>Login</b><span>Cukup email dan kata sandi, tanpa kode OTP. Jadi kata sandi yang kuat dan nggak dipakai di tempat lain itu penting banget.</span></li>
              <li><b>Asisten AI, setelah aktif</b><span>Cuma bisa membuat tugas sendiri atau draf rujukan, maksimal 5 sumber dan 100 permintaan per hari per akun.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill info">Belum teruji</span></h3><ul>
              <li><b>Dipakai pengurus sungguhan</b><span>Belum pernah dicoba di website asli oleh beberapa peran sekaligus. Buktinya sejauh ini dari pemeriksaan otomatis.</span><small>Butuh: uji coba bersama</small></li>
              <li><b>Diklik satu per satu di browser</b><span>53 tes browser sudah mencoba semua modul, tapi di komputer Dar Dev dengan data latihan, belum di website asli.</span></li>
              <li><b>Backup dan pemulihan</b><span>Memulihkan database production belum pernah dibuktikan, dan isi berkas yang diunggah belum ikut dicadangkan.</span></li>
              <li><b>Lupa kata sandi</b><span>Sudah pakai email pemulihan Supabase, tapi belum dicoba dengan akun asli.</span></li>
              <li><b>Uji keamanan dari pihak luar</b><span>Belum ada orang luar yang mencoba membobol sistemnya.</span></li>
            </ul></div>
          </div>
          <div className="list list-wide"><h3><span className="pill no">Teknis, perlu dibereskan</span></h3><ul>
            <li><b>Belum ada tempat uji coba terpisah (staging)</b><span>Setiap perubahan kode langsung tayang di website asli. Belum ada salinan website dan database buat coba-coba dulu.</span><small>Dar Dev</small></li>
            <li><b>Konten resmi belum lengkap</b><span>Struktur pengurus, kabar, dan dokumen final belum diisi. Website sengaja nggak diisi berita karangan.</span><small>Butuh: bahan dari KPI, lalu dicek lewat Redaksi</small></li>
            <li><b>Akun layanan masih atas nama Dar Dev</b><span>Repo kode, hosting, dan database perlu dipindahkan ke akun milik KPI waktu serah terima.</span><small>Dar Dev dan Sidi Abdul</small></li>
          </ul></div>
        </div>
      </section>

      <section id="keputusan">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">Perlu diputuskan</span><h2 className="h2">Enam hal yang perlu <em>diputuskan Sidi Abdul.</em></h2><p className="lead">Sistemnya sudah jadi. Tanpa keputusan ini, belum bisa dipakai untuk bekerja.</p></div>
          <div className="decide">
            <div className="card urgent"><span className="q" /><h3>Aktifkan periode 2026–2027</h3><p>Yang paling mendesak. Cukup kirim nomor keputusannya, pengaktifannya dikerjakan Dar Dev dalam hitungan menit.</p></div>
            <div className="card"><span className="q" /><h3>Tetapkan mandat pejabat</h3><p>Siapa pegang apa, di divisi mana, sampai kapan, dan berdasarkan keputusan apa.</p></div>
            <div className="card"><span className="q" /><h3>Tunjuk 3–5 pengurus untuk uji coba</h3><p>Minimal satu yang mengajukan, satu pejabat yang memutuskan, dan satu pelaksana. Kirim nama, jabatan, dan email masing-masing.</p></div>
            <div className="card"><span className="q" /><h3>Setujui pemindai berkas</h3><p>Dar Dev yang menyiapkan. Tanpa pemindai, dokumen yang diunggah belum bisa diunduh atau dipakai sebagai bukti.</p></div>
            <div className="card"><span className="q" /><h3>Setujui AI, email, dan WhatsApp</h3><p>Dar Dev yang menyambungkan. Sidi Abdul cukup memutuskan mau dipakai atau tidak, dan setuju soal pemakaian datanya.</p></div>
            <div className="card"><span className="q" /><h3>Sahkan SOP</h3><p>Kategori Sangat Rahasia dan nomor pengesahan SOP, biar formulir kasus nggak lagi berlabel DRAF.</p></div>
          </div>
        </div>
      </section>

      <section className="alt" id="langkah">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">Setelah baca ini</span><h2 className="h2">Langkah berikutnya, <em>siapa mengerjakan apa.</em></h2></div>
          <div className="road">
            <div className="phase"><span className="when">Sekarang · Sidi Abdul, Ketua KPI</span><h3>Kirim tiga hal ke Dar Dev</h3><ul className="ticks"><li>Nomor keputusan pengaktifan periode 2026–2027</li><li>Nama, jabatan, dan email 3–5 pengurus untuk uji coba</li><li>Nama pejabat yang memberi izin akses, beserta nomor mandatnya</li></ul></div>
            <div className="phase"><span className="when">Setelah itu · Admin KPI dan Dar Dev</span><h3>Buka akses dan uji coba bareng</h3><ul className="ticks"><li>Periode diaktifkan, akun penguji dibuat dan diaktifkan</li><li>Penguji masuk dan mencoba tugas, rapat, keuangan, dan kasus pakai panduan uji</li><li>Temuan dicatat, diperbaiki Dar Dev, lalu dicoba ulang</li></ul></div>
            <div className="phase"><span className="when">Sebelum dibuka untuk Masisir</span><h3>Rilis resmi dan serah terima</h3><ul className="ticks"><li>Pemindai berkas disambungkan, lalu kanal pengaduan dibuka</li><li>Backup harian dinyalakan dan pemulihannya dibuktikan</li><li>Akun GitHub, Vercel, dan Supabase dipindah ke KPI, lalu berita acara serah terima ditandatangani</li></ul></div>
          </div>
        </div>
      </section>

      <section className="close">
        <div className="wrap">
          <span className="eyebrow">Penutup</span>
          <h2 className="h1">Sistemnya sudah dibangun untuk Masisir. <em>Tinggal kita aktifkan bersama.</em></h2>
          <p className="lead">Langkah pertamanya ada di Sidi Abdul: kirim nomor keputusan periode dan nama pengurus yang ikut uji coba. Begitu itu masuk, akun bisa langsung dibuat dan uji coba bisa dimulai.</p>
          <div className="btns"><a className="btn primary" href="/masuk">Buka halaman masuk</a><a className="btn" href="#atas">↑ Kembali ke atas</a></div>
        </div>
      </section>
    </div>

    <footer className="pitch-footer">
      <div className="wrap">
        <span>Disusun Dar Dev dari kode sistem, dokumen perencanaan, dan catatan perkembangan, per 30 Oktober 2026.</span>
        <span>Tangkapan layar portal diambil di komputer Dar Dev dengan data contoh bertanda TEST. Nggak ada data Masisir di halaman ini.</span>
      </div>
    </footer>
  </div>;
}
