import type { Metadata } from "next";
import Image from "next/image";
import { IconDatabase, IconLayoutSidebar, IconWorld } from "@tabler/icons-react";
import { PitchModuleTabs, PitchNav, type PitchModule, type PitchSection } from "@/components/pitch/pitch-interactive";
import "./pitch.css";

export const metadata: Metadata = {
  title: "Update Website KPI | KPI PPMI Mesir",
  description: "Update website dan progres sistem digital KPI PPMI Mesir per 30 Oktober 2026, dari Dar Dev untuk Sidi Abdul: apa yang baru, apa yang sudah jalan, dan apa yang masih nunggu.",
  alternates: { canonical: "/pitch" },
  robots: { index: false, follow: false }
};

const sections: PitchSection[] = [
  { id: "update", label: "Yang baru" }, { id: "isi", label: "Ringkasan" }, { id: "kenapa", label: "Kenapa" }, { id: "website", label: "Website" },
  { id: "portal", label: "Portal" }, { id: "alur", label: "Alur pengaduan" }, { id: "keamanan", label: "Keamanan" }, { id: "masuk", label: "Cara masuk" },
  { id: "kesiapan", label: "Progres" }, { id: "belum", label: "Kekurangan" }, { id: "keputusan", label: "Keputusan" }, { id: "langkah", label: "Langkah" }
];

const updates = [
  { date: "30 Okt", title: "Firewall dipasang", text: "Website sekarang nggak bisa ditempel di situs lain, login dibatasi maksimal 30 percobaan per 15 menit, dan bot AI yang suka nyedot isi website diblokir di Vercel." },
  { date: "30 Okt", title: "Super admin KPI aktif", text: "Akun resmi KPI udah bisa buka semua modul portal. Ngubah data baru bisa setelah periode diaktifin." },
  { date: "30 Okt", title: "Lupa kata sandi lewat email", text: "Pengurus bisa bikin atau ganti kata sandi sendiri di halaman Lupa kata sandi, nggak perlu minta ke saya." },
  { date: "30 Okt", title: "Alarm website mati", text: "Website dicek tiap 15 menit. Kalau down, saya langsung dapat notifikasi." },
  { date: "30 Okt", title: "Backup database", text: "Sistem backup harian terenkripsi udah kepasang. Tinggal diisi akses database-nya biar mulai jalan." },
  { date: "30 Okt", title: "53 tes browser", text: "Semua modul portal sekarang dicoba otomatis di browser tiap kali ada perubahan, jadi kalau ada yang rusak ketahuan sebelum tayang." },
  { date: "26 Okt", title: "Tambal celah keamanan", text: "Ada celah serius di Next.js, kerangka yang dipakai website ini. Udah saya update ke versi 16.4.3 bareng dua komponen lain." }
];

const modules: PitchModule[] = [
  { key: "workspace", label: "Ruang kerja", url: "/portal/workspace", image: "/pitch/p-workspace.jpg", title: "Halaman pertama setelah login. Isinya cuma kerjaan si pengurus itu sendiri.", lead: "Biar pengurus nggak perlu scroll grup buat nyari tugasnya. Begitu masuk, langsung kelihatan apa yang harus dikerjain hari ini.", ticks: ["Tugas yang lagi jalan, nunggu dicek, atau macet", "Hal yang lagi nunggu keputusan dia", "Pencarian tugas, rapat, dan dokumen (yang boleh dia buka aja)"] },
  { key: "tugas", label: "Tugas", url: "/portal/tugas", image: "/pitch/p-tugas.jpg", title: "Tugas baru dihitung selesai kalau udah dicek orang lain.", lead: "Alurnya: belum dikerjain → dikerjain → nunggu diperiksa → selesai. Tahap diperiksa nggak bisa dilompatin, koordinator pun nggak bisa.", ticks: ["Tampilan papan (kanban) atau tabel", "Subtugas, tugas yang saling nunggu, templat, dan kolom diskusi", "Yang macet atau lewat tenggat langsung ditandai"] },
  { key: "rapat", label: "Rapat", url: "/portal/rapat", image: "/pitch/p-rapat.jpg", title: "Siapa yang hadir dan apa tindak lanjutnya, semua kesimpan.", lead: "Jadwal pakai waktu Kairo. Undangan, notulen, voting, sampai tindak lanjut ada di satu halaman rapat.", ticks: ["Konfirmasi hadir dan daftar hadir", "Notulen ada riwayat versinya dan disahkan orang lain", "Voting pakai kuorum, tindak lanjut bisa langsung jadi tugas"] },
  { key: "keuangan", label: "Keuangan", url: "/portal/keuangan", image: "/pitch/p-keuangan.jpg", title: "Rupiah, pound, dolar, semuanya ada jejaknya.", lead: "Anggaran per pos, bisa IDR, EGP, atau USD. Sistem ini cuma nyatat, uangnya tetap dipegang dan dikirim bendahara kayak biasa.", ticks: ["Pengajuan wajib pakai bukti, misalnya foto kuitansi", "Yang ngajuin, ngecek, dan nyetujuin harus orang beda", "Rekap pembayaran dan laporan bisa diunduh"] },
  { key: "evaluasi", label: "Evaluasi", url: "/portal/evaluasi", image: "/pitch/p-evaluasi.jpg", title: "Penilaian pengurus yang bisa dirunut sampai buktinya.", lead: "Kriterianya punya bobot yang jelas. Kalau datanya belum ada, nilainya nggak otomatis jadi nol, biar nggak ada yang dirugikan.", ticks: ["Nilai 0–100 plus alasan per kriteria", "Dicek orang lain, yang dinilai boleh keberatan sekali", "Hasil per orang statusnya RAHASIA"] },
  { key: "redaksi", label: "Redaksi", url: "/portal/editor", image: "/pitch/p-editor.jpg", title: "Tulisan KPI ditulis, dicek, baru tayang.", lead: "Nggak ada tulisan yang muncul di website sebelum disetujui orang lain. Tiap simpan jadi versi baru, jadi nggak ada lagi tulisan hilang karena ketimpa.", ticks: ["Status draf, nunggu dicek, tayang, arsip", "Bahasa Indonesia dan Inggris", "Ada peringatan kalau tulisannya memuat data pribadi"] },
  { key: "handover", label: "Serah terima", url: "/portal/handover", image: "/pitch/p-handover.jpg", title: "Ganti kepengurusan, arsipnya nggak ikut hilang.", lead: "Pengurus lama nyiapin paket, penerusnya nerima satu per satu. Akses lama nggak ikut diwariskan gitu aja.", ticks: ["Paket isinya dokumen yang udah diperiksa", "Penerus konfirmasi tiap item yang diterima", "Akses pengurus lama tetap dicabut lewat formulir resmi"] }
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
        <a className="pitch-brand" href="#atas"><Image alt="Logo KPI PPMI Mesir" height={34} src="/brand/kpi-ppmi-mesir-logo.png" width={34} /><div><b>KPI PPMI Mesir</b><span>Update website · 30 Oktober 2026</span></div></a>
        <PitchNav sections={sections} />
      </div>
    </header>

    <div id="atas">
      <section className="hero">
        <div className="wrap">
          <div className="hero-copy">
            <span className="eyebrow">Update website · 30 Oktober 2026</span>
            <h1 className="h1">Sidi, ini update website KPI, <em>sekalian progres kerjaan saya.</em></h1>
            <p className="lead">Website-nya udah online, portal pengurus udah bisa dibuka, dan minggu ini saya nambahin firewall, alarm kalau website mati, sama backup database. Satu hal yang masih nahan: portal belum bisa dipakai kerja karena periode 2026–2027 belum aktif di sistem. Lengkapnya di bawah.</p>
            <div className="btns"><a className="btn primary" href="#update">Lihat yang baru →</a><a className="btn" href="#masuk">Cara masuk portal</a><a className="btn" href="#langkah">Yang saya butuhin dari Sidi</a></div>
            <div className="hero-meta"><span>Per <b>30 Oktober 2026</b></span><span>Dari <b>Dar Dev</b></span><span>Untuk <b>Sidi Abdul, Ketua KPI</b></span></div>
          </div>
          <div className="hero-shot">
            <div className="frame"><div className="frame-bar"><i /><i /><i /><span>kpi-dardev.vercel.app</span></div><Image alt="Beranda situs publik KPI PPMI Mesir dengan judul Menjaga interaksi, Melindungi martabat" height={900} priority sizes="(min-width: 1248px) 1184px, 100vw" src="/pitch/d-beranda.jpg" width={1440} /></div>
            <Phone alt="Beranda situs KPI di layar HP" priority src="/pitch/m-beranda.jpg" />
          </div>
        </div>
      </section>

      <section id="update">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Yang baru</span>
            <h2 className="h2">Yang berubah <em>seminggu terakhir.</em></h2>
            <p className="lead">Urut dari yang paling baru. Semuanya udah live, jadi bisa langsung dicek di kpi-dardev.vercel.app.</p>
          </div>
          <div className="list log"><ul>
            {updates.map((item) => <li key={item.title}><small>{item.date}</small><b>{item.title}</b><span>{item.text}</span></li>)}
          </ul></div>
        </div>
      </section>

      <section className="alt" id="isi">
        <div className="wrap">
          <div className="split">
            <div className="sec-head">
              <span className="eyebrow">Ringkasan</span>
              <h2 className="h2">Isinya <em>satu sistem, tiga bagian.</em></h2>
              <p className="lead">Website buat Masisir dan portal buat pengurus ada di satu aplikasi, dengan satu database atas nama KPI. Jadi nggak ada lagi data yang nyangkut di laptop atau Drive pribadi pengurus.</p>
              <p className="lead">Rancangan, panduan, dan catatan perkembangannya juga kesimpan di repo. Pengurus periode depan, atau developer berikutnya, bisa langsung lanjut tanpa mulai dari nol.</p>
            </div>
            <div className="parts">
              <div className="part"><div className="ic"><IconWorld aria-hidden="true" size={22} /></div><div><h3>Website untuk Masisir</h3><p>Profil KPI, divisi, kabar dan publikasi, layanan, sampai formulir pengaduan. Ada versi Indonesia dan Inggris.</p></div></div>
              <div className="part"><div className="ic"><IconLayoutSidebar aria-hidden="true" size={22} /></div><div><h3>Portal pengurus</h3><p>Tempat kerja harian: tugas, rapat, dokumen, keuangan, evaluasi, kasus, redaksi, dan serah terima. Enak dibuka dari HP.</p></div></div>
              <div className="part"><div className="ic"><IconDatabase aria-hidden="true" size={22} /></div><div><h3>Aturan siapa boleh lihat apa</h3><p>Dipasang langsung di database, bukan cuma nyembunyiin tombol. Jadi nggak bisa diakali dengan nebak alamat halaman.</p></div></div>
            </div>
          </div>
          <div className="stats">
            <div className="stat"><b>13</b><span>modul kerja pengurus</span></div>
            <div className="stat"><b>2</b><span>bahasa, Indonesia dan Inggris</span></div>
            <div className="stat"><b>7</b><span>formulir SOP penanganan kasus</span></div>
            <div className="stat"><b>240+</b><span>tes otomatis, semuanya lulus</span></div>
          </div>
        </div>
      </section>

      <section id="kenapa">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kenapa dibikin begini</span>
            <h2 className="h2">Pengurus ganti tiap periode. <em>Catatannya jangan ikut pergi.</em></h2>
            <p className="lead">Sistemnya saya susun dari keluhan yang sering kedengeran di kepengurusan. Ini keluhannya, dan jawabannya di sistem.</p>
          </div>
          <div className="grid3">
            <div className="card"><span className="who">Pengurus</span><h3>“Tugasku yang mana, tenggatnya kapan? Apalagi pas musim imtihan.”</h3><p>Ruang kerja cuma nampilin tugas, rapat, dan pemeriksaan punya dia sendiri. Nggak perlu scroll ratusan chat.</p></div>
            <div className="card"><span className="who">Koordinator divisi</span><h3>“Katanya udah beres. Buktinya mana?”</h3><p>Tugas baru diterima kalau diajukan pakai bukti dan udah dicek orang lain.</p></div>
            <div className="card"><span className="who">Petugas kasus</span><h3>“Ini cerita teman sendiri. Harus bener-bener rahasia.”</h3><p>Kasus cuma bisa dibuka orang yang ditugaskan. Catatan internal dipisah dari kabar yang dilihat pelapor.</p></div>
            <div className="card"><span className="who">Bendahara</span><h3>“Uang kas dipakai buat apa, siapa yang setuju?”</h3><p>Yang ngajuin, ngecek, nyetujuin, dan bayar orangnya beda-beda. Semuanya tercatat, mau rupiah, pound, atau dolar.</p></div>
            <div className="card"><span className="who">Media & Publikasi</span><h3>“Draf rilis jangan sampai tayang duluan.”</h3><p>Tulisan baru muncul di website setelah disetujui orang lain. Draf juga nggak kebaca mesin pencari.</p></div>
            <div className="card"><span className="who">Pengurus baru</span><h3>“Baru dilantik. Mulai dari mana, ya?”</h3><p>Pengurus lama nyerahin arsip satu per satu, tanpa harus ngebuka semua arsip lama ke semua orang.</p></div>
          </div>
        </div>
      </section>

      <section className="alt" id="website">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Website untuk Masisir</span>
            <h2 className="h2">Udah online. <em>Ini yang pertama dilihat Masisir.</em></h2>
            <p className="lead">Bisa dibuka siapa aja di kpi-dardev.vercel.app. Tulisan yang tampil di sini cuma yang udah disetujui lewat Redaksi di portal.</p>
          </div>
          <div className="gallery">
            <figure><Frame alt="Halaman layanan pengaduan KPI PPMI Mesir" src="/pitch/d-pengaduan.jpg" url="/publik/pengaduan" /><figcaption><b>Layanan pengaduan</b><span>Formulir dan alurnya udah jadi. Sekarang halaman ini masih nampilin keterangan “belum menerima laporan” karena periode dan sekretaris resminya belum ada. Begitu itu beres, formulirnya tinggal dinyalain.</span></figcaption></figure>
            <figure><Frame alt="Halaman profil divisi KPI" src="/pitch/d-divisi.jpg" url="/publik/divisi" /><figcaption><b>Profil divisi</b><span>Tiap divisi punya halaman sendiri, lengkap dengan logonya.</span></figcaption></figure>
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

      <section id="portal">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Portal pengurus</span>
            <h2 className="h2">Begini tampilannya <em>setelah pengurus login.</em></h2>
            <p className="lead">Klik nama modulnya buat lihat layarnya. Data bertulisan TEST itu data contoh di komputer saya, bukan data Masisir beneran.</p>
          </div>
          <PitchModuleTabs modules={modules} />
          <div className="sec-head phones-head"><span className="eyebrow">Di HP</span><h3 className="h2">Kebanyakan pengurus buka dari HP, jadi modul yang paling sering dipakai ada di menu bawah.</h3></div>
          <div className="phones">
            <figure><Phone alt="Beranda situs di HP" src="/pitch/m-beranda.jpg" /><figcaption>Website</figcaption></figure>
            <figure><Phone alt="Ruang kerja portal di HP" src="/pitch/m-workspace.jpg" /><figcaption>Ruang kerja</figcaption></figure>
            <figure><Phone alt="Daftar tugas portal di HP" src="/pitch/m-tugas.jpg" /><figcaption>Tugas</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="alt" id="alur">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Alur pengaduan</span>
            <h2 className="h2">Alur pengaduan udah selesai. <em>Tinggal nunggu petugasnya.</em></h2>
            <p className="lead">Dari formulir sampai kasus ditutup, semuanya udah kepasang di website asli dan lolos tes. Kalau di halaman pengaduan masih tertulis belum menerima laporan, itu bukan karena belum jadi. Sistemnya memang saya kunci supaya formulir baru bisa dibuka kalau periode udah aktif dan ada sekretaris KPI yang resmi pegang kasus. Jadi nggak mungkin ada laporan Masisir yang masuk tapi nggak ada yang nanganin.</p>
          </div>
          <ol className="flow">
            <li className="step"><span className="who">Masisir</span><b>Kirim laporan</b><span>Lewat formulir di website, terus dapat kode buat mantau perkembangannya.</span></li>
            <li className="step"><span className="who">Sekretariat</span><b>Terima dan catat</b><span>Laporan masuk ke antrean tertutup. Pengurus lain nggak bisa lihat.</span></li>
            <li className="step"><span className="who">Sekretariat</span><b>Tunjuk petugas</b><span>Diteruskan ke divisi Intelijen & Operasional sesuai mandat.</span></li>
            <li className="step"><span className="who">Petugas</span><b>Tangani sesuai SOP</b><span>Pakai tujuh formulir SOP, catatan bukti, dan riwayat perpindahan bukti.</span></li>
            <li className="step"><span className="who">Pemeriksa lain</span><b>Cek sebelum ditutup</b><span>Harus orang yang beda dari penyusun dan pemegang kasus.</span></li>
            <li className="step"><span className="who">Masisir</span><b>Pantau perkembangan</b><span>Pelapor cuma lihat kabar untuk dia, bukan catatan internal petugas.</span></li>
          </ol>
          <p className="note">Buat ngebuka kanalnya: periode 2026–2027 diaktifin, sekretaris KPI ditetapkan dan dapat izin kasus, lalu pejabat yang berwenang nyentang “Penerimaan pengaduan” di Pengaturan portal. Nggak ada kode yang perlu saya ubah lagi.</p>
        </div>
      </section>

      <section className="statement">
        <div className="wrap">
          <h2 className="h2">Yang bikin nggak boleh nyetujuin sendiri. <em>Yang nyetujuin nggak boleh bayar sendiri.</em></h2>
          <p>Aturan ini berlaku di tugas, keuangan, evaluasi, redaksi, kasus, dan izin akses. Yang nolak itu database-nya langsung, jadi tetap nggak tembus walaupun tombolnya diakali.</p>
        </div>
      </section>

      <section id="keamanan">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Keamanan data</span>
            <h2 className="h2">Tiap orang cuma bisa buka data <em>yang memang haknya.</em></h2>
            <p className="lead">Acuannya SOP Kerahasiaan KPI versi 1.1. Yang dijaga di sini cerita dan nama baik sesama Masisir, jadi bagian ini yang paling saya seriusin.</p>
          </div>
          <div className="grid3">
            <div className="card"><h3>Izin per divisi, periode, dan berkas</h3><p>Seseorang bisa dikasih akses ke satu kasus atau satu dokumen aja, tanpa harus dibukain semua arsip.</p></div>
            <div className="card"><h3>Admin nggak otomatis bisa baca</h3><p>Pengelola sistem nggak bisa buka isi kasus atau penilaian tanpa izin resmi. Pengecualiannya cuma akun super admin KPI, yang persetujuannya tertulis, tercatat, dan bisa dicabut kapan aja.</p></div>
            <div className="card"><h3>Berkas tertutup</h3><p>Dokumen nggak punya alamat publik. Link unduhnya cuma berlaku 60 detik setelah izinnya dicek.</p></div>
            <div className="card"><h3>Semua tindakan tercatat</h3><p>Tiap pengajuan, persetujuan, dan perubahan nyimpan siapa pelakunya, kapan, dan versi yang mana.</p></div>
            <div className="card"><h3>Firewall dan batas login</h3><p>Website nggak bisa ditempel di situs lain, percobaan login dibatasi, dan bot AI diblokir. Yang belum login ditolak di semua halaman pengurus.</p></div>
            <div className="card"><h3>Data KPI nggak dipakai melatih AI</h3><p>Asisten AI cuma baca sumber yang boleh dibaca penggunanya, dan usulannya harus dikonfirmasi manusia.</p></div>
          </div>
        </div>
      </section>

      <section className="alt" id="masuk">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Cara masuk portal</span>
            <h2 className="h2">Akun dibikinin admin KPI. <em>Pengurus tinggal bikin kata sandi sendiri.</em></h2>
            <p className="lead">Nggak ada pendaftaran mandiri, biar yang bisa masuk cuma pengurus resmi. Alamat login-nya <b>kpi-dardev.vercel.app/masuk</b>.</p>
          </div>
          <ol className="flow">
            <li className="step"><span className="who">Admin KPI</span><b>Daftarin email pengurus</b><span>Di Supabase: Authentication → Users → Add user → Create new user. Isi email pengurus, centang Auto Confirm User, kata sandinya isi asal aja (nggak usah dikasih tahu ke pengurus).</span></li>
            <li className="step"><span className="who">Dar Dev</span><b>Aktifin akun</b><span>Saya jalankan skrip aktivasi di database. Kalau langkah ini kelewat, login bakal ditolak dengan pesan “akun belum diaktifkan”.</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Bikin kata sandi</b><span>Buka kpi-dardev.vercel.app/masuk/lupa-sandi, isi emailnya, lalu klik link yang masuk ke email (berlaku 30 menit).</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Login</b><span>Buka kpi-dardev.vercel.app/masuk, isi email dan kata sandi, klik “Masuk ke portal”.</span></li>
            <li className="step"><span className="who">Pengurus</span><b>Cek profil dan hak akses</b><span>Buka Profil dan Hak akses saya. Kalau modulnya masih kosong, wajar, itu karena jabatan dan izinnya belum ditetapkan.</span></li>
            <li className="step"><span className="who">Admin dan pejabat</span><b>Tetapkan jabatan dan izin</b><span>Admin isi jabatan di Pengaturan, pengurus ngajuin izin lewat formulir F01, lalu pejabat yang berwenang nyetujuin.</span></li>
          </ol>
          <div className="ready">
            <div className="list"><h3><span className="pill info">Kalau nggak bisa masuk</span></h3><ul>
              <li><b>Muncul “Email atau kata sandi tidak sesuai, atau akun belum diaktifkan”</b><span>Cek lagi ejaan emailnya. Kalau udah bener, kabari admin KPI atau saya buat ngecek akunnya udah aktif atau belum.</span></li>
              <li><b>Muncul “Terlalu banyak percobaan masuk”</b><span>Ini dari firewall. Tunggu 15 menit, lalu coba lagi.</span></li>
              <li><b>Email buat bikin kata sandi nggak datang</b><span>Cek folder Spam atau Promosi. Pengirimnya cuma bisa kirim beberapa email per jam, jadi tunggu sebentar sebelum coba lagi.</span></li>
              <li><b>Link di email udah kedaluwarsa</b><span>Ulangi dari Lupa kata sandi. Link-nya cuma berlaku 30 menit dan sekali pakai.</span></li>
              <li><b>Udah masuk, tapi muncul “Penugasan diperlukan”</b><span>Akunnya udah bener, tinggal jabatan atau izinnya yang belum ditetapkan. Kabari admin KPI.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill ok">Tolong dijaga</span></h3><ul>
              <li><b>Pakai kata sandi khusus buat portal ini</b><span>Jangan disamain sama Instagram atau email. Portal ini nggak pakai kode OTP, jadi kata sandi satu-satunya kunci.</span></li>
              <li><b>Jangan pinjemin akun</b><span>Semua tindakan tercatat atas nama pemilik akun, termasuk persetujuan keuangan dan kasus.</span></li>
              <li><b>Logout di HP atau laptop pinjaman</b><span>Klik Keluar kalau udah selesai, apalagi di laptop teman sakan, warnet, atau HP yang dipakai bareng.</span></li>
              <li><b>Kalau masa jabatan selesai</b><span>Aksesnya dicabut lewat formulir pengakhiran (F05), bukan dengan hapus akun, biar riwayat kerjanya tetap utuh.</span></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section id="kesiapan">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Progres</span>
            <h2 className="h2">Yang udah jalan, <em>dan yang masih nunggu.</em></h2>
            <p className="lead">Hampir semua yang nunggu itu keputusan Sidi. Periode, mandat, dan akun pengurus sengaja nggak saya bikin sendiri, karena itu wewenang KPI.</p>
          </div>
          <div className="ready">
            <div className="list"><h3><span className="pill ok">Udah jalan</span>Live, bisa dicek</h3><ul>
              <li><b>Website ID dan EN</b><span>Online di kpi-dardev.vercel.app. Tiap saya push perubahan, website ikut terbarui otomatis.</span></li>
              <li><b>Login pengurus dan lupa kata sandi</b><span>Pakai database Supabase atas nama KPI.</span></li>
              <li><b>Database semua modul</b><span>Lengkap terpasang di server production.</span></li>
              <li><b>Alur pengaduan dan kasus</b><span>Formulir publik, antrean sekretariat, tujuh formulir SOP dengan 1.114 kolom isian, sampai pemantauan oleh pelapor.</span></li>
              <li><b>Super admin KPI</b><span>Aktif untuk akun resmi KPI sejak 30 Oktober. Bisa lihat semua modul, dan bisa ubah data setelah periode diaktifin.</span></li>
              <li><b>Firewall dan alarm website mati</b><span>Header keamanan, batas login, blokir bot AI, dan cek website tiap 15 menit.</span></li>
              <li><b>Aturan akses dan pembagian wewenang</b><span>Dites otomatis tiap ada perubahan.</span></li>
              <li><b>Tampilan HP dan tablet</b><span>Termasuk menu bawah di portal.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill wait">Masih nunggu</span>Keputusan dan persiapan</h3><ul>
              <li><b>Aktifin periode 2026–2027</b><span>Periodenya udah mulai 17 Oktober, tapi di sistem masih tercatat “direncanakan”. Begitu nomor keputusannya saya terima, ngaktifinnya cuma beberapa menit.</span><small>Sidi Abdul</small></li>
              <li><b>Mandat dan daftar pengurus resmi</b><span>Belum ada akun pengurus yang bisa dikasih izin, termasuk sekretaris yang bakal pegang pengaduan.</span><small>Sidi Abdul</small></li>
              <li><b>Uji coba bareng pengurus</b><span>Butuh minimal tiga orang dengan peran berbeda.</span><small>Sidi Abdul dan saya</small></li>
              <li><b>Pemindai virus untuk berkas</b><span>Saya yang nyiapin. Selama belum aktif, berkas yang diunggah ditahan dulu.</span><small>Saya, setelah Sidi setuju</small></li>
              <li><b>Asisten AI, email, dan WhatsApp</b><span>Secara teknis udah siap, tinggal saya sambungin layanannya.</span><small>Saya, setelah Sidi setuju</small></li>
              <li><b>Backup harian mulai jalan</b><span>Sistemnya udah kepasang, tinggal diisi akses database-nya.</span><small>Saya</small></li>
            </ul></div>
          </div>
        </div>
      </section>

      <section className="alt" id="belum">
        <div className="wrap">
          <div className="sec-head">
            <span className="eyebrow">Kekurangan</span>
            <h2 className="h2">Yang belum beres, <em>saya tulis apa adanya.</em></h2>
            <p className="lead">Mending Sidi tahu dari sekarang daripada kaget pas mulai dipakai. Tiap baris ada kurangnya di mana dan apa yang dibutuhin buat nutupnya.</p>
          </div>
          <div className="gaps">
            <div className="list"><h3><span className="pill no">Belum bisa dipakai</span></h3><ul>
              <li><b>Semua pekerjaan di portal</b><span>Masih terkunci selama periode belum aktif dan mandat belum ada, admin pun sama. Portalnya sendiri udah bisa dibuka dan dilihat.</span><small>Butuh: keputusan periode dan mandat dari Sidi</small></li>
              <li><b>Penerimaan pengaduan dari Masisir</b><span>Alurnya udah jadi, tapi penerimaannya belum bisa dinyalain sebelum ada sekretaris resmi. Pelapor juga belum bisa unggah bukti sendiri.</span><small>Butuh: periode aktif, sekretaris resmi, dan keputusan soal unggah bukti</small></li>
              <li><b>Unduh dokumen</b><span>Berkas yang diunggah ditahan dan belum bisa diunduh, karena pemindai virusnya belum aktif.</span><small>Butuh: persetujuan Sidi untuk pemindai</small></li>
              <li><b>Pengajuan keuangan dan evaluasi</b><span>Wajib lampirin bukti yang lolos pemindaian, jadi sementara berhenti di draf.</span><small>Butuh: pemindai berkas aktif</small></li>
              <li><b>Jadwal tayang otomatis dan pengingat</b><span>Penjadwal otomatisnya belum saya nyalain, jadi tulisan terjadwal dan pengingat tenggat belum jalan. Tulisan masih bisa ditayangin manual.</span><small>Saya</small></li>
              <li><b>Asisten AI</b><span>Fiturnya udah ada, tapi belum disambungin ke layanan AI.</span><small>Butuh: persetujuan Sidi soal pemakaian data</small></li>
              <li><b>Notifikasi email dan WhatsApp</b><span>Untuk sekarang notifikasi cuma muncul di kotak masuk portal.</span><small>Butuh: persetujuan Sidi, lalu saya sambungin</small></li>
            </ul></div>
            <div className="list"><h3><span className="pill wait">Jalan, tapi ada batasnya</span></h3><ul>
              <li><b>Ekspor formulir kasus</b><span>Hasilnya halaman cetak yang disimpan jadi PDF lewat browser. Bukan file Word, dan tata letaknya nggak persis sama dokumen aslinya.</span></li>
              <li><b>Formulir kasus masih berlabel DRAF</b><span>Status “terverifikasi” cuma catatan petugas, belum pengesahan. Tanda tangan nggak diverifikasi sistem.</span><small>Butuh: nomor pengesahan SOP dan kategori Sangat Rahasia</small></li>
              <li><b>Keuangan</b><span>Cuma nyatat. Nggak ngirim uang, nggak ngitung kurs rupiah–pound–dolar, dan nggak ngurus pajak.</span></li>
              <li><b>Serah terima</b><span>Nutup paket nggak otomatis nyabut akses pengurus lama. Pencabutannya tetap lewat formulir F05.</span></li>
              <li><b>Login</b><span>Cukup email dan kata sandi, tanpa OTP. Makanya kata sandi yang kuat dan nggak dipakai di tempat lain itu penting banget.</span></li>
              <li><b>Batas login di firewall</b><span>Hitungannya per server, jadi ini rem buat nebak-nebak kata sandi, bukan tembok mutlak. Batas yang lebih ketat di Vercel berbayar, jadi belum dipasang.</span></li>
              <li><b>Asisten AI, kalau udah aktif</b><span>Cuma bisa bikin tugas sendiri atau draf rujukan, maksimal 5 sumber dan 100 permintaan per hari per akun.</span></li>
            </ul></div>
            <div className="list"><h3><span className="pill info">Belum teruji</span></h3><ul>
              <li><b>Dipakai pengurus beneran</b><span>Belum pernah dicoba di website asli sama beberapa peran sekaligus. Buktinya sejauh ini dari tes otomatis.</span><small>Butuh: uji coba bareng</small></li>
              <li><b>Diklik satu-satu di browser</b><span>53 tes browser udah nyobain semua modul, tapi di komputer saya pakai data latihan, belum di website asli.</span></li>
              <li><b>Backup dan pemulihan</b><span>Memulihkan database production belum pernah saya buktiin, dan isi berkas yang diunggah belum ikut dicadangkan.</span></li>
              <li><b>Lupa kata sandi</b><span>Udah pakai email pemulihan Supabase, tapi belum dicoba pakai akun asli.</span></li>
              <li><b>Uji keamanan dari pihak luar</b><span>Belum ada orang luar yang nyoba ngebobol sistemnya.</span></li>
            </ul></div>
          </div>
          <div className="list list-wide"><h3><span className="pill no">Teknis, masih harus saya beresin</span></h3><ul>
            <li><b>Belum ada tempat uji coba terpisah (staging)</b><span>Sekarang tiap perubahan kode langsung tayang di website asli. Belum ada salinan website dan database buat coba-coba dulu.</span><small>Saya</small></li>
            <li><b>Konten resmi belum lengkap</b><span>Struktur pengurus, kabar, dan dokumen final belum diisi. Saya sengaja nggak ngisi berita karangan.</span><small>Butuh: bahan dari KPI, lalu dicek lewat Redaksi</small></li>
            <li><b>Akun layanan masih atas nama saya</b><span>Repo kode, hosting, dan database perlu dipindah ke akun milik KPI waktu serah terima.</span><small>Saya dan Sidi</small></li>
          </ul></div>
        </div>
      </section>

      <section id="keputusan">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">Butuh keputusan</span><h2 className="h2">Enam hal yang perlu <em>Sidi putuskan.</em></h2><p className="lead">Dari sisi saya, sistemnya udah jadi. Tapi tanpa keputusan-keputusan ini, belum bisa dipakai kerja.</p></div>
          <div className="decide">
            <div className="card urgent"><span className="q" /><h3>Aktifin periode 2026–2027</h3><p>Ini yang paling mendesak. Cukup kirim nomor keputusannya ke saya, ngaktifinnya beberapa menit aja.</p></div>
            <div className="card"><span className="q" /><h3>Tetapkan mandat pejabat</h3><p>Siapa pegang apa, di divisi mana, sampai kapan, dan berdasarkan keputusan apa. Termasuk siapa sekretaris yang nerima pengaduan.</p></div>
            <div className="card"><span className="q" /><h3>Tunjuk 3–5 pengurus buat uji coba</h3><p>Minimal satu yang ngajuin, satu pejabat yang mutusin, dan satu pelaksana. Kirim nama, jabatan, dan email masing-masing.</p></div>
            <div className="card"><span className="q" /><h3>Setujui pemindai berkas</h3><p>Saya yang nyiapin. Tanpa pemindai, dokumen yang diunggah belum bisa diunduh atau dipakai sebagai bukti.</p></div>
            <div className="card"><span className="q" /><h3>Setujui AI, email, dan WhatsApp</h3><p>Saya yang nyambungin. Sidi cukup mutusin mau dipakai atau nggak, dan setuju soal pemakaian datanya.</p></div>
            <div className="card"><span className="q" /><h3>Sahkan SOP</h3><p>Kategori Sangat Rahasia dan nomor pengesahan SOP, biar formulir kasus nggak lagi berlabel DRAF.</p></div>
          </div>
        </div>
      </section>

      <section className="alt" id="langkah">
        <div className="wrap">
          <div className="sec-head"><span className="eyebrow">Langkah berikutnya</span><h2 className="h2">Habis ini, <em>siapa ngerjain apa.</em></h2></div>
          <div className="road">
            <div className="phase"><span className="when">Sekarang · Sidi Abdul</span><h3>Kirim tiga hal ke saya</h3><ul className="ticks"><li>Nomor keputusan pengaktifan periode 2026–2027</li><li>Nama, jabatan, dan email 3–5 pengurus buat uji coba</li><li>Nama pejabat pemberi izin akses, plus nomor mandatnya</li></ul></div>
            <div className="phase"><span className="when">Setelah itu · Admin KPI dan saya</span><h3>Buka akses, uji coba bareng</h3><ul className="ticks"><li>Periode diaktifin, akun penguji dibuat dan diaktifin</li><li>Penguji login dan nyobain tugas, rapat, keuangan, dan kasus pakai panduan uji</li><li>Temuan dicatat, saya perbaiki, lalu dicoba ulang</li></ul></div>
            <div className="phase"><span className="when">Sebelum dibuka untuk Masisir</span><h3>Buka pengaduan dan serah terima</h3><ul className="ticks"><li>Sekretaris ditetapkan, pemindai berkas disambung, lalu penerimaan pengaduan dinyalain</li><li>Backup harian dinyalain dan pemulihannya dibuktiin</li><li>Akun GitHub, Vercel, dan Supabase saya pindahkan ke KPI, lalu berita acara serah terima ditandatangani</li></ul></div>
          </div>
        </div>
      </section>

      <section className="close">
        <div className="wrap">
          <span className="eyebrow">Penutup</span>
          <h2 className="h1">Website-nya udah jalan. <em>Sekarang tinggal orangnya.</em></h2>
          <p className="lead">Langkah pertamanya ada di Sidi: kirim nomor keputusan periode dan nama pengurus yang ikut uji coba. Begitu itu masuk, akun langsung saya siapin dan uji coba bisa mulai. Update berikutnya saya taruh di halaman ini juga. Kalau ada yang kurang jelas, kabari saya aja. Jazakallah khairan.</p>
          <div className="btns"><a className="btn primary" href="/masuk">Buka halaman masuk</a><a className="btn" href="#atas">↑ Kembali ke atas</a></div>
        </div>
      </section>
    </div>

    <footer className="pitch-footer">
      <div className="wrap">
        <span>Update per 30 Oktober 2026, disusun dari kode sistem, dokumen perencanaan, dan catatan perkembangan. Dar Dev.</span>
        <span>Tangkapan layar portal diambil di komputer saya pakai data contoh bertanda TEST. Nggak ada data Masisir di halaman ini.</span>
      </div>
    </footer>
  </div>;
}
