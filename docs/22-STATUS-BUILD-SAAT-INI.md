# Status build KPI saat ini

**Posisi per 23 September 2026: Paket 6 (UI ke API) sudah terpasang pada modul portal utama, tetapi pengujian alur browser terautentikasi belum lengkap. Ini bukan ukuran kesiapan rilis.** Produk masih prototipe lokal dengan data sintetis TEST.

## Yang sudah ada dan bisa dilihat

| Area | Kondisi nyata |
|---|---|
| Situs publik | Landing page dan halaman informasi publik, kegiatan, aspirasi, divisi, serta publikasi sudah memiliki UI. Konten publikasi TEST dapat membaca record berstatus `PUBLISHED`. |
| Portal internal | Halaman kasus, tugas, rapat, dokumen, keuangan, evaluasi/knowledge, handover, editor, dan izin kini membaca API lokal. Aksi yang tersedia dikirim ke endpoint dan daftar dimuat ulang setelah perubahan. Layar tetap menampilkan kondisi kosong, gagal, dan akses sesuai izin. |
| Rancangan layar internal | Fase 0 selesai untuk registry 98 ID; fondasi shell Fase 1 terpasang. Audit awal: 35 ID terhubung ke API TEST, 22 sebagian tersedia, 41 belum dibangun. Ini belum berarti 35 alur lolos UAT; detail ada di `24-IMPLEMENTASI-FASE-0-1-INTERNAL.md`. |
| Login dan izin TEST | Login, MFA dan sesi lokal tersedia. Grant izin per aksi/scope disimpan di SQLite lokal; seed grant stabil dan pencabutan bertahan saat repository dibuka ulang. Ini belum identitas atau kebijakan produksi KPI. |
| Backend workflow TEST | Endpoint dan penyimpanan SQLite lokal tersedia untuk CMS, aspirasi, metadata aset, tugas, rapat, keuangan, evaluasi, knowledge, handover, dan preview AI. Validasi bukti, beberapa pemisahan reviewer, riwayat perubahan, serta audit bisnis sudah ada. |
| Verifikasi kode | 47 test lulus, TypeScript lulus, dan `next build` lulus setelah penyambungan UI. HTTP GET sepuluh endpoint memakai admin TEST menghasilkan 200; pengurus TEST ditolak 403 pada kasus dan manajemen izin sesuai grant. Browser memuat data dokumen dan tugas setelah login TEST. Mutasi UI lintas modul masih perlu smoke test. |

## Yang belum bisa dianggap siap operasional

1. **Integrasi UI belum lolos uji menyeluruh.** Modul portal utama sekarang memakai API, namun matriks semua role, state, tindakan, reload, dan kegagalan jaringan belum selesai. Katalog 113 layar adalah cakupan rancangan, bukan 113 alur operasional yang telah teruji.
2. **File belum benar-benar diunggah.** Browser hanya mendaftarkan metadata; byte file tidak disimpan. UI tidak lagi memanggil scan simulasi dan endpoint scan menolak permintaan hingga scanner tersedia. Seed aset TEST berstatus `AVAILABLE` tetap data sintetis, bukan bukti adanya berkas nyata.
3. **Notifikasi belum dikirim.** Antrean, retry, masa klaim, dan perlindungan terhadap worker lama tersedia; belum ada worker/provider pengiriman.
4. **Audit lintas modul belum atomik.** Perubahan record dan audit bisnis memakai write terpisah, sehingga perlu penyatuan transaksi dan tes kegagalan di tengah alur.
5. **Database dan izin produksi belum terbukti.** Migrasi PostgreSQL/RLS belum diuji pada environment KPI. Sesi, membership resmi, backup/restore, observability, dan UAT juga belum selesai.
6. **Aturan resmi menunggu KPI.** Formula evaluasi, quorum voting, aturan keuangan, SLA, retensi, data resmi, dan provider AI tidak boleh diisi dengan tebakan.

## Urutan kerja berikutnya

1. Jalankan smoke test HTTP dan browser terautentikasi untuk setiap role dan modul yang baru tersambung; perbaiki kegagalan yang ditemukan.
2. Selesaikan fondasi Paket 5: satukan write record dan audit bisnis; uji retry notifikasi setelah restart. Bangun unggah byte, storage privat, dan scanner sebelum mengaktifkan bukti file nyata.
3. Hitung cakupan fitur dari matriks penerimaan setelah alur UI dan API lolos, bukan dari jumlah halaman atau endpoint.
4. Kerjakan Paket 7 setelah environment dan keputusan KPI tersedia: PostgreSQL, RLS, storage privat, backup/restore, staging, serta UAT.

Rincian teknis yang terus diperbarui ada di [20-BACKEND-COMPLETION.md](20-BACKEND-COMPLETION.md) dan urutan paket ada di [21-BACKEND-EXECUTION-PLAN.md](21-BACKEND-EXECUTION-PLAN.md). Tracker lama [18-PROGRESS-TRACKER.md](18-PROGRESS-TRACKER.md) adalah catatan implementasi awal dan tidak dipakai sebagai persentase kesiapan.
