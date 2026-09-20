# Register Keputusan dan Gerbang E00

Status: perlu ditutup atau diberi keputusan eksplisit sebelum pekerjaan yang bergantung dimulai.

## Gerbang wajib sebelum E01

| ID | Keputusan/bukti yang dibutuhkan | Pemilik | Dampak bila terbuka |
|---|---|---|---|
| E00-G01 | KPI menyetujui ADR yang dipakai, region, dan daftar subprosesor produk | KPI | Stack, lingkungan, dan layanan nyata belum boleh dikunci |
| E00-G02 | KPI menyetujui alat bantu coding/AI yang menerima repo atau paket rancangan, termasuk lokasi pemrosesan, retensi prompt, dan larangan pelatihan | KPI | Paket tidak boleh diserahkan ke penyedia tersebut menurut rencana kerja |
| E00-G03 | KPI menetapkan klasifikasi data untuk local, staging, demo, dan produksi | KPI | Hanya data sintetis TEST boleh dipakai |
| E00-G04 | KPI menyetujui paket layanan dan penanggung biaya pascaserah terima | KPI | Pengadaan Supabase, hosting, backup, pemindaian, email, dan AI belum final |
| E00-G05 | Organisasi GitHub, Supabase, dan hosting atas nama KPI beserta owner ditetapkan | KPI + lead | Lingkungan cloud tidak dibuat |

## Keputusan produk yang dapat ditutup bertahap

| ID | Keputusan | Memblokir |
|---|---|---|
| OD-01 | Mapping akun, jabatan, reviewer pengganti, dan konflik kepentingan | E02 dan semua approval bisnis |
| OD-02 | Masa sesi, rate limit, expiry/reset MFA | E02 go-live |
| OD-03 | Quorum, putaran, koreksi, dan finalisasi voting | E06 |
| OD-04 | Allowlist file, retensi per jenis, dan legal hold | E03/E10 |
| OD-05 | SLA kasus, expiry/recovery token, privasi dan prosedur anonim | E04/E07 |
| OD-06 | Indikator, bobot, rubrik, koreksi dan sanggah evaluasi | E09 |
| OD-07 | Periode keuangan, mata uang, kurs, ambang nominal dan kewenangan persetujuan | E08 |
| OD-08 | Provider/model AI, region, retensi, model/prompt yang disetujui | E11 |
| OD-09 | RPO/RTO, target performa, volume data dan saluran insiden | E12/E13 |
| OD-10 | Logo/aset asli, konten resmi ID/EN, dan nama domain | E04 konten produksi |
| OD-11 | Pemetaan fase untuk 39 layar yang belum eksplisit di jadwal kontrak | Komitmen cakupan E01–E14 |

## Catatan rekonsiliasi

- Ringkasan 17 September menyebut pemeliharaan tiga bulan. Rencana teknis 15 September masih menyebut 30 hari. Implementasi menggunakan tiga bulan sebagai baseline dokumentasi, kemudian mencocokkan naskah kontrak asli saat BAST.
- Ringkasan kontraktual meletakkan aspirasi/tracking pada fase 1, sementara rencana teknis lama menundanya hingga fase 3. Form penerimaan tidak akan diaktifkan sebelum triage dan pembaruan aman siap.
- Rencana teknis menyebut Next.js, TypeScript, Supabase, SQL migration, dan RLS sebagai usulan ADR. Belum ada keputusan implementasi yang dapat dianggap final hanya dari file itu.
