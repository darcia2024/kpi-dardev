# Implementasi internal Fase 4–5 · 23 September 2026

Status: irisan layanan dan konten pada backend lokal TEST. Fase 4–5 belum memenuhi seluruh kriteria dari rencana 98 layar; item yang bergantung pada provider, kebijakan, atau storage tetap ditunda.

## Fase 4 · Layanan dan komunikasi

- `/portal/kasus` menyediakan pencarian dan filter kasus, uraian dan riwayat per kasus, serta tindakan triage → mulai penanganan → pembaruan → tutup → buka kembali. Semua tindakan menulis status dan audit lokal. Setiap tindakan menyimpan pembaruan untuk pelapor terpisah dari catatan internal petugas.
- Endpoint `/api/v1/cases/detail` mengembalikan uraian dan kedua jenis riwayat hanya untuk petugas dengan izin triage. Tracking publik tetap hanya mengembalikan status serta pembaruan publik terbaru. Endpoint `/api/v1/cases/action` memvalidasi transisi dan pemilik kasus.
- Monitor notifikasi menampilkan antrean dan jumlah percobaan TEST. Tidak ada klaim pesan terkirim lewat provider. N01–N03 (inbox penerima, preferensi, template) dan S05–S07 (pengumuman, komunikasi terarah, form berversi) menunggu rancangan resmi. Urgensi, SLA, delegasi, dan arsip kasus belum tersedia.

## Fase 5 · Redaksi dan knowledge

- `/portal/editor` memiliki pencarian/filter status, revisi judul dan ringkasan draf dengan `expectedVersion`, pratinjau internal, alasan wajib saat meminta revisi atau arsip, dan histori transisi per naskah. Alur approval tetap mensyaratkan reviewer terpisah; hanya status `PUBLISHED` masuk daftar publik.
- `/portal/knowledge` menjadi halaman tersendiri dalam navigasi Konten. Daftar rujukan mengikuti izin sumber, menampilkan ringkasan dan versi sumber yang tercatat, serta histori pembuatan/publikasi metadata. Pencabutan akses sumber menghilangkan rujukan dari daftar yang berizin.
- CMS masih menyimpan ringkasan, belum badan artikel panjang, kalender editorial, aset media, atau preview halaman penuh. Knowledge masih metadata rujukan TEST, belum SOP lengkap maupun workflow reviewer resmi. Publikasi metadata knowledge di TEST tidak boleh dianggap persetujuan substansi KPI.

## Verifikasi

`npm run verify` memeriksa typecheck, tes unit/integrasi, dan build. Tes baru mencakup pemisahan riwayat internal/publik serta transisi kasus, revisi draf dengan penolakan versi lama, dan alasan permintaan perubahan. Pemeriksaan browser lokal dan batas yang belum teruji dicatat pada laporan akhir task.
