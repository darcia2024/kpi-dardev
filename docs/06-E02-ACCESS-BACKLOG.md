# Backlog E02: Akses dan Identitas

Status: lokal TEST sedang dibangun. Ini bukan autentikasi produksi dan tidak menggunakan akun KPI.

| Task | Status | Bukti saat ini | Batas sebelum integrasi Supabase |
|---|---|---|---|
| E02-T01 | Selesai awal | Sign-in, MFA, cookie sesi HTTP-only, logout, dan sesi kedaluwarsa berjalan di local TEST | Kredensial dan kode MFA bersifat fixture TEST dalam memori proses |
| E02-T02 | Selesai awal | Role `PENGURUS` dan `ADMIN_SISTEM` diuji; endpoint admin menolak role pengurus | Izin belum dipetakan per objek/divisi/periode |
| E02-T03 | Selesai awal | Migrasi berversi untuk akun, role, assignment, jabatan, dan periode tersedia | Migrasi belum dieksekusi dan belum memiliki RLS policy produksi |
| E02-T04 | Belum mulai | Mapping jabatan, masa sesi, rate limit, pemulihan MFA, dan konflik kepentingan menunggu OD-01/OD-02 | Tidak boleh diisi dengan asumsi |

## Akun uji lokal

Gunakan hanya pada `KPI_APP_ENV=local` dengan `KPI_TEST_AUTH_ENABLED=true`:

- Pengurus: `pengurus.test@kpi.local`
- Admin Sistem: `admin.test@kpi.local`
- Kata sandi fixture: `KPI-TEST-2026`
- Kode MFA fixture: `000000`

Fixture ini sengaja tidak berlaku di staging atau production. Tidak boleh mengganti atau mewakili akun institusi.
