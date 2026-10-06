# Formulir terstruktur dan operasional berkas kasus

Paket enam pekerjaan yang diminta owner, 6 Oktober 2026.

## Implementasi

1. Tujuh formulir menggunakan 1.114 definisi kolom termasuk tujuh referensi bukti. Identitas, tanggal, PIC/OIC dan dasar penugasan berasal dari label sumber. Checklist tetap checkbox; kelompok Ya/Sebagian/Tidak menjadi pilihan tunggal dengan validasi database. Catatan lama tetap dibaca sebagai catatan, tidak dibuang. Petunjuk asli tetap tersedia di setiap bagian. Penandatanganan tidak diubah menjadi checkbox persetujuan otomatis.
2. Ekspor HTML per formulir tersimpan, dapat dicetak atau disimpan menjadi PDF lewat dialog cetak browser. Semua bagian dan petunjuk sumber disertakan, dengan label DRAF BELUM DISAHKAN, nomor formulir, versi, pencatat dan waktu. Ini format cetak berdasarkan isi/bagian sumber, bukan reproduksi identik tata letak DOCX dan bukan ekspor DOCX. Data di-escape, ekspor memerlukan sesi serta akses kasus saat permintaan, dan tidak dicache publik.
3. Register bukti mencatat sumber, perolehan, kondisi, lokasi, penanggung jawab, tanggal, status/dasar verifikasi dan referensi berkas. Setiap perubahan memiliki snapshot; perpindahan memakai tindakan tersendiri dan menyimpan lokasi lama. Berkas hanya bisa dipilih dari lampiran kasus yang tersedia serta berizin. Lampiran yang sudah menjadi rujukan riwayat bukti atau dokumen otorisasi tidak dapat dilepas melalui pengelolaan lampiran biasa.
4. Kelengkapan berkas menampilkan jumlah formulir per format, bagian yang belum dicatat/diberi alasan tidak berlaku, bukti, serta jumlah lampiran yang dapat diakses. Ini indikator pencatatan, bukan keputusan bahwa ketujuh format selalu wajib pada setiap kasus. Bagian diisi/diberi alasan tidak berlaku bukan berarti bukti atau keputusan sudah sah.
5. Workflow persiapan: DRAFT → SUBMITTED → CHANGES_REQUESTED → DRAFT; SUBMITTED → REVIEWED → AUTHORIZATION_RECORDED. Penyusun dapat menarik pengajuan sendiri. Edit dikunci saat diajukan/diperiksa. Pemeriksa memerlukan CASE_REVIEW dan berbeda dari penyusun serta pemilik kasus. Catatan dokumen otorisasi membutuhkan nomor rujukan dan lampiran kasus yang bisa diakses. Tahap terakhir hanya pencatatan dokumen; tidak memverifikasi tanda tangan, mengaktifkan mandat, menetapkan sanksi, atau menutup kasus.
6. Tes otomatis mencakup data lama, bidang terstruktur/date invalid, referensi bukti lintas kasus/tidak ada, optimistic version, riwayat perpindahan, independensi pemeriksa, kunci editor, penolakan akses, pencabutan izin kasus/berkas, kebutuhan lampiran otorisasi, perlindungan lampiran rujukan, dan escaping HTML cetak.

## Batas dan aktivasi

- Kategori Sangat Rahasia, penetapan periode, nomor/tanggal pengesahan SOP, pejabat dan mandat resmi tetap menunggu KPI.
- Tidak dibuat kasus, bukti, pengesahan atau periode palsu di production. Pengujian data contoh berada di PGlite terisolasi.
- Terverifikasi pada register berarti petugas mencatat hasil verifikasinya dengan tanggal dan alasan; bukan otomatis pembuktian pelanggaran.
- Kontrol antivirus/scanner dan otorisasi berkas yang sudah ada tetap berlaku. Register tidak memberikan izin download baru atau membuat URL publik.
- Penyimpanan dapat ditolak ketika bagian melewati batas 6.000 karakter atau isi keseluruhan melewati batas yang berlaku. Perubahan status menggunakan versi formulir; perubahan bukti menggunakan versi bukti.
- Untuk uji end-to-end Vercel dibutuhkan sesi login, periode aktif, CASE_READ/CASE_MANAGE/CASE_REVIEW sesuai personel, serta ASSET_READ untuk berkas terkait. Tes otomatis tidak menggantikan UAT dengan mandat resmi.

## Berkas teknis

- Migrasi 032: definisi kolom privat, tahap formulir, event pemeriksaan, register bukti, snapshot perubahan dan RPC baca/tulis.
- Route API: `/api/v1/work/cases/[id]/forms`, `/operations`, `/export`.
- UI: detail kasus pada `/portal/kasus`.
- Kolom source disimpan sebagai nilai terstruktur pada jawaban bagian agar kompatibel dengan histori draf sebelumnya. Referensi bukti divalidasi pada kasus yang sama.

## Bukti penyelesaian

- Migrasi 032 terpasang di Supabase production `gtjzlkmwafyttevertho`. SQL Editor menunjukkan sukses, lalu `workflow_ready=true`, `structured_fields=1114`, `evidence_records=0`. Tidak membuat bukti contoh di production.
- Vercel production READY: `dpl_2GiM81FNf2NTbjotU96bxiQPmy89`, alias `https://kpi-ppmi-mesir-preview.vercel.app`.
- 185 tes lulus, typecheck lulus, build lokal dan Vercel lulus. Smoke test tanpa sesi: forms, operations dan export mengembalikan 401.
- Tampilan ekspor HTML diperiksa di browser menggunakan contoh lokal terpisah; header, tanda draf dan bagian sumber terbaca. File PDF belum dihasilkan otomatis: tersedia melalui dialog cetak browser.
- Bukti lokal: `.vercel/case-operations-database-proof.png`, `.vercel/case-form-print-proof.png`, `.vercel/case-operations-tests-final.log`.
- Browser Vercel masih meminta login. UAT authenticated dan pengesahan resmi belum dilakukan; menunggu sesi, periode aktif, serta mandat/izin sesuai kebutuhan.
