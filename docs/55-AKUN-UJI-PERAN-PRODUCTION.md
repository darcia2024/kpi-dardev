# Akun uji peran di production

Tanggal: 26 Oktober 2026. Panduan ini menyiapkan akun untuk mengecek setiap peran di https://kpi-ppmi-mesir-preview.vercel.app. Akun dibuat oleh admin KPI di Supabase; pengembang tidak memegang kata sandi siapa pun.

## Kenapa tidak bisa langsung dibuat

1. **Periode belum aktif.** Periode 2026_2027 tercatat PLANNED. Tidak ada RPC atau halaman portal yang mengubahnya menjadi ACTIVE; statusnya tidak berubah sendiri saat 17 Oktober lewat. Selama PLANNED, admin pun tidak mendapat izin operasional.
2. **Belum ada mandat.** Izin modul hanya bisa diberikan lewat keputusan F01 oleh pejabat yang punya mandat tercatat. Mandat pertama tidak bisa dibuat dari portal karena persetujuan mandat di portal membutuhkan mandat yang sudah ada.
3. **SOP v1.1 melarang jalan pintas.** Admin teknis tidak otomatis membaca data bisnis, dan izin tanpa keputusan F01 yang sah tidak berlaku.

Tiga skrip di `supabase/manual/uji-peran-*.sql` menutup ketiga hal di atas. Skrip berhenti dengan pesan jelas kalau nilai wajib belum diisi, dan aman dijalankan ulang. Seluruh alurnya diuji di `tests/role-uat-scripts.test.ts`.

## Yang perlu disiapkan KPI

- Keputusan resmi pengaktifan periode 2026–2027 (nomor/rujukan).
- Keputusan mandat pejabat pemberi keputusan akses (nomor/rujukan).
- Daftar orang yang ikut uji: email, nama resmi, jabatan, dan peran yang diuji. Gunakan pengurus sungguhan; jangan membuat orang atau jabatan rekaan.

## Langkah

| No | Siapa | Di mana | Apa |
| --- | --- | --- | --- |
| 1 | Owner database | Supabase SQL Editor | Isi `decision_reference`, jalankan `uji-peran-1-aktifkan-periode.sql`. Hasil akhir harus menampilkan status ACTIVE. |
| 2 | Admin KPI | Supabase Dashboard › Authentication › Users | Undang tiap penguji (Invite user). Mereka membuat sandi sendiri dari email undangan. |
| 3 | Owner database | Supabase SQL Editor | Setelah email terverifikasi, isi `daftar` lalu jalankan `uji-peran-2-aktifkan-akun.sql`. |
| 4 | Admin sistem | `/portal/pengaturan` | Buat divisi dan jabatan, lalu tugaskan tiap akun ke jabatannya pada periode 2026_2027 dengan rujukan keputusan. |
| 5 | Owner database | Supabase SQL Editor | Isi `pejabat_email` dan `mandate_reference`, jalankan `uji-peran-3-mandat-awal.sql`. |
| 6 | Tiap penguji | `/portal/kebijakan` | Ajukan F01 (permohonan akses) sesuai peran pada tabel di bawah. |
| 7 | Pejabat | `/portal/kebijakan` | Putuskan setiap F01: setujui, setujui sebagian, atau tolak. |
| 8 | Admin sistem | `/portal/kebijakan` | Laksanakan F01 yang disetujui. Izin berlaku pada permintaan berikutnya. |

Tidak perlu deploy ulang untuk langkah ini. Patch keamanan Next.js (dokumen 54) tetap perlu dideploy secara terpisah.

## Usulan peran untuk uji

Tabel ini usulan pengembang untuk keperluan uji, bukan matriks jabatan resmi. KPI menyesuaikannya sebelum langkah 6. Setiap izin di bawah sudah termasuk dalam mandat awal pada skrip 3.

| Akun uji | Izin yang diajukan lewat F01 | Yang dicek |
| --- | --- | --- |
| Admin sistem (sudah ada, `kpippmimesirofficial@gmail.com`) | Tidak ada izin bisnis | Bisa mengatur jabatan dan melaksanakan F01. Tidak bisa membuka isi kasus, keuangan, atau penilaian. |
| Pejabat pemberi keputusan | Tidak ada; memakai mandat dari skrip 3 | Bisa memutuskan F01 orang lain, tidak bisa memutuskan F01 miliknya sendiri. |
| Pengurus pelaksana | WORKSPACE_READ, NOTIFICATION_READ, TASK_READ, TASK_SUBMIT, MEETING_READ, KNOWLEDGE_READ | Melihat dan mengajukan tugas sendiri. Tidak bisa membuat tugas atau me-review. |
| Koordinator | Izin pengurus + TASK_CREATE, TASK_REVIEW, MEETING_MANAGE | Membuat tugas, me-review tugas orang lain, mengelola rapat. Tidak bisa me-review tugas buatannya sendiri. |
| Bendahara | FINANCE_READ, FINANCE_MANAGE, ASSET_READ, ASSET_UPLOAD | Membuat anggaran dan transaksi. |
| Pemeriksa keuangan | FINANCE_READ, FINANCE_MANAGE, ASSET_READ | Memeriksa bukti transaksi buatan bendahara. |
| Penyetuju keuangan | FINANCE_READ, FINANCE_APPROVE_FINAL, ASSET_READ | Menyetujui akhir dan merekonsiliasi; harus orang ketiga. |
| Editor | CONTENT_DRAFT_WRITE, ASSET_UPLOAD | Menulis naskah. Naskah tidak tampil di situs sebelum disetujui. |
| Penyetuju konten | CONTENT_REVIEW, CONTENT_PUBLISH | Meninjau dan menerbitkan naskah editor. |

Satu orang boleh menguji lebih dari satu peran asalkan izinnya diajukan terpisah, tetapi pemisahan wewenang hanya bisa dicek dengan orang yang berbeda. Minimal untuk alur keuangan lengkap: tiga orang.

Peran kasus (CASE_READ, CASE_MANAGE, CASE_REVIEW, ASPIRATION_TRIAGE) sengaja tidak masuk tabel. Uji kasus memerlukan pengaturan penerimaan pengaduan dan izin RAHASIA per kasus; jalankan setelah peran dasar di atas lulus.

## Batas yang akan terlihat saat uji

- **Keuangan dan evaluasi berhenti di draf.** Pengajuan transaksi dan penilaian wajib melampirkan berkas bukti yang sudah lolos pemindaian. Pemindai belum dikonfigurasi, jadi berkas tetap karantina dan pengajuan ditolak. Anggaran (tanpa bukti berkas) tetap bisa diajukan dan disetujui.
- **Tidak ada email atau WhatsApp.** Notifikasi hanya muncul di kotak masuk portal.
- **Asisten AI tidak aktif** karena penyedia belum dipilih.
- **Login dua langkah dan reset sandi** di production belum pernah diuji; catat hasilnya.

## Menghentikan uji

Cabut izin lewat F01 jenis pencabutan, atau akhiri penugasan di `/portal/pengaturan`. Untuk akun yang tidak dipakai lagi, nonaktifkan lewat alur F05. Jangan menghapus baris database secara langsung karena jejak audit akan rusak.
