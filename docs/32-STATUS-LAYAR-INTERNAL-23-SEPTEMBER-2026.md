# Status layar internal — 23 September 2026

Katalog aplikasi memuat 98 ID layar. Statusnya menunjukkan kemampuan yang ada di pratinjau lokal, bukan kesiapan produksi. Setelah audit lanjutan: **58 connected, 40 partial, 0 planned**. Dari 54 layar yang parsial saat permintaan terakhir, empat belas sudah memenuhi cakupan pratinjau lokal; 40 sisanya dijabarkan di [dokumen tindak lanjut](./33-SISA-LAYAR-INTERNAL.md). Dari 28 item yang sebelumnya belum dibangun, delapan item telah mendapat alur lokal yang dapat diuji penuh di pratinjau, dan dua puluh item mendapat fondasi parsial:

A04–A05 telah diverifikasi di browser: profil hanya menampilkan identitas sesi sendiri dan pilihan tema bertahan setelah reload. W02 menampilkan tindakan sesuai izin dengan tautan ke tugas spesifik. W04 menautkan hasil pencarian ke tugas, rapat, atau dokumen yang dipilih dari API berizin; halaman tujuan memilih objek tersebut. W05 menghitung ringkasan dari daftar tugas periode yang sama. A13 sekarang menampilkan aktor, aksi, ID objek, hasil, dan waktu; pencarian aktor/objek memfilter seluruh riwayat lokal sebelum membatasi jumlah hasil. M01 menampilkan kalender bulanan dengan tanggal menurut zona waktu Kairo, navigasi bulan, dan tautan ke rapat pada tanggal tersebut. Ketujuh ID ini berpindah dari partial ke connected untuk cakupan pratinjau lokal.

A06 memuat akun hanya untuk organisasi yang diminta; organisasi lain tidak memperoleh identitas pratinjau. T08 memungkinkan pembuat tugas mendelegasikan tugas aktif dengan alasan dan jejak pemilik lama; pemilik lama tidak dapat lagi mengajukan pekerjaan. M03 memungkinkan pembuatan undangan beragenda dan peserta, lalu peserta dapat mengubah RSVP hingga waktu mulai. Tiga ID ini juga berpindah ke connected untuk pratinjau lokal.

A10 menyediakan pemeriksaan izin efektif menurut akun, aksi, organisasi, periode, divisi, dan objek sebelum grant pratinjau dibuat. Pemeriksaan memperhitungkan grant yang dicabut atau kedaluwarsa.

C02 kini menyimpan isi artikel panjang per bahasa dan menolak pengajuan review jika isi belum lengkap. C06 menyediakan pratinjau privat pada editor serta perpindahan antara varian ID/EN dengan slug sama; draf tidak masuk katalog publik. C07 menyimpan snapshot isi untuk tiap versi baru, menampilkannya di editor, dan mempertahankan riwayat setelah arsip. Rekam lama yang dibuat sebelum perubahan ini hanya memiliki snapshot keadaan terakhirnya.

| ID | Hasil yang tersedia |
| --- | --- |
| W03 | Linimasa kerja dari audit tersimpan, dibatasi ke tugas dan rapat yang dapat dibaca akun. |
| T07 | Perpanjangan tenggat oleh pembuat tugas, harus lebih lambat dan menyimpan alasan audit. |
| T09 | Template tugas berversi; tugas turunan menyimpan ID dan versi template saat dibuat. |
| T10 | Jumlah dan filter tugas lewat tenggat dari timestamp yang sama; tugas selesai tidak dihitung. |
| T11 | Pembatalan/arsip berdasarkan status, alasan wajib, dan mutasi lanjutan ditolak. |
| M07 | Rapat dengan notulen final dapat diarsipkan dengan alasan; arsip dapat dicari dan tidak dapat direvisi, dipilih, atau menghasilkan tindak lanjut baru. |
| H05 | Checklist operasi memiliki pemilik dan tenggat; pemilik menyelesaikan item dengan catatan audit. |
| N01 | Kotak masuk memfilter penerima pada akun sesi dan periode; status baca tersimpan per akun. |

B01–B02 kini dapat menyimpan rancangan anggaran, menambah serta merevisi pos dengan nomor versi, dan meminta persetujuan aktor berbeda. Pos yang disetujui dapat dikaitkan ke transaksi; nominal dibayar atau direkonsiliasi masuk ke perhitungan pemakaian, dan pembayaran ditolak bila melampaui sisa pos. Revisi tidak dapat disetujui bila menurunkan alokasi di bawah pemakaian. Statusnya tetap **partial** karena anggaran dan mata uang resmi belum tersedia, dan saldo bank tidak terhubung.

A07–A09 kini menampilkan akun dalam cakupan KPI, periode beserta statusnya, dan hubungan jabatan–penugasan. Admin dapat membuat periode dan jabatan pratinjau, memberi/mengakhiri penugasan, serta memindahkan status periode melalui alur yang mencegah dua periode aktif. Semua perubahan tersimpan dan diaudit di lingkungan lokal. Statusnya **partial** karena akun produksi, struktur divisi resmi, dan pemilihan periode oleh seluruh modul belum terhubung; satu periode contoh tetap tersedia untuk autentikasi pratinjau.

N01 kini memiliki kotak masuk pribadi yang mengambil penugasan tersimpan dari akun lain dalam periode yang sama. Penerima dipilih dari `ownerAccountId`, API memfilter ulang berdasarkan akun sesi, dan tanda baca tersimpan per akun. Pengaturan lokal N02–N03 dijelaskan di bawah; pengiriman eksternal tetap menunggu kanal resmi.

## Fondasi parsial terbaru

| ID | Hasil dan batasnya |
| --- | --- |
| F04–F06 | Byte file tersimpan privat di lingkungan lokal; akses byte memeriksa sesi, scope, penerima, status scanner, hash, dan masa berlaku. Grant, revoke, arsip, serta audit tersedia. Preview/unduh tetap terkunci hingga scanner sungguhan dan kebijakan retensi aktif. |
| C05 | Media dapat dikaitkan ke versi draf hanya jika gambar berizin telah lulus pemeriksaan. Belum ada jalur scanner sehingga belum ada gambar baru yang layak dipakai. |
| N02 | Preferensi pemberitahuan pilihan tersimpan per akun. Pemberitahuan wajib tidak dipengaruhi preferensi ini. Kanal eksternal belum ditentukan. |
| N03 | Pengelola dapat membuat draf template berbahasa ID/EN dengan nomor versi. Draf tidak dipakai untuk mengirim pesan sebelum isi dan alur persetujuan resmi tersedia. |
| A14 | Legal hold lokal dapat dipasang dan dilepas dengan alasan serta audit; arsip dokumen ditolak saat hold aktif. Jadwal retensi dan kewenangan resminya belum disetujui. |
| A15 | Snapshot SQLite dan file privat dibuat di folder aplikasi lokal di luar proyek; uji pemulihan membuka salinan di lokasi terpisah, memeriksa integritas database dan hash file. Backup produksi dan staging belum tersedia. |
| S05–S06 | Pengumuman dan pesan terarah memakai penerima eksplisit, draf, persetujuan akun lain, lalu masuk hanya ke kotak akun penerima. Kanal eksternal dan kewenangan persetujuan resmi belum ditetapkan. |
| S07 | Form layanan sebagai draf berversi dengan skema kolom dan validasi consent; jawaban pratinjau tidak disimpan. Form publik menunggu teks consent serta jenis layanan resmi. |
| H04 | Preflight menampilkan akses penerus dan pemilik lama ke setiap sumber serta langkah yang perlu disetujui. Tidak ada grant yang dipindah atau dicabut otomatis. |
| I03 | Riwayat dan feedback pertanyaan tersedia hanya selama halaman AI terbuka. Isi pertanyaan, jawaban, dan catatan koreksi tidak disimpan ke database sebelum kebijakan retensi disahkan. Pengguna dapat mengubah feedback, mengoreksi catatan, atau menghapus entri sesi. |
| I04 | Kandidat provider/model, wilayah proses, serta versi prompt dapat disimpan sebagai draf berversi dan diajukan untuk review oleh penulisnya. Tidak ada kredensial atau jalur aktivasi provider. |
| I05 | Usulan kelas data, wilayah proses, retensi, dan tinjauan manusia dapat disimpan sebagai draf berversi. Draf yang lengkap bisa diajukan untuk review, tetapi tidak berlaku sebagai kebijakan aktif. Gerbang aktivasi tetap tertutup. |

## Keputusan yang masih diperlukan

| Area | ID | Ketergantungan utama |
| --- | --- | --- |
| AI | I03, I04, I05 | Kebijakan retensi, provider/model, wilayah pemrosesan, kelas data, dan approval resmi untuk membuat alur parsial ini operasional. |

Tidak ada nilai anggaran, kebijakan retensi, penerima notifikasi, atau provider AI yang dibuat-buat untuk menurunkan angka planned. Status **0 planned berarti setiap layar punya fondasi**, bukan semua fitur selesai atau siap produksi. Semua alur baru di atas tetap memakai autentikasi dan penyimpanan **lokal pratinjau**. Produksi memerlukan migrasi ke layanan identitas, database, storage, dan approval yang disetujui KPI.
