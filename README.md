# Sistem Digital KPI PPMI Mesir

Repositori ini memuat blueprint dan implementasi bertahap Sistem Digital KPI PPMI Mesir. Blueprint mencakup 113 layar, 61 entitas konseptual, 11 alur, 28 keputusan, dan ringkasan empat dokumen hukum per 17 September 2026.

Implementasi memiliki UI dan sebagian workflow TEST. Backend masih dikerjakan; kelulusan build dan unit test belum membuktikan semua workflow lengkap. Peta status yang mudah dibaca ada di `docs/22-STATUS-BUILD-SAAT-INI.md`, dengan rincian backend di `docs/20-BACKEND-COMPLETION.md`.

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

Gunakan Node.js 24 atau lebih baru. Local dan staging hanya boleh memakai data sintetis TEST. Workflow TEST untuk CMS, aspirasi, metadata aset, tugas, rapat, keuangan, evaluasi, knowledge, handover, izin, dan konfirmasi preview AI memakai SQLite lokal di `.kpi-test/records.sqlite`, yang dikecualikan dari Git. Sebagian UI masih memakai data demo, dan SQLite ini bukan pengganti pengujian PostgreSQL/RLS produksi.

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

Migrasi SQL sudah disimpan di repo, tetapi belum dijalankan terhadap database lokal atau remote karena runtime Docker/PostgreSQL belum tersedia pada mesin kerja. Lihat `docs/19-LOCAL-RELEASE-READINESS.md` untuk bukti local TEST, defect register, dan gerbang rilis.

## Aturan data

Database dan akun produksi berada di bawah kepemilikan KPI. Jangan masukkan data produksi, kredensial, isi kasus, file internal, atau prompt sensitif ke repositori. Data KPI tidak boleh digunakan untuk pelatihan model AI.
