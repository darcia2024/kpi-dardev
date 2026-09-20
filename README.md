# Sistem Digital KPI PPMI Mesir

Repositori ini memuat blueprint dan implementasi bertahap Sistem Digital KPI PPMI Mesir. Blueprint mencakup 113 layar, 61 entitas konseptual, 11 alur, 28 keputusan, dan ringkasan empat dokumen hukum per 17 September 2026.

Implementasi berada pada fase E01. Aplikasi Next.js yang baru berisi fondasi runtime, validasi environment, endpoint health, migrasi platform awal, data TEST, dan pemeriksaan CI. Fitur bisnis belum tersedia untuk penggunaan produksi.

## Dokumen kerja

| Berkas | Keterangan |
|---|---|
| `PRD-KPI-PPMI-Mesir.md` | Kebutuhan produk, tata kelola, UAT, dan keputusan terbuka |
| `ROADMAP-EKSEKUSI-KPI.md` | Urutan E00 sampai E14, gerbang penerimaan, dan serah terima |
| `docs/` | Baseline, keputusan, cakupan, paket keputusan KPI, dan backlog E01 |
| `rancangan-ui-ux/` | Blueprint UI/UX dan ringkasan cakupan per 17 September 2026 |
| `rencana-pembangunan/` | Rencana teknis yang masih memuat ADR usulan |
| `supabase/` | Migrasi dan data seed TEST untuk pengembangan lokal |

## Menjalankan fondasi lokal

Gunakan Node.js 20.9 atau lebih baru. Local dan staging hanya boleh memakai data sintetis TEST.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Health check tersedia pada `http://localhost:3000/api/v1/health` saat environment valid.

Jalankan pemeriksaan sebelum review:

```powershell
npm run verify
```

Supabase CLI dan runtime Docker belum tersedia pada mesin kerja saat E01 dimulai. Migrasi SQL sudah disimpan di repo, tetapi belum dijalankan terhadap database lokal atau remote.

## Aturan data

Database dan akun produksi berada di bawah kepemilikan KPI. Jangan masukkan data produksi, kredensial, isi kasus, file internal, atau prompt sensitif ke repositori. Data KPI tidak boleh digunakan untuk pelatihan model AI.
