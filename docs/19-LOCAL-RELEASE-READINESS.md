# Kesiapan Rilis Lokal TEST

> Koreksi audit backend: dokumen ini mencatat pemeriksaan awal build/unit test/health saja. Uji integrasi, konkurensi lintas modul, pemulihan dan UAT belum lengkap. Daftar pekerjaan backend aktif: `20-BACKEND-COMPLETION.md`.

Status per 22 September 2026: **siap ditinjau secara lokal dengan data sintetis TEST; belum boleh dirilis ke staging atau produksi.**

## Bukti verifikasi lokal

| Pemeriksaan | Hasil | Bukti |
|---|---|---|
| TypeScript | Lulus | `npm run typecheck` |
| Unit dan workflow TEST | Lulus | `npm run test` · 32 test lulus |
| Build produksi Next.js | Lulus | `npm run build` · 59 route berhasil dibangkitkan |
| Paket verifikasi | Lulus | `npm run verify` |
| Smoke server produksi lokal | Lulus | `npm run start -- --port 3101`, lalu `GET /api/v1/health` mengembalikan `status: ok` dan `environment: local` |

## Runbook local TEST

1. Gunakan Node.js 24 atau lebih baru. Buat `.env.local` dari `.env.example` hanya jika belum tersedia; jangan menimpa konfigurasi yang sudah ada.
2. Jalankan `npm install`, kemudian `npm run verify`.
3. Untuk pemeriksaan artefak produksi lokal, jalankan `npm run start -- --port 3101` setelah build selesai.
4. Periksa `http://localhost:3101/api/v1/health`. Respons harus memiliki `status: "ok"`, environment `local`, dan `x-request-id`.
5. Bila pemeriksaan gagal, hentikan server, simpan request ID dan output yang sudah teredaksi ke register defect, lalu ulangi dari `npm run verify`. Jangan mengubah data TEST menjadi data nyata untuk mereproduksi masalah.

## Register defect lokal

| ID | Area | Status | Catatan |
|---|---|---|---|
| DEF-LOCAL-001 | Database TEST | Terbuka | Migration dan seed belum dieksekusi karena Docker/PostgreSQL lokal belum tersedia. Ini blocker verifikasi persistence, bukan defect kode yang telah direproduksi. |
| DEF-LOCAL-002 | Staging/produksi | Terbuka | Tidak ada akun, domain, hosting, observability, backup, atau secret milik KPI yang telah ditetapkan. |
| DEF-LOCAL-003 | UAT & kebijakan | Terbuka | Owner UAT, formula evaluasi, aturan keuangan/voting, retensi, dan provider AI masih berada di register keputusan KPI. |

## Gerbang sebelum staging atau produksi

- KPI menetapkan owner layanan, environment, domain, dan secret deployment pada penyimpanan rahasia milik organisasi.
- Migration dijalankan dan dibuktikan pada PostgreSQL TEST/staging; RLS serta kebijakan akses diuji dengan peran resmi.
- Backup, restore drill, RPO/RTO, observability, dan kanal insiden dibuktikan sesuai keputusan KPI.
- UAT menutup acceptance criteria setiap modul menggunakan data yang diizinkan; temuan dicatat, diperbaiki, dan diverifikasi ulang.
- Provider AI hanya boleh diaktifkan setelah OD-08 disetujui, termasuk region, retensi, sumber, cache/embedding, dan peninjauan manusia.

Dokumen ini bukan persetujuan rilis. Persetujuan hanya dapat diberikan oleh pemilik KPI setelah seluruh gerbang eksternal di atas memiliki bukti.
