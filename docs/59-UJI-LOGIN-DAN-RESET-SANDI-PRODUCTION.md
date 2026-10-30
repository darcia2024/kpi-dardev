# Uji login, login dua langkah, dan reset sandi di production

Tanggal: 30 Oktober 2026. Website: https://kpi-dardev.vercel.app.

## Temuan dari pemeriksaan kode

**Login dua langkah (MFA) belum ada di production.** Di mode hosted, `/api/v1/auth/sign-in` memanggil `signInWithPassword` Supabase lalu langsung membuka portal. Langkah kode verifikasi enam digit hanya ada di mode pratinjau lokal (`KPI_TEST_AUTH_ENABLED=true`, kode tetap `000000`). Tidak ada pendaftaran faktor kedua, dan tidak ada pemeriksaan tingkat jaminan `aal2` di sisi server.

Artinya bagian "MFA" pada tes otomatis dan Playwright hanya membuktikan alur simulasi lokal, bukan keamanan akun production. Menambahkan MFA sungguhan memerlukan:

1. Mengaktifkan TOTP di Supabase → Authentication → Multi-Factor.
2. Halaman pendaftaran aplikasi autentikator (QR code) untuk setiap pengurus.
3. Langkah verifikasi kode setelah kata sandi di `/masuk` untuk akun yang sudah punya faktor.
4. Pemeriksaan `aal2` di server sebelum portal dan API internal melayani permintaan, minimal untuk admin dan pemegang izin RAHASIA.
5. Prosedur pemulihan kalau pengurus kehilangan HP, misalnya admin mencabut faktor lewat Supabase setelah verifikasi identitas.

Keputusan yang dibutuhkan dari KPI: apakah MFA wajib untuk semua pengurus, atau hanya admin dan pemegang data rahasia.

## Reset sandi (bisa diuji sekarang)

Alurnya memakai `resetPasswordForEmail` Supabase dengan tautan kembali ke `/masuk/atur-ulang`. Uji ini hanya boleh dijalankan oleh pemilik akun sendiri, dengan akun miliknya.

### Persiapan di Supabase

Per 30 Oktober 2026, **Site URL masih `https://kpi-ppmi-mesir-preview.vercel.app`** dan Redirect URLs hanya berisi `http://localhost:3000/**` serta `https://kpi-ppmi-mesir-preview.vercel.app/**`. Karena `kpi-dardev.vercel.app` tidak ada di daftar, Supabase mengabaikan `redirectTo` dari website resmi dan mengirim tautan pemulihan ke alamat preview lama. Perbaiki dulu sebelum menguji:

1. Authentication → URL Configuration:
   - **Site URL**: `https://kpi-dardev.vercel.app`
   - **Redirect URLs**: tambahkan `https://kpi-dardev.vercel.app/masuk/atur-ulang`. Kalau masih ada alamat `kpi-ppmi-mesir-preview`, hapus setelah project itu dimatikan.
2. Authentication → Emails → SMTP: paket Free memakai pengirim bawaan Supabase dengan batas beberapa email per jam. Untuk pemakaian resmi, sambungkan SMTP milik KPI.

### Langkah uji

| ID | Langkah | Hasil yang diharapkan | Hasil |
|---|---|---|---|
| RST-01 | Buka `/masuk/lupa-sandi`, isi email akun penguji, kirim. | Pesan "Jika email terdaftar, tautan pemulihan telah dikirim." | |
| RST-02 | Ulangi dengan email yang tidak terdaftar. | Pesan yang sama persis, supaya formulir tidak bisa dipakai menebak akun. | |
| RST-03 | Buka email pemulihan, klik tautannya. | Terbuka `https://kpi-dardev.vercel.app/masuk/atur-ulang`, bukan localhost atau alamat preview. | |
| RST-04 | Isi kata sandi lemah. | Ditolak dengan pesan syarat kata sandi. | |
| RST-05 | Isi kata sandi baru yang kuat, simpan. | Diarahkan ke halaman masuk. | |
| RST-06 | Login dengan kata sandi lama. | Ditolak. | |
| RST-07 | Login dengan kata sandi baru. | Portal terbuka. | |
| RST-08 | Buka lagi tautan email yang sama. | Ditolak karena tautan sudah dipakai. | |
| RST-09 | Kalau sebelum reset ada sesi lain yang login (misalnya di HP), muat ulang portal di sana. | Diminta login lagi, karena reset mengeluarkan semua sesi. | |

Catat hasil sebagai PASS, FAIL, atau BLOCKED, tanpa menyalin kata sandi, tautan pemulihan, atau cookie ke catatan.
