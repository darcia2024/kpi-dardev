# Kebutuhan teknis dari KPI, naskah pertanyaan, dan pekerjaan yang bisa jalan sekarang — 30 September 2026

Disusun dari: [audit kesiapan 30 Sep](./37-AUDIT-KESIAPAN-OPERASIONAL-30-SEPTEMBER-2026.md), [daftar pertanyaan teknis K01–K45](./28-PERTANYAAN-DAN-DATA-KLIEN.md), [jawaban klien 23 Sep](./30-JAWABAN-KLIEN-23-SEPTEMBER-2026.md), [pemisahan 40 layar](./34-RENCANA-40-LAYAR-DAN-KEPASTIAN.md), [register keputusan E00](./01-OPEN-DECISIONS.md), serta ketentuan teknis dalam dokumen hukum revisi 17 September 2026.

Dokumen ini hanya memuat kebutuhan teknis website dan portal.

Cara memakai:

1. **Bagian 1** berisi hal yang sudah dijawab atau sudah ditetapkan. Jangan ditanyakan ulang.
2. **Bagian 2** adalah checklist: apa yang harus diserahkan KPI dan layar mana yang tertahan.
3. **Bagian 3** adalah naskah pesan siap kirim ke KPI, dengan bahasa awam, dibagi lima pesan.
4. **Bagian 4** memisahkan pekerjaan yang bisa dibangun sekarang, yang bisa dibangun sebagai pengaturan kosong, dan yang harus menunggu.

---

## 1. Sudah dijawab atau sudah ditetapkan (jangan ditanyakan ulang)

| Hal | Jawaban/ketentuan | Sumber |
|---|---|---|
| Struktur | Tiga divisi dan satu subbidang (Media & Publikasi di bawah Pencegahan & Edukasi) | Jawaban klien no. 1 |
| Pemberi persetujuan utama produk | Ketua KPI | Jawaban klien no. 3 |
| Cakupan rilis pertama | Semua fitur dalam rancangan | Jawaban klien no. 4 |
| Tayang publik | Profil, tugas unit, logo, dan foto kegiatan boleh tayang (prinsip) | Jawaban klien no. 5 |
| Alur aduan | Diterima Sekretaris KPI, ditindaklanjuti Intelligence and Operation Division, semua yang terlibat wajib menjaga kerahasiaan | Jawaban klien no. 6 |
| Pengguna awal portal | Ketua, Sekjend, Wakil, OIC per divisi | Jawaban klien no. 7 |
| Pihak penerima UAT | Ketua KPI dan tim pengelola website | Jawaban klien no. 10 |
| Admin Sistem | Dipegang Ketua dan Sekretaris | Q03 |
| Arah 28 keputusan | Seluruh usulan Q01–Q28 disetujui 8 September 2026 | Register 06 |
| Database & repo | Database utama dibuat dan dikendalikan KPI. Repository berada di bawah kendali KPI. Developer hanya mendapat akses sementara | Dokumen hukum revisi |
| Layanan database | Supabase | Dokumen hukum revisi |
| Domain & hosting | Boleh dikelola developer di fase awal, lalu dialihkan ke KPI | Dokumen hukum revisi |
| Layanan pihak ketiga | Layanan cloud, penyedia AI, dan pihak ketiga yang dapat mengakses data butuh persetujuan tertulis KPI | Dokumen hukum revisi |
| Data di lingkungan uji | Data asli tidak dipakai di lingkungan uji tanpa persetujuan. Bila perlu, disamarkan, dianonimkan, atau diganti data contoh | Dokumen hukum revisi |
| Data untuk pelatihan AI | Data KPI tidak boleh dipakai untuk melatih model AI tanpa persetujuan tertulis | Dokumen hukum revisi |

---

## 2. Checklist yang harus dilengkapi KPI

Kolom **K** merujuk ke daftar teknis di dokumen 28. Kolom **Tertahan** berisi layar atau pekerjaan yang tidak bisa diselesaikan tanpa item itu.

### Tahap 1 — Akun dan layanan (penghambat semua pekerjaan produksi)

| No | Yang dibutuhkan | K / gerbang | Tertahan |
|---|---|---|---|
| 1.1 | Akun GitHub (organisasi) atas nama KPI, lalu repo dipindahkan ke sana | K41, G6 | Pemindahan repo |
| 1.2 | Akun Supabase atas nama KPI (staging dan produksi terpisah), dengan developer diundang sementara | K41, G6 | Seluruh backend produksi |
| 1.3 | Persetujuan tertulis daftar layanan pihak ketiga: hosting, database, penyimpanan file, pemindai file, email, AI (bila dipakai), alat bantu pengembangan, dan lokasi servernya | K06, K40, G2, G3 | Pemilihan layanan final |
| 1.4 | Nama domain .org yang diinginkan | K14, G7 | Rilis di domain resmi |
| 1.5 | **Sudah ditetapkan:** lingkungan uji hanya memakai data contoh atau data yang disamarkan, kecuali KPI menyetujui lain. Tidak perlu ditanyakan | K07, G4 | — |

### Tahap 2 — Orang, struktur, dan hak akses

| No | Yang dibutuhkan | K | Tertahan |
|---|---|---|---|
| 2.1 | Bagan organisasi final periode 2026/2027 | K16 | A07–A09 |
| 2.2 | Daftar akun awal: nama, jabatan, divisi, email organisasi, tanggal mulai/selesai jabatan | K16 | A07–A09, semua persetujuan |
| 2.3 | Apakah Sekretaris KPI dan Sekretaris Jenderal adalah dua orang/jabatan berbeda | K16 | Alur aduan, S03 |
| 2.4 | Petugas kasus di Intelligence and Operation Division | K22 | S03, S04 |
| 2.5 | Pemeriksa pengganti bila pejabat berhalangan atau ada konflik kepentingan | K18 | Review tugas, keuangan |
| 2.6 | Siapa menyetujui akses sementara dan akses darurat | K18 | A09, A10 |
| 2.7 | Aturan akhir akses pengurus demisioner dan siapa memastikan akses lama dicabut | K20 | H04 |

### Tahap 3 — Aturan aduan, data, dan file

| No | Yang dibutuhkan | K | Tertahan |
|---|---|---|---|
| 3.1 | SOP aduan: kategori, yang di luar wewenang KPI dan dialihkan ke mana, jalur keadaan mendesak | K21 | P12, S03 |
| 3.2 | Siapa menutup dan membuka kembali kasus | K22 | S08, S09 |
| 3.3 | Target waktu penanganan (SLA) per tingkat urgensi, dan apakah hari libur dihitung | K24 | S08, S09 |
| 3.4 | Data minimum dari pelapor, teks persetujuan (consent), dan cara menangani kode pelacakan yang hilang | K23 | S07, P12, P13 |
| 3.5 | Apa yang boleh dilihat pelapor dari perkembangan kasusnya | K25 | P13, S04 |
| 3.6 | Masa simpan data: aduan, bukti, dokumen, log; dan kapan penghapusan ditahan | K27 | A14, F06 |
| 3.7 | Jenis file yang boleh diunggah (selain aturan maks 25 MB dan blokir .exe/.sh) | K28 | F02, F06 |

### Tahap 4 — Konten website publik

| No | Yang dibutuhkan | K | Tertahan |
|---|---|---|---|
| 4.1 | Profil, visi-misi, kewenangan dan batasnya, sejarah, periode | K08, K10 | P02 |
| 4.2 | Daftar program/kegiatan, berita, dan publikasi yang boleh tayang | K10 | P05–P07 |
| 4.3 | Isi repository dan dokumen yang boleh diunduh publik | K29 | P08 |
| 4.4 | Statistik yang boleh tampil beserta cara hitung dan sumbernya | K15 | P09, P10 |
| 4.5 | Foto kegiatan yang boleh tayang beserta izin, keterangan, tanggal | K13 | P01, P05 |
| 4.6 | Konfirmasi logo baru yang sudah dipasang adalah versi final, beserta file aslinya | K13 | Seluruh situs |
| 4.7 | Kontak resmi yang boleh ditampilkan dan jam layanan | K14 | P11, footer |
| 4.8 | Versi bahasa Inggris: siapa menerjemahkan dan siapa memeriksa | K12 | Situs versi EN |
| 4.9 | Siapa penulis, pemeriksa isi, dan penyetuju terbit konten | K11 | C01–C04 |
| 4.10 | Dokumen nomor 26 dari 28 dokumen rancangan (belum diterima) | Jawaban no. 2 | Audit cakupan |

### Tahap 5 — Keuangan, evaluasi, rapat, notifikasi, akun

| No | Yang dibutuhkan | K | Tertahan |
|---|---|---|---|
| 5.1 | Tanggal awal/akhir tahun buku, mata uang utama, sumber kurs | K33 | B01 |
| 5.2 | Daftar pos anggaran dan sumber dana | K34 | B01, B02 |
| 5.3 | Batas nominal yang butuh dua penyetuju, dan siapa penyetujunya | K34 | B03 |
| 5.4 | Batas hari pertanggungjawaban uang muka | K35 | B03 |
| 5.5 | Indikator kinerja, bobot, rumus, penilai, dan batas waktu sanggah | K36, K37 | E02, E04, E08 |
| 5.6 | Aturan rapat: siapa berhak suara, kuorum, putaran voting, koreksi notulen | K31 | M05 |
| 5.7 | Pemberitahuan mana yang wajib, lewat apa (portal/email/WhatsApp), dan teks resminya | K26 | N02–N04 |
| 5.8 | Lama sesi login dan batas salah kata sandi | K19 | Go-live login |

### Tahap 6 — AI, uji coba, dan pengelolaan

| No | Yang dibutuhkan | K | Tertahan |
|---|---|---|---|
| 6.1 | Apakah fitur AI diaktifkan di rilis pertama. Bila ya: penyedia, lokasi server, lama penyimpanan riwayat | K40 | I01, I03–I05 |
| 6.2 | Nama peserta uji coba (UAT) dari Ketua dan tim website, beserta jadwalnya | K44 | UAT |
| 6.3 | Toleransi kehilangan data dan waktu pulih bila terjadi gangguan | K42 | A15 |
| 6.4 | Siapa yang mengelola sistem (admin akun, editor, petugas kasus) dan peserta pelatihan | K45 | Pelatihan pengelola |
| 6.5 | Apakah ada data lama yang perlu dipindahkan ke sistem baru | K43 | Migrasi data |

---

## 3. Naskah pesan untuk KPI

Kirim bertahap, satu pesan per tahap. Jangan kirim kelima pesan sekaligus. Tunggu pesan 1 dijawab dulu, karena itu penghambat semuanya.

### Pesan 1 — Pembuka, akun, dan layanan

> Assalamu'alaikum, Bapak/Ibu pengurus KPI.
>
> Alhamdulillah, tampilan website dan portal sudah banyak yang jadi dan bisa dicoba dengan data contoh. Supaya kami bisa lanjut ke versi yang benar-benar dipakai dengan data asli, ada beberapa hal yang kami perlukan dari KPI. Kami bagi jadi beberapa pesan supaya tidak berat. Ini yang pertama dan paling penting, karena tanpa ini sistem belum bisa dipasang di tempat yang resmi.
>
> 1. **Akun penyimpanan kode (GitHub) atas nama KPI.** Kode website harus berada di akun milik KPI. Mohon KPI membuat akun GitHub memakai email resmi organisasi, lalu mengundang kami sebagai anggota sementara. Kami bantu panduannya langkah demi langkah.
>
> 2. **Akun database (Supabase) atas nama KPI.** Tempat penyimpanan data utama dibuat dan dikendalikan KPI. Caranya: KPI membuat akun dengan email organisasi, lalu mengundang kami sementara. Kami bantu panduannya.
>
> 3. **Persetujuan daftar layanan yang dipakai.** Kami akan mengirim daftar layanan pihak ketiga yang dipakai untuk membangun dan menjalankan website (tempat website, database, penyimpanan file, pemeriksa virus, email, alat bantu pengembangan, dan AI bila dipakai), lengkap dengan lokasi servernya. Mohon KPI memeriksa dan memberi persetujuan tertulis.
>
> 4. **Nama domain.** Nama domain .org yang diinginkan apa? Contoh: kpippmimesir.org.
>
> Mohon data pribadi, kata sandi, atau dokumen rahasia **tidak dikirim lewat chat ini**. Nanti kami siapkan jalur yang aman.
>
> Jazakumullah khairan.

### Pesan 2 — Pengurus dan hak akses

> Ini pesan kedua, tentang siapa saja yang akan memakai portal.
>
> 1. Mohon dikirim **bagan organisasi final** periode 2026/2027.
> 2. Mohon diisi **daftar akun awal** dengan kolom: nama, jabatan, divisi, email organisasi, tanggal mulai jabatan. Kami kirim format tabelnya. Tanpa kata sandi.
> 3. Apakah **Sekretaris KPI** (penerima aduan) dan **Sekretaris Jenderal** adalah dua jabatan yang berbeda? Kalau berbeda, siapa masing-masing?
> 4. Siapa saja **petugas yang menangani kasus** di Intelligence and Operation Division?
> 5. Kalau pejabat yang seharusnya memeriksa sedang berhalangan, atau ada konflik kepentingan, **siapa penggantinya**? Contoh jawaban: "Wakil kepala divisi yang sama" atau "Sekjend".
> 6. Siapa yang boleh **menyetujui akses sementara** (misalnya pengurus dari divisi lain perlu membuka dokumen tertentu untuk sementara)?
> 7. Saat pengurus lama selesai menjabat, **kapan aksesnya ditutup** dan siapa yang memastikan? Contoh jawaban: "Pada hari serah terima, dipastikan oleh Sekretaris."

### Pesan 3 — Aduan, penyimpanan data, dan file

> Ini pesan ketiga, tentang aduan dan penyimpanan data. Formulir aduan di website **belum kami buka** untuk laporan asli sampai bagian ini jelas, supaya data pelapor aman.
>
> 1. Apakah ada **SOP penanganan aduan**? Kalau ada, mohon dikirim. Kalau belum, cukup jawab poin 2–6.
> 2. Aduan jenis apa yang **di luar wewenang KPI** dan harus dialihkan? Dialihkan ke mana? Bagaimana jalur untuk keadaan mendesak?
> 3. **Berapa lama target** menanggapi aduan? Contoh jawaban: "Mendesak 1 hari, biasa 7 hari." Apakah hari libur ikut dihitung?
> 4. Siapa yang berwenang **menutup kasus**, dan siapa yang boleh **membukanya kembali**?
> 5. Data apa saja yang **wajib diisi pelapor**? Apakah pelapor boleh tanpa nama? Kalau pelapor kehilangan kode pelacakan, apa yang dilakukan?
> 6. Informasi apa yang **boleh dilihat pelapor** tentang perkembangan kasusnya? Contoh: "Hanya status diterima/diproses/selesai."
> 7. **Berapa lama data disimpan** sebelum dihapus: aduan, bukti, dokumen internal? Contoh jawaban: "Aduan 3 tahun setelah ditutup."
> 8. Selain batas 25 MB dan larangan file program yang sudah disepakati, **jenis file apa saja yang boleh diunggah**? Contoh: PDF, Word, Excel, JPG, PNG.

### Pesan 4 — Isi website publik

> Ini pesan keempat, tentang isi website yang dilihat masyarakat. Kami tidak akan mengarang isi, angka, atau foto, jadi bagian yang belum ada isinya akan tetap kosong sampai KPI mengirimkannya.
>
> 1. Mohon dikirim **profil KPI**: visi-misi, tugas dan batas kewenangan, sejarah singkat, periode kepengurusan.
> 2. **Program, kegiatan, dan berita** apa yang sudah boleh ditampilkan? Mohon dikirim beserta tanggal dan fotonya.
> 3. **Publikasi atau dokumen** apa yang boleh diunduh masyarakat?
> 4. Apakah ada **angka/statistik** yang ingin ditampilkan (misalnya jumlah kegiatan)? Kalau ada, dari mana angkanya dan siapa yang memeriksa?
> 5. **Foto kegiatan** mana yang boleh tayang? Mohon sertakan keterangan foto dan pastikan orang di foto tidak keberatan.
> 6. **Logo baru** yang sudah kami pasang, apakah sudah versi final? Mohon file aslinya (PNG/SVG).
> 7. **Kontak resmi** apa yang boleh ditampilkan (email, WhatsApp, jam layanan)?
> 8. Untuk **versi bahasa Inggris**: apakah KPI yang menyiapkan terjemahannya, atau kami siapkan lalu KPI yang memeriksa? Siapa pemeriksanya?
> 9. Siapa yang **menulis, memeriksa, dan menyetujui** tulisan sebelum tayang di website?
> 10. Dari 28 dokumen rancangan, **dokumen nomor 26 belum kami terima**. Mohon dikirim.

### Pesan 5 — Keuangan, penilaian kinerja, rapat, AI, dan uji coba

> Ini pesan terakhir. Kalau ada yang belum diputuskan, cukup jawab "belum". Fitur yang belum ada aturannya akan kami matikan dulu, bukan diisi tebakan.
>
> **Keuangan**
> 1. Tahun buku mulai dan berakhir tanggal berapa? Mata uang utamanya apa (Rupiah, Pound Mesir, atau lainnya)?
> 2. Mohon **daftar pos anggaran** dan sumber dana.
> 3. Pengeluaran **di atas berapa** yang butuh dua orang penyetuju? Siapa saja penyetujunya?
> 4. Uang muka kegiatan harus dipertanggungjawabkan **paling lambat berapa hari**?
>
> **Penilaian kinerja**
> 5. Apa saja **yang dinilai**, bobotnya berapa, siapa penilainya, dan berapa hari waktu untuk mengajukan sanggahan?
>
> **Rapat dan voting**
> 6. Siapa yang **berhak memberi suara**, berapa **kuorum** minimal, dan bagaimana kalau hasilnya seri?
>
> **Pemberitahuan**
> 7. Pemberitahuan apa yang **wajib dikirim**, dan lewat apa: portal saja, email, atau WhatsApp?
>
> **Keamanan akun**
> 8. Berapa lama pengurus boleh tetap masuk tanpa aktivitas sebelum otomatis keluar? Contoh: "30 menit."
>
> **AI**
> 9. Apakah fitur **asisten AI** ingin diaktifkan di rilis pertama? Kalau ya, kami akan ajukan pilihan penyedia dan lokasi servernya untuk disetujui dulu.
>
> **Uji coba dan pengelolaan**
> 10. Siapa saja **peserta uji coba** dari Ketua dan tim website, dan kapan kira-kira bisa dijadwalkan?
> 11. Kalau terjadi gangguan, **berapa lama** website boleh tidak bisa diakses, dan data **berapa jam terakhir** yang masih bisa diterima hilang? Contoh jawaban: "Maksimal 1 hari, data maksimal 24 jam."
> 12. **Siapa yang akan mengelola** website (admin akun, editor, petugas kasus)? Mereka yang nanti kami latih.
> 13. Apakah ada **data lama** (misalnya arsip Excel) yang perlu dipindahkan ke sistem baru?
>
> Terima kasih atas waktunya. Kami siap membantu kalau ada pertanyaan yang kurang jelas.

### Lampiran — Format tabel daftar akun (dikirim bersama Pesan 2)

| Nama lengkap | Jabatan | Divisi/unit | Email organisasi | Mulai menjabat | Selesai menjabat | Catatan |
|---|---|---|---|---|---|---|
| | | | | | | |

Tanpa kolom kata sandi, NIK, atau nomor HP pribadi.

---

## 4. Yang bisa dibangun: sekarang, sebagai pengaturan kosong, atau harus menunggu

Semua pekerjaan di 4.1 dan 4.2 memakai **data contoh (TEST) di lingkungan lokal**, tanpa data asli dan tanpa akun cloud produksi.

### 4.1 Bisa dibangun sekarang tanpa menunggu KPI

**Backend (pekerjaan terbesar):**

1. Skema database untuk semua modul yang belum punya tabel: tugas, rapat, dokumen berversi dan grant, knowledge, kasus, notifikasi dan outbox, keuangan, evaluasi, handover, AI. Dikembangkan di Supabase lokal.
2. Policy RLS untuk setiap tabel berdasarkan 13 peran di dokumen 23 (sudah authoritative), beserta tes pgTAP. Pemetaan orang ke peran menunggu 2.2, tapi aturannya tidak.
3. Mengganti penyimpanan lokal (`local-record-store`, `local-private-blob-store`) di sekitar 22 service dengan repository Supabase, tanpa mengubah kontrak API yang sudah diuji.
4. Menyatukan penulisan data dan audit dalam satu transaksi, beserta tes kegagalan di tengah alur.
5. Outbox dan worker untuk notifikasi dalam portal, jadwal terbit, kedaluwarsa akses sementara, dan pengingat.
6. Pencarian Postgres FTS dengan filter izin untuk portal dan pencarian publik.
7. Alur login produksi di Supabase lokal: MFA TOTP, lupa sandi dan reset, logout semua perangkat, step-up PIN.
8. Penyimpanan file privat dengan status karantina, URL bertanda tangan, dan antarmuka pemindai yang bisa dipasang nanti. Tanpa pemindai, file tetap tertahan.
9. Antarmuka pengiriman email yang tidak terikat penyedia, diuji dengan penangkap email lokal.

**Layar internal (20 layar paket A, dokumen 34):** A07, A08, A09, F03, F04, F05, K01–K04, I02, S03, S05, S06, N03, B02, E04, E08, H06, I06. Menurut dokumen 36, sebagian besar sudah dibangun di lokal; yang tersisa adalah uji hak akses negatif, uji setelah reload, audit, dan kondisi data kosong sebelum statusnya dinaikkan.

**Website publik:**

1. Halaman P02 Tentang, P08 Repository, P09 Data & Statistik, P10 Transparansi sebagai kerangka yang membaca isi dari CMS. Bagian tanpa isi resmi tampil sebagai "belum tersedia", tanpa angka atau teks karangan.
2. P05 Kegiatan dan P06 Berita dibaca dari CMS, bukan statis. Tambah filter periode, jenis, dan status.
3. Versi Inggris untuk halaman yang belum punya (Tentang, Struktur, Kegiatan, Berita), dengan pemberitahuan bila terjemahan belum ada, bukan menampilkan draf.
4. P15: pengaturan ukuran teks dan kurangi gerak.
5. P03: pemilih periode publik.

**Mutu dan keamanan:**

1. Tes Playwright di 3 ukuran layar (390, 768, 1280) dan tes aksesibilitas.
2. gitleaks, audit dependensi, dan daftar komponen beserta lisensinya di CI.
3. Header keamanan HTTP, pembatasan laju (rate limit), dan antispam untuk formulir publik.

**Dokumen teknis (draf):** runbook insiden, dokumentasi teknis, panduan admin/editor/pengurus, daftar komponen pihak ketiga, checklist penghapusan data dan pembersihan data TEST, laporan security/firewall setelah stack terbentuk, dan daftar rinci hasil pengembangan.

**Kerapian repo:** pindahkan situs rancangan statis (`index.html`, `beranda.html`, `public.html`, `app.js`, `styles.css`) ke folder terpisah, dan pastikan deploy situs rancangan tetap berjalan dari folder itu.

### 4.2 Bisa dibangun sekarang sebagai pengaturan yang diisi nanti

Logikanya dibangun sekarang, nilainya dibiarkan **BELUM DITENTUKAN**. Selama kosong, sistem berperilaku aman.

| Pengaturan | Perilaku aman selama kosong | Diisi dari |
|---|---|---|
| Lama sesi, batas salah sandi | Nilai paling ketat, tidak bisa go-live sebelum diisi | 5.8 |
| SLA aduan per urgensi | Tenggat tidak dihitung, tidak ada eskalasi otomatis | 3.3 |
| Masa simpan per jenis data | Tidak ada penghapusan otomatis | 3.6 |
| Daftar jenis file | Hanya PDF dan gambar, sisanya ditolak | 3.7 |
| Ambang dua penyetuju | Semua pengeluaran butuh dua penyetuju | 5.3 |
| Batas uang muka | Tidak memblokir, hanya menandai | 5.4 |
| Rumus kinerja | Laporan tetap PREVIEW_ONLY, tidak ada nilai final | 5.5 |
| Kuorum voting | Voting tidak bisa ditutup sebagai sah | 5.6 |
| Event notifikasi wajib | Semua event dikirim di portal, tidak ada kanal luar | 5.7 |
| Fitur AI | Mati (flag off) | 6.1 |

### 4.3 Harus menunggu keputusan KPI (13 layar)

| Layar | Menunggu |
|---|---|
| A14, F06 | Masa simpan dan penahanan penghapusan (3.6) |
| S07 | Kolom formulir dan teks consent (3.4) |
| S08, S09 | SLA, eskalasi, penutupan dan buka kembali (3.2, 3.3) |
| N02 | Event wajib dan kanal (5.7) |
| B01, B03 | Anggaran, tahun buku, ambang persetujuan (5.1–5.4) |
| E02 | Indikator dan rumus (5.5) |
| H04 | Pengesahan pemindahan akses (2.7) |
| I03, I04, I05 | Keputusan dan kebijakan AI (6.1) |

### 4.4 Harus menunggu akun atau layanan (7 layar dan produksi)

| Layar/pekerjaan | Menunggu |
|---|---|
| A12, A16 | Supabase dan hosting final (1.2, 1.3) |
| A15 | Lokasi backup, toleransi kehilangan data (1.2, 6.3) |
| F02, C05 | Penyimpanan file dan pemindai nyata (1.3) |
| N04 | Penyedia email dan akun pengirim (1.3, 5.7) |
| I01 | Penyedia AI yang disetujui (1.3, 6.1) |
| Staging, produksi, backup terjadwal, uji restore | Akun Supabase KPI (1.2) |
| Domain resmi | Nama domain (1.4) |
| Pemindahan repo | Akun GitHub KPI (1.1) |

### 4.5 Jangan dilakukan sebelum akun dan persetujuan ada

1. Memakai data asli pengurus, aduan, keuangan, atau dokumen internal.
2. Membuat database produksi atas nama developer.
3. Membuka formulir aduan untuk laporan asli sebelum Tahap 3 dijawab dan S03/S04 siap.
4. Mengirim data KPI ke layanan AI apa pun.
5. Mengisi angka, nama, atau aturan yang belum diberikan KPI.
