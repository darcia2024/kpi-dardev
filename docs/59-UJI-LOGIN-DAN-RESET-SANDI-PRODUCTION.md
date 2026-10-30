# Login, keputusan MFA, dan uji reset sandi di production

Tanggal: 30 Oktober 2026. Website: https://kpi-dardev.vercel.app.

## Temuan dari pemeriksaan kode

**Login dua langkah (MFA) belum ada di production.** Di mode hosted, `/api/v1/auth/sign-in` memanggil `signInWithPassword` Supabase lalu langsung membuka portal. Langkah kode verifikasi enam digit hanya ada di mode pratinjau lokal (`KPI_TEST_AUTH_ENABLED=true`, kode tetap `000000`). Tidak ada pendaftaran faktor kedua, dan tidak ada pemeriksaan tingkat jaminan `aal2` di sisi server.

Artinya bagian "MFA" pada tes otomatis dan Playwright hanya membuktikan alur simulasi lokal, bukan keamanan akun production.

**Keputusan 30 Oktober 2026: MFA tidak dipakai di production.** Login tetap email dan kata sandi. Konsekuensinya, kata sandi menjadi satu-satunya pelindung akun, termasuk akun yang bisa membuka data kasus dan keuangan RAHASIA. Untuk mengurangi risikonya:

- Minta setiap pengurus memakai kata sandi unik (tidak dipakai di layanan lain), sebaiknya dari password manager.
- Atur panjang minimum kata sandi di Supabase → Authentication → Sign In / Providers → Email, dan aktifkan pemeriksaan kata sandi bocor kalau tersedia di paket yang dipakai.
- Batasi jumlah akun admin teknis, dan cabut akses pengurus yang selesai menjabat lewat F05 tepat waktu.
- Kalau keputusan ini ditinjau ulang, langkah teknisnya: aktifkan TOTP di Supabase, tambahkan halaman pendaftaran autentikator dan langkah kode setelah kata sandi, lalu wajibkan tingkat `aal2` di server.

## Reset sandi (bisa diuji sekarang)

Alurnya memakai `resetPasswordForEmail` Supabase dengan tautan kembali ke `/masuk/atur-ulang`. Uji ini hanya boleh dijalankan oleh pemilik akun sendiri, dengan akun miliknya.

### Persiapan di Supabase

Sebelum 30 Oktober 2026, Site URL masih `https://kpi-ppmi-mesir-preview.vercel.app` dan `kpi-dardev.vercel.app` belum ada di Redirect URLs, sehingga tautan pemulihan dikirim ke alamat preview lama. **Sudah diperbaiki 30 Oktober 2026**: Site URL menjadi `https://kpi-dardev.vercel.app` dan `https://kpi-dardev.vercel.app/**` ditambahkan ke Redirect URLs. Entri `https://kpi-ppmi-mesir-preview.vercel.app/**` masih ada dan bisa dihapus setelah project itu dimatikan. Pengaturan yang benar:

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
