# PRD Sistem Digital KPI PPMI Mesir

Versi 1.0 • 20 September 2026 • Draf untuk review produk

Pemilik produk dan data: Komisi Peduli Interaksi (KPI) PPMI Mesir. Pengembang: Dar Dev. Baseline: repositori `darcia2024/kpi-dardev`, branch `main`, commit `1c8f42d4ad574146360af82d9b3a19a3c35e9642`, beserta pembaruan kontraktual 17 September 2026 yang dirangkum di dalamnya.

Dokumen ini merumuskan kebutuhan produk untuk implementasi. Status draf berlaku untuk PRD ini; keputusan KPI yang sudah tercatat tetap dipertahankan. PRD tidak menggantikan kontrak atau membuktikan fitur telah dibangun. Naskah asli empat kontrak dan 27 dokumen sumber tidak disertakan dalam repositori yang ditinjau; rujukan terhadap isinya mengikuti ringkasan repositori.

## 1. Ringkasan produk

Sistem Digital KPI menyediakan website publik dan portal pengurus untuk mengelola informasi organisasi, tugas, rapat, dokumen, layanan aspirasi, keuangan, evaluasi, pengetahuan, dan pergantian kepengurusan. Setiap tindakan mengikuti wewenang jabatan, divisi, periode, klasifikasi data, dan persetujuan yang diperlukan.

Publik dapat menemukan informasi yang sudah disahkan dan melacak aspirasi melalui kode. Pengurus memiliki ruang kerja dan antrean tindakan. Pimpinan memperoleh laporan yang dapat ditelusuri ke bukti. AI membantu pencarian dan penyusunan usulan dari sumber yang diizinkan, dengan keputusan akhir tetap pada manusia.

Repositori saat ini merupakan situs dokumentasi interaktif statis: 113 spesifikasi layar, 61 entitas tabel, 15 contoh tampilan, 11 alur, 28 keputusan, dan empat ringkasan kontrak. Katalog tersebut menjadi cakupan perencanaan; keberadaan entri belum membuktikan backend, migrasi database, atau fitur produksi tersedia.

## 2. Masalah dan tujuan

Masalah di bawah merupakan kebutuhan yang disarikan dari blueprint, bukan hasil riset pengguna lapangan yang sudah divalidasi.

| Kebutuhan | Hasil produk yang dituju | Bukti keberhasilan |
|---|---|---|
| Mengetahui pekerjaan dan keputusan yang tertunda | Pengurus melihat tugas, tenggat, dan tindakan yang menjadi kewenangannya | Setiap item tindakan memiliki pemilik, objek sumber, status, dan aksi yang sah |
| Memastikan pekerjaan selesai dengan bukti | Penyelesaian tugas melalui pengajuan dan pemeriksaan | Tugas tidak dapat diterima tanpa bukti wajib dan reviewer yang berwenang |
| Mengendalikan informasi sensitif | Akses diperiksa pada setiap baca, tulis, pencarian, unduh, dan ekspor | Skenario akses lintas divisi, periode, dan klasifikasi yang tidak sah ditolak |
| Menjaga konsistensi informasi publik | Publik hanya menerima versi konten yang disetujui | Draf dan catatan internal tidak muncul pada halaman, pencarian, atau tracking publik |
| Mempertahankan pengetahuan organisasi | Arsip, SOP, keputusan, dan tanggung jawab memiliki sumber serta riwayat | Pengurus baru dapat menerima paket handover tanpa otomatis membuka semua arsip |
| Menjaga kendali KPI atas sistem | Akun, database, kode, dan dokumentasi berada di bawah kendali KPI | KPI dapat mengoperasikan dan memulihkan sistem setelah akses pengembang dicabut |

## 3. Pengguna dan pemilik keputusan

| Pengguna | Kebutuhan utama | Batas akses |
|---|---|---|
| Pengunjung/pelapor | Informasi ID/EN, publikasi, formulir, tracking | Konten publik dan pembaruan aman untuk token miliknya |
| Pengurus/pelaksana | Tugas, bukti, agenda, dokumen, notifikasi | Sesuai penugasan, divisi, periode, dan klasifikasi |
| Koordinator/reviewer | Penugasan, pemeriksaan hasil, tenggat, hambatan | Tidak menerima pekerjaan sendiri; kewenangan pemeriksaan tidak membuka semua data |
| Ketua/Sekretaris/Sekjend sesuai pemetaan jabatan | Persetujuan, tata kelola, laporan, akses khusus | Tindakan sensitif tercatat; jabatan dan akun harus dipetakan secara resmi |
| Editor dan penyetuju CMS | Menulis, menerjemahkan, meninjau, menerbitkan | Hanya konten dan tindakan editorial yang menjadi kewenangannya |
| Penanggung jawab layanan | Triage, tindak lanjut, bukti dan penutupan kasus | Akses per kasus; catatan internal terpisah dari kabar pelapor |
| Pengelola keuangan dan penyetuju | Anggaran, pengajuan, pembayaran, rekonsiliasi | Pemisahan tugas dan batas nominal yang ditetapkan KPI |
| Auditor | Penelusuran bukti, transaksi, kejadian, dan temuan | Tidak mengubah transaksi atau mengaudit transaksi buatannya sendiri |
| Pengurus keluar/masuk | Menyerahkan dan menerima pekerjaan serta akses | Akses historis tidak diwariskan tanpa pemeriksaan |
| Administrator/pengembang | Konfigurasi dan pengoperasian sesuai mandat | Akses teknis tidak otomatis memberikan hak membaca data bisnis sensitif |

Keputusan Q03 menetapkan Admin Sistem dipegang Ketua dan Sekretaris. Pemetaan istilah Sekretaris/Sekjend, akun, jabatan, dan izin rinci harus mengikuti struktur yang disahkan KPI; tabel ini bukan daftar role teknis final. KPI menetapkan kebijakan bisnis dan menerima hasil UAT. Dar Dev menerjemahkan kebutuhan menjadi desain, implementasi, pengujian, serta dokumentasi.

## 4. Ruang lingkup dan prioritas

Seluruh 113 layar dipertahankan sebagai baseline cakupan. Jumlah layar tidak mengharuskan 113 halaman atau URL terpisah; beberapa dapat berupa detail, panel, atau langkah dalam alur yang sama.

| Kelompok | ID layar | Jumlah | Cakupan |
|---|---|---:|---|
| Publik | P01–P15 | 15 | Profil, struktur, program, publikasi, repository, statistik, transparansi, aspirasi, tracking, pencarian, preferensi |
| Fondasi dan administrasi | A01–A16 | 16 | Login/MFA, akun, sesi, organisasi, izin, periode, akses khusus/darurat, audit, konfigurasi, retensi, backup |
| Workspace | W01–W05 | 5 | Dashboard, My Workspace, Action Required, pencarian internal, notifikasi |
| Tugas | T01–T11 | 11 | Daftar/kanban, penugasan, progres, bukti, review, perpanjangan, dependensi, template, beban kerja, arsip |
| Rapat | M01–M07 | 7 | Kalender, agenda, kehadiran, notulen, voting, tindak lanjut, arsip |
| Dokumen | F01–F06 | 6 | Pustaka, unggah/pemeriksaan, versi, berbagi, klasifikasi, arsip |
| Pengetahuan | K01–K04 | 4 | SOP, sumber, review, sitasi, penelusuran pengetahuan |
| CMS | C01–C07 | 7 | Editorial bilingual, review, persetujuan, penerbitan dan aset |
| Layanan dan komunikasi | S01–S09 | 9 | Formulir, aduan, kasus, pengumuman, kontak dan bukti |
| Keuangan | B01–B09 | 9 | Anggaran, sumber dana, klaim, transaksi, pembayaran, rekonsiliasi, laporan, audit |
| Notifikasi | N01–N04 | 4 | Preferensi, siaran, template, pemantauan pengiriman |
| Evaluasi | E01–E08 | 8 | Laporan, perbandingan, koreksi, siklus, capaian, evaluasi, kalibrasi, sanggah |
| Handover | H01–H06 | 6 | Arsip, paket, penerimaan, panduan, tanggung jawab, peralihan akses |
| AI | I01–I06 | 6 | Tanya jawab, kajian, usulan tindakan, riwayat, registri model/prompt, tata kelola |
| **Total** | | **113** | |

Untuk PRD ini, **P0** berarti kontrol yang wajib ada sebelum fitur terkait digunakan: izin, klasifikasi, persetujuan, audit, integritas data, dan pemulihan. **P1** berarti fungsi bisnis dalam cakupan yang wajib dipetakan ke fase. **P2** hanya boleh digunakan untuk penundaan yang disetujui tertulis; PRD ini tidak memindahkan fitur ke P2 secara otomatis.

Di luar cakupan baseline: aplikasi mobile native, pembayaran bank otomatis, migrasi data historis dalam volume yang belum disepakati, pelatihan/fine-tuning AI menggunakan data KPI, dan keputusan organisasi yang dieksekusi AI tanpa konfirmasi manusia. Penambahan integrasi atau perubahan cakupan memerlukan pencatatan dampak dan persetujuan sesuai kontrak.

## 5. Kebutuhan fungsional

Persyaratan FR berikut merangkum seluruh kelompok layar. Batas akses dan aturan keselamatan di setiap baris adalah P0; fungsi bisnisnya P1 kecuali ada perubahan cakupan tertulis.

| ID | Kebutuhan produk | Kriteria penerimaan minimum | Rujukan |
|---|---|---|---|
| FR-01 | Website publik menyediakan profil, struktur aman, program, berita, publikasi, repository, statistik, dan transparansi | Hanya versi approved/published tampil. Anggota dan metode divisi sensitif tidak bocor. Statistik memuat sumber, periode, satuan, dan metode; konten yang belum ada tidak diganti angka buatan | P01–P11, Q06 |
| FR-02 | Pengunjung dapat mencari dan berpindah bahasa ID/EN | Pergantian bahasa menuju varian setara. Terjemahan yang belum tersedia diberi pemberitahuan; draf tidak menjadi fallback. Pencarian tidak membocorkan judul, cuplikan, atau jumlah dokumen privat | P14–P15, Q11 |
| FR-03 | CMS mendukung penulisan, versi, review, persetujuan, penerbitan, penjadwalan, dan pengarsipan konten | Revisi konten terbit tetap menjadi draf sampai disetujui. Publik mempertahankan versi sebelumnya. Asset yang kehilangan izin publik tidak terus disajikan | C01–C07 |
| FR-04 | Login, MFA aplikasi autentikator, pemulihan akun, daftar sesi, dan pencabutan sesi tersedia | MFA wajib bagi pemegang jabatan sesuai Q07. MFA belum selesai tidak membuka portal. Pesan login/reset tidak mengungkap keberadaan akun. Sesi dicabut kehilangan akses pada permintaan berikutnya | A01–A04, Q07 |
| FR-05 | KPI mengelola organisasi, jabatan, keanggotaan, periode, role, grant sementara, dan akses darurat | Perubahan memiliki alasan, pemberi keputusan, waktu berlaku, dan riwayat. Grant kedaluwarsa ditolak. Admin teknis tidak memperoleh izin bisnis otomatis. Akses darurat memiliki expiry dan review setelah kejadian | A05–A10, Q03, Q27 |
| FR-06 | Workspace menyajikan pekerjaan pengguna dan antrean tindakan | Hanya objek yang diizinkan tampil. Membaca notifikasi tidak menyelesaikan tindakan. Pencarian internal mengecek izin dan periode sebelum mengembalikan metadata | W01–W05 |
| FR-07 | Pengurus mengelola tugas, penanggung jawab, progres, hambatan, prioritas, dan tenggat | Progres 100% belum berarti diterima. Overdue menjadi penanda terpisah dari status kerja; alasan diwajibkan sesuai kebijakan. Perubahan tenggat/penanggung jawab mengikuti permohonan yang berwenang | T01–T04, T07, Q05 |
| FR-08 | Penyelesaian tugas memakai bukti dan review manusia | Bukti wajib harus tersedia dan lolos pemeriksaan. Pelaksana tidak menerima bukti sendiri. Reviewer menilai versi tertentu; bukti berubah membuat review lama tidak sah. Kanban tidak melewati aturan tersebut | T05–T06, Q09 |
| FR-09 | Tugas mendukung subtugas, dependensi, template berulang, beban kerja, pembatalan, dan arsip | Selesainya subtugas hanya membuat induk siap diajukan. Dependensi terlarang ditolak. Revisi template mempertahankan instance lama. Pembatalan beralasan dan tidak menghapus bukti/histori | T08–T11, Q04 |
| FR-10 | Dokumen memiliki klasifikasi, versi, pemeriksaan unggahan, izin baca/unduh, dan berbagi berbatas waktu | Batas 25 MB/file; .exe/.sh ditolak; allowlist lengkap masih perlu ditetapkan. File checking/quarantine belum dapat digunakan. Kegagalan versi baru tidak mengganti versi aktif. Pencabutan izin berlaku pada akses berikutnya | F01–F06, Q10 |
| FR-11 | Rapat mencakup kalender Kairo, agenda, kehadiran, notulen, keputusan, voting, dan tindak lanjut | Jadwal valid dan konflik terlihat. Notulen final terkunci; pembukaan ulang menghasilkan riwayat/versi. Daftar pemilih tersimpan, pilihan individu rahasia, satu pemilih satu suara per putaran. Keputusan dapat ditautkan ke tugas | M01–M07, Q08, Q18 |
| FR-12 | Publik dapat mengirim aspirasi anonim dan melacak dengan token | Retry kiriman yang sama tidak menggandakan kasus. Token invalid tidak mengungkap data. Pelapor hanya melihat pembaruan yang aman; catatan internal dan identitas penangan tidak bocor tanpa kebijakan. SLA tidak dijanjikan sebelum ditetapkan | P12–P13, Q12 |
| FR-13 | Formulir dan kasus dikelola dari penerimaan sampai penutupan/pembukaan ulang | Jawaban terikat versi formulir. Form tidak dapat menulis bebas ke tabel. Akses per kasus, perubahan tercatat, bukti sengketa/audit tidak terhapus. Pembaruan pelapor dipratinjau; penutupan disetujui dan reopen beralasan | S01–S04, S07–S09 |
| FR-14 | Pengumuman, kontak kelembagaan, dan notifikasi memiliki target, preferensi, template serta status pengiriman | Penerima dipratinjau. Pesan wajib tidak dapat dimatikan. Retry tidak menggandakan akibat bisnis. Pratinjau tidak memuat isi rahasia. Kontak mengikuti Q16: nama, jabatan, kontak resmi, tanpa nomor HP pribadi | S05–S06, N01–N04, Q16 |
| FR-15 | Knowledge base memelihara SOP, taksonomi, sumber, sitasi, dan review | Pengetahuan merujuk sumber/versi; sumber berubah atau tidak tersedia ditandai. Hasil pencarian dan sitasi tidak membocorkan metadata setelah izin hilang | K01–K04, W04 |
| FR-16 | Keuangan mencakup anggaran, sumber dana, pengajuan/uang muka, persetujuan, pembayaran, rekonsiliasi, dan audit | Sisa anggaran diperiksa. Dana terikat mengikuti peruntukan. Pembayaran besar memerlukan dua penyetuju sesuai ambang KPI. Pemisahan tugas diberlakukan. Transaksi dibukukan dikoreksi lewat penyesuaian; rekening tersamar; selisih memiliki pemilik | B01–B09, Q19–Q25 |
| FR-17 | Evaluasi memiliki siklus, indikator, bobot, bukti capaian, penilaian, kalibrasi, koreksi dan sanggah | Formula/versi dapat ditelusuri. Missing data berbeda dari nol. Nilai asli tidak tertimpa. Konflik kepentingan ditolak. Perbandingan lintas divisi hanya Ketua/Sekjend. Formula yang belum disahkan tidak menghasilkan skor resmi | E01–E08, Q02, Q13 |
| FR-18 | Handover jabatan mencatat paket, tanggung jawab berjalan, penerimaan per item, dan peralihan akses | Item penting harus lengkap; outstanding memiliki pemilik. Pengurus masuk dapat meminta klarifikasi. Akses lama dicabut mengikuti transisi yang sah; arsip lama tetap berizin. Periode tertutup hanya dikoreksi lewat proses resmi | H01–H06, Q14, Q27 |
| FR-19 | Asisten AI melakukan retrieval, tanya jawab, kajian, dan menyusun usulan tindakan | Hanya sumber Umum/Internal yang juga boleh diakses pengguna dapat dikirim. Data Terbatas/Rahasia/Sangat Rahasia ditolak sebelum retrieval/pengiriman. Jawaban bersumber, berlabel usulan, dan menyatakan bila bukti tidak cukup | I01–I02, Q15 |
| FR-20 | Tindakan dan penggunaan AI dapat ditinjau serta diaudit | Pengguna melihat target, perubahan, dan konsekuensi sebelum konfirmasi. Server mengecek ulang izin serta versi saat eksekusi; proposal berubah perlu review baru. Model/prompt berversi, riwayat berizin, dan kebijakan retensi berlaku. AI hanya menandai kejanggalan, tidak menyimpulkan pelanggaran | I03–I06, Q28 |
| FR-21 | Administrasi menyediakan audit, konfigurasi berversi, kebijakan persetujuan/retensi, dan backup | Kejadian bisnis/keamanan dapat ditelusuri; audit tidak dapat diedit lewat aplikasi. Perubahan konfigurasi beralasan dan mengikuti persetujuan. Data dalam audit/sengketa ditahan. Pemulihan backup diuji dan memiliki bukti | A11–A16, Q26 |

## 6. Alur pengguna utama

1. **Publikasi:** editor membuat draf ID/EN → reviewer memeriksa versi → penyetuju mengesahkan → versi terbit/jadwal berjalan → publik menerima proyeksi aman. Revisi berikutnya tidak mengganti versi publik sebelum disetujui.
2. **Tugas:** koordinator menugaskan → pelaksana memperbarui progres → mengunggah bukti → mengajukan selesai → reviewer menerima atau meminta revisi → histori dan laporan diperbarui. Bukti gagal pemeriksaan menghentikan pengajuan.
3. **Aspirasi:** pelapor mengisi formulir → meninjau → mengirim → menerima token → petugas melakukan triage → memberikan pembaruan aman → penutupan melalui persetujuan. Gangguan jaringan tidak membuat kiriman ganda.
4. **Rapat:** penyelenggara menjadwalkan → peserta mengonfirmasi → notulis merekam → pemilih yang sah memberikan suara rahasia → notulen difinalisasi → keputusan ditindaklanjuti sebagai tugas.
5. **Keuangan:** pengaju memilih anggaran/sumber dana → mengirim bukti → penyetuju memeriksa → petugas berwenang mencatat pembayaran → rekonsiliasi → laporan/audit. Transisi langsung dari pengajuan ke pembayaran tanpa persetujuan ditolak.
6. **Evaluasi:** KPI menetapkan siklus dan formula → pengurus mencatat capaian → evaluator meninjau bukti → kalibrasi tercatat → hasil diterbitkan → sanggah diputuskan oleh kewenangan yang sesuai.
7. **AI:** pengguna bertanya → sistem memeriksa sumber yang layak dan izin → AI memberi jawaban dengan sitasi → bila ada usulan perubahan, manusia meninjau → izin/versi diperiksa ulang → eksekusi dan audit.
8. **Pergantian jabatan:** pengurus keluar menyusun paket → penerima memeriksa setiap item → kewajiban berjalan memiliki penerus → aktivasi/pencabutan akses terjadwal → outstanding tetap terlihat sampai diselesaikan.

Nama status dalam uraian ini menjelaskan perilaku produk. Enum database dan transisi rinci harus direkonsiliasi sebelum implementasi agar istilah seperti “selesai”, “diajukan”, dan “diterima” tidak digunakan dengan arti berbeda.

## 7. Aturan data, keamanan, dan AI

| ID | Ketentuan wajib | Pembuktian sebelum rilis |
|---|---|---|
| GOV-01 | Database PostgreSQL/Supabase dibuat dan dimiliki langsung oleh KPI; akses pengembang minimum, individual, sementara, dan dapat dicabut | KPI memegang owner; daftar akses tersedia; pencabutan dan rotasi kredensial diuji sesuai prosedur |
| GOV-02 | Izin mengikuti akun/sesi, jabatan aktif, divisi, periode, klasifikasi, grant, dan aksi | Uji allow/deny mencakup baca, tulis, unduh, ekspor, pencarian, notifikasi, serta AI; menyembunyikan tombol saja tidak cukup |
| GOV-03 | Lima klasifikasi: Umum, Internal, Terbatas, Rahasia, Sangat Rahasia | Klasifikasi terlihat pada titik keputusan; promosi menjadi publik memerlukan proses yang sah; kategori yang tidak dikenal ditolak |
| GOV-04 | Data KPI dilarang digunakan untuk pelatihan model AI | Konfigurasi dan ketentuan penyedia yang disetujui terdokumentasi; jalur prompt, retrieval, log, dan retensi ditinjau; larangan tidak hanya berupa instruksi prompt |
| GOV-05 | AI produk hanya menerima Umum/Internal sesuai izin pengguna; penggunaan penyedia/alat pihak ketiga mengikuti persetujuan KPI | Register penyedia, lokasi pemrosesan, tujuan, retensi, dan akses tersedia; fitur tidak diaktifkan dengan penyedia yang belum disetujui |
| GOV-06 | Data pengembangan/pengujian berupa data sintetis berlabel TEST; data produksi tidak disalin bebas | Lingkungan terpisah; seed dan screenshot uji tidak memuat data institusi nyata atau kredensial |
| GOV-07 | Kejadian sensitif tercatat dan log operasional meminimalkan data | Audit memuat actor, waktu, aksi, objek, hasil, alasan/versi relevan; rahasia, isi kasus, token, dan prompt internal tidak bocor ke log umum |
| GOV-08 | Standar yang dirangkum repositori: TLS 1.3, enkripsi at-rest AES-256, pelaporan insiden tertulis maksimal 2×24 jam | Bukti konfigurasi penyedia dan aplikasi diverifikasi terhadap naskah kontrak; runbook, penanggung jawab, dan jalur pelaporan diuji |
| GOV-09 | Penyerahan hasil mencakup kode, repositori, database, migrasi, konfigurasi, dokumentasi, dan hak sesuai PHHP; tanpa backdoor | Inventaris serah terima diperiksa KPI; tidak ada akun tersembunyi, bypass, kredensial pengembang yang tertinggal, atau ketergantungan akun pribadi |

Kerahasiaan dan larangan penggunaan data mengikuti PPD/NDA yang berlaku. PRD ini tidak menetapkan masa retensi atau penafsiran pasal tambahan yang tidak dapat diverifikasi dari naskah asli.

## 8. Kebutuhan data dan integrasi

Kamus pada `DATABASE_ENTITIES` memuat 61 entitas konseptual. Daftar tersebut menjadi titik awal pemetaan kebutuhan; jumlah tabel fisik dapat berubah setelah normalisasi dan review tanpa menghapus kemampuan produk.

Setiap catatan bisnis yang relevan harus memiliki identitas stabil, konteks periode/divisi, status, klasifikasi, versi, sumber, dan histori. Relasi bukti tugas, dokumen, keputusan, transaksi, evaluasi, dan handover harus tetap dapat ditelusuri setelah pengarsipan. Penghapusan mengikuti retensi dan penahanan audit/sengketa.

Perubahan status, bukti, persetujuan, dan pencatatan efeknya harus konsisten. Permintaan ulang tidak boleh menggandakan kiriman atau pembayaran. Perubahan bersamaan harus menolak versi usang dan memberi jalan pemulihan yang jelas. Token tracking dan kredensial diperlakukan sebagai rahasia; UI tidak mengungkap nilai internal yang tidak diperlukan.

| Integrasi | Status kebutuhan |
|---|---|
| PostgreSQL/Supabase | Baseline kepemilikan dan penyimpanan; konfigurasi, region, kapasitas, dan operasional perlu disahkan |
| Autentikasi, penyimpanan file, pemindaian, backup | Kemampuan wajib; layanan dan detail implementasi ditetapkan dalam desain teknis |
| Domain .org | Ringkasan kontrak mencakup biaya 2 tahun; nama domain serta proses penguasaan akun dikonfirmasi KPI |
| Hosting, email, monitoring | Pilihan penyedia, lokasi pemrosesan, biaya, dan pemilik operasional perlu diputuskan |
| Penyedia AI | Tidak boleh aktif sebelum persetujuan, pembatasan pelatihan, retensi, dan klasifikasi data terpenuhi |

Rencana Next.js/TypeScript, modular monolith, Supabase Auth, RLS, serta REST berversi di `rencana-pembangunan/00-KERANGKA-INDUK.md` masih berstatus usulan ADR. PRD tidak mengubahnya menjadi keputusan teknis final. Validasi izin server dan kendali KPI tetap menjadi kebutuhan produk apa pun stack yang dipilih.

## 9. UX, visual, dan aksesibilitas

Visual mengikuti implementasi terbaru `styles.css`: canvas `#F3ECDD`, tint `#F8F3E8`, surface putih, teks utama `#2A2823`, dan aksen KPI red `#C4161C`. Font utama Sora dengan fallback sistem. Hierarki, keterbacaan, kontrol familiar, serta lapisan navigasi mengikuti arah adaptasi Apple HIG; bukan klaim menggunakan komponen native Apple.

Website publik mengutamakan orientasi, publikasi, dan layanan. Portal mengutamakan workspace, konteks periode/divisi, status, serta tindakan. Warna selalu disertai label; klasifikasi dan overdue dapat dipahami tanpa membedakan warna.

Setiap fitur menyediakan keadaan memuat, kosong, gagal, berhasil, izin ditolak/kedaluwarsa, dan konflik versi bila relevan. Aksi sensitif memakai label jelas seperti “Terima hasil pekerjaan”, “Terbitkan versi ini”, atau “Cabut akses”. Pemulihan dari gangguan jaringan tidak mengorbankan izin atau menggandakan transaksi.

Target penerimaan UX: navigasi keyboard, fokus terlihat, dialog mengelola fokus, label formulir dan error terhubung, status dapat dibaca teknologi bantu, dukungan zoom 200%, serta penggunaan pada lebar 320 px tanpa overflow halaman. Tabel perbandingan boleh memiliki scroll lokal. Uji dilakukan pada mode terang/gelap dan preferensi reduced motion; dukungan reduced transparency harus menghasilkan perubahan yang bermakna bila material transparan digunakan.

Target kontras dari rancangan: 4,5:1 untuk teks normal, 3:1 untuk teks besar dan komponen penting. Nilai ini adalah kriteria pengujian, bukan klaim kelulusan saat ini. Waktu organisasi memakai `Africa/Cairo`, termasuk perubahan offset musiman; label zona tidak boleh dipatok selalu EET.

## 10. Kebutuhan nonfungsional dan pengukuran

| ID | Kebutuhan | Kriteria penerimaan/status |
|---|---|---|
| NFR-01 | Keamanan akses | Seluruh skenario negatif yang disepakati lulus; tidak ada bypass lewat API, storage, pencarian, notifikasi, atau AI |
| NFR-02 | Integritas | Retry, konflik versi, transisi tidak sah, dan kegagalan parsial diuji pada alur tulis kritis |
| NFR-03 | Pemulihan | Backup dan restore diuji; RPO, RTO, interval, retensi, dan penanggung jawab masih perlu ditetapkan |
| NFR-04 | Performa | Latensi p95, jumlah pengguna bersamaan, ukuran dataset dan batas waktu pencarian/unggahan ditetapkan sebelum uji penerimaan; tidak mengarang target kapasitas |
| NFR-05 | Ketersediaan | Target uptime, jam dukungan, kanal insiden, dan batas respons operasional masih perlu disepakati; dibedakan dari tenggat pelaporan insiden kontraktual |
| NFR-06 | Aksesibilitas | Skenario keyboard, 320 px, zoom 200%, kontras, tema, dan reduced motion pada alur inti lulus |
| NFR-07 | Observabilitas | Kesalahan mempunyai correlation ID; status pekerjaan latar/pengiriman dapat ditelusuri tanpa memaparkan data sensitif |
| NFR-08 | Portabilitas | Kode, migrasi, dump, konfigurasi terdokumentasi, dan panduan pemulihan dapat digunakan KPI tanpa akun pribadi pengembang |

Metrik produk yang diusulkan untuk baseline setelah peluncuran: keberhasilan kirim dan tracking aspirasi, waktu pengajuan sampai keputusan reviewer, proporsi tugas dengan bukti diterima, waktu draf sampai publikasi, antrean kasus berdasarkan umur, dan kelengkapan handover. KPI menetapkan target setelah baseline tersedia. Pengukuran menggunakan metadata minimum; isi aduan, dokumen, dan prompt AI tidak dikirim ke analitik umum.

## 11. Rencana empat fase

Tabel berikut mengikuti ringkasan PKS terbaru dalam `04-TAHAPAN-CAKUPAN.md` dan `CONTRACT_PHASES`. Waktu adalah minggu relatif dalam durasi satu bulan/empat minggu. Tanggal mulai dan akhir pasti perlu dicocokkan dengan naskah kontrak; satu bulan kalender tidak selalu sama dengan 28 hari.

| Fase | Hasil yang harus tersedia | Dependensi dan gerbang penerimaan |
|---|---|---|
| 1 · Minggu 1 | Website publik P01–P15, CMS C01–C07, aspirasi dan tracking | Fondasi akun/MFA editor, izin, audit, aset aman, serta kemampuan minimal penerimaan/penanganan aduan dibangun lebih awal. Uji publikasi bilingual dan aduan end-to-end lulus; draf/catatan internal tidak bocor |
| 2 · Minggu 2 | Portal A01–A04, workspace W01–W05, tugas T01–T11 | Role/periode dan pengelolaan bukti dokumen harus tersedia sebagai dependensi meski kelompok operasional lengkap masuk fase 3. Uji tugas sampai review, konflik versi, dan pencabutan sesi lulus |
| 3 · Minggu 3 | Rapat M01–M07, dokumen F01–F06, layanan/komunikasi S01–S06 | Uji voting rahasia, finalisasi notulen, akses/versi dokumen, triage, dan pembaruan pelapor lulus |
| 4 · Minggu 4 | Knowledge K01–K04, evaluasi E01–E03, handover H01–H03, AI I01–I03, hardening, UAT dan serah terima hasil | Sumber AI telah berizin; uji kebocoran dan konfirmasi tindakan lulus; restore teruji; KPI menerima dokumentasi, aset, kode, database dan BAST |

**Gap pemetaan fase:** tabel kontraktual ringkas memetakan 74 dari 113 ID layar secara eksplisit. Sebanyak 39 ID belum tercantum: A05–A16, S07–S09, B01–B09, N01–N04, E04–E08, H04–H06, dan I04–I06. Layar-layar ini tetap masuk baseline dan harus diberi fase/pemilik melalui rekonsiliasi ruang lingkup. Sebagian merupakan dependensi kritis yang harus tersedia lebih awal.

Usulan penempatan untuk review: A05–A11 bertahap pada fase 1–2; A12–A16, S07–S09, B01–B09, N01–N04 dan E04–E08 pada fase 3; H04–H06 dan I04–I06 pada fase 4, dengan peralihan akses dasar H06 tersedia sejak fase 2. Ini belum persetujuan perubahan kontrak atau jaminan kapasitas pengerjaan.

Rencana pembangunan lama menunda P12–P13 hingga fase 3. PRD mempertahankan baseline terbaru yang menempatkannya di fase 1. Bila penanganan aman belum siap, pengumpulan aduan tidak boleh dibuka; perubahan waktu harus disepakati tertulis, bukan digeser diam-diam.

## 12. Kriteria UAT dan rilis

| ID UAT | Skenario | Hasil wajib | Requirement |
|---|---|---|---|
| UAT-01 | Publik membuka konten yang sedang direvisi dan varian English yang belum tersedia | Versi approved tetap tampil; draf tidak bocor; pemberitahuan terjemahan sesuai | FR-01–03 |
| UAT-02 | Pengguna belum menyelesaikan MFA atau sesinya dicabut memanggil endpoint internal | Akses ditolak tanpa data | FR-04–05, GOV-02 |
| UAT-03 | Pelaksana mengisi progres 100%, menggeser kanban, lalu mencoba menerima bukti sendiri | Tugas belum diterima; bypass review dan self-approval ditolak | FR-07–09 |
| UAT-04 | Bukti berubah saat reviewer membuka versi lama | Persetujuan lama ditolak; versi baru harus diperiksa | FR-08, NFR-02 |
| UAT-05 | File 26 MB, executable, file karantina, atau tautan dengan izin dicabut digunakan | Operasi ditolak sesuai sebab; versi sah sebelumnya tetap tersedia | FR-10 |
| UAT-06 | Voting ganda, pembacaan pilihan individu, atau edit langsung notulen final dicoba | Ditolak; histori dan aturan kerahasiaan terjaga | FR-11 |
| UAT-07 | Pelapor mengirim ulang akibat koneksi putus lalu membuka tracking | Satu kiriman; pembaruan aman; tidak ada catatan internal | FR-12–13 |
| UAT-08 | Pengurus divisi/periode lain mencari kasus atau membuka notifikasi lama | Judul, cuplikan, hitungan sensitif, dan isi tidak bocor | FR-05–06, FR-14–15 |
| UAT-09 | Pengaju mencoba membayar tanpa persetujuan atau mengubah transaksi dibukukan | Ditolak; koreksi hanya lewat alur berizin dan berjejak | FR-16 |
| UAT-10 | Capaian belum diisi, evaluator konflik kepentingan, atau koreksi nilai diajukan | Missing dibedakan dari nol; konflik ditolak; nilai asli dipertahankan | FR-17 |
| UAT-11 | Pengurus baru menerima paket yang masih memiliki outstanding | Outstanding dan pemiliknya terlihat; akses arsip tidak diwariskan bebas | FR-18 |
| UAT-12 | AI diminta membaca data Terbatas atau mengeksekusi proposal setelah izin/versi berubah | Sumber terlarang tidak dikirim; eksekusi ditolak; perlu review baru | FR-19–20, GOV-04–05 |
| UAT-13 | Alur inti dijalankan dengan keyboard, layar 320 px, zoom 200%, tema gelap | Fungsi tetap dapat digunakan; fokus, error, dan konteks terbaca | NFR-06 |
| UAT-14 | KPI memulihkan backup dan menjalankan sistem setelah akses pengembang dicabut | Pemulihan terbukti dan KPI tetap memegang kendali | GOV-01, GOV-09, NFR-03/08 |

Sebelum rilis: requirement dalam fase memiliki bukti uji; defect kritis/tinggi terkait akses, integritas, dan alur inti selesai; konfigurasi wajib telah ditetapkan; keputusan terbuka yang memblokir fitur ditutup; runbook insiden/backup tersedia; reviewer KPI menerima hasil UAT. Laporan harus membedakan skenario lulus, gagal, dan belum diuji. Tidak ada klaim kepatuhan atau keamanan hanya berdasarkan tersedianya kode.

## 13. Keputusan terbuka

Persetujuan Q01–Q28 tetap berlaku. Daftar berikut meminta nilai atau rincian yang belum tercatat, bukan mengulang persetujuan prinsip. ID OD-PRD adalah ID lokal dokumen ini.

| ID | Rincian yang harus diputuskan | Pemilik | Dampak bila belum ditentukan |
|---|---|---|---|
| OD-PRD-01 | Mapping akun/jabatan, peran bisnis, reviewer pengganti dan konflik kepentingan | KPI | Penugasan dan persetujuan terkait belum dapat diaktifkan |
| OD-PRD-02 | Durasi sesi, interval pemeriksaan, rate limit dan pemulihan MFA | KPI + lead teknis | Autentikasi belum siap produksi |
| OD-PRD-03 | Quorum, putaran, koreksi, dan kewenangan finalisasi voting | KPI | Voting resmi belum dapat diluncurkan |
| OD-PRD-04 | Allowlist file lengkap, retensi per jenis, pengecualian dan legal hold | KPI + lead teknis | Jenis file belum disetujui ditolak; penghapusan otomatis belum diaktifkan |
| OD-PRD-05 | SLA kasus, token expiry/recovery, isi pemberitahuan privasi dan prosedur anonim | KPI | Janji layanan/pemulihan belum ditampilkan; layanan memerlukan policy aman sebelum aktif |
| OD-PRD-06 | Indikator, bobot, rubrik, otoritas koreksi dan sanggah | KPI | Skor resmi belum dapat dihitung |
| OD-PRD-07 | Tanggal periode keuangan, mata uang, kurs, ambang nominal, dua penyetuju, batas uang muka, reopen periode | KPI | Transaksi yang membutuhkan nilai ini diblokir |
| OD-PRD-08 | Penyedia AI/alat bantu, region, retensi, tanpa pelatihan, model/prompt yang disetujui | KPI + lead teknis | Integrasi AI terkait belum dapat diaktifkan |
| OD-PRD-09 | Stack/ADR, penyedia cloud, paket biaya dan penanggung biaya pascaserah terima | KPI + lead teknis | Pengadaan dan rancangan teknis belum final |
| OD-PRD-10 | RPO/RTO, uptime, target performa, volume data, saluran insiden | KPI + lead teknis | Uji operasional belum memiliki ambang penerimaan final |
| OD-PRD-11 | Logo/aset asli, konten resmi ID/EN, domain .org | KPI | Halaman terkait memakai status belum tersedia; data/foto tidak dikarang |
| OD-PRD-12 | Pemetaan 39 layar tambahan, kapasitas tim, urutan dependensi dan tanggal kontraktual | KPI + Dar Dev | Komitmen kelengkapan empat minggu belum dapat divalidasi |

## 14. Risiko dan rekonsiliasi sumber

| Risiko/konflik | Dampak | Penanganan dalam PRD |
|---|---|---|
| 113 layar dan kontrol lintas modul dalam empat minggu | Fitur akhir dan pengujian berpotensi tidak selesai | Petakan kapasitas dan dependensi; penundaan memerlukan perubahan tertulis; kontrol P0 tidak dipotong |
| Ringkasan terbaru menyebut 3 bulan pemeliharaan, rencana 15 September masih 30 hari | Ekspektasi serah terima dan dukungan berbeda | Gunakan baseline pembaruan 17 September: 3 bulan; cocokkan dengan naskah asli |
| Aduan fase 1, penanganan lengkap fase 3 pada rencana lama | Pengumpulan kasus tanpa tindak lanjut yang siap | Bangun irisan penanganan aman pada fase 1 atau sepakati perubahan jadwal |
| Tabel kontraktual hanya merinci 74 layar | 39 layar berisiko hilang dari backlog | Pertahankan semua ID dan selesaikan OD-PRD-12 |
| Token desain lama biru/font sistem, implementasi baru beige/merah/Sora | UI yang dibangun tidak konsisten | Gunakan `styles.css` dan keputusan Q17 sebagai acuan visual terbaru |
| README/komentar lama menyebut jumlah sumber/contoh yang lebih kecil | Estimasi dan klaim kelengkapan menyesatkan | Gunakan array aktual: 113 layar, 61 entitas, 27 entri sumber, 15 contoh, 11 alur, 28 keputusan |
| Ringkasan kontrak dan dokumen sumber tidak sama dengan naskah asli | Salah kutip kewajiban atau status persetujuan | Jangan menganggap semua dokumen asli telah ditelaah; verifikasi sebelum keputusan kontraktual |
| Nilai konfigurasi belum tersedia tetapi prinsip sudah disetujui | Developer mengisi ambang/rumus dengan tebakan | Catat sebagai keputusan terbuka; operasi bergantung nilai tersebut tidak diaktifkan |

## 15. Serah terima dan pemeliharaan

Serah terima hasil pengembangan berbeda dari modul handover jabatan. KPI menerima repositori dan source code, database/dump yang dapat dipulihkan, migrasi, konfigurasi tanpa membocorkan secret, inventaris akun dan aset, daftar dependensi/lisensi, panduan pengguna/admin/editor, bukti UAT, runbook operasi/insiden/backup, serta daftar masalah tersisa yang disepakati.

Dar Dev melakukan alih pengetahuan dan pendampingan pengkaderan personel sesuai ringkasan kontrak. Jumlah/durasi sesi, kontak dukungan, dan SLA penanganan perlu ditentukan. Kredensial dan akses pengembang ditinjau, dicabut atau dibatasi sesuai kebutuhan sah, serta dirotasi menurut prosedur serah terima.

Baseline komersial yang dirangkum repositori: nilai all-in Rp14.200.000, domain .org selama dua tahun, dan pemeliharaan/perbaikan bug tanpa biaya selama tiga bulan setelah serah terima. Fitur baru atau perubahan cakupan dicatat terpisah sesuai mekanisme kontrak.

## 16. Sumber dan jejak versi

Seluruh tautan berikut mengacu pada commit yang ditinjau agar baseline dapat direproduksi.

- [Struktur aplikasi: index.html](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/index.html).
- [Katalog layar, tabel, keputusan, dan ringkasan kontrak: app.js](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/app.js).
- [Desain aktual: styles.css](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/styles.css).
- [Acuan 17 September: 00-MULAI-DI-SINI.md](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/rancangan-ui-ux/00-MULAI-DI-SINI.md).
- [Peta layar: 02-PETA-LAYAR.md](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/rancangan-ui-ux/02-PETA-LAYAR.md).
- [Alur: 03-ALUR-WIREFRAME.md](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/rancangan-ui-ux/03-ALUR-WIREFRAME.md).
- [Tahapan terbaru: 04-TAHAPAN-CAKUPAN.md](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/rancangan-ui-ux/04-TAHAPAN-CAKUPAN.md).
- [Register keputusan Q01–Q28](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/rancangan-ui-ux/06-PERSETUJUAN-28-PERTANYAAN-SITUS.md).
- [Rencana teknis berstatus draf, 15 September](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/rencana-pembangunan/00-KERANGKA-INDUK.md).

| Versi PRD | Tanggal | Perubahan |
|---|---|---|
| 1.0 | 20 September 2026 | Penyusunan baseline produk, 21 kelompok requirement, 14 skenario UAT, aturan tata kelola, empat fase, dan register keputusan terbuka |
