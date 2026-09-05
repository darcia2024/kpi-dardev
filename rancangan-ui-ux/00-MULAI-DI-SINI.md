# Rancangan UI/UX KPI PPMI Mesir

Tanggal: 5 September 2026

Status: rancangan untuk review, belum persetujuan implementasi. Tidak ada kode aplikasi, migration, atau deployment dalam paket ini. Tiga gambar sebelumnya merupakan eksplorasi; bukan desain final.

## Cara membaca

1. [Design system](01-DESIGN-SYSTEM.md): arah visual Apple HIG, token usulan, perilaku komponen, aksesibilitas.
2. [Peta dan spesifikasi layar](02-PETA-LAYAR.md): navigasi, tujuan, konten, aksi, dan batas akses per layar.
3. [Alur dan wireframe](03-ALUR-WIREFRAME.md): perjalanan pengguna, wireframe struktural desktop/mobile, state dan pesan.
4. [Tahapan dan pemeriksaan cakupan](04-TAHAPAN-CAKUPAN.md): dependensi desain, pembagian frontend/backend/database, gap, serta kriteria review.

## Tujuan pengalaman

Publik dapat mengenali KPI, menemukan publikasi, serta menyampaikan aspirasi. Pengurus dapat mengetahui pekerjaan dan keputusan yang perlu ditangani. Pimpinan dapat melihat informasi sesuai mandat. Pergantian kepengurusan mempertahankan pengetahuan tanpa otomatis membuka semua arsip kepada pengurus baru.

KPI berarti Komisi Peduli Interaksi, PPMI Mesir. Angka kinerja hanya salah satu bagian ekosistem.

## Status informasi

- **Baseline sumber**: kebutuhan yang dinyatakan dalam dokumen pengguna.
- **Usulan desain**: tata letak, pengelompokan menu, token, rute konseptual, dan interaksi dalam paket ini. Dapat direvisi.
- **Perlu keputusan**: aturan organisasi yang bertentangan atau belum ditetapkan. Tercatat pada dokumen tahapan.

Nama jabatan nyata, identitas visual resmi, foto kegiatan, isi publikasi, angka statistik, dan periode aktif belum ditentukan. Tidak boleh diisi dengan klaim buatan pada produk. Data prototype kelak diberi label “Data contoh”. Logo resmi menunggu aset pengguna; sementara cukup teks KPI / PPMI Mesir.

## Sumber kebutuhan

Seluruh 13 sumber telah dibaca pada tahap kajian sebelumnya. Locator berikut memakai bagian dokumen, bukan nomor halaman yang belum diverifikasi.

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

Paket ini merancang cakupan layar dan interaksi seluruh modul yang disebut sumber. Ini belum berupa file Figma, prototype klik, spesifikasi API final, atau validasi usability. Gap kebijakan tetap terlihat dan tidak dianggap selesai hanya karena layarnya sudah dirancang.
