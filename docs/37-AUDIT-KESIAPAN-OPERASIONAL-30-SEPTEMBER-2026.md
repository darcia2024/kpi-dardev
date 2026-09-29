# Audit kesiapan operasional — 30 September 2026

Pertanyaan audit: **apa saja yang masih harus dibangun dan dipenuhi agar website dan portal KPI PPMI Mesir 100% selesai dan bisa beroperasi dengan data nyata.**

Dasar: [kerangka induk](../rencana-pembangunan/00-KERANGKA-INDUK.md) (17 modul, 113 layar, 11 alur, 4 fase PKS), [peta layar](../rancangan-ui-ux/02-PETA-LAYAR.md), [katalog 98 layar internal](../src/lib/internal-screen-registry.ts), [kesiapan produksi 23 Sep](./31-KESIAPAN-PRODUKSI-23-SEPTEMBER-2026.md), [pemisahan 40 layar](./34-RENCANA-40-LAYAR-DAN-KEPASTIAN.md), [audit lanjutan 24 Sep](./36-AUDIT-KELANJUTAN-20-LAYAR.md), serta pemeriksaan langsung kode di `main` (`fc15971`).

## 1. Kesimpulan

**Status: pratinjau lokal yang matang, belum sistem operasional.** Antarmuka dan aturan bisnis sudah jauh berjalan, tetapi hampir seluruh data masih tersimpan di penyimpanan lokal pratinjau. Database produksi, storage, email, dan akun resmi KPI belum ada.

| Lapisan | Perkiraan kemajuan | Dasar perkiraan |
|---|---|---|
| Rancangan & keputusan arah | ±90% | 28 usulan disetujui; 10 jawaban klien 23 Sep; 4 dokumen hukum revisi 17 Sep |
| Layar internal (UI + aturan, data lokal) | ±60% | 58 dari 98 layar `connected` secara lokal, 40 `partial` |
| Website publik (15 layar P01–P15) | ±45% | 7 layar jadi, 4 parsial, 4 belum ada; bahasa Inggris belum ada |
| Backend produksi (Supabase) | ±10% | 16 tabel; 0 policy RLS; modul kerja belum punya tabel |
| Infrastruktur, keamanan, serah terima | ±5% | Belum ada akun milik KPI, domain, backup, runbook, dokumen serah terima |
| **Siap beroperasi dengan data nyata** | **belum** | Gerbang hari-0 dan gerbang go-live belum tertutup |

Angka persen adalah perkiraan auditor untuk membantu prioritas, bukan hasil UAT.

## 2. Yang sudah terbukti

- `npm run verify` lulus pada 30 Sep 2026: TypeScript bersih, **101 tes** lulus, build Next.js berhasil. CI GitHub menjalankan perintah yang sama.
- 29 rute halaman (12 publik/login, 17 portal) dan 62 endpoint API tersedia.
- Aturan penting sudah diuji secara lokal: MFA, sesi, grant akses dan pencabutannya, konteks periode, review dua akun, larangan menyetujui sendiri, audit aktor/objek, pemeriksaan ulang izin saat unduh.
- Pengaman "jangan bocor ke produksi": akun, formulir, dan data pratinjau ditolak di luar lingkungan lokal.
- Situs publik ter-deploy di `kpi-ppmi-mesir-preview.vercel.app`; login Supabase sudah disiapkan kodenya tetapi belum aktif.

## 3. Yang masih harus dibangun atau dipenuhi

### 3.1 Gerbang dari KPI (memblokir semua pekerjaan produksi)

Tidak bisa dikerjakan developer. Tanpa ini, pembangunan produksi tidak boleh dimulai (kerangka induk §2.0, §8).

| No | Yang dibutuhkan | Rujukan |
|---|---|---|
| G1 | PKS, PPD, NDA, PHHP ditandatangani; Termin 1 dibayar (jadwal 4 minggu dihitung dari sini) | Kerangka §7.2 |
| G2 | Persetujuan tertulis ADR-001..010, region Supabase/Vercel, daftar subprosesor (hosting, DB, email, AI, scanner, monitoring) | `RILIS-E00-T01` |
| G3 | Persetujuan tertulis penyedia AI dan alat bantu coding yang membaca repo ini | `RILIS-E00-T02`, K8 |
| G4 | Klasifikasi data per lingkungan (dev/uji/demo/produksi) | `RILIS-E00-T03` |
| G5 | Paket langganan, biaya, dan penanggung biaya setelah serah terima | `RILIS-E00-T04` |
| G6 | Organisasi GitHub, Supabase, dan Vercel **atas nama KPI**; produksi terpisah dari staging, nol anggota developer di produksi | `RILIS-E00-T05`, K4 |
| G7 | Domain .org atas nama KPI (2 tahun) di registrar milik KPI | K21 |

Catatan: repo saat ini ada di akun GitHub pribadi dan proyek Vercel dibuat oleh developer. Keduanya harus dipindahkan ke organisasi milik KPI (K4, K12).

### 3.2 Data dan kebijakan resmi dari KPI

| Kelompok | Yang harus diserahkan | Layar yang tertahan |
|---|---|---|
| Struktur & orang | Bagan final, daftar akun–jabatan–divisi–periode, pemisahan Sekretaris vs Sekjend, petugas kasus, evaluator, pemegang grant | A07–A09, S03, H04 |
| Kasus & aduan | SOP triage/penutupan, SLA per urgensi, eskalasi, jenis layanan, kolom wajib, teks consent, identitas pelapor & token | S07–S09, P12–P13 |
| Retensi & file | Jadwal retensi, legal hold, klasifikasi berkas, allowlist tipe/ukuran | A14, F02, F06 |
| Keuangan | Anggaran, pos, periode, mata uang/kurs, jenis klaim, ambang approval | B01–B03 |
| Evaluasi | Subjek, indikator, bobot/formula, evaluator, jendela sanggah | E02, E04, E08 |
| Notifikasi | Event wajib vs opsional, teks resmi ID/EN, kanal | N02–N04 |
| AI | Aktif/tidak, provider/model/region, retensi, kelas data, aksi yang boleh | I01–I06 |
| Konten publik | 28 dokumen (berkas no. 26 belum diterima), profil, visi-misi, sejarah, foto berizin, publikasi, versi bahasa Inggris | P02, P05–P10 |
| Penerimaan | Nama peserta UAT (Ketua + tim website), skenario, kriteria lulus | Semua |

### 3.3 Backend produksi (pekerjaan developer terbesar)

Saat ini hanya organisasi dan login yang membaca Supabase. Modul lain menyimpan data lewat `local-record-store` dan `local-private-blob-store` ke folder `.kpi-test`.

1. **Skema database lengkap.** Sekarang ada 16 tabel (organisasi, periode, akun, peran, jabatan, penugasan, konten, aset, approval, aspirasi, audit, konfigurasi, divisi). Belum ada tabel untuk tugas, rapat, dokumen berversi & grant, knowledge, kasus, notifikasi & outbox, keuangan, evaluasi, handover, dan AI.
2. **Policy RLS.** RLS sudah dinyalakan di 16 tabel tetapi **tidak ada satu pun policy**, sehingga otorisasi dua lapis (ADR-002) belum ada. Perlu policy per tabel beserta tes pgTAP.
3. **Adapter produksi per modul.** Ganti penyimpanan lokal di sekitar 22 file service dengan repository Supabase, tanpa mengubah kontrak API yang sudah diuji.
4. **Storage privat + scanner malware** (ADR-004): karantina sampai lolos pemindaian, URL bertanda tangan, audit akses.
5. **Outbox + cron worker** (ADR-005) untuk notifikasi, jadwal publikasi, auto-expire grant, dan pengingat.
6. **Email transaksional** (N04) dengan status kirim/gagal/retry dari provider.
7. **Auth produksi**: aktivasi Supabase Auth, MFA TOTP, reset/pemulihan akun, logout semua sesi, step-up PIN milik KPI (ADR-008).
8. **Pencarian** Postgres FTS dengan filter izin (ADR-006) untuk portal dan P14.
9. **Backup terkelola + uji restore** (ADR-010, A15), health check nyata (A16), konfigurasi teredaksi (A12).

### 3.4 Layar internal: 40 layar parsial

| Kelompok | Layar parsial | Bisa dikerjakan sekarang (data sintetis) | Menunggu KPI / layanan |
|---|---|---|---|
| Akun & akses | A07, A08, A09, A12, A14, A15, A16 | A07, A08, A09 | A14 (retensi), A12/A15/A16 (infrastruktur) |
| Dokumen | F02–F06 | F03, F04, F05 | F02 (storage/scanner), F06 (retensi) |
| Knowledge | K01–K04 | semua (sebagian sudah) | isi/SOP resmi |
| Redaksi | C05 | — | storage/scanner |
| Kasus | S03, S05–S09 | S03, S05, S06 | S07–S09 (SOP, SLA) |
| Notifikasi | N02–N04 | N03 | N02 (event wajib), N04 (email) |
| Keuangan | B01–B03 | B02 | B01, B03 (anggaran, approval) |
| Evaluasi | E02, E04, E08 | E04, E08 | E02 (indikator/formula) |
| Handover | H04, H06 | H06 | H04 (pengesahan grant) |
| AI | I01–I06 | I02, I06 | I01, I03–I05 (provider & kebijakan) |

Dokumen 36 mencatat sebagian besar pekerjaan "bisa dikerjakan sekarang" sudah dibangun secara lokal, tetapi statusnya sengaja belum dinaikkan ke `connected`.

### 3.5 Website publik (P01–P15)

| Layar | Status | Yang kurang |
|---|---|---|
| P01 Beranda | Ada | Blok konten masih statis, belum dari CMS |
| P02 Tentang | Parsial | Belum ada halaman khusus visi-misi, kewenangan, sejarah, periode |
| P03 Struktur | Ada | Pemilih periode publik |
| P04 Divisi | Ada | — |
| P05 Program & kegiatan | Ada (statis) | Filter periode/jenis/status, detail kegiatan dari CMS |
| P06 Berita | Ada (statis) | Detail berita dari CMS |
| P07 Publikasi | Parsial | Baru satu contoh; katalog dibaca dari SQLite lokal |
| P08 Repository | **Belum ada** | Pencarian metadata, sitasi |
| P09 Data & statistik | **Belum ada** | Dataset, chart, tabel, unduhan |
| P10 Transparansi | **Belum ada** | Laporan capaian dan unduhan |
| P11 Layanan | Ada | — |
| P12 Kirim aspirasi/pengaduan | Lokal saja | Aktif hanya setelah SOP kasus, S03/S04, dan storage siap (ketegangan T3) |
| P13 Pelacakan | Parsial | Token pelacakan produksi, masa berlaku |
| P14 Pencarian publik | **Belum ada** | FTS hanya konten terbit |
| P15 Preferensi & bantuan | Parsial | Tema ada; **bahasa Inggris belum ada sama sekali**, ukuran teks, reduce motion |

PKS fase 1 menjanjikan "Website Publik & CMS **Bilingual**". Dukungan bahasa Inggris (routing, konten versi EN, fallback yang tidak memakai draf) belum dibangun.

Di root repo juga masih ada situs rancangan statis (`index.html`, `beranda.html`, `public.html`, `app.js`, `styles.css`). File itu tidak ikut disajikan Next.js, tetapi sebaiknya dipindah ke folder terpisah agar tidak membingungkan.

### 3.6 Mutu dan keamanan

- Tes E2E Playwright di beberapa ukuran layar dan uji aksesibilitas (standar 6.4) belum ada.
- Tes pgTAP untuk RLS (standar 6.3) belum ada.
- gitleaks, SBOM, dan daftar komponen/lisensi di CI (K6, K13) belum ada.
- Header keamanan HTTP, rate limit, dan antispam formulir publik perlu diverifikasi di lingkungan produksi.
- Uji keamanan, uji performa, uji restore, dan UAT dengan Ketua + tim website (fase 4).

### 3.7 Deliverable serah terima (fase 4, wajib kontrak)

Belum ada satu pun: runbook insiden (K9), dokumentasi teknis lengkap (K15), panduan admin/pengurus/editor CMS dan sesi pelatihan (K22), daftar komponen pihak ketiga (K13), Berita Acara Serah Terima (K16, K18), checklist penghapusan data dan pembersihan data TEST (K10, K24), serta daftar akun tanpa backdoor (K14).

## 4. Urutan kerja yang disarankan

1. **Minggu 0: KPI menutup gerbang G1–G7.** Paling mendesak: tanda tangan kontrak, akun organisasi milik KPI, persetujuan subprosesor, dan domain.
2. **Fondasi produksi.** Staging + produksi Supabase/Vercel milik KPI, skema lengkap + policy RLS + pgTAP, auth produksi dengan MFA, audit, CI dengan gitleaks.
3. **Fase 1: website publik + CMS bilingual.** Konten dari CMS, bahasa Inggris, P02/P08/P09/P10/P14, storage aset publik. Formulir aduan tetap nonaktif.
4. **Fase 2: portal inti.** Akses & periode, dokumen + storage + scanner, tugas, notifikasi in-app. Pindahkan adapter lokal ke Supabase modul demi modul.
5. **Fase 3: operasional.** Rapat, kasus + aduan publik (setelah SOP), knowledge, keuangan, evaluasi, admin (backup/restore, health), email.
6. **Fase 4: AI, handover, hardening.** AI hanya jika disetujui, uji keamanan/performa/restore, UAT, dokumentasi, pelatihan, BAST, lalu pemeliharaan 30 hari.

Modul yang bergantung pada keputusan KPI tetapi keputusannya belum datang harus **dimatikan (flag off)**, bukan dirilis setengah jalan (kerangka §7.3, P2).

## 5. Risiko utama

- **Jadwal:** 17 modul, 113 layar, 11 alur dalam 4 minggu dengan nilai Rp14,2 juta (ketegangan T4). Kemungkinan besar sebagian fase 3–4 perlu change request.
- **Keputusan terlambat:** tiap hari gerbang hari-0 tertunda langsung memotong fase 1 (T5).
- **Kepemilikan:** selama repo, hosting, dan domain belum atas nama KPI, kewajiban K4/K12 belum terpenuhi.
- **Data aduan:** membuka formulir sebelum SOP, akses kasus, dan storage siap berisiko terhadap data pelapor (T3).
