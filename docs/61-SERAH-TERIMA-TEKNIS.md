# Serah terima teknis Sistem Digital KPI PPMI Mesir

Tanggal penyusunan: 30 Oktober 2026. Pengembang: Dar Dev. Penerima: KPI PPMI Mesir.

Dokumen ini adalah daftar periksa. Serah terima dianggap selesai hanya kalau semua baris di bagian **Syarat serah terima** berstatus SELESAI dan ditandatangani di bagian akhir. Status di bawah adalah kondisi saat dokumen disusun.

## 1. Ringkasan sistem

| Bagian | Isi |
|---|---|
| Website resmi | https://kpi-dardev.vercel.app (situs publik, portal pengurus di `/portal`, halaman penjelasan di `/pitch`) |
| Kode sumber | GitHub `darcia2024/kpi-dardev`, branch `main`. Repo **publik**. |
| Hosting | Vercel, team `darcia2024s-projects`, project `kpi-dardev`. Setiap push ke `main` otomatis terbit. |
| Database, login, berkas | Supabase, organisasi "KPI PPMI Mesir", project `gtjzlkmwafyttevertho` (Mumbai, paket Free) |
| Teknologi | Next.js 16.4.3, React 19, TypeScript, PostgreSQL (Supabase) |
| Tes | 188 tes logika dan database, 53 tes browser (Playwright), berjalan otomatis di GitHub Actions setiap push |

## 2. Akun dan kepemilikan

Saat ini seluruh layanan masih atas nama pengembang. KPI baru benar-benar memegang sistemnya setelah kepemilikan dipindahkan.

| Layanan | Pemilik sekarang | Yang harus dilakukan | Status |
|---|---|---|---|
| GitHub repo `darcia2024/kpi-dardev` | Akun pengembang `darcia2024` | Buat organisasi atau akun GitHub milik KPI, lalu Settings → Transfer ownership. Pertimbangkan menjadikan repo privat. | BELUM |
| Vercel project `kpi-dardev` | Team `darcia2024s-projects` | Buat team Vercel milik KPI, lalu Project Settings → Transfer project. Sambungkan ulang Git ke repo hasil transfer. | BELUM |
| Supabase organisasi "KPI PPMI Mesir" | Akun pengembang | Undang akun email resmi KPI sebagai **Owner**, lalu pengembang turun menjadi Developer atau keluar. | BELUM |
| Email `kpippmimesirofficial@gmail.com` | KPI | Pastikan pemulihan akun (nomor HP, email cadangan) dipegang pengurus inti, bukan satu orang. | Cek KPI |
| Vercel project lama `kpi-ppmi-mesir-preview` | Team `darcia2024s-projects` | Hapus. Masih online dengan kode lama yang punya celah keamanan; sudah diputus dari GitHub. | BELUM |

Setelah transfer, semua kata sandi dan kunci (Supabase keys, secret backup) **diganti** oleh KPI, karena pengembang pernah memegangnya.

## 3. Akun di dalam sistem

| Akun | Peran | Status |
|---|---|---|
| `kpippmimesirofficial@gmail.com` | Admin teknis + **super admin** `KPI_PPMI_MESIR` | Aktif sejak 30 Oktober 2026. Bisa membaca semua modul; belum bisa mengubah data bisnis karena periode masih PLANNED. Pencabutan: lihat dokumen 57. |
| Pengurus lain | — | Belum ada. Diundang lewat Supabase → Authentication → Invite user, lalu ikuti dokumen 55. |

Login cukup email dan kata sandi (keputusan 30 Oktober 2026: tanpa login dua langkah). Lihat dokumen 59.

## 4. Variabel lingkungan di Vercel (`kpi-dardev`, Production)

| Nama | Status | Catatan |
|---|---|---|
| `KPI_APP_ENV`, `KPI_APP_NAME`, `KPI_REQUEST_ID_HEADER`, `KPI_TEST_AUTH_ENABLED`, `KPI_AUTH_PROVIDER` | Terisi | Nilai baku, lihat `.env.production.example` |
| `KPI_SUPABASE_URL`, `KPI_SUPABASE_PUBLISHABLE_KEY`, `KPI_SUPABASE_SERVICE_ROLE_KEY` | Terisi | Dua key bertanda Sensitive. Ganti setelah transfer. |
| `CRON_SECRET` | **Kosong** | Tanpa ini penjadwal harian (`/api/internal/operations`) menjawab 503, sehingga **jadwal terbit konten dan pengingat tidak berjalan**. Isi dengan string acak minimal 32 karakter. |
| `KPI_FILE_SCANNER_URL`, `KPI_FILE_SCANNER_TOKEN` | Kosong | Menunggu pilihan penyedia pemindai. Tanpa ini semua unggahan tetap dikarantina. |
| `KPI_AI_PROVIDER_URL`, `KPI_AI_PROVIDER_TOKEN`, `KPI_AI_PROVIDER_MODEL` | Kosong | Menunggu pilihan penyedia AI dan persetujuan pemrosesan data. |
| `KPI_EMAIL_DELIVERY_*`, `KPI_WHATSAPP_DELIVERY_*` | Kosong | Menunggu layanan pengirim. |

## 5. Pekerjaan rutin

| Pekerjaan | Cara | Dokumen |
|---|---|---|
| Menerbitkan perubahan kode | Push ke `main`. CI menjalankan tes; Vercel membangun dan menerbitkan. | — |
| Membatalkan rilis yang bermasalah | Vercel → kpi-dardev → Deployments → pilih rilis lama yang Ready → Promote to Production. | — |
| Memantau situs | Workflow `Uptime production` tiap 15 menit; gagal = issue GitHub + email. | 58 |
| Backup database | Workflow `Backup database production` tiap hari 03.00 WIB; perlu secret `KPI_DATABASE_URL` dan `KPI_BACKUP_PASSPHRASE`. | 58 |
| Memulihkan database | Dekripsi arsip, pulihkan ke database baru dulu, bandingkan jumlah baris. | 58 |
| Mencoba perubahan sebelum production | Staging: project Supabase kedua + Vercel Preview. | 60 |
| Mengaktifkan periode, akun, mandat | Skrip `supabase/manual/uji-peran-1..3`. | 55 |
| Uji bersama pengurus (UAT) | Checklist per peran dan modul. | 56 |
| Mengaktifkan / mencabut super admin | `supabase/manual/activate-kpi-super-admin.sql`; cabut dengan `revoked_at=now()`. | 57 |
| Reset sandi pengurus | Pengurus memakai `/masuk/lupa-sandi`. | 59 |

## 6. Syarat serah terima

| # | Syarat | Penanggung jawab | Status |
|---|---|---|---|
| 1 | Periode 2026–2027 aktif dengan nomor keputusan resmi | KPI (keputusan), pengembang (skrip) | BELUM |
| 2 | Mandat pejabat pemberi keputusan akses tercatat | KPI | BELUM |
| 3 | Minimal 3 pengurus penguji aktif dengan izin F01 sesuai peran | KPI | BELUM |
| 4 | UAT dokumen 56 dijalankan; tidak ada FAIL kritis (kebocoran data, akses tanpa izin, data hilang) | KPI dan pengembang | BELUM |
| 5 | Secret backup terisi dan satu run backup berhasil (uji restore hijau) | Pemilik repo | BELUM |
| 6 | `CRON_SECRET` terisi; `/api/internal/operations` tanpa token menjawab 401, bukan 503 | Pemilik Vercel | BELUM |
| 7 | Uji reset sandi RST-01 sampai RST-09 di dokumen 59 lulus | Pemilik akun | BELUM |
| 8 | Project `kpi-ppmi-mesir-preview` dihapus | Pemilik Vercel | BELUM |
| 9 | Kepemilikan GitHub, Vercel, dan Supabase dipindahkan ke KPI; kunci diganti | Pengembang dan KPI | BELUM |
| 10 | Keputusan tertulis untuk fitur yang ditunda: pemindai berkas, AI, email/WhatsApp, kanal pengaduan publik | KPI | BELUM |

## 7. Batasan yang diketahui saat serah terima

- **Paket Free.** Supabase Free tidak punya backup otomatis dan menjeda project yang tidak aktif sekitar seminggu. Selama sistem dipakai rutin hal ini jarang terjadi, tapi pertimbangkan paket berbayar sebelum data resmi menumpuk.
- **Repo publik.** Kode bisa dibaca siapa saja. Tidak ada rahasia di repo, tapi issue alarm dan struktur sistem terlihat publik.
- **Tanpa login dua langkah.** Kekuatan kata sandi menjadi pelindung utama akun yang bisa membuka data RAHASIA.
- **Dokumen, keuangan, evaluasi** berhenti di draf sampai pemindai berkas aktif.
- **Isi berkas di Supabase Storage** belum ikut backup.
- **Kanal pengaduan publik** sengaja ditutup sampai periode aktif dan petugas resmi ditetapkan.
- Daftar lengkap ada di halaman `/pitch` bagian "Yang belum siap".

## 8. Tanda tangan

Diserahkan oleh pengembang dan diterima oleh KPI PPMI Mesir setelah seluruh syarat di bagian 6 berstatus SELESAI.

| | Nama | Jabatan | Tanggal | Tanda tangan |
|---|---|---|---|---|
| Diserahkan | | Dar Dev | | |
| Diterima | | Ketua KPI PPMI Mesir | | |
| Saksi | | | | |
