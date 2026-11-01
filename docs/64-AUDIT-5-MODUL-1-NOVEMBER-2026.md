# Audit 5 modul portal pengurus, 1 November 2026

Tindak lanjut review owner tanggal 1 November 2026. Modul yang diaudit:
1. Organisasi dan Periode
2. Rapat Organisasi
3. Dokumen Internal
4. Kerahasiaan dan Hak Akses
5. Pengajuan Akses Informasi (F01/F02)

## Cara audit

- Audit dilakukan untuk mode hosted (Supabase), yaitu mode yang dipakai production. Mode pratinjau lokal hanya dicek sejauh bisa bocor ke production.
- Semua uji dijalankan di database tiruan (PGlite) dengan urutan migration yang sama dengan production, ditambah skrip `contoh-isi.sql`, `contoh-hapus.sql`, dan `uji-peran-1-aktifkan-periode.sql`. **Database production tidak disentuh dan tidak ada deployment.**
- Uji per peran: pemohon, pejabat bermandat, admin sistem, super admin, pengurus tanpa izin, dan penerima undangan rapat.
- Pengecekan otorisasi mencakup dua jalur: lewat API Next.js, dan pemanggilan Supabase langsung memakai JWT pengguna sendiri.
- Hasil: `npm test` 193/193 lolos, `tsc` bersih, `next build` lolos.

Prioritas: **P1** perlu segera, **P2** penting, **P3** perbaikan kecil.
Tanda ✅ berarti sudah diperbaiki di commit ini. Semua perbaikan itu hanya di UI dan tidak mengubah aturan bisnis maupun hak akses.

## Ringkasan

| Kategori | Jumlah | Sudah diperbaiki |
|---|---|---|
| BUG | 8 | 1 (B1, migration dilaporkan sudah dijalankan di production, hasil belum diperiksa). Sisanya menunggu persetujuan. |
| UX | 13 | 12 (U12 belum; U9 dan U11 masih punya sisa kecil) |
| REQUIREMENT GAP | 11 | 0 |
| NEEDS CONFIRMATION | 8 | n/a |

**Keamanan dokumen dan rapat rahasia sudah kuat.** Tidak ada cara bagi pengguna yang sudah login untuk membuka dokumen atau rapat Rahasia/Terbatas yang bukan haknya, baik lewat URL, `?meeting=`/`?document=`, isi request, ID organisasi/periode, maupun pemanggilan Supabase langsung. Rinciannya ada di bagian "Pemeriksaan yang lolos".

Masalah terbesar ada di tempat lain:
- Hak akses bisa diberikan tanpa formulir F01 (B1).
- Periode bisa menjadi aktif tanpa keputusan, bahkan dua periode aktif sekaligus (B2, B3).
- Setiap dokumen yang diunggah otomatis menjadi Rahasia sehingga tidak bisa dilihat siapa pun selain super admin (G2).
- Rapat belum punya klasifikasi kerahasiaan (G1).

---

## BUG

### B1 · P1 · Hak akses bisa dibuat tanpa formulir F01
- **Lokasi:** `supabase/migrations/20261002001300_confidentiality_sop_v11.sql:141`
- **Penyebab:** `kpi_record_access_decision` dan `kpi_apply_access_decision` diberi izin eksekusi untuk semua pengguna login (`authenticated`). Padahal keduanya hanya perlu dipanggil dari dalam `kpi_governance_action`.
- **Dampak:** pemegang mandat bisa memanggil RPC ini langsung lewat PostgREST untuk penerima siapa pun. Admin sistem lalu bisa menerapkannya. Hasilnya izin sungguhan tanpa pemohon, tanpa F01, dan tanpa riwayat workflow. Uji: `workflowRecords: 0`, grant tetap terbentuk. Alur SOP "pemohon → keputusan → pelaksanaan" terlewati.
- **Solusi (migration):** cabut izin eksekusi kedua fungsi dari `authenticated`. Kode aplikasi tidak memanggil keduanya secara langsung (sudah diperiksa).
- **Status:** migration disiapkan di `supabase/migrations/20261101003400_access_decision_rpc_internal.sql` (Paket 1, disetujui 1 November 2026). Menurut laporan pengembang, sudah dijalankan lewat SQL Editor Supabase production pada 1 November 2026. Hasilnya masih perlu diperiksa dengan kueri `has_function_privilege` untuk `authenticated` pada kedua fungsi: keduanya harus `false`. Migration ini aman dijalankan ulang karena hanya mencabut izin dan mencatat audit.
- **Cara uji:** `tests/hosted-governance.test.ts` sekarang memuat migration ini. Tes memastikan panggilan langsung ditolak `permission denied`, sementara alur F01 lengkap (buat → putuskan → laksanakan → cabut/ubah) tetap berjalan. Tanpa migration, tes ini gagal. Setelah dijalankan di production: ajukan dan laksanakan satu F01 di portal seperti biasa, lalu pastikan izinnya muncul di "Hak akses saya".

### B2 · P1 · Halaman Pengaturan langsung mengaktifkan periode tanpa keputusan resmi
- **Lokasi:** `supabase/migrations/20261002000400_system_administration.sql:78`
- **Penyebab:** periode baru yang tanggal mulainya hari ini atau sudah lewat langsung disimpan sebagai `ACTIVE`. Tidak ada rujukan keputusan dan tidak ada pemeriksaan periode CONTOH.
- **Dampak:** uji berakhir dengan `CONTOH` dan periode baru sama-sama ACTIVE. Ini bertentangan dengan `uji-peran-1-aktifkan-periode.sql` dan dokumen 55, yang menyatakan periode hanya diaktifkan lewat skrip resmi. Halaman Tugas yang kosong justru mengarahkan admin ke form ini.
- **Solusi (migration + aturan bisnis):** simpan selalu sebagai `PLANNED`, lalu sediakan RPC aktivasi yang mewajibkan rujukan keputusan dan dicatat di audit. `tests/hosted-admin.test.ts:35` perlu disesuaikan.
- **Sementara ✅:** teks form sekarang menyebut terus terang bahwa periode yang sudah dimulai langsung aktif, dan meminta keputusan resmi disiapkan dulu.
- **Cara uji:** simpan periode dengan tanggal mulai hari ini → harus berstatus Direncanakan.

### B3 · P1 · Tidak ada pengaman terhadap dua periode aktif dalam satu organisasi
- **Lokasi:**
  - `supabase/migrations/20260921000000_platform.sql:17-27`: tidak ada constraint.
  - `supabase/manual/uji-peran-1-aktifkan-periode.sql:13`: hanya memeriksa CONTOH.
- **Dampak:**
  - `kpi_intake_ready` memakai `count(*)=1`, jadi kanal pengaduan publik tertutup diam-diam (terverifikasi).
  - Pencarian template pengaduan bisa error "more than one row" (dugaan).
  - Periode yang terbuka pertama di modul Rapat/Dokumen tidak pasti, karena `jsonb_agg` tanpa `ORDER BY`.
  - Label di bingkai portal menjadi `CONTOH · UJI_2`.
- **Solusi (migration):**
  - Tambah unique index parsial `org.periods(organization_id) where status in ('ACTIVE','CLOSING')`. Ini perlu konfirmasi C3.
  - Tambah pemeriksaan serupa di skrip aktivasi.
  - Tambah `ORDER BY starts_on` di `managedScopes` dan `superAdminScopes`.
- **Cara uji:** aktifkan periode kedua → harus ditolak.

### B4 · P2 · Pencabutan akses yang sudah disetujui macet kalau mandat penyetuju berakhir
- **Lokasi:** `supabase/migrations/20261002001700_workflow_approval_binding.sql:42-43`
- **Penyebab:** saat pelaksanaan, kewenangan penyetuju diperiksa ulang untuk semua jenis permohonan, termasuk REVOKE.
- **Dampak:** permohonan berhenti di status Disetujui dengan galat "Decision mandate no longer valid", sementara aksesnya tetap aktif.
- **Solusi (migration):** lewati pemeriksaan ulang kewenangan untuk `requestType='REVOKE'`.
- **Cara uji:** setujui REVOKE, akhiri mandat penyetuju, lalu laksanakan → harus berhasil.

### B5 · P2 · Tanggal mulai yang dimundurkan membuat permohonan tidak bisa dilaksanakan
- **Lokasi:**
  - `supabase/migrations/20261002001500_governance_workflows.sql:91`
  - `20261002001300_confidentiality_sop_v11.sql:96`
- **Penyebab:** saat membuat dan memutuskan permohonan, `startsAt` di masa lalu diterima. Saat pelaksanaan, sistem mensyaratkan penugasan sudah berlaku pada tanggal itu.
- **Dampak:** permohonan dengan tanggal mulai 30 hari ke belakang macet di status Disetujui. Admin hanya melihat pesan 403 umum.
- **Solusi (migration):** validasi tanggal terhadap masa penugasan pemohon saat permohonan dibuat, atau geser `startsAt` ke `now()`.
- **Cara uji:** ajukan F01 dengan tanggal mulai kemarin sebelum penugasan dimulai → harus ditolak saat dibuat, bukan saat dilaksanakan.

### B6 · P2 · Permohonan Rahasia tanpa objek informasi lolos dibuat, tapi gagal saat diputuskan
- **Lokasi:**
  - `supabase/migrations/20261002001300_confidentiality_sop_v11.sql:79`
  - `src/components/access/governance-workspace.tsx:36`: kolom objek ditandai opsional.
- **Dampak:** penyetuju melihat pesan "Periksa tanggal, rujukan, status checklist…" dan tidak bisa memperbaikinya. Satu-satunya pilihan adalah menolak.
- **Solusi (migration + UI):** wajibkan `objectId` dan periksa peringkatnya di `kpi_governance_create`. ✅ Bagian UI selesai: kolom objek wajib saat Rahasia dipilih. Bagian server belum, jadi permohonan yang dikirim di luar portal masih lolos.
- **Cara uji:** buat F01 Rahasia tanpa objek → harus ditolak dengan pesan yang jelas.

### B7 · P3 · Daftar sumber informasi di konteks tata kelola memakai izin yang salah
- **Lokasi:** `supabase/migrations/20261002001500_governance_workflows.sql:74`
- **Penyebab:** semua jenis sumber selain ASSET diperiksa dengan `CASE_READ`, dengan divisi null.
- **Dampak:** pemegang CASE_READ melihat ID, jenis, dan klasifikasi sumber milik modul lain. Yang terlihat hanya metadata, bukan isinya.
- **Solusi (migration):** cocokkan setiap jenis sumber dengan izin bacanya sendiri.

### B8 · P3 · Permohonan klasifikasi memeriksa divisi pemohon, bukan divisi dokumen
- **Lokasi:** `supabase/migrations/20261002001500_governance_workflows.sql:117`
- **Dampak:**
  - Pengguna bisa mengajukan klasifikasi untuk aset di divisi lain.
  - Kode galat yang berbeda (22023 vs 42501) membocorkan apakah sebuah UUID ada.
  - Isi dokumen tidak bocor.
- **Solusi (migration):** pakai divisi milik sumbernya sendiri, dan kembalikan satu galat yang seragam.

---

## UX

| # | Prio | Temuan | Lokasi | Status |
|---|---|---|---|---|
| U1 | P1 | Semua tombol rapat (konfirmasi hadir, voting, notulen) mati tanpa penjelasan sampai "Catatan tindakan" diisi minimal 3 karakter. Server memang mewajibkannya (`hosted-meeting-contract.ts:9`). | `hosted-meeting-workspace.tsx` | ✅ Petunjuk ditambahkan di bawah kolom catatan |
| U2 | P2 | Riwayat rapat menampilkan kode mentah (`SAVE_MINUTES`, `ATTACH_ASSET`). | `hosted-meeting-workspace.tsx` | ✅ Diterjemahkan |
| U3 | P2 | Riwayat F01 hanya menampilkan kode bahasa Inggris (`DECIDE`, `IMPLEMENT`) tanpa nama pelaku, padahal dokumen 48 menyebut riwayat memuat pelaksana. | `governance-workspace.tsx:78` | ✅ Diterjemahkan dan nama pelaku ditampilkan. Hasil keputusan (setuju/sebagian/tolak) belum tercatat di riwayat dan butuh migration. |
| U4 | P2 | Periode yang tanggal berakhirnya sudah lewat tetap tertulis "ACTIVE" di Pengaturan, padahal semua modul sudah tidak memakainya. Status juga tampil dalam kode mentah. | `hosted-admin-setup.tsx`, `hosted-roster-administration.tsx` | ✅ Status efektif tampil dalam bahasa Indonesia (mis. "Aktif · tanggal berakhir sudah lewat…", "Direncanakan · menunggu aktivasi resmi") |
| U5 | P3 | Tautan `?meeting=` diabaikan di mode hosted, jadi notifikasi membuka daftar, bukan rapatnya. | `src/app/portal/rapat/page.tsx` | ✅ Rapat yang dituju langsung terbuka. Izin tetap diperiksa server. |
| U6 | P1 | Setelah unggah, berkas tidak muncul di daftar (lihat G2) tanpa penjelasan. | `hosted-document-workspace.tsx` | ✅ Pesan menjelaskan bahwa berkas tersimpan sebagai Rahasia dan alasannya tidak tampil |
| U7 | P3 | Pesan sukses Pengaturan menyuruh "buka ulang halaman Tugas". | `hosted-admin-setup.tsx` | ✅ |
| U8 | P3 | Galat lama di Kerahasiaan & Hak Akses tidak hilang setelah muat ulang berhasil. | `governance-workspace.tsx:24` | ✅ |
| U9 | P2 | Form F01 meminta UUID mentah (divisi, objek, keputusan sebelumnya). Izin tampil sebagai kode (`TASK · READ`). Semua galat 400 memakai satu pesan umum yang menyebut "status checklist". Daftar izin yang bisa disetujui tidak disaring sesuai mandat penyetuju. | `governance-workspace.tsx:10,26,35-36,59` | ✅ Objek, keputusan sebelumnya, dan petugas teknis kini dipilih dari daftar. Izin berlabel Indonesia. Kolom wajib mengikuti pilihan (Rahasia wajib objek, perubahan/pencabutan wajib keputusan lama, persetujuan wajib izin). Tanggal diperiksa sebelum dikirim. Daftar izin yang bisa disetujui disaring sesuai mandat. Pesan galat diperjelas. **Sisa:** kode divisi masih diisi manual karena konteks belum memuat daftar divisi (butuh migration kecil). |
| U10 | P2 | "Hak akses saya" menampilkan kode izin (`ASSET_READ`) dan tanggal ISO mentah. | `hosted-account-panel.tsx:7` | ✅ Memakai `permission-labels.ts` bersama U9 dan tanggal waktu Kairo |
| U11 | P2 | Untuk super admin, bingkai portal menulis "CONTOH" padahal pilihan periode di Rapat/Dokumen juga memuat 2026_2027 (PLANNED) tanpa tanda "baca saja". Setelah CONTOH dihapus, bingkai akan menulis "Periode belum diatur" sementara Rapat/Dokumen tetap terbuka. | `src/app/portal/layout.tsx:17`, `hosted-scopes.ts:6`, `hosted-task-scopes.ts:5` | ✅ Untuk Rapat dan Dokumen: periode tertentu berlabel "Baca saja" disertai penjelasan, dan bingkai menulis "Belum ada periode aktif". Modul Konten dan Manajemen belum memakai label ini. |
| U12 | P2 | Menyimpan ulang 2026_2027 dengan tanggal yang sama memunculkan pesan "tersimpan", padahal tidak ada yang berubah. Admin bisa mengira periode sudah aktif. | `20261002000400_system_administration.sql:73-75` | Usulan: RPC mengembalikan tanda `unchanged` (migration kecil) |
| U13 | P3 | Galat database tak terduga menjadi 503 "Coba lagi dengan isian yang sama", padahal galatnya akan terulang. | `src/app/api/v1/work/governance/route.ts:24` | ✅ Pesan di layar sekarang menyebut gangguan layanan dan arah bantuan. API masih memakai kode 503 yang sama. |

**Cara uji U1–U8:** masuk sebagai pengurus dengan MEETING_READ/MANAGE.
- Buka rapat: petunjuk catatan tampil, dan riwayat berbahasa Indonesia lengkap dengan nama.
- Buka `/portal/rapat?meeting=<id>`: rapat langsung terbuka. Dengan ID yang bukan hak Anda: muncul pesan izin.
- Di `/portal/pengaturan`: CONTOH tampil "Aktif" dan 2026_2027 "Direncanakan".
- Di `/portal/kebijakan`: riwayat F01 menampilkan nama pelaku.

---

## REQUIREMENT GAP

| # | Prio | Kebutuhan | Lokasi | Solusi |
|---|---|---|---|---|
| G1 | P1 | **Rapat tidak bisa diklasifikasikan.** Rapat tidak punya kolom klasifikasi dan tidak terdaftar di `information_resources`, jadi selalu dianggap Internal. Siapa pun yang punya MEETING_READ Internal membaca agenda, notulen, dan hasil voting. Judul rapat sensitif juga ikut terkirim di notifikasi. | `20261002000500_hosted_meetings.sql:2-11`, `20261003002500…:26,98` | Migration: trigger klasifikasi untuk rapat (default Internal) + backfill, dan workflow klasifikasi untuk jenis MEETING |
| G2 | P1 | **Semua dokumen yang diunggah otomatis Rahasia.** Daftar, unduh, periksa ulang, dan versi memeriksa klasifikasi, jadi pengunggahnya sendiri pun tidak bisa melihat berkasnya. Modul Dokumen praktis hanya bisa dipakai untuk menyimpan. Ini aman (tidak bocor), tapi tidak bisa dipakai bekerja. Lampiran di rapat/konten juga selalu gagal ("Asset access denied"). | `20261002001300…:30,131`, `20261002001400…:17-19,47`, `20261003002500…:50-53` | Pilih: (A) klasifikasi dipilih saat unggah, default Internal/Terbatas, Rahasia hanya jika dipilih; atau (B) pengunggah boleh membaca berkasnya sendiri sampai klasifikasi disahkan. Lihat C7. |
| G3 | P1 | Pencabutan atau perubahan akses hanya bisa diajukan oleh pemegang akses itu sendiri. Ketua atau peninjau tidak bisa mencabut akses orang lain lewat F01; mereka hanya bisa menangguhkan setelah peninjauan. Ini bertentangan dengan teks register "Pencabutan… memakai permohonan F01 baru". | `20261002001500_governance_workflows.sql:94` | Migration setelah C8 |
| G4 | P2 | "Tinjau paling lambat setiap tiga bulan" hanya label. Izin dengan tinjauan yang lewat sehari tetap berlaku, dan tidak ada pengingat. | `kebijakan/page.tsx:25`, `20261002001300…:82` | Migration setelah C5 |
| G5 | P2 | Aturan konflik kepentingan hanya berlaku lewat tabel `governance.conflicts`, dan tidak ada RPC atau UI untuk mendeklarasikan konflik. Dalam praktik, aturan ini tidak bisa dijalankan pengurus. | `kebijakan/page.tsx` (paragraf "konflik kepentingan") | RPC + form deklarasi konflik |
| G6 | P2 | Pengajuan F01 tidak bisa ditarik. Pengajuan yang menunggu atau sudah disetujui tapi tidak pernah dilaksanakan tetap terbuka selamanya. | `20261002001500…` (aksi ACCESS) | Aksi WITHDRAW untuk pemohon, dan batas waktu untuk catatan Disetujui |
| G7 | P2 | Riwayat peninjauan F02 (catat/verifikasi/tangguhkan) berada di luar riwayat workflow. Siapa yang memverifikasi atau menangguhkan tidak dikirim ke UI, dan peninjau lain tidak bisa melihatnya. | `20261002001500…:70-71,291-311` | Migration: tambah kolom pada konteks, tetapkan aturan visibilitas |
| G8 | P2 | Divisi dan jabatan `CONTOH_` ikut muncul di roster periode resmi. Jika orang sungguhan ditugaskan ke sana, `contoh-hapus.sql` gagal (foreign key) dan aktivasi 2026_2027 ikut terhalang. Berkas di storage dari masa coba juga tertinggal. | `20261003002900…:16-17,40`, `contoh-hapus.sql:53,68-69` | ✅ Sebagian: unit `CONTOH_` kini bertanda "data contoh, jangan dipakai" di form roster. Sisa: pemeriksaan awal dan pembersihan storage di skrip hapus |
| G9 | P2 | Tes rapat dan aset hanya memuat migration sebelum SOP, jadi aturan klasifikasi dan keputusan untuk rapat/dokumen tidak pernah dites. | `tests/hosted-meetings.test.ts:14`, `tests/hosted-assets.test.ts:22` | Tambah tes dengan migration terbaru dan keputusan F01 |
| G10 | P2 | Modul pengaduan menganggap periode CLOSING sudah tutup, sementara modul lain menganggapnya masih bekerja. | `20261002001000:65,74`, `20261002001400:118`, `20261003003000:49` | Samakan setelah C3 |
| G11 | P3 | Kecocokan organisasi–periode hanya dijaga oleh RPC. Tabel rapat, aset, dan keputusan akses tidak memaksanya (pertahanan berlapis). | `20261002000100:31-50` | Composite foreign key atau trigger tambahan |

---

## NEEDS CONFIRMATION (pertanyaan untuk owner)

| # | Pertanyaan | Kenapa penting |
|---|---|---|
| C1 | Siapa yang boleh menyetujui akses **Rahasia**? SOP menulis "Ketua atau pejabat yang memperoleh delegasi khusus", sedangkan sistem menerima siapa pun yang mandatnya mencakup klasifikasi Rahasia, dan mandat itu bisa diteruskan oleh pemegang IDENTITY_MANAGE. | Menentukan apakah perlu kewenangan khusus "penyetuju Rahasia" atau pengecekan jabatan Ketua (migration) |
| C2 | Siapa yang boleh melihat rapat: semua pemegang izin rapat, atau hanya yang diundang? Saat ini peserta yang diundang tapi tidak punya izin MEETING_READ tidak bisa membuka rapat atau konfirmasi hadir. Sebaliknya, izin tingkat organisasi melihat rapat semua divisi. | Aturan baca rapat (migration) dan G1 |
| C3 | Siapa yang mengaktifkan periode, dan dengan rujukan keputusan apa? Bolehkan periode lama (CLOSING) tumpang tindih dengan periode baru yang aktif saat serah terima? | B2, B3, G10 |
| C4 | Hak super admin: (a) boleh membaca kasus tanpa ditugaskan (temuan di dokumen 63)? (b) boleh mengunduh dokumen saat periode masih PLANNED (sekarang bisa melihat daftar tapi unduhan ditolak)? (c) boleh membaca periode yang sudah CLOSED (sekarang bisa)? | Teks persetujuan di dokumen 57 belum sama dengan perilaku sistem |
| C5 | Jika tinjauan tiga bulan terlewat, apakah akses otomatis ditangguhkan atau cukup diingatkan? | G4 |
| C6 | Apakah konfirmasi hadir dan voting memang wajib disertai catatan? Saat ini server mewajibkan catatan untuk semua tindakan rapat. | Jika tidak wajib, ubah aturan validasi di server |
| C7 | Klasifikasi default untuk dokumen baru: Internal, Terbatas, atau tetap Rahasia? Apakah pengunggah boleh melihat berkasnya sendiri sebelum klasifikasi disahkan? | G2, dan membuat modul Dokumen bisa dipakai |
| C8 | Apakah F01 boleh diajukan atas nama orang lain (anggota baru, pencabutan oleh Ketua)? Apakah CHANGE yang disetujui sebagian boleh mencabut seluruh keputusan lama, seperti perilaku sekarang? | G3 |

---

## Kesesuaian SOP di halaman Kerahasiaan dengan sistem

| Teks SOP di `/portal/kebijakan` | Kenyataan di sistem |
|---|---|
| "Pemohon tidak dapat menyetujui aksesnya sendiri" | **Sesuai.** Dijaga di tiga tempat (keputusan, pencatatan, dan validitas izin). |
| "Persetujuan sebagian hanya memberikan tindakan yang disetujui" | **Sebagian besar sesuai.** CHANGE yang disetujui sebagian mencabut seluruh keputusan lama (C8). |
| "Rahasia … persetujuan Ketua atau pejabat yang memperoleh delegasi khusus" | **Belum sesuai** (C1). |
| "Tinjau paling lambat setiap tiga bulan" | **Belum dijalankan sistem** (G4). |
| "Pejabat yang memiliki konflik kepentingan tidak boleh mengendalikan persetujuan" | **Dijalankan, tapi tidak ada cara mendeklarasikan konflik** (G5). |
| F01 mencatat "batas waktu" | Kolom kondisi berakhir hanya disimpan, tidak dijalankan. Masa berlaku (`expiresAt`) dijalankan. |
| F02 mencatat "perubahan status" | Riwayat peninjauan berada di luar riwayat workflow (G7). |
| "Pencabutan dan pemulihan memakai permohonan F01 baru" | Hanya berlaku untuk pemegang akses sendiri (G3). |
| F03–F05 tersedia | **Sesuai.** Semuanya ada sebagai tab. |
| Dokumen 48: "Riwayat memuat pelaksana" | ✅ **Sesuai setelah perbaikan U3.** |

Rekomendasi: sampai C1, G3, G4, dan G5 diputuskan, tambahkan catatan singkat di halaman Kerahasiaan bahwa butir-butir itu masih dijalankan secara manual. Teks SOP sendiri tidak diubah karena merupakan dokumen resmi KPI.

---

## Pemeriksaan yang lolos

- **Rute pratinjau:** `/api/v1/documents/**` dan `/api/v1/meetings/**` mati di production. Keduanya mensyaratkan `KPI_APP_ENV=local` dan `KPI_TEST_AUTH_ENABLED=true`, jika tidak membalas 503.
- **Akses tabel langsung dengan JWT pengguna:** skema `work` dan `files` tidak bisa diakses ("permission denied for schema"). RLS aktif. Tabel `identity`/`org` hanya memperlihatkan baris milik pengguna sendiri.
- **RPC:** semua fungsi SECURITY DEFINER memakai `search_path=''` dan memeriksa izin berdasarkan organisasi/periode milik baris datanya sendiri. Mengganti ID atau kode di request tidak membuka akses.
- **Rahasia:** wajib keputusan F01 untuk objek tertentu. Keanggotaan saja, atau izin Terbatas untuk seluruh lingkup, ditolak (terverifikasi).
- **Unduhan:**
  - RPC izin dipanggil lebih dulu, lalu berkas dialirkan oleh server dengan `Content-Disposition: attachment`, `no-store`, dan `nosniff`.
  - Bucket `kpi-private` privat dan tidak memakai signed URL.
  - Berkas yang belum lolos pemindai tidak bisa diunduh.
- **Pengiriman ke publik:** konten dan aset harus berstatus Terbuka, tidak ditahan, dan tersedia.
- **Notifikasi:** izin sumber diperiksa ulang saat dibaca dan saat dikirim.
- **Penulisan rapat:** Origin request diperiksa. Persetujuan notulen wajib oleh orang lain (independen).
- **F01:**
  - Tidak bisa menyetujui permohonan sendiri.
  - Tidak bisa melebihi permohonan atau mandat.
  - Tidak bisa disetujui dua kali.
  - Permohonan yang ditolak tidak bisa diproses lagi.
  - Masa berlaku di masa lalu ditolak.
  - Konflik versi dan idempotensi bekerja.
  - Kode galat database tidak pernah tampil ke pengguna.
- **Hapus CONTOH:** tidak ada risiko cascade ke data resmi, karena tidak ada `ON DELETE CASCADE` pada `period_id`.

---

## Perubahan yang menunggu persetujuan

Semua butir di bawah memerlukan migration database. Belum ada yang dikerjakan. Sebelum menjalankan migration apa pun di production, cek dulu data yang ada (misalnya jumlah periode ACTIVE per organisasi dan F01 yang macet di status Disetujui).

| Paket | Isi | Risiko | Syarat |
|---|---|---|---|
| 1 | B1: cabut izin eksekusi dua RPC keputusan akses | Rendah. Hanya menutup jalan pintas, alur portal tidak berubah. | ✅ Disetujui. Migration `20261101003400` dilaporkan sudah dijalankan di production pada 1 November 2026, hasil belum diperiksa. |
| 2 | B2 + B3 + U12: periode baru selalu PLANNED, RPC aktivasi dengan rujukan, cegah dua periode aktif | Sedang. Mengubah cara aktivasi. | C3 |
| 3 | B4 + B5 + B6: perbaikan pelaksanaan F01 | Rendah–sedang | Persetujuan owner |
| 4 | G1 + G2: klasifikasi rapat dan klasifikasi saat unggah | Sedang. Menyentuh aturan baca. | C2, C7 |
| 5 | G3–G7: pelengkap SOP (pencabutan oleh pejabat, tinjauan tiga bulan, konflik, tarik permohonan, riwayat F02) | Sedang | C1, C5, C8 |
| UI | U9–U11: form F01 tanpa UUID, label izin, label periode "baca saja" | Rendah, tanpa migration | ✅ Selesai, kecuali sisa yang dicatat di tabel UX. Form F01 diuji di browser dengan data tiruan, belum dengan akun sungguhan. |
