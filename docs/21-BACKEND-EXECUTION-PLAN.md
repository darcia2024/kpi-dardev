# Rancangan Penyelesaian Backend KPI

Tujuan: menyelesaikan logika yang dapat dibuktikan memakai data sintetis tanpa menunggu data resmi atau layanan cloud milik KPI. Setiap paket baru dianggap selesai hanya jika persistence, validasi izin, alur gagal, dan tesnya tersedia.

## Urutan kerja

| Paket | Lingkup | Bukti penerimaan | Ketergantungan |
|---:|---|---|---|
| 1 | Persistence dan audit lokal | Record tahan restart, perubahan bersamaan ditolak, audit tidak menyimpan secret | Selesai untuk aset, tugas, keuangan, handover, AI; CMS/aspirasi/rapat/evaluasi sedang dikerjakan |
| 2 | CMS, aspirasi, rapat, evaluasi, knowledge | Aktif: state dan idempotensi tahan restart; sumber/bukti dicek saat aksi. Workflow lengkap masih diteruskan di paket 4 | Paket 1 |
| 3 | Authorization per objek | Aktif: scope organisasi/periode/divisi/objek, expiry, dan pencabutan dibaca dari assignment persisten local TEST. Membership jabatan serta RLS diteruskan di paket 7 | Paket 1–2 |
| 4 | Workflow lengkap | Aktif: dependency tugas, peserta voting, revisi notulen, ledger keuangan, serta riwayat koreksi dan sanggah evaluasi. Quorum, keputusan lengkap, dan formula resmi diteruskan | Paket 2–3; keputusan KPI hanya mengisi policy, bukan struktur mesin |
| 5 | File, notifikasi, audit bisnis | Aktif: audit bisnis pada workflow utama dan antrean persisten dengan retry, masa klaim, serta token worker. Storage bytes, scanner nyata, transaksi audit atomik, dan provider pengiriman belum | Paket 2–4 |
| 6 | UI ke API dan tes HTTP | Koneksi pada modul portal utama sudah terpasang; tes terautentikasi lintas role, aksi, dan reload masih berlangsung | Paket 2–5 |
| 7 | PostgreSQL/RLS/staging | Migration, RLS, smoke test, backup/restore, UAT | Infrastruktur dan keputusan KPI |

## Batas yang tidak ditebak

Formula KPI, bobot, mata uang, quorum, SLA, retensi, akun resmi, dan provider AI tidak akan diisi dengan angka atau aturan fiktif. Mesin policy dibangun generik; konfigurasi resminya menunggu keputusan KPI.

## Status pelaporan

Progress dilaporkan per paket dengan bukti test. Dokumen [20-BACKEND-COMPLETION.md](20-BACKEND-COMPLETION.md) adalah daftar kerja hidup, sedangkan dokumen ini adalah urutan eksekusi.
