# Backend produksi, tahap 1 — 30 September 2026

Tujuan tahap ini: memindahkan data portal dari penyimpanan lokal (SQLite TEST) ke Supabase milik KPI tanpa menulis ulang logika modul yang sudah teruji. Modul pertama yang dibuka untuk akun online: **Tugas**.

Keputusan pendekatan (disetujui 30 Sep): **jalur cepat aman**, dan migrasi dijalankan lewat **SQL Editor**.

## Cara kerja

| Bagian | Isi |
|---|---|
| Penyimpanan | Tabel `platform.records`: satu dokumen JSON per catatan, kunci `(organisasi, namespace, id)`, nomor revisi. Tabel `platform.record_revisions`: riwayat setiap perubahan beserta pelakunya, tidak bisa diubah, dihapus, atau dikosongkan (trigger). |
| Akses database | RLS menyala tanpa policy dan semua hak dicabut dari `anon`/`authenticated`: browser tidak bisa membaca apa pun. Hanya server (service role) yang bisa memanggil fungsi `kpi_load_records`, `kpi_commit_records`, `kpi_get_organization`, `kpi_list_periods`. |
| Per permintaan | Server memuat catatan organisasi ke memori (`SnapshotRecordDatabase`), menjalankan logika service yang sama seperti mode lokal, lalu mengirim semua perubahan sekali jalan. `kpi_commit_records` menerapkan semuanya atau tidak sama sekali. |
| Tabrakan edit | Bila dua orang mengubah catatan yang sama, perubahan kedua ditolak (409, pesan "Data ini baru saja diubah oleh orang lain"). Audit dari permintaan yang gagal ikut dibatalkan. |
| Log besar | `business-audit` tidak dimuat pada permintaan biasa (hanya ditulis). Route yang membaca riwayat memintanya secara eksplisit. |
| Batas 1000 baris API | `kpi_load_records` mengembalikan satu array JSON, jadi tidak terpotong oleh batas baris API Supabase. |
| Identitas & periode | Akun dari Supabase Auth (`kpi_access = true`). Organisasi `KPI_PPMI_MESIR` (bisa diganti dengan `KPI_ORGANIZATION_CODE`) dan periode `ACTIVE` dari `org.periods`. |
| Izin | Baseline sementara per peran, sama dengan persona pratinjau yang sudah ditinjau: Admin Sistem dan Pengurus. Tambahan izin hanya lewat grant yang tercatat. Matriks izin resmi (K17) masih menunggu KPI. |
| Mode lokal | Tidak berubah. Tanpa login online, portal tetap memakai SQLite TEST. |

Kode inti: `src/platform/data/{snapshot-record-database,record-transaction,supabase-record-store,record-context}.ts`, `src/platform/identity/portal-context.ts`, `src/platform/http/portal-route.ts`, `src/platform/authorization/production-authorization.ts`, `src/platform/identity/production-directory.ts`. Migrasi: `supabase/migrations/20260930000000_record_store.sql`.

## Yang sudah bisa dipakai akun online

- Beranda portal dengan menu yang hanya berisi modul yang sudah tersambung.
- **Tugas**: daftar, buat, template, mulai, sub-tugas, komentar, hambatan, review, perpanjang tenggat, delegasi, batal, arsip, riwayat.
- Pemilik dan penerima delegasi dipilih dari akun KPI sungguhan (bukan akun TEST).

Belum: **mengajukan tugas dengan bukti file**. Itu menunggu penyimpanan dokumen dan pemindai file dipindahkan (tahap berikutnya). Daftar dokumen sudah bisa dibaca, tetapi masih kosong.

## Aktivasi (dilakukan pemegang akun Supabase dan Vercel)

1. Supabase KPI → SQL Editor → jalankan `supabase/sql-editor/01-struktur-database.sql` (sekali).
2. Isi dua tanggal periode di `supabase/sql-editor/02-organisasi-dan-periode.sql`, lalu jalankan. Tanpa tanggal, perintah sengaja gagal.
3. Vercel → project `kpi-ppmi-mesir-preview` → Environment Variables → tambah `KPI_SUPABASE_SERVICE_ROLE_KEY` (Production, tandai *Sensitive*). Nilainya diambil sendiri dari Supabase → Project Settings → API Keys (secret/service role). Jangan dikirim lewat chat atau disimpan di repo.
4. Deploy versi kode ini, lalu uji: login → beranda menampilkan kartu Tugas → buat tugas → muat ulang → tugas tetap ada.
5. Disarankan: set region Vercel Functions ke `bom1` (Mumbai) agar dekat dengan database Supabase di `ap-south-1`; setiap permintaan melakukan beberapa panggilan ke database.

Kunci service role memberi akses penuh ke database. Ia hanya boleh ada di penyimpanan rahasia server (Vercel), tidak pernah di browser, repo, atau chat.

## Pengujian

- `tests/record-store-sql.test.ts`: seluruh migrasi dijalankan di Postgres sungguhan (PGlite); commit atomik, konflik revisi, riwayat tidak bisa diubah, peran browser ditolak, 1.200 catatan tidak terpotong.
- `tests/snapshot-record-database.test.ts`, `tests/record-transaction.test.ts`: service tugas berjalan di atas snapshot; alur tugas utuh lewat fungsi SQL; dua edit bersamaan → yang kedua ditolak dan auditnya ikut batal.
- `tests/production-access.test.ts`: baseline izin, pemilihan periode, pemetaan error Supabase.
- `tests/sql-editor-bundle.test.ts`: bundle SQL Editor identik dengan migrasi, tanpa data TEST, dan langkah 2 menolak tanggal kosong.
- Hasil 30 Sep: typecheck bersih, 178 tes lulus, `next build` berhasil; mode pratinjau lokal diuji di browser (buat tugas, riwayat).

## Tahap berikutnya

1. Dokumen & file: penyimpanan privat Supabase Storage, karantina, pemindai, lalu pengajuan tugas dengan bukti.
2. Modul lain dipindahkan ke `portalRoute` satu per satu (rapat, notifikasi, kasus, keuangan, evaluasi, knowledge, handover), masing-masing ditambahkan ke `hostedReadyDestinations` setelah diuji.
3. Pergantian periode untuk akun online, halaman profil, dan kelola grant izin dari portal.
4. Optimasi: cache identitas per permintaan (layout dan halaman sekarang memuat data dua kali).
