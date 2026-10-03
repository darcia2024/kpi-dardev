# Contoh data internal

Permintaan pengguna: satu dummy data setiap fitur untuk melihat gambaran sistem.

Tersedia 18 contoh, satu per tujuan navigasi internal ditambah organisasi/periode. Admin membukanya lewat /portal/demo (menu Data demo). Modul yang belum memakai penyimpanan hosted juga menampilkan contoh sesuai modul di URL-nya masing-masing.

Setiap contoh memiliki kode DEMO, status ilustrasi, ringkasan, rincian, dan alur. Pengguna bisa membuka rincian melalui disclosure keyboard-accessible. Seluruh contoh fiktif dan read-only, termasuk skenario kasus tanpa tuduhan atau identitas nyata. Email menggunakan domain .invalid.

Fixture berada di src/lib/portal-demo.ts. Tidak menjalankan seed-demo lokal, tidak menulis database production, tidak membuat pengguna/periode/permission, tidak memicu AI, notifikasi, saldo, publikasi, atau workflow. Tidak membuka demo untuk pengguna non-admin. Modul tugas operasional tetap membaca Supabase tanpa menyisipkan contoh ke hasil query.

Ini demonstrasi isi dan alur per modul, bukan UAT CRUD backend setiap fitur. Backend hosted modul lainnya tetap perlu dibangun. Profil, tugas, akses, dan konfigurasi asli tetap terpisah; contohnya tersedia di katalog demo.

Contoh juga tampil langsung di setiap URL modul pada deployment Vercel. Pada beranda, tugas, profil, akses, dan pengaturan, panel contoh berada setelah informasi/fitur operasional dan hanya ditambahkan untuk admin. Detail terbuka sejak awal dan dapat dilipat. Modul lain menampilkan contoh lewat halaman status hosted. Navigasi client memilih fixture sesuai pathname tanpa menulis atau mengganti data Supabase.

## Validasi dan deploy

2 Oktober 2026: typecheck dan dua tes cakupan fixture lulus; build production serta enam probe Supabase lulus. Deployment dpl_BgZd5fjH9rNogWjpuQ6TGp3nitMa READY pada https://kpi-ppmi-mesir-preview.vercel.app. Pengujian anonim /portal/demo mengarah ke login dan tidak membocorkan contoh kasus. Pemeriksaan visual sesi admin live masih perlu dilakukan dengan sesi pengguna.

Deployment lanjutan dpl_kiNUdWuJbLeAkErMPeAFiDsQfXpe READY memasang contoh pada seluruh halaman modul termasuk halaman hosted yang aktif; typecheck, dua tes fixture, enam probe koneksi dan build kembali lulus. /portal/demo untuk anonim tetap mengarah ke /masuk, health HTTP 200.
