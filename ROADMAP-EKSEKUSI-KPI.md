# Roadmap Eksekusi Website KPI PPMI Mesir

Versi 1.0 · 20 September 2026 · Rencana pelaksanaan berdasarkan PRD v1.0

## 1. Hasil akhir yang dituju

Website dinyatakan siap dipakai ketika pengguna dapat menyelesaikan pekerjaan nyata dari awal sampai akhir, seluruh cakupan rilis sudah terhubung ke backend dan database, izin serta persetujuan ditegakkan, backup dapat dipulihkan, dan KPI mampu mengoperasikannya. Istilah “sempurna” tidak berarti jaminan bebas bug; penerimaan menggunakan bukti uji dan kriteria di dokumen ini.

Baseline mencakup 113 layar dan 61 entitas konseptual pada commit `1c8f42d4ad574146360af82d9b3a19a3c35e9642`. Situs yang ada masih merupakan dokumentasi interaktif. Roadmap ini membangun produk operasional, dengan desain hangat beige, KPI red, dan Sora sebagai acuan visual.

Fase E00–E14 adalah urutan pekerjaan teknis yang diusulkan. Empat fase kontraktual tetap menjadi milestone terpisah; urutan ini tidak otomatis mengubah kontrak atau memperpanjang jadwal. Tidak ada durasi pasti yang dikarang sebelum ukuran task, kapasitas tim, dan keputusan yang memblokir telah diketahui.

## 2. Cara menjalankan roadmap

Setiap fitur dikerjakan sebagai satu alur lengkap: aturan bisnis → skema/migrasi → otorisasi → backend → UI → pengujian → demo penerimaan. Jangan menyelesaikan seluruh tampilan lebih dulu lalu menunda database, izin, dan pengujian ke akhir.

Setiap fase memiliki satu penanggung jawab teknis. KPI menunjuk pemilik keputusan bisnis dan reviewer UAT sesuai bidang. Dependensi boleh dikembangkan bersamaan oleh tim setelah kontrak data dan izin stabil; fase berikutnya tidak boleh memakai dependensi yang belum lulus pemeriksaan terkait.

Status task: Backlog → Ready → In Progress → Review → Verified → Accepted. Task yang tertahan mempunyai alasan, pemilik keputusan, dan tanggal tindak lanjut. “Accepted” berarti hasilnya diterima untuk lingkup task; bukan izin otomatis untuk deployment produksi.

Aturan lintas fase:

- Data KPI tidak digunakan untuk pelatihan AI. AI produk hanya memproses Umum/Internal sesuai izin pengguna dan kebijakan penyedia yang disetujui.
- Database dan akun produksi berada di bawah kendali KPI; pengembang memiliki akses individual, sementara, dan minimum.
- Data nonproduksi berupa data sintetis TEST; secret tidak masuk repositori, screenshot, atau log umum.
- Setiap aksi dilindungi di server dan lapisan data yang sesuai. Menyembunyikan tombol tidak cukup.
- Semua perubahan status penting, izin, persetujuan, dan ekspor tercatat. Retry tidak boleh menggandakan akibat bisnis.
- Bug akses, kehilangan data, atau bypass approval menghalangi aktivasi fitur terkait.
- Detail yang belum diputuskan tidak diisi dengan angka atau kebijakan tebakan.

## 3. Urutan fase

| Fase | Hasil utama | Dependensi | Gerbang selesai |
|---|---|---|---|
| E00 | Baseline, backlog, keputusan, dan kepemilikan | PRD dan sumber | Semua pekerjaan awal memiliki acuan dan pemilik keputusan |
| E01 | Fondasi aplikasi, data, lingkungan, dan CI | E00 untuk keputusan terkait | Aplikasi staging dengan data TEST dapat dibangun, diuji, dan dipulihkan |
| E02 | Akun, MFA, organisasi, izin, periode, dan audit | E01 | Akses sah berhasil; akses tidak sah dan sesi dicabut ditolak |
| E03 | Dokumen dan layanan bersama | E02 | Unggahan, versi, izin file, serta notifikasi dasar bekerja aman |
| E04 | Website publik, CMS, aduan dan tracking minimum | E02–E03 | Editorial dan aduan berjalan end-to-end tanpa kebocoran |
| E05 | Workspace dan manajemen tugas | E02–E03 | Tugas sampai bukti dan penerimaan reviewer berjalan |
| E06 | Rapat, keputusan, voting dan tindak lanjut | E03, E05 | Rapat dapat diselesaikan dan keputusan menjadi tugas |
| E07 | Layanan kasus, komunikasi dan notifikasi lengkap | E04, E03 | Kasus tertangani sampai tutup/reopen; pengiriman dapat dipantau |
| E08 | Anggaran, transaksi, pembayaran dan audit keuangan | E02–E03, kebijakan keuangan | Satu siklus transaksi sampai rekonsiliasi lulus |
| E09 | Evaluasi kinerja dan knowledge base | E05–E06, formula resmi | Nilai dapat ditelusuri dan SOP dapat ditemukan sesuai izin |
| E10 | Handover, konfigurasi, retensi dan operasi admin | E02–E09 | Pergantian pengurus dan kontrol operasi dapat dijalankan |
| E11 | AI berizin dan tata kelolanya | E03, E09; kebijakan AI | Retrieval aman, sumber terlacak, tindakan dikonfirmasi manusia |
| E12 | Uji integrasi, keamanan, performa dan UAT | Semua cakupan rilis | Bukti penerimaan lengkap dan defect penghalang selesai |
| E13 | Pilot, peluncuran produksi dan serah terima | E12, persetujuan rilis KPI | Pengurus bekerja dengan data nyata; operasi dan rollback siap |
| E14 | Pemeliharaan dan stabilisasi | E13/BAST sesuai kontrak | Bug ditangani, pemulihan dipantau, KPI mandiri mengoperasikan sistem |

### E00 · Kunci baseline dan siapkan pekerjaan

**Tujuan:** mengubah PRD menjadi backlog yang dapat dieksekusi tanpa menghapus cakupan yang belum masuk tabel kontrak.

Pekerjaan:

1. Pastikan pekerjaan berada di repositori/checkout KPI yang benar. Workspace tempat PRD ditulis sebelumnya merupakan proyek lain; jangan membangun aplikasi KPI di sana tanpa penataan yang disengaja.
2. Rekam commit baseline, PRD, 113 ID layar, 61 entitas konseptual, dan Q01–Q28. Buat matriks `requirement → layar → task → tes → bukti → fase`.
3. Rekonsiliasi 39 layar yang belum disebut eksplisit pada tabel empat fase. Pertahankan semua ID; perubahan ruang lingkup membutuhkan catatan tertulis.
4. Putuskan ADR yang diperlukan untuk fondasi. Rencana Next.js/TypeScript dan Supabase adalah usulan dalam repositori, belum otomatis keputusan final. Saat implementasi dimulai, verifikasi versi dan dokumentasi resmi stack terpilih.
5. KPI menetapkan owner akun, perwakilan UAT, akses pengembang, kebijakan penyedia, region, biaya operasi, dan data yang boleh dipakai.
6. Pecah setiap kelompok menjadi task yang cukup kecil untuk direview, lengkap dengan acceptance criteria dan dependensi. Estimasi berdasarkan task tersebut, bukan jumlah halaman saja.

**Deliverable:** `docs/prd.md`, `docs/execution-roadmap.md`, `docs/coverage.csv`, `docs/decisions.md`, `docs/backlog.md`, dan keputusan arsitektur. Lokasi tersebut merupakan target di repo aplikasi, belum klaim bahwa file-file itu telah dibuat.

**Syarat lulus:** setiap ID layar memiliki task/fase; semua keputusan yang diperlukan untuk E01 ditetapkan atau jelas memblokir bagian tertentu. Keputusan keuangan/AI boleh diselesaikan menjelang fasenya, tanpa menghambat pekerjaan independen yang sudah siap.

### E01 · Bangun fondasi aplikasi dan data

**Tujuan:** aplikasi dapat dijalankan dan diuji secara berulang dari checkout bersih.

Pekerjaan:

1. Siapkan struktur modul, routing publik/portal, konfigurasi lingkungan, validasi input, penanganan error, dan kontrak API.
2. Buat token desain beige/merah/Sora, shell publik dan portal, navigasi mobile, form, tabel, dialog, toast, loading, empty, error, dan focus state.
3. Siapkan database atas nama KPI; pisahkan lingkungan TEST/staging/produksi dan aksesnya. Skema awal mencakup identitas, organisasi, periode, audit, serta kebutuhan platform. Modul lain menambahkan migrasi bertahap.
4. Terapkan migrasi berversi, seed TEST, UUID/relasi, version checking, transaksi, dan pola retry/idempotency. Jangan menganggap 61 entitas harus persis menjadi 61 tabel fisik.
5. Siapkan CI untuk validasi tipe/lint/build dan tes relevan; rahasia hanya melalui konfigurasi lingkungan yang aman.
6. Siapkan logging teredaksi, correlation ID, health check, backup awal, serta prosedur pemulihan staging.

**Syarat lulus:** instalasi dan migrasi dari nol berhasil, seed jelas bertanda TEST, build dapat direproduksi, error tidak membuka secret, dan backup staging dapat dipulihkan. Preview bukan produk siap pakai.

### E02 · Akun, organisasi, izin, dan audit

**Layar utama:** A01–A11. Peralihan akses dasar H06 mulai di sini.

Pekerjaan:

1. Implementasikan login, MFA TOTP, reset, pemulihan MFA, daftar sesi, dan logout semua perangkat.
2. Implementasikan organisasi, divisi, jabatan, penugasan, role, periode, grant sementara dan akses darurat. Pertahankan jawaban khusus Q03 mengenai Admin Sistem.
3. Bangun matriks izin per aksi dan objek: baca, tulis, review, unduh, ekspor, dan publikasi; periksa divisi, periode, klasifikasi serta masa berlaku akses.
4. Terapkan pemeriksaan server/lapisan data, pemisahan wewenang, audit, dan pencabutan akses. Detail rahasia tidak masuk respons hanya karena UI menyembunyikannya.
5. Buat skenario akun TEST untuk semua peran yang ditetapkan, termasuk nonaktif, masa jabatan habis, akses sementara, dan konflik kepentingan.

**Syarat lulus:** UAT-02 dan skenario akses UAT-08 lulus untuk fondasi; sesi dicabut ditolak pada permintaan berikutnya; role teknis tidak otomatis membuka data rahasia; grant kedaluwarsa tidak berlaku. Bukti mencakup pengujian langsung endpoint, bukan hanya klik UI.

### E03 · Dokumen dan layanan bersama

**Layar utama:** F01–F06. Notifikasi dasar W05/N04 dan retensi operasional mulai di sini.

Pekerjaan:

1. Bangun private storage, unggah, validasi tipe/ukuran, pemeriksaan file, quarantine, dan status tersedia. Batas baseline 25 MB; .exe/.sh ditolak; allowlist harus ditetapkan.
2. Implementasikan klasifikasi, versi, metadata, berbagi berbatas waktu, izin baca/unduh, pencabutan, arsip, dan audit akses sesuai kebijakan.
3. Pastikan versi baru yang gagal tidak menggantikan versi aktif. File yang menjadi bukti tidak hilang ketika objek bisnis diarsipkan.
4. Siapkan pekerjaan latar untuk pemeriksaan, pengiriman, dan expiry. Retry memiliki batas serta status kegagalan yang bisa ditindaklanjuti.
5. Siapkan antrean notifikasi internal dari event bisnis; isi sensitif tidak muncul dalam preview. Sumber kebenaran tetap objek bisnis, bukan notifikasi.

**Syarat lulus:** UAT-05 lulus; URL/akses langsung tidak melewati izin; file belum tersedia tidak dapat menjadi bukti; grant dicabut berhenti berlaku; retry pekerjaan tidak menggandakan dampak.

### E04 · Website publik, CMS, dan layanan aspirasi minimum

**Layar utama:** P01–P15, C01–C07. Irisan S03/S04/S07 dibutuhkan untuk layanan aduan sejak fase ini.

Pekerjaan:

1. Bangun halaman publik sesuai katalog, navigasi, pencarian, preferensi, dan ID/EN. Konten kosong memiliki state yang jujur, tanpa angka, foto, atau testimoni karangan.
2. Bangun editorial: draf, revisi, review, approve, publish, jadwal, arsip, dan aset. Publik membaca proyeksi aman dari versi yang disetujui.
3. Terapkan metadata halaman, indeks pencarian publik, tautan varian bahasa, halaman tidak ditemukan, serta aksesibilitas dasar.
4. Bangun formulir aspirasi, perlindungan penyalahgunaan, pengiriman idempotent, token tracking, dan pemisahan catatan internal/pembaruan pelapor.
5. Bangun antrean penanganan minimum, penanggung jawab kasus, dan pratinjau kabar pelapor. Konfirmasi prosedur anonim dan kebijakan token sebelum aktivasi.
6. Masukkan konten resmi yang diserahkan KPI dan uji alur editor serta pelapor bersama pengurus.

**Syarat lulus:** UAT-01 dan UAT-07 lulus; publikasi bilingual dan aspirasi dapat dijalankan sampai hasilnya; petugas dapat menangani aduan masuk. Formulir pengumpulan data tidak dibuka jika penanganan aman belum siap.

**Hubungan kontrak:** keluaran ini memenuhi sasaran fase kontraktual 1 setelah fondasi E01–E03 yang diperlukan tersedia. Menunda aduan ke fase berikutnya memerlukan perubahan jadwal yang disepakati.

### E05 · Workspace dan tugas end-to-end

**Layar utama:** W01–W05, T01–T11. Pencarian lintas modul W04 diperluas ketika modul berikutnya tersedia.

Pekerjaan:

1. Bangun dashboard, My Workspace, Action Required, filter, notifikasi, dan pencarian sesuai izin.
2. Implementasikan penugasan, status, prioritas, progres, hambatan, deadline, overdue, dan permintaan perubahan tenggat/penanggung jawab.
3. Implementasikan bukti, pengajuan selesai, review, revisi, penerimaan, serta larangan self-approval. Perubahan versi membatalkan keputusan atas versi lama.
4. Bangun subtugas, dependency, template berulang, workload, pembatalan dan arsip. Kanban menggunakan aturan transisi backend yang sama dengan form.

**Syarat lulus:** UAT-03–04 lulus; satu tugas dapat dibuat sampai diterima dan masuk laporan; 100% progres tidak otomatis berarti diterima; penanda overdue tidak merusak status kerja; parent tetap memerlukan pemeriksaan manusia.

### E06 · Rapat, voting dan keputusan

**Layar utama:** M01–M07.

Pekerjaan:

1. Kalender menggunakan `Africa/Cairo`, agenda, konflik jadwal, peserta, konfirmasi kehadiran, bahan rapat dan notulen.
2. Voting menggunakan daftar pemilih per putaran, pilihan individu rahasia, quorum dan aturan koreksi yang telah ditetapkan KPI.
3. Kunci notulen final; perubahan resmi menghasilkan versi/riwayat. Buat tugas tindak lanjut dengan tautan ke keputusan dan sumbernya.
4. Bangun arsip rapat, pencarian dan ekspor sesuai izin. Hak melihat hasil agregat tidak otomatis menjadi hak melihat pilihan individu.

**Syarat lulus:** UAT-06 lulus; suara ganda ditolak termasuk pengiriman bersamaan; notulen final tidak dapat ditimpa; keputusan dapat menghasilkan tugas; nama rapat rahasia tidak bocor di kalender umum.

### E07 · Kasus, komunikasi dan notifikasi lengkap

**Layar utama:** S01–S09, N01–N04.

Pekerjaan:

1. Lengkapi pembuat formulir berversi, conditional field, jawaban, ekspor berizin dan antrean penerimaan.
2. Lengkapi triage, penanggung jawab, tingkat urgensi, bukti kasus, pembaruan pelapor, penutupan berpersetujuan dan reopen beralasan.
3. Implementasikan pengumuman terarah, buku kontak resmi, pratinjau penerima, template berversi, preferensi/jam tenang, dan pemantau pengiriman.
4. Hubungkan event tugas, rapat, kasus, dan approval ke notifikasi. Kanal eksternal hanya diaktifkan untuk penyedia dan konten yang disetujui.

**Syarat lulus:** UAT-07–08 lulus pada layanan lengkap; jawaban lama tidak berubah ketika formulir direvisi; catatan internal tidak terkirim sebagai kabar pelapor; bukti sengketa tidak terhapus; kegagalan pengiriman dapat dicoba ulang tanpa siaran ganda.

### E08 · Keuangan dan pertanggungjawaban

**Layar utama:** B01–B09.

Pekerjaan:

1. Kunci periode, mata uang, kurs, ambang nominal, pemisahan tugas, dua penyetuju, dan batas pertanggungjawaban uang muka bersama KPI.
2. Bangun anggaran berversi, sumber dana/peruntukan, pengajuan, klaim, dan uang muka dengan pemeriksaan sisa anggaran.
3. Bangun antrean persetujuan dan pembayaran, bukti, rekonsiliasi, pencatatan selisih, laporan, dan audit keuangan.
4. Terapkan masking rekening, pembatasan field, penyesuaian transaksi dibukukan, dan pembukaan ulang periode melalui persetujuan resmi.

**Syarat lulus:** UAT-09 lulus; transaksi dapat ditelusuri dari pengajuan ke rekonsiliasi; pengiriman ulang tidak membuat pembayaran tercatat dua kali; saldo dan laporan konsisten; auditor tidak mengubah transaksi. Integrasi transfer bank otomatis tidak diasumsikan sebagai cakupan.

### E09 · Evaluasi dan pengetahuan organisasi

**Layar utama:** E01–E08, K01–K04; perluasan W04.

Pekerjaan:

1. Tetapkan siklus, indikator, bobot, formula, rubrik, otoritas koreksi, dan sanggah dengan KPI.
2. Bangun capaian beserta bukti, penilaian, kalibrasi, koreksi, rencana perbaikan, serta laporan/ekspor berizin.
3. Batasi perbandingan antar-divisi pada Ketua/Sekjend sesuai keputusan. Pertahankan nilai asli, versi formula, dan alasan perubahan.
4. Bangun SOP, taksonomi, review, sitasi, versi sumber, penanda kedaluwarsa, dan pencarian lintas dokumen yang tetap memeriksa izin.

**Syarat lulus:** UAT-10 lulus; missing data berbeda dari nol; skor dapat direproduksi dari formula/versi dan bukti; pengguna tidak dapat mencari judul sumber yang tidak boleh dibaca; sumber yang berubah ditandai.

### E10 · Handover, administrasi dan kesiapan operasi

**Layar utama:** H01–H06, A12–A16.

Pekerjaan:

1. Bangun arsip periode, penyusunan paket, pemeriksaan kelengkapan, penerimaan per item, klarifikasi dan daftar tanggung jawab berjalan.
2. Lengkapi peralihan akses yang mulai dibangun pada E02. Pastikan penerus memiliki kewenangan yang diperlukan tanpa mewarisi seluruh hak historis.
3. Lengkapi konfigurasi berversi, kebijakan persetujuan, retensi, penahanan audit/sengketa, cadangan, dan pencatatan hasil restore.
4. Siapkan panduan admin, pemulihan akun, penanganan insiden, perubahan konfigurasi, dan pergantian petugas operasional.

**Syarat lulus:** UAT-11 lulus; simulasi pergantian jabatan mempertahankan pemilik tugas dan outstanding; hak lama tidak terus berlaku; perubahan konfigurasi dapat ditelusuri; restore terbukti. Backup dan kontrol akses dasar sudah tersedia sejak fase awal, bukan baru dibuat di E10.

### E11 · AI terkendali

**Layar utama:** I01–I06.

Pekerjaan:

1. Tetapkan provider/model, lokasi pemrosesan, retensi, pembatasan pelatihan, sumber yang boleh diindeks, dan registry prompt bersama KPI.
2. Bangun retrieval dengan filter izin sebelum sumber dikirim, mencakup indeks/cache/embedding yang digunakan. Perubahan klasifikasi atau pencabutan sumber harus menghentikan pemakaian sumber tersebut.
3. Bangun tanya jawab bersitasi, kajian berlabel usulan, riwayat berizin, registry model/prompt, dan pemantauan pelanggaran kebijakan.
4. Bangun usulan tindakan dengan pratinjau target/payload, konfirmasi manusia, expiry, serta pengecekan ulang izin dan versi saat eksekusi.
5. Uji instruksi berbahaya dalam dokumen: teks sumber tidak boleh mengubah policy, memperoleh akses tambahan, atau memicu tool/aksi tanpa otorisasi.

**Syarat lulus:** UAT-12 lulus; data Terbatas/Rahasia/Sangat Rahasia tidak dikirim; sitasi tetap menghormati izin saat dibuka; tidak ada jawaban seolah memiliki bukti ketika sumber tidak tersedia; AI tidak memutuskan pelanggaran atau menjalankan tindakan sendiri. Tanpa persetujuan provider, jalur produksi AI tetap nonaktif dan status fase belum diterima.

### E12 · Uji menyeluruh dan penerimaan pengguna

Pekerjaan:

1. Jalankan 14 skenario UAT PRD beserta variasi role/divisi/periode yang relevan. Tambahkan tes integrasi untuk hubungan antarmodul dan lifecycle data.
2. Uji akses langsung API/storage, privilege escalation, unggahan berbahaya, brute-force sesuai kebijakan, kebocoran metadata, sesi kedaluwarsa, dan input tidak valid.
3. Uji konkurensi: dua reviewer, retry form, voting serentak, transaksi yang sama, konflik versi dan kegagalan pekerjaan latar.
4. Uji mobile 320 px, keyboard, zoom 200%, kontras, tema, reduced motion, error recovery serta browser/perangkat yang disepakati.
5. Jalankan uji performa menggunakan ukuran dataset dan beban yang disetujui. Tetapkan dan ukur p95, tingkat error, kapasitas pengguna bersamaan, RPO/RTO dan batas unggahan; catat hasil aktual.
6. Latih perwakilan pengurus memakai data TEST dan minta mereka menyelesaikan skenario tanpa dibimbing langkah demi langkah. Catat hambatan lalu perbaiki.
7. Audit kelengkapan 113 layar: fitur utuh, status diterima, atau pengecualian tertulis yang sah. Audit dependensi, lisensi, secret, migration dan panduan operasi.

**Syarat lulus:** seluruh requirement dalam rilis memiliki bukti; tidak ada defect Critical/High terbuka; defect lain memiliki keputusan penerimaan yang eksplisit dan tidak menghalangi pekerjaan; target operasional tercapai; KPI menerima UAT. Pengujian fitur sudah berlangsung pada setiap fase, E12 memeriksa integrasi dan kesiapan keseluruhan.

### E13 · Pilot, produksi dan serah terima

Pekerjaan:

1. Siapkan release candidate yang tetap, backup sebelum migrasi, rencana cutover, dan kriteria rollback. Untuk perubahan skema, pastikan versi aplikasi lama/baru kompatibel atau gunakan prosedur forward-fix/restore yang telah diuji; jangan mengandalkan rollback kode saja.
2. Verifikasi domain, HTTPS, email jika digunakan, owner KPI, akses produksi, backup, monitoring, alert dan kontak penanggung jawab. Verifikasi kebutuhan enkripsi terhadap konfigurasi aktual dan sumber kontraktual.
3. Impor hanya data yang disetujui melalui prosedur validasi. Catat sumber, jumlah, duplikat, kesalahan dan hasil rekonsiliasi; bersihkan akun/seed TEST sebelum penggunaan nyata.
4. Setelah gerbang rilis dan persetujuan KPI terpenuhi, buka pilot untuk pengurus yang ditunjuk. Pilot dengan data nyata harus memenuhi kontrol produksi yang sama.
5. Ukur error, latensi, kegagalan login, antrean kasus, pengiriman, dan hasil backup. Jika muncul kebocoran, kehilangan data, atau bypass persetujuan, hentikan operasi terdampak dan jalankan runbook.
6. Setelah pilot diterima berdasarkan kriteria dan durasi yang disepakati, buka akses sesuai tahap peluncuran, lakukan smoke test publik/portal dan serahkan panduan.
7. Lakukan BAST, alih pengetahuan, inventaris kode/database/akun/aset, rotasi secret, serta pencabutan atau pembatasan akses pengembang sesuai kebutuhan yang sah.

**Syarat lulus:** pengguna yang dituju dapat bekerja pada produksi; pemilik operasional jelas; monitoring dan restore teruji; KPI menerima hasil dan dapat mengoperasikan sistem tanpa akun pribadi pengembang. Pilot terbatas belum berarti semua 113 layar diterima bila masih ada cakupan yang belum selesai.

### E14 · Pemeliharaan tiga bulan dan stabilisasi

Baseline pembaruan 17 September 2026 menetapkan pemeliharaan tiga bulan pascaserah terima. Tanggal mulai mengikuti BAST dan naskah kontrak, bukan tanggal dokumen roadmap ini.

Pekerjaan:

1. Catat insiden dan bug berdasarkan dampak, pemilik, langkah reproduksi, perbaikan, tes regresi, serta versi rilis.
2. Pantau health check, backup, kapasitas, antrean pekerjaan, pengiriman dan akses istimewa; KPI menunjuk petugas beserta jadwal pemeriksaannya.
3. Lakukan restore drill sesuai jadwal yang disepakati dan perbarui runbook dari pengalaman produksi.
4. Dampingi pengurus, editor dan admin; perbarui panduan ketika perilaku aplikasi berubah.
5. Pisahkan bug dalam cakupan dari permintaan fitur baru. Perubahan baru melalui penilaian dampak dan kesepakatan tambahan.
6. Sebelum akhir pemeliharaan, tinjau masalah tersisa, biaya layanan, perpanjangan akun/domain, owner operasi, akses pengembang dan rencana pemeliharaan selanjutnya.

**Syarat lulus:** bug penghalang selesai; isu tersisa memiliki pemilik dan kesepakatan; petugas KPI mampu menangani operasi rutin serta pemulihan; pengelolaan setelah garansi diserahkan secara jelas. Berakhirnya garansi tidak berarti kebutuhan pembaruan keamanan berhenti.

## 4. Pemetaan seluruh layar

“Fase utama” menunjukkan tempat cakupan lengkap diterima. Irisan yang diperlukan dapat dibangun lebih awal dan diperiksa ulang ketika integrasi lengkap.

| ID layar | Jumlah | Fase utama | Dependensi yang dibangun lebih awal |
|---|---:|---|---|
| A01–A11 | 11 | E02 | Shell, data dan konfigurasi dari E01 |
| F01–F06 | 6 | E03 | Izin dan audit dari E02 |
| P01–P15 | 15 | E04 | Handler kasus minimum untuk P12/P13 |
| C01–C07 | 7 | E04 | Akun editor, audit, storage dari E02/E03 |
| W01–W05 | 5 | E05 | Notifikasi dasar E03; pencarian diperluas di E09 |
| T01–T11 | 11 | E05 | Bukti dokumen dari E03 |
| M01–M07 | 7 | E06 | Tindak lanjut tugas dari E05 |
| S01–S09 | 9 | E07 | Triage dan pembaruan aman minimum di E04 |
| N01–N04 | 4 | E07 | Pengiriman dan pemantauan dasar E03 |
| B01–B09 | 9 | E08 | Izin, audit, dokumen dari E02/E03 |
| E01–E08 | 8 | E09 | Data tugas/rapat dan formula resmi |
| K01–K04 | 4 | E09 | Sumber dokumen dan izin |
| A12–A16 | 5 | E10 | Konfigurasi/backup minimum E01; retensi aman E03 |
| H01–H06 | 6 | E10 | Peralihan akses dasar E02 |
| I01–I06 | 6 | E11 | Sumber berizin dan knowledge E09 |
| **Total** | **113** | E12 memverifikasi semua kelompok | |

Kelengkapan produk penuh berarti semua 113 ID memiliki hasil yang diterima. Jika ada pengurangan yang disetujui, sebut hasilnya “rilis dengan cakupan yang direvisi” dan tulis ID yang ditunda, bukan mengklaim baseline penuh selesai.

## 5. Hubungan dengan empat fase kontraktual

| Milestone kontrak | Paket pekerjaan eksekusi | Bukti utama |
|---|---|---|
| F1 · Minggu 1 · Publik/CMS/aspirasi | E00–E04 sesuai irisan fondasi yang diperlukan | Publikasi ID/EN dan aspirasi/tracking dengan penanganan minimum lulus |
| F2 · Minggu 2 · Portal dan tugas | E02/E03 lengkap untuk portal, E05 | MFA, izin, bukti dan review tugas lulus |
| F3 · Minggu 3 · Operasional dan tata kelola | E06–E08; paket E09/E10 yang disepakati masuk milestone ini | Rapat, file, kasus, komunikasi dan keuangan dapat dijalankan |
| F4 · Minggu 4 · Knowledge/AI/hardening/handover | Sisa E09/E10, E11–E13 | UAT, restore, operasi produksi dan serah terima diterima |
| Pascaserah terima | E14 selama tiga bulan | Dukungan bug dan alih pengetahuan sesuai kontrak |

Penempatan 39 layar tambahan dan rincian paket pada F3/F4 adalah usulan perencanaan yang perlu direkonsiliasi dengan KPI. Tabel tidak membuktikan pekerjaan muat dalam empat minggu. E00 harus menghitung kapasitas berdasarkan task, reviewer, aset dan keputusan yang tersedia. Bila jalur kritis melebihi kapasitas, ajukan perubahan jadwal/cakupan tertulis; jangan menghapus pengujian atau menurunkan kontrol data agar tampak tepat waktu.

## 6. Template task dan bukti selesai

Gunakan struktur berikut untuk setiap task aktual, dengan field diisi sebelum Ready:

| Field | Isi wajib |
|---|---|
| ID dan judul | ID unik dan hasil yang dapat diperiksa |
| Fase dan requirement | E00–E14, FR/GOV/NFR dari PRD, ID layar terkait |
| Pemilik | Pelaksana, reviewer teknis, reviewer KPI bila diperlukan |
| Dependensi | Task serta keputusan yang harus selesai dahulu |
| Aturan bisnis | Role, scope, klasifikasi, status dan aksi yang sah/terlarang |
| Implementasi | Migrasi, API/service, UI dan pekerjaan latar yang diperlukan |
| Acceptance criteria | Hasil sukses, penolakan, konflik versi, retry dan pemulihan yang relevan |
| Pengujian | Tes bermakna sesuai risiko, termasuk akses negatif |
| Bukti | PR/commit, hasil tes, demo/screenshot TEST, hasil review dan catatan penerimaan |
| Operasional | Dampak migrasi, monitoring, backup/rollback dan pembaruan panduan |

Definition of Done per task: kode direview, tes terkait lulus, data nyata tidak digunakan untuk demonstrasi, UI terhubung ke backend bila task mencakup alur bisnis, izin diperiksa server, error dapat dipahami, dan matriks cakupan diperbarui. Tombol kosong, data contoh tersamar sebagai data resmi, atau hasil uji yang belum dijalankan tidak memenuhi status selesai.

## 7. Paket kerja pertama

Urutan awal untuk memulai eksekusi:

1. **START-01:** pilih checkout aplikasi KPI yang benar dan rekam status Git serta baseline. Hasil: lokasi kerja dan branch yang jelas, tanpa menimpa proyek lain.
2. **START-02:** masukkan PRD/roadmap, buat matriks 113 layar, register keputusan dan backlog E00/E01. Hasil: cakupan dapat ditelusuri.
3. **START-03:** finalkan keputusan fondasi yang masih terbuka, pemilik akun dan kebijakan lingkungan bersama KPI. Hasil: pekerjaan implementasi yang siap memiliki dependensi lengkap.
4. **START-04:** bangun proyek sesuai ADR yang disahkan, shell, token desain, CI dan konfigurasi TEST. Hasil: build dan preview berjalan dari checkout bersih.
5. **START-05:** bangun migrasi identitas/organisasi/audit dan data TEST. Hasil: skema dapat dibuat ulang serta izin dasar diuji.
6. **START-06:** selesaikan satu alur vertikal pertama: login → MFA → halaman portal berizin → logout/revoke → akses ditolak. Hasil: fondasi keamanan terbukti sebelum modul bisnis diperbanyak.

Paket tersebut adalah titik mulai implementasi. Penyusunan roadmap ini belum membuat akun cloud, menjalankan migrasi produksi, atau melakukan deployment.

## 8. Acuan

- [PRD KPI PPMI Mesir v1.0](./PRD-KPI-PPMI-Mesir.md): requirement, skenario UAT, keputusan terbuka, dan kewajiban serah terima.
- [Katalog pada commit baseline](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/app.js): 113 layar, entitas, keputusan, dan ringkasan kontrak.
- [Tahapan dan cakupan 17 September](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/rancangan-ui-ux/04-TAHAPAN-CAKUPAN.md): empat fase serta pemeliharaan tiga bulan.
- [Register 28 keputusan](https://github.com/darcia2024/kpi-dardev/blob/1c8f42d4ad574146360af82d9b3a19a3c35e9642/rancangan-ui-ux/06-PERSETUJUAN-28-PERTANYAAN-SITUS.md): prinsip yang disetujui dan detail yang belum ditetapkan.

Naskah kontrak asli tetap menjadi acuan kewajiban hukum; roadmap menggunakan ringkasan dalam repositori dan PRD, serta menandai usulan pelaksanaan sebagai usulan.
