# Arah Visual E01

Status: berlaku untuk shell aplikasi tahap fondasi.

Design read: portal institusional untuk pengurus dan publik KPI PPMI Mesir, dengan bahasa visual hangat dan tertib, dial ENERGY 1 / RHYTHM 2 / MOTION 1.

| Keputusan | Alasan |
|---|---|
| Krem hangat sebagai canvas, putih sebagai permukaan kerja, dan merah KPI sebagai aksen | Membuat halaman kerja terasa tenang dan menjaga aksi penting tetap terlihat tanpa menjadikan seluruh antarmuka merah |
| Sora sebagai font utama dengan fallback sistem | Mengikuti `styles.css` blueprint dan menjaga teks administratif tetap mudah dibaca di perangkat yang belum memiliki Sora |
| Header ringkas dan dua tujuan nyata: beranda serta portal | Hanya rute yang sudah ada ditampilkan. Tidak ada navigasi ke modul yang belum dibangun |
| Kartu hanya untuk status atau batas konteks | Permukaan solid memisahkan informasi tahap fondasi tanpa membuat setiap blok terlihat melayang |
| Tanpa foto, avatar, statistik, grafik, atau ilustrasi | Aset dan data resmi belum diserahkan KPI. Status kosong lebih jujur daripada data yang dibuat-buat |
| Tema terang dan gelap dengan toggle | Preferensi tampilan sudah menjadi bagian dari blueprint P15 dan dapat dipakai tanpa mengubah data pengguna |
| Tidak ada animasi dekoratif | Motion hanya dipakai untuk transisi tema dan menghormati reduced motion |

Komponen wajib menyediakan state loading, kosong, dan error saat kelak menampilkan data. Shell E01 memakai state kosong yang menjelaskan bahwa autentikasi dan workspace belum diaktifkan.
