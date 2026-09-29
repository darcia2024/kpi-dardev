# Pertanyaan dan data yang perlu diminta dari KPI PPMI Mesir

**Pembaruan 23 September 2026:** sepuluh jawaban awal klien dan dampaknya dicatat di [dokumen keputusan klien](30-JAWABAN-KLIEN-23-SEPTEMBER-2026.md). Tabel di bawah tetap berfungsi sebagai daftar rincian dan bukti yang belum lengkap; pertanyaan yang sudah dijawab secara prinsip tidak perlu ditanyakan ulang.

Dokumen kerja untuk rapat keputusan, pengumpulan data resmi, UAT, dan persiapan rilis. Disusun dari `PRD-KPI-PPMI-Mesir.md`, `docs/01-OPEN-DECISIONS.md`, `docs/03-KPI-DECISION-PACKET.md`, `docs/20-BACKEND-COMPLETION.md`, dan `docs/22-STATUS-BUILD-SAAT-INI.md` per 23 September 2026.

**Kondisi saat ini:** situs publik dan portal internal dapat ditinjau secara lokal, tetapi banyak alur masih menggunakan data sintetis TEST. Kelulusan build atau tersedianya halaman belum berarti sistem siap menerima data maupun pengguna nyata. Pertanyaan di bawah meminta rincian yang belum tercatat; prinsip Q01–Q28 yang dilaporkan telah disetujui tidak perlu diputuskan ulang. Persetujuan oleh pengguna untuk scaffold lokal juga belum menggantikan keputusan institusional KPI tentang produksi, layanan cloud, dan data nyata.

Catat setiap jawaban sebagai **keputusan, pejabat/organ yang berwenang, tanggal berlaku, versi dokumen sumber, dan bukti persetujuan**. Bila belum diputuskan, beri status `TERBUKA` dan jangan mengisi angka, nama, atau aturan dengan tebakan. Data kasus, identitas, dokumen internal, dan kredensial harus diserahkan melalui kanal organisasi dengan akses terbatas, bukan ditempel ke chat atau repositori.

## A. Keputusan yang harus ditutup sebelum data nyata dan produksi

| ID | Pertanyaan kepada klien | Bukti/jawaban yang diminta |
|---|---|---|
| K01 | Siapa pemilik produk, pemberi keputusan akhir, dan penanggung jawab harian dari KPI? Siapa pengganti masing-masing saat berhalangan? | Nama jabatan, nama pejabat, kontak resmi, dan surat/berita acara penunjukan. |
| K02 | Dokumen mana yang menjadi sumber aturan tertinggi dan versi mana yang berlaku untuk situs serta portal: AD/ART, UU KPI, Buku Pedoman, SOP, atau keputusan terbaru? Bila bertentangan, siapa memutuskan penafsiran? | Daftar dokumen resmi beserta versi/tanggal berlaku dan mekanisme eskalasi. |
| K03 | Apakah seluruh 113 layar tetap menjadi cakupan kontrak? Kapan 39 layar yang belum tercantum eksplisit pada tabel empat fase harus diterima? | Matriks cakupan yang disahkan: ID layar, fase, prioritas, owner UAT, serta perubahan kontrak bila ada. |
| K04 | Siapa yang boleh menyetujui aktivasi situs publik, pembukaan form aspirasi, pilot internal, dan rilis penuh? Apa bukti penerimaan per tahap? | Daftar approver, kriteria go/no-go, dan format berita acara/UAT/BAST. |
| K05 | Berapa lama masa pemeliharaan dan apa cakupannya? Dokumen ringkasan menyebut tiga bulan, rencana lama menyebut 30 hari. | Naskah kontrak/BAST yang berlaku, kontak dukungan, jam layanan, dan SLA penanganan. |
| K06 | Apakah arsitektur Next.js, PostgreSQL/Supabase, storage privat, hosting, dan region yang kini dipakai sebagai rancangan lokal disetujui untuk produksi? | ADR/keputusan teknis, daftar penyedia dan subprosesor, region, biaya, serta penanggung biaya setelah serah terima. |
| K07 | Data apa yang boleh berada di local, staging, pilot, dan produksi? Bolehkah staging memuat data nyata yang disamarkan? | Matriks klasifikasi dan lingkungan, aturan anonimisasi, serta pihak yang boleh mengaksesnya. |

## B. Konten publik, identitas, dan bahasa institusi

| ID | Pertanyaan kepada klien | Bukti/jawaban yang diminta |
|---|---|---|
| K08 | Apakah penjelasan publik bahwa KPI menjalankan pencegahan, edukasi, pengawasan, penerimaan informasi, dan penanganan persoalan interaksi sudah tepat? Batas wewenang apa yang harus disebut agar tidak terkesan mengatur tanpa batas? | Copy profil, mandat, batas kewenangan, dan istilah kelembagaan yang disetujui. |
| K09 | Informasi apa yang boleh dipublikasikan tentang struktur, pengurus, dan divisi Intelijen & Operasional? Prinsip tidak menampilkan anggota/cara kerja divisi ini telah disetujui; rincian profil aman perlu ditetapkan. | Daftar field boleh publik/khusus internal dan pejabat pemberi persetujuan. |
| K10 | Halaman publik mana yang wajib tersedia pada rilis pertama: profil, struktur, program, berita, publikasi, repository, statistik, kontak, dan aspirasi? Mana yang belum memiliki materi resmi? | Daftar halaman, konten final, pemilik konten, tanggal berlaku, dan status `siap/belum siap`. |
| K11 | Siapa penulis, reviewer substansi, penyetuju, dan penerbit konten publik? Berapa lama alur review dan bagaimana koreksi atau penarikan artikel dilakukan? | Matriks editorial, SOP publikasi, format atribusi/sumber, dan kebijakan arsip. |
| K12 | Apakah versi English wajib saat rilis pertama? Jika belum tersedia, apa teks pemberitahuan yang disetujui dan siapa penerjemah serta reviewer-nya? | Materi ID/EN yang disahkan atau keputusan penundaan per halaman. |
| K13 | Logo, palet merah, nama resmi, singkatan, slogan, serta aset foto mana yang final? Apakah setiap foto kegiatan memiliki izin publikasi dan keterangan yang akurat? | Brand kit asli, izin penggunaan foto, kredit, caption, tanggal, dan daftar aset yang dilarang tayang. |
| K14 | Kontak resmi apa yang boleh ditampilkan? Jalur mana untuk pertanyaan umum, aspirasi, dan keadaan mendesak? | Email/kanal organisasi, nama jabatan, jam layanan, serta teks respons otomatis bila dipakai. |
| K15 | Statistik publik apa yang boleh ditampilkan dan bagaimana penghitungannya? | Definisi indikator, periode, satuan, sumber, metode agregasi, frekuensi pembaruan, serta approver; jangan mengisi angka contoh sebagai data resmi. |

## C. Identitas, peran, dan izin

| ID | Pertanyaan kepada klien | Bukti/jawaban yang diminta |
|---|---|---|
| K16 | Siapa pengguna awal, jabatan, divisi, periode, serta status aktifnya? Siapa Admin Sistem sesuai keputusan khusus bahwa peran ini dipegang Ketua dan Sekretaris? | Daftar akun resmi, email organisasi, jabatan, periode, tanggal aktif/nonaktif, dan owner verifikasi. |
| K17 | Untuk setiap aksi penting—baca, buat, ubah, review, approve, publish, ekspor, unduh, triage, dan kelola izin—jabatan mana yang berwenang pada scope organisasi/periode/divisi/objek? | Matriks permission resmi dan contoh objek yang boleh/tidak boleh diakses. |
| K18 | Siapa reviewer pengganti bila tim kecil, pejabat berhalangan, atau ada konflik kepentingan? Siapa yang menyetujui grant sementara dan akses darurat? | Rantai delegasi, batas waktu, alasan wajib, audit, dan prosedur pencabutan. |
| K19 | Berapa lama sesi login, interval pemeriksaan sesi, batas percobaan login, masa reset MFA, dan prosedur pemulihan akun? | Kebijakan keamanan akun dengan angka final dan pihak pemulih. |
| K20 | Kapan akses pengurus demisioner berakhir, bagaimana handover ke penerus, dan siapa yang memeriksa bahwa akses lama telah dicabut? | Aturan transisi periode, daftar penerus, dan checklist pencabutan akses. |

## D. Aspirasi, pengawasan, kasus, dan notifikasi

| ID | Pertanyaan kepada klien | Bukti/jawaban yang diminta |
|---|---|---|
| K21 | Aspirasi apa yang masuk lingkup KPI, apa yang harus dialihkan ke PPMI/organisasi lain, dan apa jalur keadaan mendesak? | Kategori, kriteria di luar kewenangan, matriks rujukan, dan kontak petugas. |
| K22 | Siapa penerima awal, petugas triage, penanggung jawab kasus, pemeriksa, pengambil keputusan, serta penyetuju penutupan/reopen? | RACI per tahap dan aturan pemisahan tugas/konflik kepentingan. |
| K23 | Untuk aspirasi anonim yang telah disetujui prinsipnya, data minimum apa yang dikumpulkan? Bagaimana token tracking kedaluwarsa, hilang, atau dipulihkan? | Form final, pemberitahuan privasi, masa token, prosedur recovery, dan batas pembaruan yang terlihat pelapor. |
| K24 | SLA apa yang benar-benar dapat dipenuhi untuk penerimaan, triage, pembaruan, eskalasi, dan penutupan? Bagaimana hari libur dan zona waktu dihitung? | Tabel SLA per urgensi/kategori, kalender kerja, serta owner pemantauan. |
| K25 | Informasi kasus apa yang boleh dilihat pelapor, pengurus, pimpinan, dan auditor? Kapan identitas disembunyikan atau dibuka dengan persetujuan? | Klasifikasi field, template pembaruan aman, dan kebijakan akses kasus. |
| K26 | Notifikasi dikirim lewat kanal apa, kepada siapa, pada peristiwa apa, dan dengan isi seberapa rinci? | Daftar event, template ID/EN, alamat/akun pengirim resmi, aturan retry dan eskalasi kegagalan. |
| K27 | Berapa masa simpan aduan, bukti, token, dan log? Kapan penghapusan ditahan karena audit atau sengketa? | Jadwal retensi dan legal hold per jenis data. |

## E. Dokumen, publikasi, tugas, dan rapat

| ID | Pertanyaan kepada klien | Bukti/jawaban yang diminta |
|---|---|---|
| K28 | Jenis file apa yang boleh diunggah, siapa yang boleh melihat/mengunduh, bagaimana klasifikasinya, dan berapa lama disimpan? Batas 25 MB dan blokir `.exe`/`.sh` sudah menjadi prinsip; allowlist lengkap masih kosong. | Matriks MIME/ekstensi, klasifikasi, ukuran bila ada pengecualian, retensi, legal hold, dan aturan berbagi. |
| K29 | Dokumen mana yang menjadi sumber resmi untuk repository/knowledge dan mana yang tetap internal? Siapa yang mengesahkan versi terbaru? | Inventaris dokumen, owner, versi, status, klasifikasi, relasi dokumen lama–baru, serta izin publikasi. |
| K30 | Apa status resmi tugas dari dibuat sampai diterima? Kapan bukti wajib, siapa reviewer, kapan tenggat boleh diubah, dan berapa lama alasan keterlambatan harus diisi? | SOP tugas, matriks status/transisi, kriteria bukti, dan aturan eskalasi. |
| K31 | Apa aturan rapat: peserta berhak suara, quorum, jumlah putaran, suara rahasia, pembatalan/koreksi, finalisasi, dan revisi notulen? | Tata tertib rapat/voting serta template agenda, keputusan, dan notulen. |
| K32 | Apakah waktu resmi sistem mengikuti `Africa/Cairo` untuk jadwal dan tenggat? Perlukah tampilan zona waktu kedua bagi pengurus di luar Mesir? | Keputusan tampilan dan contoh jadwal lintas zona. |

## F. Keuangan, evaluasi, knowledge, dan pergantian pengurus

| ID | Pertanyaan kepada klien | Bukti/jawaban yang diminta |
|---|---|---|
| K33 | Tanggal pasti awal/akhir periode keuangan, mata uang utama, sumber kurs, dan cara mencatat kurs pada transaksi? | Kalender periode, kode mata uang, sumber kurs, aturan pembulatan. |
| K34 | Apa daftar pos anggaran, sumber dana terikat/tidak terikat, batas pengajuan, batas dua penyetuju, dan otoritas pembayaran/rekonsiliasi? | Anggaran resmi, chart of accounts, matriks nominal–approver, dan aturan pemisahan tugas. |
| K35 | Berapa hari batas pertanggungjawaban uang muka, kapan pengajuan baru diblokir, dan siapa boleh membuka kembali periode atau mengoreksi transaksi dibukukan? | SOP uang muka, berita acara koreksi, dan pejabat berwenang. |
| K36 | Indikator kinerja apa yang dihitung, bobot dan rumus versinya, rubrik penilaian, bukti wajib, serta apa arti data kosong? | Kamus indikator, formula/rubrik yang disahkan, contoh perhitungan, dan dataset uji teranonim. |
| K37 | Siapa evaluator, kalibrator, penerbit hasil, serta pemutus koreksi/sanggah? Siapa boleh melihat perbandingan antar-divisi sesuai keputusan Ketua/Sekjend? | Matriks evaluator dan hak baca, siklus evaluasi, SOP sanggah, serta batas waktunya. |
| K38 | Pengetahuan/SOP mana yang wajib dicari dalam portal, siapa pemiliknya, dan bagaimana perubahan sumber membuat artikel perlu ditinjau ulang? | Taksonomi, inventaris SOP/knowledge, sumber-versi, owner, dan aturan review. |
| K39 | Apa yang wajib diserahkan setiap jabatan/divisi saat pergantian pengurus? Kapan penerus dianggap menerima, dan siapa menutup akses pendahulu? | Checklist handover, template exit report, daftar aset/data, serta penanggung jawab per item. |

## G. AI, infrastruktur, operasi, dan penerimaan

| ID | Pertanyaan kepada klien | Bukti/jawaban yang diminta |
|---|---|---|
| K40 | Apakah fitur AI akan diaktifkan pada rilis ini? Jika ya, provider/model, region, retensi, konfigurasi larangan pelatihan, sumber Umum/Internal yang boleh dipakai, dan siapa reviewer manusia? | Persetujuan penyedia/subprosesor, kontrak/konfigurasi pemrosesan, register prompt/model, daftar sumber berizin. |
| K41 | Akun organisasi mana yang memiliki GitHub, database, hosting, domain, storage, email, monitoring, dan backup? Siapa pemilik tagihan serta pengganti owner? | Inventaris akun organisasi dan owner; berikan akses individual sementara melalui mekanisme yang dapat dicabut, bukan berbagi kata sandi. |
| K42 | Berapa target backup dan pemulihan (RPO/RTO), frekuensi restore drill, uptime, performa, volume data, dan jumlah pengguna bersamaan? | Target operasional terukur, owner insiden, kanal eskalasi, serta kriteria uji beban dan pemulihan. |
| K43 | Data lama apa yang akan dimigrasi, dari sistem/format apa, dan siapa yang memvalidasi jumlah, duplikasi, serta kesalahan? | Inventaris sumber, skema/ekspor, aturan pembersihan, contoh data aman, dan berita acara rekonsiliasi. |
| K44 | Siapa wakil KPI untuk UAT tiap modul dan skenario mana yang menentukan lulus/gagal? Apakah ada pengguna pilot dari peran berbeda? | Daftar tester, matriks skenario/hasil, kriteria defect kritis, jadwal pilot, dan persetujuan tertulis. |
| K45 | Siapa mengoperasikan sistem setelah serah terima: admin akun, editor, petugas kasus, operator backup, dan kontak vendor? Berapa sesi pelatihan yang diperlukan? | RACI operasional, daftar peserta pelatihan, runbook yang disetujui, kontak dukungan, dan rencana rotasi/pencabutan akses pengembang. |

## Paket data/dokumen yang diminta

| Prioritas | Paket yang diminta | Format yang memudahkan pemeriksaan |
|---|---|---|
| P0 | Naskah resmi yang berlaku: AD/ART, UU KPI, Buku Pedoman, SOP, keputusan, kontrak/BAST, dan perubahan terbaru. | PDF/DOCX bertanggal dan berversi, ditandai mana yang final. |
| P0 | Daftar pengambil keputusan, owner produk, owner UAT, owner cloud/domain, dan kontak resmi lembaga. | Tabel jabatan, nama, email organisasi, mandat, masa berlaku. |
| P0 | Matriks akun–jabatan–divisi–periode–izin–reviewer pengganti; daftar pejabat aktif dan transisi. | Spreadsheet terpisah dari kredensial, dengan approver tiap perubahan. |
| P0 | Paket konten publik final: profil/mandat, struktur aman, divisi, program, kegiatan, berita, publikasi, kontak, kebijakan privasi, serta status terjemahan. | Dokumen per halaman dengan judul, isi, sumber, tanggal, owner, reviewer, status persetujuan. |
| P0 | Logo dan aset asli; foto yang boleh tayang beserta izin, caption, tanggal, dan kredit. | PNG/SVG asli dan daftar aset; tandai foto yang tidak boleh publik. |
| P0 | SOP aspirasi/kasus: kategori, rujukan, triage, urgensi, SLA, anonimitas, token, pemberitahuan privasi, akses, retensi. | Dokumen kebijakan dan template pesan resmi, disahkan pejabat berwenang. |
| P1 | Inventaris dokumen dan knowledge: ID, judul, versi, sumber, klasifikasi, owner, masa simpan, akses, status publikasi. | CSV/XLSX metadata + berkas pada storage privat organisasi. |
| P1 | Aturan tugas, rapat, voting, notulen, keputusan, dan template bukti. | SOP dan contoh fiktif/tersamarkan untuk UAT. |
| P1 | Anggaran, pos, sumber dana, periode, mata uang/kurs, ambang nominal, kewenangan approval, format bukti, dan aturan koreksi. | Spreadsheet resmi + SOP; contoh transaksi uji tanpa rekening pribadi. |
| P1 | Indikator, formula, bobot, rubrik, contoh perhitungan, siklus evaluasi, penilai, koreksi dan sanggah. | Kamus indikator berversi + dataset uji teranonim. |
| P1 | Checklist serah terima jabatan, inventaris aset, exit report, dan aturan pencabutan akses. | Template resmi + contoh sintetis. |
| P1 | Register pilihan penyedia dan operasi: region, biaya, RPO/RTO, kapasitas, monitoring, insiden, backup, retensi, AI bila diaktifkan. | Keputusan/ADR dan dokumen kepemilikan akun; secret hanya melalui secret manager. |
| P1 | Daftar data historis yang akan dimigrasi dan contoh struktur datanya. | Ekspor metadata/skema dan contoh aman; data nyata setelah lingkungan dan akses disahkan. |
| P2 | Daftar peserta pilot, skenario UAT, hasil uji, defect, dan pejabat penandatangan penerimaan. | Matriks UAT dengan kolom lulus/gagal/belum diuji, bukti, dan tanda tangan. |

**Urutan permintaan:** tutup K01–K07 dan paket P0 lebih dulu. Setelah itu, tetapkan aturan per modul dan terima paket P1. Data nyata hanya masuk ke lingkungan yang sudah memiliki keputusan kepemilikan, klasifikasi, izin, storage, backup, dan pengujian akses. Pilot dan rilis memerlukan hasil UAT P2, bukan sekadar persetujuan tampilan.
