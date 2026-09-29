# Implementasi internal Fase 2–3 · 23 September 2026

Status: irisan vertikal TEST yang tersedia sudah dihubungkan; kedua fase **belum dapat dinyatakan selesai penuh** menurut kriteria 98 layar karena beberapa kontrak produk dan infrastruktur belum ada. Data di bawah sintetis, bukan data resmi KPI.

## Fase 2 · Pekerjaan harian

- `/portal/workspace` kini membaca tugas, rapat, dan metadata dokumen untuk akun aktif: pekerjaan pribadi, antrean review sesuai izin, prasyarat yang belum diterima, rapat mendatang, pencarian sederhana lintas tiga objek berizin, dan sebaran tugas aktif. Metrik dihitung dari daftar API yang sama dengan halaman detail.
- `/portal/tugas` mendukung pencarian, filter, pembuatan dengan satu prasyarat, detail prasyarat beserta statusnya, bukti tersedia, submit, keputusan reviewer dengan alasan wajib saat mengembalikan, serta riwayat tindakan per tugas. API menolak dependency lintas periode. Semua perubahan tersimpan di backend lokal TEST.
- W01 dan T01–T06 tercakup pada alur yang tersedia. W02/W04/W05 dan T08 masih sebagian: hasil pencarian membuka halaman induk, belum item spesifik; sebaran tugas belum mengukur kapasitas resmi. W03 dan T07/T09–T11 belum memenuhi acceptance: linimasa lintas objek, tenggat/overdue, delegasi, template, dan arsip butuh kontrak data serta kebijakan tambahan. Tidak ada metrik overdue palsu.

## Fase 3 · Dokumen dan rapat

- `/portal/dokumen` menampilkan versi berdasarkan `documentKey`, klasifikasi, status, dan riwayat pendaftaran yang berizin. Registrasi metadata dapat dipilih sebagai dokumen baru atau versi berikutnya. Byte file tetap berada di perangkat pengguna; tidak ada unggah, download, preview, scan, atau tautan berbagi yang disimulasikan sebagai aktif.
- `/portal/rapat` menampilkan agenda kronologis dalam waktu Kairo, notulen draf/final, pilihan voting sendiri yang terbaca lagi setelah reload, riwayat tindakan, dan tugas tindak lanjut yang terhubung ke keputusan.
- F01 terhubung. F02–F03 dan M01/M03 sebagian. F04–F06 dan M07 menunggu storage privat, scanner, kebijakan akses/retensi, arsip, serta rancangan kalender/RSVP. M02/M04–M06 menggunakan backend TEST. Quorum dan hasil voting agregat belum ditampilkan sebagai keputusan resmi.

## Pemeriksaan

`npm run verify` lulus: typecheck, 52 tes, build. Tes baru memeriksa alasan pengembalian tugas, penolakan dependency lintas periode, dan pembacaan ulang pilihan voting peserta. Browser lokal diperiksa pada `/portal/tugas`, `/portal/rapat`, dan `/portal/dokumen` sebagai admin TEST. Workspace admin menunjukkan akses ditolak sesuai grant; tampilan workspace pengurus perlu pengujian UAT per role pada Fase 8.
