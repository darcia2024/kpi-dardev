# Kelompok 2 — perluasan fitur hosted

Tanggal: 3 Oktober 2026. Target: Supabase `gtjzlkmwafyttevertho` dan alias Vercel `kpi-ppmi-mesir-preview.vercel.app`.

## Delapan area pembangunan

| Area | Implementasi | Batas aktivasi |
|---|---|---|
| Tugas | Delegasi ke pengurus yang sudah berizin, subtugas, dependensi tanpa siklus, tenggat, template dari tugas yang terbaca, diskusi | Periode aktif dan keputusan akses; subtugas rahasia memerlukan proses izin objek terpisah |
| Rapat | Lampiran berkas tersimpan, daftar tindak lanjut, tombol membuat tugas dari notulen final, idempotensi | Notulen harus disetujui independen; tugas rahasia memerlukan izin objek terpisah |
| Dokumen | DOCX/XLSX/PPTX selain PDF/gambar/TXT, versi immutable, riwayat versi yang berizin, pemeriksaan ulang, penerima melalui F01/F02 | Pemindai resmi harus disetujui/dikonfigurasi; setiap versi rahasia memerlukan izin sendiri |
| Pengetahuan/editorial | Editor Markdown dengan preview aman, lampiran, pemeriksaan pola data pribadi, metadata kategori, jadwal publikasi, lampiran publik | Pemeriksaan manusia wajib; pola otomatis bukan jaminan bebas PII; klasifikasi terbuka harus disahkan |
| Pengaduan/kasus | Pengaturan sekretaris dan divisi IOD, template maksimal enam pertanyaan dengan persetujuan independen, formulir publik membaca versi aktif, lampiran bukti internal | Periode aktif, mandat, petugas dan izin rahasia. Bukti dilampirkan dari dokumen private; upload anonim belum disediakan |
| Notifikasi | Pengingat tugas/rapat, opt-in email/WhatsApp, antrean dengan lease/retry dan pemeriksaan izin sebelum pengiriman | CRON_SECRET dan adapter pengiriman resmi; pesan eksternal generik tanpa isi kasus |
| Administrasi | Divisi/subbidang, jabatan, penugasan dan pengakhiran, usulan/approval/penolakan/pencabutan mandat | Bootstrap mandat pertama tetap perlu keputusan resmi; admin teknis tidak otomatis mendapat izin bisnis |
| Konten publik | Kategori kabar, kegiatan, struktur dengan metadata resmi, isi lengkap dan lampiran tersahkan, halaman membaca data baru saat request | Konten disiapkan lalu direview, diklasifikasi dan diterbitkan. Tidak menambahkan orang/berita fiktif |

## Migrasi

024 tugas lanjutan; 025 lampiran dan tindak lanjut; 026 versi/Office/rescan; 027 editorial dan publikasi; 028 pengingat dan pengiriman; 029 administrasi; 030 konfigurasi intake dan kesiapan schema. Dipasang sebagai satu transaksi setelah tes isolated PostgreSQL lulus. Tidak mengisi periode aktif, mandat, routing, provider, atau data operasional buatan.

Semua tabel baru memakai RLS dan tidak menerima perubahan langsung dari klien. Mutasi menggunakan RPC dengan pemeriksaan sesi, scope, klasifikasi, versi dan jejak audit. Worker memakai service role hanya untuk fungsi khusus; permission penerima/penerbit diperiksa lagi terhadap keputusan dan penugasan yang berlaku. Tidak mengubah JWT untuk menyamar sebagai pengguna.

## Worker

`GET /api/internal/operations` memerlukan `Authorization: Bearer <CRON_SECRET>`. Vercel cron menjalankan sekali sehari pukul 02:00 UTC (09:00 WIB), sehingga jadwal publikasi diproses pada run berikutnya dan **bukan tepat pada menit yang dipilih**. Endpoint dapat dipanggil scheduler eksternal yang telah disetujui untuk interval lebih sering.

Adapter EMAIL/WHATSAPP memerlukan URL HTTPS, token, serta persetujuan processor terkait dalam database. Payload berisi UUID pengiriman, kanal, alamat penerima yang disetujui, pesan generik dan `/portal/notifikasi`. Adapter wajib menghormati header `Idempotency-Key` dan menjawab `{id: <UUID yang sama>, accepted: true}`. URL relatif portal harus ditautkan ke domain KPI oleh adapter. Tidak ada pengiriman eksternal bila konfigurasi atau persetujuan belum tersedia. Percobaan maksimal lima dengan jeda satu jam; status tetap tersimpan.

## Verifikasi dan yang masih manual

Tes integrasi kelompok 2 menggunakan PostgreSQL terpisah, mencakup penolakan akses, stale version, siklus dependency campuran, approval independen, retry, publikasi/klasifikasi, penahanan bukti, pencabutan izin dan tidak adanya pemberian izin otomatis dari konfigurasi admin. Tes lama tetap dijalankan.

Database production terakhir tidak mempunyai periode yang aktif hari ini maupun mandat resmi. Periode resmi 17 Oktober 2026–17 Oktober 2027 tetap PLANNED. Pengujian browser beberapa peran resmi dan transaksi produksi belum dilakukan; login browser yang tersedia belum memiliki sesi portal. Jangan menganggap tes otomatis sebagai UAT langsung Vercel.

KPI perlu menyediakan mandat, daftar pengurus/jabatan, keputusan akses per objek, keputusan klasifikasi publik, penanggung jawab intake, persetujuan provider/pemrosesan data dan konfigurasi scanner/email/WhatsApp. AI tetap mengikuti integrasi/persetujuan terpisah dari kelompok 1. Pemeriksaan struktur ZIP Office bukan antivirus dan tidak mengaktifkan download sebelum pemindai menyatakan bersih.

## Bukti akhir deployment

- Supabase: transaksi migrasi 024–030 sukses; `kpi_operations_schema_ready()` dan fungsi kelompok 2 terverifikasi tersedia. Periode aktif tetap 0; tidak menambahkan mandat resmi.
- Vercel: `dpl_68BD8t4KBG5VdWmohtFSmqxckX1Z`, production READY; alias `https://kpi-ppmi-mesir-preview.vercel.app`.
- Typecheck dan build lokal/Vercel sukses; 181 tes otomatis lulus.
- Smoke test alias production: lima endpoint internal baru mengembalikan 401 tanpa sesi; template publik mengembalikan 200/null; permintaan berkas publik yang tidak ada mengembalikan 404; scheduler belum dikonfigurasi mengembalikan 503.
- Halaman kabar Vercel diperiksa melalui browser; tidak menampilkan berita buatan atau kesalahan RPC. Tab portal masih halaman masuk, sehingga UAT authenticated beberapa peran belum selesai.
- Snapshot database: `.vercel/group-two-database-proof.png`. Log suite lokal: `.vercel/group-two-tests.log`; keduanya lokal dan tidak disimpan dalam Git.

Perbaikan alur upload: ID berkas baru tetap ditampilkan untuk permohonan F01/F02 ketika isi rahasia belum berizin; tautan membawa ID objek ke formulir akses. Deployment terakhir sudah mencakup perbaikan ini.
