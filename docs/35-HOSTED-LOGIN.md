# Login online pengurus

Kode login online memakai Supabase Auth. Pada 2 Oktober 2026, konfigurasi hosted sudah tersedia di Vercel Production dan probe Auth berhasil. Akun pengurus nyata dan akses modul belum diverifikasi end-to-end. Akun TEST lokal tidak berlaku untuk login online. Status fondasi terbaru ada di `40-PAKET-1-FONDASI-PRODUKSI.md`.

## Aktivasi

1. KPI menetapkan pemilik project Supabase, region, dan aturan penggunaan data. Aktifkan email/password dengan verifikasi email; jangan buka pendaftaran publik untuk portal pengurus.
2. Buat akun melalui undangan/admin Supabase. Setelah pemilik akun memverifikasi email, pengelola mengatur `app_metadata.kpi_access` menjadi boolean `true` dan `app_metadata.kpi_role` menjadi `PENGURUS` atau `ADMIN_SISTEM`. Metadata ini harus diubah hanya melalui jalur admin, bukan formulir pengguna atau `user_metadata`.
3. Pasang variabel berikut pada project Vercel `kpi-ppmi-mesir-preview` melalui penyimpanan environment Vercel, bukan commit Git:

   | Nama | Nilai |
   |---|---|
   | `KPI_AUTH_PROVIDER` | `supabase` |
   | `KPI_SUPABASE_URL` | URL HTTPS project Supabase KPI |
   | `KPI_SUPABASE_PUBLISHABLE_KEY` | Publishable key project tersebut |
   | `KPI_APP_ENV` | `production` di Vercel Production; staging tidak digunakan |
   | `KPI_TEST_AUTH_ENABLED` | `false` |

4. Deploy ulang setelah variabel tersimpan. Uji akun yang diundang, akun tanpa izin, kata sandi salah, sesi setelah muat ulang, dan logout. Jangan menaruh kata sandi atau service-role key di chat atau repo.

Paket 2 mengharuskan pemetaan akun organisasi, role aktif, dan RPC identitas di Supabase sebelum login diterima. Metadata saja tidak cukup. Profil dan hak akses sendiri dapat dibuka setelah instalasi; modul operasional lain tetap terkunci sampai persistence online selesai. Langkah SQL dan onboarding ada di [paket 2](41-PAKET-2-IDENTITAS-DAN-AKSES.md).
