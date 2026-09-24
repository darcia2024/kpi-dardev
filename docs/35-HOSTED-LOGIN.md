# Login online pengurus

Kode login online memakai Supabase Auth. Fitur ini **belum aktif pada URL Vercel** sampai project Supabase milik KPI, akun yang disetujui, dan konfigurasi Vercel tersedia. Akun TEST lokal tidak berlaku untuk login online.

## Aktivasi

1. KPI menetapkan pemilik project Supabase, region, dan aturan penggunaan data. Aktifkan email/password dengan verifikasi email; jangan buka pendaftaran publik untuk portal pengurus.
2. Buat akun melalui undangan/admin Supabase. Setelah pemilik akun memverifikasi email, pengelola mengatur `app_metadata.kpi_access` menjadi boolean `true` dan `app_metadata.kpi_role` menjadi `PENGURUS` atau `ADMIN_SISTEM`. Metadata ini harus diubah hanya melalui jalur admin, bukan formulir pengguna atau `user_metadata`.
3. Pasang variabel berikut pada project Vercel `kpi-ppmi-mesir-preview` melalui penyimpanan environment Vercel, bukan commit Git:

   | Nama | Nilai |
   |---|---|
   | `KPI_AUTH_PROVIDER` | `supabase` |
   | `KPI_SUPABASE_URL` | URL HTTPS project Supabase KPI |
   | `KPI_SUPABASE_PUBLISHABLE_KEY` | Publishable key project tersebut |
   | `KPI_APP_ENV` | `staging` untuk pengujian |
   | `KPI_TEST_AUTH_ENABLED` | `false` |

4. Deploy ulang setelah variabel tersimpan. Uji akun yang diundang, akun tanpa izin, kata sandi salah, sesi setelah muat ulang, dan logout. Jangan menaruh kata sandi atau service-role key di chat atau repo.

Login online hanya membuka identitas dan beranda portal. Modul operasional tetap terkunci sampai persistence, permission per jabatan, migrasi database, dan pengujian RLS selesai. Menampilkan modul lokal TEST bagi akun online akan mencampur data demo dengan data KPI; kode mencegah hal itu.
