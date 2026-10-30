# Panduan testing manual KPI — halaman, fitur, dan peran

Tanggal: 6 Oktober 2026, alamat diperbarui 30 Oktober 2026. Website resmi: https://kpi-dardev.vercel.app.

Panduan ini adalah checklist untuk dijalankan, bukan laporan bahwa seluruh skenario telah lulus. Acuan: implementasi hosted pada repo, SOP kerahasiaan, dan formulir kasus. Label tombol dapat memakai terjemahan status di UI.

## 1. Persiapan sebelum mulai

1. Catat waktu, URL, versi deployment, browser, nama penguji, dan akun yang dipakai. Jangan mencatat password atau token sesi.
2. Siapkan akun resmi dengan email terverifikasi, status aktif, penugasan, mandat jika diperlukan, dan keputusan akses yang sesuai. Periksa `/portal/profil` dan `/portal/akses` pada setiap akun.
3. Gunakan profil browser terpisah untuk pembuat, pemeriksa, dan pengguna tanpa izin. Chrome biasa dan satu jendela Incognito cukup untuk dua sesi; seluruh jendela Incognito dalam profil yang sama dapat berbagi sesi. Untuk tiga atau lebih akun gunakan profil browser berbeda.
4. Persetujuan pengujian production harus menentukan catatan/berkas yang boleh dipakai dan tindakan yang boleh dilakukan. Jangan membuat pengaduan palsu, menetapkan sanksi, mencatat pembayaran fiktif, mencabut akses operasional orang lain, atau menerbitkan berita buatan sebagai fakta institusi.
5. Jika catatan latihan production disetujui, beri judul `UAT — [modul] — [tanggal]`, tanpa identitas kasus nyata. Gunakan dokumen berisi teks latihan, bukan data pribadi. Tetapkan klasifikasi dan akses yang sesuai; awalan UAT tidak memberi pengecualian keamanan atau izin publikasi.
6. Untuk fitur yang hanya bisa diuji lewat keputusan resmi, gunakan objek resmi yang memang disetujui untuk pemeriksaan. Jika tidak tersedia, tandai BLOCKED; gunakan hasil tes otomatis terisolasi sebagai bukti terpisah, bukan UAT production.
7. Periode resmi adalah 17 Oktober 2026–17 Oktober 2027. Pada tanggal panduan, periode belum mulai dan belum ada periode aktif. Jangan mengubah tanggal atau membuat periode aktif palsu untuk membuka fitur. Pengujian transaksi/workflow yang membutuhkan periode aktif menunggu periode dan penugasan sah.
8. Pemindai berkas, AI, email/WhatsApp dan scheduler memerlukan konfigurasi serta persetujuan penyedia. Status belum dikonfigurasi berarti BLOCKED untuk alur sukses; penolakan aman masih bisa diuji.

### Status hasil

| Status | Kapan digunakan |
|---|---|
| PASS | Langkah benar-benar dilakukan, hasil sesuai, dan bukti dicatat |
| FAIL | Hasil berbeda dari harapan, termasuk data bocor atau perubahan tidak tersimpan |
| BLOCKED | Tidak bisa dilanjutkan karena akun, periode, mandat, data, atau layanan belum siap |
| NOT RUN | Belum dicoba |
| N/A | Skenario tidak berlaku untuk cakupan yang disetujui; tuliskan alasannya |

Tidak adanya tombol dapat menjadi hasil yang benar karena izin, tetapi bukan bukti cukup bahwa API juga terlindungi. Halaman 200 bukan bukti penyimpanan berhasil.

## 2. Akun dan peran yang perlu disiapkan

Di hosted production, role teknis adalah `ADMIN_SISTEM` dan `PENGURUS`. Ketua, Wakil, Sekretaris/Sekjend, OIC, PIC, dan personel divisi adalah jabatan/penugasan; kewenangannya mengikuti mandat, izin, klasifikasi, objek, dan waktu. Jabatan tidak otomatis membuka semua modul.

| Profil penguji | Fokus pengujian |
|---|---|
| Pengunjung tanpa login | Informasi publik; seluruh portal/data internal harus tertutup |
| Administrator teknis | Organisasi, periode, roster, konfigurasi dan audit; isi bisnis hanya dengan izin terpisah |
| Ketua KPI | Keputusan dan review yang tercantum dalam mandat; tidak menyetujui pekerjaan sendiri ketika independensi diwajibkan |
| Wakil | Kewenangan sesuai mandat/delegasi; tidak otomatis memiliki semua izin Ketua |
| Sekretaris/Sekjend | Penerimaan laporan sesuai konfigurasi, administrasi dan rapat sesuai izin |
| OIC Intelligence & Operation | Penugasan dan pengawasan kasus sesuai mandat dan keterlibatan |
| PIC/personel I&O | Pengerjaan kasus yang ditugaskan, formulir, catatan dan bukti sesuai izin objek |
| OIC/personel Research & Analysis | Tugas, kajian, rujukan dan review yang diberikan; kasus di luar mandat tetap tertutup |
| OIC/personel Prevention & Education | Tugas edukasi, rapat dan konten sesuai izin; tidak otomatis melihat berkas kasus |
| Penanggung jawab/personel Media & Publication | Penyusunan, review atau publikasi sesuai izin yang berbeda |
| Petugas keuangan yang ditunjuk | Pembuat transaksi, pemeriksa bukti, dan pemberi persetujuan akhir dengan akun berbeda |
| Pengguna aktif tanpa grant / pengguna yang aksesnya dicabut | Profil sendiri tetap sesuai ketentuan; data dan tindakan yang tidak berizin tertolak |

Tiga divisi dan satu subbidang mengikuti struktur yang dikonfirmasi KPI. Profil penguji di atas tidak menambah jabatan organisasi. Seorang pengurus boleh memiliki beberapa mandat sah, tetapi pengujian independensi harus memakai orang/akun berbeda.

### Izin yang diperiksa pada akun

| Area | Izin aplikasi terkait |
|---|---|
| Administrasi | SYSTEM_CONFIGURATION_READ, IDENTITY_READ, IDENTITY_MANAGE; persetujuan admin teknis/mandat tetap diperiksa |
| Ringkasan | WORKSPACE_READ |
| Tugas | TASK_READ, TASK_CREATE, TASK_SUBMIT, TASK_REVIEW |
| Rapat | MEETING_READ, MEETING_MANAGE; keterlibatan peserta untuk RSVP/vote |
| Berkas | ASSET_UPLOAD, ASSET_READ, ASSET_DOWNLOAD; baca berbeda dari unduh |
| Pengetahuan | KNOWLEDGE_READ, KNOWLEDGE_WRITE, KNOWLEDGE_REVIEW |
| Redaksi | CONTENT_DRAFT_WRITE, CONTENT_REVIEW, CONTENT_PUBLISH |
| Penerimaan/kasus | ASPIRATION_TRIAGE, CASE_READ, CASE_MANAGE, CASE_REVIEW; keterlibatan kasus dan izin objek tetap diperlukan |
| Keuangan | FINANCE_READ, FINANCE_MANAGE, FINANCE_APPROVE_FINAL |
| Evaluasi | EVALUATION_READ, EVALUATION_WRITE; penilaian individual membutuhkan izin objek rahasia |
| Serah terima | HANDOVER_READ, HANDOVER_ACCEPT; penerima harus yang ditunjuk |
| AI | AI_READ, AI_ACTION_CONFIRM; sumber dan tujuan mempunyai pemeriksaan izin sendiri |
| Notifikasi | NOTIFICATION_READ, NOTIFICATION_TEMPLATE_REVIEW sesuai fitur/mandat |

Ini daftar izin untuk pemeriksaan, bukan instruksi memberikan semua izin kepada setiap akun. Catat grant organisasi, periode, divisi, object ID, tanggal berakhir, dan referensi keputusan. Untuk F01–F05, penilai/pelaksana juga ditentukan oleh otoritas/mandat dan pihak yang ditunjuk, bukan hanya izin generik.

## 3. Pola testing yang diulang pada setiap modul

1. Login sebagai pembuat berizin; pilih organisasi/periode/divisi yang benar.
2. Buka catatan yang boleh diuji atau buat catatan latihan yang disetujui. Simpan ID, status dan versi.
3. Refresh, keluar lalu login lagi: data harus tetap muncul dan tidak menjadi dua catatan.
4. Login sebagai pemeriksa berizin; jalankan revisi/review sesuai alur. Catat perubahan status, versi, pelaku dan waktu.
5. Login sebagai pengurus di luar scope; cari judul dan buka URL/objek yang sama. Isi, judul rahasia, kontak, bukti dan download tidak boleh bocor.
6. Buka catatan pada dua sesi. Sesi A menyimpan perubahan; sesi B menyimpan versi lama. Sistem harus menolak konflik dan meminta muat ulang, bukan menimpa diam-diam.
7. Untuk grant latihan yang sah, cabut izin atau tunggu kedaluwarsa. Ulangi baca, simpan, review dan unduh. Permintaan baru harus ditolak. Data yang sudah dilihat/disalin pengguna tidak dapat ditarik kembali oleh pencabutan.
8. Pada setiap halaman uji tampilan terang/gelap, desktop dan ponsel, Tab/Enter/Escape, pesan loading/error/kosong, teks panjang, tombol tidak bertumpuk, dan navigasi kembali.

## 4. Informasi publik — tanpa login

| ID | Halaman | Langkah dan hasil yang diharapkan |
|---|---|---|
| PUB-01 | `/` | Klik seluruh navbar dan CTA. Tujuan harus sesuai label; login menuju `/masuk`; anchor tidak tertutup navbar. Logo, warna, tema dan tampilan mobile konsisten. |
| PUB-02 | `/publik` | Periksa informasi tentang KPI, tautan lanjutan, galeri dan lightbox jika tersedia. Geser foto, buka/tutup, navigasi keyboard; foto tidak berulang dan layout tidak overflow. |
| PUB-03 | `/publik/divisi` dan detail | Buka seluruh divisi/subbidang; logo, nama, deskripsi dan tautan kembali benar. Struktur tiga divisi/satu subbidang tidak berubah menjadi empat divisi. |
| PUB-04 | `/publik/struktur`, `/publik/kegiatan`, `/publik/kabar` | Data berasal dari konten yang boleh dipublikasikan. Daftar kosong punya pesan wajar, tanpa pengurus/berita buatan. Draf internal tidak muncul. |
| PUB-05 | `/publik/publikasi` dan detail | Cari/filter yang tersedia; buka publikasi yang disetujui, periksa isi/sumber/lampiran. Slug tidak ada tidak membuka data lain. Draf dan catatan internal tidak masuk katalog publik. |
| PUB-06 | `/publik/cari` | Cari judul publik, kata yang tidak ada, dan judul rahasia yang diketahui penguji. Hasil terakhir tidak boleh menampilkan data rahasia. |
| PUB-07 | `/publik/layanan` | Semua tautan menuju layanan yang sesuai; informasi kontak tidak dibuat-buat. |
| PUB-08 | `/en`, `/en/divisions`, `/en/publications`, `/en/search`, `/en/services` | Navigasi dan konten Inggris yang tersedia bekerja; tidak membocorkan versi internal ketika versi publik belum tersedia. |
| PUB-09 | Semua | Ganti tema, reload, uji lebar 360/390/768/1440 px. Tidak ada objek mepet, teks tidak terbaca, atau scroll horizontal tak sengaja. |

## 5. Login, sesi, profil dan hak akses

1. AUTH-01: buka `/portal`, `/portal/tugas`, `/portal/kasus` tanpa login. Harus meminta login/menolak akses, tanpa isi internal.
2. AUTH-02: di `/masuk`, coba password salah sekali dan akun yang tidak berhak. Tidak boleh membentuk sesi internal atau membuka data. Hindari percobaan massal pada layanan production.
3. AUTH-03: login akun resmi; periksa nama, role teknis, penugasan dan grant pada `/portal/profil` dan `/portal/akses`. Bandingkan dengan keputusan resmi, bukan hanya label jabatan.
4. AUTH-04: menu sidebar mengikuti izin. Pengurus tanpa izin bisnis tetap bisa melihat profil/ketentuan yang diperbolehkan, tetapi modul berizin harus ditolak ketika dibuka lewat URL langsung.
5. AUTH-05: logout, lalu buka kembali URL internal dan refresh. Permintaan baru harus meminta login. Tombol Back dapat menampilkan gambar halaman lama; cek akses ulang ke data/API, bukan gambar cache saja.
6. AUTH-06: gunakan `/masuk/lupa-sandi` untuk akun milik penguji; cek email recovery, `/masuk/atur-ulang`, sandi baru, tautan kedaluwarsa/yang sudah dipakai. Jika email/redirect belum siap, tandai BLOCKED. Jangan menguji takeover akun orang lain.
7. AUTH-07: uji pencabutan grant bisnis dengan akun tetap aktif; profil boleh tetap tersedia, tindakan bisnis harus ditolak. Uji akun suspended hanya pada akun yang disetujui untuk skenario itu.

## 6. Administrasi, periode, akses dan SOP

### ADM — `/portal/pengaturan`, `/portal/akses`

1. ADM-01: admin membaca organisasi, periode, tiga divisi/satu subbidang, jabatan dan penugasan. Data/tanggal harus sama dengan keputusan resmi.
2. ADM-02: perubahan resmi yang disetujui disimpan lalu dimuat ulang; audit mencatat tindakan. Penugasan pengurus tidak otomatis memberikan akses isi kasus.
3. ADM-03: ajukan mandat dengan rujukan keputusan, cakupan permission/klasifikasi dan masa berlaku; pemeriksa berbeda menjalankan keputusan yang diperbolehkan. Uji penolakan dan pencabutan pada mandat latihan yang disetujui. Jangan bootstrap mandat resmi tanpa otorisasi KPI.
4. ADM-04: cek konfigurasi sekretaris penerima dan divisi I&O. Template intake diajukan/review independen sebelum aktif; template draf tidak tampil sebagai formulir publik aktif.
5. ADM-05: pengurus biasa membuka `/portal/pengaturan` langsung: pengaturan admin harus ditolak. Admin teknis tanpa grant bisnis tidak boleh membuka isi kasus hanya karena role admin.

### SOP — `/portal/kebijakan`

| ID | Fitur | Langkah |
|---|---|---|
| SOP-01 | F01 permintaan akses | Pengurus mengisi scope, tujuan, permission, rujukan mandat, tanggal mulai/akhir dan ID objek bila rahasia; ajukan dan refresh. Pengajuan tidak langsung menjadi akses. |
| SOP-02 | F02 keputusan/pelaksanaan | Otoritas berwenang berbeda dari pemohon memberi persetujuan penuh/sebagian atau penolakan dengan alasan/rujukan. Pelaksana menjalankan keputusan. Izin hanya sesuai yang disetujui dan berlaku, bukan seluruh yang diminta. Gunakan permintaan terpisah untuk tiap cabang. |
| SOP-03 | Register/review akses | Cek register, masa berlaku, rujukan, temuan dan tindak lanjut. Lakukan peninjauan, verifikasi atau penangguhan sesuai mandat. Uji grant kedaluwarsa/dicabut; akses baru tertolak. |
| SOP-04 | F03–F04 insiden | Laporkan insiden latihan yang disetujui, tetapkan petugas, catat pengamanan/pemulihan/pemeriksaan/pemantauan, risiko sisa dan tindakan koreksi. Minta/verifikasi pemulihan, keputusan pemberitahuan, dan penutupan sesuai syarat UI. Riwayat lama tetap ada. |
| SOP-05 | Konflik personel | Laporan yang menyangkut personel mengikuti pembatasan penanganan dan keputusan pihak berwenang. Pelapor/pihak terkait tidak otomatis bisa menyetujui pemulihan sendiri. Jika syarat mandat/rujukan belum tersedia, BLOCKED. |
| SOP-06 | F05 pengakhiran | Untuk subjek latihan yang disetujui, isi penerima dan verifier berbeda, tanggal efektif, checklist, pengecualian/PIC/tenggat, akses transisi jika sah. Penerima menerima; verifier memeriksa; pelaksana menyelesaikan pengakhiran. Cek akses benar-benar berubah, bukan hanya status formulir. |
| SOP-07 | Klasifikasi | Ajukan kategori objek yang tepat, rujukan dan alasan. Perubahan memerlukan keputusan yang disyaratkan; pengusul tidak bisa menurunkan rahasia menjadi publik sendiri. |
| SOP-08 | Perlindungan bukti | Pasang legal hold sesuai mandat; coba tindakan penghapusan/pelepasan yang dilarang. Pelepasan hold harus berotorisasi dan tercatat. Jangan memakai bukti kasus nyata untuk percobaan destruktif. |

Kategori “Sangat Rahasia” belum diselesaikan dalam schema kategori saat panduan dibuat. Jangan menyamakan otomatis dengan RAHASIA; catat sebagai kebutuhan keputusan, bukan tes yang lulus.

## 7. Ruang kerja dan tugas

### `/portal`, `/portal/workspace`

1. WRK-01: pilih scope; ringkasan tugas, tenggat, rapat, pemeriksaan dan notifikasi sesuai data yang boleh dibaca.
2. WRK-02: selesaikan satu tindakan pada modul sumber, muat ulang ringkasan; angka dan status menyesuaikan. Ringkasan tidak menampilkan judul dari scope lain.
3. WRK-03: tanpa periode/izin, tampil pesan kebutuhan konteks; jangan menilai halaman kosong sebagai bug sebelum memeriksa akses.

### `/portal/tugas`

1. TSK-01: pembuat membuat tugas dengan pelaksana berizin, deskripsi dan tenggat. Refresh dan cek daftar/detail.
2. TSK-02: pelaksana menjalankan `OPEN → IN_PROGRESS → IN_REVIEW`. Pemeriksa meminta revisi; pelaksana mengerjakan ulang; pemeriksa independen menyetujui sampai `DONE`.
3. TSK-03: coba persetujuan oleh pembuat/pelaksana ketika dilarang alur. Harus tertolak, bukan cukup tombol disembunyikan.
4. TSK-04: delegasikan ke pengurus berizin, ubah tenggat, tambah/selesaikan subtugas, tulis diskusi. Riwayat dan pemilik baru tersimpan.
5. TSK-05: tambah dependensi sah; coba siklus A→B→A dan penyelesaian sebelum prasyarat beres. Sistem harus menolak sesuai aturan.
6. TSK-06: buat/gunakan template dari tugas yang boleh dibaca. Template tidak menyalin isi tugas rahasia yang tidak berizin.
7. TSK-07: pembatalan dengan alasan dicatat; konflik versi dua tab tidak menimpa data terbaru.

## 8. Rapat — `/portal/rapat`

1. MEE-01: pengelola membuat rapat, agenda, waktu dan peserta resmi; peserta berizin menerima konteks rapat yang sesuai.
2. MEE-02: tiap peserta mengisi RSVP; pengelola mencatat kehadiran. Akun bukan peserta tidak bisa merespons atas nama peserta lain.
3. MEE-03: notulis menyimpan notulen draf; ajukan review; pemeriksa independen meminta revisi lalu menyetujui `FINAL`. Penulis tidak mengesahkan sendiri bila dilarang alur.
4. MEE-04: lampirkan berkas terverifikasi berizin. Akun tanpa akses berkas tidak boleh memperoleh isi/download dari lampiran rapat.
5. MEE-05: buka usulan voting dengan kuorum; peserta memilih SETUJU/TOLAK/ABSTAIN. Uji peserta tidak sah, voting setelah ditutup dan kuorum belum terpenuhi. Hasil tercatat sesuai suara yang berhak.
6. MEE-06: buat tugas tindak lanjut dari notulen final; tujuan/pelaksana harus berizin. Pengulangan permintaan tidak membuat tugas duplikat. Coba sebelum notulen final: tertolak.
7. MEE-07: arsipkan sesuai kewenangan; baca riwayat dan lakukan tes konflik versi. Kalender/ekspor yang hanya ada pada mode lokal tidak dihitung lulus hosted tanpa tersedia dan dicoba.

## 9. Dokumen dan berkas — `/portal/dokumen`

1. DOC-01: upload PDF/TXT/gambar/Office valid yang disetujui, maksimum 4.000.000 byte; catat ID dan status. Nama/format/ukuran invalid ditolak.
2. DOC-02: tanpa scanner sah, berkas tetap menunggu pemeriksaan dan download tertutup. Jangan mengubah status langsung di SQL untuk mendapatkan PASS.
3. DOC-03: setelah scanner sah menghasilkan status bersih, berkas menjadi AVAILABLE. Akun dengan ASSET_READ melihat metadata; ASSET_DOWNLOAD terpisah untuk download.
4. DOC-04: buka berkas/tautan download memakai akun tanpa izin dan sesi logout; data tidak terbaca. Storage private tidak memiliki URL publik permanen untuk berkas rahasia.
5. DOC-05: unggah versi baru melalui referensi versi sebelumnya; versi lama tetap ada dan histori berizin. Versi rahasia baru memerlukan izin objeknya sendiri.
6. DOC-06: coba pemindaian ulang sesuai tombol/izin; audit mencatat tindakan. Upload ulang/klik ganda tidak menciptakan record tanpa kontrol idempotensi.
7. DOC-07: cabut grant berkas latihan; baca/unduh baru harus tertolak. URL download sementara yang telah diterbitkan dapat berlaku sampai masa kedaluwarsanya: ukur masa berlaku dan pastikan tidak diterbitkan lagi, jangan menyimpulkan semua URL lama langsung mati tanpa pembuktian.
8. DOC-08: berkas ditolak pemindai tidak dapat dipakai sebagai bukti/lampiran siap. Jangan upload malware sungguhan; gunakan prosedur uji yang disetujui penyedia scanner.

## 10. Rujukan dan redaksi

### `/portal/knowledge`

1. KNOW-01: penulis membuat rujukan dengan judul, ringkasan, isi, sumber, bahasa dan slug; simpan, refresh, edit dan cek versi.
2. KNOW-02: ajukan review; pemeriksa independen memberi revisi/approval sesuai alur. Akun pembaca tidak bisa mengubah isi.
3. KNOW-03: izin sumber/lampiran dicabut; judul/isi rahasia tidak bocor pada daftar, pencarian, lampiran atau AI.

### `/portal/editor`

1. EDIT-01: buat draf konten yang disetujui untuk UAT, periksa preview Markdown dan lampiran. Konten HTML/script berbahaya tidak dieksekusi.
2. EDIT-02: penulis mengajukan, reviewer memeriksa sumber dan privasi, meminta revisi kemudian menyetujui. Penulis tidak lolos review mandiri.
3. EDIT-03: publisher dengan CONTENT_PUBLISH menerbitkan hanya materi yang memang disetujui untuk publik; klasifikasi TERBUKA dan persetujuan privasi wajib. Konten APPROVED belum otomatis berarti PUBLISHED.
4. EDIT-04: cek hasil pada halaman publik, pencarian dan versi bahasa yang tersedia. Draf/revisi tetap tidak muncul tanpa login.
5. EDIT-05: metadata kategori kabar/kegiatan/struktur dan jadwal mengikuti konten resmi. Jadwal berjalan saat worker berikutnya; cron saat ini harian 09:00 WIB, bukan tepat pada menit input.
6. EDIT-06: tarik/arsipkan sesuai izin; publik tidak menerima isi yang ditarik. Cabut izin publisher sebelum jadwal berjalan: worker tidak menerbitkan atas kewenangan yang sudah tidak sah.
7. EDIT-07: percobaan publikasi oleh akun hanya pembaca/penulis tertolak. Materi UAT yang tidak disetujui tampil publik diuji sampai draf/review saja dan tahap publish diberi BLOCKED.

## 11. Pengaduan publik dan kasus internal

### `/publik/pengaduan`, `/publik/aspirasi`

1. INTAKE-01: cek konfigurasi penerima Sekretaris dan divisi I&O, periode aktif, serta template resmi. Jika belum siap, formulir tidak boleh mengklaim laporan sudah diterima.
2. INTAKE-02: hanya dengan persetujuan uji layanan, kirim laporan latihan tanpa nama/tuduhan nyata, isi consent dan kolom wajib. Catat kode/token pelacakan sebagai rahasia; jangan tempel di laporan bug publik.
3. INTAKE-03: reload/klik kirim ganda tidak menghasilkan laporan duplikat. Sekretaris penerima melihat satu laporan di scope yang sesuai.
4. INTAKE-04: gunakan pelacakan yang ditampilkan layanan; pembaruan publik terbaca, catatan internal dan kontak pihak lain tidak terbuka. Token salah tidak menampilkan laporan lain.
5. INTAKE-05: validasi kolom kosong/email/consent diuji tanpa mengirim spam. Upload bukti anonim belum tersedia; jangan menandainya gagal karena fitur yang tidak disediakan.

### `/portal/kasus`, `/portal/kasus/pedoman`

1. CASE-01: sekretaris melakukan penerimaan/triage sesuai izin; pihak berwenang menunjuk PIC yang memenuhi syarat. Akun di luar personel kasus tidak boleh membaca isi hanya karena ada di divisi yang sama.
2. CASE-02: PIC menjalankan tindak lanjut, catatan internal, dan pembaruan publik terpisah. Pelacakan publik hanya menampilkan pembaruan publik.
3. CASE-03: periksa pedoman SOP, tujuh format dan sumber petunjuk. Jangan menganggap label pedoman berarti SOP sudah ditandatangani/disahkan.
4. CASE-04: uji alur teknis pengajuan penutupan/revisi/pemeriksaan independen hanya pada objek yang diotorisasi untuk skenario ini. Keputusan sanksi/pengesahan resmi tetap menunggu mandat; penutupan teknis bukan pengganti keputusan sah Ketua.

### Tujuh formulir kasus: ulangi tes FORM-01 sampai FORM-07 untuk setiap format

| Format | Nama |
|---|---|
| 01 | Penerimaan Laporan |
| 02 | Verifikasi Awal |
| 03 | Pemanggilan |
| 04 | Wawancara dan Pemeriksaan |
| 05 | Pencatatan dan Pengelolaan Bukti |
| 06 | Laporan Akhir |
| 07 | Keputusan Penetapan Sanksi dan Penutupan Kasus |

1. FORM-01: pada detail kasus pilih format, isi identitas/tanggal/PIC/OIC sesuai catatan latihan berizin; pilih opsi dan checklist. Pilihan Ya/Sebagian/Tidak dalam satu kelompok tidak boleh bersamaan.
2. FORM-02: simpan, refresh dan buka lagi; seluruh nilai dan versi harus tetap. Isi yang tidak berlaku ditandai dengan alasan, bukan diisi fakta buatan.
3. FORM-03: cek indikator kelengkapan; bagian kosong muncul. Indikator lengkap bukan pengesahan hukum dan bukan bukti semua tujuh format wajib untuk semua kasus.
4. FORM-04: ajukan draf; edit terkunci. Penyusun bisa menarik pengajuan sendiri sesuai alur. Reviewer CASE_REVIEW harus berbeda dari penyusun dan pemilik kasus; minta revisi, lalu penyusun memperbaiki/ajukan ulang.
5. FORM-05: reviewer memeriksa sampai REVIEWED. Catat otorisasi hanya dengan referensi dan lampiran sah yang bisa dibaca. Tanpa referensi/lampiran atau dengan berkas lintas kasus, tindakan harus ditolak.
6. FORM-06: ekspor formulir tersimpan, buka HTML, cetak/Save as PDF. Judul, bagian, isi, versi dan tanda DRAF BELUM DISAHKAN terbaca. Ini bukan ekspor DOCX atau reproduksi identik tata letak Word.
7. FORM-07: revoke izin kasus pada akun latihan; ekspor/baca/edit baru tertolak. Simpan dua versi bersamaan menghasilkan konflik, bukan menimpa. AUTHORIZATION_RECORDED hanya mencatat rujukan; tidak menandatangani, menetapkan sanksi atau menutup kasus otomatis.

### Register bukti

1. EVD-01: isi judul, sumber/perolehan, kondisi, lokasi, penanggung jawab, tanggal dan referensi lampiran berizin; simpan lalu refresh.
2. EVD-02: ubah status verifikasi dengan tanggal/dasar; riwayat lama tetap ada. VERIFIED merupakan catatan petugas, bukan otomatis terbukti terjadi pelanggaran.
3. EVD-03: catat perpindahan lokasi; lokasi lama, lokasi baru, pelaku dan alasan tersimpan.
4. EVD-04: referensi bukti/berkas lintas kasus atau tanpa izin tertolak. Pelepasan lampiran yang sudah dirujuk bukti/otorisasi ditolak. Uji pada dokumen latihan, bukan penghilangan bukti nyata.

## 12. Keuangan — `/portal/keuangan`

1. FIN-01: buat draf anggaran dalam mata uang IDR/EGP/USD yang sesuai, batas anggaran dan dokumen bukti berizin. Tidak ada konversi kurs otomatis.
2. FIN-02: pengaju membuat transaksi; simpan → ajukan → akun pemeriksa melakukan verifikasi bukti → akun ketiga memberi persetujuan akhir. Pembuat, pemeriksa dan approver akhir harus memenuhi independensi.
3. FIN-03: coba mengajukan tanpa bukti tersedia/berizin, nominal invalid atau melampaui anggaran; tertolak sesuai aturan. Minta revisi/penolakan mencatat alasan dan versi.
4. FIN-04: hanya untuk transaksi sah, catat pembayaran setelah approval; lakukan rekonsiliasi dengan pihak berbeda dari pencatat pembayaran. Sistem tidak melakukan transfer uang.
5. FIN-05: jangan mencatat pembayaran fiktif agar tes lengkap. Jika transaksi sah yang boleh diuji belum ada, tahap pembayaran/rekonsiliasi BLOCKED; tes otomatis terpisah tidak diubah menjadi UAT PASS.

## 13. Evaluasi — `/portal/evaluasi`

1. EVAL-01: buat reservasi nomor objek bila diminta, ajukan F01 izin objek EVALUATION_READ/WRITE, tunggu keputusan/pelaksanaan. Reservasi tidak membuka isi rahasia otomatis.
2. EVAL-02: evaluator berizin mengisi nilai 0–100, kriteria resmi, subjek dan bukti tersedia. Jangan membuat penilaian palsu atas pengurus nyata.
3. EVAL-03: ajukan; pemeriksa berbeda dari penyusun dan subjek memberi revisi/approval. Subjek tidak menilai dirinya sendiri.
4. EVAL-04: subjek yang berizin mengajukan satu keberatan setelah approval; pengajuan kedua tertolak. Riwayat tetap lengkap.
5. EVAL-05: pengguna lain tidak melihat nilai/bukti. Rujukan bukti yang dicabut tidak membuka isi lama.

## 14. Serah terima — `/portal/handover`

1. HAND-01: pembuat membuat paket dan menunjuk penerima sah, tambahkan dokumen terverifikasi berizin; dokumen duplikat harus ditolak.
2. HAND-02: ajukan paket; penerima yang ditunjuk menerima per item atau meminta revisi dengan alasan. Orang lain tidak dapat mengaku sebagai penerima.
3. HAND-03: coba selesaikan sebelum seluruh item wajib diterima: tertolak. Setelah lengkap, penerima menyelesaikan; refresh dan cek histori.
4. HAND-04: penutupan paket tidak otomatis mencabut izin. Uji pengakhiran akses lewat F05 terpisah.

## 15. Notifikasi — `/portal/notifikasi`

1. NOTIF-01: tindakan sah yang menghasilkan notifikasi muncul pada penerima yang benar; baca/tandai sesuai UI, refresh dan cek status.
2. NOTIF-02: klik tujuan menuju objek yang tepat. Setelah izin sumber dicabut, tautan tidak boleh membuka data yang sudah tidak berizin.
3. NOTIF-03: simpan preferensi email/WhatsApp, nomor sendiri dan rujukan consent; reload mempertahankan pilihan. Akun lain tidak mengubah preferensi penguji.
4. NOTIF-04: setelah provider/worker siap, kirim pemberitahuan latihan hanya ke penguji yang setuju. Pesan eksternal generik, tanpa isi/judul kasus rahasia. Uji retry/idempotensi dengan pengelola integrasi, bukan memicu spam.
5. NOTIF-05: revoke izin penerima sebelum antrean diproses; worker harus menolak pengiriman yang sudah tidak sah. Tanpa provider atau CRON_SECRET, pengiriman end-to-end BLOCKED.

## 16. AI dan tombol floating — `/portal/ai`

1. AI-01: akun AI_READ melihat tombol logo KPI dan panel; tutup/buka, uji keyboard/mobile. Akun tanpa izin tidak memperoleh sumber atau jawaban internal.
2. AI-02: tanpa penyedia sah, tampil pesan layanan belum tersedia, tanpa jawaban palsu. Ini PASS untuk penolakan aman, BLOCKED untuk jawaban AI nyata.
3. AI-03: setelah penyedia sah, pilih maksimal lima sumber yang berizin, kirim pesan latihan, cek jawaban dan sitasi. Dokumen di luar scope tidak boleh masuk pilihan/konteks.
4. AI-04: gunakan usulan draf, periksa/edit pratinjau, lalu konfirmasi dengan AI_ACTION_CONFIRM dan izin tujuan. Saat ini tujuan yang didukung adalah tugas sendiri atau draf pengetahuan; bukan otomatis kasus, laporan resmi atau transaksi keuangan.
5. AI-05: refresh tujuan dan cek satu record tercipta. Konfirmasi ganda tidak membuat dua record. Draf rahasia memerlukan izin objek yang sah.
6. AI-06: ubah versi/cabut akses sumber atau biarkan preview kedaluwarsa sebelum konfirmasi; tindakan harus ditolak. Chat tanpa konfirmasi tidak melakukan mutasi.
7. AI-07: batas 8 permintaan/menit dan 100/hari per akun diuji terkontrol dengan persetujuan pengelola biaya; jangan menghabiskan kuota production sekadar mengejar checklist.

## 17. Operasi, audit, katalog dan halaman tambahan

1. OPS-01: admin buka `/portal/operasi`, cek kesiapan database/storage/periode/processor; cocokkan dengan konfigurasi nyata. Status tersedia tidak membuktikan backup atau scanning berhasil.
2. OPS-02: setelah tindakan UAT, cari audit teknis dan unduh CSV; pelaku/waktu/tindakan benar, tanpa isi kasus/penilaian rahasia. Akun nonadmin tidak membuka audit teknis.
3. OPS-03: jalankan backup dan restore nyata sesuai prosedur pengelola database/storage, lalu catat bukti dan pemeriksaan independen. Form “uji pemulihan” hanya mencatat hasil; tidak menjalankan restore. Jangan restore menimpa production hidup untuk percobaan tanpa prosedur resmi.
4. CAT-01: `/portal/katalog`: cari/filter kode layar dan klik tujuan. Jumlah layar bukan persentase fitur lulus; target harus menuju modul yang benar.
5. EXTRA-01: `/portal/modul` atau URL rujukan lainnya: periksa tujuan dan pesan keterbatasannya; halaman fallback tidak dihitung sebagai fungsi operasional penuh.
6. EXTRA-02: `/portal/demo`, publikasi contoh, dan fitur mode lokal dicatat terpisah dari UAT hosted. Data contoh/read-only bukan bukti penyimpanan atau approval Supabase.

## 18. Matriks keamanan wajib diulang per objek/modul

| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| SEC-01 | Tanpa sesi, buka portal/API internal | Login diperlukan/401; tidak ada isi internal |
| SEC-02 | Akun aktif tanpa permission | Tindakan tertolak, umumnya 403 atau pesan akses; tanpa bocor data |
| SEC-03 | Divisi/periode/organisasi di luar grant | Scope/data tertolak; tidak muncul di daftar atau pencarian |
| SEC-04 | Rahasia dengan grant umum tanpa izin objek | Isi/berkas rahasia tertolak sesuai klasifikasi |
| SEC-05 | Grant baca tanpa tulis/unduh | Baca sesuai hak, mutasi/download yang tidak berizin tertolak |
| SEC-06 | Pencabutan/kedaluwarsa grant | Permintaan baru tertolak; notifikasi/AI/worker ikut memeriksa izin saat tindakan |
| SEC-07 | Pemeriksa = pembuat/subjek saat dilarang | Approval/review tertolak meski akun punya permission |
| SEC-08 | Versi lama dari dua sesi | Konflik, umumnya 409; data terbaru tidak tertimpa |
| SEC-09 | Tautan/ID objek lain yang diketahui penguji | Tetap tertolak; UUID bukan pengganti otorisasi |
| SEC-10 | Retry/klik ganda | Tidak membuat duplikasi atau dua efek bisnis |

Penguji teknis boleh membuka DevTools → Network dan mengamati status tanpa menyalin cookie/Authorization. Permintaan langsung dengan akun terbatas untuk membuktikan API harus dilakukan oleh penguji yang memahami API, pada ID latihan sah, tanpa mengganti identitas JWT atau menggunakan service-role key. Jangan menaruh cookie, signed URL atau token tracking dalam screenshot bersama klien.

Script cek GET anonim yang tersedia untuk penguji teknis:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
node --import tsx scripts/check-anonymous-access.ts https://kpi-dardev.vercel.app
```

Hasil terakhir sebelum panduan: 27/27 GET internal mengembalikan 401 tanpa login, 185 tes otomatis lulus. Script ini tidak menguji mutasi, seluruh halaman, akun berizin, atau antardivisi.

## 19. Lembar hasil dan laporan bug

Salin satu baris untuk setiap ID pengujian, setiap role relevan, dan setiap scope yang diuji. Untuk tujuh formulir, tuliskan format 01–07 secara terpisah.

| ID tes | Akun/jabatan & scope | Objek/versi | Langkah yang dicoba | Harapan | Hasil nyata | Status | Bukti/bug |
|---|---|---|---|---|---|---|---|
| AUTH-03 | Isi saat tes | — | Buka profil/akses | Sesuai keputusan | Isi saat tes | NOT RUN | — |
| FORM-02 / format 01 | Isi saat tes | Isi saat tes | Simpan lalu reload | Nilai tetap | Isi saat tes | NOT RUN | — |

Format bug:

```text
ID bug:
ID tes / modul:
URL tanpa token:
Waktu dan versi deployment:
Akun/jabatan (tanpa password) dan cakupan izin:
Objek latihan dan versi:
Langkah reproduksi:
Harapan:
Hasil nyata:
Status HTTP bila ada:
Bukti yang sudah disamarkan:
Dampak: kebocoran / data hilang / alur terhenti / tampilan
```

Kebocoran data, akses tanpa izin, approval ilegal, data hilang, dan berkas rahasia dapat diunduh tanpa hak adalah penghalang penerimaan. Berhenti menguji objek sensitif yang terdampak dan beri tahu pengelola; jangan memperluas percobaan pada kasus nyata lain.

## 20. Urutan pelaksanaan dan syarat selesai

1. Putaran A sekarang: informasi publik, tema/responsif, login/profil/logout, akses anonim dan admin membaca konfigurasi. Jalankan hanya yang tidak bergantung periode aktif/mandat baru.
2. Putaran B setelah periode/penugasan/grant sah: tugas, rapat, dokumen, rujukan/redaksi, intake/kasus dan formulir; ulangi sebagai pembuat, pemeriksa, pembaca, serta pihak tanpa izin.
3. Putaran C: keuangan, evaluasi, handover, F01–F05, klasifikasi/hold dan pencabutan. Gunakan otorisasi serta objek yang tepat.
4. Putaran D setelah provider siap: scanner, AI, pengiriman eksternal dan worker. Backup–restore diverifikasi oleh pengelola infrastrukturnya.
5. Putaran E: perbaiki FAIL, ulangi skenario terdampak, rekap per role/modul dan sign-off KPI. Jumlah PASS dihitung hanya dari skenario yang benar-benar dijalankan, dan BLOCKED tetap dilaporkan terpisah.

Serah terima final memerlukan seluruh skenario wajib yang disepakati PASS, tidak ada kegagalan akses/data kritis, keputusan fitur yang ditunda tertulis, dan penerimaan oleh Ketua KPI/tim pengelola yang berwenang. Tidak mengubah BLOCKED menjadi PASS agar angka terlihat penuh.
