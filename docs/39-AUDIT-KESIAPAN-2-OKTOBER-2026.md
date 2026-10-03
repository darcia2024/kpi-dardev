# Audit kesiapan KPI — 2 Oktober 2026

## Kesimpulan

Situs informasi sudah dapat ditampilkan online, dan banyak alur internal bisa diuji lokal. Sistem belum siap menerima pekerjaan operasional KPI secara online. Login hosted sudah memiliki implementasi dan variabel Supabase di Vercel, tetapi akses modul, penyimpanan, dan izin operasional belum tersambung menyeluruh.

Estimasi kesiapan produksi keseluruhan: **sekitar 45%**. Ini penilaian audit dengan bobot, bukan persentase layar yang selesai atau jaminan keamanan. Rilis operasional tetap tertahan selama blocker di bawah belum selesai.

| Area | Bobot | Nilai estimasi | Dasar penilaian |
| --- | ---: | ---: | --- |
| UI dan penyajian publik | 20% | 75/100 | Halaman publik online, pencarian dan versi Inggris ada; kelengkapan konten resmi dan QA visual seluruh layar belum dibuktikan dalam audit ini. |
| Logika modul lokal | 20% | 70/100 | Banyak workflow dan validasi tersedia; registry masih 58 connected dan 40 partial dari 98 layar internal. |
| Database dan integrasi operasional online | 25% | 15/100 | Adapter awal dan migrasi tersedia; sebagian besar modul masih memakai SQLite lokal. |
| Identitas dan permission online | 15% | 40/100 | Supabase SSR dan pemeriksaan metadata ada; mapping permission modul, akun nyata dan alur end-to-end belum diverifikasi. |
| Keamanan dan pengujian produksi | 10% | 30/100 | Unit test dan build lulus; kebijakan RLS aplikasi dan tes isolasi database belum tersedia di migrasi repo. |
| Operasi layanan dan pemulihan | 10% | 25/100 | Deployment dan CI tersedia; storage/provider/worker serta pemulihan produksi belum terbukti. |

Hasil berbobot 44,25/100 dibulatkan menjadi sekitar 45%. Jangan menjumlahkan jumlah halaman dengan kesiapan operasional.

## Bukti yang diperiksa

- Branch `main`, HEAD `4b67afb`, remote `https://github.com/darcia2024/kpi-dardev.git`.
- `npm run verify` lulus: TypeScript, **149 tes**, dan production build.
- Registry `src/lib/internal-screen-registry.ts`: **98 internal = 58 connected + 40 partial + 0 planned**. Status ini belum mengukur penggunaan hosted.
- Empat migration SQL: **16 tabel**, 16 deklarasi enable RLS, **0 deklarasi create policy**. Ini kondisi berkas repo; keadaan dashboard database langsung belum diaudit. RLS tanpa policy tidak otomatis berarti data terbuka, tetapi akses aplikasi belum memiliki policy yang dapat ditinjau di repo.
- **65 file route API** memuat guard `TEST_AUTH_DISABLED`; ini hitungan file, bukan seluruh operasi HTTP.
- Vercel project `kpi-ppmi-mesir-preview` memiliki variabel konfigurasi Supabase URL, publishable key, service-role key dan auth provider. Nilai rahasia tidak dicatat. Keberadaan konfigurasi tidak membuktikan migrasi, akun, izin, atau persistence bekerja.
- Pemeriksaan anonim `https://kpi-ppmi-mesir-preview.vercel.app`: `/`, `/masuk`, `/portal`, `/publik/publikasi`, `/publik/pengaduan`, `/en`, `/api/v1/health` mengembalikan 200; `/api/v1/auth/session` 401; `/api/v1/tasks` 503.
- Respons 200 berarti halaman tersedia, bukan alur bisnis berhasil. Tidak membuat pengaduan/transaksi nyata, tidak memakai kredensial pengurus dan tidak menjalankan UAT login authenticated.
- Tiga perubahan UI yang sudah ada sebelum audit tetap dipertahankan: `portal-forms.css`, `public-content.css`, `site-header.tsx`.

## Blocker operasional

### 1. Modul hosted sengaja dikunci

`src/proxy.ts` mengarahkan setiap pathname `/portal/…` ke `/portal` ketika konfigurasi hosted aktif. Ini berlaku bahkan sebelum identitas diperiksa. `src/app/portal/page.tsx` hanya menampilkan sambutan hosted dan menyatakan modul menunggu data, izin, serta penyimpanan.

Jangan menghapus redirect terlebih dahulu lalu menganggap modul siap: adapter dan otorisasi production harus selesai sebelum modul dibuka.

### 2. Logika kerja masih bergantung pada lingkungan lokal

`src/platform/data/local-record-store.ts` menyimpan record dalam SQLite lokal. Guard lingkungan membatasi pemakaian lokal. Banyak API memakai `getTestSession`, permission lokal dan layanan lokal, sehingga login Supabase belum dapat menjalankan tugas, rapat, kasus, keuangan, evaluasi dan handover online.

Perlu schema, repository PostgreSQL, transaksi atomik, audit dan integrasi identitas hosted untuk tiap modul, dengan tes antar akun/periode/divisi dan konflik update.

### 3. Pengaduan publik belum menjadi layanan online

`src/app/api/v1/public/aspirations/route.ts` memerlukan mode test lokal dan memakai layanan aspirasi serta direktori lokal. Guard menolak sebelum menyimpan ketika mode itu tidak aktif. Halaman form tersedia bukan bukti laporan bisa diterima sekretaris KPI di Vercel.

Perlu persistence online, tracking aman, assignment sekretaris ke Intelligence & Operation, pembatasan kasus sensitif, dan notifikasi sesuai penerima yang telah ditetapkan klien.

### 4. Permission database belum bisa diverifikasi dari repo

Migration belum memuat policy RLS. Schema operasional mayoritas modul juga belum lengkap dalam migration yang diperiksa. Metadata login hosted hanya menyaring akun terkonfirmasi dengan akses KPI dan dua kategori peran; ini belum menggantikan scope permission per modul/divisi/periode/kasus.

Perlu migration policy yang dapat direproduksi dan tes negatif untuk akses silang, termasuk endpoint yang memakai service-role karena key tersebut tidak memperoleh perlindungan RLS seperti akun biasa.

### 5. Storage, pengiriman notifikasi dan AI belum dihubungkan

`src/app/api/v1/admin/operations/route.ts` masih menyatakan storage `NOT_CONNECTED`, notification provider dan AI provider `NOT_CONFIGURED`. Ada logika lokal tetapi belum bukti upload/download berizin, pemindaian berkas, delivery provider, retry/outbox, worker schedule dan model AI nyata.

AI floating dan parser laporan bukan bukti provider AI aktif. Pengubahan record dari usulan AI perlu permission, konfirmasi tindakan, audit dan pembatasan sumber.

### 6. Pengujian dan operasi produksi belum ditutup

CI menjalankan verify, tetapi tidak ditemukan suite Playwright/Cypress atau pgTAP. Backup lokal tersedia; pemulihan database dan storage produksi, monitoring, alert, serta rollback rilis belum dibuktikan. MFA produksi dan reset akun perlu diuji dengan provider, jangan memakai keberhasilan simulasi lokal sebagai bukti.

### 7. Dependency perlu diperbarui

`npm audit --omit=dev` menemukan satu advisory kritis pada Next.js **16.3.4**: [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j). Advisory menyebut patch mulai 16.3.6; npm audit menawarkan 16.3.8.

Dampak spesifik mensyaratkan Node.js `next/og` ImageResponse dengan input penyerang masuk SVG. Pencarian `src` tidak menemukan `ImageResponse`, `next/og`, atau `@vercel/og`, sehingga audit ini tidak menemukan jalur eksploitasi tersebut pada kode aplikasi. Tetap perbarui dependency dan ulangi verify sebelum rilis; jangan menyatakan situs terbukti rentan dieksploitasi hanya dari versi paket.

## Urutan menuju siap pakai

1. Perbarui dependency, tetapkan staging dan baseline deployment yang dapat direproduksi.
2. Audit keadaan Supabase langsung; lengkapi schema, migration dan policy, hubungkan akun/peran/periode/divisi hosted.
3. Selesaikan satu alur online end-to-end: pengaduan → sekretaris → penugasan IOD → pembaruan → pelacakan pelapor, dengan tes kerahasiaan.
4. Migrasikan tugas, dokumen, rapat dan CMS; buka route hosted per modul setelah lulus tes. Sertakan storage private dan approval publikasi.
5. Migrasikan keuangan, evaluasi, handover, notifikasi dan audit; pastikan transaksi, separation of duties dan versioning konsisten.
6. Hubungkan worker, email dan AI yang disetujui; uji kegagalan provider dan retry tanpa tindakan ganda.
7. Jalankan E2E hosted, aksesibilitas, RLS, pengujian beban yang sesuai, backup-restore, monitoring dan UAT pengurus; selesaikan konfigurasi/data resmi dan sign-off peluncuran.

Data/keputusan resmi yang masih perlu dibuktikan: akun dan roster periode aktif, 28 dokumen final serta versi yang boleh dipublikasikan, kontak layanan, kebijakan SLA/retensi/approval, konfigurasi penyedia dan persetujuan penggunaan AI, domain dan penanggung jawab operasi. Jawaban klien sebelumnya sudah menentukan pihak penerima dan penindak lanjut; implementasikan keputusan yang sudah ada, jangan meminta ulang.

## Batas penilaian

Audit ini memeriksa kode, tes/build, metadata konfigurasi Vercel dan beberapa URL live anonim. Tidak mengaudit seluruh database deployed, tidak memverifikasi akun nyata, tidak melakukan pentest dan tidak menjalankan QA visual lengkap semua viewport. Persentase bersifat estimasi; kelulusan akhir harus ditentukan oleh alur produksi yang berhasil dan bukti pengujian, bukan angka registry.
