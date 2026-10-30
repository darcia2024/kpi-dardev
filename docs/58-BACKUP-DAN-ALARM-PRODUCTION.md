# Backup database dan alarm production

Tanggal: 30 Oktober 2026. Website resmi: https://kpi-dardev.vercel.app. Database: Supabase project `gtjzlkmwafyttevertho` (paket Free, tanpa backup otomatis dari Supabase).

## Alarm situs down — `.github/workflows/uptime.yml`

- Jalan setiap 15 menit di GitHub Actions. Memeriksa `/`, `/pitch`, `/masuk` (harus HTTP 200) dan `/api/v1/health` (harus `"status":"ok"`). Tiap permintaan dicoba ulang 2 kali sebelum dianggap gagal.
- Kalau gagal, workflow membuka issue `Production down: https://kpi-dardev.vercel.app`, atau menambah komentar kalau issue itu masih terbuka. GitHub mengirim email notifikasi issue ke pemilik repo. Issue ditutup otomatis saat situs pulih.
- Tidak butuh secret. Bisa dijalankan manual dari tab Actions → Uptime production → Run workflow.
- Batasan: jadwal GitHub bisa terlambat beberapa menit saat antrean padat, dan GitHub menonaktifkan jadwal di repo publik yang tidak ada aktivitas selama 60 hari. Repo ini juga publik, jadi issue alarm bisa dilihat siapa saja.

## Backup harian — `.github/workflows/backup.yml`

Jalan setiap hari pukul 03.00 WIB dan bisa dijalankan manual. Setiap run:

1. `pg_dump` skema aplikasi (`public`, `platform`, `org`, `audit`, `identity`, `content`, `files`, `workflow`, `intake`, `work`, `governance`, `notifications`, `management`) ditambah `auth` dan `storage`.
2. Mencatat jumlah baris persis setiap tabel aplikasi di database sumber (`scripts/backup/row-counts.sql`).
3. **Uji restore**: memulihkan dump ke PostgreSQL 17 kosong di runner, menghitung ulang jumlah baris, lalu gagal kalau ada satu tabel pun yang berbeda.
4. Mengenkripsi arsip dengan AES-256 (GPG) lalu menyimpannya sebagai artifact selama 30 hari. Repo ini publik, jadi dump tanpa enkripsi tidak pernah diunggah.
5. Kalau ada langkah yang gagal, membuka issue `Backup database production gagal`.

### Secret yang harus diisi pemilik repo

GitHub → repo `darcia2024/kpi-dardev` → Settings → Secrets and variables → Actions → New repository secret:

| Nama | Isi |
|---|---|
| `KPI_DATABASE_URL` | Supabase → Connect → **Session pooler** (bukan Direct connection, karena runner GitHub tidak mendukung IPv6). Formatnya `postgresql://postgres.gtjzlkmwafyttevertho:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`. |
| `KPI_BACKUP_PASSPHRASE` | Kalimat sandi acak minimal 24 karakter. **Simpan juga di password manager.** Tanpa kalimat sandi ini backup tidak bisa dibuka. |

Setelah keduanya diisi, jalankan Actions → Backup database production → Run workflow, dan pastikan run pertama hijau.

### Memulihkan dari backup

1. Unduh artifact `kpi-backup-<tanggal>.tar.gz.gpg` dari run yang diinginkan.
2. Dekripsi: `gpg --decrypt kpi-backup-<tanggal>.tar.gz.gpg > kpi-backup.tar.gz`, lalu `tar -xzf kpi-backup.tar.gz`.
3. Pulihkan **ke database staging atau database baru dulu**, jangan langsung menimpa production: `pg_restore --dbname="<URL database tujuan>" --no-owner --no-privileges kpi.dump`.
4. Bandingkan hasil `scripts/backup/row-counts.sql` di database tujuan dengan `source-counts.txt` dari arsip.

### Yang belum tercakup

- **Berkas di Supabase Storage.** Backup hanya menyimpan metadata berkas (skema `storage`), bukan isi berkasnya. Selama pemindai berkas belum aktif, semua unggahan masih dikarantina, tapi isi berkas perlu dicadangkan sebelum dokumen resmi mulai disimpan di sana.
- **Pemulihan ke Supabase sungguhan.** Uji restore otomatis memakai PostgreSQL biasa, jadi objek khusus Supabase (misalnya ekstensi internal) tercatat sebagai peringatan di `restore-errors.txt`. Pemulihan penuh ke project Supabase sebaiknya dilatih di staging.
- **Retensi 30 hari.** Artifact GitHub otomatis terhapus setelah 30 hari. Untuk arsip lebih lama, salin arsip terenkripsi ke penyimpanan milik KPI.
