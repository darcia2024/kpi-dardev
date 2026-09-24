# Implementasi internal Fase 6–7 · 23 September 2026

Status: irisan operasional backend lokal TEST. Fase 6–7 belum memenuhi semua kriteria 98 layar dan tidak menggunakan anggaran, formula, atau kebijakan KPI resmi.

## Fase 6 · Keuangan dan evaluasi

- `/portal/keuangan` kini dapat membuat draf transaksi TEST melalui API persisten, mencari/filter status, lalu mengajukan dengan bukti yang tersedia. Pemohon tidak dapat menyetujui transaksi sendiri. Penolakan mewajibkan alasan yang tercatat di event dan audit. Penandaan bayar dan rekonsiliasi adalah catatan TEST, bukan pembayaran bank.
- `/portal/evaluasi` menampilkan ringkasan jumlah indikator, nilai kosong, tinjauan, dan sanggah, beserta pencarian/filter. Nilai `null` tetap berbeda dari `0`; revisi dan sanggah tersimpan pada backend TEST.
- B01–B02 dan bagian resmi B03/B07–B09 menunggu anggaran, pos, mata uang, bukti pembayaran, dan aturan rekonsiliasi. E02/E06/E08 menunggu indikator, formula, rubrik, serta laporan resmi.

## Fase 7 · Admin, handover, dan AI

- `/portal/operasi` menampilkan status konfigurasi yang teredaksi dan 100 kejadian audit lokal terbaru hanya untuk akun dengan `SYSTEM_CONFIGURATION_READ`. Status konfigurasi database bukan bukti koneksi berhasil.
- `/portal/profil` menampilkan identitas sesi TEST, role, periode, preferensi tema yang tersimpan pada browser, dan aksi keluar. Perubahan profil atau membership resmi belum aktif.
- `/portal/handover` menampilkan audit penerimaan per paket. Penerimaan tetap dibatasi ke penerus yang ditunjuk dan memeriksa akses sumber. Pencabutan akses lama, checklist berowner, dan arsip resmi belum aktif.
- `/portal/ai` memperjelas bahwa jawaban/sitasi adalah preview lokal tanpa provider. Persiapan dan konfirmasi tindakan TEST menangani kegagalan API, menunjukkan waktu kedaluwarsa, dan tidak mengeksekusi perubahan sistem lain.
- A04–A05 baru tercakup sebagian; A06–A09 serta A14–A15 menunggu identitas/membership resmi, retensi, backup, dan restore drill. I03–I05 menunggu kebijakan provider, retensi, dan histori resmi.

## Verifikasi

`npm run verify` menjalankan typecheck, tes, dan build. Tes tambahan memastikan transaksi baru hanya diajukan pemohon dan penolakan tanpa alasan ditolak. Pemeriksaan browser dilakukan pada halaman Keuangan, Evaluasi, Operasi, Handover, AI, dan Profil di localhost.
Uji UI membuat satu draf sintetis `Pengujian alur keuangan TEST`; draf itu tampil setelah disimpan dan `FINANCE_CREATED` muncul pada audit lokal. Draf tersebut sengaja tetap berlabel TEST.
