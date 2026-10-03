# Paket 1 — fondasi produksi

Status 2 Oktober 2026: **paket 1 selesai untuk fondasi Production**. Sesuai arahan pengguna, deployment memakai **Production**, tanpa staging. Setelah pengguna menyiapkan schema Supabase, pemeriksaan konfigurasi, Auth, API database dan schema `org` lulus. Production build berhasil dan deployment dipasang pada domain live. Kelengkapan module persistence dan permission pengguna tetap berada pada paket berikutnya.

## Hasil yang sudah selesai

1. Next.js diperbarui dari 16.3.4 menjadi **16.3.8**, dengan lockfile diperbarui. Runtime dibatasi **Node 24.x** agar Vercel tidak otomatis melompat ke major berikutnya.
2. `npm audit --omit=dev` menghasilkan **0 temuan**. CI kini menolak advisory high/critical dependency produksi.
3. Typecheck, **152 tes**, dan production build lulus. Tiga tes baru memeriksa environment campur, pemakaian key yang benar, dan hasil probe tanpa kebocoran secret.
4. Template `.env.production.example` tersedia. File environment nyata diabaikan Git dan upload Vercel. Pemeriksaan menolak target selain Production, local test auth hosted, placeholder, URL yang bukan origin HTTPS, key publik/server sama, serta service-role di variabel browser.
5. `vercel.json` menjalankan pemeriksaan konfigurasi serta koneksi sebelum build. Tidak ada readiness endpoint publik yang membocorkan struktur database atau konfigurasi key.
6. Variabel `KPI_APP_ENV=production` dan `KPI_TEST_AUTH_ENABLED=false` sudah disiapkan pada Vercel Production. Entry Preview lama tidak dipakai untuk deployment ini. Perubahan environment baru berlaku pada deployment berikutnya.
7. Auth dan database API telah diuji langsung dari build Vercel dengan secret yang tersimpan di server:

   | Probe | Hasil |
   | --- | --- |
   | Supabase Auth settings | PASS, HTTP 200 |
   | REST database API | PASS, HTTP 200 |
   | `org.organizations`, query limit 0 | PASS, HTTP 200 setelah penyiapan schema oleh pengguna |

Probe tidak membaca isi akun atau record bisnis, tidak membuat/mengubah data, dan tidak mencetak key. HTTP 200 REST root membuktikan API tersedia, bukan seluruh schema atau permission sudah berfungsi.

## Yang perlu dilakukan manual

Langkah schema di bawah telah ditindaklanjuti pengguna dan probe organisasi sudah lulus. Tidak ada langkah manual tambahan yang menghalangi paket 1. Instruksi dipertahankan untuk dokumentasi pemasangan ulang; probe limit 0 tidak membuktikan data organisasi/periode atau seluruh migration sudah lengkap.

Tidak tersedia sesi dashboard Supabase, kredensial SQL, atau akses management API dalam workspace ini. Vercel menyimpan key sebagai sensitive; CLI tidak dapat mengunduh nilainya. Jadi perubahan schema database membutuhkan pengelola Supabase. Tidak perlu membuat project staging atau menambahkan key Preview.

### A. Menyiapkan schema fondasi pada project Supabase yang dipakai Production

1. Buka project Supabase yang URL-nya terpasang pada variabel `KPI_SUPABASE_URL` Vercel **Production**. Jangan menyalin secret ke chat.
2. Di SQL Editor, periksa keberadaan tabel tanpa mengambil record:

   ```sql
   select to_regclass('org.organizations') as organizations,
          to_regclass('org.periods') as periods;
   ```

3. Jika tabel belum ada, jalankan migration `supabase/migrations/20260921000000_platform.sql`. File ini membuat fondasi platform, organisasi, periode dan audit; tidak memasukkan data dummy. Untuk database yang sudah dikelola dengan migration, terapkan melalui jalur migration yang sama dan catat versinya, bukan mengulang seluruh migration lama sembarangan.
4. Jalankan migration baru `supabase/migrations/20261002000000_foundation_backend_read.sql`. Isinya hanya memberi backend `service_role` akses schema `org` dan SELECT pada `organizations`/`periods`, lalu reload schema cache. Tidak memberi akses `anon` atau `authenticated`; permission pengguna akan diselesaikan pada paket 2.
5. Buka **API settings → Exposed schemas**, tambahkan **`org`** tanpa menghapus schema yang sudah ada, lalu simpan. Panduan resmi: [Supabase custom schemas](https://supabase.com/docs/guides/api/using-custom-schemas). Hindari menyalin contoh GRANT ALL untuk anon/authenticated; paket ini memakai grant terbatas dari migration di atas.

`PGRST106` membuktikan schema belum exposed pada API, tetapi belum membuktikan tabelnya ada atau belum. Karena itu pemeriksaan tabel tetap diperlukan. Jika setelah exposed muncul error permission/table missing, selesaikan grant atau migration lalu jalankan probe ulang.

## Pemeriksaan dan deploy berikutnya

Pemeriksaan kode lokal tidak membutuhkan secret Production:

```powershell
npm run verify
npm audit --omit=dev --audit-level=high
```

Deploy langsung ke Production setelah langkah schema di atas selesai. Semua pemeriksaan dilakukan otomatis oleh build command menggunakan secret Vercel Production:

```powershell
vercel deploy --prod --yes
```

Deployment yang berhasil akan memperbarui domain live. Jangan menonaktifkan pemeriksaan untuk mengatasi kegagalan koneksi. `--prod --skip-domain` tetap bisa dipakai untuk diagnosis dengan konfigurasi Production tanpa mengganti domain; ini tidak membutuhkan staging atau database kedua.

Kandidat pemeriksaan 2 Oktober: `dpl_7FoDD4upEggU56x8KU1TKT9gweoY` gagal pada pemeriksaan `org`, sesuai harapan guard. URL live tidak diganti. Kandidat itu menggunakan override environment production saat probe; konfigurasi tersimpan kemudian sudah dipisahkan per target.

Deployment lanjutan **`dpl_H4GveaNcRjEvHQpT6pLRdRPJt9p2`** berhasil dengan target Production, Next.js 16.3.8 dan Node 24.x. Tiga probe Supabase lulus, 104 keluaran prerender berhasil dibangun, dan domain [website live](https://kpi-ppmi-mesir-preview.vercel.app) sudah dialihkan ke deployment tersebut. Nama project/domain masih mengandung `preview`, tetapi environment runtime adalah `production`.

Pemeriksaan HTTP anonim setelah deploy: `/`, `/masuk`, `/portal`, `/publik`, `/publik/publikasi`, `/publik/pengaduan` dan `/en` merespons 200. `/api/v1/health` merespons 200 dengan `environment=production`; `/api/v1/auth/session` merespons 401 tanpa akun; `/api/v1/tasks` masih merespons 503 sesuai pembatas mode lokal. Login pengurus nyata dan workflow bisnis tidak termasuk pengujian paket ini. Endpoint tugas tetap dibatasi sampai migrasi operasional berikutnya selesai.

## Kriteria paket 1 benar-benar tuntas

- Audit dependency dan verify lokal lulus.
- Production menggunakan environment serta project Supabase yang benar.
- Tiga probe PASS pada Production.
- Kandidat build hosted berhasil dan health endpoint mencerminkan environment target.
- Tidak ada secret atau data lokal yang ikut Git/deployment.

Keberhasilan paket 1 belum membuka seluruh portal: schema operasional, RLS pengguna, dan permission hosted tetap pekerjaan paket 2 dan modul berikutnya. Tidak ada dummy bisnis baru yang dibuat dalam paket ini.
