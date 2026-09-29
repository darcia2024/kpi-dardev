# Penyelesaian backend

Status: dalam pengerjaan. Klaim 10/10 lama telah ditarik; keberadaan endpoint dan test sederhana tidak sama dengan workflow selesai.

## Bukti perbaikan saat ini

- SQLite local TEST tersedia dengan transaksi tulis, nomor revisi dan pemeriksaan stale write. Perubahan record serta jejak revisi disimpan dalam satu transaksi.
- Registry metadata aset, tugas, transaksi keuangan TEST, paket penerimaan handover, konfirmasi preview AI, CMS, aspirasi, rapat, evaluasi, dan knowledge memakai penyimpanan tersebut. Factory dibatasi pada environment local TEST. Constructor tanpa database tetap dipakai untuk unit test terisolasi.
- Tugas dan pengajuan keuangan memeriksa bukti tersedia, scope organisasi/periode, serta akses aktor; acceptance handover memeriksa akses penerus ke setiap sumber. Approval tugas/keuangan memeriksa akses reviewer ke bukti.
- Sitasi preview AI memeriksa akses aset setiap permintaan. Konfirmasi preview terikat akun pembuat, versi, expiry, dan tidak dapat diulang. Belum ada eksekusi AI atau provider eksternal.
- Assignment permission local TEST kini persisten. Grant dapat dibatasi organisasi, periode, divisi, atau objek; memiliki expiry; serta dapat dinonaktifkan tanpa perubahan source. Seed grant bawaan memiliki ID stabil supaya pencabutan bertahan saat repository dibuka ulang; seed acak lama yang terduplikasi dinonaktifkan pada pembacaan berikutnya. Endpoint admin TEST tersedia untuk membaca, membuat, dan menonaktifkan grant.
- Konten menaikkan versi pada setiap transisi. Evaluasi dan knowledge menolak bukti/sumber yang tidak tersedia bagi aktor pada scope yang sama.
- CMS menolak slug ganda di locale dan scope yang sama. Notulen hanya dapat direvisi selama masih draf; setiap revisi menaikkan nomor versi dan finalisasi menutup perubahan berikutnya. Vote menolak akun yang tidak terdaftar sebagai peserta rapat.
- Endpoint tracking aspirasi memvalidasi format token yang sama dengan token persisten. Daftar knowledge menyaring artikel saat sumbernya tidak lagi dapat diakses sehingga judulnya tidak bocor.
- Tugas dapat memiliki dependency. Tugas hanya dapat diajukan setelah semua dependency berstatus diterima. Ledger keuangan lokal mencatat submit, approval/rejection, pembayaran, dan rekonsiliasi beserta aktornya; requester tidak dapat menandai pembayaran sendiri.
- Setiap peninjauan atau koreksi evaluasi menghasilkan revisi tersendiri yang menyimpan nilai, bukti, aktor, alasan, dan waktu. Subjek dapat mengirim satu sanggah terbuka; reviewer yang berbeda dapat menyelesaikannya, dengan atau tanpa koreksi yang ditautkan ke revisi baru.
- Audit bisnis local TEST kini mencatat aksi evaluasi, tugas, keuangan, rapat, handover, CMS, knowledge, aset, AI, aspirasi, dan perubahan grant izin beserta aktor bila tersedia, hasil, serta perubahan status yang ringkas. Metadata audit menyaring kunci sensitif juga pada objek bersarang; isi aspirasi, pertanyaan AI, dan konten berkas tidak disalin. Antrean notifikasi aspirasi bersifat persisten: worker dapat mengklaim satu item, mengembalikannya ke antrean dengan exponential backoff bila gagal, atau mengambil ulang klaim kedaluwarsa. Token klaim mencegah hasil worker lama diterima dan tidak keluar dari API daftar notifikasi. Provider pengiriman belum dipasang.
- Pengujian: record tahan tutup/buka database, seed tidak menimpa perubahan, stale write ditolak tanpa audit ganda, bukti tidak sah ditolak, sitasi tersembunyi setelah revoke, pemilik/expiry/replay konfirmasi diperiksa, serta CMS/aspirasi/rapat tetap utuh setelah database dibuka ulang.

Jejak revisi database saat ini hanya mencatat namespace, ID, revisi dan waktu. Audit bisnis dan perubahan record masih disimpan dalam transaksi terpisah; integrasi transaksi atomik, before/after terperinci, dan provider notifikasi masih harus dibangun. Penyimpanan SQLite adalah sarana TEST lokal, bukan validasi RLS PostgreSQL.

## Pekerjaan yang masih harus diselesaikan

| Paket | Kondisi |
|---|---|
| Persistence seluruh modul, transaksi lintas modul, idempotensi | Sebagian besar workflow TEST persisten; sesi, membership, audit bisnis, transaksi lintas modul, dan unique constraint database production masih memerlukan integrasi |
| Identitas, membership dan permission per objek | Sebagian; assignment TEST persisten dengan scope/expiry/disable tersedia. Membership jabatan resmi, approval grant, RLS, dan policy produksi belum |
| File nyata, scan dan kontrol akses sumber | Metadata dan evidence check tersedia; bytes/storage/scanner belum |
| Workspace, tugas, rapat dan voting | Dependency tugas, peserta voting, dan revisi notulen tersedia; quorum, policy voting, dan keputusan lengkap belum |
| Keuangan dan evaluasi | Ledger event transaksi serta riwayat koreksi/sanggah evaluasi tersedia; budget dan formula resmi belum |
| Knowledge, handover dan notifikasi | Sumber/penerimaan dasar; revisi, transfer akses dan worker pengiriman belum |
| AI | Preview lokal; retrieval isi sumber, audit bisnis dan eksekusi tindakan belum |
| UI–API dan pengujian alur utuh | Banyak UI masih simulasi; perlu integrasi dan tes HTTP/browser |

Data resmi, provider, hosting, kebijakan dan persetujuan KPI tetap ditunda. Implementasi mesin aturan yang dapat dikonfigurasi dan pengujian sintetis tidak perlu menunggu data resmi.
