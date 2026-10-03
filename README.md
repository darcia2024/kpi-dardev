# Sistem Digital KPI PPMI Mesir

Repositori ini memuat blueprint dan implementasi bertahap Sistem Digital KPI PPMI Mesir. Blueprint mencakup 113 layar, 61 entitas konseptual, 11 alur, 28 keputusan, dan ringkasan empat dokumen hukum per 17 September 2026.

Deployment Vercel Production menggunakan Supabase untuk modul operasional dan mengikuti SOP kerahasiaan v1.1. Status terbaru ada di [laporan kelompok 2](docs/50-KELOMPOK-2-OPERASIONAL.md), [laporan kelompok 1](docs/49-KELOMPOK-1-MODUL-HOSTED.md) dan [alur SOP F01–F05](docs/48-ALUR-SOP-F01-F05.md). Koneksi dan tes kode tidak menggantikan aktivasi periode, mandat resmi, persetujuan penyedia AI/scanner, atau UAT beberapa peran. Backend SQLite dan akun sintetis tetap terbatas pada pengembangan lokal.

## Dokumen kerja

| Berkas | Keterangan |
|---|---|
| `PRD-KPI-PPMI-Mesir.md` | Kebutuhan produk, tata kelola, UAT, dan keputusan terbuka |
| `ROADMAP-EKSEKUSI-KPI.md` | Urutan E00 sampai E14, gerbang penerimaan, dan serah terima |
| `docs/` | Baseline, keputusan, cakupan, paket keputusan KPI, dan backlog E01 |
| `rancangan-ui-ux/` | Blueprint UI/UX dan ringkasan cakupan per 17 September 2026 |
| `rencana-pembangunan/` | Rencana teknis yang masih memuat ADR usulan |
| `supabase/` | Migrasi dan data seed TEST untuk pengembangan lokal |

## Menjalankan fondasi lokal

Gunakan Node.js 24.x. Lokal hanya boleh memakai data sintetis TEST. Deployment online memakai Vercel Production dan Supabase Production; staging tidak digunakan. Workflow TEST untuk CMS, aspirasi, metadata aset, tugas, rapat, keuangan, evaluasi, knowledge, handover, izin, dan konfirmasi preview AI memakai SQLite lokal di `.kpi-test/records.sqlite`, yang dikecualikan dari Git. Sebagian UI masih memakai data demo, dan SQLite ini bukan pengganti pengujian PostgreSQL/RLS produksi.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Health check tersedia pada `http://localhost:3000/api/v1/health` saat environment valid.

Untuk UAT atau demo, isi portal dengan data contoh bertanda TEST (tugas di semua kolom papan, rapat dengan voting, keuangan, evaluasi, serah terima, dan artikel terbit ID/EN):

```powershell
npm run seed:demo
```

Perintah ini hanya berjalan pada mode lokal TEST dan hanya sekali; menjalankannya lagi tidak mengubah apa pun. Karena pemindai berkas belum ada, berkas bukti contoh ditandai lolos pemeriksaan oleh skrip dan tercatat di audit sebagai `seed-demo`. Akun contoh: `pengurus.test@kpi.local`, `admin.test@kpi.local`, dan `ketua.test@kpi.local` (lihat `docs/06-E02-ACCESS-BACKLOG.md`).

## Pratinjau publik di Vercel

Versi situs publik tersedia di https://kpi-ppmi-mesir-preview.vercel.app. Deployment terbaru 2 Oktober 2026 memakai `KPI_APP_ENV=production` dengan `KPI_TEST_AUTH_ENABLED=false`; nama project/domain masih mengandung `preview`. Akun contoh lokal tidak berlaku online. Fondasi Production sudah terverifikasi, tetapi penulisan pengaduan dan workflow operasional masih menunggu migrasi modul berikutnya.

Project terhubung ke folder kerja melalui Vercel CLI, tanpa deploy otomatis dari Git. Push GitHub tidak langsung mengubah situs. Panduan pemeriksaan environment, kandidat deploy tanpa mengganti domain live, dan langkah Supabase ada di [Paket 1](docs/40-PAKET-1-FONDASI-PRODUKSI.md). Build hosted memeriksa konfigurasi dan koneksi sebelum membangun aplikasi. `.vercelignore` mencegah environment dan data lokal ikut diunggah.

Supabase Auth, API database, dan akses schema organisasi berhasil diperiksa pada 2 Oktober 2026. Build hosted serta deployment Production berhasil. Login online tidak berarti modul operasional telah tersambung. Persyaratan akun dan batas akses ada di `docs/35-HOSTED-LOGIN.md`.

Jalankan pemeriksaan sebelum review:

```powershell
npm run verify
```

Migrasi SQL sudah disimpan di repo, tetapi belum dijalankan terhadap database lokal atau remote karena runtime Docker/PostgreSQL belum tersedia pada mesin kerja. Lihat `docs/19-LOCAL-RELEASE-READINESS.md` untuk bukti local TEST, defect register, dan gerbang rilis.

## Aturan data

Database dan akun produksi berada di bawah kepemilikan KPI. Jangan masukkan data produksi, kredensial, isi kasus, file internal, atau prompt sensitif ke repositori. Data KPI tidak boleh digunakan untuk pelatihan model AI.
