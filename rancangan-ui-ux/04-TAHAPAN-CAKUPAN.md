# Tahapan desain dan pemeriksaan cakupan

## Tahapan rancangan

Seluruh tahap di sini berfokus pada desain. Implementasi frontend/backend/database membutuhkan permintaan terpisah.

| Tahap | Hasil desain | Ketergantungan | Kriteria review |
|---|---|---|---|
| UX0 Konsolidasi | Peta layar, role, gap dan aturan prioritas | 13 dokumen | Tidak ada modul sumber tanpa tempat dalam peta |
| UX1 Fondasi visual | Token, komponen, shell desktop/mobile, state | Arah Apple HIG, logo/brand bila tersedia | Hierarki, kontras, role/period context jelas |
| UX2 Alur kerja inti | A01–A10, W01–W05, T01–T11, F01–F04 | Completion, sesi, scope, file policy | Login → task → bukti → review serta extension dapat dijelaskan end-to-end |
| UX3 Dokumen & rapat | F05–F06, M01–M07, archive | Voting, finalization, sharing policy | Tidak ada bypass klasifikasi, versi atau review |
| UX4 Publik/editorial | P01–P15, C01–C07 | Konten resmi, ID/EN, approval | Draft dan public state jelas; public journey lengkap |
| UX5 Layanan/komunikasi | S01–S06 | Form/complaint/contact granular decisions | Submission, tracking, internal/public notes tidak ambigu |
| UX6 Memori/evaluasi | K01–K04, E01–E03, H01–H03 | Formula, historical access, handover | Sumber, periode, correction, outstanding jelas |
| UX7 AI | I01–I03 | Retrieval/source/action policy | Output dan human confirmation terpisah |
| UX8 Prototype/review | Prototype klik kelak, skenario role, mobile/dark/states | Desain detail tiap kelompok | Usability, accessibility, permission scenario review |

Status saat paket ini dibuat: UX0 dan spesifikasi tekstual UX1–UX7 tersusun untuk review. UX8 belum dilaksanakan; tidak ada klaim prototype klik atau usability test lulus. Tiga gambar awal bukan pengganti tahap di tabel.

## Pembagian pekerjaan saat implementasi kelak

| Area | Frontend/UI UX | Backend | Database/Supabase |
|---|---|---|---|
| Identity | Login/MFA/context/session states | Validasi sesi aktif dan authorization | Auth mapping, roles, memberships, grants |
| Work | Board/form/evidence/review | State machine, approval, overdue/jobs | Tasks, versions, evidence refs, history, outbox |
| Files | Upload states/sharing/detail | Validation/scan/download/revoke | Private storage, document versions, policy/access logs |
| Meetings | Agenda/minutes/vote/follow-up | Voting round/finalization/linked task | Unique votes, snapshots, minutes versions, FK |
| Public | Public pages/editor/preview | Editorial rules, approved projection, publish jobs | Content translations/versions/assets/public datasets |
| Service | Form/tracking/triage | Submission workflow/antiabuse/safe response | Form versions, cases, token hashes, updates |
| Memory | Knowledge/report/handover views | Search scope/scoring/acceptance | Sources, citations, formula versions, packages |
| AI | Conversation/sources/action review | Retrieval permission + execute recheck | Source references, proposals, audit |

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

## Keputusan terbuka

| ID | Masalah | Usulan sementara | Menghalangi |
|---|---|---|---|
| Q01 | Role dan pejabat nyata belum final | Pakai kode role sumber, bukan nama orang | Mapping user/approver final |
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
| Q15 | AI provider/retention/classification eligibility | Tidak mengirim semua kategori otomatis | I01–I03 |
| Q16 | Kontak & Relasi belum granular | Scope usulan terpisah | S06 final |
| Q17 | Logo, warna institusi, foto, konten resmi belum diberikan | Token Apple-style dan text name sementara | Branding/copy final |
| Q18 | Timezone organisasi | Usulan Africa/Cairo dengan display zone, bukan fixed UTC offset | Calendar/recurring/date copy |

Tidak semua pertanyaan perlu dijawab sebelum review rancangan ini. Kelompok yang belum bergantung padanya dapat diperinci terlebih dahulu. Rekomendasi tidak menjadi keputusan organisasi otomatis.

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

Dilakukan: daftar modul sumber dipetakan ke layar, alur inti ditulis, wireframe struktural tersedia, pembagian tiga workstream dan gap dicatat. Belum dilakukan: high-fidelity seluruh layar, prototype interaktif, pengukuran kontras pada render, pengujian assistive technology, usability test, approval organisasi, implementasi atau deployment.
