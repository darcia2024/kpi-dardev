# Baseline Eksekusi Sistem Digital KPI PPMI Mesir

Status: E00 aktif. Dokumen ini menjadi catatan kerja implementasi, bukan perubahan pada empat instrumen hukum.

## Checkout kerja

| Item | Nilai |
|---|---|
| Repositori | `darcia2024/kpi-dardev` |
| Branch | `main` |
| Commit awal | `1c8f42d4ad574146360af82d9b3a19a3c35e9642` |
| Status awal | Rancangan statis HTML, CSS, dan JavaScript; belum ada runtime aplikasi, backend, migrasi, atau database operasional |
| Cakupan katalog | 113 layar, 61 entitas konseptual, 11 alur, 28 keputusan Q, 4 ringkasan dokumen hukum |
| Acuan produk | `../rancangan-ui-ux/`, `../rencana-pembangunan/`, dan dokumen eksekusi di `docs/` |

## Aturan kerja yang tidak boleh dilanggar

1. Basis data PostgreSQL/Supabase harus dibuat dan dimiliki KPI. Akses pengembang individual, minimum, sementara, dan dapat dicabut.
2. Data KPI tidak boleh digunakan untuk pelatihan AI. Lingkungan local/staging memakai data sintetis berlabel TEST.
3. Tidak ada data produksi, secret, kredensial, catatan kasus, dokumen internal, atau prompt sensitif di repo, log umum, screenshot, dan data demo.
4. Otorisasi diperiksa oleh server dan lapisan data. Hak lihat tidak sama dengan hak unduh, ekspor, ubah, review, atau publikasi.
5. Status, persetujuan, versi, dan aksi sensitif harus dapat ditelusuri. Pengulangan request tidak boleh menghasilkan efek bisnis ganda.
6. Nilai yang masih BELUM DITENTUKAN tidak boleh diisi dengan tebakan. Fitur yang bergantung pada nilai tersebut tetap aman dan nonaktif sampai ada keputusan.

## Keadaan fase

| Fase | Status | Catatan |
|---|---|---|
| E00: baseline, backlog, keputusan | Aktif | Artefak awal dibuat pada checkout ini |
| E01: fondasi runtime, data, CI | Aktif | Scaffold lokal TEST, migrasi awal, endpoint health, tes, dan CI tersedia. Supabase lokal, backup/restore staging, serta konfigurasi cloud menunggu environment dan keputusan KPI |
| E02–E14 | Belum mulai | Mengikuti dependency roadmap |

## Referensi

- [Roadmap eksekusi](../ROADMAP-EKSEKUSI-KPI.md) memuat fase E00–E14 dan kriteria lulusnya.
- [PRD](../PRD-KPI-PPMI-Mesir.md) memuat kebutuhan fungsional dan UAT.
- `rancangan-ui-ux/00-MULAI-DI-SINI.md` adalah ringkasan legal dan UI/UX per 17 September 2026.
- `rencana-pembangunan/00-KERANGKA-INDUK.md` adalah rencana teknis berstatus draf yang perlu direkonsiliasi sebelum dijadikan keputusan implementasi.

PRD dan roadmap kini berada pada root repositori KPI agar tersedia bersama artefak implementasi.
