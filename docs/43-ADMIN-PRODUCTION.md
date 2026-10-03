> Pembaruan 2 Oktober 2026: ketentuan admin penuh historis di bawah digantikan oleh SOP kerahasiaan v1.1. Admin teknis tidak otomatis mendapat akses isi bisnis. Lihat [penyesuaian SOP](47-SOP-KERAHASIAAN-V11.md).

# Pengelolaan admin production

Permintaan owner: admin dapat mengakses dan mengelola seluruh modul. Role teknis ADMIN_SISTEM sebelumnya hanya membuka identitas sendiri. Perubahan ini membuat persetujuan administrator sistem eksplisit, tersimpan pada identity.system_administrators, dengan audit dan pencabutan akses.

## Akses

- Identitas Auth harus tetap terverifikasi, akun ACTIVE dan role ADMIN_SISTEM aktif. Role saja tidak cukup: record persetujuan admin juga harus aktif.
- Admin mengelola seluruh permission modul pada organisasi/periode ACTIVE atau CLOSING yang tanggalnya sedang berlaku; scope yang salah, periode CLOSED dan periode mendatang tidak memberi izin operasional.
- managedScopes terpisah dari memberships: pengelolaan admin bukan penugasan jabatan organisasi yang dibuat-buat.
- Tidak menghapus aturan transaksi, perubahan versi, atau separation of duties. Reviewer tugas tetap tidak boleh pembuat/pemilik.
- Pencabutan record admin, pencabutan role, atau penangguhan akun berlaku pada permintaan baru.

## Halaman

Portal admin memakai sidebar yang sama dengan antarmuka internal, menampilkan seluruh tujuan navigasi. Tugas, profil, akses dan pengaturan organisasi/periode memakai jalur hosted. Halaman lain diarahkan melalui rewrite ke halaman status modul, mempertahankan URL tujuan, tanpa memanggil database lokal. Ini belum merupakan migrasi backend seluruh modul.

/portal/pengaturan membaca daftar organisasi/periode dan menyimpan data resmi yang diisi admin melalui RPC sesi pengguna, tanpa service-role. Insert organisasi/periode serta audit berada dalam satu transaksi; pengiriman ulang nilai sama tidak menggandakan data. Nama atau tanggal yang berbeda pada kode yang sudah dipakai ditolak. Periode mendatang PLANNED; periode yang sudah dimulai ACTIVE; tanggal akhir yang sudah lewat ditolak.

Periode atau jabatan dummy tidak dibuat. Admin tidak perlu jabatan rekaan untuk pengelolaan teknis. Setelah periode resmi aktif disimpan, admin dapat membuat tugas untuk diri sendiri; penugasan pengurus biasa tetap perlu posisi/penugasan resmi. Form onboarding roster, lampiran tugas, dan repository hosted modul lain masih pekerjaan berikutnya.

## Migration dan pengujian

20261002000400_system_administration.sql menambahkan persetujuan untuk akun kpippmimesirofficial@gmail.com (UUID Auth yang sudah diverifikasi), RPC directory/setup, perluasan konteks akun serta pemeriksaan admin pada permission database. Migration tidak dijalankan sebelum konfirmasi pengguna atas perluasan akses security-sensitive.

Tes PostgreSQL menjalankan seluruh rantai migration, memeriksa penolakan role admin tanpa persetujuan, ketiadaan akses tabel persetujuan langsung, setup valid/invalid, repeat setup, konflik tanggal, permission admin tanpa penugasan palsu, larangan self approval, penolakan akses fungsi dasar RPC, pencabutan admin dan anon. Seluruh 158 tes, typecheck dan build lulus.

## Aktivasi production — 2 Oktober 2026

Pengguna menyetujui aktivasi admin penuh dan deploy. Migration berhasil dijalankan pada Supabase KPI PPMI Mesir Website. Pemeriksaan SQL dengan konteks UID akun menunjukkan schema_ready=true, full_admin=true, managedScopes=[] dan jumlah periode resmi=0. Ini pemeriksaan database; belum merupakan UAT sesi login browser pengguna.

Deployment dpl_7Ns6X8X3VsSfqCo8ADsLDHaU8A7q berstatus READY, target production, alias https://kpi-ppmi-mesir-preview.vercel.app. Enam probe koneksi dan build Vercel lulus. Admin perlu mengisi organisasi/periode resmi di /portal/pengaturan. Pengujian alur kerja production dengan periode resmi dan akun reviewer terpisah masih perlu dilakukan.
