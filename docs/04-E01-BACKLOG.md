# Backlog E01: Fondasi Aplikasi

Status: implementasi lokal sedang berjalan. Setiap task menjadi Ready untuk layanan institusi setelah keputusan fondasi terkait disetujui dan dependensinya selesai.

| ID | Hasil | Dependensi | Kriteria selesai |
|---|---|---|---|
| E01-T01 | Bootstrap aplikasi dengan build reproducible | D-01 | TypeScript strict, lint, test runner, dan build berjalan dari checkout bersih |
| E01-T02 | Konfigurasi environment tervalidasi | D-01, D-04 | Local/staging hanya menerima konfigurasi TEST; secret tidak dapat masuk commit atau respons error |
| E01-T03 | Struktur modul dan kontrak respons | E01-T01 | Route publik/portal, error terstruktur, correlation ID, dan validasi input tersedia |
| E01-T04 | Shell dan sistem desain aplikasi | D-01 dan keputusan arah UI | Komponen aksesibel untuk navigasi, form, tabel, dialog, loading, empty, error, fokus, tema, dan mobile |
| E01-T05 | Inisialisasi database dan migrasi platform | D-02, D-03, D-04 | Migrasi berversi, UUID, audit dasar, organisasi/periode, dan seed TEST dapat dibuat ulang |
| E01-T06 | CI dan pemeriksaan kualitas | E01-T01 | Typecheck, lint, test, build, serta pemeriksaan secret berjalan pada setiap perubahan |
| E01-T07 | Observabilitas, health check, dan restore staging | D-04, D-05 | Error teredaksi, health check, backup staging, dan restore drill memiliki bukti |

## Status implementasi pada checkout lokal

| Task | Status | Bukti saat ini |
|---|---|---|
| E01-T01 | Selesai lokal | Next.js, TypeScript strict, build reproducible, dan lockfile tersedia |
| E01-T02 | Selesai lokal | `.env.example` dan validator environment membatasi runtime pada local, staging, atau production tanpa memuat secret |
| E01-T03 | Selesai awal | Struktur `src/platform` dan endpoint health v1 dengan error terstruktur serta request ID tersedia |
| E01-T04 | Selesai awal | Shell publik dan portal, navigasi keyboard, pengalih tema, layout mobile, state TEST, kartu ruang kerja, serta komponen empty/loading/error tersedia. Tampilan diuji pada browser lokal; modul bisnis tetap berupa state jujur sampai fase terkait siap. |
| E01-T05 | Selesai awal | Migrasi SQL dan seed TEST untuk organisasi, periode, konfigurasi, dan audit tersedia; belum dieksekusi karena Docker/Supabase CLI belum tersedia |
| E01-T06 | Selesai awal | Workflow CI serta perintah typecheck, test, dan build tersedia |
| E01-T07 | Sebagian | Health endpoint dan correlation ID tersedia; backup/restore staging menunggu layanan yang disetujui |

## Urutan kerja

1. E01-T01 dan E01-T02 membuka pekerjaan lain.
2. E01-T03 dan E01-T05 berjalan setelah fondasi runtime/data siap.
3. E01-T04 menyediakan shell fondasi. Halaman produk final mengikuti kesiapan autentikasi, hak akses, dan modul bisnis.
4. E01-T06 berjalan sejak task pertama dan menjadi wajib sebelum review.
5. E01-T07 selesai sebelum modul bisnis memakai staging.

## Bukti minimum setiap task

- Perubahan berada di branch kerja dan dapat direview.
- Tes yang sesuai dengan risiko task lulus.
- Data yang digunakan sintetis dan berlabel TEST.
- Konfigurasi, secret, dan data internal tidak muncul di commit, output test, atau screenshot.
- Matriks cakupan dan register keputusan diperbarui bila task menutup atau membuka dependency.
