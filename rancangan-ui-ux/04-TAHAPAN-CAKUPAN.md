# Tahapan desain dan pemeriksaan cakupan

**Koreksi persetujuan:** cakupan yang disetujui adalah 28 pertanyaan pada situs. Tabel Q01–Q18 di dokumen ini adalah riwayat rancangan awal, bukan salinan daftar situs. Acuan keputusan terbaru: [Register 28 pertanyaan situs](06-PERSETUJUAN-28-PERTANYAAN-SITUS.md).

## Tahapan rancangan

Seluruh tahap di sini berfokus pada desain (UX0–UX8). Implementasi kode aplikasi mengacu pada **Jadwal 4 Fase Kontraktual (PKS Nomor 002/PKS-KPI/IX/2026 Pasal 6)** dengan target durasi 1 bulan (4 minggu):

### Jadwal Kontraktual 4 Fase Implementasi (PKS Pasal 6)
| Fase | Waktu | Modul & Cakupan Layar | Target Deliverable |
|---|---|---|---|
| **Fase 1** | Minggu ke-1 | Website Publik & CMS Bilingual (P01–P15, C01–C07) | Portal informasi, publikasi editorial ID/EN, formulir aspirasi, tracking token |
| **Fase 2** | Minggu ke-2 | Portal MVP & Task Management (A01–A04, W01–W05, T01–T11) | Autentikasi MFA, My Workspace, Action Required, task state machine & bukti |
| **Fase 3** | Minggu ke-3 | Operasional Lanjutan & Tata Kelola (M01–M07, F01–F06, S01–S06) | Kalender rapat Kairo, voting tertutup, penguncian notulen, storage berizin |
| **Fase 4** | Minggu ke-4 | AI Terkendali, Hardening & Handover (K01–K04, E01–E03, H01–H03, I01–I03) | Knowledge SOP, AI retrieval tanpa pelatihan model, UAT, BAST penyerahan hak |

Masa pemeliharaan (PKS Pasal 12): 3 (tiga) bulan bebas biaya pasca serah terima, mencakup *bug fixing* dan pendampingan pengkaderan personel KPI.

| Tahap Desain | Hasil desain | Ketergantungan | Kriteria review |
|---|---|---|---|
| UX0 Konsolidasi | Peta layar, role, gap dan aturan prioritas | 13 dokumen teknis | Tidak ada modul sumber tanpa tempat dalam peta |
| UX1 Fondasi visual | Token, komponen, shell desktop/mobile, state | Arah Apple HIG, 4 dokumen legal | Hierarki, kontras, role/period context jelas |
| UX2 Alur kerja inti | A01–A10, W01–W05, T01–T11, F01–F04 | Completion, sesi, scope, file policy | Login → task → bukti → review serta extension dapat dijelaskan end-to-end |
| UX3 Dokumen & rapat | F05–F06, M01–M07, archive | Voting, finalization, sharing policy | Tidak ada bypass klasifikasi, versi atau review |
| UX4 Publik/editorial | P01–P15, C01–C07 | Konten resmi, ID/EN, approval | Draft dan public state jelas; public journey lengkap |
| UX5 Layanan/komunikasi | S01–S06 | Form/complaint/contact granular decisions | Submission, tracking, internal/public notes tidak ambigu |
| UX6 Memori/evaluasi | K01–K04, E01–E03, H01–H03 | Formula, historical access, handover | Sumber, periode, correction, outstanding jelas |
| UX7 AI | I01–I03 | PPD Pasal 3 (larangan AI training), retrieval | Output dan human confirmation terpisah; data KPI tidak masuk training |
| UX8 Prototype/review | Prototype klik kelak, skenario role, mobile/dark/states | Desain detail tiap kelompok | Usability, accessibility, permission scenario review |

Status saat paket ini dibuat: UX0 dan spesifikasi tekstual UX1–UX7 tersusun untuk review. UX8 belum dilaksanakan; tidak ada klaim prototype klik atau usability test lulus.

## Pembagian pekerjaan saat implementasi (Ketentuan PKS & PPD)

Sesuai **Pasal 10 PKS** dan **Pasal 5 PPD**, database utama dibuat dan dikendalikan langsung oleh PIHAK PERTAMA (KPI PPMI Mesir), termasuk melalui platform Supabase. PIHAK KEDUA (Developer) hanya diberikan akses sementara dan minimum. Seluruh source code diserahkan penuh tanpa *backdoor* (Pasal 5 PHHP).

| Area | Frontend/UI UX | Backend | Database/Supabase |
|---|---|---|---|
| Identity | Login/MFA/context/session states | Validasi sesi aktif dan authorization | Auth mapping, roles, memberships, grants |
| Work | Board/form/evidence/review | State machine, approval, overdue/jobs | Tasks, versions, evidence refs, history, outbox |
| Files | Upload states/sharing/detail | Validation/scan/download/revoke | Private storage, document versions, policy/access logs |
| Meetings | Agenda/minutes/vote/follow-up | Voting round/finalization/linked task | Unique votes, snapshots, minutes versions, FK |
| Public | Public pages/editor/preview | Editorial rules, approved projection, publish jobs | Content translations/versions/assets/public datasets |
| Service | Form/tracking/triage | Submission workflow/antiabuse/safe response | Form versions, cases, token hashes, updates |
| Memory | Knowledge/report/handover views | Search scope/scoring/acceptance | Sources, citations, formula versions, packages |
| AI | Conversation/sources/action review | Retrieval permission + execute recheck (No Training) | Source references, proposals, audit (Data terisolasi) |

Frontend menerima data dan allowed actions dari kontrak yang disepakati, tetapi backend mengecek ulang seluruh aksi. Daftar layar bukan alasan untuk membuka tabel internal langsung. Kontrak minimum setiap detail: ID, versi, status, konteks aman, allowed actions, validation errors dan correlation ID. Secret tidak menjadi field UI.

## Coverage ke sumber

Ini pemeriksaan cakupan modul/kelompok requirement, belum matriks atomik setiap kalimat dokumen.

| Kebutuhan sumber | Lokasi rancangan | Verifikasi desain yang direncanakan |
|---|---|---|
| Publik/profile/structure/program/repository/statistics/transparency | P01–P11 | Setiap item punya navigasi, detail, sumber, mobile |
| ID/EN/SEO/public-safe editorial | P14–P15,C01–C07 | Bahasa/versi/draft/published/archive dibedakan |
| Login/MFA/reset/revoke | A01–A04,F01 flow | Failure, expired, lost device, no bypass |
| Role/division/period/classification/grants/emergency | A05–A10 | Scope salah, expired grant, admin tanpa business privilege |
| Task types/status/priority/evidence/review | T01–T06 | Progress 100% belum berarti selesai |
| Overdue/reminder/escalation/extension/reassign | T03,T07,W03,W05 | Old/new deadline, alasan, no auto-priority |
| Shared task/checklist/subtask/dependency | T02,T08 | Capability-based sections, blocked state |
| Recurring/templates/versioning | T09 | Preview instance, old version retained |
| Comments/mentions/blocker/workload/calendar | T04,T10,M01,W05 | No unauthorized suggestion/leak; keyboard alternative |
| Cancellation/archive/restore/history | T11,H01,F06,A11 | No ordinary hard-delete; linked evidence preserved |
| Rapat/attendance/minutes/decision/voting/follow-up | M02–M07 | Round closed, minutes final, traceable task |
| DOC upload/scan/version/share/watermark/log | F01–F06 | Pending/quarantine/revoke/new-version-failure |
| KNOW taxonomy/review/citation/search/outdated | K01–K04,W04 | Source unavailable/changed, no restricted snippets |
| Form versions/conditional/workflow | S01–S02 | Old submissions stable, mapping allowlist |
| Complaint/tracking/triage/internal notes | P12–P13,S03–S04 | Tracking invalid, safe update preview |
| Notification channels/preferences/announcement | W05,S05,A12 | FYI beda required action; confidential preview |
| Kontak & Relasi | S06 | Gap policy eksplisit, tidak dianggap final |
| Performance/formula/correction/comparison/report | E01–E03 | Scope, original score, missing data versus 0 |
| Period memory/digital handover | A08,H01–H03 | Incoming acceptance, outstanding, historical access |
| AI/R&A/citations/human actions | I01–I03 | Version-bound confirmation, revoked sources |
| AUDIT/security events/export | A11–A12 | Read/export terpisah, no modification, redaction |
| Mobile/accessible/dark/resize/offline | Design system dan seluruh wireframe | Reflow, keyboard, contrast, theme, conflict recovery |

## Daftar usulan dan status persetujuan

Pembaruan 8 September 2026: seluruh usulan Q01–Q18 di bawah disetujui melalui konfirmasi pengguna atas persetujuan pihak terkait. Kolom “Usulan sementara” dan “Menghalangi” dipertahankan sebagai rekaman saat penyusunan. Status terkini dan rincian yang belum ditentukan ada pada [Register persetujuan](05-PERSETUJUAN.md), yang menjadi acuan jika label pending di dokumen lain berbeda.

| ID | Masalah | Usulan sementara | Status Resolusi Legal (17 Sep 2026) |
|---|---|---|---|
| Q01 | Role dan pejabat nyata belum final | Pakai kode role sumber, bukan nama orang | **Diselesaikan**: Pejabat definitif diakui via PKS & PPD (Ketua KPI: M. Abdullah Mubarak, Presiden PPMI: Wildan A. Fathurahman, Developer: Daru F. Muliawan). |
| Q02 | Cross-division comparison bertentangan antara R5 dan R9/U15/TK21 | Batasi Ketua/Sekjend | E02 final |
| Q03 | Admin DOC/CMS ambigu terhadap admin teknis | Permission bisnis terpisah | A06,C01,F05 |
| Q04 | Parent auto-complete vs mandatory acceptance | Siap diajukan setelah children; review tetap | T08 final transition |
| Q05 | Terlambat state/flag dan reason saat otomatis | Flag + Action Required alasan | Task state detail |
| Q06 | Intelligence/Operation exception publik | Pertahankan larangan detail operasional | P03/P04 content rules |
| Q07 | Login setiap kali/MFA metode/durasi | Policy eksplisit, TOTP kandidat | Auth high fidelity/pengujian |
| Q08 | Voting rahasia/quorum/round/correction | Snapshot voters; secret design menunggu keputusan | M05 final |
| Q09 | Bukti pengecualian/self-approval | Tidak bypass default | T05/T06 |
| Q10 | File types/size/retention/delete window/watermark | Policy configurable; private default | F02/F05/F06 final copy |
| Q11 | ID/EN fallback, public approval/URL archive | No draft fallback; keputusan per versi | C02/C04/P15 |
| Q12 | Complaint identity/recovery/token/SLA | Jangan menjanjikan anonimitas atau SLA yang belum diputuskan | P12/P13,S04 |
| Q13 | Formula skor/responsiveness/correction authority | Tampilkan metode dan versi, no fabricated scoring | E01–E03 |
| Q14 | Closed period correction dan acceptance handover | Read-only kecuali controlled correction | A08,H03 |
| Q15 | AI provider/retention/classification eligibility | Tidak mengirim semua kategori otomatis | **Diselesaikan**: PPD Pasal 3 & PKS Pasal 10 melarang mutlak pelatihan model AI (*AI training ban*). AI terbatas RAG/retrieval izin granular. |
| Q16 | Kontak & Relasi belum granular | Scope usulan terpisah | S06 final |
| Q17 | Logo, warna institusi, foto, konten resmi belum diberikan | Token Apple-style dan text name sementara | Branding/copy final |
| Q18 | Timezone organisasi | Usulan Africa/Cairo dengan display zone, bukan fixed UTC offset | Calendar/recurring/date copy |

Usulan yang telah disetujui tidak perlu dimintakan persetujuan ulang. Rincian legal per 17 September 2026 (PPD, PKS, NDA, PHHP) mengikat secara kontraktual terhadap tata kelola data, jadwal 4 minggu, larangan AI training, dan serah terima penuh tanpa pintu belakang (*backdoor*). Detail teknis yang belum memiliki nilai konkret tetap dicatat sebagai kebutuhan konfigurasi atau perincian desain.

## Skenario review rancangan

1. Pengunjung mencari publikasi English dan kembali ke varian Indonesia yang setara.
2. Pengunjung mengirim pengaduan pada koneksi buruk lalu melacak tanpa melihat catatan internal.
3. Pengurus memperbarui progress 100%, tetapi masih wajib mengajukan bukti dan menunggu review.
4. Koordinator meminta revisi, menerima ulang versi baru, dan melihat histori versi tepat.
5. Deadline terlewati saat task menunggu dependency; kedua kondisi tetap dapat dipahami.
6. Admin teknis membuka pengaturan tanpa dapat membaca file Highly Confidential.
7. User membuka notifikasi lama setelah temporary access habis; isi tidak bocor.
8. Notulen final dibuka kembali secara sah tanpa silent overwrite.
9. Voting tertutup tidak bisa diubah/dikirim ulang biasa.
10. Editor merevisi konten published; publik tetap melihat versi approved sebelumnya.
11. Asset publik berubah restricted; rancangan status menggambarkan blokir/unpublish sesuai policy.
12. Incoming leadership menolak satu item handover; paket menunjukkan outstanding.
13. AI action berubah setelah review; confirm lama ditolak dan review baru diminta.
14. Seluruh alur inti dicoba pada keyboard-only, 320px, zoom 200%, dark dan reduced motion.

## Kriteria selesai desain sebelum handoff

- Setiap screen ID memiliki owner role, sumber data, aksi, forbidden behavior, state dan acceptance.
- Semua alur write memiliki success/failure/conflict/pending dan recovery yang masuk akal.
- Permission, classification, period context dan version visible pada titik keputusan.
- Tidak ada publikasi/approval/delete/export yang tersamarkan sebagai Save.
- Tidak ada klaim kepatuhan/aksesibilitas/performa yang belum diuji.
- Semua komponen mobile mempertahankan kemampuan inti desktop.
- Konten contoh berlabel; logo/foto/statistik final berasal dari pemilik konten.
- Rancangan yang bergantung pada keputusan terbuka tetap bertanda draft.

## Pemeriksaan paket saat ini

Dilakukan: daftar modul sumber dipetakan ke layar, alur inti ditulis, wireframe struktural tersedia, pembagian tiga workstream dan gap dicatat. Pada 8 September 2026 pengguna menyampaikan persetujuan pihak terkait terhadap seluruh usulan Q01–Q18. Belum dilakukan: high-fidelity seluruh layar, prototype interaktif, pengukuran kontras pada render, pengujian assistive technology, usability test, persetujuan desain final, implementasi atau deployment.
