import type { Metadata } from "next";
import Image from "next/image";
import { IconDatabase, IconLayoutSidebar, IconWorld } from "@tabler/icons-react";
import { PitchModuleTabs, PitchNav, type PitchModule, type PitchSection } from "@/components/pitch/pitch-interactive";
import "./pitch.css";

export const metadata: Metadata = {
  title: "Pitch Sistem Digital | KPI PPMI Mesir",
  description: "Penjelasan isi Sistem Digital KPI PPMI Mesir: website, portal pengurus, alur, keamanan, kesiapan, dan keputusan yang ditunggu.",
  alternates: { canonical: "/pitch" },
  robots: { index: false, follow: false }
};

const sections: PitchSection[] = [
  { id: "isi", label: "Isinya" }, { id: "kenapa", label: "Kenapa" }, { id: "website", label: "Website" }, { id: "portal", label: "Portal" },
  { id: "alur", label: "Alur" }, { id: "keamanan", label: "Keamanan" }, { id: "kesiapan", label: "Kesiapan" }, { id: "belum", label: "Belum siap" },
  { id: "keputusan", label: "Keputusan" }, { id: "rencana", label: "Rencana" }
];

const modules: PitchModule[] = [
  { key: "workspace", label: "Ruang kerja", url: "/portal/workspace", image: "/pitch/p-workspace.jpg", title: "Satu layar untuk tahu apa yang harus dikerjakan hari ini.", lead: "Halaman pertama setelah login. Isinya menyesuaikan akun dan periode yang dipilih.", ticks: ["Jumlah pekerjaan, antrean review, hambatan, dan rapat mendatang", "Daftar tindakan yang menunggu keputusan akun ini", "Pencarian tugas, rapat, dan dokumen yang boleh dibuka"] },
  { key: "tugas", label: "Tugas", url: "/portal/tugas", image: "/pitch/p-tugas.jpg", title: "Papan tugas yang tidak bisa melompati pemeriksaan.", lead: "Tugas bergerak dari belum dikerjakan sampai selesai, tapi tahap “Menunggu diperiksa” wajib dilalui.", ticks: ["Papan kanban dan tampilan tabel", "Subtugas, dependensi, template, dan diskusi", "Penanda tugas terhambat dan lewat tenggat"] },
  { key: "rapat", label: "Rapat", url: "/portal/rapat", image: "/pitch/p-rapat.jpg", title: "Keputusan rapat tersimpan bersama konteksnya.", lead: "Kalender memakai waktu Kairo. Notulen, voting, dan tindak lanjut ada di rapat yang sama.", ticks: ["RSVP dan presensi", "Notulen berversi yang disetujui orang lain", "Voting dengan kuorum, tindak lanjut jadi tugas"] },
  { key: "keuangan", label: "Keuangan", url: "/portal/keuangan", image: "/pitch/p-keuangan.jpg", title: "Setiap rupiah, pound, dan dolar punya jejak.", lead: "Anggaran per pos dalam IDR, EGP, atau USD. Sistem hanya mencatat; tidak mengirim uang.", ticks: ["Pengajuan wajib melampirkan bukti terverifikasi", "Pembuat, pemeriksa, dan penyetuju harus orang berbeda", "Rekonsiliasi pembayaran dan unduh laporan"] },
  { key: "evaluasi", label: "Evaluasi", url: "/portal/evaluasi", image: "/pitch/p-evaluasi.jpg", title: "Nilai kinerja yang bisa ditelusuri ke bukti.", lead: "Penilaian pakai rubrik berbobot. Indikator yang belum ada datanya tidak dihitung sebagai nol.", ticks: ["Nilai 0–100 dengan rujukan kriteria", "Pemeriksa independen dan satu kali keberatan", "Hasil individual berklasifikasi RAHASIA"] },
  { key: "redaksi", label: "Redaksi", url: "/portal/editor", image: "/pitch/p-editor.jpg", title: "Konten situs ditulis, ditelaah, lalu diterbitkan.", lead: "Naskah baru tampil di situs publik setelah disetujui akun lain. Setiap simpanan jadi versi baru.", ticks: ["Status draf, menunggu review, terbit, dan arsip", "Naskah bahasa Indonesia dan Inggris", "Jadwal terbit dan cek pola data pribadi"] },
  { key: "handover", label: "Serah terima", url: "/portal/handover", image: "/pitch/p-handover.jpg", title: "Pergantian pengurus yang bisa diperiksa.", lead: "Pengurus lama menyusun paket, penerus menerima tiap item. Akses lama tidak ikut diwariskan.", ticks: ["Paket berisi dokumen terverifikasi", "Penerimaan per item oleh penerus", "Terpisah dari pencabutan akses resmi (F05)"] }
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
            <h1 className="h1">Pekerjaan KPI, dari laporan masuk sampai serah terima pengurus, <em>tercatat di satu tempat.</em></h1>
            <p className="lead">Ini penjelasan singkat tentang isi sistem digital KPI: apa yang sudah dibangun, bagaimana bentuknya, dan apa yang masih ditunggu dari KPI supaya bisa dipakai pengurus.</p>
            <div className="btns"><a className="btn primary" href="#isi">Mulai dari sini →</a><a className="btn" href="#portal">Lihat portalnya</a><a className="btn" href="#keputusan">Yang perlu diputuskan</a></div>
            <div className="hero-meta"><span>Per <b>26 Oktober 2026</b></span><span>Pengembang <b>Dar Dev</b></span></div>
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
              <p className="lead">Bagian yang dilihat publik dan bagian yang dipakai pengurus hidup di aplikasi yang sama, dengan satu database milik KPI di Supabase.</p>
              <p className="lead">Selain kode, repositorinya memuat dokumen perencanaan: PRD, roadmap, rancangan 113 layar, ringkasan empat dokumen hukum, dan lebih dari 50 laporan progres.</p>
            </div>
            <div className="parts">
              <div className="part"><div className="ic"><IconWorld aria-hidden="true" size={22} /></div><div><h3>Website publik</h3><p>Profil KPI, divisi, kabar, publikasi, layanan, dan formulir pengaduan. Tersedia dalam bahasa Indonesia dan Inggris.</p></div></div>
              <div className="part"><div className="ic"><IconLayoutSidebar aria-hidden="true" size={22} /></div><div><h3>Portal pengurus</h3><p>Tempat kerja harian setelah login: tugas, rapat, dokumen, keuangan, evaluasi, kasus, redaksi, dan serah terima.</p></div></div>
              <div className="part"><div className="ic"><IconDatabase aria-hidden="true" size={22} /></div><div><h3>Database dan aturan akses</h3><p>Tabel tiap modul beserta aturan siapa boleh membaca dan mengubah apa. Aturan ini dijalankan oleh database, bukan cuma oleh tampilan.</p></div></div>
            </div>
          </div>
          <div className="stats">
            <div className="stat"><b>46</b><span>halaman aplikasi</span></div>
            <div className="stat"><b>100</b><span>endpoint API</span></div>
            <div className="stat"><b>37</b><span>migrasi database</span></div>
            <div className="stat"><b>185+</b><span>tes otomatis, semua lulus</span></div>
          </div>
        </div>
      </section>

      <section className="alt" id="kenapa">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kenapa perlu</span>
            <h2 className="h2">Pengurus berganti tiap periode. <em>Catatan dan tanggung jawabnya tidak boleh ikut hilang.</em></h2>
            <p className="lead">Kebutuhan di bawah dirangkum dari PRD. Setiap kartu menunjukkan siapa yang merasakannya dan apa yang sistem lakukan.</p>
          </div>
          <div className="grid3">
            <div className="card"><span className="who">Pengurus</span><h3>“Tugas saya yang mana, tenggatnya kapan?”</h3><p>Ruang kerja menampilkan pekerjaan, antrean review, dan rapat untuk akun yang sedang login saja.</p></div>
            <div className="card"><span className="who">Koordinator</span><h3>“Sudah selesai, buktinya mana?”</h3><p>Tugas baru diterima setelah diajukan dengan bukti dan diperiksa oleh orang lain.</p></div>
            <div className="card"><span className="who">Penanggung jawab kasus</span><h3>“Laporan ini rahasia.”</h3><p>Kasus hanya bisa dibuka orang yang ditugaskan. Catatan internal terpisah dari kabar untuk pelapor.</p></div>
            <div className="card"><span className="who">Bendahara dan penyetuju</span><h3>“Uangnya untuk apa, siapa yang setuju?”</h3><p>Pengajuan, persetujuan, pembayaran, dan rekonsiliasi dipegang orang yang berbeda dan semuanya tercatat.</p></div>
            <div className="card"><span className="who">Tim media</span><h3>“Draf jangan sampai bocor ke publik.”</h3><p>Naskah hanya tampil di situs setelah disetujui akun lain. Draf tidak muncul di pencarian publik.</p></div>
            <div className="card"><span className="who">Pengurus baru</span><h3>“Saya mulai dari mana?”</h3><p>Paket serah terima diterima per item oleh penerus, tanpa otomatis membuka seluruh arsip lama.</p></div>
          </div>
        </div>
      </section>

      <section id="website">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Website publik</span>
            <h2 className="h2">Yang pertama dilihat Masisir: <em>siapa KPI dan ke mana harus melapor.</em></h2>
            <p className="lead">Sudah online dan bisa dibuka siapa saja. Isi yang tampil di sini hanya yang sudah disetujui lewat Redaksi di portal.</p>
          </div>
          <div className="gallery">
            <figure><Frame alt="Halaman layanan pengaduan dengan kartu Kanal resmi sedang disiapkan" src="/pitch/d-pengaduan.jpg" url="/publik/pengaduan" /><figcaption><b>Layanan pengaduan</b><span>Formulir dan tahapan sudah ada. Kanal sengaja ditutup sampai periode aktif dan petugas resmi lengkap.</span></figcaption></figure>
            <figure><Frame alt="Halaman profil divisi KPI" src="/pitch/d-divisi.jpg" url="/publik/divisi" /><figcaption><b>Profil divisi</b><span>Setiap divisi punya halaman sendiri dengan logo barunya.</span></figcaption></figure>
            <figure><Frame alt="Versi bahasa Inggris situs KPI" src="/pitch/d-en.jpg" url="/en" /><figcaption><b>Versi bahasa Inggris</b><span>Untuk mitra dan pihak luar. Konten ID dan EN dikelola terpisah di Redaksi.</span></figcaption></figure>
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
            <h2 className="h2">Begini tampilannya <em>setelah pengurus login.</em></h2>
            <p className="lead">Pilih modul untuk melihat layarnya. Semua isi bertanda TEST adalah data contoh di komputer pengembang, bukan data KPI.</p>
          </div>
          <PitchModuleTabs modules={modules} />
          <div className="sec-head phones-head"><span className="eyebrow">Di HP</span><h3 className="h2">Tampilannya menyesuaikan layar HP, dengan menu bawah untuk modul yang sering dipakai.</h3></div>
          <div className="phones">
            <figure><Phone alt="Beranda situs di HP" src="/pitch/m-beranda.jpg" /><figcaption>Situs publik</figcaption></figure>
            <figure><Phone alt="Ruang kerja portal di HP" src="/pitch/m-workspace.jpg" /><figcaption>Ruang kerja</figcaption></figure>
            <figure><Phone alt="Daftar tugas portal di HP" src="/pitch/m-tugas.jpg" /><figcaption>Tugas</figcaption></figure>
          </div>
        </div>
      </section>

      <section id="alur">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Alurnya</span>
            <h2 className="h2">Perjalanan satu pengaduan, <em>dari formulir sampai ditutup.</em></h2>
            <p className="lead">Alur ini sudah ada di database production dan dites otomatis. Belum dijalankan dengan pengaduan nyata karena kanal masih ditutup.</p>
          </div>
          <ol className="flow">
            <li className="step"><span className="who">Pelapor</span><b>Mengirim pengaduan</b><span>Lewat formulir publik, lalu menerima kode pelacakan.</span></li>
            <li className="step"><span className="who">Sekretariat</span><b>Menerima dan mencatat</b><span>Laporan masuk ke antrean tertutup, tidak terlihat pengurus lain.</span></li>
            <li className="step"><span className="who">Sekretariat</span><b>Menugaskan petugas</b><span>Diteruskan ke divisi Intelijen & Operasional sesuai mandat.</span></li>
            <li className="step"><span className="who">Petugas</span><b>Menangani dengan formulir SOP</b><span>Tujuh formulir, register bukti, dan catatan perpindahan bukti.</span></li>
            <li className="step"><span className="who">Pemeriksa lain</span><b>Memeriksa penutupan</b><span>Orangnya wajib berbeda dari penyusun dan pemilik kasus.</span></li>
            <li className="step"><span className="who">Pelapor</span><b>Melacak perkembangan</b><span>Hanya melihat kabar untuk pelapor, bukan catatan internal.</span></li>
          </ol>
        </div>
      </section>

      <section className="statement">
        <div className="wrap">
          <h2 className="h2">Yang membuat tidak boleh menyetujui. <em>Yang menyetujui tidak boleh membayar sendiri.</em></h2>
          <p>Prinsip ini berlaku di tugas, keuangan, evaluasi, redaksi, kasus, dan izin akses. Database yang menolak kalau orangnya sama, jadi aturan ini tidak bisa dilewati dari tampilan.</p>
        </div>
      </section>

      <section id="keamanan">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Keamanan data</span>
            <h2 className="h2">Setiap orang hanya membuka data <em>yang memang haknya.</em></h2>
            <p className="lead">Mengikuti SOP Kerahasiaan KPI versi 1.1.</p>
          </div>
          <div className="grid3">
            <div className="card"><h3>Izin per divisi, periode, dan objek</h3><p>Akses ke satu kasus atau satu dokumen bisa diberikan tanpa membuka seluruh arsip.</p></div>
            <div className="card"><h3>Admin teknis tidak otomatis bisa membaca</h3><p>Pengelola sistem tidak bisa melihat isi kasus atau penilaian kecuali diberi izin bisnis lewat formulir F01.</p></div>
            <div className="card"><h3>Berkas private</h3><p>Dokumen disimpan tertutup. Unduhan memakai tautan sementara 60 detik setelah izin diperiksa.</p></div>
            <div className="card"><h3>Semua tindakan tercatat</h3><p>Setiap pengajuan, persetujuan, dan perubahan menyimpan pelaku, waktu, dan versinya.</p></div>
            <div className="card"><h3>Halaman internal wajib login</h3><p>Endpoint internal menolak pengunjung tanpa login; dicek ulang setiap rilis.</p></div>
            <div className="card"><h3>Data KPI tidak dipakai melatih AI</h3><p>Asisten AI hanya membaca sumber yang boleh dibaca penggunanya. Usulannya harus dikonfirmasi manusia.</p></div>
          </div>
          <p className="note">26 Oktober: celah keamanan kritis di Next.js, kerangka yang dipakai aplikasi ini, ditemukan lewat pemeriksaan rutin dan sudah ditambal dengan pembaruan ke versi 16.4.3.</p>
        </div>
      </section>

      <section className="alt" id="kesiapan">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kesiapan</span>
            <h2 className="h2">Mana yang sudah jalan, <em>mana yang masih menunggu.</em></h2>
            <p className="lead">Hampir semua yang menunggu adalah keputusan resmi KPI. Pengembang tidak boleh membuat periode, mandat, atau akun pengurus sendiri.</p>
          </div>
          <div className="ready">
            <div className="list"><h3><span className="pill ok">Sudah jalan</span>Terpasang dan bisa dicek</h3><ul>
              <li><b>Situs publik ID dan EN</b><span>Online di kpi-dardev.vercel.app, terbit otomatis setiap ada push ke GitHub.</span></li>
              <li><b>Login pengurus</b><span>Memakai Supabase milik KPI.</span></li>
              <li><b>Database semua modul</b><span>37 migrasi terpasang di Supabase production.</span></li>
              <li><b>Aturan akses dan pemisahan wewenang</b><span>Dites otomatis di database terpisah.</span></li>
              <li><b>Formulir dan workflow kasus</b><span>Tujuh formulir SOP, 1.114 kolom, register bukti.</span></li>
              <li><b>Tampilan HP dan tablet</b><span>Termasuk menu bawah di portal.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill wait">Menunggu</span>Keputusan dan persiapan</h3><ul>
              <li><b>Aktivasi periode 2026–2027</b><span>Mulai 17 Oktober, tapi status di sistem masih PLANNED dan harus diaktifkan manual.</span><small>Keputusan KPI</small></li>
              <li><b>Mandat dan daftar pengurus resmi</b><span>Belum ada akun yang bisa diberi izin.</span><small>Keputusan KPI</small></li>
              <li><b>Uji bersama pengurus (UAT)</b><span>Butuh minimal tiga akun dengan peran berbeda.</span><small>KPI dan Dar Dev</small></li>
              <li><b>Pemindai berkas</b><span>Berkas yang diunggah tetap dikarantina.</span><small>Persetujuan penyedia</small></li>
              <li><b>Asisten AI, email, WhatsApp</b><span>Siap secara teknis, penyedia belum dipilih.</span><small>Persetujuan penyedia</small></li>
              <li><b>Uji backup dan pemulihan</b><span>Belum dilakukan di production.</span><small>Dar Dev</small></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section id="belum">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Belum sempurna</span>
            <h2 className="h2">Yang belum siap, <em>ditulis apa adanya.</em></h2>
            <p className="lead">Supaya tidak ada yang kaget saat sistem mulai dipakai. Setiap baris menyebut apa kekurangannya dan apa yang dibutuhkan untuk menutupnya.</p>
          </div>
          <div className="gaps">
            <div className="list"><h3><span className="pill no">Belum bisa dipakai</span></h3><ul>
              <li><b>Semua transaksi di portal</b><span>Terkunci selama periode belum aktif dan belum ada mandat resmi, termasuk untuk admin.</span><small>Butuh: keputusan periode dan mandat dari KPI</small></li>
              <li><b>Kanal pengaduan publik</b><span>Formulirnya ada tapi sengaja ditutup. Pelapor juga belum bisa mengunggah bukti sendiri.</span><small>Butuh: periode aktif, petugas resmi, keputusan soal unggah bukti</small></li>
              <li><b>Unduh dokumen</b><span>Berkas yang diunggah masuk karantina dan tidak bisa diunduh karena belum ada pemindai virus.</span><small>Butuh: penyedia pemindai yang disetujui</small></li>
              <li><b>Pengajuan keuangan dan evaluasi</b><span>Wajib melampirkan bukti yang sudah lolos pemindaian, jadi berhenti di draf selama pemindai belum ada.</span><small>Butuh: penyedia pemindai</small></li>
              <li><b>Asisten AI</b><span>Fiturnya sudah dibangun, tapi belum tersambung ke penyedia AI mana pun.</span><small>Butuh: pilihan penyedia dan persetujuan pemrosesan data</small></li>
              <li><b>Notifikasi email dan WhatsApp</b><span>Notifikasi hanya muncul di kotak masuk portal. Penjadwal otomatis belum dikonfigurasi.</span><small>Butuh: layanan pengirim dan kunci penjadwal</small></li>
            </ul></div>
            <div className="list"><h3><span className="pill wait">Jalan, tapi ada batasnya</span></h3><ul>
              <li><b>Jadwal terbit konten</b><span>Diproses sekali sehari pukul 09.00 WIB, jadi tidak tepat di menit yang dipilih.</span><small>Bisa dipercepat dengan penjadwal eksternal</small></li>
              <li><b>Ekspor formulir kasus</b><span>Keluar sebagai halaman cetak lalu disimpan jadi PDF lewat browser. Bukan file Word, dan tata letaknya tidak sama persis dengan dokumen asli.</span></li>
              <li><b>Formulir kasus berlabel DRAF</b><span>Status “terverifikasi” hanya catatan petugas, bukan pengesahan. Tanda tangan tidak diverifikasi sistem.</span><small>Butuh: nomor pengesahan SOP dan kategori Sangat Rahasia</small></li>
              <li><b>Keuangan</b><span>Hanya mencatat. Tidak mengirim uang, tidak menghitung kurs IDR/EGP/USD, dan tidak mengurus pajak.</span></li>
              <li><b>Serah terima</b><span>Menutup paket tidak otomatis mencabut akses pengurus lama. Pencabutan tetap lewat formulir F05.</span></li>
              <li><b>Login</b><span>Cukup email dan kata sandi. Login dua langkah sengaja tidak dipakai, jadi kata sandi yang kuat dan tidak dipakai ulang menjadi pelindung utama akun.</span></li>
              <li><b>Asisten AI, setelah aktif</b><span>Hanya bisa membuat tugas sendiri atau draf pengetahuan, maksimal 5 sumber, 100 permintaan per hari per akun.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill info">Belum teruji</span></h3><ul>
              <li><b>Pemakaian dengan akun pengurus asli</b><span>Belum pernah dicoba di situs online oleh beberapa peran sekaligus. Semua bukti sejauh ini dari tes otomatis.</span><small>Butuh: UAT bersama KPI</small></li>
              <li><b>Tes klik-per-klik di browser</b><span>Belum ada tes otomatis yang mengklik halaman seperti pengguna. Tes yang ada menguji logika dan database.</span></li>
              <li><b>Backup, pemulihan, dan pemantauan</b><span>Pemulihan database dan berkas production belum pernah dibuktikan. Belum ada alarm kalau situs bermasalah.</span></li>
              <li><b>Reset sandi</b><span>Sudah memakai email pemulihan Supabase, tapi belum dicoba dengan akun asli di production.</span></li>
              <li><b>Uji penetrasi</b><span>Belum ada pentest. Pengecekan kerentanan baru sebatas daftar paket yang diketahui publik.</span></li>
            </ul></div>
          </div>
          <div className="list list-wide"><h3><span className="pill no">Teknis, perlu dibereskan</span></h3><ul>
            <li><b>Belum ada staging</b><span>Setiap push ke GitHub langsung terbit di kpi-dardev.vercel.app. Belum ada situs dan database terpisah untuk uji coba sebelum perubahan masuk production.</span><small>Butuh: project Supabase kedua untuk staging</small></li>
            <li><b>Konten resmi belum lengkap</b><span>Struktur pengurus, berita, dan dokumen final belum diisi. Situs tidak diisi berita buatan.</span><small>Butuh: bahan dari KPI, lalu ditelaah lewat Redaksi</small></li>
          </ul></div>
        </div>
      </section>

      <section className="alt" id="keputusan">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">Perlu diputuskan</span><h2 className="h2">Enam hal yang perlu <em>diputuskan KPI.</em></h2></div>
          <div className="decide">
            <div className="card urgent"><span className="q" /><h3>Aktifkan periode 2026–2027</h3><p>Paling mendesak. Selama periode belum aktif, semua transaksi di portal terkunci, termasuk untuk admin.</p></div>
            <div className="card"><span className="q" /><h3>Tetapkan mandat pejabat</h3><p>Siapa memegang apa, di divisi mana, sampai kapan, dan berdasarkan keputusan apa.</p></div>
            <div className="card"><span className="q" /><h3>Tunjuk akun untuk uji bersama</h3><p>Minimal pemohon, pejabat pemberi keputusan, dan pelaksana teknis.</p></div>
            <div className="card"><span className="q" /><h3>Pilih penyedia pemindai berkas</h3><p>Tanpa ini, dokumen yang diunggah tidak bisa diunduh atau dipakai sebagai bukti.</p></div>
            <div className="card"><span className="q" /><h3>Putuskan soal AI, email, dan WhatsApp</h3><p>Penyedia yang dipakai dan persetujuan pemrosesan datanya.</p></div>
            <div className="card"><span className="q" /><h3>Sahkan SOP</h3><p>Kategori Sangat Rahasia dan nomor pengesahan SOP, supaya formulir kasus tidak lagi berlabel DRAF.</p></div>
          </div>
        </div>
      </section>

      <section id="rencana">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">Rencana</span><h2 className="h2">Urutan kerja <em>setelah keputusan masuk.</em></h2></div>
          <div className="road">
            <div className="phase"><span className="when">Tahap 1</span><h3>Buka akses</h3><ul className="ticks"><li>Aktifkan periode dan catat mandat pertama</li><li>Aktifkan akun pengurus yang ikut uji</li><li>Isi jabatan dan ajukan izin lewat F01</li></ul></div>
            <div className="phase"><span className="when">Tahap 2</span><h3>Uji bersama</h3><ul className="ticks"><li>Jalankan alur tugas, rapat, keuangan, dan kasus dengan akun asli</li><li>Uji pencabutan izin dan akses lintas peran</li><li>Catat temuan, perbaiki, uji ulang</li></ul></div>
            <div className="phase"><span className="when">Tahap 3</span><h3>Rilis resmi</h3><ul className="ticks"><li>Sambungkan pemindai berkas, AI, dan notifikasi</li><li>Uji backup dan pemulihan</li><li>Buka kanal pengaduan publik</li></ul></div>
          </div>
        </div>
      </section>

      <section className="close">
        <div className="wrap">
          <span className="eyebrow">Penutup</span>
          <h2 className="h1">Sistemnya sudah dibangun. <em>Tinggal diaktifkan bersama.</em></h2>
          <p className="lead">Langkah pertama ada di tangan KPI: aktifkan periode dan tetapkan mandat. Setelah itu uji bersama bisa langsung dimulai.</p>
          <a className="btn" href="#atas">↑ Kembali ke atas</a>
        </div>
      </section>
    </div>

    <footer className="pitch-footer">
      <div className="wrap">
        <span>Disusun dari repositori sistem dan laporan progres pengembangan, per 26 Oktober 2026.</span>
        <span>Tangkapan layar portal diambil dari aplikasi yang dijalankan di komputer pengembang dengan data contoh bertanda TEST. Tidak ada data KPI di halaman ini.</span>
      </div>
    </footer>
  </div>;
}
