# Pemisahan pekerjaan 40 layar parsial — 24 September 2026

Pelaksanaan teknis tanpa keputusan baru dicatat di [progres 20 layar lokal](./35-PROGRES-20-LAYAR-LOKAL-24-SEPTEMBER-2026.md).

Dasar: [katalog 98 layar](../src/lib/internal-screen-registry.ts), [status 40 layar](./33-SISA-LAYAR-INTERNAL.md), [audit spesifikasi klien](./29-AUDIT-27-DOKUMEN-KLIEN.md), dan [jawaban klien](./30-JAWABAN-KLIEN-23-SEPTEMBER-2026.md). Angka **20 + 13 + 7 = 40** mengelompokkan *langkah berikutnya*, bukan menyatakan layar sudah selesai. Tidak ada perubahan status katalog melalui dokumen ini. `Connected` tetap sebatas alur pratinjau lokal; produksi memerlukan keputusan, data, integrasi, dan UAT.

## A. Bisa dikerjakan sekarang — 20 layar

Gunakan akun dan data sintetis lokal untuk menguji aturan umum dari spesifikasi. Jangan mengisi jabatan, dokumen, nilai, atau kebijakan resmi dengan tebakan. Hasil pekerjaan ini dapat selesai secara teknis, tetapi sebagian penerimaan akhirnya tetap bergantung pada bagian B/C.

| Paket | ID | Pekerjaan yang dapat dilakukan sekarang | Batas penerimaan akhir |
| --- | --- | --- | --- |
| 1. Identitas dan periode | A07, A08, A09 | Detail akun beserta jejak perubahan; relasi organisasi–jabatan–divisi–periode; pemilihan periode yang konsisten pada modul. | Daftar pengurus, jabatan, penugasan, periode, dan izin resmi belum diterima. |
| 2. Dokumen dan rujukan | F03, F04, F05, K01, K02, K03, K04, I02 | Promosi versi hanya setelah status file layak; cek ulang izin saat preview/unduh/berbagi; daftar knowledge berizin, sitasi ke versi sumber, editor-review, arsip dan pencabutan; validasi ulang sitasi AI saat dibuka. | Aktivasi byte/media menunggu scanner nyata, klasifikasi dan inventaris sumber resmi. |
| 3. Kasus dan komunikasi | S03, S05, S06, N03 | Triage dengan owner, urgensi, alasan; approval dan penerima eksplisit untuk pengumuman/pesan dalam kotak internal; template notifikasi ID/EN berversi dengan review. | Penetapan akun petugas, penerima per event, teks resmi, dan kanal luar belum ada. |
| 4. Keuangan, evaluasi, handover, AI | B02, E04, E08, H06, I06 | Perhitungan pos terhadap transaksi, validasi input nilai/bukti, laporan hanya dari nilai final dengan sumber, arsip handover terkunci, serta usulan tindakan AI yang berversi dan dikonfirmasi manusia. | Anggaran, indikator/formula, penerus, dan kebijakan AI resmi belum tersedia. |

Urutan yang disarankan: **paket 1 → paket 2 → paket 3 → paket 4**. Setiap paket ditutup dengan uji hak akses negatif, persistensi setelah reload, audit aktor/objek, dan kondisi data kosong. Jangan menaikkan ID menjadi `connected` jika syarat penerimaan pada katalog belum terpenuhi.

## B. Butuh kepastian KPI sebelum alur final — 13 layar

Fondasi UI/API yang sudah ada boleh dipertahankan, tetapi nilai atau kewenangan pada kolom tengah tidak boleh diputuskan developer.

| ID | Kepastian minimum dari KPI | Dampak bila belum ada |
| --- | --- | --- |
| A14, F06 | Jadwal retensi per jenis data/file, pejabat legal hold, alasan dan kondisi pelepasan. | Arsip/penghapusan dan audit retensi tidak bisa disahkan. |
| S07 | Jenis layanan, kolom wajib, tujuan pemrosesan, teks consent final. | Form versi draf belum layak menerima laporan nyata. |
| S08, S09 | SLA per urgensi, kalender kerja/zona waktu, eskalasi, penutup dan pembuka kembali yang berwenang. | Tenggat dan keputusan kasus tidak boleh memakai angka/role tebakan. |
| N02 | Event wajib vs opsional dan kanal yang boleh dipilih penerima. | Preferensi tidak boleh membungkam pemberitahuan wajib. |
| B01, B03 | Anggaran/pos dan periode resmi, jenis klaim, mata uang/kurs, pemohon dan ambang approval. | Ringkasan serta pengajuan keuangan belum bisa dinilai benar. |
| E02 | Daftar subjek, indikator, bobot/formula, evaluator dan versi berlaku. | Input/laporan tidak punya dasar penilaian resmi. |
| H04 | Siapa mengesahkan pemindahan grant, kapan akses lama dicabut, dan pengecualian. | Preflight saja aman; perpindahan akses otomatis belum boleh aktif. |
| I03, I04, I05 | Retensi percakapan; provider/model dan region; kelas data, larangan pelatihan, reviewer serta persetujuan aktivasi. | Riwayat AI dan provider tetap lokal/draf, tanpa pemrosesan data KPI. |

## C. Butuh penyedia, lingkungan, atau akses operasional — 7 layar

Keputusan penyedia dan kontrak pada bagian ini berasal dari KPI. Setelah tersedia, developer masih harus mengintegrasikan dan menguji layanan; jadi `menunggu` tidak berarti pekerjaannya selesai.

| ID | Dependensi operasional | Bukti selesai yang perlu diuji |
| --- | --- | --- |
| A12, A16 | Database/hosting, secret manager, dan daftar dependensi produksi yang dipilih. | Konfigurasi hanya tampil teredaksi; health check menunjukkan kondisi layanan nyata tanpa secret. |
| A15 | Lokasi backup, pemilik akun, jadwal, RPO/RTO, dan staging pemulihan. | Backup otomatis dan restore drill pada salinan terpisah dengan bukti integritas. |
| F02, C05 | Storage privat serta scanner malware nyata dengan kebijakan MIME/ukuran. | File dikarantina sampai hasil scan; media CMS hanya menerima versi yang tersedia. |
| N04 | Provider email/kanal resmi, akun pengirim, callback/status pengiriman dan aturan retry. | Antrean, terkirim, gagal dan retry cocok dengan hasil provider, bukan simulasi. |
| I01 | Provider AI yang disetujui dan korpus berizin pada storage/knowledge. | Jawaban hanya memakai sumber yang boleh dibaca akun; tanpa sumber, sistem menolak klaim. |

## Permintaan kepastian yang ringkas

Ini bukan permintaan untuk menjelaskan ulang arsitektur 27 dokumen. Jawaban klien sebelumnya sudah menetapkan **tiga divisi dan satu subbidang**, **Sekretaris sebagai penerima kasus**, **Intelligence and Operation Division sebagai penindak lanjut**, serta **Ketua dan tim website sebagai pihak penerimaan**. Yang masih perlu diserahkan atau disahkan:

1. **Struktur dan orang:** bagan/jabatan final, daftar akun–divisi–periode, petugas kasus, reviewer pengganti, evaluator, pemegang grant, dan penerus handover.
2. **Aturan kasus dan data:** SOP triage/penutupan, angka SLA, retensi/legal hold, klasifikasi berkas, jenis form dan consent, event/isi notifikasi wajib.
3. **Angka dan materi resmi:** anggaran, pos, mata uang/kurs, indikator/bobot/formula evaluasi, inventaris serta klasifikasi 28 dokumen (termasuk berkas ke-28 yang belum diterima).
4. **Operasi dan penyedia:** pilihan storage/scanner, email, database/hosting/backup, RPO/RTO, region, biaya dan kepemilikan akun; untuk AI, keputusan aktif/tidak beserta provider, model, retensi, kelas data, dan sumber yang boleh dipakai.
5. **Penerimaan:** siapa yang mengesahkan tiap kebijakan, versi/tanggal berlaku, dan bukti UAT. Tanpa bukti itu, status produksi tetap terbuka.

Prioritas meminta kepastian: **struktur/akses dan SOP kasus lebih dulu**, lalu storage/retensi, keuangan/evaluasi, dan terakhir provider AI. Selama menunggu, paket A dapat dikerjakan pada pratinjau lokal tanpa mengaktifkan penerimaan data nyata.
