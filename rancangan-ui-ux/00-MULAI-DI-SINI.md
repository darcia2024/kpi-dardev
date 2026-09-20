# Rancangan UI/UX KPI PPMI Mesir

Tanggal Acuan Pemutakhiran: 17 September 2026 (Diperbarui dari draf awal 5 September 2026)

Status: Rancangan arsitektur dan cetak biru implementasi telah diselaraskan dengan 4 dokumen hukum resmi (PPD-001, PKS-002, NDA-003, PHHP-004) tertanggal 17 September 2026 di Kairo, Mesir.

## Para Pihak Resmi

Berdasarkan perjanjian resmi tertanggal 17 September 2026:
- **Pihak Pertama (Pengendali Data / Pemilik Sistem):**
  1. **Muhammad Abdullah Mubarak** — Ketua Komisi Peduli Interaksi (KPI)
  2. **Wildan Akbar Fathurahman** — Presiden PPMI Mesir Periode 2026–2027
- **Pihak Kedua (Prosesor Data / Developer Sistem):**
  - **Daru Fahmaa Muliawan** — Developer / Penyedia Jasa Pengembangan Sistem (Dar Dev)

## Cara membaca

1. [Design system](01-DESIGN-SYSTEM.md): arah visual Apple HIG, token usulan, perilaku komponen, aksesibilitas.
2. [Peta dan spesifikasi layar](02-PETA-LAYAR.md): navigasi, tujuan, konten, aksi, dan batas akses per layar.
3. [Alur dan wireframe](03-ALUR-WIREFRAME.md): perjalanan pengguna, wireframe struktural desktop/mobile, state dan pesan.
4. [Tahapan dan pemeriksaan cakupan](04-TAHAPAN-CAKUPAN.md): dependensi desain, pembagian frontend/backend/database, timeline kontrak 4 fase (4 minggu), gap, serta kriteria review.

## Tujuan pengalaman

Publik dapat mengenali KPI, menemukan publikasi, serta menyampaikan aspirasi. Pengurus dapat mengetahui pekerjaan dan keputusan yang perlu ditangani. Pimpinan dapat melihat informasi sesuai mandat. Pergantian kepengurusan mempertahankan pengetahuan tanpa otomatis membuka semua arsip kepada pengurus baru.

KPI berarti Komisi Peduli Interaksi, PPMI Mesir. Angka kinerja hanya salah satu bagian ekosistem.

## Status informasi

- **Baseline sumber**: kebutuhan yang dinyatakan dalam dokumen pengguna serta 4 dokumen hukum resmi 17 September 2026.
- **Usulan desain**: tata letak, pengelompokan menu, token, rute konseptual, dan interaksi dalam paket ini.
- **Keputusan resmi yang telah disahkan**: Identitas pihak resmi (PKS/PPD), larangan pelatihan AI menggunakan data KPI (PPD Pasal 3), kepemilikan database Supabase oleh KPI (PPD Pasal 5/PKS Pasal 10), jadwal 4 fase durasi 1 bulan (PKS Pasal 6), serta masa pemeliharaan 3 bulan & pengkaderan personel (PKS Pasal 12).

## Sumber kebutuhan & Dokumen Hukum

Seluruh 13 sumber teknis awal dan 4 instrumen hukum formal telah dipelajari dan diintegrasikan:

### A. Dokumen Legal & Kontrak (17 September 2026)
| Kode | Nomor Perjanjian | Nama Dokumen | Poin Kunci yang Ditetapkan |
|---|---|---|---|
| PPD | 001/PPD-KPI/IX/2026 | Perjanjian Pengolahan & Perlindungan Data | Larangan pelatihan AI pada data KPI (Pasal 3), kontrol penuh database Supabase oleh KPI (Pasal 5), akses minimum dev |
| PKS | 002/PKS-KPI/IX/2026 | Perjanjian Kerja Sama Pengembangan | Timeline 4 fase (1 bulan), nilai all-in Rp14.200.000, domain .org 2 tahun, masa pemeliharaan 3 bulan & pengkaderan |
| NDA | 003/NDA-KPI/IX/2026 | Perjanjian Kerahasiaan (Non-Disclosure) | Batas kerahasiaan informasi internal, kredensial, larangan salin data produksi ke dev, penanganan insiden |
| PHHP| 004/PHHP-KPI/IX/2026 | Perjanjian Penyerahan Hak (Hasil Pengembangan) | Penyerahan penuh source code, database, hak kekayaan intelektual, larangan backdoor, alih pengetahuan |

### B. Dokumen Arsitektur & Spesifikasi Modul (13 Dokumen Sumber)
| Kode | Dokumen di C:/Users/ASUS/Downloads/ | Bagian utama yang dipakai |
|---|---|---|
| B | Blueprint_Sistem_Digital_KPI.docx | 2–13, 16: ruang lingkup, kendali manusia, bahasa dan koneksi |
| M | Master_Architecture_KPI_v1.0.docx | C–G, J–P: menu, workflow, permission, memori |
| T | Technical_Architecture_KPI_v1.0.docx | 8–16: auth, API, files, search, AI, batas publik |
| R | Role_Permission_Matrix_KPI_v1.0.docx | 5–19: scope, classification, approval, export |
| U | UI_UX_Architecture_KPI_v1.0.docx | 3–29: sistem visual, layar, state, acceptance |
| D | Development_Specification_KPI_v1.0.docx | 4–19, 23–25: modul dan kriteria selesai |
| DB | Database_Architecture_ERD_KPI_v1.0.docx | 4–14: relasi, histori, versi, consistency |
| A | Granular_Module_Specification_AUTH_CORE_AUDIT_KPI_v1.0.docx | 3–20: sesi, identitas, audit |
| TK | Granular_Module_Specification_TASK_KPI_v1.0.docx | 2–22: task UX dan aturan penyelesaian |
| ME | Granular_Module_Specification_MEET_KPI_v1.0.docx | 3–17: rapat, voting, notulen, arsip |
| DO | Granular_Module_Specification_DOC_KPI_v1.0.docx | 3–17: upload, versi, klasifikasi, sharing |
| K | Granular_Module_Specification_KNOW_KPI_v1.0_fixed.docx | 2–13: knowledge, review, retrieval |
| C | Granular_Module_Specification_CMS_PUB_KPI_v1.0.docx | 3–27: bahasa, editorial, publishing, public-safe |

## Batas kelengkapan

Paket ini merancang cakupan layar, arsitektur teknis, dan interaksi seluruh modul yang disebut sumber. Handoff implementasi kode mengacu pada jadwal 4 fase pada PKS dan klausul penyerahan hak cipta pada PHHP.
