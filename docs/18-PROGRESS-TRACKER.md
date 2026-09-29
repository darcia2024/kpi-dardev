# Tracker Pembangunan Menuju Produk KPI Siap Operasional

> **Catatan terbaru (23 September 2026):** dokumen ini menyimpan riwayat implementasi awal. Status build yang berlaku sekarang ada di [22-STATUS-BUILD-SAAT-INI.md](22-STATUS-BUILD-SAAT-INI.md). Label “selesai lokal” di bawah tidak berarti layar sudah terhubung ke backend atau sistem siap operasional.

Status per 22 September 2026. Tracker ini memisahkan pekerjaan yang dapat diselesaikan secara lokal dengan data TEST dari aktivasi yang membutuhkan keputusan atau layanan milik KPI.

## Ringkasan progres

**Dikoreksi: backend belum selesai. Klaim 10/10 sebelumnya ditarik.** Status aktif ada di `docs/20-BACKEND-COMPLETION.md`. Tabel di bawah adalah catatan implementasi awal, bukan bukti penerimaan seluruh modul. Angka end-to-end 1/10 sebelumnya juga tidak memiliki matriks hasil yang cukup untuk dipakai sebagai ukuran kelengkapan.

Angka ini adalah jumlah langkah pembangunan, bukan klaim bahwa produk sudah 10% siap produksi. Setiap langkah hanya dapat ditandai selesai setelah bukti yang tercantum tersedia.

| No. | Langkah | Status | Bukti selesai | Batas yang ditunda |
|---:|---|---|---|---|
| 1 | Audit cakupan, dependensi, dan backlog | Selesai | 113 ID terhitung dalam 14 kelompok; setiap kelompok sudah memiliki fase, ketergantungan, dan kriteria penerimaan awal | Nama layar, owner UAT, dan requirement rinci per ID menunggu keputusan cakupan KPI |
| 2 | Database TEST dan repository aplikasi | Selesai lokal; verifikasi database ditunda | Seed memiliki ID deterministik untuk organisasi, periode, akun, role, jabatan, dan assignment TEST; repository TEST/Supabase serta tesnya tersedia | Menjalankan migration terhadap PostgreSQL lokal memerlukan Docker yang belum tersedia; Supabase/hosting milik KPI dan data nyata tetap ditunda |
| 3 | Identitas, sesi, dan izin per aksi | Selesai lokal; persistence data layer ditunda | Cookie sesi TEST bertanda tangan, expiry, pencabutan, grant eksplisit per aksi/scope, serta endpoint konteks portal yang menolak akses tanpa scope tepat | Mapping jabatan/reviewer, kebijakan sesi KPI, persistence pencabutan, dan RLS database |
| 4 | CMS, konten publik, dan publikasi | Selesai lokal; persistence data layer ditunda | Repository konten TEST, API draf/transisi, permission editorial terpisah, dan katalog publik hanya membaca state `PUBLISHED` | Konten ID/EN, editorial owner resmi, persistence Supabase, metadata/search production |
| 5 | Dokumen, file, dan storage privat | Selesai lokal; storage fisik ditunda | Registry metadata TEST, validasi, status scan, versi, akses baca, dan pencabutan recipient teruji | Private object storage, scanner, allowlist resmi, retensi, dan legal hold |
| 6 | Aspirasi, kasus, dan notifikasi | Selesai lokal; layanan resmi ditunda | Pengiriman idempoten, token tracking ter-hash, triage, pemisahan update pelapor/catatan internal, serta outbox notifikasi TEST | SLA, prosedur anonim, retensi, kanal email/pesan resmi, dan petugas produksi |
| 7 | Workspace, tugas, rapat, dan keputusan | Selesai lokal; persistence data layer ditunda | Tugas TEST memerlukan bukti dan reviewer terpisah; notulen final menghasilkan tindak lanjut yang tertaut keputusan; voting TEST satu pilihan per putaran; API memakai permission berscope | Persistence database, quorum, aturan voting/koreksi, penugasan resmi, timezone rapat, dan notifikasi KPI |
| 8 | Keuangan, evaluasi, knowledge, dan handover | Selesai lokal; persistence data layer ditunda | Transaksi TEST memerlukan bukti serta pemisahan requester/reviewer; evaluasi menyimpan nilai kosong, bukti, dan versi formula; knowledge memiliki sumber-versi; handover hanya diterima penerus yang ditunjuk | Formula KPI, kebijakan keuangan, periode/reviewer resmi, persistence, dan audit produksi |
| 9 | AI berizin dan penyempurnaan UX | Selesai lokal; provider AI ditunda | Preview TEST bersitasi tanpa provider eksternal, permission baca/aksi eksplisit, payload tindakan ber-versi dan kedaluwarsa, serta konfirmasi ulang | Provider/model AI, region, retensi, retrieval production, audit persistence, dan kebijakan pemrosesan KPI |
| 10 | Uji menyeluruh, operasi, dan paket rilis | Selesai lokal; rilis eksternal ditunda | Paket `verify`, smoke server produksi lokal, runbook TEST, serta register defect tersedia | UAT KPI, PostgreSQL/staging, domain, backup/restore, observability, dan persetujuan rilis |

## Hasil audit langkah 1

| Area | ID layar | Kondisi saat ini | Langkah implementasi |
|---|---:|---|---|
| Identitas dan administrasi | A01–A16 · 16 | UI TEST; login/MFA dan role lokal tersedia, belum persisten | 2–3 |
| Dokumen dan storage | F01–F06 · 6 | UI TEST dan aturan validasi dasar tersedia | 2, 3, 5 |
| Publikasi dan CMS | P01–P15/C01–C07 · 22 | Landing, katalog, galeri, aspirasi, dan editor UI tersedia | 4, 6 |
| Workspace dan tugas | W01–W05/T01–T11 · 16 | UI TEST tersedia; belum memiliki persistence atau approval nyata | 3, 7 |
| Rapat | M01–M07 · 7 | UI TEST tersedia; belum ada data atau voting persisten | 3, 7 |
| Kasus dan notifikasi | S01–S09/N01–N04 · 13 | UI TEST tersedia; belum ada triage atau kanal kirim | 3, 6 |
| Keuangan | B01–B09 · 9 | UI TEST tersedia; belum ada ledger atau approval | 3, 8 |
| Evaluasi dan knowledge | E01–E08/K01–K04 · 12 | UI TEST tersedia; belum ada formula, evidence, atau index berizin | 3, 8 |
| Handover dan operasi | H01–H06 · 6 | UI TEST tersedia; belum ada perpindahan owner atau restore | 3, 8, 10 |
| AI | I01–I06 · 6 | UI TEST tersedia; provider dan sumber resmi belum aktif | 3, 9 |
| **Total** | **113** | Katalog UI tersedia, modul bisnis belum operasional | 2–10 |

## Bukti langkah 2

- `supabase/seed.sql` dapat dijalankan ulang dengan fixture sintetis ber-ID tetap.
- `OrganizationRepository` memilih fixture hanya pada environment `local` dengan TEST aktif, dan menolak fallback fixture pada environment lain tanpa Supabase yang disetujui.
- Tes repository, typecheck, dan seluruh test suite lulus.
- Reset atau penerapan migration terhadap Postgres lokal belum dapat dijalankan karena Docker daemon tidak tersedia pada mesin kerja. Item ini tetap tercatat sebagai verifikasi manual sebelum staging diaktifkan.

## Bukti langkah 3

- Sesi TEST menggunakan token bertanda tangan pada cookie HTTP-only; token yang diubah, kedaluwarsa, atau dicabut ditolak.
- Permission TEST diberikan sebagai grant eksplisit, bukan otomatis karena role. Grant `WORKSPACE_READ` dan `TASK_READ` juga memerlukan organisasi serta periode yang tepat.
- Endpoint `GET /api/v1/portal/context` memeriksa autentikasi, mengambil konteks organisasi/periode, lalu mengecek permission sebelum mengembalikan data.
- Pencabutan sesi masih disimpan dalam memori pada local TEST. Pencabutan lintas restart dan policy RLS ditunda sampai database TEST dapat dijalankan.

## Bukti langkah 4

- Konten TEST memiliki state `DRAFT`, `IN_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `PUBLISHED`, dan `ARCHIVED`.
- Endpoint editor dapat membuat draf dan melakukan transisi. Hak draft, review, serta publish menggunakan grant TEST yang terpisah.
- Penulis draf tidak dapat menyetujui kontennya sendiri; reviewer TEST hanya dapat melakukan review, sementara publisher TEST melakukan publish setelah approval.
- Halaman `/publik/publikasi` membaca repository dan hanya menerima record `PUBLISHED` berbahasa Indonesia. Draf tidak muncul di katalog publik.
- Content repository masih menggunakan memori untuk local TEST. Penyimpanan berversi, audit keputusan, pencarian production, dan konten resmi menunggu database serta keputusan KPI.

## Bukti langkah 5

- Registry aset TEST memisahkan metadata dari storage fisik dan menyimpan status `PENDING`, `AVAILABLE`, serta `QUARANTINED`.
- Berkas yang lolos allowlist TEST baru menjadi `AVAILABLE` setelah langkah scan; executable atau tipe tidak diizinkan masuk quarantine.
- Versi berikutnya dibuat sebagai record baru. Versi yang tidak lolos tidak menggantikan versi sebelumnya yang sudah tersedia.
- Daftar dokumen pada portal hanya menampilkan asset milik akun atau yang memiliki grant akses. Recipient dapat dicabut dari registry.
- Browser hanya mengirim metadata berkas ke service TEST; tidak ada bytes file atau data institusi yang disimpan. Object storage privat, malware scanner, retensi, legal hold, dan policy produksi menunggu keputusan serta layanan KPI.

## Bukti langkah 6

- Form aspirasi public TEST mengirimkan idempotency key dan honeypot dasar. Pengiriman ulang dengan key yang sama menghasilkan kasus dan token tracking yang sama.
- Record kasus hanya menyimpan hash token; respons tracking pelapor berisi status serta update publik tanpa catatan internal.
- Triage memerlukan permission eksplisit. Catatan internal dan update pelapor diteruskan melalui field yang berbeda.
- Outbox notifikasi TEST mencatat event penerimaan dan triage dengan idempotency key sehingga retry tidak membuat notifikasi kasus triage ganda.
- Layanan hanya aktif pada local TEST. Masa token, prosedur anonim, penanganan darurat, retensi, anti-abuse produksi, kanal eksternal, dan SLA menunggu keputusan KPI.

## Bukti langkah 7

- Tugas TEST hanya dapat diajukan oleh pemiliknya setelah bukti dicantumkan. Penerimaan atau pengembalian tugas dilakukan oleh reviewer yang berbeda dari pembuat dan pemilik tugas.
- Notulen rapat memiliki state draf dan final. Tindak lanjut hanya dapat dibuat dari notulen final dan menyimpan tautan ke keputusan sumbernya.
- Voting TEST menyimpan satu pilihan yang tidak dapat diubah untuk setiap pemilih dan putaran; ini bukan pengganti aturan quorum atau voting resmi KPI.
- Endpoint tugas dan rapat memeriksa permission berscope organisasi/periode sebelum membaca atau memodifikasi workflow.
- Data workflow masih disimpan dalam memori untuk local TEST. Persistence, audit event yang tahan restart, aturan koreksi notulen, penugasan resmi, timezone, dan notifikasi produksi menunggu database serta keputusan KPI.

## Bukti langkah 8

- Transaksi TEST berjalan melalui state draf, pengajuan dengan bukti, approval, pembayaran, dan rekonsiliasi. Requester tidak dapat menyetujui atau merekonsiliasi transaksinya sendiri.
- Evaluasi menyimpan nilai `null` untuk data yang belum tersedia, sehingga tidak disamakan dengan nilai nol. Bukti dan versi formula TEST dicatat bersama record evaluasi; subjek evaluasi tidak dapat melakukan review atas dirinya sendiri.
- Artikel knowledge menyimpan sumber asset dan versi. Pembaca hanya menerima artikel published, sementara draft tersedia bagi grant penulis TEST.
- Paket handover mencatat sumber serta penerus. Penerimaan hanya berhasil untuk akun penerus yang telah ditetapkan, dan tidak mencabut akses nyata.
- Semua endpoint langkah ini memakai permission organisasi/periode. Data tetap in-memory pada local TEST; formula resmi, mata uang, ambang approval, kurs, reviewer, taxonomy, retensi, audit tahan restart, serta workflow produksi menunggu keputusan KPI dan database.

## Bukti langkah 9

- Preview AI TEST tidak memanggil provider atau mengirim data ke layanan eksternal. Ia hanya mengembalikan jawaban guardrail dan sitasi sumber sintetis yang tersedia pada sesi berizin.
- Permission `AI_READ` dan `AI_ACTION_CONFIRM` dipisahkan. Pengguna tanpa grant aksi tidak dapat menyiapkan maupun mengonfirmasi payload TEST.
- Aksi AI TEST dibuat sebagai preview ber-ID, ber-versi, dan memiliki masa berlaku. Konfirmasi memeriksa ID, versi payload, status, serta izin kembali; konfirmasi tidak melakukan perubahan ke sistem eksternal.
- UI AI menyampaikan status provider nonaktif, menampilkan sitasi, status loading/error, dan kontrol konfirmasi manusia. Preferensi reduced-motion dan focus style sudah diterapkan oleh stylesheet aksesibilitas global.
- Provider/model, region pemrosesan, retensi, embedding/cache berizin, evaluasi model, audit tahan restart, serta kebijakan manusia KPI tetap menunggu OD-08 dan infrastruktur milik KPI.

## Bukti langkah 10

- `npm run verify` menjalankan typecheck, 32 test workflow TEST, dan build produksi dalam satu paket yang lulus.
- Smoke test memakai server `next start` pada port lokal terpisah dan endpoint health mengembalikan status `ok` untuk environment `local`.
- Runbook local TEST, register defect, dan gerbang rilis tercatat di `docs/19-LOCAL-RELEASE-READINESS.md`.
- Docker/PostgreSQL, Supabase/hosting KPI, secret deployment, domain, backup/restore drill, observability, dan UAT tidak disimulasikan sebagai selesai. Karena itu angka verifikasi end-to-end tetap 1/10 dan tidak ada klaim siap produksi.

## Aturan pembaruan

1. Status hanya berubah menjadi selesai jika kode, test, dan bukti yang disebutkan pada kolom “Bukti selesai” sudah ada.
2. Data nyata, layanan cloud, secret, kebijakan, dan keputusan KPI dicatat sebagai tertunda; tidak diganti dengan data atau policy tebakan.
3. Setiap laporan progres menuliskan format `x/10`, langkah yang baru selesai, bukti validasi, serta blocker eksternal bila ada.
