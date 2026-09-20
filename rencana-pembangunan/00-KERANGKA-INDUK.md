# 00 — Kerangka Induk Rencana Pembangunan Sistem Digital KPI

Komisi Peduli Interaksi (KPI) PPMI Mesir · Periode 2026–2027 · Versi rencana 0.3 (15 September 2026, revisi atas 23 temuan review; lihat bagian 10 "Catatan revisi" di akhir)

> Status dokumen: **DRAF RENCANA, belum disetujui KPI.** Semua ADR di bagian 2 berstatus *Usulan, butuh persetujuan KPI*. Paket ini hanya rencana. Paket ini tidak berisi kode aplikasi dan tidak memberi izin untuk deployment.
>
> **Paket belum Ready.** File 01–04 dan seluruh `modul/*.md` yang dirujuk dokumen ini **akan dibuat** (folder `modul/` masih kosong). Rujukan ke task (`RILIS-E00-T01`, dst.) dan keputusan terbuka (`OD-nnn`) adalah ID yang dikunci saat file tersebut dibuat. Tidak ada task EKSEKUTOR yang boleh dimulai sebelum file-file itu ada dan gerbang hari-0 (bagian 2.0) Done.

---

## 1. Tujuan, status, dan cara membaca paket

### 1.1 Tujuan

1. Mengubah 27 dokumen arsitektur KPI, rancangan UI/UX yang sudah disetujui (113 layar, 11 alur, 28 keputusan Q), dan draf perjanjian 12 September 2026 menjadi rencana kerja yang bisa dikerjakan eksekutor (manusia atau model AI) **tanpa menebak**.
2. Mengunci aturan bersama lintas modul di satu tempat: stack, peran, kerahasiaan, kamus status, konvensi kode, standar tes, Definition of Ready (DoR), dan Definition of Done (DoD).
3. Menandai dengan jujur jarak antara ruang lingkup dokumen dan waktu PKS (4 minggu).

### 1.2 Hierarki sumber (bila bertentangan, yang di atas menang)

| Urutan | Sumber | Catatan |
|---|---|---|
| 1 | Draf PKS 002/PKS-KPI/IX/2026 (12 Sep 2026) | Jadwal 4 fase/4 minggu, nilai all-in, pemeliharaan 30 hari. Mengalahkan `proposal/PENAWARAN-*.md` (8 Sep). |
| 2 | Draf PPD 001, NDA 003, PHHP 004 (12 Sep 2026) | Mengikat cara kerja pengembang (bagian 8). |
| 3 | Dokumen 23 Role & Permission Reconciliation | Authoritative untuk struktur organisasi dan 13 peran. |
| 4 | `rancangan-ui-ux/06-PERSETUJUAN-28-PERTANYAAN-SITUS.md` + `app.js` `QUESTIONS_DATA` | 28 keputusan KPI yang disetujui 8 Sep 2026. Q03, Q15, Q16 memakai jawaban khusus. Nilai angka yang belum diberikan tetap BELUM DITENTUKAN. |
| 5 | Dokumen 20, 21, 22, 24, 25, 27 (lintas modul) | Kamus data, lifecycle, dependensi, tes, handoff, review. |
| 6 | Granular Module Specification (AUTH/CORE/AUDIT, TASK, MEET, DOC, KNOW, CMS/PUB, 13–19) | Rincian per modul. Bila berbeda dari 20/21, perbedaan dicatat di file modul lalu diputuskan LEAD/KPI. |
| 7 | Master, Technical, Database/ERD, UI/UX, Development Specification, Role Permission Matrix, Blueprint | Baseline arsitektur awal. Bagian stack disimpangi oleh ADR-001..007. |
| 8 | Rancangan UI/UX: `app.js` (ALL_SCREENS, FLOWS, DATABASE_ENTITIES), `index.html`, `02-PETA-LAYAR.md`, `03-ALUR-WIREFRAME.md` | Tampilan visual mengikuti `styles.css`. `01-DESIGN-SYSTEM.md` (token biru) **sudah tidak berlaku**. |

### 1.3 Cara membaca

1. Baca file 00 ini lebih dulu. Setiap file lain menganggap isi file 00 berlaku.
2. Baca `01-PETA-JALAN` untuk urutan fase dan gerbang antarminggu.
3. Eksekutor mengambil task dari `modul/NN-*.md` yang berstatus Ready (DoR bagian 6.5 terpenuhi) dan dependensinya sudah Done.
4. Setiap task memakai format bagian 9. Task tanpa format itu belum boleh dikerjakan.
5. Nilai berlabel **BELUM DITENTUKAN** tidak boleh diisi eksekutor. Pakai perilaku aman (bagian 5.12) dan rujuk task KPI di `03-RISIKO-DAN-KEPUTUSAN-TERBUKA`.
6. Konvensi ID dalam paket:
   - Task: `<KODE>-E<nn>-T<nn>`, contoh `TASK-E02-T04`. Kode sama dengan kode file modul.
   - Layar: ID dari `ALL_SCREENS`, yaitu P01–P15, A01–A16, W01–W05, T01–T11, M01–M07, F01–F06, K01–K04, C01–C07, S01–S09, B01–B09, N01–N04, E01–E08, H01–H06, I01–I06 (113 layar).
   - Alur UI: ID `FLOWS` F01–F11 **bertabrakan** dengan layar F01–F06. Di paket ini alur ditulis `ALUR-F01`…`ALUR-F11`, sedangkan layar tetap `F01`.
   - Tes dokumen: AUTH-nn, CORE-nn, TASK-01, MEET-01, DOC-01, KNOW-01, CMS-01, CASE-01, NOTIF-01, FIN-01/02, PERF-01, AI-01, HAND-01, ADMIN-01, SEC-01, AUD-01, OPS-01/02 (dok 24 §4); PERM-01..08 (dok 24 §5); INT-01..08 (dok 24 §6); RP-01..12 (dok 23 §16); ADMIN-T01..T15 (dok 18 §34). **Catatan:** AUTH-01..05, CORE-01..04, dan AUD-01..04 di spesifikasi AUTH/CORE/AUDIT §20 memakai nomor yang sama dengan isi berbeda dari dok 24. Rujuk dengan awalan dokumen: `D24:AUTH-01` atau `GAC:AUTH-01`.
   - Keputusan KPI: Q01–Q28 (situs). ADR lead: ADR-001..010. Keputusan terbuka: `OD-nnn` (akan didefinisikan di file 03; setiap OD yang disebut di dokumen ini wajib punya baris di file 03 sebelum paket Ready).

### 1.4 Daftar file paket

| File | Isi | Pemilik |
|---|---|---|
| `00-KERANGKA-INDUK.md` | Dokumen ini: ADR, peran, kerahasiaan, kamus status, konvensi, standar tes, DoR/DoD, pemetaan fase, kewajiban kontrak, template task | LEAD |
| `01-PETA-JALAN.md` | Jadwal 4 minggu per fase PKS, gerbang fase, jalur kritis, kapasitas vs ruang lingkup | LEAD |
| `02-RENCANA-PENGUJIAN.md` | Traceability requirement→tes, matriks izin 13 peran × aksi × scope, UAT, bukti, go-live | LEAD |
| `03-RISIKO-DAN-KEPUTUSAN-TERBUKA.md` | Register risiko, keputusan terbuka (OD), konfigurasi BELUM DITENTUKAN + task KPI | LEAD + KPI |
| `04-PANDUAN-EKSEKUTOR.md` | Aturan kerja eksekutor, alur branch/PR, larangan, cara menyerahkan bukti | LEAD |
| `modul/01-PLAT.md` | Platform: repo, CI, lingkungan, kerangka modul, error/idempotency/outbox, i18n, tes dasar | LEAD |
| `modul/02-AUTH.md` | Login, MFA TOTP, sesi, reset, logout semua perangkat (A01–A04) | EKSEKUTOR |
| `modul/03-ORG.md` | ADMIN inti: organisasi, periode, unit, jabatan, assignment, peran, izin, grant, delegasi, policy engine (A05–A10, ALUR-F11) | EKSEKUTOR |
| `modul/04-AUDIT.md` | AuditEvent immutable, security event, penampil audit (A11) | EKSEKUTOR |
| `modul/05-DOC.md` | Dokumen & berkas, versi, klasifikasi, share, PIN step-up (F01–F06) | EKSEKUTOR |
| `modul/06-PUB.md` | Website publik bilingual (P01–P15) | EKSEKUTOR |
| `modul/07-CMS.md` | Editorial bilingual, approval, jadwal terbit, proyeksi publik (C01–C07) | EKSEKUTOR |
| `modul/08-TASK.md` | Workspace & tugas (W01–W03, T01–T11) | EKSEKUTOR |
| `modul/09-NOTIF.md` | Notifikasi, preferensi, template, pengumuman, buku kontak (W05, N01–N04, S05, S06) | EKSEKUTOR |
| `modul/10-MEET.md` | Rapat, notulen, voting, keputusan, tindak lanjut, sidang (M01–M07) | EKSEKUTOR |
| `modul/11-FORM-CASE.md` | Formulir, aduan publik, pelacakan, triage, kasus (P11–P13 bagian back-end, S01–S04, S07–S09) | EKSEKUTOR |
| `modul/12-KNOW.md` | Pengetahuan, sitasi, pencarian internal (K01–K04, W04) | EKSEKUTOR |
| `modul/13-FIN.md` | Anggaran, transaksi, pembayaran, rekonsiliasi, audit keuangan (B01–B09) | EKSEKUTOR |
| `modul/14-PERF.md` | Siklus, target, capaian, evaluasi, kalibrasi, sanggah, PIP (E01–E08) | EKSEKUTOR |
| `modul/15-ADMIN.md` | Konfigurasi berversi, kebijakan persetujuan, retensi, cadangan (A12–A16) | EKSEKUTOR |
| `modul/16-HAND.md` | Serah terima jabatan (H01–H06) | EKSEKUTOR |
| `modul/17-AI.md` | AI terkendali: tanya jawab, analisis, usulan tindakan, tata kelola (I01–I06) | EKSEKUTOR |
| `modul/18-RILIS.md` | Gerbang hari-0 (`RILIS-E00-*`, bagian 2.0), hardening, uji keamanan, backup/restore (ADR-010), UAT, gerbang go-live (`RILIS-E90-*`), domain .org (K21), panduan pengguna/admin dan pelatihan (K22), pembersihan data TEST (K24), serah terima PHHP, pemeliharaan 30 hari | LEAD + EKSEKUTOR + KPI |

> Nama file modul di atas adalah struktur yang dikunci paket. Bila ada file modul yang dibuat dengan nama berbeda, perbarui tabel ini dalam PR yang sama.

---

## 2. Architecture Decision Records (ADR)

Semua ADR berstatus **Usulan, butuh persetujuan KPI**. Dokumen 27 §8 mewajibkan platform, database, auth, storage, zona waktu, dan lingkungan dikunci **sebelum coding**. Dok 27 §10 juga menegaskan bahwa pengembangan belum boleh dimulai sebelum keputusan teknis wajib dikunci. Karena itu persetujuan ADR-001..010 adalah gerbang pertama (bagian 2.0).

### 2.0 Gerbang hari-0 (memblokir semua task EKSEKUTOR)

Task berikut **akan dibuat** di `modul/18-RILIS.md` dengan format bagian 9. ID-nya dikunci di sini. Selama salah satu task berstatus belum Done, **tidak ada task berpelaksana EKSEKUTOR yang Ready** (DoR 6.5 butir 9 dan 11), dan paket rencana beserta repo tidak boleh diberikan ke eksekutor yang belum tercatat di register subprosesor.

| ID task | Pelaksana | Isi | Dasar | Bila belum Done |
|---|---|---|---|---|
| `RILIS-E00-T01` | KPI | Persetujuan tertulis ADR-001..010, region Supabase/Vercel, dan daftar subprosesor produk (hosting, DB, email, AI, scanner, monitoring) | Dok 27 §8, §10; PPD Ps 6 | Hanya task LEAD yang tidak mengikat stack yang boleh berjalan (lihat catatan di bawah) |
| `RILIS-E00-T02` | KPI | Persetujuan tertulis **penyedia AI eksekutor dan alat bantu coding** yang membaca repo atau paket rencana: nama penyedia, lokasi pemrosesan, opsi tanpa pelatihan data, retensi prompt. Dicatat di register subprosesor dengan nomor task ini | NDA Ps 2–3 (source code, konfigurasi, struktur basis data, rancangan = Informasi Rahasia); PPD Ps 3, Ps 6 | Paket tidak boleh diserahkan ke eksekutor tersebut |
| `RILIS-E00-T03` | KPI | Penetapan data yang boleh dipakai untuk pengembangan, pengujian, demonstrasi, dan produksi (klasifikasi data per lingkungan) | PPD Ps 2 | Semua lingkungan non-production hanya memakai data sintetis TEST (5.9) |
| `RILIS-E00-T04` | KPI | Persetujuan tertulis paket langganan per lingkungan, perkiraan biaya, dan **penanggung biaya setelah serah terima** (tabel paket minimum di ADR-007) | PKS Ps 7, Ps 9; PHHP Ps 6 | ADR-005, ADR-007, ADR-010 tidak dianggap disetujui; berlaku alternatif yang dicatat di ADR-007 sebagai risiko di file 03 |
| `RILIS-E00-T05` | KPI + LEAD | Pembuatan organisasi GitHub, organisasi Supabase, dan tim Vercel atas nama KPI (production terpisah dari staging) dengan owner dari pengurus KPI | PPD Ps 4; PHHP Ps 4–5 | Tidak ada lingkungan cloud yang dibuat |

Pengecualian pra-persetujuan (usulan yang **butuh persetujuan KPI**, bukan default): sebelum `RILIS-E00-T01` Done, hanya task **LEAD** yang tidak mengikat stack dan tidak memakai layanan cloud yang boleh dikerjakan, yaitu matriks izin YAML, kamus status, skenario tes, dan prototipe lokal tanpa layanan cloud. Bila KPI tidak menyetujui pengecualian ini, pekerjaan LEAD tersebut juga menunggu.

### ADR-001 — Stack aplikasi: satu repo Next.js modular monolith

| Aspek | Isi |
|---|---|
| Konteks | Technical Architecture §4/§23 merekomendasikan Next.js (frontend) + NestJS (backend) + Prisma + Redis + Docker. PKS Pasal 6 hanya memberi 4 minggu untuk seluruh fase, dengan nilai all-in Rp14,2 juta. Dua aplikasi terpisah menggandakan pekerjaan setup, deploy, auth, dan kontrak. |
| Keputusan | Satu repository dan satu aplikasi **Next.js (App Router) + TypeScript `strict`**. Route group `(public)` untuk website publik dan `(portal)` untuk portal pengurus. Backend berbentuk **modular monolith** di `src/modules/<modul>/`, dengan lapisan `domain` (service), `policy`, `schema` (zod), dan `repository`. Kontrak eksternal memakai **REST `/api/v1/...`** (Route Handlers). Server Actions hanya boleh memanggil service yang sama, tidak boleh punya logika bisnis sendiri. |
| Alasan | Satu build, satu deploy, satu set tipe. Tetap API-first sesuai Technical Architecture §2 karena REST `/api/v1` menjadi kontrak untuk aplikasi mobile nanti. Batas domain tetap tegas lewat folder modul dan aturan impor. |
| Konsekuensi | (1) Aturan impor wajib: modul hanya boleh mengimpor `src/modules/<lain>/index.ts` (API publik modul), tidak boleh masuk ke repository modul lain. Aturan dipaksa lint `eslint-plugin-boundaries` atau `dependency-cruiser` di CI. (2) Tidak boleh ada logika bisnis di komponen React atau Route Handler. (3) Pekerjaan berat berjalan lewat job (ADR-005), bukan request. (4) Dokumentasi OpenAPI dibangkitkan dari skema zod. |
| Penyimpangan dari dokumen | Tidak memakai NestJS, Prisma, Redis, atau Docker sebagai target deploy (Technical Architecture §4, §23). Container Docker tetap disediakan hanya untuk tes lokal/CI bila perlu (Supabase CLI memakai Docker). |
| Jalur keluar | Karena service terisolasi per modul dan kontrak memakai REST berversi, service bisa dipindah ke NestJS atau layanan terpisah tanpa mengubah klien: salin `domain/policy/schema/repository`, lalu ganti adaptor HTTP. Target migrasi dicatat bila beban atau tim bertambah. |
| Status | Usulan, butuh persetujuan KPI |

### ADR-002 — Data: Supabase Postgres, migrasi SQL berversi, otorisasi dua lapis

| Aspek | Isi |
|---|---|
| Konteks | Database ERD §2 menetapkan PostgreSQL, UUID, FK, soft delete, dan audit append-only. Doc 22 §7 mewajibkan transaksi atomik dan idempotency. Doc 27 §7 mewajibkan otorisasi di server. |
| Keputusan | **Supabase Postgres**. Skema dikelola dengan **migrasi SQL berversi** (`supabase/migrations/<timestamp>_<modul>_<ringkas>.sql`) lewat Supabase CLI. Tipe TypeScript dibangkitkan (`supabase gen types`) dan dicek CI agar tidak basi. Otorisasi berlapis: (a) **policy engine terpusat di server** (`src/modules/org/policy`) diperiksa di setiap service, dan (b) **RLS Postgres** sebagai lapis kedua. **Invariant kritis ada di database**: constraint, unique partial index, exclusion constraint, dan fungsi transisi status atomik bernama `<schema>.transition_<entitas>(...)` (bagian 4.3) yang memvalidasi transisi, menulis riwayat, audit, dan outbox dalam satu transaksi. |
| Keputusan: eksposur database | (a) **Schema internal** (`platform, org, audit, doc, cms, task, notif, meet, form, cases, know, fin, perf, adm, hand, ai`) **tidak dimasukkan** ke daftar *exposed schemas* Data API/PostgREST (`api.schemas` di `supabase/config.toml` dan setelan proyek staging/production). Schema `public` dibiarkan kosong. GraphQL API dinonaktifkan. Hanya schema **`pub`** (proyeksi published, read-only: role `anon`/`authenticated` hanya punya `SELECT`) yang boleh terekspos. (b) **Browser tidak pernah membaca data internal langsung**. `supabase-js` di browser hanya dipakai untuk alur Auth (login, MFA). Walaupun pengguna mengambil JWT dan anon key-nya sendiri, PostgREST tidak melayani schema internal, dan Storage tidak punya policy untuk bucket internal (ADR-004). (c) **Server membaca/menulis lewat koneksi Postgres server-side** (`src/platform/db/user-db.ts`, pooler mode transaksi) sebagai login role `app_server`. Role ini tidak punya `BYPASSRLS`, hanya anggota `authenticated`. Setiap transaksi request menjalankan `set local role authenticated` dan `select set_config('request.jwt.claims', <klaim JWT yang sudah diverifikasi server>, true)`, sehingga `auth.uid()`, `auth.jwt()`, dan RLS berlaku persis seperti sesi pengguna. Klaim hanya diambil dari JWT yang diverifikasi tanda tangannya di server, tidak pernah dari input klien. (d) **Kebijakan RLS pusat** yang dipanggil setiap policy tabel internal: `org.current_session_valid()` (ADR-003), `org.subject_can_see(resource)` (scope + klasifikasi + periode), dan untuk objek level 4–5: `(auth.jwt()->>'aal') = 'aal2'` **dan** `org.has_valid_step_up(resource_type, resource_id, action)` yang membaca tabel `org.step_up_grants` yang masih berlaku dan belum dipakai (ADR-008). |
| Keputusan: fungsi SQL | Aturan yang bisa dites (dirinci di 5.8): (1) **Actor selalu diambil dari `auth.uid()` di dalam fungsi**, tidak pernah dari parameter. Jalur job memakai fungsi terpisah `<schema>.<nama>_system(...)` yang hanya di-`GRANT EXECUTE` ke role `app_job` dan menulis `actor_type='SYSTEM'`. (2) Setiap fungsi `SECURITY DEFINER` wajib memuat `SET search_path = ''` dan memakai nama objek fully-qualified. (3) Setiap migrasi yang membuat fungsi memuat `REVOKE ALL ON FUNCTION ... FROM PUBLIC, anon, authenticated` lalu `GRANT EXECUTE` minimum. Setiap schema memuat `ALTER DEFAULT PRIVILEGES IN SCHEMA <s> REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated`. (4) Fungsi transisi `SECURITY DEFINER` memanggil `org.authorize(auth.uid(), permission, resource)` di dalamnya. |
| Alasan | RLS menahan kebocoran bila ada bug di lapis aplikasi. Menutup PostgREST untuk schema internal mencegah pengguna melewati service layer (AAL2, step-up PIN, SoD, field restriction, dan audit baca hanya ditegakkan di server + RLS). Constraint DB mencegah data rusak meskipun ada jalur tulis lain. Migrasi SQL membuat skema bisa dibaca KPI dan tidak terkunci pada ORM. |
| Konsekuensi | (1) **Tidak memakai Prisma** karena koneksinya memakai role database yang melewati RLS. (2) Query builder SQL berparameter (misalnya `postgres`/`kysely`) dipakai di repository dengan koneksi `user-db.ts`. `select *` dilarang lint (bagian 3.6). (3) **Role dan kunci berhak tinggi** dibatasi ke daftar tertutup, dipaksa lint allowlist impor dan dicatat audit setiap pemakaian: (i) role DB `app_job` lewat `src/platform/db/job-db.ts`, hanya diimpor dari `src/platform/jobs/**` (worker outbox, cron, scanner, retensi, reset MFA); (ii) **service role key Supabase** hanya diimpor dari `src/platform/storage/**` untuk membuat signed upload/download URL setelah policy lolos (ADR-004), dan dari `src/platform/jobs/auth-admin/**` untuk Admin API Auth (reset MFA oleh job, ADR-003). Pengecualian (ii) dicatat eksplisit di sini karena Storage privat tidak dapat dipakai tanpa kunci layanan atau policy `storage.objects`, dan policy semacam itu justru membuka jalur unduh langsung. Setiap pemakaian menulis audit `actor_type='SERVICE'` + `component`. (4) Service role key dan password `app_server`/`app_job` **dirotasi** setelah setiap akses production sementara oleh pengembang (ADR-007), saat serah terima (BAST), dan pada interval `security.secret_rotation_interval` (BELUM DITENTUKAN; perilaku aman: rotasi wajib di setiap rilis production). (5) Setiap tabel baru wajib punya RLS `ENABLE` + policy + tes pgTAP. Tabel tanpa RLS gagal CI (cek katalog `pg_class.relrowsecurity`). (6) Tes wajib: memanggil PostgREST (`/rest/v1/<tabel>` dengan header `Accept-Profile: <schema internal>`), RPC (`/rest/v1/rpc/<fungsi>`), dan Storage API langsung dengan JWT TEST untuk setiap schema internal harus menghasilkan penolakan (4xx, tanpa data). Kasus ini dicatat sebagai **SEC-01 varian bypass service** (6.1). |
| Penyimpangan dari dokumen | Technical Architecture §4 menyebut ORM Prisma. Diganti SQL migration + generated types. |
| Jalur keluar | Postgres standar. Dump `pg_dump` dan migrasi SQL bisa dijalankan di Postgres mana pun (fungsi `auth.uid()` perlu adaptor). Data diekspor dengan format terbuka (doc 25 §11). |
| Status | Usulan, butuh persetujuan KPI |

### ADR-003 — Autentikasi: Supabase Auth + MFA TOTP + sesi dapat dicabut

| Aspek | Isi |
|---|---|
| Konteks | Technical Architecture §8 dan GAC §4–§6: login email/username + password, MFA, login setiap kali, tanpa trusted-device bypass, logout semua perangkat, sesi dapat dicabut. Q07 (disetujui): MFA aplikasi HP **wajib untuk pemegang jabatan**, sesi dicek berkala; durasi dan interval BELUM DITENTUKAN. |
| Keputusan | **Supabase Auth** dengan email + password. Login dengan username memakai lookup server-side `username → email` tanpa membocorkan keberadaan akun (respons dan waktu seragam). **MFA TOTP**. Sesi punya kedaluwarsa dan bisa dicabut. Tidak ada "ingat perangkat ini". |
| Keputusan: AAL2 (daftar tertutup) | AAL2 **wajib** sebelum rute `(portal)` dan API internal bisa dipakai untuk: `role_code` nomor 1–8 (`KETUA_KPI, SEKJEND, WAKIL_KETUA, SEKRETARIS, BENDAHARA, KEPALA_DIVISI, WAKIL_KEPALA_DIVISI, KOORDINATOR_MP`), 10 (`KETUA_TIM_KERJA`), 12 (`ADMIN_SISTEM`), 13 (`DEVELOPER`; `SERVICE_ACCOUNT` tidak login interaktif), **ditambah** setiap subjek yang punya AccessGrant, delegasi, acting, penugasan fungsional (Auditor, reviewer, approver), atau akses darurat yang aktif. `ANGGOTA_KPI` dan `ANGGOTA_TIM_KERJA` tanpa tambahan tersebut = keputusan terbuka KPI (Q07 hanya menyebut pemegang jabatan). **Perilaku aman selama terbuka: AAL2 juga wajib** bagi mereka. Policy engine menolak request AAL1 dengan `AUTH_MFA_REQUIRED`. |
| Keputusan: pencabutan sesi | (1) "Logout semua perangkat" dan pencabutan karena keamanan menghapus sesi Supabase Auth (semua refresh token) **dan** menulis `org.session_revocations(user_id, session_id nullable, revoked_after timestamptz, reason, revoked_by)`. (2) Fungsi pusat `org.current_session_valid()` (`STABLE`, `SECURITY DEFINER`, `SET search_path = ''`) mengembalikan `false` bila `auth.jwt()->>'session_id'` tidak ada lagi di `auth.sessions`, atau bila ada baris revokasi untuk user/sesi itu dengan `revoked_after >= (auth.jwt()->>'iat')`. Fungsi ini dipanggil **setiap policy RLS tabel internal** dan oleh middleware/policy engine. Access token yang belum kedaluwarsa tidak bisa dipakai di jalur mana pun. (3) **Masa berlaku JWT** proyek Supabase dijadikan key konfigurasi keamanan wajib go-live `auth.jwt_expiry` (BELUM DITENTUKAN). Nilainya diatur di dashboard Supabase, jadi diverifikasi lewat checklist manual (5.12). Makin pendek nilainya, makin kecil jendela bila ada jalur yang lolos dari cek (2). |
| Alasan | Supabase Auth sudah menyediakan hashing, reset token sekali pakai, TOTP, dan level AAL. Membangun sendiri tidak realistis dalam 4 minggu dan lebih berisiko. Access token JWT tetap sah secara kriptografis sampai kedaluwarsa, sehingga pencabutan harus dicek di DB, bukan hanya di middleware. |
| Konsekuensi | (1) Parameter `auth.session_inactivity_timeout`, `auth.session_max_lifetime`, `auth.session_recheck_interval`, `auth.jwt_expiry`, `auth.password_policy`, dan `auth.lockout_threshold` adalah konfigurasi **BELUM DITENTUKAN** (Q07, GAC §22). Production tidak boleh go-live sebelum diisi (bagian 5.12). (2) Pemulihan akibat perangkat hilang: reset MFA dengan dua pejabat berbeda (maker-checker). Setelah checker menyetujui, **reset dieksekusi oleh job teraudit** (`src/platform/jobs/auth-admin/mfa-reset.ts`, Admin API Auth). Jalur request pengguna tidak pernah memegang service role key. (3) Rate limit login, reset password, MFA, dan PIN mengikuti 5.17. Ambang BELUM DITENTUKAN; staging memakai nilai TEST. (4) Metode MFA lain (email/WhatsApp) tidak dibangun (P2, perlu subprosesor). (5) Tes tiga lapis PERM-07: setelah "logout semua perangkat", access token lama yang belum kedaluwarsa ditolak di API `/api/v1` (401 `AUTH_SESSION_REVOKED`), di query DB lewat `user-db.ts` (RLS mengembalikan 0 baris/menolak tulis), dan di PostgREST/Storage langsung (tetap ditolak karena schema tidak terekspos dan tidak ada policy). |
| Penyimpangan dari dokumen | GAC §5 membuka MFA email/WhatsApp. Hanya TOTP yang diusulkan untuk rilis. |
| Jalur keluar | Tabel identitas aplikasi (`org.user_accounts`) terpisah dari `auth.users` dan ditautkan lewat `auth_user_id`, sehingga penyedia identitas bisa diganti (OIDC lain) tanpa mengubah FK bisnis. |
| Status | Usulan, butuh persetujuan KPI |

### ADR-004 — File: Supabase Storage privat + pemeriksaan + karantina

| Aspek | Isi |
|---|---|
| Konteks | Technical Architecture §11, DOC §4–§5, Q10: maksimum 25 MB/file, blokir .exe/.sh, allowlist lengkap BELUM DITENTUKAN. Layar F02: diunggah → diperiksa → siap dipakai atau dikarantina. |
| Keputusan | **Supabase Storage bucket privat** `internal` (tidak ada bucket publik untuk file internal) dengan `file_size_limit` 25 MB dan `allowed_mime_types` sesuai daftar aman 5.12. Bucket publik terpisah `public-assets` hanya berisi salinan aset yang sudah PUBLISHED. **Tidak ada policy `storage.objects` untuk `anon`/`authenticated` pada bucket `internal`** (dites pgTAP). Semua signed URL dibuat oleh modul `src/platform/storage` yang memakai service role key (pengecualian tercatat di ADR-002 Konsekuensi 3). Durasi signed URL dan masa berlaku upload URL adalah **konstanta teknis LEAD** di `src/platform/storage/constants.ts`, bukan kebijakan organisasi. URL dibuat per permintaan dan tidak dibagikan ulang. Status file `UPLOADED → CHECKING → AVAILABLE` atau `QUARANTINED` (lalu `REJECTED`/`AVAILABLE` setelah tinjauan manual). Pemindai malware lewat antarmuka `FileScanner` yang bisa diganti. **Vendor = keputusan terbuka** (butuh persetujuan subprosesor PPD Pasal 6). |
| Keputusan: alur unggah (tetap) | Body request fungsi serverless Vercel dibatasi (sekitar 4,5 MB saat rencana ini ditulis; verifikasi ulang di dokumentasi resmi), jadi file **tidak** melewati Route Handler. Urutannya: (1) Klien `POST /api/v1/doc/uploads` berisi nama file, ukuran, MIME yang dideklarasikan, dan tujuan. Server memeriksa policy, AAL, ukuran ≤ 25 MB, serta ekstensi terhadap blocklist dan daftar aman, lalu membuat baris `doc.files` status `UPLOADED` dengan path acak `quarantine/<uuid v4>` (tanpa nama asli di path) dan signed upload URL. (2) Klien mengunggah langsung ke Storage memakai URL itu. (3) Klien `POST /api/v1/doc/uploads/{id}/complete` → transisi `UPLOADED → CHECKING` + outbox `doc.FileUploaded.v1`. (4) Job `file-check` membaca metadata objek (ukuran nyata), magic bytes, kecocokan ekstensi/MIME/magic bytes, isi OOXML (menolak `vbaProject.bin`), lalu memanggil `FileScanner`. Bila lolos dan scanner bukan `NoopScanner`: objek dipindah ke `available/<uuid>` dan status `AVAILABLE`. Bila gagal: status `QUARANTINED` dengan alasan, objek tetap di `quarantine/`. (5) Upload yang tidak di-`complete` dalam batas konstanta teknis: job menghapus objek karantina dan menandai `REJECTED` (alasan `ABANDONED`). |
| Keputusan: alur unduh (tetap) | `POST /api/v1/doc/files/{id}/download-url` → service memeriksa policy + scope + status `AVAILABLE` + (level 4–5) AAL2 dan step-up yang berlaku. Dalam **satu transaksi DB**, service menulis `doc.download_logs` (untuk LIMITED ke atas) + audit, lalu menandai step-up grant terpakai bila berlaku sekali pakai, dan commit. **Baru setelah commit** signed download URL dibuat dengan opsi unduhan (`Content-Disposition: attachment`). Fail-closed: tanpa log yang ter-commit, URL tidak dibuat. Bila pembuatan URL gagal setelah commit, baris log diberi `url_issued=false` lewat kolom status log (bukan audit yang diubah). |
| Alasan | Metadata di Postgres, biner di object storage (ERD §2). Signed URL singkat mencegah tautan bocor dipakai lama. Tanpa policy `storage.objects`, pengguna tidak bisa melewati PIN, cek status, dan log unduhan dengan memanggil Storage API sendiri. |
| Konsekuensi | (1) Selama vendor scanner belum disetujui, adaptor `NoopScanner` **tidak boleh** menandai file `AVAILABLE` di production. File tetap `CHECKING` dan hanya bisa dilepas lewat pemeriksaan manual teraudit oleh peran berwenang (perilaku aman). (2) File publik untuk website disalin ke bucket `public-assets` hanya setelah konten `PUBLISHED` dan aset diklasifikasi `PUBLIC` (proyeksi, bukan tautan ke file internal). (3) Unduhan file `LIMITED` ke atas wajib dicatat di `doc.download_logs`; untuk `CONFIDENTIAL`/`HIGHLY_CONFIDENTIAL` juga wajib audit. (4) Versi baru gagal scan tidak mengganti versi aktif (DOC §10). (5) Unduhan disajikan sebagai attachment. Header `X-Content-Type-Options: nosniff` dari Storage diverifikasi tes. Bila tidak dikirim, hal ini dicatat sebagai risiko di file 03, dan daftar aman tetap tanpa tipe yang bisa dieksekusi browser (tanpa HTML/SVG). (6) Tes wajib: E2E upload 26 MB ditolak (`FILE_TOO_LARGE` di langkah 1 dan ditolak bucket bila ukuran dideklarasikan palsu); file PE `.exe` yang diganti nama menjadi `.pdf` berakhir `QUARANTINED`; `.docm`, `.svg`, `.zip` ditolak `FILE_TYPE_BLOCKED`; unduh langsung via Storage API dengan JWT TEST mendapat 400/403; pgTAP `storage.objects` tidak punya policy untuk `anon`/`authenticated` pada bucket `internal`. |
| Penyimpangan dari dokumen | Tidak ada. S3-compatible dipenuhi Supabase Storage. Watermark (Technical Architecture §11) = P2. |
| Jalur keluar | Storage key tidak bergantung vendor. Migrasi = salin objek + ubah adaptor `StorageGateway`. |
| Status | Usulan, butuh persetujuan KPI |

### ADR-005 — Job & event: outbox transaksional + cron worker, tanpa Redis

| Aspek | Isi |
|---|---|
| Konteks | Doc 22 §7–§8, §14: event catalog, idempotency, retry, dead-letter. ERD §12: notifikasi tidak boleh menggagalkan transaksi inti; memakai outbox. Technical Architecture §4 menyebut Redis untuk queue. |
| Keputusan | Tabel **`platform.outbox_events`** diisi di transaksi yang sama dengan perubahan bisnis. Worker dipicu **pg_cron** sebagai pemicu utama (jadwal per menit, memanggil fungsi `*_system` atau `pg_net` ke endpoint worker) dan **Vercel Cron** hanya sebagai cadangan, ke `/api/internal/jobs/<nama>` yang dilindungi secret + allowlist. Frekuensi Vercel Cron bergantung paket (paket gratis hanya harian saat rencana ditulis), sehingga job yang butuh presisi menit tidak boleh bergantung padanya. Konsumen mencatat `platform.consumed_events(consumer, event_id)` unique, sehingga pemrosesan ganda tidak menggandakan efek. Job terjadwal: penandaan overdue tugas, pengiriman notifikasi, publikasi terjadwal CMS, kedaluwarsa grant/delegasi/assignment, retensi (non-destruktif selama BELUM DITENTUKAN), pembersihan upload terputus. Retry dengan backoff eksponensial dan batas percobaan. Setelah melewati batas, status `DEAD` + alert admin + replay manual teraudit. |
| Alasan | Tanpa infrastruktur tambahan. Outbox menjamin event tidak hilang meskipun penyedia email mati. |
| Konsekuensi | (0) Persetujuan ADR ini bergantung pada `RILIS-E00-T04` (paket langganan dan biaya). (1) Batas retry dan jeda backoff: konstanta teknis LEAD, dicatat di konfigurasi, bukan kebijakan KPI. SLA keterlambatan event (doc 22 §14) BELUM DITENTUKAN. (2) Granularitas cron terbatas dan job bisa terlambat. Job yang kritis waktu (kedaluwarsa akses) **juga** ditegakkan saat evaluasi policy (`valid_until < now()` ditolak meskipun job belum jalan), sehingga keamanan tidak bergantung pada jadwal job. |
| Penyimpangan dari dokumen | Tidak memakai Redis (Technical Architecture §4). |
| Jalur keluar | Envelope event (bagian 5.6) netral terhadap broker. Worker bisa diganti ke queue terkelola tanpa mengubah producer. |
| Status | Usulan, butuh persetujuan KPI |

### ADR-006 — Pencarian: Postgres FTS dengan filter izin

| Aspek | Isi |
|---|---|
| Konteks | Technical Architecture §12, §15; KNOW; W04: tidak boleh bocor judul/cuplikan di atas izin. |
| Keputusan | **Postgres Full-Text Search** (`tsvector` + GIN; kamus `simple` + `indonesian` bila tersedia, `english` untuk konten EN). Pencarian internal dijalankan sebagai query yang **sudah difilter izin di SQL** (RLS + predikat scope/klasifikasi), bukan filter setelah hasil diambil. Pencarian publik hanya membaca **proyeksi `pub.*` berstatus PUBLISHED** yang tidak punya FK ke tabel internal yang bisa di-join publik. |
| Alasan | Volume KPI kecil. Satu database menyederhanakan konsistensi izin. |
| Konsekuensi | Hitungan hasil dan facet juga harus difilter izin agar tidak membocorkan keberadaan data (doc Role Permission Matrix §12). Tes kebocoran pencarian wajib (bagian 6.2). |
| Penyimpangan dari dokumen | Tidak ada (sesuai "PostgreSQL FTS awal"). |
| Jalur keluar | OpenSearch/Meilisearch bila volume naik, dengan indeks yang menyimpan ACL. |
| Status | Usulan, butuh persetujuan KPI |

### ADR-007 — Hosting: Vercel + Supabase atas nama KPI, tiga lingkungan

| Aspek | Isi |
|---|---|
| Konteks | Technical Architecture §5 (lokal/staging/production), PPD Pasal 4 (akun admin utama, domain, hosting, repository, penyimpanan di bawah kendali KPI), PPD Pasal 6 (subprosesor butuh persetujuan tertulis dan penjelasan lokasi), PHHP Pasal 4–5 (repository organisasi, akses administratif diserahkan, tanpa backdoor). |
| Keputusan | **Vercel** (aplikasi Next.js) + **Supabase** (DB, Auth, Storage) dengan **akun organisasi milik KPI**. Repository GitHub di organisasi milik KPI. Lingkungan terpisah: **local** (Supabase CLI, data TEST), **staging** (data TEST), **production** (data nyata). **Region** Supabase/Vercel, penyedia email transaksional, penyedia AI, dan pemindai malware adalah **keputusan terbuka** yang wajib disetujui tertulis KPI sebelum dipakai dengan data nyata. |
| Keputusan: pemisahan akses platform | (1) **Production** berada di **organisasi Supabase sendiri** dan **tim/proyek Vercel sendiri** milik KPI dengan **nol anggota pengembang**. Keanggotaan organisasi Supabase memberi akses ke semua proyek di organisasi itu (role per proyek hanya ada di paket tertentu), dan anggota tim Vercel dapat membaca environment variable production. Karena itu staging ditempatkan di **organisasi Supabase dan tim Vercel yang berbeda**; hanya di sana pengembang boleh menjadi anggota (bukan owner). (2) Akses production pengembang hanya lewat **undangan berbatas waktu** yang dibuat owner KPI atas permintaan tertulis. Undangan dicatat sebagai grant sementara (`org.emergency_access_grants` atau `org.access_grants` dengan `valid_until`), dicabut setelah selesai, dan diikuti **rotasi service role key serta password role DB** (ADR-002 Konsekuensi 4). (3) Peran nomor 13 dok 23 dipecah menjadi dua `role_code`: `DEVELOPER` (manusia, akun individual, MFA wajib) dan `SERVICE_ACCOUNT` (mesin, tidak login interaktif). Setiap service account wajib punya `owner_user_id`, `purpose`, `permissions` minimum, `secret_rotated_at`, dan `review_due_at` (dok 23 §13). (4) Gerbang go-live dan bukti BAST: task KPI `RILIS-E90-T01` **"verifikasi daftar anggota platform production (GitHub org owner, organisasi Supabase production, tim Vercel production) = hanya akun KPI"**, dengan tangkapan layar daftar anggota yang diredaksi. |
| Keputusan: paket minimum per lingkungan | Tabel ini memuat **fitur yang dibutuhkan**, bukan harga. Ketentuan paket (batas, harga, izin pemakaian organisasi) wajib diverifikasi ulang di halaman resmi saat `RILIS-E00-T04` dikerjakan. |

| Lingkungan | Supabase | Vercel | Fitur yang dibutuhkan | Catatan |
|---|---|---|---|---|
| local | Supabase CLI (Docker) | `next dev` | — | Data TEST |
| staging | Organisasi terpisah; paket gratis boleh bila KPI setuju | Tim/proyek terpisah | pg_cron, Storage privat | Risiko proyek gratis dijeda saat tidak aktif dan tanpa backup terjadwal: diterima karena hanya data TEST |
| production | Organisasi terpisah; **paket berbayar** yang menyediakan backup harian terkelola dan proyek tidak dijeda (PITR sesuai keputusan biaya KPI) | Tim/proyek terpisah; paket yang mengizinkan pemakaian organisasi dan kontrol anggota | Backup terkelola, pg_cron per menit, domain kustom, kontrol anggota, log akses | Paket gratis Supabase tidak menyediakan backup terjadwal, dan paket hobi Vercel ditujukan untuk pemakaian pribadi non-komersial dengan cron harian (per ketentuan saat rencana ditulis) |

| Aspek | Isi |
|---|---|
| Alasan | Tanpa server yang harus dirawat KPI. Cocok dengan kapasitas organisasi mahasiswa. Dok 27 §7 melarang akses produksi permanen bagi developer. |
| Konsekuensi | (1) Secret per lingkungan di Vercel/Supabase, tidak pernah di repo (gitleaks di CI). (2) Deploy production hanya dari tag rilis di branch `main` yang dilindungi, disetujui KPI. Pipeline deploy production memakai token deploy milik KPI yang disimpan di GitHub Environment `production` dengan reviewer wajib dari KPI. (3) Nilai all-in PKS Ps 7 hanya menyebut domain .org 2 tahun. Biaya langganan platform harus dicantumkan transparan (PKS Pasal 9, PHHP Pasal 6) dan disetujui lewat `RILIS-E00-T04`, yang **memblokir persetujuan ADR-005, ADR-007, dan ADR-010**. (4) **Alternatif bila KPI menolak biaya** (dicatat sebagai risiko tinggi di file 03, bukan default): job hanya lewat pg_cron internal; backup hanya lewat ekspor `pg_dump` terenkripsi + salinan Storage terjadwal (ADR-010) tanpa backup terkelola; risiko proyek dijeda dan RPO memburuk ditandatangani KPI. (5) Backup dan restore diatur ADR-010. |
| Penyimpangan dari dokumen | Technical Architecture §4/§23: Docker-based deployment. Diganti platform terkelola. |
| Jalur keluar | Next.js bisa di-host di Node server/Docker. Supabase bisa self-host atau diganti Postgres + S3 + OIDC (ADR-002/003/004). |
| Status | Usulan, butuh persetujuan KPI |

### ADR-008 — Kerahasiaan: 5 tingkat + step-up PIN milik KPI

| Aspek | Isi |
|---|---|
| Konteks | Database ERD §7 dan index.html: 5 tingkat. Kartu "Kerahasiaan Data & Batas Akses Pengembang" di `index.html` menjanjikan dokumen rahasia terbuka dengan **PIN yang ditentukan dan disimpan tim KPI**, dan pengembang tidak menyimpan, melihat, atau dapat memulihkan PIN. Q15: AI hanya menerima Umum/Internal. Q03: akses rahasia melekat pada jabatan, diaudit. |
| Keputusan | Enum `classification_level` 5 tingkat (bagian 3.3). Membuka isi, mengunduh, membagikan, atau mengekspor objek `CONFIDENTIAL` atau `HIGHLY_CONFIDENTIAL` mensyaratkan **tiga hal sekaligus**: (1) izin + scope sah dari policy engine, (2) sesi **AAL2**, dan (3) **step-up PIN** yang masih berlaku. PIN **per pengguna pemegang akses** (usulan; alternatif PIN bersama ditolak karena tidak bisa diaudit per orang dan harus dibagi), ditetapkan sendiri oleh pejabat KPI saat enrolment setelah AAL2. **Alur hash:** (a) Server aplikasi menerima PIN lewat TLS, memvalidasi format terhadap `security.pin_min_length`/`security.pin_format`, lalu menghitung `HMAC-SHA256(pepper, user_id || ':' || pin)`. **Pepper** disimpan hanya di secret store lingkungan production milik KPI (environment variable proyek Vercel production yang tidak punya anggota pengembang, ADR-007). Pepper tidak disimpan di DB, backup DB, repo, atau staging, dan tidak dapat dibaca pengembang. Staging memakai pepper TEST yang berbeda. (b) Yang dikirim ke DB **hanya hasil HMAC (hex)**, sehingga PIN plaintext tidak pernah menjadi argumen SQL dan tidak dapat terekam log statement Postgres. (c) DB menyimpan `crypt(hmac_hex, gen_salt('bf', 12))` di `org.step_up_credentials`, yang **tidak punya policy SELECT** untuk peran mana pun. Verifikasi hanya lewat `org.verify_step_up_pin(p_pin_hmac text, p_resource_type, p_resource_id, p_action)` (`SECURITY DEFINER`, actor dari `auth.uid()`). Bila cocok, fungsi mengembalikan boolean dan membuat baris `org.step_up_grants`. Bila salah, fungsi menaikkan penghitung gagal dengan **lockout server-side** (`security.pin_max_attempts`). (d) PIN tidak pernah dicatat di log, audit, error, analytics, atau tracing (redaksi wajib + tes). **Panjang minimum PIN** ditetapkan KPI (`security.pin_min_length`). Bila `NOT_SET`, fitur buka level 4–5 di production tetap nonaktif. **Reset PIN** hanya lewat prosedur KPI: permintaan oleh pemilik atau pejabat → persetujuan dua pejabat KPI berbeda dan bukan pemilik PIN (daftar pejabat BELUM DITENTUKAN, usulan: Ketua + Sekretaris; bila salah satunya pemilik, pejabat pengganti BELUM DITENTUKAN) → status `RESET_REQUIRED` → pemilik membuat PIN baru setelah AAL2. Seluruh langkah teraudit. **AI hanya menerima PUBLIC/INTERNAL** (Q15); `LIMITED`, `CONFIDENTIAL`, `HIGHLY_CONFIDENTIAL` tidak pernah dikirim ke penyedia AI. |
| Keputusan: HIGHLY_CONFIDENTIAL | Akses level 5 = **AccessGrant per objek** (`org.access_grants` dengan `resource_type`, `resource_id`, `valid_until`) yang disetujui `KETUA_KPI` atau `SEKJEND`, dengan **penyetuju ≠ pemohon** (Ketua yang memohon disetujui Sekjend, dan sebaliknya), **ditambah** AAL2 dan PIN **per buka** (step-up level 5 selalu sekali pakai, tidak memakai `security.stepup_validity`). Apakah `KETUA_KPI`/`SEKRETARIS` (Q03) dikecualikan dari grant per objek = keputusan terbuka KPI. **Perilaku aman selama terbuka:** tidak ada pengecualian; Sekretaris juga wajib grant per objek. |
| Alasan | Memenuhi janji yang tampil di situs rancangan tanpa klaim palsu. PIN berentropi rendah (misalnya 6 digit ≈ 10^6 kombinasi) bisa di-brute-force offline dari dump atau backup bila hanya di-hash. Dengan pepper di luar DB, dump/backup saja tidak cukup untuk menebak PIN. |
| Konsekuensi | (1) Durasi berlaku step-up, panjang/format PIN, dan ambang salah PIN BELUM DITENTUKAN. Perilaku aman bila kosong: step-up berlaku **hanya untuk satu aksi** dan fitur buka CONFIDENTIAL/HIGHLY_CONFIDENTIAL di production **nonaktif** sampai nilai diisi. (2) **Batas kejujuran** (wajib ditulis apa adanya di dokumentasi keamanan): (a) pemegang akses superuser database production secara teknis bisa **mengganti** hash, meski tidak bisa membaca PIN; (b) **kode server** yang ditulis pengembang menerima PIN plaintext di memori saat verifikasi, sehingga perubahan kode berniat buruk bisa menyadapnya; (c) bila **pepper dan backup DB bocor bersamaan**, PIN pendek bisa di-brute-force offline. Mitigasi: pengembang tidak punya akses production (ADR-007); `CODEOWNERS` mewajibkan review **LEAD dan perwakilan KPI** untuk `src/modules/org/step-up/**` dan migrasi `step_up_*`; tidak ada logging di jalur itu (tes); trigger audit + notifikasi ke Ketua dan Sekretaris pada setiap perubahan baris `step_up_credentials`; pepper tidak ikut backup; prosedur rotasi pepper (seluruh PIN menjadi `RESET_REQUIRED`) terdokumentasi di runbook; review akses bulanan. Copy UI dan dokumen tidak boleh mengklaim "mustahil diretas". (3) Q03: Ketua dan Sekretaris membuka rahasia karena **jabatannya**, bukan karena peran Admin Sistem. Tetap wajib PIN + AAL2 + audit. (4) Tes wajib: setelah verifikasi PIN TEST (benar dan salah), log aplikasi, log Postgres lokal (dengan `log_statement='all'` di lingkungan tes), dan audit **tidak memuat string PIN TEST**; memanggil `verify_step_up_pin` melebihi ambang TEST menghasilkan lockout walaupun PIN benar; `step_up_credentials` tidak bisa di-`SELECT` oleh `authenticated`, `app_server`, maupun `app_job`. (5) Kalimat kartu `index.html` ("Pengembang tidak menyimpan, melihat, atau dapat memulihkan PIN itu") tetap dapat dipertahankan dengan kontrol di atas. Usulan penyelarasan, yang butuh persetujuan KPI dan dicatat di file 03: "PIN tidak disimpan dalam bentuk yang bisa dibaca, dan pengembang tidak punya akses ke sistem production tempat PIN diperiksa." File `index.html` tidak diubah oleh paket ini. |
| Penyimpangan dari dokumen | Dokumen arsitektur tidak menyebut PIN. PIN berasal dari janji situs rancangan yang disetujui. Rincian PIN adalah usulan lead. |
| Jalur keluar | Step-up bisa diganti WebAuthn/passkey tanpa mengubah model izin (antarmuka `StepUpVerifier`). |
| Status | Usulan, butuh persetujuan KPI |

### ADR-009 — Strategi tes dan kontrol mutu

| Aspek | Isi |
|---|---|
| Konteks | Doc 24 (acceptance, PERM, INT, severity, go-live), Technical Architecture §21, Development Specification §23, doc 23 §16 (RP-01..12). |
| Keputusan | **Vitest** (unit + integrasi service terhadap DB lokal), **pgTAP** via `supabase test db` (RLS, constraint, fungsi transisi, trigger audit), **Playwright** (E2E; viewport **390×844, 768×1024, 1280×800**; **@axe-core/playwright** untuk a11y), **matriks izin** otomatis 13 peran × aksi × scope termasuk kasus negatif (bagian 6.2), **gitleaks** + `npm audit`/`osv-scanner` + lint + typecheck di **GitHub Actions**. Branch `main` dilindungi: PR wajib hijau + review. **`CODEOWNERS`** mewajibkan approval **LEAD manusia** (review oleh model AI tidak dihitung) untuk `supabase/migrations/**`, `src/modules/org/policy/**`, `src/modules/org/step-up/**`, `src/platform/{db,storage,http,jobs}/**`, `src/modules/audit/**`, dan `.github/**` (Technical Architecture §18: perubahan sensitif keamanan wajib direview). Pipeline men-deploy setiap merge ke `main` ke **staging** dan menjalankan smoke E2E di sana. Tes katalog (pgTAP) dan tes eksposur database (SEC-01 varian bypass service) berjalan di CI. |
| Alasan | Doc 24 §1: pengujian harus dapat diulang dan punya bukti, bukan pernyataan pengembang. |
| Konsekuensi | Waktu CI bertambah; E2E penuh dijalankan pada PR ke `main` dan nightly, smoke E2E pada setiap PR. Laporan tes (JUnit + HTML Playwright + output pgTAP) disimpan sebagai artifact CI dan dilampirkan ke bukti task. |
| Penyimpangan dari dokumen | Tidak ada. Performance test (Technical Architecture §21) terbatas pada skenario daftar besar/pencarian/upload di F4 (P1). |
| Jalur keluar | Tidak relevan. |
| Status | Usulan, butuh persetujuan KPI |

### ADR-010 — Backup, retensi backup, dan uji pemulihan

| Aspek | Isi |
|---|---|
| Konteks | Dok 27 §7: backup harus terenkripsi, diuji pemulihannya, dan punya retensi yang ditetapkan. Technical Architecture §17: backup DB otomatis, file storage punya backup/versioning, backup tidak dianggap berhasil sebelum diverifikasi, dan tidak boleh bergantung pada satu mesin. Dok 24 OPS-01/OPS-02 dan §7: backup dipulihkan ke lingkungan uji dan diverifikasi dengan checksum. Backup database Supabase **tidak mencakup objek Storage** (bukti tugas, dokumen, kuitansi), dan paket gratis tidak punya backup terjadwal. |
| Keputusan | (1) **Backup DB terkelola** Supabase sesuai paket production yang disetujui (`RILIS-E00-T04`); PITR hanya bila KPI memilih biayanya. (2) **Ekspor terjadwal `pg_dump`** production dienkripsi dengan kunci publik milik KPI (kunci privat hanya dipegang KPI), lalu dikirim ke **penyimpanan kedua milik KPI** (`backup.secondary_target`). (3) **Salinan objek Storage** bucket `internal` dan `public-assets` disinkronkan terjadwal ke penyimpanan kedua, disertai **manifest** `(file_id, path, size, sha256, copied_at)` yang juga terenkripsi. (4) Job ekspor dan sinkronisasi berjalan di **repository GitHub terpisah milik KPI** (misalnya `kpi-backup`) **tanpa anggota pengembang**, memakai secret production yang hanya dipegang KPI. Pengembang menyerahkan skrip dan runbook, bukan menjalankannya di production. (5) Key `backup.schedule`, `backup.retention`, `backup.rpo`, `backup.rto`, dan `backup.secondary_target` masuk registry 5.12 sebagai **gerbang go-live**. (6) **Uji restore**: dump dan objek dipulihkan ke **proyek Supabase kosong terpisah** di organisasi production KPI. Verifikasi mencakup kecocokan checksum 100% terhadap manifest, jumlah baris tabel kunci, verifikasi rantai hash audit (5.7), dan smoke login. Proyek uji dihapus oleh KPI setelah selesai. Hasilnya menjadi bukti OPS-01/OPS-02. Pelaksana: KPI dengan runbook; pengembang hanya lewat grant sementara bila KPI memintanya secara tertulis. (7) Backup **tidak pernah diunduh ke perangkat pengembang** (K6). Pepper PIN (ADR-008) tidak ikut backup DB dan disimpan terpisah oleh KPI. (8) Retensi backup tunduk pada legal hold (5.7): backup yang memuat data berstatus hold tidak dihapus oleh job retensi backup. |
| Alasan | Tanpa salinan Storage, DB yang pulih akan menunjuk ke file yang hilang. Tanpa uji restore dengan checksum, backup tidak dapat dianggap berhasil. |
| Konsekuensi | (1) Selama key backup `NOT_SET`, production tidak boleh go-live. (2) Biaya penyimpanan kedua masuk `RILIS-E00-T04`. (3) Staging tidak di-backup (hanya data TEST, bisa dibangun ulang dari migrasi + seed). (4) Bila KPI menolak biaya paket berbayar, butir (2)–(3) menjadi satu-satunya backup, dan risiko RPO memburuk dicatat di file 03 (ADR-007 Konsekuensi 4). |
| Penyimpangan dari dokumen | Tidak ada. |
| Jalur keluar | Format terbuka (`pg_dump`, objek biasa + manifest), bisa dipulihkan ke Postgres/S3 mana pun. |
| Status | Usulan, butuh persetujuan KPI |

### 2.10 Keputusan lintas modul lain (lead, bagian dari ADR paket)

| Topik | Keputusan usulan | Sumber |
|---|---|---|
| Zona waktu | Simpan `timestamptz` (UTC). Zona organisasi **`Africa/Cairo`** (IANA, bukan offset tetap; Mesir memakai DST). Tanggal tanpa jam (tenggat harian, tanggal efektif) disimpan `date` + ditafsirkan di Africa/Cairo. Label zona ditampilkan jelas di setiap jadwal. Tampilan dua zona = BELUM DITENTUKAN (Q18). | Q18, dok 23 §17, GAC §2 |
| Uang | Tanpa `float`/`real`. Nominal disimpan `bigint` **minor unit** + `currency char(3)` ISO 4217; kurs `numeric(20,10)` + `rate_source` + `rate_at`. Pembulatan konversi: **half-even** di satu fungsi `money.convert()` (usulan, konfirmasi KPI/Bendahara). Mata uang dasar BELUM DITENTUKAN (Q20). | Q20, FIN |
| Hapus data | Tidak ada hard delete dari UI untuk data penting. `archived_at/archived_by/archive_reason` atau `deleted_at/deleted_by`. Hard delete hanya via job retensi teraudit setelah retensi diisi KPI. | dok 20 §18, ERD §10, Q26 |
| Audit | Immutable di level aplikasi: tabel `audit.audit_events` tanpa grant UPDATE/DELETE untuk role aplikasi, trigger penolak, hash rantai **per partisi harian** dengan advisory lock, kepala rantai diekspor harian ke penyimpanan KPI di luar DB (deteksi perubahan tingkat superuser), audit DENIED/FAILURE ditulis di luar transaksi bisnis, dan legal hold. Rincian di 5.7. | dok 27 §7, §8; dok 20 §18; dok 23 §17; GAC §17; Q26 |
| Data uji | Hanya data sintetis berlabel TEST. Tidak pernah memakai data produksi atau kredensial nyata. | PPD Pasal 5, NDA Pasal 4, dok 24 §9 |
| Salinan UI | Bahasa Indonesia yang mudah; tanpa klaim palsu; tanpa atribusi alat pembuat; tidak menyebut "Apple HIG". Portal internal hanya Bahasa Indonesia (istilah Inggris boleh dalam kurung); publik ID/EN. | Development Spec §22, Master Arch §P |
| Visual | Token dari `styles.css`: krem hangat, merah KPI `--accent #C4161C` (mode gelap `#F0857B`), font **Sora** bobot 400–600, tema terang/gelap via `data-theme` + `prefers-color-scheme`. `01-DESIGN-SYSTEM.md` tidak dipakai. Logo final menunggu file asli (Q17). | Q17, styles.css |

---

## 3. Organisasi, peran, kerahasiaan, model izin, periode

### 3.1 Struktur organisasi authoritative (dok 23 §4, dok 27 §4, dok 20 §3, dok 25 §3)

| Tingkat | Unit (`unit_type`) | Kode unit usulan | Jabatan |
|---|---|---|---|
| Organisasi | `ORGANIZATION` (akar) | `KPI` | Tidak ada jabatan langsung. Ketua KPI adalah pimpinan organisasi lewat jabatannya di BPH (`positions.is_organization_head = true`). |
| BPH | `BPH` (parent `KPI`) | `BPH` | **Ketua KPI** (pemilik sistem, pengambil keputusan tertinggi), Sekretaris Jenderal, Wakil Ketua, Sekretaris, Bendahara. Dok 27 §4, dok 20 §3, dan dok 25 §3 menyatakan BPH terdiri atas lima jabatan ini. Dok 23 §4 menulis Ketua di baris terpisah sebagai pimpinan, tetapi tidak mengeluarkannya dari BPH. |
| Divisi | `DIVISION` | `DIV_IO` | Intelligence and Operation Division: Kepala, Wakil Kepala |
| Divisi | `DIVISION` | `DIV_RA` | Research and Analysis Division: Kepala, Wakil Kepala |
| Divisi | `DIVISION` | `DIV_PE` | Prevention and Education Division: Kepala, Wakil Kepala |
| Subbidang | `SUBUNIT` (parent `DIV_PE`) | `SUB_MP` | Media and Publication: **hanya Koordinator**. Bukan divisi mandiri. |
| Tim kerja sementara | `TEMP_TEAM` | `TEAM_<nomor keputusan>` | Ketua Tim Kerja, Anggota Tim Kerja. Wajib ada surat/keputusan, mandat, tanggal mulai dan berakhir. |

Aturan mengikat yang harus ditegakkan di DB dan policy:

1. **Tidak boleh rangkap jabatan.** Satu jabatan aktif hanya dipegang satu orang (unique partial index + exclusion constraint rentang tanggal pada `position_id`), dan satu orang hanya memegang satu jabatan kepengurusan aktif (exclusion `(member_id, daterange)` untuk `position_kind='OFFICE'`). Keanggotaan tim kerja dan peran sistem (Admin Sistem) **bukan** jabatan kepengurusan, jadi tidak dihitung rangkap. Penafsiran ini wajib dikonfirmasi KPI (keputusan terbuka di file 03).
2. Akses melekat pada **assignment aktif**, bukan orang. Akses berakhir otomatis saat `valid_until` lewat. Batas ini dicek saat evaluasi izin, tidak menunggu job.
3. Pengangkatan kepala, wakil, dan koordinator: **Ketua berdasarkan musyawarah BPH**. Perpindahan divisi/jabatan dan restrukturisasi: **sidang anggota KPI**. Setiap perubahan wajib punya `decision_reference` (FK ke `meet.decisions` bila modul MEET sudah ada, atau nomor dokumen keputusan sebelum itu).
4. **Anggota eksternal tim kerja tidak pernah punya UserAccount.** Mereka hanya disimpan sebagai `org.external_participants` dengan kolom nama, lembaga, peran di tim, dan **kontak resmi lembaga**. Tidak ada kolom nomor HP atau email pribadi (Q16, disetujui). Tes RP-05, PERM-06.
7. **Scope `BPH`** = assignment aktif pada jabatan `{KETUA_KPI, SEKJEND, WAKIL_KETUA, SEKRETARIS, BENDAHARA}`, dihitung dari kode jabatan, bukan dari keanggotaan unit semata. Tes wajib: `KETUA_KPI × doc.document.view × BPH = ALLOW`, dan `KETUA_KPI` masuk daftar peserta musyawarah BPH.
5. Pengecualian **admin demisioner** Ketua/Sekretaris berlaku hanya setelah keputusan sidang anggota, hanya untuk **pengaturan sistem** (Q27), dan dicabut otomatis saat grant admin baru `ACTIVE`. Tes RP-08, RP-09, PERM-05.
6. Pelaksana tugas (acting) dan delegasi: tanggal mulai/akhir wajib, tidak melebihi kewenangan pemberi, dan tidak otomatis memberi akses sistem tambahan (dok 21 §2, §6).

### 3.2 Katalog 13 peran resmi (dok 23 §5)

Dokumen 23 memberi **nama** 13 peran tetapi **tidak memberi kode**. Dok 23 §17 menyatakan daftar role resmi dan kode unik setiap role wajib dikunci sebelum coding. Nama di kolom kedua diambil **persis** dari dok 23. Kode di kolom ketiga adalah **usulan lead** yang **wajib dikonfirmasi KPI** (masuk `RILIS-E00-T01`), konsisten dengan `KETUA_KPI` dan `SEKJEND` di Role Permission Matrix §3. Q01 **tidak** menyetujui kode peran sistem. Q01 hanya dikutip untuk aturan seed: selama daftar pengurus belum diterima, seed memakai kode jabatan, bukan nama orang.

| No | Nama peran (persis dok 23) | Kode usulan `role_code` | Jenis | Basis penetapan (dok 23) | Catatan akses |
|---|---|---|---|---|---|
| 1 | Ketua KPI | `KETUA_KPI` | Jabatan | Penetapan resmi/sidang | Keputusan tertinggi; akses sensitif tetap diaudit; PIN + AAL2 |
| 2 | Sekretaris Jenderal | `SEKJEND` | Jabatan | Penetapan resmi | Koordinasi administratif lintas fungsi; perbandingan kinerja lintas divisi (Q02) |
| 3 | Wakil Ketua | `WAKIL_KETUA` | Jabatan | Penetapan resmi | Mendukung/menggantikan sesuai mandat (acting eksplisit, tidak otomatis) |
| 4 | Sekretaris | `SEKRETARIS` | Jabatan | Penetapan resmi | Administrasi, surat, agenda, dokumentasi |
| 5 | Bendahara | `BENDAHARA` | Jabatan | Penetapan resmi | Keuangan; tidak boleh mengaudit transaksi yang ia proses |
| 6 | Kepala Divisi | `KEPALA_DIVISI` | Jabatan (scope divisi) | Ketua berdasarkan musyawarah BPH | Scope divisinya |
| 7 | Wakil Kepala Divisi | `WAKIL_KEPALA_DIVISI` | Jabatan (scope divisi) | Ketua berdasarkan musyawarah BPH | Scope divisinya |
| 8 | Koordinator Media and Publication | `KOORDINATOR_MP` | Jabatan (scope subbidang) | Ketua berdasarkan musyawarah BPH | Scope subbidang M&P |
| 9 | Anggota KPI | `ANGGOTA_KPI` | Status keanggotaan | Status anggota aktif | Milik sendiri + assignment tambahan |
| 10 | Ketua Tim Kerja | `KETUA_TIM_KERJA` | Penugasan tim | Surat/keputusan pembentukan | Hanya tim dan mandatnya |
| 11 | Anggota Tim Kerja | `ANGGOTA_TIM_KERJA` | Penugasan tim | Surat/keputusan pembentukan | Hanya tugas tim |
| 12 | Admin Sistem | `ADMIN_SISTEM` | Peran sistem | Penetapan sah; Q03: dipegang **Ketua dan Sekretaris** | Pengaturan teknis saja; peran ini **tidak** membuka isi data |
| 13 | Developer/Service Account | Dipecah dua: `DEVELOPER` (manusia) dan `SERVICE_ACCOUNT` (mesin) | Principal teknis | Kontrak/penugasan teknis | Nol akses isi organisasi. `DEVELOPER`: akun individual, MFA wajib, production hanya lewat grant sementara teraudit (RP-06, ADR-007). `SERVICE_ACCOUNT`: tidak login interaktif; wajib `owner_user_id`, `purpose`, permission minimum, `secret_rotated_at`, `review_due_at` (dok 23 §13). Matriks izin tetap menghitung 13 peran; baris 13 dites untuk kedua subtipe. |

Rekonsiliasi yang wajib diikuti eksekutor:

- **Auditor** muncul di matriks `index.html`, dok 21 §3 ("Auditor/Reviewer Keuangan"), dan dok 23 §7 FIN ("Auditor: AU, V"), tetapi **tidak termasuk** 13 peran dok 23. Di sistem, Auditor adalah **penugasan fungsional** (`functional_assignment='AUDITOR'`) yang memberi aksi `AU` + `V` dengan scope eksplisit lewat AccessGrant berbatas waktu. Siapa auditor dan independensinya dari Bendahara = keputusan terbuka KPI.
- **Reviewer/Approver** adalah penugasan per resource (reviewer tugas, approver konten), bukan peran.
- Matriks `index.html` menggabungkan "Kepala & Wakil Divisi" dan "Tim Kerja" dalam satu kolom. Di sistem keduanya tetap peran terpisah. **Baseline mengikuti dok 23 §7 apa adanya:** untuk TASK, `KEPALA_DIVISI` dan `WAKIL_KEPALA_DIVISI` sama-sama mendapat `V,C,E,R,A` dalam scope divisi. Untuk modul yang di dok 23 §7 hanya menyebut "Kepala" (MEET, DOC, KNOW, NOTIF, PERF, HAND), hak Wakil Kepala = **keputusan terbuka KPI**. Perilaku aman selama terbuka: Wakil Kepala memakai hak `ANGGOTA_KPI` di modul itu, ditambah hak Kepala hanya lewat acting/delegasi aktif. Tes matriks wajib: `WAKIL_KEPALA_DIVISI × task.task.approve × DIVISION(sendiri) = ALLOW`; `WAKIL_KEPALA_DIVISI × task.task.approve × DIVISION(lain) = DENY`; `WAKIL_KEPALA_DIVISI × perf.evaluation.approve × DIVISION = ALLOW_IF(acting/delegasi aktif)` sampai KPI memutuskan.
- Pemetaan ke role baseline Role Permission Matrix §3: `KETUA_KPI`→KETUA_KPI; `SEKJEND`→SEKJEND; `WAKIL_KETUA`, `SEKRETARIS`, `BENDAHARA`→LEADERSHIP (dengan mandat fungsi); `KEPALA_DIVISI`, `WAKIL_KEPALA_DIVISI`, `KOORDINATOR_MP`→DIVISION_COORDINATOR; `ANGGOTA_KPI`, `KETUA_TIM_KERJA`, `ANGGOTA_TIM_KERJA`→INTERNAL_USER; `ADMIN_SISTEM`→SYSTEM_ADMIN; `DEVELOPER`, `SERVICE_ACCOUNT`→tanpa padanan bisnis (principal teknis); Auditor→AUDITOR_REVIEWER; pengunjung→PUBLIC (tanpa akun).
- Q03 dibandingkan dok 23 §5: Ketua dan Sekretaris memegang `ADMIN_SISTEM`. Hak membuka dokumen rahasia datang dari `KETUA_KPI`/`SEKRETARIS`, bukan dari `ADMIN_SISTEM`. Perubahan peran/izin oleh admin wajib **maker-checker**: admin A mengusulkan, admin B menyetujui, dan tidak ada yang menyetujui perubahan atas dirinya sendiri.

### 3.3 Lima tingkat kerahasiaan (ERD §7, index.html, Q15)

| Level | Kode enum `classification_level` | Label ID | Label EN | Sinonim di dokumen | Aturan minimum |
|---|---|---|---|---|---|
| 1 | `PUBLIC` | Umum | Public | Public (dok 20) | Tampil publik **hanya** lewat proyeksi PUBLISHED. Boleh dikirim ke AI. |
| 2 | `INTERNAL` | Internal | Internal | Internal | Pengurus terdaftar sesuai scope. Boleh dikirim ke AI (Q15). |
| 3 | `LIMITED` | Terbatas | Limited | Restricted (dok 20), LIMITED (ERD) | Divisi/kelompok tertentu. Tidak dikirim ke AI. |
| 4 | `CONFIDENTIAL` | Rahasia | Confidential | Confidential | Izin eksplisit + AAL2 + step-up PIN; setiap buka/unduh dicatat. Tidak dikirim ke AI. |
| 5 | `HIGHLY_CONFIDENTIAL` | Sangat Rahasia | Highly Confidential | Highly Restricted (dok 20), Highly Confidential (Tech Arch) | "Persetujuan Ketua/Sekjend" (index.html) ditafsirkan sebagai **AccessGrant per objek** yang disetujui `KETUA_KPI` atau `SEKJEND` (penyetuju ≠ pemohon), ditambah AAL2 dan PIN **per buka**; audit prioritas tinggi (ADR-008). Pengecualian Q03 untuk Ketua/Sekretaris = keputusan terbuka; perilaku aman: tanpa pengecualian. Tidak dikirim ke AI. |

Aturan: klasifikasi tidak kedaluwarsa otomatis (Master Arch §K). **Menurunkan** klasifikasi wajib melalui persetujuan bertingkat + `classification_history` + audit (F05). **Menaikkan** klasifikasi langsung memicu evaluasi ulang grant dan share link (DOC §32). Pemilik tidak boleh membagikan melebihi hak dan klasifikasinya. Layar F05 di `app.js` hanya menyebut 4 label; implementasi tetap memakai 5 tingkat. Pejabat penetap klasifikasi final = BELUM DITENTUKAN (dok 20 §20).

### 3.4 Model izin: module + action + scope + kondisi

Izin baru bernilai `allow` bila semua langkah berikut lolos secara berurutan (Role Permission Matrix §19, Development Spec §20, GAC §10). Default **deny**.

```text
authenticate: JWT terverifikasi server (401 AUTH_UNAUTHENTICATED)
-> akun ACTIVE dan org.current_session_valid() (401 AUTH_SESSION_REVOKED)
-> AAL2 bila subjek masuk daftar tertutup ADR-003 (403 AUTH_MFA_REQUIRED)
-> muat assignment aktif pada periode konteks (valid_from <= now < valid_until)
-> permission (module, action) dari role, grant, atau delegasi aktif
-> scope (OWN | ASSIGNED | TEAM | SUBUNIT | DIVISION | BPH | ORGANIZATION | RESTRICTED | SYSTEM)
-> periode (periode CLOSED = read-only kecuali prosedur koreksi Q14)
-> klasifikasi (level objek <= ceiling subjek; level 4 butuh step-up berlaku; level 5 butuh AccessGrant per objek + step-up per buka) (412 AUTHZ_STEP_UP_REQUIRED)
-> kondisi tambahan (SoD, konflik kepentingan, status objek, versi objek)
-> grant khusus/sementara/darurat (masih berlaku dan belum dicabut)
-> allow | deny (kode HTTP menurut aturan 403/404 di bawah)
-> bila allow: bentuk DTO lewat field-level restriction (bagian 3.6)
-> tulis audit bila aksi termasuk daftar wajib (bagian 5.7); audit DENIED ditulis di luar transaksi bisnis
```

**Aturan 403 atau 404 (deterministik):**

1. Jawab **404 `RESOURCE_NOT_FOUND`** bila subjek **tidak punya aksi `V` pada scope objek** **dan** salah satu berlaku: klasifikasi objek ≥ `LIMITED`, atau objek milik modul CASE, FIN, atau PERF.
2. Semua penolakan lain dijawab **403 `AUTHZ_FORBIDDEN`**. Contohnya subjek bisa melihat objek tetapi tidak boleh approve, atau objek `INTERNAL` di modul TASK di luar scope.
3. Bentuk body dan waktu respons 404 karena aturan 1 sama dengan 404 untuk ID yang benar-benar tidak ada (dites).
4. Step-up yang belum ada pada subjek yang **punya** `V` dijawab 412 `AUTHZ_STEP_UP_REQUIRED`.

**Kode aksi** (dok 23 §6, kanonik) dan padanannya di Role Permission Matrix §4:

| Kode | Aksi | Action granular yang tercakup |
|---|---|---|
| `V` | View | VIEW |
| `C` | Create | CREATE |
| `E` | Edit | EDIT, COMMENT, ASSIGN (sesuai modul) |
| `S` | Submit | SUBMIT |
| `R` | Review | REQUEST_REVISION, REJECT pada tahap review |
| `A` | Approve | APPROVE, REJECT pada tahap approval |
| `X` | Execute | Aksi operasional (bayar, jalankan, tandai hadir) |
| `P` | Publish | PUBLISH, UNPUBLISH |
| `D` | Delete | ARCHIVE, RESTORE (hard delete tidak diberikan ke peran bisnis) |
| `EX` | Export | EXPORT, SHARE ke luar scope |
| `AD` | Administer | ADMIN, MANAGE_ACCESS |
| `AU` | Audit | AUDIT |

**Kode permission** bersifat stabil dengan pola `<modul>.<resource>.<aksi>`, contoh `task.task.approve`, `doc.file.export`, `fin.transaction.execute`. Label UI tidak dipakai sebagai kode. Scope disimpan terpisah di grant, bukan di kode permission.

**Kondisi wajib yang tidak boleh dilonggarkan lewat konfigurasi** (dok 23 §11):

| ID kondisi | Aturan | Tes |
|---|---|---|
| SOD-01 | Pengaju, penyetuju, dan pembayar transaksi yang sama harus orang berbeda | RP-07, FIN-01 |
| SOD-02 | Bendahara tidak mengaudit transaksi yang ia proses | FIN-01 |
| SOD-03 | Pelaksana tugas tidak memeriksa bukti sendiri (Q09). Pemeriksa pengganti di tim kecil BELUM DITENTUKAN; perilaku aman: review naik ke atasan unit | T06 |
| SOD-04 | Evaluator tidak menjadi satu-satunya pemutus sanggah atas penilaiannya | PERF-01 |
| SOD-05 | Pembuat konten bukan satu-satunya penyetuju publikasi berisiko tinggi | CMS-01 |
| SOD-06 | Investigator tidak mengubah bukti sumber atau menutup kasusnya sendiri tanpa review | CASE-01 |
| SOD-07 | Admin teknis tidak mengubah audit atau menghapus bukti | D24:AUD-01, GAC:AUD-04 |
| SOD-08 | Perubahan peran/izin/konfigurasi berisiko tinggi: pembuat (maker) berbeda dari penyetuju (checker) | ADMIN-T02 |
| SOD-09 | Delegasi tidak melebihi kewenangan pemberi dan tidak dipakai untuk aksi yang dilarang policy | RP-04, PERM-04 |

### 3.5 Periode kepengurusan

1. Periode adalah entitas `org.organization_periods`, bukan teks. Periode berjalan: 2026–2027. Tanggal mulai/akhir resmi dan nomor keputusan BELUM DITENTUKAN; diisi KPI saat seed production.
2. Record bisnis yang periodik wajib punya `organization_period_id NOT NULL` dan tetap menempel ke periode asal.
3. Hanya satu periode `ACTIVE` pada satu waktu (unique partial index).
4. Periode `CLOSED` bersifat read-only. Koreksi hanya lewat berita acara resmi yang tercatat (Q14), direkam di `org.period_corrections` beserta dasar keputusan, approver, dan audit before/after.
5. Pergantian periode tidak memberi akses otomatis ke arsip periode lama (Master Arch §O, ALUR-F08).
6. Tahun buku keuangan mengikuti periode 2026/2027 (Q19). Tanggal tepatnya BELUM DITENTUKAN.

### 3.6 Field-level restriction (dok 27 §7 butir 3, dok 24 PERM-03, dok 20 §7 `Permission.field_scope`)

1. **Registry:** tabel `org.field_policies(id, module, entity, field, min_classification classification_level, allowed_permission text, mask_mode text check in ('HIDE','READ_ONLY','PARTIAL'), status, version_no)`. Diisi per modul lewat seed referensi, dan perubahan melewati maker-checker (SOD-08). Kolom `Permission.field_scope` dok 20 dipetakan ke registry ini.
2. **Aplikasi:** repository **wajib memilih kolom secara eksplisit**. `select *`, `select('*')`, dan `returning *` dilarang lint (aturan ESLint kustom + grep SQL di CI). DTO keluar dibentuk hanya oleh fungsi pusat `applyFieldMask(ctx, entity, row)` di `src/modules/org/policy/field-mask.ts`. Field yang tidak diizinkan **dihapus dari respons** (key tidak ada, bukan `null`). `PARTIAL` memakai fungsi samaran pusat (misalnya empat digit terakhir rekening, Q24). Mask yang sama berlaku untuk ekspor, hasil pencarian, payload notifikasi, dan konteks AI.
3. **Database:** kolom sensitif **dipisah ke tabel 1:1** `<schema>.<entitas>_sensitive` (PK sekaligus FK ke tabel utama) dengan policy RLS sendiri yang memeriksa `allowed_permission`. Column privilege Postgres **tidak dipakai** sebagai mekanisme utama karena semua pengguna berjalan sebagai role `authenticated` yang sama, sehingga hak kolom tidak bisa membedakan orang.
4. **Kandidat field sensitif minimum** (daftar final ditetapkan task LEAD di setiap file modul dan dikonfirmasi KPI): identitas dan kontak pelapor (FORM/CASE), catatan investigasi (CASE), nominal dan data rekening penerima (FIN), nilai serta catatan evaluasi personal (PERF), dan isi temuan audit keuangan sebelum diterbitkan (FIN). Selama daftar final belum ada, kandidat di atas **diperlakukan sensitif**.
5. **Matriks izin** (6.2) memuat dimensi `field` untuk setiap entitas yang punya baris di `org.field_policies`.
6. **Tes PERM-03 tiga lapis per field sensitif:** unit `applyFieldMask` (field hilang untuk peran tanpa izin); pgTAP `SELECT` pada `<entitas>_sensitive` menghasilkan 0 baris untuk peran tanpa `allowed_permission`; API respons JSON tidak memuat key tersebut. Bila ada UI, E2E memastikan field tidak dirender dan tidak ada di payload jaringan.

---

## 4. Kamus status terpusat dan aturan penamaan

### 4.1 Aturan kamus status

1. Dok 27 §5 mewajibkan **satu kamus status terpusat dengan mapping eksplisit**. Tabel 4.2 adalah kamus itu. Enum Postgres dibuat dari tabel ini (`create type <schema>.<entitas>_status as enum (...)`). Dilarang memakai teks bebas.
2. Tulang punggung enum diambil dari **dok 20 §16** (status minimum) dan **dok 21** (alur transisi). Status tambahan dari spesifikasi granular ditulis di kolom "Varian granular". Varian itu **belum** masuk enum sampai file modul memutuskannya lewat task LEAD, karena dok 27 §3 meminta enum dikunci sebelum coding.
3. Kode enum ditulis **UPPER_SNAKE bahasa Inggris** dan tidak diterjemahkan (dok 20 §18). Label ID/EN disimpan di tabel referensi `platform.status_labels(domain, code, label_id, label_en, is_terminal, sort_order)` (ADMIN §12).
4. Transisi hanya lewat fungsi transisi atomik (ADR-002). Setiap transisi menulis riwayat bisnis, AuditEvent bila wajib, dan outbox event dalam satu transaksi. Transisi yang tidak ada di tabel = ditolak dengan `STATE_TRANSITION_INVALID`.
5. Tiga kategori dibedakan tegas:
   - **Status tinggal** (disimpan di kolom `status`).
   - **Transisi tercatat** (aksi di tabel riwayat, tidak disimpan sebagai status).
   - **Atribut turunan** (flag/kolom yang dihitung, misalnya overdue).
6. Record `APPROVED`/`CLOSED`/`PUBLISHED`/`EFFECTIVE` tidak diedit langsung. Perubahan hanya lewat amendment, reopening, atau versi baru (dok 20 §18, dok 21 §2).

### 4.2 Kamus status per entitas

| Modul | Entitas / tabel | Enum status tinggal (urutan alur) | Transisi sah utama (dok 21) | Transisi terlarang yang wajib dites | Varian granular / catatan keputusan |
|---|---|---|---|---|---|
| ORG | `organization_periods` | `DRAFT, REVIEWED, APPROVED, ACTIVE, CLOSING, CLOSED, ARCHIVED` | DRAFT→REVIEWED→APPROVED→ACTIVE→CLOSING→CLOSED→ARCHIVED | CLOSED→ACTIVE tanpa koreksi resmi; dua periode ACTIVE | `CLOSING` berasal dari GAC §11 dan layar A08/ALUR-F08 ("Penutupan"), tidak ada di dok 21. Disertakan karena alur serah terima yang disetujui membutuhkannya. |
| ORG | `organizational_units` | `PROPOSED, REVIEWED, APPROVED, ACTIVE, SUPERSEDED` | PROPOSED→REVIEWED→APPROVED→ACTIVE→SUPERSEDED | Hapus unit yang punya histori | Unit lama diarsipkan, bukan dihapus (dok 20 §6) |
| ORG | `user_accounts` | `INVITED, ACTIVE, SUSPENDED, DEACTIVATED, ARCHIVED` | INVITED→ACTIVE; ACTIVE↔SUSPENDED; ACTIVE/SUSPENDED→DEACTIVATED→ARCHIVED | DEACTIVATED→ACTIVE tanpa verifikasi ulang (dok 21 §6 "Pemulihan akses") | Sumber enum: ADMIN §6 (dok 20 tidak memberi enum) |
| ORG | `membership_assignments`, `access_grants` (akses) | `PROPOSED, VERIFIED, APPROVED, ACTIVE, SUSPENDED, EXPIRED, REVOKED, ARCHIVED` | PROPOSED→VERIFIED→APPROVED→ACTIVE; ACTIVE→SUSPENDED→ACTIVE; ACTIVE→EXPIRED/REVOKED→ARCHIVED | EXPIRED→ACTIVE (harus assignment baru); ACTIVE tanpa decision_reference | Dok 23 §9. `Revised` pada dok 23 dicatat sebagai **transisi tercatat** (versi scope baru), bukan status tinggal. |
| ORG | `position_change_requests` | `SUBMITTED, REVIEWED, IN_ASSEMBLY, APPROVED, REJECTED, EFFECTIVE` | SUBMITTED→REVIEWED→IN_ASSEMBLY→APPROVED/REJECTED; APPROVED→EFFECTIVE | EFFECTIVE tanpa keputusan sidang | Dok 21 §5 "Sidang" → kode `IN_ASSEMBLY` |
| ORG | `acting_assignments` | `PROPOSED, APPROVED, ACTIVE, ENDED` | PROPOSED→APPROVED→ACTIVE→ENDED | ACTIVE tanpa tanggal akhir | Dok 21 §5 |
| ORG | `restructuring_requests` | `PROPOSED, CONSULTED, IN_ASSEMBLY, APPROVED, EFFECTIVE` | berurutan | EFFECTIVE tanpa IN_ASSEMBLY | Dok 21 §5 |
| ORG | `admin_designations` | `PROPOSED, IN_ASSEMBLY, APPROVED, ACTIVE, REVOKED` | PROPOSED→IN_ASSEMBLY→APPROVED→ACTIVE→REVOKED | Admin demisioner ACTIVE setelah admin baru ACTIVE | Dok 21 §5–§6, Q27 |
| ORG | `access_revocations` | `TRIGGERED, REVIEWED, REVOKED, ARCHIVED` | berurutan | — | Pencabutan karena keamanan boleh langsung REVOKED (tanpa menunggu review), lalu review sesudahnya |
| ORG | `delegations` | `PROPOSED, APPROVED, ACTIVE, EXPIRED, REVOKED` | PROPOSED→APPROVED→ACTIVE→EXPIRED/REVOKED | Delegasi dipakai setelah `valid_until` (RP-04) | Subset lifecycle akses dok 23 |
| ORG | `emergency_access_grants` | `REQUESTED, APPROVED, ACTIVE, EXPIRED, REVOKED, POST_REVIEWED` | REQUESTED→APPROVED→ACTIVE→EXPIRED/REVOKED→POST_REVIEWED | ACTIVE tanpa approver/alasan/expiry | Dok 23 §12, RP-11, PERM-08 |
| TASK | `tasks` | `DRAFT, OPEN, IN_PROGRESS, BLOCKED, COMPLETED, CLOSED, CANCELLED` | DRAFT→OPEN→IN_PROGRESS; IN_PROGRESS↔BLOCKED; IN_PROGRESS→COMPLETED (ajukan selesai + bukti); COMPLETED→CLOSED (diterima) atau COMPLETED→IN_PROGRESS (dikembalikan); DRAFT/OPEN/IN_PROGRESS→CANCELLED (alasan); CLOSED→IN_PROGRESS (reopen berwenang) | OPEN/IN_PROGRESS→CLOSED langsung; COMPLETED tanpa bukti wajib; reviewer = pelaksana (Q09); drag board melompati review | Transisi tercatat: `REVIEWED`, `RETURNED`, `REOPENED` (dok 21 §7). **Atribut turunan** `is_overdue` + `overdue_since` (dok 21 menulis Overdue sebagai status; granular TASK §2 dan ALUR-F02 memisahkan flag agar histori tidak rusak; Q05: otomatis + alasan wajib). Q04: `ready_for_submission` turunan pada induk bila semua subtugas CLOSED; tetap perlu review manusia. ERD memakai label Indonesia `BELUM_DIKERJAKAN…` → hanya label UI. |
| TASK | `task_extension_requests`, `task_reassignment_requests` | `SUBMITTED, APPROVED, REJECTED, CANCELLED` | SUBMITTED→APPROVED/REJECTED | Tenggat lama berubah sebelum APPROVED | Mengikuti "Approval" dok 20 §16 (tanpa IN_REVIEW/RETURNED kecuali modul memutuskan) |
| TASK | `task_evidence` (review_status) | `SUBMITTED, ACCEPTED, REVISION_REQUESTED, SUPERSEDED` | SUBMITTED→ACCEPTED/REVISION_REQUESTED; versi baru → SUPERSEDED | Menerima bukti versi lama setelah versi baru diunggah (ALUR-F02 "Bukti telah berubah") | Usulan lead dari ERD `review_status` |
| MEET | `meetings` | `DRAFT, SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, ARCHIVED, CANCELLED` | DRAFT→SCHEDULED→CONFIRMED→IN_PROGRESS→COMPLETED→ARCHIVED; DRAFT/SCHEDULED/CONFIRMED→CANCELLED | COMPLETED otomatis menyelesaikan tindak lanjut | `CANCELLED` dari Generic dok 20 + MEET edge case |
| MEET | `decisions` | `DRAFT, REVIEWED, APPROVED, EFFECTIVE, REJECTED, SUPERSEDED` | DRAFT→REVIEWED→APPROVED→EFFECTIVE; REVIEWED→REJECTED; EFFECTIVE→SUPERSEDED saat amendment baru EFFECTIVE | Edit teks keputusan EFFECTIVE | Amendment = record keputusan baru dengan `amends_decision_id` (dok 21 §8 "Amendment Proposed" jadi DRAFT pada record baru) |
| MEET | `assemblies` (sidang anggota) | `PROPOSED, SCHEDULED, HELD, DELIBERATED, DECIDED, RECORDED, REJECTED` | berurutan; DELIBERATED→REJECTED | DECIDED tanpa quorum (aturan quorum BELUM DITENTUKAN, Q08) | Dok 21 §8 |
| MEET | `vote_rounds` | `DRAFT, OPEN, CLOSED, RECORDED` | berurutan | Mengubah suara setelah CLOSED; suara ganda | Granular MEET §189. Q08: daftar pemilih tercatat, pilihan individu rahasia |
| MEET | `meeting_minutes` | `DRAFT, IN_REVIEW, FINAL, SUPERSEDED` | DRAFT→IN_REVIEW→FINAL; FINAL→SUPERSEDED saat revisi baru FINAL | Edit FINAL | **Usulan lead** (dok 20/21 tidak memberi enum notulen; M04 "final dikunci, versi baru") |
| DOC | `documents` | `DRAFT, IN_REVIEW, APPROVED, PUBLISHED, SUPERSEDED, ARCHIVED` | DRAFT→IN_REVIEW→APPROVED→ARCHIVED; APPROVED→PUBLISHED (hanya lewat CMS); APPROVED→SUPERSEDED | Hapus dokumen yang direferensikan bukti | Dok 20 §16, dok 21 §9 |
| DOC | `document_versions` | `DRAFT, REVIEWED, APPROVED, SUPERSEDED` | berurutan | Menimpa versi | Dok 21 §9 |
| DOC | `files` (status teknis upload) | `UPLOADED, CHECKING, AVAILABLE, QUARANTINED, REJECTED, ARCHIVED` | UPLOADED→CHECKING→AVAILABLE/QUARANTINED; UPLOADED→REJECTED (upload tidak di-complete, alasan `ABANDONED`); QUARANTINED→AVAILABLE/REJECTED (tinjauan manual teraudit); AVAILABLE→ARCHIVED | CHECKING→AVAILABLE oleh `NoopScanner` di production; UPLOADED→AVAILABLE tanpa CHECKING; signed download URL untuk status selain AVAILABLE | ADR-004 + layar F02. Granular DOC §4 memakai `Uploading, Available, Quarantined, Archived, Failed/Rejected`: `Uploading`=`UPLOADED`, `Failed`=`REJECTED` |
| DOC | `content_assets` (aset media publik) | `UPLOADED, REVIEWED, APPROVED, REJECTED, AVAILABLE, ARCHIVED` | UPLOADED→REVIEWED→APPROVED/REJECTED; APPROVED→AVAILABLE→ARCHIVED | Aset tanpa alt text/hak guna jadi AVAILABLE | Dok 21 §9 |
| KNOW | `knowledge_items` | `DRAFT, CURATED, REVIEWED, ACTIVE, RETIRED` | DRAFT→CURATED→REVIEWED→ACTIVE→RETIRED | ACTIVE tanpa sumber & validity period | Dok 21 §9 (`Published/Active`→`ACTIVE`). Granular KNOW §4: `Draft, In Review, Revision Required, Approved, Rejected, Outdated, Archived`. Pemetaan diputuskan di `modul/12-KNOW` |
| CMS | `publication_versions` (per bahasa) | `DRAFT, EDITORIAL_REVIEW, APPROVED, SCHEDULED, PUBLISHED, UNPUBLISH_REQUESTED, UNPUBLISH_APPROVED, UNPUBLISHED, ARCHIVED` | DRAFT→EDITORIAL_REVIEW→APPROVED→SCHEDULED→PUBLISHED; APPROVED→PUBLISHED; PUBLISHED→UNPUBLISH_REQUESTED→UNPUBLISH_APPROVED→UNPUBLISHED (dok 21 §9: Unpublish Requested → Approved → Unpublished); UNPUBLISH_REQUESTED→PUBLISHED (permintaan ditolak, alasan wajib); →ARCHIVED | DRAFT→PUBLISHED; publish versi yang berubah setelah approve; draf EN tampil publik (Q11); UNPUBLISH_REQUESTED→UNPUBLISHED tanpa UNPUBLISH_APPROVED; penyetuju penarikan = pemohon penarikan (SOD-05). Mekanisme penarikan darurat tanpa menunggu approval = keputusan terbuka KPI (perilaku aman: tidak ada) | Transisi tercatat: `REJECTED`, `RETURNED` (Approval generic). Status terbit per bahasa independen (C02). Dok 21 §9 |
| FORM | `form_definitions` | `DRAFT, ACTIVE, ARCHIVED` | DRAFT→ACTIVE→ARCHIVED | Mengubah versi ACTIVE (harus versi baru) | Generic dok 20 + versioning |
| FORM | `form_submissions` | `DRAFT, SUBMITTED, RECEIVED, TRIAGE, ACCEPTED, REJECTED, NEED_INFORMATION` | DRAFT→SUBMITTED→RECEIVED→TRIAGE→ACCEPTED/REJECTED/NEED_INFORMATION | Submission ganda karena retry (idempotency) | Dok 21 §10. Granular FORM_CASE §8: `Screening`=`TRIAGE`; `Referred, Duplicate, Withdrawn` = varian untuk diputuskan di `modul/11-FORM-CASE` |
| CASE | `cases` | `NEW, TRIAGE, OPEN, IN_PROGRESS, ON_HOLD, RESOLVED, REVIEWED, CLOSED` | NEW→TRIAGE→OPEN→IN_PROGRESS↔ON_HOLD→RESOLVED; RESOLVED→REVIEWED (reviewer ≠ investigator/case officer kasus itu, catatan review wajib); REVIEWED→CLOSED (approver, ringkasan + alasan wajib); REVIEWED→IN_PROGRESS (dikembalikan, alasan wajib); CLOSED→OPEN (reopen beralasan) | **RESOLVED→CLOSED langsung**; REVIEWED oleh investigator/case officer kasus itu (SOD-06); CLOSED oleh investigator yang sama tanpa baris REVIEWED dari orang lain; CLOSED tanpa ringkasan & alasan | Dok 21 §10 memuat dua baris: "Resolved → Reviewed → Closed/Reopened" dan "Penutupan kasus: Resolved → Closed (Approver)". Baris kedua dibaca sebagai ringkasan dari dua langkah pertama, sehingga `REVIEWED` wajib. | Selain itu, dok 20 memuat `RESTRICTED` dan `REOPENED` sebagai status; dok 21 menambah `Escalated`. Usulan lead: `is_restricted` dan `is_escalated` menjadi **atribut** agar status progres tidak hilang; `REOPENED` = transisi tercatat. Granular: `Assigned, In Review, Investigation, Decision Pending` = varian |
| NOTIF | `notifications` (delivery) | `QUEUED, SENT, DELIVERED, FAILED, RETRYING, FAILED_PERMANENTLY, CANCELLED` | QUEUED→SENT→DELIVERED; SENT→FAILED→RETRYING→SENT; RETRYING→FAILED_PERMANENTLY | Retry menggandakan notifikasi (idempotency) | Dok 21 §11. Status baca = kolom `read_at`/`acknowledged_at`, bukan status delivery. Granular NOTIF §8: `Created, Processing, Bounced, Read, Acknowledged, Archived` = varian |
| NOTIF | `official_communications` | `DRAFT, REVIEWED, APPROVED, SENT, LOGGED` | berurutan | SENT tanpa APPROVED | Dok 21 §11 |
| NOTIF | `reminders` / `escalations` | `SCHEDULED, TRIGGERED, SENT` / `ESCALATED, ACKNOWLEDGED, RESOLVED` | berurutan | Reminder mengubah status record sumber | Dok 21 §11 |
| FIN | `budgets` | `DRAFT, SUBMITTED, REVIEWED, APPROVED, ACTIVE, CLOSED` | DRAFT→SUBMITTED→REVIEWED→APPROVED→ACTIVE→CLOSED | ACTIVE tanpa APPROVED | Dok 21 §12. Granular FIN §8: `Revised, Rejected, Cancelled` (revisi = versi baru) |
| FIN | `financial_transactions` | `DRAFT, SUBMITTED, REVIEWED, APPROVED, PAID, RECONCILED, CLOSED, REJECTED` | berurutan sampai CLOSED; SUBMITTED/REVIEWED→REJECTED; SUBMITTED/REVIEWED→DRAFT (returned, alasan wajib) | Lompatan status apa pun (FIN-02, dok 24 §8 contoh High: langsung PAID); PAID tanpa bukti; pelanggaran SOD-01; **fungsi audit mengubah baris transaksi** (termasuk kolom status) | Dok 20 §12 + dok 21 §12. "Closed → Audited" dok 21 §12 **tidak** disimpan sebagai status transaksi, karena baris yang sama di dok 21 menegaskan "Audit tidak mengubah transaksi sumber". Status audit dicatat di tabel relasi `fin.transaction_audit_links(financial_audit_id, financial_transaction_id, result, audited_at, audited_by)` dan dibaca lewat view `fin.v_transaction_audit_status` (atribut turunan `is_audited`). Granular FIN §10 menambah `Scheduled` = varian |
| FIN | `financial_audits` | `PLANNED, IN_PROGRESS, FINDINGS_ISSUED, MANAGEMENT_RESPONSE, CORRECTIVE_ACTION, VERIFIED, CLOSED` | berurutan | Audit mengubah transaksi sumber | Dok 20 §12 |
| FIN | `audit_findings` | `ISSUED, MANAGEMENT_RESPONSE, CORRECTIVE_ACTION, VERIFIED, CLOSED` | berurutan | CLOSED tanpa VERIFIED | Dok 21 §12 |
| FIN | `financial_periods` | `OPEN, RECONCILIATION, REVIEW, CLOSED` | berurutan; CLOSED→OPEN hanya dengan persetujuan pimpinan + alasan + audit (Q25) | Transaksi baru di periode CLOSED | Dok 21 §12 |
| PERF | `performance_cycles` | `DRAFT, PLANNED, ACTIVE, EVALUATION, CALIBRATION, APPROVED, CLOSED` | berurutan; CLOSED→ACTIVE (reopen berwenang) | Ubah definisi indikator setelah ACTIVE (E04) | Dok 20 memuat `REOPENED` = transisi tercatat |
| PERF | `performance_targets` | `DRAFT, SUBMITTED, REVIEWED, APPROVED, ACTIVE, COMPLETED, EVALUATED` | berurutan | ACTIVE tanpa owner/sumber data | Granular PERF §8: `Returned, Rejected, Revised, At Risk, Suspended, Escalated` = varian |
| PERF | `measurements` | `DRAFT, SUBMITTED, VALIDATED, ACCEPTED, RETURNED` | DRAFT→SUBMITTED→VALIDATED→ACCEPTED/RETURNED | Data kosong dihitung nol (Q13) | Dok 21 §13 |
| PERF | `evaluations` | `ASSIGNED, IN_PROGRESS, SUBMITTED, REVIEWED, APPROVED` | berurutan | Evaluator berkonflik kepentingan | Dok 21 §13 |
| PERF | `calibrations` / `disputes` / `pips` | `PROPOSED, REVIEWED, APPROVED, APPLIED` / `SUBMITTED, REVIEWED, DECIDED, CLOSED` / `DRAFT, APPROVED, ACTIVE, REVIEW, COMPLETED, CLOSED` | berurutan | Kalibrasi mengubah evidence; evaluator awal satu-satunya pemutus (SOD-04) | Dok 21 §13 |
| AI | `ai_requests` | `DRAFT, SUBMITTED, AUTHORIZED, PROCESSING, COMPLETED, BLOCKED` | DRAFT→SUBMITTED→AUTHORIZED→PROCESSING→COMPLETED; SUBMITTED/PROCESSING→BLOCKED | AUTHORIZED dengan sumber LIMITED ke atas (Q15) | Dok 21 §14. `Blocked→Reviewed` = transisi tercatat |
| AI | `ai_outputs` | `GENERATED, HUMAN_REVIEW, ACCEPTED, CORRECTED, REJECTED, APPLIED_AS_DRAFT, RETENTION_REVIEW, ARCHIVED` | GENERATED→HUMAN_REVIEW→ACCEPTED/CORRECTED/REJECTED; ACCEPTED/CORRECTED→APPLIED_AS_DRAFT; →RETENTION_REVIEW→ARCHIVED | Output langsung mengubah record authoritative (AI-01) | Dok 21 §14. Hapus fisik output (`Deleted`) hanya lewat job retensi. Granular AI §11: `Requested, Validated, Queued, Grounded, Needs Review, Published/Applied` = varian |
| AI | `ai_action_proposals` | `PROPOSED, CONFIRMED, EXECUTED, FAILED, STALE, CANCELLED` | PROPOSED→CONFIRMED→EXECUTED/FAILED; PROPOSED→STALE bila payload/izin berubah | EXECUTED tanpa CONFIRMED + reauthorize | **Usulan lead** dari ERD `ai_actions.status` + ALUR-F09 |
| HAND | `handover_packages` | `DRAFT, PREPARED, REVIEWED, APPROVED, ACKNOWLEDGED, CLOSED` | berurutan | CLOSED dengan item wajib belum ACKNOWLEDGED/RESOLVED | Dok 20 §16 + dok 21 §15. Granular HAND §5–6: `Submitted, Under Review, Correction Required, Partially Accepted, Rejected, Reopened, Cancelled` = varian |
| HAND | `handover_items` | `PENDING, TRANSFERRED, ACKNOWLEDGED, EXCEPTION, RESOLVED` | PENDING→TRANSFERRED→ACKNOWLEDGED; PENDING/TRANSFERRED→EXCEPTION→RESOLVED | Item hilang karena periode berganti | Dok 21 §15 |
| AUDIT | `access_reviews` | `PLANNED, IN_PROGRESS, FINDINGS, REMEDIATION, CLOSED` | berurutan | — | Dok 21 §16 |
| ADMIN | `change_requests` | `PROPOSED, REVIEWED, APPROVED, SCHEDULED, IMPLEMENTED, VERIFIED, ROLLED_BACK, CLOSED` | berurutan; IMPLEMENTED→ROLLED_BACK | IMPLEMENTED tanpa APPROVED (berisiko tinggi) | ADMIN §23 (superset dok 21 §16 "Perubahan konfigurasi") |
| ADMIN | `configuration_versions` | `DRAFT, APPROVED, PUBLISHED, SUPERSEDED, ROLLED_BACK` | DRAFT→APPROVED→PUBLISHED→SUPERSEDED; PUBLISHED→ROLLED_BACK | Edit PUBLISHED | ADMIN §25–§31 |
| AUDIT | `security_incidents` | `DETECTED, TRIAGE, CONTAINED, INVESTIGATED, REMEDIATED, CLOSED` | berurutan | CLOSED tanpa timeline & evidence | Dok 21 §16 |
| AUDIT | `data_change_requests` | `REQUESTED, AUTHORIZED, EXECUTED, VERIFIED` | berurutan | EXECUTED tanpa AUTHORIZED | Dok 21 §16 |
| PLAT | `outbox_events` | `PENDING, PROCESSING, DONE, FAILED, DEAD` | PENDING→PROCESSING→DONE/FAILED; FAILED→PENDING (retry); FAILED→DEAD | Event DONE diproses ulang tanpa idempotency | **Usulan lead** (ADR-005) |
| FORM | `tracking_tokens` | `ACTIVE, EXPIRED, REVOKED` | ACTIVE→EXPIRED/REVOKED | Pemulihan token tanpa policy (Q12 BELUM DITENTUKAN) | ERD `tracking_tokens.status` |
| RILIS | Hasil test case | `PASS, FAIL, BLOCKED, RETEST_REQUIRED, NOT_APPLICABLE` | FAIL→RETEST_REQUIRED→PASS/FAIL | Hapus hasil gagal sebelumnya | Dok 24 §2 |

### 4.3 Aturan penamaan

| Objek | Aturan | Contoh |
|---|---|---|
| Schema Postgres | Satu schema per modul, huruf kecil: `platform, org, audit, doc, pub, cms, task, notif, meet, form, cases, know, fin, perf, adm, hand, ai`. Schema `pub` hanya proyeksi publik. | `task.tasks` |
| Tabel | `snake_case`, jamak, bahasa Inggris, tanpa prefiks modul (schema sudah memberi konteks) | `task.task_evidence`, `org.membership_assignments` |
| Kolom | `snake_case`. PK `id uuid default gen_random_uuid()`. FK `<entitas_tunggal>_id`. Waktu `*_at timestamptz`, tanggal `*_date date`, flag `is_*`/`has_*`, uang `amount_minor bigint` + `currency char(3)`. | `organization_period_id`, `valid_until` |
| Kolom bilingual | Mengikuti dok 20 §6 dan §18 **di semua schema** (termasuk `org.organizational_units.name_id/name_en` dan `org.positions.title_id/title_en`): pasangan `<dasar>_id` + `<dasar>_en` bertipe `text`. Ambiguitas dengan FK dihilangkan lewat aturan yang bisa dicek katalog: (1) nama dasar bilingual diambil dari daftar tertutup `name, title, summary, body, description, label, excerpt, caption, alt_text, seo_title, seo_description, slug` (tambahan lewat PR ke tabel ini); (2) nama dasar tersebut **tidak boleh** dipakai sebagai nama entitas FK; (3) kolom berakhiran `_id` bertipe `uuid` wajib punya FK constraint; kolom berakhiran `_id` bertipe `text` wajib punya pasangan `_en` dengan nama dasar dari daftar tertutup. Tes pgTAP katalog `naming_conventions.test.sql` gagal bila ada pelanggaran. | `title_id`, `title_en`, `name_id` (bilingual, `text`); `position_id` (FK, `uuid`) |
| Metadata wajib | `id, created_at, created_by, updated_at, updated_by`. Bila relevan: `status, version_no, classification, organization_period_id, source_reference jsonb, archived_at, archived_by, archive_reason` (dok 20 §4). `lock_version integer` untuk optimistic locking. | — |
| Enum type | `<schema>.<entitas>_status`, nilai UPPER_SNAKE | `task.task_status` |
| Constraint/index | `pk_<tabel>`, `fk_<tabel>_<kolom>`, `uq_<tabel>_<kolom>`, `ck_<tabel>_<aturan>`, `ex_<tabel>_<aturan>`, `ix_<tabel>_<kolom>` | `ex_membership_assignments_no_double_office` |
| Fungsi SQL | `<schema>.<kata_kerja>_<objek>`; transisi `<schema>.transition_<entitas>` (satu-satunya pola, juga dipakai ADR-002); varian jalur job `<schema>.<nama>_system`. Tidak ada parameter actor (`p_actor_id` dilarang; actor dari `auth.uid()`). Dicek pgTAP katalog. | `task.transition_task(p_task_id, p_to_status, p_reason, p_expected_lock_version, p_idempotency_key)`, `task.mark_overdue_system()` |
| Policy RLS | `<tabel>_<aksi>_<siapa>` | `tasks_select_scope`, `audit_events_insert_system` |
| `record_code` (kode manusiawi) | `<PREFIX>-<YYYY>-<nomor 5 digit>`, unik per domain. **Tidak memakai sequence Postgres** (sequence tidak reset per tahun dan bisa berlubang saat rollback). Dibangkitkan fungsi `platform.next_record_code(p_domain text)` yang menghitung tahun di Africa/Cairo lalu menjalankan `INSERT INTO platform.record_counters(domain, year, last_no) VALUES (...,1) ON CONFLICT (domain, year) DO UPDATE SET last_no = record_counters.last_no + 1 RETURNING last_no` di dalam transaksi pembuat record. Unique `(domain, year)` pada counter dan unique `record_code` pada tabel bisnis. Tes integrasi: 50 pembuatan paralel menghasilkan 50 kode unik berurutan tanpa duplikat; pembuatan pada 31 Des 23.59 dan 1 Jan 00.01 WK Kairo menghasilkan tahun berbeda | `TSK-2026-00042`, `CASE-2026-00007`, `TRX-2026-00015`, `DEC-2026-00003` |
| ID layar/alur/tes | Mengikuti bagian 1.3 | `T06`, `ALUR-F02`, `PERM-03` |
| Event domain | `<Entitas><KataKerjaLampau>` PascalCase bahasa Inggris, sesuai katalog dok 22 §8. Nama tipe di envelope: `<modul>.<Event>.v<n>` | `task.TaskAssigned.v1`, `org.AccessRevoked.v1` |
| Kode audit action | UPPER_SNAKE `<MODUL>_<OBJEK>_<AKSI>` (pola ADMIN §25) | `ADMIN_ROLE_CHANGED`, `DOC_FILE_DOWNLOADED`, `FIN_TRANSACTION_APPROVED` |
| Kode error | UPPER_SNAKE `<DOMAIN>_<ALASAN>` | `AUTHZ_FORBIDDEN`, `STATE_TRANSITION_INVALID` |
| Permission | `<modul>.<resource>.<aksi>` huruf kecil | `cms.publication.publish` |
| Endpoint | `/api/v1/<modul>/<resource-jamak-kebab>`; aksi transisi `POST .../{id}/<aksi>` | `POST /api/v1/task/tasks/{id}/submit-completion` |
| File/folder kode | `kebab-case.ts`; komponen React `PascalCase.tsx` | `task-service.ts`, `TaskReviewPanel.tsx` |
| Migrasi | `YYYYMMDDHHMMSS_<modul>_<ringkas>.sql` | `20260915090000_org_membership_assignments.sql` |
| Key terjemahan | `<area>.<layar>.<elemen>` | `portal.t06.acceptButton` |

---

## 5. Konvensi kode produk

### 5.1 Struktur folder repository produk

Repository produk (terpisah dari repo rancangan ini), dimiliki organisasi GitHub KPI:

```text
kpi-sistem/
├─ .github/workflows/        ci.yml (lint, typecheck, unit, pgtap, e2e-smoke, gitleaks, audit, build-guard), deploy-staging.yml, nightly-e2e.yml
├─ .github/CODEOWNERS        approval LEAD manusia untuk path sensitif (ADR-009)
├─ docs/                     adr/ (salinan ADR yang disetujui), api/ (OpenAPI hasil generate), runbook/, handover/
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/            YYYYMMDDHHMMSS_<modul>_<ringkas>.sql
│  ├─ tests/                 <modul>/*.test.sql (pgTAP)
│  └─ seed/                  00_reference.sql (enum label, peran, permission), 10_test_org.sql (data TEST)
├─ src/
│  ├─ app/
│  │  ├─ (public)/[locale]/  halaman P01–P15 (locale: id | en)
│  │  ├─ (portal)/           halaman portal (Bahasa Indonesia)
│  │  └─ api/
│  │     ├─ v1/<modul>/...   Route Handler REST (adaptor tipis)
│  │     └─ internal/jobs/   endpoint worker cron (secret + allowlist)
│  ├─ modules/<modul>/
│  │  ├─ index.ts            API publik modul (satu-satunya yang boleh diimpor modul lain)
│  │  ├─ domain/             <entitas>-service.ts (use case), invariants.ts, state-machine.ts
│  │  ├─ policy/             <entitas>-policy.ts (memanggil policy engine org)
│  │  ├─ schema/             zod: input, output, event payload
│  │  ├─ repository/         akses data SQL berparameter lewat platform/db/user-db.ts, kolom eksplisit, tanpa logika bisnis
│  │  ├─ events/             definisi event + consumer
│  │  └─ ui/                 komponen khusus modul
│  ├─ platform/
│  │  ├─ db/                 user-db.ts (role authenticated + klaim JWT terverifikasi), job-db.ts (role app_job, hanya diimpor jobs/)
│  │  ├─ http/               handler wrapper: auth, correlation ID, idempotency, error mapping, security headers, CSRF/Origin, CORS, rate limit (5.17)
│  │  ├─ errors/             AppError + katalog kode
│  │  ├─ outbox/             writer (dipanggil dalam transaksi SQL), worker
│  │  ├─ jobs/               cron jobs; auth-admin/ (reset MFA, satu-satunya pemakai Admin API Auth)
│  │  ├─ i18n/               kamus id/en
│  │  ├─ time/               util Africa/Cairo
│  │  ├─ money/              util minor unit
│  │  ├─ config/             registry konfigurasi + validator BELUM DITENTUKAN
│  │  ├─ logging/            logger terstruktur + redaksi
│  │  └─ storage/            StorageGateway (satu-satunya pemakai service role key untuk signed URL), FileScanner, constants.ts
│  └─ ui/                    design system dari styles.css (token, komponen dasar, state)
├─ tests/
│  ├─ unit/  integration/  e2e/  permission-matrix/  fixtures/ (data TEST)
└─ package.json, tsconfig.json (strict), eslint (boundaries), vitest.config.ts, playwright.config.ts
```

### 5.2 Pola service / policy / repository

1. **Route Handler / Server Action** hanya: parse input dengan zod → panggil `service` → map hasil ke HTTP. Tidak berisi logika bisnis.
2. **Service** (`domain/*-service.ts`) menerima `ctx: RequestContext` (`actorId`, `sessionId`, `aal`, `periodId`, `correlationId`, `idempotencyKey?`, `locale`) dan input tervalidasi. Urutan wajib:
   1. Muat objek (dengan `lock_version`) lewat repository.
   2. `policy.assert(ctx, action, resource)`. Kalau gagal, lempar `AppError(AUTHZ_FORBIDDEN)` atau `RESOURCE_NOT_FOUND` sesuai aturan deterministik 403/404 di bagian 3.4.
   3. Validasi invariant domain (juga dijaga DB).
   4. Jalankan perubahan lewat **satu** fungsi SQL atomik (transisi) atau satu transaksi RPC yang menulis data + riwayat + audit + outbox.
   5. Kembalikan DTO berisi `id, version, status, allowedActions[]` (kontrak minimum dari `04-TAHAPAN-CAKUPAN.md`).
3. **Policy** (`policy/*-policy.ts`) murni: menerima konteks subjek (assignment, grant, delegasi, AAL, step-up) + atribut resource. Tidak menulis data. Engine pusat di `src/modules/org/policy/engine.ts`. Keputusan yang sama dipakai untuk `allowedActions` di UI.
4. **Repository** hanya membaca/menulis. Tidak memeriksa izin (izin sudah dicek service, lalu RLS mengulang).
5. Aturan izin yang **wajib** diduplikasi di RLS: validitas sesi (`org.current_session_valid()`), visibilitas baris (scope + klasifikasi + periode), **AAL2 + step-up berlaku untuk objek level 4–5** (ADR-002 butir d), dan pemisahan field sensitif ke tabel `_sensitive` (3.6). Aturan yang cukup di service + fungsi SQL: SoD, transisi, kondisi status. Fungsi transisi SQL `SECURITY DEFINER` wajib memanggil `org.authorize(auth.uid(), permission, resource)` di dalamnya. **Actor tidak pernah diterima sebagai parameter.** Aturan `search_path`, `REVOKE`, dan `GRANT` mengikuti 5.8. Karena schema internal tidak terekspos PostgREST (ADR-002), fungsi hanya dapat dipanggil lewat koneksi server.
6. Modul lain hanya dipanggil lewat `index.ts` (fungsi service) atau event. Tidak boleh ada query lintas schema ke tabel modul lain kecuali view read-only yang didokumentasikan.

### 5.3 Kontrak API

| Aspek | Aturan |
|---|---|
| Prefix | `/api/v1/...`. Breaking change → `/api/v2` + rencana migrasi (dok 22 §7) |
| Format | JSON, `camelCase` di API (DB `snake_case`, dipetakan di repository) |
| Waktu | ISO 8601 UTC dengan `Z` di API; klien menampilkan Africa/Cairo |
| Pagination | Cursor: `?limit=` (maks 100, default 25) + `?cursor=`; respons `{ data, nextCursor }` |
| Filter/sort | Hanya field di allowlist schema zod; field lain → `VALIDATION_FAILED` |
| Status HTTP | 200/201 sukses; 400 validasi; 401 belum login/sesi dicabut; 403 dilarang; 404 tidak ada **atau** disembunyikan menurut aturan deterministik 403/404 di bagian 3.4; 409 konflik versi/transisi/idempotency; 412 step-up diperlukan; 422 invariant domain; 429 rate limit (5.17); 500 tak terduga |
| Konkurensi | Aksi ubah wajib mengirim `expectedVersion` (`lock_version`). Tidak cocok → 409 `CONFLICT_VERSION` |
| Dokumentasi | OpenAPI dibangkitkan dari zod (`zod-to-openapi`) ke `docs/api/openapi.json`, dicek CI |

### 5.4 Error model dan correlation ID

Semua error API memakai satu bentuk:

```json
{
  "error": {
    "code": "STATE_TRANSITION_INVALID",
    "message": "Status tugas tidak dapat diubah dari Terbuka ke Selesai.",
    "details": [{ "field": "toStatus", "issue": "not_allowed" }],
    "correlationId": "01J8Z6K3V2X9QH5T7M4N0B1C2D"
  }
}
```

Aturan:

1. `correlationId` = ULID. Diambil dari header `X-Correlation-Id` bila valid, atau dibangkitkan middleware. Dikembalikan di header respons dan body error. Diteruskan ke log, audit (`request_id`), outbox (`correlation_id`), dan job turunan.
2. `message` berbahasa Indonesia sederhana untuk portal, tanpa detail internal, stack trace, nama tabel, isi data rahasia, atau informasi apakah akun/objek ada. Layar menampilkan "Data belum dapat dimuat. Coba lagi. Referensi: [ID aman]" (03-ALUR, pesan state).
3. Katalog kode minimum (`src/platform/errors/codes.ts`): `AUTH_UNAUTHENTICATED`, `AUTH_SESSION_REVOKED`, `AUTH_MFA_REQUIRED`, `AUTH_RATE_LIMITED`, `AUTHZ_FORBIDDEN`, `AUTHZ_STEP_UP_REQUIRED`, `AUTHZ_SOD_VIOLATION`, `RESOURCE_NOT_FOUND`, `VALIDATION_FAILED`, `STATE_TRANSITION_INVALID`, `CONFLICT_VERSION`, `IDEMPOTENCY_KEY_REUSED`, `IDEMPOTENCY_IN_PROGRESS`, `PERIOD_CLOSED`, `CONFIG_NOT_SET`, `FILE_TOO_LARGE`, `FILE_TYPE_BLOCKED`, `FILE_NOT_AVAILABLE`, `DEPENDENCY_UNAVAILABLE`, `INTERNAL_ERROR`.
4. Kegagalan operasi sensitif tidak boleh menjadi silent success (GAC §19).

### 5.5 Idempotency key

1. Wajib untuk: semua `POST` pembuatan record, transisi status, pembayaran, pengiriman notifikasi, submit formulir publik, konfirmasi aksi AI, dan konsumsi event (dok 22 §7, ADMIN §27).
2. Klien mengirim header `Idempotency-Key` (UUID v4, dibuat saat pengguna **membuka** aksi, bukan saat klik ulang). Formulir publik menyimpan key di `sessionStorage` agar refresh setelah timeout tidak membuat kiriman kedua (ALUR-F06).
3. Tabel `platform.idempotency_keys(key uuid, actor_id uuid null, public_session_hash text null, route text, request_hash text, status IN_PROGRESS|COMPLETED|FAILED, response_code int, response_body jsonb, created_at, expires_at)`. Unique index `uq_idempotency_keys_scope` pada `(key, route, coalesce(actor_id, '00000000-0000-0000-0000-000000000000'::uuid), coalesce(public_session_hash, ''))`. Constraint: tepat satu dari `actor_id` atau `public_session_hash` terisi (`ck_idempotency_keys_owner`). `public_session_hash` = SHA-256 dari cookie sesi publik acak (`HttpOnly`, `Secure`, `SameSite=Lax`) yang dibuat saat formulir publik dibuka. Hash tidak memuat IP atau data pribadi.
4. Perilaku: key baru → proses. Key sama + hash sama + COMPLETED → kembalikan respons tersimpan (tanpa efek ganda). Key sama + hash berbeda → 409 `IDEMPOTENCY_KEY_REUSED`. Key sama + IN_PROGRESS → 409 `IDEMPOTENCY_IN_PROGRESS`.
5. Masa simpan key: konstanta teknis LEAD, bukan kebijakan organisasi. Respons tersimpan untuk data CONFIDENTIAL ke atas hanya menyimpan `id` + status, bukan isi.
6. Formulir publik anonim menambah status lookup "Status pengiriman belum dapat dipastikan. Periksa sebelum mengirim ulang." dengan key yang sama.

### 5.6 Outbox dan event envelope

Tabel `platform.outbox_events`: `id uuid, event_type text, event_version int, aggregate_type text, aggregate_id uuid, organization_period_id uuid, payload jsonb, classification classification_level, occurred_at timestamptz, actor_id uuid, actor_type text, correlation_id text, causation_id uuid, status, attempts int, next_attempt_at, last_error text`.

Envelope yang dikirim ke konsumen:

```json
{
  "eventId": "7b1e...-uuid",
  "type": "task.TaskAssigned",
  "version": 1,
  "occurredAt": "2026-10-01T08:15:00Z",
  "producer": "task",
  "aggregate": { "type": "task", "id": "uuid" },
  "periodId": "uuid",
  "actor": { "type": "USER", "id": "uuid" },
  "correlationId": "01J8Z6...",
  "causationId": "uuid-atau-null",
  "classification": "INTERNAL",
  "payload": { "taskId": "uuid", "assigneeIds": ["uuid"] }
}
```

Aturan:

1. Payload hanya berisi **ID dan field minimum**. Isi sensitif (judul kasus, isi dokumen, nominal) tidak dimasukkan; konsumen membaca ulang lewat service dengan pemeriksaan izin (NOTIF §7: detail tampil setelah cek akses di modul sumber).
2. Katalog minimum mengikuti dok 22 §8: `UserActivated, AssignmentChanged, AccessGranted, AccessRevoked, OrganizationRestructured, TaskAssigned, TaskOverdue, TaskCompleted, MeetingCompleted, DecisionApproved, DecisionEffective, DocumentApproved, DocumentArchived, FormSubmitted, FormAccepted, CaseEscalated, CaseClosed, TransactionApproved, TransactionPaid, TransactionReconciled, FinancialFindingIssued, PerformanceEvaluationSubmitted, PerformanceEvaluationApproved, AIOutputGenerated, AIOutputReviewed, HandoverApproved, HandoverAcknowledged`. Tambahan per modul didaftarkan di file modul.
3. Konsumen idempoten lewat `platform.consumed_events(consumer_name, event_id)` unique, diisi di transaksi yang sama dengan efek konsumen.
4. Urutan hanya dijamin per `aggregate_id` (worker memproses event aggregate yang sama berurutan). Konsumen tidak boleh mengandalkan urutan global.

### 5.7 Audit event wajib

Tabel `audit.audit_events`: `id, occurred_at (server), chain_date date, chain_seq bigint, actor_id, actor_type USER|SYSTEM|SERVICE, action (UPPER_SNAKE), module, entity_type, entity_id, organization_period_id, result SUCCESS|FAILURE|DENIED, before jsonb, after jsonb (sudah diredaksi), reason text, source text (UI|API|JOB|AI_CONFIRMED|MIGRATION), session_id, ip_hash, user_agent_hash, request_id (correlation), classification, prev_hash, row_hash`.

Aturan:

1. **Immutable di level aplikasi:** role aplikasi hanya punya `INSERT` lewat fungsi `audit.record_event()`; `UPDATE/DELETE/TRUNCATE` dicabut dan ditolak trigger; tes pgTAP GAC:AUD-04. `before/after` tidak boleh memuat secret, hash PIN/password, token, atau isi dokumen CONFIDENTIAL ke atas (cukup ID + field yang berubah).
2. **Audit SUCCESS** ditulis di transaksi yang sama dengan perubahan bisnis. Audit ikut rollback bila perubahan gagal, dan hal ini benar karena perubahannya memang tidak terjadi.
3. **Audit DENIED dan FAILURE ditulis di luar transaksi bisnis.** Wrapper `src/platform/http` menangkap penolakan/error, memastikan transaksi bisnis sudah di-rollback, lalu memanggil `audit.record_event()` pada **transaksi terpisah yang langsung di-commit** (koneksi pool terpisah). Penolakan yang terjadi di dalam fungsi SQL (`raise`) diteruskan sebagai kode error, lalu dicatat oleh wrapper dengan cara yang sama. Bila penulisan audit DENIED gagal, metrik "kegagalan tulis audit" naik dan alert dikirim (5.14). Tes integrasi: penolakan izin di tengah transaksi yang di-rollback tetap menghasilkan **tepat 1** baris audit DENIED.
4. **Hash rantai per partisi harian:** `chain_date` = tanggal UTC `occurred_at`. `audit.record_event()` mengambil `pg_advisory_xact_lock(hashtext('audit_chain:' || chain_date))`, membaca `row_hash` terakhir pada `chain_date` itu, lalu menulis `chain_seq = seq terakhir + 1`, `prev_hash`, dan `row_hash = sha256(prev_hash || kanonik(baris))`. Unique `(chain_date, chain_seq)`. Tes integrasi: 50 insert paralel lalu `audit.verify_chain(chain_date)` mengembalikan valid, tanpa `chain_seq` ganda atau berlubang.
5. **Kepala rantai di luar DB:** job harian `audit-chain-anchor` mengekspor `(chain_date, last_seq, last_row_hash)` hari sebelumnya ke penyimpanan kedua milik KPI (ADR-010). Runbook `docs/runbook/audit-verification.md` menjelaskan cara memverifikasi ulang rantai terhadap kepala yang diekspor.
6. **Batas kejujuran:** superuser DB secara teknis bisa menulis ulang rantai. Perubahan itu **terdeteksi**, tetapi tidak **dicegah**, lewat perbandingan dengan kepala rantai yang diekspor. Kartu `index.html` menulis catatan akses "tidak dapat diubah atau dihapus oleh siapa pun, termasuk pengembang dan admin". Rencana memenuhi janji ini untuk semua jalur aplikasi dan pengguna, sedangkan untuk superuser platform yang dipenuhi adalah deteksi. Usulan penyelarasan kalimat kartu dicatat sebagai keputusan terbuka KPI di file 03. Paket ini tidak mengubah `index.html`.
7. **Legal hold** (dok 20 §18, dok 27 §8, Q26 "yang sedang diaudit tidak boleh dihapus"): tabel `platform.legal_holds(id, module, entity_type, entity_id null, scope_filter jsonb null, reason, decision_reference, placed_by, placed_at, released_by, released_at)`. Job retensi, job arsip, dan job retensi backup wajib memanggil `platform.is_under_legal_hold(entity_type, entity_id)` dan melewati record yang hold. Membuat dan melepas hold wajib diaudit. Record yang terkait `financial_audits` atau `security_incidents` yang belum `CLOSED` otomatis dianggap hold. Tes: job retensi dengan nilai TEST tidak menyentuh record berstatus hold.
8. **Retensi audit log** (dok 23 §17): key `audit.retention` (BELUM DITENTUKAN). Perilaku aman: tidak ada penghapusan audit.

Daftar aksi yang **wajib** diaudit (gabungan dok 20 §18, dok 23 §15, GAC §16, Role Permission Matrix §17, ADMIN §25, Tech Arch §16):

| Kelompok | Aksi |
|---|---|
| Autentikasi & sesi | Login sukses/gagal, MFA enrol/verifikasi/reset, reset password, revoke sesi, logout semua perangkat, akun diblokir/dibuka, privileged login |
| Step-up PIN | Enrol PIN, verifikasi gagal, lockout, permintaan reset, persetujuan reset, perubahan baris kredensial |
| Akses & organisasi | Role assigned/changed/revoked/expired, permission granted/changed, scope changed, **permission denied pada resource sensitif**, delegasi dibuat/berakhir, acting mulai/berakhir, grant sementara/khusus, break-glass diaktifkan/berakhir/post-review, perubahan periode/unit/jabatan/assignment, admin demisioner, pembuatan akun, eksternal dicatat |
| Klasifikasi & data sensitif | Perubahan klasifikasi; view/download/export/share/delete record sensitif (LIMITED ke atas); pembuatan/pencabutan share link |
| Workflow | Approve, reject, return/request revision, publish, unpublish, close, reopen, override, calibration, pembayaran, rekonsiliasi, penutupan kasus, perubahan kritis tugas (tenggat, assignee, prioritas, status, pembatalan, archive, restore) |
| Admin & konfigurasi | Draft/approve/publish/rollback konfigurasi, workflow/policy/retensi/integrasi/AI policy/backup berubah, migrasi mulai/selesai, ekspor admin, eksekusi retensi |
| AI | Permintaan AI (tujuan, klasifikasi sumber), output dihasilkan, review manusia, konfirmasi dan eksekusi aksi, blokir policy |
| Pengembang & layanan | Akses pengembang/service account ke staging/production, query sensitif, perubahan konfigurasi, pemakaian service role oleh job |
| Audit itu sendiri | Ekspor audit (AUDIT + EXPORT), akses penampil audit |

### 5.8 Migrasi database

1. Satu migrasi = satu perubahan logis. Tidak boleh mengedit migrasi yang sudah masuk `main`; koreksi = migrasi baru.
2. Setiap migrasi yang membuat tabel wajib memuat: tabel + constraint + index + `ENABLE ROW LEVEL SECURITY` + policy + grant minimum + trigger `updated_at`/audit bila perlu + komentar `COMMENT ON TABLE` (modul pemilik, klasifikasi default).
3. Setiap migrasi disertai file pgTAP di `supabase/tests/<modul>/`.
4. Perubahan destruktif (drop kolom, ubah tipe) memakai pola expand → migrate → contract di dua rilis, dengan backup sebelum dijalankan di staging/production dan catatan rollback di `docs/runbook/migrations.md` (dok 25 §6).
5. CI menjalankan `supabase db reset` (semua migrasi dari nol) + `supabase test db` + cek tipe TS terbangkit tidak berbeda.
6. Production: migrasi hanya lewat pipeline rilis bertag, setelah rehearsal di staging, disetujui KPI.
7. **Aturan fungsi** (ADR-002): setiap migrasi yang membuat atau mengganti fungsi memuat, dalam file yang sama, `REVOKE ALL ON FUNCTION <schema>.<fungsi>(<argumen>) FROM PUBLIC, anon, authenticated;` diikuti `GRANT EXECUTE` minimum (`authenticated` untuk fungsi yang dipanggil `user-db.ts`, `app_job` untuk `*_system`). Setiap fungsi `SECURITY DEFINER` wajib `SET search_path = ''` dan hanya memakai nama objek fully-qualified (`pg_catalog.now()`, `org.access_grants`). Migrasi pembuatan schema memuat `ALTER DEFAULT PRIVILEGES IN SCHEMA <s> REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC, anon, authenticated;`.
8. **Tes pgTAP katalog wajib di CI** (`supabase/tests/platform/catalog.test.sql`): gagal bila (a) ada fungsi `pg_proc.prosecdef = true` di schema aplikasi yang `proconfig`-nya tidak memuat `search_path=`; (b) ada fungsi di schema aplikasi yang bisa dieksekusi `anon` atau `PUBLIC` (`has_function_privilege`), kecuali daftar tertutup fungsi baca `pub`; (c) ada fungsi di schema aplikasi dengan argumen bernama `p_actor_id`/`actor_id`; (d) ada tabel di schema aplikasi tanpa RLS; (e) ada policy `storage.objects` untuk `anon`/`authenticated` pada bucket `internal`; (f) ada `*_system` yang bisa dieksekusi `authenticated`; (g) pelanggaran konvensi nama kolom bilingual (4.3).
9. **Tes pgTAP negatif actor:** memanggil fungsi transisi sebagai pengguna TEST A dengan klaim JWT A, dengan objek yang hanya boleh diubah pengguna TEST B, harus ditolak. Tidak ada cara mengirim identitas B lewat parameter.

### 5.9 Seed data TEST

1. `00_reference.sql`: data referensi tanpa data pribadi, boleh dipakai di semua lingkungan: label status, 13 peran, katalog permission, 5 klasifikasi, tipe unit, struktur unit (KPI, BPH, 3 divisi, subbidang M&P) **tanpa nama orang**.
2. `10_test_org.sql`: **hanya lokal/staging**. Semua orang fiktif dengan pola nama `TEST <Peran> <n>` (misalnya `TEST Bendahara 1`), email `<peran>.<n>@test.invalid`, telepon kosong, konten diawali `[TEST]`. Minimal satu akun per 13 peran + auditor fungsional + akun nonaktif + akun dengan assignment kedaluwarsa + anggota eksternal (tanpa akun) untuk matriks izin.
3. Kata sandi uji dibangkitkan saat seed dari variabel lingkungan CI, tidak ditulis di repo. PIN uji juga dari variabel lingkungan.
4. Pipeline production **menolak** seed `10_*` (guard: `if current_setting('app.environment') = 'production' then raise`).
5. Dilarang menyalin nama, NIK, alamat, nomor rekening, atau data pribadi dari dokumen perjanjian atau sumber KPI mana pun ke seed, fixture, screenshot, atau bukti tes (PPD Pasal 5, NDA Pasal 4, dok 24 §9).
6. Jenis data per lingkungan mengikuti keputusan KPI `RILIS-E00-T03` (PPD Ps 2). Sebelum keputusan itu ada, semua lingkungan non-production hanya memakai data sintetis TEST.
7. **Pembersihan setelah pengujian** (dok 24 §9): setelah UAT dan setiap siklus uji di staging, data TEST yang dibuat penguji dihapus atau dianonimkan lewat skrip `supabase/seed/99_cleanup_test.sql` + penghapusan objek Storage berprefiks TEST. Bukti berupa hitungan baris sebelum/sesudah diserahkan (K24).

### 5.10 Zona waktu

1. Simpan instan sebagai `timestamptz` (UTC). Tenggat berbentuk tanggal disimpan `date` + makna "akhir hari Africa/Cairo" dikonversi oleh `platform.cairo_end_of_day(date)`.
2. Gunakan database IANA `Africa/Cairo` (Postgres `AT TIME ZONE 'Africa/Cairo'`, JS `Intl.DateTimeFormat` dengan `timeZone: 'Africa/Cairo'`). **Dilarang** offset tetap `+02:00`/`+03:00` karena Mesir memakai DST.
3. Job overdue dan kedaluwarsa membandingkan instan UTC; tes wajib mencakup tanggal pergantian DST Mesir (tanggal diambil dari tzdata saat tes dibuat, bukan ditulis tangan).
4. UI selalu menulis label zona: "18.30 WK Kairo" atau format yang disetujui; tampilan dua zona BELUM DITENTUKAN (Q18).
5. Kode tahunan (`record_code`) dan periode dihitung di Africa/Cairo.

### 5.11 Uang

1. Nominal `bigint` minor unit + `currency char(3)`. Tidak ada `float`, `real`, `double precision`, atau `numeric` tanpa skala untuk nominal. Di TypeScript memakai `bigint` atau library desimal; tidak memakai `number` untuk hitungan uang.
2. Mata uang dasar pembukuan BELUM DITENTUKAN (Q20). Transaksi mata uang lain menyimpan `original_amount_minor`, `original_currency`, `fx_rate numeric(20,10)`, `fx_rate_source`, `fx_rate_at`, `base_amount_minor`.
3. Satu fungsi pembulatan konversi (`money.convert`) dengan mode half-even (usulan, perlu konfirmasi Bendahara). Tes wajib kasus .5.
4. Nomor rekening: tampilan tersamar (Q24); cara simpan (penuh terenkripsi atau sebagian) BELUM DITENTUKAN → perilaku aman: simpan hanya sebagian yang dibutuhkan tampilan sampai KPI memutuskan.

### 5.12 Konfigurasi BELUM DITENTUKAN dan perilaku aman

1. Semua nilai kebijakan KPI disimpan di registry konfigurasi berversi (`adm.configuration_versions`, ADMIN §10), bukan hard-code. Setiap key punya `status_value`: `SET` atau `NOT_SET` (BELUM DITENTUKAN), `owner` (KPI), `task_kpi_id` (rujukan ke file 03), dan `safe_behavior`.
2. Validator `src/platform/config/validator.ts` dijalankan **saat start aplikasi dan di endpoint healthcheck** `/api/internal/health/config` terhadap registry di DB lingkungan itu. Build tidak bisa membaca registry DB production maupun setelan proyek Supabase, jadi validator tidak dijalankan saat build. Di **production**, key kategori *keamanan wajib go-live* yang `NOT_SET` membuat healthcheck gagal. Pipeline rilis menahan promosi deploy (tidak mengalihkan traffic) sampai healthcheck lulus. Di local/staging, nilai TEST boleh dipakai dengan label `TEST_ONLY`.
3. **Setelan di luar DB** yang tidak bisa dibaca validator (masa berlaku JWT, setelan rate limit Supabase Auth, masa berlaku OTP/reset, exposed schemas Data API, status GraphQL, paket dan backup proyek, anggota organisasi) diverifikasi lewat **checklist manual** `docs/runbook/go-live-platform-checklist.md`. Checklist diisi owner KPI dengan tangkapan layar teredaksi, dan menjadi gerbang go-live (`RILIS-E90-T02`, terpisah dari verifikasi anggota platform `RILIS-E90-T01` di ADR-007).
4. Perilaku aman standar bila `NOT_SET`:

| Kategori | Contoh key | Perilaku aman bila kosong |
|---|---|---|
| Keamanan sesi & login | `auth.session_inactivity_timeout`, `auth.session_max_lifetime`, `auth.session_recheck_interval`, `auth.jwt_expiry` (setelan dashboard, checklist manual), `auth.lockout_threshold`, `auth.password_policy` | Production tidak boleh go-live (gerbang rilis). Staging memakai nilai TEST. |
| Step-up PIN | `security.stepup_validity`, `security.pin_min_length`, `security.pin_format`, `security.pin_max_attempts` | Step-up hanya untuk satu aksi; buka CONFIDENTIAL/HIGHLY_CONFIDENTIAL di production nonaktif |
| Rate limit | `security.rate_limits.login`, `.password_reset`, `.mfa`, `.pin`, `.public_form`, `.tracking_lookup`, `.sensitive_endpoint` (5.17) | Production tidak boleh go-live (keamanan wajib go-live). Staging memakai nilai TEST |
| Rotasi secret | `security.secret_rotation_interval` | Rotasi wajib di setiap rilis production dan setelah setiap akses production pengembang |
| Backup | `backup.schedule`, `backup.retention`, `backup.rpo`, `backup.rto`, `backup.secondary_target` (ADR-010) | Production tidak boleh go-live (gerbang rilis) |
| Audit & legal hold | `audit.retention` (dok 23 §17) | Tidak ada penghapusan audit; legal hold tetap berlaku |
| Langganan platform | `platform.subscription_plan`, `platform.cost_owner_after_handover` (`RILIS-E00-T04`) | ADR-005/007/010 belum disetujui; production tidak dibuat |
| Ambang & nominal keuangan | `fin.approval_thresholds` (Q21), `fin.dual_approval_threshold` (Q22) | Semua transaksi diperlakukan melewati ambang: wajib dua penyetuju berbeda + jalur persetujuan tertinggi |
| Mata uang & tahun buku | `fin.base_currency` (Q20), `fin.fiscal_year_dates` (Q19) | Pembuatan transaksi dan pembukaan periode keuangan nonaktif (`CONFIG_NOT_SET`), tampil pesan "Pengaturan keuangan belum ditetapkan KPI" |
| Uang muka | `fin.advance_settlement_days` (Q23) | Uang muka baru tidak bisa diajukan selama pengaju masih punya uang muka terbuka |
| SLA | `case.response_sla` (Q12), `workflow.review_sla` | Tidak menampilkan janji waktu; eskalasi berbasis SLA nonaktif; overdue berbasis tenggat eksplisit tetap jalan |
| Retensi | `records.retention_by_type` (Q26) | Tidak ada penghapusan/arsip otomatis; job retensi hanya melaporkan; record berstatus legal hold selalu dilewati (5.7) |
| Rumus kinerja | `perf.score_formula` (Q13) | Tidak menghitung skor; tampilkan metrik mentah dengan label "Rumus belum ditetapkan"; data kosong bukan nol |
| Allowlist file | `doc.allowed_file_types` (Q10) | Blocklist executable ADR-004 tetap berlaku. **Daftar aman tertutup** (MIME + ekstensi + magic bytes harus cocok ketiganya): `application/pdf` `.pdf` (`%PDF-`); `.docx` / `.xlsx` / `.pptx` (MIME OOXML resmi, magic bytes ZIP `PK\x03\x04`, berisi `[Content_Types].xml`, **tanpa** `vbaProject.bin`); `image/png` `.png`; `image/jpeg` `.jpg`/`.jpeg`; `image/webp` `.webp`; `text/plain` `.txt` (UTF-8 valid, tanpa byte NUL). **Ditolak eksplisit** dengan `FILE_TYPE_BLOCKED`: SVG, HTML/XHTML, format ber-makro (`.docm`, `.xlsm`, `.pptm`, `.dotm`), format Office lama (`.doc`, `.xls`, `.ppt`), arsip (`.zip`, `.rar`, `.7z`, `.tar`, `.gz`), serta file yang tidak cocok antara ekstensi, MIME, dan magic bytes. Unduhan selalu `Content-Disposition: attachment` + `X-Content-Type-Options: nosniff` (ADR-004). Tes: satu kasus tolak per tipe di atas |
| Penyedia eksternal | `email.provider`, `ai.provider`, `scanner.vendor`, `hosting.region` | Fitur yang butuh penyedia nonaktif di production; tidak mengirim data ke pihak ketiga |
| Tampilan | `ui.dual_timezone` (Q18), `cms.en_fallback_copy` (Q11) | Satu zona Kairo; pemberitahuan "Versi bahasa Inggris belum tersedia" tanpa draf |

### 5.13 i18n dan salinan

1. Publik: `id` (default) dan `en`, rute `/(public)/[locale]/...`, `hreflang`, sitemap per bahasa. Portal: hanya Bahasa Indonesia.
2. Kamus di `src/platform/i18n/{id,en}.json`. Tidak ada teks UI tertanam di komponen. CI menolak key yang hilang di `id`.
3. Konten publik bilingual memakai versi per bahasa. EN kosong → pemberitahuan, tidak menampilkan draf atau fallback diam-diam (Q11).
4. Kode, enum, dan identifier tidak diterjemahkan; label diambil dari `platform.status_labels`.
5. Salinan: Bahasa Indonesia sederhana, tanpa klaim palsu (tidak ada "100% aman", "terenkripsi end-to-end" bila tidak benar), tanpa atribusi alat pembuat, tanpa menyebut "Apple HIG". Pesan state memakai daftar di `03-ALUR-WIREFRAME.md`.

### 5.14 Logging dan observabilitas

1. Logger JSON terstruktur: `ts, level, correlationId, actorId (hash bila publik), module, action, entityType, entityId, result, durationMs, errorCode`.
2. Redaksi otomatis key sensitif (`password, pin, pin_hmac, pepper, token, secret, authorization, cookie, otp, mfa, iban, account_number, nik`) + tes unit redaksi. Jalur step-up PIN tidak menulis log apa pun selain hasil (`result`, `errorCode`). Tes: log aplikasi dan log Postgres lingkungan tes tidak memuat string PIN TEST (ADR-008 Konsekuensi 4).
3. Tidak mencatat isi dokumen, isi kasus, payload formulir publik, atau prompt AI yang memuat data internal ke application log. Isi AI yang boleh disimpan ada di tabel AI dengan retensi.
4. Application log ≠ audit log ≠ security event (Tech Arch §16). Log tidak dipakai sebagai pengganti audit.
5. Metrik minimum: error rate per endpoint, latensi p95, antrean outbox (PENDING/DEAD), kegagalan job, lonjakan permission denied, kegagalan tulis audit, status backup (ADMIN §35). Penyedia monitoring = keputusan terbuka (subprosesor).
6. Retensi log BELUM DITENTUKAN (dok 22 §14).

### 5.15 Konkurensi

1. Optimistic locking `lock_version` pada entitas yang bisa diubah bersamaan (tugas, bukti, notulen, konten, konfigurasi, transaksi).
2. Fungsi transisi memakai `SELECT ... FOR UPDATE` pada baris aggregate + cek `lock_version`.
3. Keputusan review/approval terikat pada `version_id` yang ditinjau; bila versi berubah → 409 dan pesan "Versi yang Anda tinjau telah berubah. Buka versi terbaru."
4. Voting: unique `(vote_round_id, voter_id)`; snapshot hak pilih saat round `OPEN`.

### 5.16 Kontrak state UI

Setiap layar yang memuat data wajib menangani: loading, empty, error (dengan referensi aman), validation, restricted ("Item tidak tersedia atau Anda tidak memiliki akses."), conflict, offline/koneksi putus, expired grant, stale approval, dan pending upload (dok 25 §10, 03-ALUR). Tombol aksi hanya ditampilkan dari `allowedActions` server, tetapi server tetap memeriksa ulang. Tidak ada aksi publish/approve/delete/export yang disamarkan sebagai "Simpan".

### 5.17 Keamanan HTTP (Technical Architecture §10, §18)

1. **Header wajib** di semua respons (dipasang di `src/middleware.ts` + `next.config` headers): `Content-Security-Policy` dengan `script-src 'self' 'nonce-<per request>'` **tanpa `unsafe-inline`/`unsafe-eval` untuk script**, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `form-action 'self'`, dan `connect-src` hanya ke origin aplikasi + endpoint Supabase Auth/Storage lingkungan itu; `Strict-Transport-Security: max-age=31536000; includeSubDomains` (production); `X-Content-Type-Options: nosniff`; `Referrer-Policy: strict-origin-when-cross-origin`; `Permissions-Policy` yang menonaktifkan kamera, mikrofon, dan geolokasi. Nilai CSP untuk style ditetapkan task PLAT dan dicatat di file modul.
2. **CSRF:** semua mutasi berbasis cookie (Route Handler `POST/PUT/PATCH/DELETE` dan Server Actions) wajib lolos cek header `Origin` (atau `Referer` bila `Origin` kosong) terhadap allowlist origin lingkungan itu. Gagal → 403 `AUTHZ_FORBIDDEN` + audit DENIED. Cookie sesi `HttpOnly`, `Secure`, `SameSite=Lax`.
3. **CORS:** `/api/v1/**` menolak origin lain (tanpa header `Access-Control-Allow-Origin`) kecuali allowlist eksplisit di konfigurasi, yang kosong secara default. `/api/internal/**` tidak pernah mengirim header CORS.
4. **Rate limit tanpa Redis:** tabel `platform.rate_limit_buckets(bucket_key text, window_start timestamptz, count int, primary key (bucket_key, window_start))`. `bucket_key` = `<kategori>:<sha256(ip)>` atau `<kategori>:<sha256(account_id)>`, dan IP mentah tidak disimpan. Update atomik `INSERT ... ON CONFLICT DO UPDATE SET count = count + 1 RETURNING count` lewat fungsi `platform.hit_rate_limit_system()`. Job membersihkan jendela lama. Kategori wajib: login, reset password, MFA, PIN step-up, formulir publik, lookup kode pelacakan aduan (P12/P13), dan endpoint sensitif (ekspor, share link, unduh level 4–5). Ambang = `security.rate_limits.*` (`NOT_SET`, dengan nilai TEST di staging). Melebihi ambang → 429 `AUTH_RATE_LIMITED` + header `Retry-After`. Lookup kode pelacakan memberi respons seragam untuk kode salah dan kode tidak ada.
5. **Email ke penyedia email (subprosesor):** isi email hanya berupa judul generik + tautan ke portal (misalnya "Ada tugas baru untuk Anda. Buka portal KPI."). Tidak ada judul kasus, isi dokumen, nominal, nama pelapor, atau isi apa pun di atas `INTERNAL`. Template email dites agar tidak memuat placeholder field berklasifikasi `LIMITED` ke atas.
6. **Tes wajib:** tes integrasi header (setiap header di butir 1 ada pada halaman publik, portal, dan API); mutasi dengan `Origin` asing → 403; preflight CORS dari origin asing tidak mendapat izin; melebihi ambang TEST per kategori → 429 + `Retry-After`; 50 request paralel ke bucket yang sama menghasilkan hitungan tepat 50; snapshot template email tidak memuat field terlarang.

---

## 6. Standar tes, bukti, DoR, DoD, severity

### 6.1 Piramida tes

| Level | Alat | Wajib untuk | Lingkungan |
|---|---|---|---|
| Unit | Vitest | Invariant domain, state machine TS, policy engine (tabel keputusan), util waktu/uang/redaksi, schema zod | CI, tanpa DB |
| Integrasi service | Vitest + Supabase lokal | Service + repository + fungsi SQL + outbox + audit; idempotency; konflik versi | CI (`supabase start`) |
| Database | pgTAP (`supabase test db`) | Setiap tabel: RLS allow/deny per peran; constraint & exclusion; fungsi transisi (sah dan terlarang); trigger audit immutable; tidak ada tabel tanpa RLS; tes katalog 5.8 butir 8; tes negatif actor 5.8 butir 9; RLS level 4–5 menolak AAL1 dan tanpa step-up; `org.current_session_valid()` menolak sesi dicabut | CI |
| API izin negatif | Vitest (HTTP ke Route Handler) | Setiap endpoint terlindungi: 401 tanpa sesi, 401 sesi dicabut (token lama belum kedaluwarsa), 403 AAL1, 403 peran salah, 403/404 scope salah menurut aturan 3.4, manipulasi ID/parameter (SEC-01), 412 tanpa step-up, 403 `Origin` asing, 429 melewati ambang TEST | CI |
| Bypass service (SEC-01 varian) | Vitest (HTTP langsung ke Supabase lokal/staging) | Dengan JWT TEST + anon key: PostgREST `/rest/v1/*` dengan `Accept-Profile` setiap schema internal, `/rest/v1/rpc/*` fungsi internal, `/graphql/v1`, dan Storage API `object/internal/*` (baca, tulis, daftar) → semuanya ditolak tanpa data; setelah "logout semua perangkat" tetap ditolak | CI + staging |
| Keamanan HTTP | Vitest + Playwright | Header 5.17 ada; CSRF, CORS, rate limit; unduhan `attachment` + `nosniff` | CI |
| Matriks izin | Generator tes dari `tests/permission-matrix/matrix.yaml` | 13 peran + auditor fungsional + anonim × aksi × scope (bagian 6.2) | CI |
| Kontrak & event | Vitest | Skema OpenAPI terbangkit sinkron; event dikirim dua kali tidak menggandakan (INT idempotency); konsumen gagal lalu retry | CI |
| E2E | Playwright | Alur ALUR-F01..F11 yang modulnya masuk fase berjalan; smoke per PR, penuh nightly dan sebelum rilis | Staging/preview dengan data TEST |
| A11y & mobile | Playwright + @axe-core/playwright | Setiap layar baru di 390×844, 768×1024, 1280×800; tema terang dan gelap; nol pelanggaran axe `serious`/`critical`; navigasi keyboard untuk aksi utama | CI/staging |
| Keamanan statis | gitleaks, `npm audit`/osv-scanner, lint boundaries | Setiap PR; temuan high/critical memblokir merge | CI |
| Keamanan dinamis & performa | Skenario manual + skrip (F4) | Privilege escalation, injeksi, sesi, upload berbahaya, kebocoran pencarian/notifikasi/AI; daftar besar, pencarian, upload | Staging |
| UAT | Skenario dok 24 §7 oleh perwakilan KPI | Sebelum Termin 2 (PKS Pasal 7, 11) | Staging |

### 6.2 Matriks izin

1. Sumber kebenaran: `tests/permission-matrix/matrix.yaml` diturunkan dari dok 23 §7 (matriks tingkat tinggi), dok 23 §8 (scope), matriks `index.html` (disetujui), Q02, Q03, Q27, dan tabel izin di setiap file modul.
2. Dimensi: `role` (13 peran, dengan peran 13 dites sebagai `DEVELOPER` dan `SERVICE_ACCOUNT`, + `AUDITOR` fungsional + `ANON`) × `permission` (`<modul>.<resource>.<aksi>`) × `scope` (OWN, ASSIGNED, TEAM, SUBUNIT, DIVISION lain/sendiri, BPH, ORGANIZATION, RESTRICTED, SYSTEM) × `field` (untuk entitas yang punya baris `org.field_policies`, 3.6) × kondisi (klasifikasi 1–5, periode ACTIVE/CLOSED, AAL1/AAL2, step-up ada/tidak, AccessGrant per objek level 5 ada/tidak, grant aktif/kedaluwarsa, sesi dicabut/tidak, SoD).
3. Setiap sel bernilai `ALLOW`, `DENY_403`, `DENY_404`, atau `ALLOW_IF(<kondisi>)`. Jenis DENY ditentukan aturan 3.4. **Sel DENY wajib dites**; tes negatif tidak boleh dilewati.
4. Generator membuat tiga lapis tes untuk sel yang sama: policy engine (unit), RLS (pgTAP dengan `set local role authenticated` + klaim JWT TEST), dan API (HTTP). Hasil tiga lapis harus sama.
5. Skenario wajib selalu ada: RP-01..RP-12, PERM-01..PERM-08, SEC-01 (termasuk varian bypass service), CORE-02 (akses lama hilang setelah pergantian), PERM-03 per field sensitif (3.6), PERM-07 tiga lapis (ADR-003), kebocoran pencarian (judul/cuplikan/jumlah), kebocoran notifikasi, kebocoran AI retrieval (INT-06).
6. Sel yang wajib ada sejak revisi 0.3: `WAKIL_KEPALA_DIVISI × task.task.approve × DIVISION(sendiri) = ALLOW`; `WAKIL_KEPALA_DIVISI × task.task.approve × DIVISION(lain) = DENY_403`; `WAKIL_KEPALA_DIVISI × perf.evaluation.approve × DIVISION = ALLOW_IF(acting/delegasi aktif)`; `KETUA_KPI × doc.document.view × BPH = ALLOW`; `SEKRETARIS × doc.document.view × HIGHLY_CONFIDENTIAL tanpa AccessGrant = DENY_403`; `KETUA_KPI × org.access_grant.approve × grant level 5 yang diajukan KETUA_KPI sendiri = DENY_403`; `ANGGOTA_KPI × cases.case.view × kasus di luar assignment = DENY_404`; `ANGGOTA_KPI` AAL1 ke rute portal = DENY_403 `AUTH_MFA_REQUIRED` (perilaku aman ADR-003).
7. Matriks yang berubah wajib melalui change request (Development Spec §26) dan review LEAD.

### 6.3 Standar pgTAP

1. Satu file per tabel atau fungsi: `supabase/tests/<modul>/<objek>.test.sql`.
2. Minimum per tabel: `has_table`, kolom wajib + tipe, `policies_are`, RLS aktif, satu tes allow dan satu tes deny untuk setiap policy, constraint (duplikat ditolak, rangkap jabatan ditolak, rentang tanggal), trigger audit.
3. Minimum per fungsi transisi: semua transisi sah berhasil + menulis riwayat + audit + outbox; setiap transisi terlarang di kolom "Transisi terlarang" kamus status ditolak dengan `STATE_TRANSITION_INVALID`; `lock_version` salah ditolak; pemanggil tanpa izin ditolak.
4. Data uji dibuat di dalam transaksi tes (`begin; ... rollback;`), berlabel TEST.
5. File katalog lintas modul wajib: `supabase/tests/platform/catalog.test.sql` (5.8 butir 8), `naming_conventions.test.sql` (4.3), dan `exposure.test.sql` (schema internal tidak ada di daftar exposed schemas `supabase/config.toml` yang dibaca lewat skrip CI; `anon`/`authenticated` tidak punya hak di luar yang terdaftar).
6. Tes RLS mensimulasikan sesi lewat `set local role authenticated` + `set_config('request.jwt.claims', ...)` dengan klaim `sub`, `session_id`, `aal`, dan `iat` TEST, persis seperti `user-db.ts`.

### 6.4 Standar Playwright, ukuran layar, dan aksesibilitas

1. Proyek Playwright: `mobile` (390×844, touch), `tablet` (768×1024), `desktop` (1280×800); tema `light` dan `dark` minimal pada smoke.
2. Setiap tes E2E login memakai akun TEST dari variabel lingkungan dan TOTP TEST yang dibangkitkan dari secret TEST.
3. Axe: `await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa']).analyze()`; gagal bila ada `serious`/`critical`. Temuan `moderate` dicatat sebagai defect Low/Medium.
4. Pemeriksaan tambahan manual per layar kunci: fokus terlihat, urutan tab, target sentuh cukup besar, zoom 200% tanpa scroll horizontal pada 1280px, reduced motion dihormati, warna tidak menjadi satu-satunya pembeda (03-ALUR Wireframe 7). Klaim kepatuhan WCAG tidak boleh ditulis sebelum diuji (04-TAHAPAN).
5. Screenshot bukti hanya berisi data TEST.

### 6.5 Definition of Ready (task boleh mulai)

Gabungan dok 25 §9 + tambahan lead. Task **Ready** bila semua terpenuhi:

1. Scope task jelas dan ukuran ≤ L (12 jam). Task lebih besar sudah dipecah.
2. Peran, permission, dan scope untuk aksi task tercantum (rujukan sel matriks izin).
3. Entity, field, status, dan transisi dipetakan ke kamus status bagian 4 atau varian yang sudah diputuskan di file modul.
4. Dependensi (task lain) berstatus Done; kontrak integrasi (endpoint/event) yang dipakai sudah ada.
5. Kriteria terima Given/When/Then tersedia dan terukur.
6. Data sensitif, klasifikasi default, dan kebutuhan retensi teridentifikasi.
7. Keputusan terbuka yang memengaruhi task punya pemilik dan tenggat (dok 27 §9), **atau** task sudah menjelaskan perilaku aman bila nilainya BELUM DITENTUKAN.
8. ID layar, ID tes, dan ID Q yang relevan tercantum di "Sumber".
9. ADR yang dipakai task sudah disetujui KPI. Untuk task EKSEKUTOR: `RILIS-E00-T01`, `RILIS-E00-T03`, `RILIS-E00-T04`, dan `RILIS-E00-T05` sudah Done (bagian 2.0). Sebelum itu, hanya task LEAD yang tidak mengikat stack dan tidak memakai layanan cloud yang boleh Ready, dan itu pun hanya bila pengecualian 2.0 disetujui KPI. Tidak ada label "menunggu ADR" untuk task EKSEKUTOR (dok 27 §10).
10. Tidak memerlukan data produksi atau kredensial nyata.
11. Penyedia AI atau alat yang membaca repo atau paket rencana untuk task ini sudah **disetujui tertulis KPI** (nama penyedia, lokasi pemrosesan, opsi tanpa pelatihan data, retensi prompt) dan tercatat di register subprosesor dengan nomor task `RILIS-E00-T02`. Eksekutor tanpa persetujuan tercatat tidak boleh menerima paket (NDA Ps 2–3, PPD Ps 6).

### 6.6 Definition of Done (task selesai)

Gabungan dok 25 §10, Development Spec §25, GAC §21, dok 23 §18 + tambahan lead. Task **Done** bila semua terpenuhi:

1. Perilaku sesuai spesifikasi dan semua kriteria terima task lulus.
2. Tes izin allow **dan** deny lulus di tiga lapis (policy, RLS, API) untuk aksi yang disentuh.
3. Audit event wajib (bagian 5.7) ditulis dan diverifikasi tes.
4. Seluruh state 5.16 yang relevan ditangani (bila ada UI): loading, empty, error, validation, restricted, conflict, offline/koneksi putus, expired grant, stale approval, dan pending upload.
5. Tes unit, integrasi, pgTAP, dan E2E terkait lulus di CI; tidak ada tes yang di-skip tanpa tiket.
6. Tidak ada defect Critical/High terbuka pada task tersebut.
7. Migrasi berjalan dari nol (`supabase db reset`), tipe TS terbangkit sinkron, catatan rollback ada bila migrasi destruktif. **Migrasi dan fitur ter-deploy ke staging lewat pipeline** (bukan manual), dan smoke E2E hijau di staging (dok 25 §10: migration, backup, rollback, dan deployment diuji).
8. OpenAPI, katalog event, katalog audit, dan registry konfigurasi diperbarui bila berubah.
9. A11y axe lulus dan screenshot 390/768/1280 dilampirkan (bila ada UI).
10. Tidak ada secret di diff (gitleaks hijau); tidak ada data pribadi nyata di kode, seed, atau bukti.
11. Salinan UI sudah dicek terhadap aturan 5.13.
12. PR disetujui reviewer selain pembuat. Untuk path di `CODEOWNERS` (ADR-009: migrasi, policy, step-up, audit, `platform/{db,storage,http,jobs}`, `.github`), approval wajib datang dari **LEAD manusia**; review oleh model AI tidak dihitung. Perubahan pada modul step-up juga butuh approval perwakilan KPI (ADR-008).
13. Dokumentasi (README modul, runbook bila ada job/operasi) diperbarui.
14. **Cek otomatis `build-guard` di CI lulus:** build production tidak memuat flag bypass auth/policy (`SKIP_AUTH`, `DISABLE_RLS`, `DEBUG_*`, `NEXT_PUBLIC_*` yang berisi secret), tidak ada akun seed, kunci master, atau kredensial hard-coded (gitleaks + grep daftar pola), dan service role key tidak diimpor di luar allowlist ADR-002 (K14).
15. **Bukti diserahkan sesuai 6.8 ke folder bukti milik KPI** (lokasi ditetapkan `RILIS-E00-T05`), bukan hanya di PR (dok 25 §10: bukti pengujian diserahkan kepada KPI).

Modul dianggap **Done** bila semua task P0/P1 modul Done, tes acceptance dok 24 untuk modul itu `PASS` di staging, dan KPI menandatangani penerimaan modul (Development Spec §25 "Acceptance criteria signed off").

### 6.7 Severity defect dan aturan rilis (dok 24 §8, §10)

| Severity | Definisi | Contoh | Aturan rilis |
|---|---|---|---|
| Critical | Kebocoran data, akses tidak sah, kehilangan data, atau transaksi berbahaya | Pengguna biasa membuka kasus sensitif; PIN atau isi dokumen rahasia muncul di log; AI menerima dokumen LIMITED ke atas | **Tidak boleh go-live.** Merge ke `main` diblokir. |
| High | Fungsi inti gagal atau workflow penting dapat dilewati | Transaksi langsung PAID; tugas CLOSED tanpa review; akses tidak dicabut setelah assignment berakhir | Harus diperbaiki sebelum go-live |
| Medium | Fungsi penting terganggu tetapi ada workaround | Notifikasi terlambat tetapi record benar | Perlu rencana perbaikan dan persetujuan KPI |
| Low | Masalah minor tampilan atau kenyamanan | Label kurang konsisten | Boleh masuk backlog |

Kriteria go-live (dok 24 §10): semua test case Critical/High `PASS`; tidak ada defect Critical/High terbuka tanpa persetujuan tertulis Ketua KPI; tes izin mencakup seluruh peran aktif dan revocation; workflow utama tiap modul yang dirilis diuji di staging; backup dan restore diuji dan terdokumentasi (OPS-01, OPS-02), termasuk restore DB + objek Storage ke proyek terpisah dengan checksum cocok (ADR-010); audit trail perubahan kritis terverifikasi; dokumentasi operasional, handover, dan incident response tersedia; perwakilan KPI menyetujui UAT dan batasan yang tersisa.

Tambahan gerbang go-live dari revisi 0.3: semua key 5.12 kategori keamanan, rate limit, dan backup berstatus `SET`; checklist manual setelan platform (5.12 butir 3, `RILIS-E90-T02`) ditandatangani owner KPI; `RILIS-E90-T01` (anggota platform production = hanya akun KPI) Done; tes SEC-01 varian bypass service hijau terhadap staging dengan konfigurasi yang sama dengan production.

Tambahan lead: modul P2 yang ditunda lewat change request tidak menghalangi go-live, tetapi rute, menu, dan API-nya harus **nonaktif** (feature flag off + 404), bukan setengah jalan.

### 6.8 Bukti yang diserahkan per task

| Bukti | Bentuk |
|---|---|
| Tautan PR + commit | URL PR di repo organisasi KPI |
| Hasil CI | Tautan run GitHub Actions hijau + artifact (JUnit, laporan Playwright HTML, output pgTAP) |
| Traceability | Tabel "kriteria terima → nama tes → status" di deskripsi PR |
| Matriks izin | Daftar sel yang ditambah/diubah + hasil tes tiga lapis |
| Screenshot | 390/768/1280, terang/gelap untuk layar yang disentuh; hanya data TEST |
| Audit | Contoh baris audit dari tes integrasi (sudah diredaksi) |
| Migrasi | Nama file migrasi + catatan rollback bila destruktif |
| Catatan keputusan | Varian status/izin yang diputuskan + rujukan ADR/Q/OD |

Setiap record test case mengikuti template dok 24 §11: ID, requirement reference, modul/peran, environment, precondition, langkah, expected, actual, status, evidence, tester & tanggal, defect reference, approval. Hasil gagal sebelumnya tidak dihapus (dok 24 §1).

---

## 7. Pemetaan 4 fase PKS ke modul dan level dependensi D0–D5

### 7.1 Level dependensi (dok 22 §4–§5)

| Level | Makna | Modul dok 22 | File modul paket | Prioritas dok 22 |
|---|---|---|---|---|
| D0 Fondasi | Tidak bergantung modul bisnis | AUTH, CORE | 01-PLAT, 02-AUTH | P0 |
| D1 Governance | Identitas, struktur, akses, konfigurasi | ADMIN, AUDIT | 03-ORG, 04-AUDIT, 15-ADMIN | P0 |
| D2 Operasional dasar | Memakai fondasi & governance | TASK, MEET, DOC, FORM | 08-TASK, 10-MEET, 05-DOC, 11-FORM-CASE (bagian FORM) | P1 |
| D3 Operasional lanjutan | Memakai beberapa modul D2 | CASE, KNOW, CMS/PUB, NOTIF | 11-FORM-CASE (bagian CASE), 12-KNOW, 06-PUB, 07-CMS, 09-NOTIF | P1–P2 |
| D4 Pengukuran & akuntabilitas | Menggabungkan data operasional & governance | FIN, PERF | 13-FIN, 14-PERF | P2–P3 |
| D5 Lintas sistem | Memakai hampir seluruh modul | AI, HAND | 17-AI, 16-HAND | P3 |

Label P0–P3 di tabel ini adalah **prioritas urutan dok 22**, berbeda dari prioritas rilis paket di 7.3. Di task, kolom Prioritas selalu memakai arti paket (7.3).

### 7.2 Jadwal PKS Pasal 6 dan pemetaan modul

Durasi dihitung sejak penandatanganan PKS **dan** pembayaran Termin 1. Tanggal mulai BELUM DITENTUKAN.

| Fase PKS | Minggu | Nama resmi | Modul/bagian yang masuk | Layar | Alur | Gerbang keluar fase |
|---|---|---|---|---|---|---|
| F1 | 1 | Website Publik & CMS Bilingual | 01-PLAT (penuh), 02-AUTH (irisan: login + TOTP untuk editor/approver), 03-ORG (irisan: seed 13 peran, unit, periode, assignment manual oleh admin, policy engine, RLS dasar), 04-AUDIT (tulis immutable), 05-DOC (irisan: storage aset media publik, status file, blokir executable), 06-PUB, 07-CMS | P01–P10, P14, P15; P11 sebagai halaman informasi layanan; C01–C07; A01, A02 | ALUR-F05 | Konten TEST bisa ditulis ID/EN → review → approve → publish/jadwal → tampil publik; draf tidak bocor; audit publish ada; CI hijau; staging aktif |
| F2 | 2 | Portal MVP & Task Management | 02-AUTH (penuh: reset, sesi, logout semua, A03–A04), 03-ORG (penuh: A05–A10, lifecycle akses, auto-expire, delegasi, acting, break-glass, admin demisioner), 04-AUDIT (A11), 05-DOC (penuh: F01–F06, klasifikasi, PIN step-up), 08-TASK, 09-NOTIF (irisan: in-app W05 + worker outbox) | A03–A11, W01–W05, T01–T11, F01–F06 | ALUR-F01, F02, F03, F11 | RP-01..RP-12, PERM-01..08 hijau; tugas end-to-end dengan bukti & review; pencabutan akses otomatis terbukti |
| F3 | 3 | Operasional Lanjutan & Tata Kelola | 10-MEET, 11-FORM-CASE (aduan publik P12–P13 + S01–S04, S07–S09), 12-KNOW, 13-FIN, 14-PERF, 15-ADMIN (A12–A16), 09-NOTIF (penuh: N01–N04, S05, S06, email bila subprosesor disetujui) | M01–M07, P12–P13, S01–S09, K01–K04, B01–B09, E01–E08, A12–A16, N01–N04 | ALUR-F04, F06, F07, F10 | INT-01..05, INT-08 hijau; FIN-01/02 hijau; konfigurasi berversi; nilai BELUM DITENTUKAN berperilaku aman |
| F4 | 4 | AI Terkendali, Hardening & Handover | 17-AI, 16-HAND, 18-RILIS (uji keamanan, performa, backup/restore, UAT, perbaikan defect, dokumentasi, serah terima PHHP) | I01–I06, H01–H06 | ALUR-F08, F09 | Kriteria go-live 6.7; UAT ditandatangani; Berita Acara Serah Terima (PKS Pasal 11, PHHP Pasal 9) |
| Pemeliharaan | 30 hari kalender sejak serah terima | Bug fixing tanpa biaya (PKS Pasal 12) | Perbaikan defect; fitur baru = kesepakatan tambahan | — | — | Akses pengembang dicabut di akhir; konfirmasi penghapusan data (PPD Pasal 9, NDA Pasal 6) |

Catatan penafsiran: kata "Handover" pada F4 PKS ditafsirkan sebagai **serah terima hasil pekerjaan ke KPI** (PHHP). Modul HAND (serah terima jabatan antarperiode) juga ditempatkan di F4, tetapi berprioritas P2 karena pergantian periode baru terjadi di akhir periode 2026–2027. Pencabutan dan peralihan akses saat pergantian jabatan (ALUR-F11, H06) tetap **P0** di 03-ORG pada F2. Penafsiran ini wajib dikonfirmasi KPI.

### 7.3 Prioritas rilis paket

| Prioritas | Arti | Konsekuensi bila tidak selesai |
|---|---|---|
| **P0** | Wajib ada saat rilis (go-live). Keamanan, izin, audit, integritas data, dan fungsi yang dijanjikan PKS untuk fase itu. | Tidak boleh go-live. Jadwal fase tergeser dengan persetujuan tertulis (PKS Pasal 6). |
| **P1** | Wajib selesai di fase yang ditetapkan. | Boleh bergeser ke fase berikutnya dalam 4 minggu dengan catatan LEAD; tidak boleh keluar dari ruang lingkup tanpa change request. |
| **P2** | Boleh ditunda lewat change request tertulis (PKS Pasal 8) yang menjelaskan dampak biaya, jadwal, keamanan, dan hasil. | Fitur nonaktif (flag off + 404), tidak setengah jalan. |

### 7.4 Ketegangan antara urutan dokumen dan jadwal PKS (RISIKO BESAR)

| No | Ketegangan | Dampak | Penanganan dalam rencana |
|---|---|---|---|
| T1 | Dok 22 §10 menempatkan CMS/PUB di tahap 5 (setelah AUTH/ADMIN/AUDIT, DOC/TASK/MEET, FORM/NOTIF, CASE/KNOW). PKS menempatkan website publik & CMS di **minggu 1**. | CMS bergantung pada DOC, ADMIN, NOTIF (dok 22 §5). Tanpa fondasi, approval dan publikasi tidak bisa diaudit dan izin tidak bisa ditegakkan. | F1 membangun **irisan tipis D0/D1** lebih dulu di hari-hari awal minggu 1: repo + CI + lingkungan, auth editor dengan TOTP, 13 peran + assignment manual, policy engine + RLS dasar, audit immutable, storage aset. Tanpa irisan ini, CMS tidak boleh dikerjakan. |
| T2 | CMS bergantung pada NOTIF (dok 22 §5), padahal NOTIF baru ada di F2/F3. | Reviewer tidak diberi tahu ada antrean. | Antrean C01/C03 menjadi sumber kebenaran di F1. Event outbox `cms.*` sudah ditulis sejak F1, lalu dikonsumsi NOTIF saat modul itu hidup. Notifikasi bukan authoritative record (dok 27 §6). |
| T3 | Aduan publik (P12–P13) tampil di menu publik F1, tetapi triage dan kasus (FORM/CASE D2–D3) baru di F3. | Mengumpulkan aduan tanpa proses penanganan dan klasifikasi berisiko terhadap data pelapor. | Formulir aduan **tidak diaktifkan** di F1. P11 hanya berisi informasi saluran resmi; P12–P13 aktif di F3 bersama S03/S04. |
| T4 | Ruang lingkup 17 modul, 113 layar, 11 alur dalam 4 minggu, dengan nilai all-in Rp14,2 juta. Dokumen sumber (Master Arch §Q, Dev Spec §24) mengasumsikan 7–12 tahap. | Probabilitas tinggi fase F3/F4 tidak selesai penuh; tekanan untuk memotong tes/keamanan. | Keamanan, izin, audit, backup tidak boleh dipotong (P0). FIN, PERF, KNOW, HAND, AI dipecah ke inti P1 dan sisa P2. Daftar kandidat P2 ada di file modul dan `01-PETA-JALAN`. Status risiko ditulis jujur di `03-RISIKO`. |
| T5 | Dok 27 §10: coding belum boleh dimulai sebelum keputusan teknis dikunci. PKS menghitung minggu 1 sejak tanda tangan + Termin 1. | Minggu 1 terpakai untuk menunggu keputusan. | Persetujuan ADR-001..010, region, subprosesor, penyedia AI eksekutor, klasifikasi data per lingkungan, biaya langganan, dan pembuatan akun organisasi dijadikan task KPI hari-0 (bagian 2.0). Semua task EKSEKUTOR baru Ready setelah gerbang itu Done. Sebelumnya, hanya task LEAD yang tidak mengikat stack dan tanpa layanan cloud yang boleh berjalan, dan hanya bila pengecualian itu disetujui KPI. **Risiko:** setiap hari keterlambatan persetujuan langsung memotong minggu 1. Usulan mitigasi untuk KPI: tandatangani persetujuan hari-0 bersamaan dengan PKS, atau sepakati bahwa hitungan minggu 1 dimulai setelah gerbang 2.0 Done (butuh perubahan tertulis, PKS Ps 6/8). |
| T6 | Banyak nilai kebijakan BELUM DITENTUKAN (Q07, Q10, Q12, Q13, Q19–Q26). | Fitur FIN/PERF/AUTH tidak bisa go-live dengan nilai tebakan. | Registry konfigurasi + perilaku aman (5.12). Nilai keamanan wajib diisi KPI sebelum go-live. |
| T7 | Dok 22 §5 menaruh TASK sebelum MEET dan DOC sebelum TASK (evidence); PKS F2 memuat TASK. | Bukti tugas butuh DOC penuh. | 05-DOC penuh masuk F2 sebelum TASK-evidence (T05–T06). |
| T8 | HAND dan AI bergantung hampir semua modul (D5), sementara modul D4 di F3 berisiko belum lengkap. | AI/HAND di F4 hanya bisa memakai sumber yang sudah jadi. | AI P1 dibatasi ke I01 + I04 dengan sumber KNOW/DOC PUBLIC/INTERNAL; I02, I03, I05, I06 dan HAND sebagian besar P2. |

---

## 8. Kewajiban kontrak yang berdampak pada cara kerja

Sumber: draf PPD 001, PKS 002, NDA 003, PHHP 004 (12 Sep 2026). Draf belum ditinjau ahli hukum dan belum ditandatangani; kewajiban diperlakukan berlaku sejak kickoff. Paket ini **tidak** menyalin identitas, NIK, alamat, nomor rekening, atau data pribadi dari dokumen perjanjian.

| No | Kewajiban | Sumber | Dampak pada cara kerja (wajib) |
|---|---|---|---|
| K1 | Mengolah data hanya atas instruksi tertulis KPI dan untuk pekerjaan yang disetujui | PPD Ps 1, Ps 3; NDA Ps 3 | Setiap akses data nyata butuh instruksi tertulis KPI yang dicatat di log akses. Tidak ada eksplorasi data production "untuk debugging" tanpa izin. |
| K2 | Dilarang memakai data KPI untuk pelatihan model AI, portofolio, publikasi, penelitian, komersial | PPD Ps 3; NDA Ps 3 | Tidak ada screenshot data/konten KPI di portofolio. Konten internal tidak boleh ditempel ke alat AI umum saat pengembangan. Eksekutor AI hanya menerima kode dan data TEST. Penyedia AI produk wajib dikonfigurasi tanpa pelatihan atas data (syarat subprosesor). |
| K3 | Akses minimum, akun individual, autentikasi memadai, tidak berbagi kata sandi; dicabut saat tidak diperlukan | PPD Ps 4; NDA Ps 4; PKS Ps 5, Ps 10 | Akun pengembang pribadi (bukan akun pengurus) dengan MFA di GitHub, Vercel, Supabase. Tidak ada akun bersama. Pengembang hanya menjadi anggota organisasi/tim **staging**; organisasi Supabase dan tim Vercel production punya nol anggota pengembang (ADR-007). Akses production hanya lewat undangan berbatas waktu dari owner KPI, diikuti rotasi secret. Service account punya owner, tujuan, rotasi secret, dan tanggal review (dok 23 §13). Review akses bulanan (dok 23 §14). |
| K4 | Akun admin utama, domain, hosting, repository, penyimpanan data di bawah kendali KPI | PPD Ps 4; PKS Ps 9; PHHP Ps 4–5 | Semua akun layanan dibuat atas nama organisasi KPI sejak hari pertama. Pengembang tidak menjadi owner tunggal. |
| K5 | Data produksi tidak dipakai di pengujian tanpa persetujuan; bila perlu disamarkan/dianonimkan | PPD Ps 5; NDA Ps 4; PKS Ps 10 | Local/staging hanya data TEST (5.9). Tidak menyalin database production ke perangkat pribadi. |
| K6 | Menjaga kredensial, perangkat dan jaringan aman, memperbarui perangkat lunak, membatasi salinan, melindungi cadangan | PPD Ps 5 | Secret hanya di secret manager platform; gitleaks di CI; perangkat pengembang terenkripsi dan terkunci; backup terenkripsi dan tidak disimpan di perangkat pribadi. |
| K7 | Mencatat akses dan aktivitas penting selama pekerjaan | PPD Ps 5 | Audit log pengembang/service account (5.7) + log akses platform disimpan dan bisa diminta KPI (PPD Ps 8, Ps 10). |
| K8 | Tidak memakai subkontraktor, cloud, penyedia AI, atau pihak ketiga tanpa persetujuan tertulis; jelaskan lokasi, akses, tujuan, keamanan | PPD Ps 6; PKS Ps 2, Ps 5 | Daftar subprosesor (Vercel, Supabase, email, AI, scanner, monitoring) + region diajukan sebagai task KPI sebelum dipakai dengan data nyata. **Eksekutor AI/pihak lain dan alat bantu coding** yang membaca repo atau paket ini adalah pihak ketiga yang menerima Informasi Rahasia (NDA Ps 2: source code, konfigurasi, struktur basis data, rancangan). Mereka wajib disetujui tertulis KPI lewat `RILIS-E00-T02` **sebelum task pertama** (DoR 6.5 butir 11), dan hanya menerima kode + data TEST. |
| K9 | Lapor segera insiden (akses tidak sah, kehilangan, kebocoran, perubahan, penghapusan, kerusakan) dengan waktu kejadian, jenis data terdampak, penyebab sementara, pihak yang mengetahui, tindakan pengendalian, rencana pemulihan; membantu investigasi, pemulihan, dokumentasi, komunikasi | PPD Ps 7; NDA Ps 7; PKS Ps 5 | Runbook insiden di `docs/runbook/incident.md`. Template laporan wajib memuat field: `waktu_kejadian`, `waktu_diketahui`, `jenis_data_terdampak`, `penyebab_sementara`, **`pihak_yang_mengetahui`**, `tindakan_pengendalian`, `rencana_pemulihan`, dan **`bantuan_investigasi`** (daftar dukungan yang diberikan pengembang: log, akses sementara, dokumentasi, komunikasi). Alur status `security_incidents` (bagian 4.2). Batas waktu "segera" BELUM DITENTUKAN. |
| K10 | Serahkan seluruh data, salinan, ekspor, cadangan; hapus dari perangkat/layanan dan beri konfirmasi tertulis | PPD Ps 9; NDA Ps 6; PHHP Ps 10 | Checklist penghapusan + surat konfirmasi di `18-RILIS`. Tidak menyimpan dump lokal setelah selesai. |
| K11 | KPI berhak memeriksa kepatuhan: dokumentasi keamanan, daftar akses, bukti penghapusan | PPD Ps 8, Ps 10 | Dokumentasi keamanan dan daftar akses selalu mutakhir di repo `docs/`. |
| K12 | Seluruh hasil (source code, desain, konfigurasi, dokumentasi, struktur DB, skrip, hasil tes, struktur API) diserahkan | PKS Ps 9; PHHP Ps 2, Ps 4 | Semua artefak di repo organisasi KPI: riwayat commit, branch penting, instruksi build, daftar dependensi, konfigurasi. Tidak ada bagian penting yang hanya ada di perangkat pengembang. |
| K13 | Daftar komponen pihak ketiga/open-source: nama, versi, lisensi, batas, biaya, kewajiban pembaruan | PKS Ps 9; PHHP Ps 6 | SBOM + `docs/handover/components.md` dibangkitkan di CI; lisensi copyleft kuat butuh persetujuan LEAD. |
| K14 | Tidak ada akses tersembunyi, backdoor, akun rahasia, atau mekanisme yang menghalangi kendali KPI | PHHP Ps 5, Ps 7 | Tidak ada akun seed tersembunyi di production, tidak ada bypass flag, tidak ada kunci master pengembang. Review kode khusus + daftar akun saat serah terima. |
| K15 | Dokumentasi teknis: arsitektur, instalasi, konfigurasi, DB, pengelolaan akun, backup/restore, pemantauan, pemeliharaan, penanganan masalah + sesi transfer pengetahuan | PHHP Ps 8; dok 25 §5 | Deliverable wajib di `18-RILIS`. Jumlah sesi transfer pengetahuan teknis BELUM DITENTUKAN. Panduan pengguna diatur terpisah di K22. |
| K16 | Serah terima lewat Berita Acara: daftar file, repo, akun, kredensial, dokumentasi, cadangan, status pekerjaan; kredensial lewat kanal aman | PHHP Ps 9; PKS Ps 11; dok 25 §5 | Kredensial tidak dikirim lewat chat biasa/email tanpa enkripsi; kanal aman BELUM DITENTUKAN (keputusan KPI). |
| K17 | Perubahan fitur/jadwal wajib tertulis dan menjelaskan dampak biaya, jadwal, keamanan, hasil | PKS Ps 6, Ps 8; Dev Spec §26 | Semua penundaan P2 dan penambahan fitur lewat change request tertulis. Pengembang tidak mengubah aturan inti secara diam-diam. |
| K18 | Penerimaan sistem: fitur tersedia, UAT selesai, cacat kritis diperbaiki, dokumentasi & akses diserahkan, BAST ditandatangani | PKS Ps 11 | Gerbang F4 = kriteria go-live 6.7 + BAST. Termin 2 terkait penerimaan ini. |
| K19 | Kerahasiaan berlaku selama hubungan kerja dan beberapa tahun setelahnya (durasi di draf NDA masih kosong) | NDA Ps 9; PPD Ps 11 | Aturan kerja ini tetap berlaku setelah pemeliharaan 30 hari berakhir. |
| K20 | Kebijakan pengembang di situs rancangan: PIN rahasia milik KPI; pengembang tidak menyimpan, melihat, atau memulihkan PIN | `index.html` kartu kerahasiaan; ADR-008 | PIN dan pepper tidak pernah masuk seed production, log, bukti, repo, staging, atau percakapan dengan eksekutor. Pepper hanya di secret store production milik KPI. Tes redaksi dan tes log wajib. Batas kejujuran ADR-008 Konsekuensi 2 ditulis di dokumentasi keamanan yang diserahkan. |
| K21 | Nilai all-in sudah termasuk **domain .org untuk 2 tahun**; akses administratif dan informasi pemulihan domain wajib diserahkan | PKS Ps 7; PHHP Ps 5 | Task di `18-RILIS`: domain didaftarkan **atas nama KPI** di akun registrar milik KPI (bukan akun pengembang), masa aktif minimal 2 tahun sejak pendaftaran, DNS diarahkan ke Vercel production, 2FA registrar aktif. Kode/informasi pemulihan dan tanggal kedaluwarsa diserahkan lewat kanal aman di BAST. Nama domain dan registrar BELUM DITENTUKAN (task KPI). |
| K22 | **Panduan penggunaan** dan **pelatihan dasar**; admin guide dan user guide | PKS Ps 2; PHHP Ps 2; dok 25 §5 | Deliverable wajib di `18-RILIS`: (a) panduan pengguna pengurus (portal, per peran utama); (b) panduan admin (akun, peran, grant, konfigurasi, backup, reset MFA/PIN sesuai prosedur KPI); (c) panduan editor CMS; (d) sesi pelatihan dasar dengan daftar hadir. Jumlah dan durasi sesi BELUM DITENTUKAN (task KPI). Bahasa Indonesia sederhana (5.13), screenshot hanya data TEST. |
| K23 | KPI menentukan data yang boleh dipakai untuk pengembangan, pengujian, demonstrasi, dan produksi | PPD Ps 2 | Task KPI hari-0 `RILIS-E00-T03` (bagian 2.0). Sebelum Done, seluruh lingkungan non-production hanya memakai data sintetis TEST, dan demo ke pihak mana pun hanya memakai data TEST. |
| K24 | Data uji diberi label TEST dan dihapus atau dianonimkan setelah pengujian | Dok 24 §9 | Task di `18-RILIS`: skrip pembersihan data TEST di staging setelah UAT (5.9 butir 7), dengan bukti hitungan baris dan objek sebelum/sesudah. Termasuk penghapusan akun TEST dan secret TEST dari staging bila staging tidak diteruskan ke KPI. |

---

## 9. Template task (format wajib)

Semua task di `modul/*.md` memakai format berikut. Bahasa Indonesia; istilah teknis boleh bahasa Inggris. Nilai yang belum diberikan KPI (nominal, SLA, retensi, durasi sesi, mata uang, tanggal tahun buku, dan sejenisnya) **tidak boleh ditebak**: jadikan konfigurasi berstatus BELUM DITENTUKAN, tambahkan task KPI untuk mengisinya, dan tulis perilaku aman bila kosong (5.12).

```markdown
### <KODE>-E<nn>-T<nn> — <judul>
- Fase: F1|F2|F3|F4 · Prioritas: P0|P1|P2 · Pelaksana: EKSEKUTOR|LEAD|KPI · Ukuran: S(<=2 jam)|M(<=6 jam)|L(<=12 jam; lebih besar wajib dipecah)
- Bergantung pada: daftar ID task (lintas modul boleh) atau "-"
- Sumber: dokumen+bagian, ID layar, ID keputusan Q, ID tes (AUTH-01, PERM-03, INT-02, dst)
- Tujuan:
- Langkah kerja: bernomor, konkret (tabel/kolom/endpoint/komponen/file yang dibuat)
- Aturan logika yang wajib benar: invariant, transisi status sah & terlarang, aturan izin, idempotency, konkurensi, zona waktu, pembulatan
- Kriteria terima: Given/When/Then terukur
- Tes wajib: tulis kasusnya satu per satu per level (unit, integrasi, pgTAP/RLS, API izin negatif, E2E, a11y/mobile bila ada UI)
- Bukti yang diserahkan:
- Jangan lakukan:
```

Petunjuk pengisian:

1. `<KODE>` = kode file modul tanpa nomor: `PLAT, AUTH, ORG, AUDIT, DOC, PUB, CMS, TASK, NOTIF, MEET, FORM-CASE` (ditulis `FORMCASE` di ID), `KNOW, FIN, PERF, ADMIN, HAND, AI, RILIS`. `E<nn>` = epik di dalam modul; `T<nn>` = urutan task dalam epik.
2. "Bergantung pada" hanya berisi ID task, bukan nama modul umum.
3. "Sumber" minimal satu dokumen+bagian dan, bila ada UI, satu ID layar. Keputusan KPI ditulis `Q07`, ADR ditulis `ADR-003`, keputusan terbuka `OD-nnn`.
4. "Aturan logika" harus merujuk kode status di bagian 4.2 dan kondisi SOD di 3.4. Tulis transisi terlarang secara eksplisit.
5. "Kriteria terima" memakai data TEST dan angka terukur (jumlah baris, kode HTTP, kode error, status akhir, isi audit).
6. "Tes wajib" menyebut nama kasus, contoh: `pgTAP: tasks_select_scope menolak ANGGOTA_KPI divisi lain (RP-01)`.
7. "Jangan lakukan" selalu memuat larangan yang relevan dari bagian 8 dan aturan 5.9 (data pribadi nyata, kredensial nyata, bypass policy).
8. Task berukuran di atas L wajib dipecah sebelum dianggap Ready (6.5).

### 9.1 Contoh pengisian (ilustrasi format, bukan task resmi)

```markdown
### TASK-E03-T02 — Fungsi transisi pengajuan selesai tugas
- Fase: F2 · Prioritas: P0 · Pelaksana: EKSEKUTOR · Ukuran: M
- Bergantung pada: TASK-E01-T03, DOC-E02-T01, ORG-E04-T02
- Sumber: dok 21 §7; GAC Task §8; Dev Spec §6; layar T05, T06; Q09; tes TASK-01, INT-01
- Tujuan: Pelaksana dapat mengajukan tugas selesai hanya bila bukti wajib tersedia, tanpa bisa menerima buktinya sendiri.
- Langkah kerja:
  1. Migrasi `task.transition_task` cabang IN_PROGRESS→COMPLETED dengan cek `task_evidence` berstatus SUBMITTED dan file AVAILABLE.
  2. Endpoint `POST /api/v1/task/tasks/{id}/submit-completion` (Idempotency-Key + expectedVersion).
  3. Tulis `task_history`, AuditEvent `TASK_COMPLETION_SUBMITTED`, outbox `task.TaskCompleted.v1`.
- Aturan logika yang wajib benar: OPEN→COMPLETED ditolak; COMPLETED tanpa bukti ditolak `VALIDATION_FAILED`; lock_version salah → 409; key sama → respons sama tanpa riwayat ganda.
- Kriteria terima: Given tugas TEST IN_PROGRESS dengan 1 bukti AVAILABLE, When pelaksana submit, Then status COMPLETED, 1 baris history, 1 audit, 1 outbox.
- Tes wajib: unit state machine (4 kasus); integrasi idempotency; pgTAP transisi terlarang (3 kasus); API negatif (401, 403 peran salah, 409 versi); E2E T05 di 390px.
- Bukti yang diserahkan: PR, run CI, tabel traceability, screenshot T05 390/768/1280.
- Jangan lakukan: jangan menandai CLOSED otomatis; jangan memakai data pribadi nyata; jangan memakai service role di endpoint.
```

---

## 10. Catatan revisi

### Revisi 0.3 — 15 September 2026

Revisi sebelumnya (0.2) terputus setelah hanya mengubah header. Revisi 0.3 memeriksa ulang ke-23 temuan review terhadap isi file saat ini dan terhadap sumber, lalu menerapkannya. **Tidak ada temuan yang diabaikan.** Semua klaim temuan terbukti di sumber. Kolom "Catatan" menjelaskan bila penerapan berbeda dari usulan perbaikan dan alasannya.

| No | Severity | Temuan (ringkas) | Verifikasi sumber | Status | Lokasi perubahan | Catatan |
|---|---|---|---|---|---|---|
| 1 | Critical | PostgREST dengan JWT pengguna melewati service (AAL2, PIN, SoD, mask, audit) | Dok 27 §7 butir 1 dan 3; index.html kartu PIN | Diterapkan | ADR-002 (eksposur database), 5.2 butir 5, 6.1 (SEC-01 varian), 6.3 butir 5–6 | Pola (b) dan (c) usulan digabung: server memakai koneksi Postgres `set local role authenticated` + klaim; hanya `pub` terekspos. |
| 2 | High | Fungsi `SECURITY DEFINER` menerima actor dari parameter; tanpa REVOKE/search_path | 00 §5.2 lama | Diterapkan | ADR-002 (fungsi SQL), 4.3, 5.8 butir 7–9 | — |
| 3 | High | ADR-004 bertentangan dengan ADR-002; batas body Vercel; alur upload tidak jelas | Tech Arch §11; Q10; layar F02 | Diterapkan | ADR-002 Konsekuensi 3, ADR-004 (alur unggah/unduh), 4.2 `files` | "Log unduhan dalam transaksi yang sama" tidak mungkin secara harfiah karena pembuatan signed URL adalah panggilan API Storage di luar DB. Diganti fail-closed: log di-commit dulu, baru URL dibuat. Angka batas body Vercel ditulis "sekitar, verifikasi ulang" karena berasal dari ketentuan platform, bukan dokumen KPI. |
| 4 | High | Hash PIN di DB bisa di-brute-force; PIN plaintext sampai ke SQL/log | index.html baris kartu PIN | Diterapkan | ADR-008 (alur hash, batas kejujuran, tes), 5.12, 5.14, K20 | `index.html` tidak diubah (di luar ruang lingkup file ini). Usulan kalimat baru dicatat sebagai keputusan terbuka KPI. |
| 5 | High | Pencabutan sesi hanya di middleware; JWT tetap sah | Dok 24 PERM-07; Tech Arch §8 | Diterapkan | ADR-003 (pencabutan sesi), 3.4, 5.12, 6.1 | — |
| 6 | High | Field-level restriction tanpa mekanisme | Dok 27 §7 butir 3; dok 24 PERM-03; dok 20 §7 `field_scope` | Diterapkan | 3.6 (baru), 6.2 | Opsi column privilege ditolak dengan alasan tertulis (semua pengguna berbagi role `authenticated`); dipilih tabel `_sensitive`. |
| 7 | High | Pengembang anggota organisasi platform = akses production | Dok 27 §7; dok 23 §13 | Diterapkan | ADR-007 (pemisahan akses platform), 3.2 peran 13, K3, 6.7 | Klaim tentang cakupan role Supabase/Vercel berasal dari ketentuan platform, ditulis dengan catatan verifikasi ulang. |
| 8 | High | Backup belum mencakup Storage, retensi, uji restore | Dok 27 §7; Tech Arch §17; dok 24 OPS-01/02, §7 | Diterapkan | ADR-010 (baru), 5.12, 6.7 | Dipilih ADR-010 terpisah, bukan subbagian ADR-007. |
| 9 | High | Tidak ada gerbang persetujuan eksekutor AI | NDA Ps 2 (source code, struktur basis data, rancangan = Informasi Rahasia); PPD Ps 6 | Diterapkan | 2.0 (`RILIS-E00-T02`), DoR 6.5 butir 11, K8 | — |
| 10 | High | Wakil Kepala tanpa A bertentangan dok 23 §7 | Dok 23 §7 TASK "Kepala/Wakil: V,C,E,R,A dalam scope" | Diterapkan | 3.2 rekonsiliasi, 6.2 butir 6 | Untuk modul yang dok 23 §7 hanya menyebut "Kepala", hak Wakil menjadi keputusan terbuka dengan perilaku aman tertulis. |
| 11 | Medium | Ketua tidak masuk unit BPH | Dok 27 §4, dok 20 §3, dok 25 §3 | Diterapkan | 3.1 tabel + butir 7, 6.2 butir 6 | Dok 23 §4 menulis Ketua di baris terpisah; dibaca sebagai penekanan pimpinan, bukan pengecualian dari BPH. |
| 12 | Medium | `cases` tanpa review; unpublish tanpa approval; AUDITED mengubah transaksi | Dok 21 §9, §10, §12 | Diterapkan | 4.2 baris `cases`, `publication_versions`, `financial_transactions` | Dok 21 §10 juga memuat baris "Resolved → Closed (Approver)". Baris ini dibaca sebagai ringkasan, sehingga `REVIEWED` tetap wajib. AUDITED dipindah ke tabel relasi karena dok 21 §12 sendiri melarang audit mengubah transaksi sumber. |
| 13 | Medium | AAL2, 403/404, dan HIGHLY_CONFIDENTIAL tidak bisa dites | Q03, Q07; index.html tingkat 5 "perlu persetujuan Ketua/Sekjend" | Diterapkan | ADR-003 (daftar AAL2), 3.3, 3.4 (aturan 403/404), ADR-008, 5.3, 6.2 | Perilaku aman untuk `ANGGOTA_KPI`/`ANGGOTA_TIM_KERJA` ditetapkan AAL2 wajib (lebih ketat) selama KPI belum memutuskan. |
| 14 | Medium | Audit DENIED hilang saat rollback; hash rantai global pecah; superuser; legal hold | Dok 20 §18; dok 23 §17; dok 27 §8; Q26; index.html kartu catatan akses | Diterapkan | 2.10, 5.7 butir 1–8, 5.12 | Janji index.html "tidak dapat diubah oleh siapa pun" dipenuhi di jalur aplikasi; untuk superuser hanya deteksi. Batas ini ditulis jujur, dan usulan kalimat dicatat sebagai keputusan terbuka. |
| 15 | Medium | CSRF, CORS, header, rate limit, dan isi email belum diatur | Tech Arch §10, §18; Q12 | Diterapkan | 5.17 (baru), 5.1, 5.12, 6.1 | — |
| 16 | Medium | DoD lebih lemah dari dok 25 §10 | Dok 25 §10; Tech Arch §18; PHHP Ps 5, Ps 7 | Diterapkan | ADR-009, 5.1, DoD 6.6 butir 4, 7, 12, 14, 15 | — |
| 17 | Medium | Domain .org, panduan/pelatihan, klasifikasi data per lingkungan, pembersihan TEST | PKS Ps 2, Ps 7; PHHP Ps 2, Ps 5; PPD Ps 2; dok 24 §9; dok 25 §5 | Diterapkan | K15, K21–K24, 1.4, 2.0, 5.9 butir 6–7 | — |
| 18 | Medium | Tier platform tidak cocok dengan asumsi cron/backup; biaya belum jadi prasyarat | PKS Ps 7, Ps 9; PHHP Ps 6; dok 27 §7 | Diterapkan | ADR-005, ADR-007 (tabel paket minimum, alternatif), 2.0 `RILIS-E00-T04`, 5.12 | Tabel memuat fitur, bukan harga. Ketentuan paket wajib diverifikasi ulang saat task KPI dikerjakan karena bisa berubah. |
| 19 | Medium | Konvensi bilingual bertabrakan dengan dok 20; nama fungsi transisi tidak konsisten | Dok 20 §6 (`name_id/name_en`, `title_id/title_en`), §18 (`*_id` dan `*_en`) | Diterapkan dengan pilihan berbeda | 4.3 (kolom bilingual, fungsi SQL), ADR-002, 5.8 butir 8(g) | Usulan sufiks `_ind/_eng` atau `jsonb` **tidak dipilih** karena menyimpang dari dok 20 §18. Dipilih: tetap `*_id/*_en` sesuai dok 20 di semua schema, dengan ambiguitas FK dihilangkan lewat aturan tipe + daftar tertutup nama dasar yang dicek pgTAP katalog. |
| 20 | Medium | Allowlist file masih tebakan | Q10; Tech Arch §11, §18 | Diterapkan | 5.12 baris Allowlist file, ADR-004 | — |
| 21 | Medium | DoR butir 9 membolehkan kerja "menunggu ADR" | Dok 27 §8, §10; PPD Ps 6 | Diterapkan | 2.0 (pengecualian pra-persetujuan), DoR 6.5 butir 9, 7.4 T5 | — |
| 22 | Low | Q01 disalahartikan; kontak pribadi eksternal vs Q16; rujukan file yang belum ada | app.js Q01, Q16 | Diterapkan | 3.2 paragraf pembuka, 3.1 butir 4, header, 1.3, 2.0 | Butir (3) sebagian sudah diterapkan revisi 0.2 (catatan "akan dibuat" di header dan 1.3). Revisi 0.3 menambahkan bagian 2.0 yang sebelumnya dirujuk header tetapi belum ada. File 01–04 dan `modul/*.md` tetap belum ada, jadi paket tetap berstatus belum Ready. |
| 23 | Low | Idempotency terpotong; record_code sequence; validator saat build; reset MFA; template insiden | PPD Ps 7 (pihak yang mengetahui, bantuan investigasi) | Diterapkan | 5.5 butir 3, 4.3 `record_code`, 5.12 butir 2–3, ADR-003 Konsekuensi 2, K9 | — |

Keputusan terbuka baru dari revisi ini, yang wajib diberi baris di `03-RISIKO-DAN-KEPUTUSAN-TERBUKA.md` sebelum paket Ready: AAL2 untuk `ANGGOTA_KPI`/`ANGGOTA_TIM_KERJA`; hak Wakil Kepala Divisi di MEET/DOC/KNOW/NOTIF/PERF/HAND; pengecualian Q03 untuk akses Sangat Rahasia; penarikan publikasi darurat; daftar final field sensitif per modul; penyelarasan kalimat kartu PIN dan kartu catatan akses di `index.html`; paket langganan dan penanggung biaya; penyimpanan kedua untuk backup; mulai hitungan minggu 1 terhadap gerbang hari-0.

---

Akhir dokumen 00. Perubahan pada dokumen ini wajib lewat PR dengan review LEAD, dan perubahan yang menyentuh ADR, peran, kerahasiaan, atau kamus status wajib dicatat di `03-RISIKO-DAN-KEPUTUSAN-TERBUKA.md`.
