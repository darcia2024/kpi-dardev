# Fase 7 — Handoff Integrasi Resmi

Fase ini menyiapkan fondasi yang tidak menampilkan data produksi sebelum sumbernya tersedia. UI publik tetap memakai materi yang telah ditinjau di repository sampai database KPI tersambung.

## Yang sudah tersedia

- Migration `20260922000000_content_storage_workflow.sql` untuk konten berversi, metadata berkas, persetujuan, aspirasi, dan idempotensi.
- Semua tabel baru memakai Row Level Security tanpa policy publik. Akses hanya bisa dibuka setelah kebijakan KPI disetujui.
- Adapter REST Supabase hanya berjalan di server dan membutuhkan dua secret deployment: `KPI_SUPABASE_URL` dan `KPI_SUPABASE_SERVICE_ROLE_KEY`.
- Permission TEST hanya memberi admin akses baca konfigurasi. Hak menulis, meninjau, menerbitkan, serta mengunduh berkas tidak diberikan secara implisit.
- Upload ditolak sampai allowlist MIME, ukuran berkas, retensi, serta pihak yang berwenang disahkan.
- Siklus konten yang tersedia: `DRAFT → IN_REVIEW → APPROVED → PUBLISHED → ARCHIVED`, dengan jalur revisi. Penulis tidak dapat menyetujui karyanya sendiri.

## Yang perlu disediakan KPI sebelum aktivasi

1. Project Supabase yang dimiliki akun organisasi KPI, lalu jalankan seluruh migration di `supabase/migrations/`.
2. Set dua secret tersebut pada deployment environment; jangan simpan nilainya di repository atau variabel browser.
3. Sahkan keputusan akses akun, pemetaan pengurus/reviewer, klasifikasi data, allowlist/retensi berkas, dan SLA aspirasi yang tercatat di `docs/01-OPEN-DECISIONS.md`.
4. Setelah keputusan disahkan, tambahkan policy RLS per aksi dan uji minimal: baca, unduh, unggah, draft, review, approve, publish, serta triage aspirasi.

Endpoint lokal untuk memeriksa kesiapan konfigurasi adalah `GET /api/v1/admin/integrations`. Endpoint tersebut membutuhkan sesi `ADMIN_SISTEM` TEST dan hanya mengembalikan status, bukan URL atau credential.
