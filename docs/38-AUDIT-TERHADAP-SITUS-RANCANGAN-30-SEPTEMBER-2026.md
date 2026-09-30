# Audit terhadap situs rancangan — 30 September 2026

Pertanyaan: **dengan situs rancangan sebagai patokan, apa yang belum dibangun dan apa yang perlu diperbaiki tampilan serta logikanya.**

Patokan: situs rancangan Dar Dev (`index.html` + `app.js` di root repo). Alamat https://kpi-dardev.vercel.app/ mengembalikan **404 NOT_FOUND** pada 30 Sep 2026, jadi audit memakai versi di repo yang dijalankan lokal. Isi yang dibandingkan: 15 contoh tampilan, 11 alur kerja (F01–F11), token warna & pesan baku, dan katalog 113 halaman. Pembanding: aplikasi Next.js di `main` yang dijalankan lokal dengan akun pratinjau.

Audit kesiapan produksi (database, infrastruktur, kontrak) ada di [dokumen 37](./37-AUDIT-KESIAPAN-OPERASIONAL-30-SEPTEMBER-2026.md) dan tidak diulang di sini.

## 1. Temuan utama

1. **Status `connected` di katalog lebih sempit daripada rancangan.** Kriteria penerimaan di `internal-screen-registry.ts` tidak memuat fitur yang terlihat di contoh tampilan. Contoh: semua T01–T11 berstatus `connected`, padahal papan kanban, sub-tugas, dan diskusi tugas belum ada. Angka "58 connected" tidak boleh dibaca sebagai "sesuai rancangan".
2. **Token warna resmi tidak dipakai.** Rancangan menetapkan latar `#F5F5F7`/`#161618`, kartu `#FFFFFF`/`#222225`, dan merah utama `#C8102E`/`#FF7A85` (Q17 disetujui). Kode memakai `#b91632` dan mode gelap bernuansa ungu anggur (`#171216`, `#251c21`). Salah satu harus disahkan: perbarui kode ke token resmi, atau catat perubahan token sebagai keputusan baru.
3. **Tampilan HP portal belum sesuai.** Semua contoh tampilan memakai navigasi bawah (Beranda · Tugas · Rapat · Dokumen · Akun). Portal saat ini hanya punya menu samping yang dibuka lewat tombol.
4. **Bahasa antarmuka masih bahasa developer.** Kode layar ("E08 ·", "B01–B02", "M01 ·") tampil di setiap halaman, dan ada istilah Inggris/teknis seperti "Reconciled", "Total record", "Knowledge base", "unit minor", dan "Penyimpanan lokal". Rancangan memakai bahasa pengurus.
5. **Pratinjau terlihat kosong.** Tanpa data contoh, setiap halaman hanya menampilkan empty state, sehingga Ketua dan tim website tidak bisa menilai tampilan saat UAT. Perlu seed data sintetis bertanda TEST yang setara isi contoh tampilan (diizinkan oleh kerangka induk §5.9).

## 2. Perbandingan 15 contoh tampilan

| # | Contoh (ID) | Status | Yang belum ada / perlu diperbaiki |
|---|---|---|---|
| 1 | Beranda publik (P01) | Sebagian | Versi "warm luxury" ada di `beranda.html` statis; Next.js memakai desain lain. Menu rancangan (Tentang, Layanan, Pencegahan, Prosedur) dan jam Kairo di header belum ada. Pilih satu desain final. |
| 2 | Ruang kerja pengurus (W02) | Sebagian | Kartu "Perlu tindakan" dengan jumlah, tugas berjalan dengan progres & tenggat, dan agenda hari ini dengan status hadir perlu dicocokkan dengan data nyata. Navigasi bawah HP belum ada. |
| 3 | Detail tugas & pemeriksaan (T03/T06) | Sebagian | Belum ada tab **Bukti · Sub-tugas · Diskusi · Riwayat**, **sub-tugas** (Q04: semua sub-tugas selesai → induk siap diajukan), **diskusi/komentar**, dan catatan pelaksana saat mengajukan. Unduh bukti dari detail tugas belum ada. |
| 4 | Dokumen & berbagi izin (F03/F04) | Sebagian | Pemberian akses sementara sudah ada. Belum ada **jenis izin (lihat saja / unduh)**, badge klasifikasi "Rahasia" di judul, dan label "Versi aktif v2.0 (Final)". Tingkat kerahasiaan 5 level (ADR-008) belum tampil. |
| 5 | Editor konten dua bahasa (C02/C04) | Sebagian — diperbarui hari ini | Editor tulis, format, pratinjau, alur review, dan pembuatan versi EN dengan slug sama sudah dibangun. Belum ada: tampilan **ID/EN berdampingan** dengan status kelengkapan per bahasa, **jadwal terbit**, **pemeriksaan sebelum terbit** (tanpa nama rahasia, lampiran publik, versi EN disetujui), dan **pratinjau publik**. Situs publik belum membaca isi artikel dari CMS. |
| 6 | Rapat & voting (M03/M05) | Sebagian | Kalender, undangan, dan voting ada. Belum ada: tampilan kuorum (18 dari 20), presensi, voting tertutup dengan hasil Setuju/Tolak/Abstain, penanda "notulen final terkunci", dan daftar tugas tindak lanjut di halaman rapat. Kuorum dan aturan voting menunggu KPI (Q08). |
| 7 | Pengaduan & penanganan (P13/S04) | Sebagian | Token pelacakan dan pemisahan catatan internal ada di lokal. Belum ada: tampilan pelapor dengan "kabar resmi" terpisah dan perkiraan tanggapan, serta tombol "Kirim kabar ke pelapor" di sisi pengurus. SLA tidak boleh ditampilkan sebelum disahkan (Q12). |
| 8 | AI & konfirmasi manusia (I01/I03) | Sebagian | Alur konfirmasi ada tetapi AI lokal mengembalikan nol sitasi dan belum menjalankan aksi. Kartu aksi (jenis, waktu, peserta) dengan "Konfirmasi & jalankan" belum ada. Menunggu provider (G2). |
| 9 | Login & verifikasi dua langkah (A01/A02) | Sebagian | Dua langkah ada. Belum ada: indikator "Langkah 1 dari 2", **Lupa kata sandi** (A03), pesan gagal yang umum, dan penguncian setelah salah berulang (menunggu Q07). |
| 10 | Papan tugas divisi (T01) | **Belum** | Tidak ada **papan kanban** (Belum dikerjakan · Sedang dikerjakan · Menunggu diperiksa · Selesai) maupun toggle Papan/Tabel. Aturan "kartu hanya bisa digeser ke tahap yang sah" juga belum ada. Tugas per divisi belum difilter. |
| 11 | Dasbor keuangan (B01) | Sebagian | Belum ada kartu anggaran disahkan / terpakai / posisi kas / belum selesai, grafik anggaran vs realisasi per pos, daftar "Perlu tindakan", dan tombol "Unduh laporan". Angka menunggu Bendahara. |
| 12 | Pengajuan & persetujuan biaya (B04/B05) | Sebagian | Pengajuan dan persetujuan dasar ada. Belum ada: rincian (jenis, pos, sumber dana, sisa pos), berkas pendukung, **rantai persetujuan bertingkat** (Bendahara → Ketua bila melebihi batas), dan catatan wajib saat menolak. Batas kewenangan menunggu KPI. |
| 13 | Penilaian kinerja (E04/E06) | Sebagian | Pratinjau laporan ada. Belum ada: indikator **berbobot** (total 100%), lembar penilaian dengan **rubrik 1–5**, alasan wajib, dan **blokir konflik kepentingan**. Label "belum ada data" (bukan nol) sudah dipenuhi. Formula menunggu KPI (Q13). |
| 14 | Serah terima jabatan (H02/H03) | Sebagian | Checklist dan penguncian arsip ada. Belum ada: tampilan paket "4 dari 9 item diterima", status per item (Diterima / Perlu klarifikasi / Menunggu / Belum siap), tanggapan pengurus lama, dan blokir penutupan saat item wajib belum diterima. |
| 15 | Pusat notifikasi (W05/N01) | Sebagian — diperbarui hari ini | Kotak masuk dan preferensi ada. Belum ada: filter **Semua · Belum dibaca · Perlu tindakan**, pengelompokan "Hari ini / Kemarin", jumlah belum dibaca, preferensi per kategori (ringkasan email, pengingat tenggat, pengumuman), notifikasi wajib yang dikunci, dan **jam tenang** (23:00–06:00 Kairo). |

## 3. Alur kerja F01–F11: logika yang belum ada

| Alur | Yang belum dibangun |
|---|---|
| F01 Login & hak akses | Lupa/reset kata sandi, penguncian setelah gagal berulang, logout semua perangkat saat ganti sandi, durasi sesi. Nilai kebijakan menunggu Q07. |
| F02 Tugas sampai selesai | Sub-tugas dan aturan Q04, diskusi, kanban dengan transisi sah, flag overdue + alasan wajib (Q05). |
| F03 Dokumen & izin | Jenis izin lihat/unduh, 5 tingkat kerahasiaan, PIN step-up (ADR-008), watermark (Q10). |
| F04 Rapat ke tindak lanjut | Kuorum, presensi, voting tertutup berputaran, snapshot pemilih (Q08). |
| F05 Konten dua bahasa | Pemeriksaan pra-terbit, jadwal terbit, fallback bahasa tanpa draf (Q11), halaman publik yang merender isi CMS, dan situs publik berbahasa Inggris. |
| F06 Pengaduan aman | Kabar resmi ke pelapor, masa berlaku token; formulir tetap nonaktif di produksi sampai SOP disahkan. |
| F07 SOP & penilaian | Bobot indikator, rubrik, konflik kepentingan. |
| F08 Serah terima | Status per item paket dan blokir penutupan. |
| F09 AI & konfirmasi | Provider nyata, kartu aksi, eksekusi setelah konfirmasi. |
| F10 Keuangan | Rantai persetujuan berdasarkan ambang, rekonsiliasi dengan bukti, laporan unduh. |
| F11 Pergantian jabatan | Auto-expire akses, acting/delegasi jabatan, admin demisioner (F2 di kerangka induk). |

## 4. Standar tampilan dari rancangan yang belum dipenuhi

- **Status selalu berikon dan bertulisan**, bukan hanya warna. Chip status tugas, dokumen, dan keuangan baru berupa teks berwarna.
- **Pesan baku.** Gunakan teks yang ditetapkan: "Belum ada tugas dalam tampilan ini.", "Versi yang Anda tinjau telah berubah. Buka versi terbaru.", "File sedang diperiksa dan belum dapat digunakan.", "Akses sementara Anda pada dokumen ini telah berakhir." Beberapa halaman masih memakai kode error mentah dari API (mis. `CONFIGURATION_INVALID`).
- **Ukuran layar.** Rancangan diuji di Komputer, Tablet, dan HP. Portal perlu navigasi bawah di HP, dan kanban/tabel perlu versi HP.
- **Jam Kairo** tampil di header publik dan portal.

## 5. Yang sudah diperbaiki pada 30 September 2026

- Sistem form portal diseragamkan (`src/app/portal-forms.css`): label di atas input, tinggi kontrol sama dengan tombol, dropdown dan switch yang konsisten, border panel yang mengikuti tema gelap.
- Halaman Tugas, Dokumen, dan Kotak masuk ditata ulang: filter, kartu form, empty state, dan area unggah.
- Redaksi dibangun ulang menjadi CMS menulis: pustaka naskah bertab status, editor kertas dengan toolbar format (Markdown aman), mode tulis/pratinjau, hitung kata & waktu baca, slug otomatis, Ctrl+S, peringatan perubahan belum disimpan, panel alur status, pembuatan versi bahasa lain, gambar utama, dan riwayat versi yang bisa dibuka. Parser format punya 4 tes, termasuk penolakan tautan `javascript:`/`data:`.

### Lanjutan 30 September 2026: fitur yang dibangun setelah audit

Semua berjalan pada data sintetis lokal. Nilai kebijakan yang belum diputuskan KPI dibuat dapat dikonfigurasi dengan perilaku default paling aman.

| Area | Yang dibangun | Batas yang masih terbuka |
|---|---|---|
| Tugas (T03/T06) | Tab Ringkasan · Sub-tugas · Diskusi · Bukti · Riwayat; sub-tugas mengatur progres dan wajib selesai sebelum diajukan (Q04); catatan pelaksana saat mengajukan; diskusi terkunci setelah tugas diarsipkan. Papan kanban (T01) empat kolom dengan toggle Papan/Tabel; kartu hanya berpindah ke tahap yang sah dan "Menunggu diperiksa" tidak bisa dilompati; seret-lepas plus menu "Pindahkan ke…" untuk keyboard; aksi mulai kerjakan dan tandai terhambat/lanjutkan. | Pengelompokan per divisi menunggu data penugasan divisi resmi. |
| Notifikasi (W05/N01) | Filter Semua · Belum dibaca · Perlu tindakan; pengelompokan per hari waktu Kairo; tandai semua dibaca; notifikasi baru "Bukti tugas menunggu diperiksa" untuk reviewer; preferensi per kategori; baris wajib yang terkunci; jam tenang lintas tengah malam. | Jam tenang baru berdampak saat kanal email/push disetujui (N04). |
| Serah terima (H02/H03) | Membuat paket; item wajib/opsional dengan status Belum siap → Menunggu diperiksa → Diterima / Perlu klarifikasi; tanya-jawab klarifikasi; penutupan diblokir selama item wajib belum diterima; status item masuk hash arsip. | Pengesahan pemindahan akses (H04). |
| Rapat (M03/M05) | Presensi Hadir/Izin/Tidak hadir; kuorum per rapat; mosi dengan pemilih di-*snapshot* saat dibuka (Q08); voting tertutup Setuju/Tolak/Abstain; hasil hanya tampil setelah ditutup. | Tanpa angka kuorum resmi, hasil ditandai "menunggu aturan KPI". Aturan mayoritas masih pratinjau. |
| Keuangan (B01, B04/B05) | Dasbor anggaran vs realisasi, kartu ringkasan, daftar perlu tindakan, unduh laporan CSV; persetujuan bertingkat Bendahara → Ketua dengan pemisahan tugas; ambang kewenangan per periode. | Tanpa ambang resmi, **semua** pengajuan wajib dua tahap. Ambang dan pagu resmi dari Bendahara/Ketua. |
| Evaluasi (E02/E04/E06) | Skema indikator berbobot (aktif hanya bila total 100%, berversi); lembar rubrik 1–5 dengan alasan wajib; "belum ada data" tidak dihitung nol; nilai tertimbang dengan cakupan bobot; pernyataan dan blokir konflik kepentingan. | Indikator, bobot, dan formula resmi (Q13). |
| Redaksi (C02/C04) | Mode bandingkan ID/EN berdampingan; pemeriksaan sebelum terbit (data pribadi, tautan, file gambar memblokir; versi bahasa lain hanya peringatan); jadwal terbit dengan pemeriksaan ulang saat jatuh tempo. | Jadwal dijalankan saat data dibaca; produksi memakai worker/cron (ADR-005). Kebijakan fallback bahasa (Q11). |
| Login (A03) | Lupa kata sandi: respons seragam (tidak membocorkan akun), token hash 30 menit sekali pakai, batas 3 permintaan/15 menit, syarat kata sandi, semua sesi lama dikeluarkan setelah reset; jalur Supabase disiapkan. | Kanal email; jalur Supabase belum diuji tanpa project KPI; durasi sesi dan penguncian (Q07). |

Akun pratinjau ketiga `ketua.test@kpi.local` ditambahkan agar pemisahan tugas (Bendahara vs Ketua, penilai vs yang dinilai) dapat diuji. Akun ini bukan jabatan resmi.

## 6. Urutan perbaikan yang disarankan

1. **Putuskan desain final**: token warna resmi vs palet sekarang, dan beranda `beranda.html` vs beranda Next.js. Setelah itu terapkan token ke semua halaman.
2. **Kerangka portal**: navigasi bawah HP, jam Kairo, hapus kode layar dan istilah teknis dari tampilan, pesan baku, status berikon.
3. **Seed data sintetis** setara isi 15 contoh tampilan agar UAT bisa menilai tampilan.
4. **Tugas**: papan kanban + tabel, sub-tugas, diskusi, tab detail.
5. **Redaksi lanjutan**: ID/EN berdampingan, pemeriksaan pra-terbit, jadwal terbit, dan halaman publik yang merender artikel CMS.
6. **Notifikasi, rapat, serah terima**: filter & pengelompokan, preferensi per kategori, tampilan kuorum/presensi/hasil voting, status paket serah terima.
7. **Keuangan & evaluasi**: dasbor dan rantai persetujuan, bobot + rubrik + konflik kepentingan. Angka dan ambang menunggu KPI, tetapi UI dan aturan umumnya bisa dibangun dengan data TEST.
8. **Perbarui kriteria katalog** agar status `connected` merujuk ke contoh tampilan dan alur yang disetujui.
