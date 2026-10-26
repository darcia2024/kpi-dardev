# Patch keamanan Next.js, sharp, dan Zod

Tanggal: 26 Oktober 2026.

## Temuan

`npm audit` pada commit `70b5ea0` melaporkan tiga kerentanan baru yang belum ada pada pemeriksaan 6 Oktober (dokumen 53):

| Paket | Versi lama | Tingkat | Advisory |
| --- | --- | --- | --- |
| `next` | 16.3.8 | Critical | GHSA-2464-fhr4-w9xw (RCE pada Image Optimization API dengan SVG), GHSA-673q-mjm6-r5xr (RCE pada `use cache`), GHSA-p3m5-59mp-jv5r (DoS Server Actions) |
| `sharp` (transitif dari `next`) | 0.35.4 | High | GHSA-wq5f-xc86-pv6w (librsvg) |
| `zod` | 4.6.1 | High | GHSA-mrhx-c7xc-m3w5 (memori habis pada koleksi besar) |

Situs memakai `next/image`, sehingga endpoint Image Optimization aktif di deployment.

## Perubahan

- `next` 16.3.8 → 16.4.3 (exact).
- `zod` 4.6.1 → 4.6.7 (exact).
- `sharp` 0.35.4 → 0.35.5 di lockfile.

Tidak ada perubahan kode aplikasi. Panduan upgrade Next.js 16 di `node_modules/next/dist/docs` tidak mencatat perubahan yang memengaruhi proyek untuk 16.4.

## Verifikasi

Dijalankan dengan Node.js 24.22.1 sesuai `engines`:

- `npm audit`: 0 kerentanan diketahui.
- `npm run verify`: typecheck, 185/185 tes, dan build production lulus.
- `next start` dengan `.env.example` (TEST lokal): `/`, `/en`, `/masuk`, `/portal`, `/publik/pengaduan`, `/api/v1/health`, dan `/_next/image` merespons 200.

## Yang masih diperlukan

Deployment Vercel dilakukan manual lewat CLI, sehingga patch ini belum live sampai dideploy ulang dari folder kerja. Setelah deploy, jalankan lagi `scripts/check-anonymous-access.ts` terhadap alias production seperti pada dokumen 53.
