# Kesiapan produksi — 23 September 2026

Status: **belum siap menerima data atau menjalankan proses resmi KPI**. Build aplikasi berhasil, tetapi autentikasi, penyimpanan, dan alur kerja aktif masih memakai akun serta data pratinjau lokal.

## Yang sudah diamankan di antarmuka

- Label `TEST` yang terlihat pada halaman dan komponen portal diganti dengan keterangan pratinjau lokal. Nilai teknis seperti kode scope, mata uang sintetis, dan token pengujian tetap dipertahankan agar kontrak API tidak rusak.
- Saat lingkungan bukan pratinjau lokal, halaman masuk tidak menampilkan formulir akun contoh; halaman aspirasi tidak menampilkan formulir pengiriman; katalog publikasi tidak membaca SQLite lokal; dan artikel contoh tidak dapat dibuka.
- Sesi akun pratinjau ditolak di luar lingkungan lokal, termasuk bila cookie lama masih tersimpan di browser.
- API autentikasi, aspirasi, dan modul internal tetap menolak operasi di luar lingkungan lokal sampai integrasi resminya tersedia.

## Gerbang yang masih harus ditutup sebelum go-live

1. Identitas pengurus resmi, MFA, pemulihan akun, dan matriks izin yang disahkan.
2. Database produksi milik KPI beserta migrasi, RLS, backup, dan uji pemulihan. SQLite di `.kpi-test` bukan penyimpanan produksi.
3. Storage privat untuk dokumen dan bukti, pemindaian berkas, retensi, serta audit akses.
4. SOP pengaduan dan aspirasi, kanal penerimaan, pembagian tugas sekretaris/divisi, notifikasi, dan bukti tindak lanjut.
5. Dua puluh delapan dokumen resmi, konten publik yang disetujui, periode kepengurusan, dan data anggota yang sah.
6. Keputusan kebijakan keuangan, evaluasi, handover, dan provider AI sebelum modul-modul itu dipakai untuk keputusan organisasi.
7. Domain/hosting, secret management, observability, incident response, UAT, dan persetujuan rilis dari Ketua KPI serta tim pengelola website.

Jangan mengaktifkan formulir atau akun contoh untuk pemakaian publik hanya dengan menghapus penanda pratinjau. Setelah gerbang di atas selesai, tiap modul perlu dipindahkan ke adapter dan kebijakan produksi, diuji dengan data yang diizinkan, lalu dibuka secara bertahap.
