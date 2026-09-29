# Progres pekerjaan tanpa keputusan baru — 24 September 2026

Rujukan: [pemisahan 40 layar](./34-RENCANA-40-LAYAR-DAN-KEPASTIAN.md). Pekerjaan ini berjalan pada akun dan data sintetis lokal. Angka katalog **58 connected / 40 partial** belum diubah: alur lokal yang lulus tes belum membuktikan kesiapan produksi atau penerimaan KPI.

| ID | Hasil yang dapat diuji sekarang | Batas yang masih terbuka |
| --- | --- | --- |
| A07 | Detail akun menampilkan penugasan lintas periode dan audit perubahan penugasan/grant. | Daftar akun resmi belum masuk. |
| A08 | Divisi lokal dapat dibuat, jabatan dikaitkan ke divisi, penugasan terikat periode dan dicegah tumpang tindih. | Struktur serta jabatan resmi belum disahkan; jalur Supabase belum memuat relasi divisi. |
| A09 | Belum diaktifkan. | Banyak endpoint masih mengikat periode contoh; pemilih periode UI tanpa penerapan otorisasi menyeluruh akan menyesatkan. |
| F03 | Versi tersedia tetap berlaku saat versi baru menunggu pemeriksaan; riwayat versi terlihat. | Scanner nyata dan sumber berkas resmi belum ada. |
| F04 | Rute preview/unduh yang sudah ada memeriksa ulang izin, status, cakupan, dan hash byte. | Storage/scanner produksi belum ada. |
| F05 | Grant baru hanya untuk aset berstatus tersedia; penerima dan kedaluwarsa tetap diperiksa saat baca. | Daftar penerima resmi belum ada. |
| K01–K02 | Daftar rujukan disaring dengan izin sumber dan versi sumber; tautan byte hanya tampil jika berkas benar-benar tersimpan. | Isi/SOP dan sitasi halaman memerlukan sumber resmi. |
| K03–K04 | Penulis mengirim draf, akun lain menelaah sebelum terbit, reviewer dapat mengarsipkan dengan alasan. Revisi membuat draf versi baru tanpa mengubah versi yang sudah terbit. Pencabutan izin sumber menyembunyikan rujukan. | Persetujuan kebijakan knowledge dan isi resmi belum selesai. |
| I02 | Endpoint resolusi sitasi memeriksa ulang izin, organisasi, periode, dan versi sumber; tes membuktikan sitasi hilang setelah grant dicabut. AI lokal tetap mengembalikan nol sitasi. | Korpus berizin serta provider AI belum tersedia. |
| S03 | Triase mencatat owner eksplisit, urgensi, alasan internal, aktor, serta pembaruan publik terpisah. | Penugasan petugas dan SLA resmi belum diterima. |
| S05–S06 | Alur pesan internal lama telah diuji: penerima eksplisit, penulis dan reviewer berbeda, inbox hanya penerima. | Target organisasi resmi belum ada. |
| N03 | Template ID/EN tetap berversi; draf perlu telaah akun lain. Status `REVIEWED` tidak mengaktifkan pengiriman. | Teks dan event wajib resmi belum disahkan. |
| B02 | Perhitungan pos terhadap transaksi berbayar dan pembatasan revisi di bawah pengeluaran sudah diuji. | Anggaran dan pos resmi belum diterima. |
| E04 | Input nilai perlu alasan dan bukti ketika bernilai angka; bukti duplikat atau tidak berizin ditolak. | Indikator serta formula resmi belum ada. |
| E08 | Belum dibuat laporan “final”; status peninjauan lokal belum setara penetapan nilai final. | Formula, evaluator, dan mekanisme finalisasi KPI belum disahkan. |
| H06 | Setelah penerus menerima sumber, pemilik lama dapat mengunci arsip lokal. Jejak hash dan audit tersimpan; arsip tidak dapat diterima/diarsipkan ulang. | Retensi/akses arsip produksi belum disahkan. |
| I06 | Konfirmasi usulan lokal memeriksa pemilik, hash versi payload, dan kedaluwarsa; belum mengeksekusi perubahan sistem. | Kebijakan tindakan dan provider AI belum disahkan. |

Validasi: `npm run verify` lulus (95 tes, TypeScript, build). Tes negatif mencakup penulis tidak boleh menyetujui sendiri, sumber tak berizin, penerima grant tak sah, owner handover yang salah, dan template tanpa reviewer terpisah.

Lanjutan implementasi dan batas terbarunya dicatat di [audit kelanjutan 20 layar](./36-AUDIT-KELANJUTAN-20-LAYAR.md).

Pembaruan setelah audit ini: konteks periode terpilih (A09), panel pratinjau laporan evaluasi (E08), dan pemeriksaan ulang tautan sitasi AI (I02) telah dibangun secara lokal. Rincian serta batas produksinya ada di [audit kelanjutan 20 layar](./36-AUDIT-KELANJUTAN-20-LAYAR.md). Tiga belas layar pada kelompok keputusan KPI dan tujuh layar pada kelompok layanan eksternal tetap sesuai [dokumen rencana](./34-RENCANA-40-LAYAR-DAN-KEPASTIAN.md).
