# Paket Keputusan KPI untuk Memulai E01

Status: menunggu keputusan KPI. Dokumen ini tidak menyatakan persetujuan sudah diberikan.

Gunakan paket ini untuk merekam keputusan sebelum aplikasi, akun cloud, atau data institusi dipakai. Isi nama, tanggal, dan bukti pada register keputusan setelah KPI mengambil keputusan.

## Keputusan fondasi

| ID | Keputusan yang diminta | Nilai yang perlu dicatat | Status |
|---|---|---|---|
| D-01 | Arsitektur aplikasi | Setujui/tolak usulan Next.js App Router, TypeScript strict, modular monolith, REST API berversi, dan migrasi SQL | Disetujui untuk scaffold lokal TEST lewat instruksi pengguna, 21 September 2026 |
| D-02 | Data dan otorisasi | Setujui/tolak Supabase PostgreSQL dengan RLS, validasi server, audit, dan storage privat | Disetujui sebagai rancangan lokal lewat instruksi pengguna, 21 September 2026 |
| D-03 | Kepemilikan akun | Nama owner KPI untuk GitHub, Supabase, hosting, domain, dan penyimpanan backup | Menunggu |
| D-04 | Lingkungan | Region local/staging/produksi, aturan data TEST, serta siapa yang dapat mengakses setiap lingkungan | Menunggu |
| D-05 | Penyedia layanan | Hosting, email, pemindai berkas, monitoring, backup, region, biaya, dan penanggung biaya | Menunggu |
| D-06 | Alat coding dan AI | Penyedia yang boleh menerima kode/rancangan, lokasi pemrosesan, retensi, dan pengaturan tanpa pelatihan data KPI | Diizinkan pengguna untuk pekerjaan ini dengan kode/rancangan dan data TEST saja, 21 September 2026. Register subprosesor KPI masih perlu dilengkapi sebelum data nyata. |
| D-07 | Aset dan konten | Logo, domain, konten ID/EN, owner editorial, serta data yang boleh digunakan dalam seed/demo | Menunggu |

## Keputusan produk yang boleh menyusul

| Area | Keputusan minimum sebelum fitur aktif |
|---|---|
| Akun | Mapping jabatan, masa sesi, rate limit, alur pemulihan MFA, dan reviewer pengganti |
| Dokumen | Allowlist berkas, retensi, legal hold, serta siapa yang menyetujui klasifikasi |
| Aduan | Privasi, token tracking, expiry/recovery, SLA yang benar-benar dapat dipenuhi, dan penanggung jawab triage |
| Voting | Quorum, putaran, koreksi, pembatalan, dan otoritas finalisasi |
| Keuangan | Periode, mata uang, kurs, ambang nominal, pemisahan tugas, dan kewenangan reopen |
| Evaluasi | Formula, bobot, rubrik, perbandingan lintas divisi, koreksi, dan sanggah |
| AI produk | Provider, model, sumber yang boleh diakses, retensi, review manusia, dan register prompt |
| Operasi | RPO/RTO, kapasitas, target performa, kanal insiden, dan jadwal restore drill |

## Catatan keputusan

| Tanggal | ID | Keputusan | Bukti/tautan | Pemberi keputusan |
|---|---|---|---|---|
|  |  |  |  |  |

Catatan: persetujuan di atas hanya membuka scaffold lokal dan pekerjaan dengan data TEST. Persetujuan production, pemilik akun KPI, region, biaya, dan penyedia layanan tetap menunggu keputusan D-03 sampai D-05.

Setelah D-01 sampai D-06 memiliki keputusan tertulis, E01 dapat dimulai dengan data TEST saja. Pembuatan produksi atau penggunaan data nyata masih memerlukan owner akun, klasifikasi data, konfigurasi keamanan, dan gerbang rilis yang lengkap.
