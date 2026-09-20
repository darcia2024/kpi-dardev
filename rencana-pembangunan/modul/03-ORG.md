# 03-ORG — Organisasi, Periode, Jabatan, Penugasan, Peran, Izin, Grant, Delegasi, Acting, Akses Darurat, Admin Demisioner, Policy Engine

Komisi Peduli Interaksi (KPI) PPMI Mesir · Paket rencana pembangunan · Versi modul 0.1 (15 September 2026)

> Status: **DRAF RENCANA, belum Ready.** File ini tunduk pada `00-KERANGKA-INDUK.md` (bagian 1.3–1.4, 2, 3, 4, 5, 6, 7, 9). Semua ADR yang dirujuk berstatus *Usulan, butuh persetujuan KPI*. Tidak ada task EKSEKUTOR yang Ready sebelum gerbang hari-0 (`RILIS-E00-T01`, `-T02`, `-T03`, `-T04`, `-T05`) Done (00 §2.0, DoR 6.5 butir 9 dan 11).
>
> **Tentang ID lintas modul.** File modul lain (`01-PLAT`, `02-AUTH`, `04-AUDIT`, `05-DOC`, `09-NOTIF`, `10-MEET`, `15-ADMIN`, `16-HAND`) belum ada saat file ini ditulis. ID task lintas modul di kolom "Bergantung pada" adalah **ID provisional** yang dikunci di tabel 1.5. Pembuat file modul terkait wajib memakai ID itu, atau memperbarui tabel 1.5 dan semua rujukan di file ini dalam PR yang sama.
>
> **Tentang keputusan terbuka.** Nomor `OD-nnn` dikunci di `03-RISIKO-DAN-KEPUTUSAN-TERBUKA.md`. File ini memakai ID sementara `OD-ORG-nn` (bagian 7). LEAD memetakan setiap `OD-ORG-nn` ke nomor `OD-nnn` final sebelum paket Ready.

---

## 1. Ringkasan, system of record, dependensi

### 1.1 Ringkasan

Modul ORG adalah inti "ADMIN governance" (dok 18 §5–§8, dok 22 §3) dan "CORE identity/role/division/period" (GAC §9–§14). Modul ini menjawab satu pertanyaan untuk seluruh sistem: **"Siapa subjek ini, jabatan/penugasan apa yang sah saat ini, dan boleh melakukan aksi apa pada objek apa?"**

Isi modul:

1. Organisasi, periode kepengurusan (lifecycle + koreksi resmi Q14), unit (BPH, 3 divisi, subbidang M&P, tim kerja sementara), jabatan.
2. Anggota dan akun pengguna (lifecycle akun A05). Autentikasi (login, MFA, sesi) milik `02-AUTH`.
3. Penugasan jabatan (`membership_assignments`) dengan larangan rangkap jabatan di database, dasar keputusan wajib, tanggal efektif Africa/Cairo, dan kedaluwarsa otomatis yang ditegakkan saat evaluasi izin.
4. Katalog 13 peran, katalog permission `<modul>.<resource>.<aksi>`, pemetaan peran→permission+scope (read-only di runtime pada rilis ini; perubahan lewat migrasi yang direview LEAD + KPI).
5. AccessGrant (akses khusus/sementara A09, grant per objek level 5, penugasan fungsional Auditor, grant sementara pengembang), delegasi, pelaksana tugas (acting), akses darurat/break-glass (A10), penetapan Admin Sistem termasuk admin demisioner (Q03, Q27), pencabutan akses dan rencana peralihan akses (H06, ALUR-F11).
6. Anggota eksternal tim kerja (tanpa akun, Q16) dan service account.
7. **Policy engine pusat** (`src/modules/org/policy/engine.ts`) + fungsi SQL `org.authorize()` / `org.subject_can_see()` untuk RLS + `applyFieldMask()` (field-level restriction, 00 §3.6) + `allowedActions`. Semua modul lain memakai engine ini.

Layar milik modul: **A05, A06, A07, A08, A09, A10, H06** (H06 dimasukkan ke ORG karena 00 §7.2 menetapkan peralihan akses ALUR-F11 sebagai P0 di 03-ORG pada F2). Alur: **ALUR-F11** (penuh), **ALUR-F08** langkah 1 (A08 penutupan periode; sisanya milik 16-HAND). Keputusan KPI: **Q01, Q03, Q27** (utama), Q02, Q07, Q14, Q16 (terkait).

### 1.2 System of record

| Data | Pemilik (ORG) | Pembaca | Dasar |
|---|---|---|---|
| Organisasi, periode, unit, jabatan | `org.organizations`, `org.organization_periods`, `org.organizational_units`, `org.positions` | Semua modul (FK `organization_period_id`, `unit_id`) | Dok 20 §5–§6, dok 22 §9 |
| Anggota, akun, status akun | `org.members`, `org.user_accounts` | AUTH (status akun saat login), semua modul | Dok 20 §6, ADR-003 "Jalur keluar" |
| Penugasan jabatan & tim | `org.membership_assignments` | Semua modul lewat policy engine, HAND, NOTIF | Dok 20 §6, dok 23 §9–§10 |
| Peran, permission, role_permissions | `org.roles`, `org.permissions`, `org.role_permissions` | Policy engine, matriks izin | Dok 23 §5–§7, 00 §3.2 |
| AccessGrant, delegasi, acting, akses darurat, penetapan admin, pencabutan | `org.access_grants`, `org.delegations`, `org.acting_assignments`, `org.emergency_access_grants`, `org.admin_designations`, `org.access_revocations` | Policy engine, AUDIT, NOTIF, HAND | Dok 20 §7, dok 21 §5–§6, dok 23 §12 |
| Anggota eksternal tim | `org.external_participants` | MEET, TASK (referensi) | Dok 20 §18, Q16 |
| Registry field sensitif | `org.field_policies` (struktur milik ORG, baris diisi tiap modul) | Semua modul lewat `applyFieldMask` | 00 §3.6 |

**Bukan milik ORG:** kredensial, sesi, MFA, `org.session_revocations` dan `org.current_session_valid()` (dibuat 02-AUTH walau di schema `org`, ADR-003); `org.step_up_credentials`, `org.step_up_grants`, `org.verify_step_up_pin()` (dibuat 05-DOC, ADR-008; ORG hanya memanggil `org.has_valid_step_up()` dari engine); `audit.audit_events` (04-AUDIT); keputusan rapat/sidang (`meet.decisions`, `meet.assemblies`, 10-MEET); paket serah terima dan pemindahan pekerjaan (H05, 16-HAND); konfigurasi berversi umum dan `adm.change_requests` (15-ADMIN); `access_reviews` (04-AUDIT, 00 §4.2). ORG **tidak** mengubah record bisnis modul lain (dok 18 §3).

### 1.3 Dependensi masuk (ORG membutuhkan)

| Dari | Kebutuhan | Pola |
|---|---|---|
| 01-PLAT | Repo, CI, `user-db.ts`/`job-db.ts`, wrapper HTTP (auth, correlation ID, idempotency, error, CSRF, rate limit), outbox writer, registry konfigurasi + validator `NOT_SET`, util waktu Kairo, i18n, komponen UI dasar | Impor `src/platform/**` |
| 02-AUTH | Supabase Auth, `org.session_revocations`, `org.current_session_valid()`, klaim `aal`/`session_id`, event login AAL2 pertama | Fungsi SQL + event |
| 04-AUDIT | `audit.record_event()` (SUCCESS di transaksi, DENIED di luar transaksi) | Fungsi SQL + wrapper |
| 05-DOC | `org.has_valid_step_up(resource_type, resource_id, action)` | Fungsi SQL |
| 10-MEET (F3) | `meet.decisions` untuk FK `decision_id`; sebelum MEET ada, nomor dokumen keputusan (00 §3.1 butir 3) | FK ditambah migrasi MEET |

### 1.4 Dependensi keluar (modul lain membutuhkan ORG)

| Ke | Yang disediakan | Pola |
|---|---|---|
| Semua modul | `policy.assert(ctx, permission, resource)`, `allowedActions`, `applyFieldMask`, `org.authorize()`, `org.subject_can_see()`, periode aktif, unit, jabatan | `src/modules/org/index.ts` + fungsi SQL |
| 02-AUTH | Status akun, principal type, daftar AAL2 wajib (ADR-003), akun `DEACTIVATED` ditolak login (D24:AUTH-03) | `org.index.ts#getAccountLoginPolicy` |
| 09-NOTIF | Event `org.AssignmentChanged.v1`, `org.AccessGranted.v1`, `org.AccessRevoked.v1`, `org.AccessExpiring.v1`, `org.EmergencyAccessActivated.v1`; resolusi penerima berdasarkan jabatan | Outbox + fungsi `resolveRecipientsByPosition` |
| 04-AUDIT | Event audit ORG (bagian 5.3), snapshot akses aktif untuk review bulanan (dok 23 §14) | `audit.record_event()` + view `org.v_active_access_snapshot` |
| 16-HAND | Rencana peralihan akses H06, event `AssignmentChanged`, status periode `CLOSING` | API + event |
| 10-MEET | Daftar peserta musyawarah BPH (00 §3.1 butir 7), `external_participants` | `org.index.ts` |
| 15-ADMIN | Tabel `org.role_permissions` sebagai target change request runtime (P2) | Kontrak tabel |

### 1.5 ID task lintas modul (provisional, wajib dikunci pembuat file terkait)

| ID provisional | Isi yang diasumsikan |
|---|---|
| `PLAT-E01-T01` | Repo + CI dasar (lint, typecheck, Vitest, `supabase db reset`, `supabase test db`, gitleaks) |
| `PLAT-E02-T01` | `src/platform/db/user-db.ts` (set local role authenticated + klaim JWT terverifikasi) dan `job-db.ts` (role `app_job`) |
| `PLAT-E02-T02` | Tes katalog pgTAP `catalog.test.sql`, `naming_conventions.test.sql`, `exposure.test.sql` |
| `PLAT-E03-T01` | Wrapper HTTP `/api/v1` (auth, correlation ID, error model, Origin/CSRF, CORS, rate limit) |
| `PLAT-E03-T02` | Idempotency key (`platform.idempotency_keys`) |
| `PLAT-E04-T01` | Outbox writer + worker + `platform.consumed_events` |
| `PLAT-E05-T01` | Registry konfigurasi + validator `NOT_SET` + healthcheck `/api/internal/health/config` |
| `PLAT-E06-T01` | Util waktu `platform.cairo_end_of_day`, `platform.cairo_start_of_day`, JS `time/` |
| `PLAT-E07-T01` | Shell portal, komponen state 5.16, token `styles.css`, Playwright + axe |
| `AUTH-E01-T01` | Supabase Auth, login email/username, pembuatan user Auth untuk akun undangan |
| `AUTH-E02-T01` | `org.session_revocations` + `org.current_session_valid()` |
| `AUTH-E02-T02` | Fungsi `revokeAllSessionsForAccount(accountId, reason)` dipanggil ORG saat suspend/deactivate/revoke keamanan |
| `AUDIT-E01-T01` | `audit.audit_events` + `audit.record_event()` + penulisan DENIED di luar transaksi |
| `DOC-E05-T01` | `org.has_valid_step_up()` (step-up PIN) |
| `NOTIF-E01-T01` | Konsumen outbox in-app (W05) |
| `MEET-E03-T01` | `meet.decisions` + FK `org.membership_assignments.decision_id` |
| `HAND-E02-T01` | Konsumen `org.AssignmentChanged.v1` untuk inventaris tanggung jawab (H05) |
| `RILIS-E00-T01..T05` | Gerbang hari-0 (00 §2.0, ID sudah dikunci) |

---

## 2. Model data (schema `org`)

Aturan umum untuk semua tabel (00 §4.3, §5.8): PK `id uuid default gen_random_uuid()`; metadata `created_at, created_by, updated_at, updated_by`; `lock_version integer not null default 0` pada tabel yang bisa diubah; tidak ada hard delete dari aplikasi; `ENABLE ROW LEVEL SECURITY` + policy + pgTAP; `COMMENT ON TABLE` memuat pemilik `ORG` dan klasifikasi default. Ekstensi: `btree_gist` (exclusion constraint) dan `citext` (username). Kelayakannya diuji di PoC `ORG-E00-T05`.

**Rentang waktu efektif.** Tanggal efektif keputusan KPI berupa tanggal Kairo. Disimpan sebagai `valid_from timestamptz` (awal hari Africa/Cairo tanggal mulai) dan `valid_until timestamptz` **eksklusif** (awal hari Africa/Cairo sesudah tanggal akhir). Keduanya dihitung satu fungsi `org.effective_range(p_start date, p_end date) returns tstzrange` yang memakai `(p_start::timestamp at time zone 'Africa/Cairo')`. Batas `[)` membuat pergantian pejabat di tanggal yang sama tidak tumpang tindih dan tidak berlubang. "Aktif" berarti `valid_from <= now() < valid_until`.

### 2.1 Enum dan referensi

| Enum | Nilai | Sumber |
|---|---|---|
| `org.period_status` | `DRAFT, REVIEWED, APPROVED, ACTIVE, CLOSING, CLOSED, ARCHIVED` | 00 §4.2 |
| `org.unit_status` | `PROPOSED, REVIEWED, APPROVED, ACTIVE, SUPERSEDED` | 00 §4.2 |
| `org.unit_type` | `ORGANIZATION, BPH, DIVISION, SUBUNIT, TEMP_TEAM` | 00 §3.1 |
| `org.account_status` | `INVITED, ACTIVE, SUSPENDED, DEACTIVATED, ARCHIVED` | 00 §4.2, dok 18 §6 |
| `org.principal_type` | `MEMBER, DEVELOPER, SERVICE_ACCOUNT` | ADR-007 butir 3 |
| `org.access_status` (untuk `membership_assignments` dan `access_grants`) | `PROPOSED, VERIFIED, APPROVED, ACTIVE, SUSPENDED, EXPIRED, REVOKED, ARCHIVED` | Dok 23 §9 |
| `org.position_change_status` | `SUBMITTED, REVIEWED, IN_ASSEMBLY, APPROVED, REJECTED, EFFECTIVE` | Dok 21 §5 |
| `org.acting_status` | `PROPOSED, APPROVED, ACTIVE, ENDED` | Dok 21 §5 |
| `org.restructuring_status` | `PROPOSED, CONSULTED, IN_ASSEMBLY, APPROVED, EFFECTIVE` | Dok 21 §5 |
| `org.admin_designation_status` | `PROPOSED, IN_ASSEMBLY, APPROVED, ACTIVE, REVOKED` | Dok 21 §5–§6, Q27 |
| `org.revocation_status` | `TRIGGERED, REVIEWED, REVOKED, ARCHIVED` | Dok 21 §5 |
| `org.delegation_status` | `PROPOSED, APPROVED, ACTIVE, EXPIRED, REVOKED` | 00 §4.2 |
| `org.emergency_status` | `REQUESTED, APPROVED, ACTIVE, EXPIRED, REVOKED, POST_REVIEWED` | Dok 23 §12 |
| `org.position_kind` | `OFFICE` (jabatan kepengurusan), `TEAM_ROLE` (ketua/anggota tim), `MEMBER_STATUS` (Anggota KPI) | 00 §3.1 butir 1 |
| `org.scope_type` | `OWN, ASSIGNED, TEAM, SUBUNIT, DIVISION, BPH, ORGANIZATION, RESTRICTED, SYSTEM` | Dok 23 §8, 00 §3.4 |
| `org.action_code` | `V, C, E, S, R, A, X, P, D, EX, AD, AU` | Dok 23 §6 |
| `org.grant_type` | `SPECIAL, TEMPORARY, OBJECT_LEVEL5, FUNCTIONAL_AUDITOR, FUNCTIONAL_REVIEWER, DEVELOPER_TEMP` | Dok 23 §3, RPM §14, ADR-007, ADR-008 |
| `org.decision_basis` | `BPH_DELIBERATION`, `MEMBER_ASSEMBLY`, `OFFICIAL_APPOINTMENT`, `TEAM_DECREE`, `MEMBER_STATUS`, `CONTRACT` | Dok 23 §5, §10 |
| `org.revocation_trigger` | `TERM_END, REPLACEMENT, TRANSFER, DISMISSAL, SECURITY, ADMIN_TRANSFER, TEAM_ENDED, MANUAL` | Dok 23 §10, dok 21 §6 |
| `classification_level` | Dari 01-PLAT (00 §3.3) | ADR-008 |

`Revised` (dok 23 §9) **bukan** status tinggal. Perubahan scope dicatat sebagai baris `org.access_scope_revisions` (transisi tercatat, 00 §4.2).

### 2.2 Tabel

| Tabel | Kolom penting | Constraint & index | Klasifikasi default |
|---|---|---|---|
| `organizations` | `id, code, name_id, name_en, short_name, parent_organization_id null, status` | `uq_organizations_code`; seed tepat satu baris `code='KPI'` | INTERNAL |
| `organization_periods` | `id, organization_id, code, name_id, name_en, start_date date null, end_date date null, status, decision_basis, decision_id uuid null, decision_document_no text null, decision_date date null, closing_started_at, closed_at, archived_at, lock_version` | `ux_organization_periods_single_active` unique partial `(organization_id) where status='ACTIVE'`; `ck_organization_periods_dates` (`end_date > start_date`); `ck_organization_periods_approved_complete` (status di `APPROVED, ACTIVE, CLOSING, CLOSED, ARCHIVED` ⇒ `start_date`, `end_date`, dan `decision_id` atau `decision_document_no` terisi); `ex_organization_periods_no_overlap` (exclusion `organization_id =`, `org.effective_range(start_date,end_date) &&` untuk status `APPROVED..CLOSED`) | INTERNAL |
| `period_corrections` | `id, period_id, entity_module, entity_type, entity_id, field_path, before_value jsonb (teredaksi), after_value jsonb, official_record_no text not null, requested_by, approved_by, approved_at, reason text not null, executed_at` | Insert-only (trigger tolak UPDATE/DELETE); `ck_period_corrections_approver_not_requester` | LIMITED |
| `organizational_units` | `id, organization_id, period_id, unit_type, code, name_id, name_en, parent_unit_id null, is_public, is_sensitive, status, supersedes_unit_id null, decision_*, lock_version` | `uq_organizational_units_code_period (code, period_id)`; aturan parent (dijaga trigger): `BPH`, `DIVISION`, `TEMP_TEAM` → parent `ORGANIZATION`, `SUBUNIT` → parent `DIVISION`; trigger tolak DELETE (dok 18 §5) | INTERNAL |
| `team_mandates` | `id, unit_id (TEMP_TEAM), mandate_id text, mandate_en text, decision_document_no text not null, valid_from, valid_until not null, status unit_status` | `ux_team_mandates_one_active (unit_id) where status='ACTIVE'`; `valid_until > valid_from` | INTERNAL |
| `positions` | `id, unit_id, code, title_id, title_en, role_id, position_kind, level, is_organization_head, is_bph, is_public, status unit_status` | `uq_positions_unit_code`; seed: `KETUA_KPI` (`is_organization_head`, `is_bph`), `SEKJEND`, `WAKIL_KETUA`, `SEKRETARIS`, `BENDAHARA` (`is_bph`); trigger `ck_positions_subunit_rules`: unit `SUBUNIT` hanya boleh punya jabatan `KOORDINATOR_MP` | INTERNAL |
| `members` | `id, member_code, display_name, member_status (ACTIVE, INACTIVE), joined_date, left_date` | `uq_members_member_code`. **Tidak ada** kolom NIK, alamat, HP pribadi, atau rekening (PPD Ps 5, Q16) | INTERNAL |
| `user_accounts` | `id, principal_type, member_id null, auth_user_id uuid null, username citext, login_email citext, status, invited_at, activated_at, first_aal2_at, suspended_at, suspend_reason, deactivated_at, deactivate_reason, archived_at, lock_version` | `uq_user_accounts_username`, `uq_user_accounts_login_email`, `uq_user_accounts_auth_user_id` (D24:CORE-01 dan GAC:CORE-01 duplikat ditolak); `ck_user_accounts_member_required` (`MEMBER` ⇒ `member_id` terisi; selain itu `member_id` null); `ux_user_accounts_one_open_per_member` unique partial `(member_id) where status in ('INVITED','ACTIVE','SUSPENDED')` | LIMITED |
| `service_accounts` | `account_id (PK+FK), owner_account_id, purpose, component, secret_rotated_at, review_due_at date not null` | `ck_service_accounts_owner_not_self`; `auth_user_id` akun ini wajib null (tidak login interaktif) | LIMITED |
| `external_participants` | `id, team_unit_id, display_name, institution_name, role_in_team, official_institution_contact, status (ACTIVE, ARCHIVED)` | **Tanpa FK ke `user_accounts`**; tes katalog gagal bila ada kolom `%phone%`/`%personal%` (Q16, RP-05, PERM-06) | INTERNAL |
| `roles` | `id, code, name_id, name_en, role_kind (OFFICE, MEMBER_STATUS, TEAM, SYSTEM, TECHNICAL, FUNCTIONAL), baseline_code, requires_aal2, is_system, status` | `uq_roles_code`; isi dari seed `00_reference.sql` (13 peran + `DEVELOPER`/`SERVICE_ACCOUNT` + `AUDITOR` fungsional) | INTERNAL |
| `permissions` | `id, code, module, resource, action action_code, description_id, sensitivity, is_delegable_default` | `uq_permissions_code`; `ck_permissions_code_pattern` (`^[a-z_]+\.[a-z_]+\.[a-z_]+$`) | INTERNAL |
| `role_permissions` | `id, role_id, permission_id, scope_type, condition_code null, classification_ceiling, version_no, status (ACTIVE, SUPERSEDED)` | `ux_role_permissions_active (role_id, permission_id, scope_type) where status='ACTIVE'`; diubah hanya lewat migrasi pada rilis ini | INTERNAL |
| `membership_assignments` | `id, member_id, position_id, position_kind (disalin trigger dari positions), unit_id, period_id, valid_from, valid_until not null, status access_status, decision_basis, decision_id null, decision_document_no null, decision_date, proposed_by, verified_by, approved_by, activated_at, ended_at, end_reason revocation_trigger null, supersedes_assignment_id null, lock_version` | `ex_membership_assignments_single_holder` (exclusion `position_id =`, `tstzrange(valid_from, valid_until) &&`, status `APPROVED/ACTIVE/SUSPENDED`, `position_kind='OFFICE'`); `ex_membership_assignments_no_double_office` (sama, dengan `member_id =`); `ck_membership_assignments_decision_required` (status ≥ `APPROVED` ⇒ dasar keputusan terisi); `ck_membership_assignments_maker_checker` (`approved_by <> proposed_by`); rentang ⊆ rentang periode dijaga fungsi transisi; index `ix_membership_assignments_member_status`, `ix_membership_assignments_position_status`, GiST rentang | LIMITED |
| `access_scope_revisions` | `id, subject_table, subject_id, before jsonb, after jsonb, reason, revised_by, decision_document_no` | Insert-only | LIMITED |
| `access_grants` | `id, grantee_account_id, grant_type, permission_id, scope_type, scope_unit_id null, resource_type null, resource_id null, classification_ceiling, valid_from, valid_until not null, reason not null, requested_by, verified_by null, approved_by null, status access_status, revoked_by, revoked_at, revoke_reason, lock_version` | `ck_access_grants_expiry_after_start`; `ck_access_grants_object_level5` (`OBJECT_LEVEL5` ⇒ resource terisi dan ceiling `HIGHLY_CONFIDENTIAL`); `ck_access_grants_approver_not_requester`; `ck_access_grants_approver_not_grantee`; `ck_access_grants_verifier_not_approver`; `DEVELOPER_TEMP` hanya untuk principal `DEVELOPER` (trigger); `ix_access_grants_grantee_active (grantee_account_id, valid_until) where status='ACTIVE'` | LIMITED |
| `delegations` | `id, delegator_account_id, delegatee_account_id, source_assignment_id, permission_ids uuid[] not null, scope_type, scope_unit_id null, resource_type null, resource_id null, valid_from, valid_until not null, reason, decision_document_no null, approved_by null, status, revoked_*, lock_version` | `ck_delegations_not_self`; `ck_delegations_nonempty_permissions` (`cardinality > 0`); `ck_delegations_approver_not_parties`; subset kewenangan (SOD-09) dijaga fungsi transisi **dan** dicek ulang saat evaluasi | LIMITED |
| `acting_assignments` | `id, acted_position_id, acting_member_id, reason, permission_ids uuid[] null, valid_from, valid_until not null, decision_basis, decision_document_no, proposed_by, approved_by, status acting_status, ended_at, end_reason, lock_version` | `ex_acting_assignments_single_actor` (exclusion `acted_position_id =`, rentang &&, status `APPROVED/ACTIVE`); `ck_acting_assignments_maker_checker`; `ck_acting_assignments_not_own_position` (trigger: pemangku jabatan itu sendiri tidak bisa jadi acting) | LIMITED |
| `emergency_access_grants` | `id, requester_account_id, grantee_account_id, reason not null, incident_reference null, permission_ids uuid[] not null, resource_type null, resource_id null, scope_type, requested_at, approved_by null, approved_at, valid_from, valid_until not null, revoked_by, revoked_at, post_review_by, post_review_notes, post_reviewed_at, status emergency_status, lock_version` | `ck_emergency_access_grants_approver_not_requester`; `ck_emergency_access_grants_approver_not_grantee`; `ck_emergency_access_grants_active_complete`; `ck_emergency_access_grants_reviewer_not_grantee` | CONFIDENTIAL |
| `admin_designations` | `id, account_id, basis (OFFICE_HOLDER_Q03, DEMISIONER_KETUA, DEMISIONER_SEKRETARIS), period_id, assembly_decision_id null, assembly_decision_document_no null, valid_from, valid_until null, status admin_designation_status, proposed_by, approved_by, revoked_at, revoke_reason, superseded_by_designation_id null, lock_version` | `ck_admin_designations_demisioner_assembly` (basis `DEMISIONER_*` ⇒ keputusan sidang terisi); `ck_admin_designations_maker_checker`; `ck_admin_designations_office_holder_valid_until` (`OFFICE_HOLDER_Q03` ⇒ `valid_until` terisi = akhir assignment jabatan) | LIMITED |
| `access_revocations` | `id, subject_account_id, trigger, related_table, related_id, planned_effective_at, status revocation_status, triggered_by, triggered_by_type (USER, SYSTEM), reviewed_by, revoked_at, notes` | `ix_access_revocations_subject_status` | LIMITED |
| `access_transition_plans` (H06) | `id, position_id, outgoing_assignment_id null, incoming_assignment_id, effective_at, incoming_ready_checked_at, status, blocked_reason, executed_at, lock_version` | Enum status **usulan lead** `DRAFT, READY, BLOCKED, EXECUTED, CANCELLED` (tidak ada di kamus 00 §4.2): wajib diputuskan `ORG-E00-T02` sebelum migrasi | LIMITED |
| `position_change_requests` | `id, member_id, from_assignment_id, to_position_id, reason, status, assembly_decision_id null, assembly_decision_document_no null, submitted_by, reviewed_by, decided_at, effective_at, lock_version` | `ck_position_change_requests_effective_requires_assembly` | LIMITED |
| `restructuring_requests` | `id, summary_id, summary_en, proposed_changes jsonb, status, consulted_at, assembly_decision_*, effective_at, lock_version` | `ck_restructuring_requests_effective_requires_assembly` | INTERNAL |
| `field_policies` | `id, module, entity, field, min_classification, allowed_permission, mask_mode ('HIDE','READ_ONLY','PARTIAL'), status, version_no` | `ux_field_policies_active (module, entity, field) where status='ACTIVE'` (00 §3.6) | INTERNAL |
| `org_transition_history` | `id, entity_table, entity_id, from_status, to_status, action, actor_id, actor_type, reason, correlation_id, occurred_at` | Insert-only; `ix_org_transition_history_entity` | LIMITED |

View:

- `org.v_effective_subject_grants` (hanya dibaca fungsi `SECURITY DEFINER` di 2.3, tanpa grant ke `authenticated`): gabungan sumber izin aktif per `account_id` dengan kolom `source_type (ASSIGNMENT, GRANT, DELEGATION, ACTING, EMERGENCY, ADMIN_DESIGNATION), source_id, permission_code, scope_type, scope_unit_id, resource_type, resource_id, classification_ceiling, valid_until`. Setiap sumber memakai `status='ACTIVE' and valid_from <= now() and now() < valid_until`, sehingga kedaluwarsa tidak menunggu job (ADR-005 Konsekuensi 2, RP-02, RP-04).
- `org.v_member_directory`: nama tampilan + jabatan aktif + unit, tanpa kolom akun.
- `org.v_active_access_snapshot`: untuk review akses bulanan (dok 23 §14) dan ekspor `EX`.

### 2.3 Fungsi SQL pusat

| Fungsi | Sifat | Isi |
|---|---|---|
| `org.effective_range(p_start date, p_end date)` | IMMUTABLE | `tstzrange` batas `[)` Africa/Cairo |
| `org.current_account_id()` | STABLE, SECURITY DEFINER, `search_path=''` | `user_accounts.id` dari `auth.uid()`; null bila akun bukan `ACTIVE` |
| `org.authorize(p_permission text, p_resource jsonb)` | STABLE, SECURITY DEFINER | Urutan 00 §3.4 di SQL: sesi sah, akun ACTIVE, AAL2 bila wajib, izin dari `v_effective_subject_grants`, scope, periode, klasifikasi (level 4 `org.has_valid_step_up`, level 5 grant `OBJECT_LEVEL5` + step-up), kondisi SoD dari `p_resource`. Actor dibaca dari `auth.uid()` di dalam fungsi. ADR-002 menulis `org.authorize(auth.uid(), permission, resource)`, sedangkan 5.8 butir 8(c) melarang argumen actor; tanda tangan tanpa actor dipilih dan penyelarasannya dicatat `ORG-E00-T02` |
| `org.authorize_reason(p_permission, p_resource)` | STABLE, SECURITY DEFINER | Sama, mengembalikan kode `ALLOW` / `AUTH_SESSION_REVOKED` / `AUTH_MFA_REQUIRED` / `AUTHZ_FORBIDDEN` / `RESOURCE_NOT_FOUND` / `AUTHZ_STEP_UP_REQUIRED` / `PERIOD_CLOSED` / `AUTHZ_SOD_VIOLATION` untuk fungsi transisi |
| `org.subject_can_see(p_module, p_resource_type, p_resource_id, p_owner_account_id, p_unit_id, p_team_unit_id, p_period_id, p_classification)` | STABLE, SECURITY DEFINER | Predikat visibilitas baris untuk policy RLS semua modul (ADR-002 butir d) |
| `org.is_bph_member()` | STABLE, SECURITY DEFINER | Assignment ACTIVE pada jabatan `is_bph=true` (00 §3.1 butir 7) |
| `org.transition_<entitas>(p_id, p_to_status, p_reason, p_expected_lock_version, p_idempotency_key, p_payload jsonb)` | SECURITY DEFINER | Satu fungsi per entitas (bagian 3); riwayat + audit + outbox satu transaksi; `SELECT ... FOR UPDATE` |
| `org.expire_access_system()` | SECURITY DEFINER, EXECUTE hanya `app_job` | Menandai `EXPIRED`/`ENDED` baris lewat `valid_until`, membuat `access_revocations`, audit `actor_type='SYSTEM'`, outbox; idempoten |

### 2.4 RLS per peran

Semua policy memanggil `org.current_session_valid()`. Policy `emergency_access_grants` juga mensyaratkan `(auth.jwt()->>'aal') = 'aal2'`. **Tidak ada policy INSERT/UPDATE/DELETE** untuk `authenticated`; semua tulis lewat fungsi transisi `SECURITY DEFINER` (00 §5.2 butir 5). Grant tabel ke `authenticated` hanya `SELECT`.

| Tabel | Policy SELECT (siapa melihat baris) | Penolakan yang wajib dites |
|---|---|---|
| `organizations`, `organization_periods`, `organizational_units`, `positions`, `roles`, `permissions`, `role_permissions`, `field_policies` | `<tabel>_select_internal`: akun ACTIVE `MEMBER` + pemegang `ADMIN_SISTEM` | `anon`; `DEVELOPER` tanpa grant; `SERVICE_ACCOUNT` |
| `members` | `members_select_scope`: diri sendiri; BPH; `ADMIN_SISTEM`; anggota lain hanya lewat `v_member_directory` | `ANGGOTA_KPI` membaca tabel `members` divisi lain (RP-01) |
| `user_accounts` | `user_accounts_select_self_or_oversight`: baris sendiri; `ADMIN_SISTEM`; `KETUA_KPI`; `SEKJEND`; `SEKRETARIS` (index.html "Periksa") | `ANGGOTA_KPI` membaca akun lain; `KEPALA_DIVISI` membaca akun mana pun selain sendiri |
| `membership_assignments` | `membership_assignments_select_scope`: milik sendiri; BPH; `KEPALA_DIVISI`/`WAKIL_KEPALA_DIVISI` untuk divisinya + subunitnya; `KOORDINATOR_MP` untuk `SUB_MP`; `KETUA_TIM_KERJA` untuk timnya; `ADMIN_SISTEM`; Auditor sesuai scope grant | `ANGGOTA_KPI` divisi lain (RP-01); `KEPALA_DIVISI` DIV_IO membaca DIV_RA (PERM-02) |
| `access_grants`, `delegations`, `acting_assignments` | Pihak terkait (grantee, delegator, delegatee, pemohon, verifier, approver); `KETUA_KPI`; `SEKJEND`; `SEKRETARIS`; `ADMIN_SISTEM`; Auditor fungsional | Anggota lain; `DEVELOPER` |
| `emergency_access_grants` | `KETUA_KPI`, `SEKJEND`, requester, grantee, approver, post-reviewer, Auditor fungsional; AAL2 | Lainnya → 0 baris; AAL1 → 0 baris |
| `admin_designations` | Semua akun `MEMBER` ACTIVE melihat siapa admin aktif (lewat view tanpa detail keputusan); detail untuk BPH, `ADMIN_SISTEM`, Auditor | `DEVELOPER`, `SERVICE_ACCOUNT` |
| `access_revocations`, `access_transition_plans` | Subjek sendiri; `ADMIN_SISTEM`; `SEKRETARIS`; `KETUA_KPI`; `SEKJEND`; Auditor fungsional | Anggota lain |
| `period_corrections`, `access_scope_revisions`, `org_transition_history` | BPH; `ADMIN_SISTEM`; Auditor; subjek untuk riwayat miliknya | Anggota lain |
| `external_participants` | Anggota + ketua tim terkait; BPH; `ADMIN_SISTEM` | Anggota di luar tim |
| `service_accounts` | `ADMIN_SISTEM`, `KETUA_KPI`, owner | Lainnya |
| `position_change_requests`, `restructuring_requests` | Pengaju; BPH; `ADMIN_SISTEM`; restrukturisasi dibuka ke semua akun ACTIVE setelah `APPROVED` | Anggota lain sebelum `APPROVED` |

`DEVELOPER` dan `SERVICE_ACCOUNT` **tidak punya policy SELECT** pada tabel ORG kecuali lewat `access_grants` `DEVELOPER_TEMP` dengan resource eksplisit (RP-06, ADR-007). Pemegang `ADMIN_SISTEM` demisioner (Q27) melihat tabel ORG untuk pengaturan sistem, tetapi tidak mendapat izin data bisnis modul lain.

---

## 3. State machine

Aturan bersama: transisi hanya lewat `org.transition_<entitas>` (00 §4.1 butir 4). Setiap transisi sah menulis `org_transition_history`, AuditEvent (kode di 5.3), dan outbox (bila ada) dalam satu transaksi. Transisi yang tidak tercantum ditolak `STATE_TRANSITION_INVALID` (409). `lock_version` salah ditolak `CONFLICT_VERSION` (409). Alasan (`p_reason`) wajib untuk semua penolakan, pencabutan, suspend, dan penutupan. "Kewenangan" merujuk permission di bagian 4.

### 3.1 `organization_periods`

| Dari → Ke | Aktor (permission) | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| (baru) → DRAFT | `SEKRETARIS` (`org.period.propose`) | Kode unik | — | — / `ORG_PERIOD_CREATED` |
| DRAFT → REVIEWED | BPH selain pembuat (`org.period.review`) | Nama ID/EN terisi | — | — / `ORG_PERIOD_REVIEWED` |
| REVIEWED → APPROVED | `KETUA_KPI` (`org.period.approve`) | `start_date`, `end_date`, dasar keputusan terisi; tidak tumpang tindih periode lain | — | — / `ORG_PERIOD_APPROVED` |
| APPROVED → ACTIVE | `KETUA_KPI` atau `SEKRETARIS` (`org.period.transition`) | Tidak ada periode lain ACTIVE; `now() >= valid_from` | Periode menjadi konteks default portal | `org.PeriodStatusChanged.v1` / `ORG_PERIOD_ACTIVATED` |
| ACTIVE → CLOSING | `KETUA_KPI` (`org.period.transition`) | Periode penerus minimal APPROVED **atau** alasan tertulis | Memberi tahu HAND (ALUR-F08 langkah 1); data masih bisa ditulis | `org.PeriodStatusChanged.v1` / `ORG_PERIOD_CLOSING_STARTED` |
| CLOSING → CLOSED | `KETUA_KPI` (`org.period.transition`) | Tidak ada assignment ACTIVE yang `valid_until` > akhir periode; status paket HAND dicek lewat `hand.index.ts` bila modul hidup (sebelum itu: konfirmasi tertulis di alasan) | Periode read-only: fungsi transisi semua modul menolak tulis dengan `PERIOD_CLOSED` | `org.PeriodStatusChanged.v1` / `ORG_PERIOD_CLOSED` |
| CLOSED → ARCHIVED | `KETUA_KPI` (`org.period.transition`) | — | Hanya perubahan status; data tetap | `org.PeriodStatusChanged.v1` / `ORG_PERIOD_ARCHIVED` |
| CLOSED (koreksi) | Pengaju BPH + penyetuju `KETUA_KPI` berbeda (`org.period.correct`) | `official_record_no` berita acara wajib (Q14) | Baris `period_corrections` (before/after teredaksi); status periode **tidak berubah** | — / `ORG_PERIOD_CORRECTION_RECORDED` |

Terlarang (dites): CLOSED→ACTIVE; ARCHIVED→apa pun; dua periode ACTIVE (unique index); DRAFT→ACTIVE (lompat); APPROVED tanpa tanggal/keputusan; koreksi tanpa berita acara; koreksi disetujui pengajunya sendiri; tulis data bisnis ke periode CLOSED lewat jalur mana pun (GAC:CORE-04).

### 3.2 `organizational_units` dan `team_mandates`

| Dari → Ke | Aktor | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| → PROPOSED | `SEKRETARIS` atau `ADMIN_SISTEM` (`org.unit.propose`) | Parent sesuai aturan tipe | — | — / `ORG_UNIT_PROPOSED` |
| PROPOSED → REVIEWED | BPH selain pengusul (`org.unit.review`) | — | — | — / `ORG_UNIT_REVIEWED` |
| REVIEWED → APPROVED | `KETUA_KPI` (`org.unit.approve`) | Dasar keputusan terisi; unit `DIVISION`/`SUBUNIT` baru dan restrukturisasi butuh keputusan sidang (`MEMBER_ASSEMBLY`); `TEMP_TEAM` butuh surat pembentukan + mandat + `valid_until` | — | — / `ORG_UNIT_APPROVED` |
| APPROVED → ACTIVE | `KETUA_KPI`/`SEKRETARIS` | Tanggal efektif tercapai | — | `org.OrganizationRestructured.v1` (bila bagian dari restrukturisasi) / `ORG_UNIT_ACTIVATED` |
| ACTIVE → SUPERSEDED | Sistem saat unit pengganti ACTIVE, atau `KETUA_KPI` | Unit pengganti ACTIVE **atau** (tim) mandat berakhir | Assignment ACTIVE di unit itu diakhiri lewat 3.4 (`TEAM_ENDED`/`TRANSFER`); histori tetap | `org.OrganizationRestructured.v1` / `ORG_UNIT_SUPERSEDED` |

Terlarang: DELETE unit (trigger, dok 18 §5); SUPERSEDED→ACTIVE; unit `SUBUNIT` punya kepala/wakil; `TEMP_TEAM` ACTIVE tanpa `valid_until`.

### 3.3 `user_accounts`

| Dari → Ke | Aktor | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| → INVITED | `ADMIN_SISTEM` (`org.account.invite`) | `MEMBER`: anggota punya assignment minimal APPROVED atau status anggota aktif (dok 21 §6 "Anggota resmi ditetapkan"); username/email unik; bukan eksternal | 02-AUTH membuat user Auth + undangan | — / `ORG_ACCOUNT_CREATED` |
| INVITED → ACTIVE | Sistem setelah pengguna selesai set password + (bila wajib) enrol TOTP | Assignment valid ada (dok 21 §6 "Aktivasi") | `activated_at` | `org.UserActivated.v1` / `ORG_ACCOUNT_ACTIVATED` |
| ACTIVE → SUSPENDED | `ADMIN_SISTEM` atau `KETUA_KPI` (`org.account.suspend`) | Alasan wajib | Semua sesi dicabut (`AUTH-E02-T02`); assignment tetap tetapi policy menolak (akun bukan ACTIVE) | `org.AccessRevoked.v1` / `ORG_ACCOUNT_SUSPENDED` |
| SUSPENDED → ACTIVE | Pengaju `ADMIN_SISTEM`, penyetuju `KETUA_KPI` berbeda (`org.account.reactivate`) | Alasan; assignment valid masih ada | — | `org.AccessGranted.v1` / `ORG_ACCOUNT_REACTIVATED` |
| ACTIVE/SUSPENDED → DEACTIVATED | `ADMIN_SISTEM` (`org.account.deactivate`) **atau** sistem saat anggota tidak punya assignment/status aktif | Alasan | Sesi dicabut; `access_revocations` dibuat; event untuk HAND/TASK review pekerjaan (ADMIN-T15) | `org.AccessRevoked.v1` / `ORG_ACCOUNT_DEACTIVATED` |
| DEACTIVATED → ARCHIVED | `ADMIN_SISTEM` (`org.account.archive`) | Tidak ada revocation berstatus < REVOKED | Tidak menghapus histori | — / `ORG_ACCOUNT_ARCHIVED` |
| DEACTIVATED → INVITED (pemulihan akses) | Pengaju `ADMIN_SISTEM` + penyetuju `KETUA_KPI` berbeda | Permintaan resmi + assignment **baru** yang valid (tidak menghidupkan assignment lama, dok 21 §6) | Verifikasi ulang: password + TOTP baru | — / `ORG_ACCOUNT_ACCESS_RESTORED` |

Terlarang: DEACTIVATED→ACTIVE langsung; ARCHIVED→apa pun; akun `DEVELOPER` diberi assignment jabatan; `SERVICE_ACCOUNT` diberi `auth_user_id`; akun untuk `external_participants` (RP-05); login akun non-ACTIVE (D24:AUTH-03, ditegakkan AUTH memakai status ini).

### 3.4 `membership_assignments`

| Dari → Ke | Aktor | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| → PROPOSED | `SEKRETARIS` atau `ADMIN_SISTEM` (`org.assignment.propose`) | Jabatan & unit ACTIVE di periode; rentang ⊆ periode | — | — / `ORG_ASSIGNMENT_PROPOSED` |
| PROPOSED → VERIFIED | Pemegang `org.assignment.verify` (`SEKJEND` atau `SEKRETARIS`) selain pengusul | Dasar keputusan sesuai jenis jabatan: kepala/wakil/koordinator = `BPH_DELIBERATION` oleh Ketua; perpindahan = `MEMBER_ASSEMBLY`; BPH = `OFFICIAL_APPOINTMENT`; tim = `TEAM_DECREE`; anggota = `MEMBER_STATUS` | — | — / `ORG_ASSIGNMENT_VERIFIED` |
| VERIFIED → APPROVED | `KETUA_KPI` (`org.assignment.approve`); bila subjek adalah pemegang `KETUA_KPI` sendiri: `SEKJEND` (usulan, OD-ORG-03) | Penyetuju ≠ pengusul ≠ subjek; exclusion constraint lolos (tidak rangkap, satu pemangku) | — | — / `ORG_ASSIGNMENT_APPROVED` |
| APPROVED → ACTIVE | Sistem (`org.expire_access_system` juga mengaktifkan saat `valid_from` tercapai) atau eksekusi rencana H06 | Akun subjek ACTIVE; untuk penggantian: rencana H06 `READY` | Izin berlaku; assignment yang digantikan diakhiri **di transaksi yang sama** (3.11) | `org.AssignmentChanged.v1` + `org.AccessGranted.v1` / `ORG_ROLE_ASSIGNED` |
| ACTIVE → SUSPENDED | `KETUA_KPI` (`org.assignment.suspend`) | Alasan (investigasi, cuti, risiko; dok 23 §9) | Izin berhenti; sesi tidak wajib dicabut kecuali alasan keamanan | `org.AccessRevoked.v1` / `ORG_ROLE_SUSPENDED` |
| SUSPENDED → ACTIVE | `KETUA_KPI` | `now() < valid_until` | — | `org.AccessGranted.v1` / `ORG_ROLE_RESUMED` |
| ACTIVE/SUSPENDED → EXPIRED | Sistem | `now() >= valid_until` (evaluasi izin sudah menolak sejak detik itu) | `access_revocations` `TERM_END` | `org.AssignmentChanged.v1` + `org.AccessRevoked.v1` / `ORG_ROLE_EXPIRED` |
| ACTIVE/SUSPENDED/APPROVED → REVOKED | `KETUA_KPI` (`org.assignment.revoke`) atau eksekusi penggantian/perpindahan | Alasan + trigger (`REPLACEMENT`, `TRANSFER`, `DISMISSAL`, `SECURITY`); pemberhentian = efektif segera | `ended_at`; `SECURITY`/`DISMISSAL` juga mencabut sesi | `org.AssignmentChanged.v1` + `org.AccessRevoked.v1` / `ORG_ROLE_REVOKED` |
| EXPIRED/REVOKED → ARCHIVED | Sistem atau `ADMIN_SISTEM` | Revocation terkait REVOKED | Histori tetap | — / `ORG_ASSIGNMENT_ARCHIVED` |
| PROPOSED/VERIFIED → REVOKED | Pengusul atau `KETUA_KPI` | Alasan (pembatalan usulan) | — | — / `ORG_ASSIGNMENT_WITHDRAWN` |
| Revisi scope (transisi tercatat) | `KETUA_KPI` | Keputusan resmi | Baris `access_scope_revisions` before/after | `org.AssignmentChanged.v1` / `ORG_SCOPE_CHANGED` |

Terlarang (dites): EXPIRED→ACTIVE (harus assignment baru); ACTIVE tanpa dasar keputusan; rangkap jabatan `OFFICE` pada rentang tumpang tindih (unique/exclusion); dua pemangku satu jabatan; APPROVED oleh pengusul atau subjek; perpanjangan dengan mengubah `valid_until` baris ACTIVE (harus assignment baru + keputusan); assignment di periode CLOSED; aktivasi saat akun subjek bukan ACTIVE.

**Keanggotaan tim kerja dan status Anggota KPI** (`TEAM_ROLE`, `MEMBER_STATUS`) memakai state machine yang sama tetapi tidak terkena exclusion rangkap jabatan (00 §3.1 butir 1; tafsiran wajib dikonfirmasi, OD-ORG-01).

### 3.5 `access_grants` (A09, level 5, Auditor, pengembang)

| Dari → Ke | Aktor | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| → PROPOSED | Pemohon: pengguna untuk dirinya (`org.access_grant.request` scope OWN) atau kepala unit untuk anggota unitnya (scope DIVISION/SUBUNIT/TEAM); `DEVELOPER_TEMP`: owner KPI | Alasan, resource/scope, `valid_from`, `valid_until` wajib; permission diminta ada di katalog (GAC CORE §14) | — | — / `ORG_ACCESS_GRANT_REQUESTED` |
| PROPOSED → VERIFIED | Tingkat 1: kepala unit pemilik resource atau pemilik resource (`org.access_grant.verify`), bukan pemohon/grantee | Pemverifikasi sendiri punya izin yang diminta pada scope itu (tidak memberi melebihi kewenangan, A06) | — | — / `ORG_ACCESS_GRANT_VERIFIED` |
| VERIFIED → APPROVED | Tingkat 2 (`org.access_grant.approve`): `SEKJEND` atau `KETUA_KPI`; `OBJECT_LEVEL5`: `KETUA_KPI` atau `SEKJEND` dengan penyetuju ≠ pemohon ≠ grantee (ADR-008); `FUNCTIONAL_AUDITOR`: `KETUA_KPI`; `DEVELOPER_TEMP`: `KETUA_KPI` atas permintaan tertulis | Verifier ≠ approver | — | — / `ORG_ACCESS_GRANT_APPROVED` |
| APPROVED → ACTIVE | Sistem saat `valid_from` tercapai | Grantee ACTIVE | Izin berlaku | `org.AccessGranted.v1` / `ORG_PERMISSION_GRANTED` |
| ACTIVE → EXPIRED | Sistem | `now() >= valid_until` | — | `org.AccessRevoked.v1` / `ORG_PERMISSION_EXPIRED` |
| ACTIVE/APPROVED → REVOKED | Approver, `KETUA_KPI`, `ADMIN_SISTEM` (hanya alasan keamanan), atau sistem saat klasifikasi resource naik (DOC §32) | Alasan | `DEVELOPER_TEMP`: memicu checklist rotasi secret (ADR-007) | `org.AccessRevoked.v1` / `ORG_PERMISSION_REVOKED` |
| ACTIVE → SUSPENDED → ACTIVE | `KETUA_KPI` | Alasan | — | `org.AccessRevoked.v1` / `org.AccessGranted.v1` |
| PROPOSED/VERIFIED → REVOKED | Pemohon atau pemeriksa | Penolakan beralasan | — | — / `ORG_ACCESS_GRANT_REJECTED` |

Terlarang: grant tanpa `valid_until`; perpanjangan dengan UPDATE (grant baru); temporary jadi permanen (RPM §18); `OBJECT_LEVEL5` disetujui pemohon (sel 00 §6.2: `KETUA_KPI × org.access_grant.approve × grant level 5 yang diajukan KETUA_KPI sendiri = DENY_403`); grant di atas ceiling pemberi; grant `AD`/`AU` lewat `SPECIAL` (hanya lewat admin designation / `FUNCTIONAL_AUDITOR`); grant untuk akun `SERVICE_ACCOUNT` lewat UI.

### 3.6 `delegations`

| Dari → Ke | Aktor | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| → PROPOSED | Delegator (`org.delegation.create`) | Permission ⊆ izin efektif delegator dari **assignment jabatan** (bukan dari delegasi lain: tidak ada delegasi berantai); tidak memuat permission di daftar tidak-boleh-didelegasikan; `valid_until` ≤ `valid_until` assignment sumber | — | — / `ORG_DELEGATION_PROPOSED` |
| PROPOSED → APPROVED | `KETUA_KPI`; bila delegator `KETUA_KPI`: `SEKJEND` (`org.delegation.approve`) | Approver ≠ delegator ≠ delegatee | — | — / `ORG_DELEGATION_APPROVED` |
| APPROVED → ACTIVE | Sistem saat `valid_from` | Delegatee ACTIVE | Izin terbatas berlaku; delegasi **tidak** membuka akses klasifikasi di atas ceiling delegatee tanpa grant (dok 21 §2) | `org.DelegationStarted.v1` / `ORG_DELEGATION_CREATED` |
| ACTIVE → EXPIRED | Sistem | `valid_until` lewat **atau** assignment sumber tidak ACTIVE lagi | — | `org.DelegationEnded.v1` / `ORG_DELEGATION_ENDED` |
| ACTIVE/APPROVED → REVOKED | Delegator, approver, `KETUA_KPI` | Alasan | — | `org.DelegationEnded.v1` / `ORG_DELEGATION_REVOKED` |

Terlarang: delegasi dipakai setelah `valid_until` (RP-04); delegatee memakai permission yang dicabut dari delegator setelah delegasi dibuat (dicek ulang saat evaluasi, SOD-09); delegasi ke diri sendiri; delegasi berantai; delegasi permission `A`, `P`, `D`, `EX`, `AD`, `AU` selama `org.delegation.delegable_actions` `NOT_SET` (5.12, OD-ORG-06); delegasi dipakai untuk aksi yang dilarang SoD (pengaju tetap tidak bisa menyetujui transaksinya lewat delegasi).

### 3.7 `acting_assignments` (Plt.)

| Dari → Ke | Aktor | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| → PROPOSED | `SEKRETARIS` (`org.acting.propose`) | `valid_until` wajib; jabatan yang digantikan ACTIVE | — | — / `ORG_ACTING_PROPOSED` |
| PROPOSED → APPROVED | `KETUA_KPI` (`org.acting.approve`); jabatan yang digantikan `KETUA_KPI`: sidang/BPH, dicatat sebagai dasar keputusan + penyetuju `SEKJEND` (OD-ORG-03) | Dasar keputusan; penyetuju ≠ pengusul ≠ acting; `permission_ids` null (penuh) hanya bila dicentang eksplisit | — | — / `ORG_ACTING_APPROVED` |
| APPROVED → ACTIVE | Sistem saat `valid_from` | Akun acting ACTIVE | Izin jabatan yang digantikan (atau subset) berlaku **ditambah** izin jabatannya sendiri; SoD dievaluasi terhadap gabungan identitas | `org.ActingStarted.v1` / `ORG_ACTING_STARTED` |
| ACTIVE → ENDED | Sistem saat `valid_until`, atau `KETUA_KPI` lebih awal, atau otomatis saat pemangku asli kembali ACTIVE | Alasan bila lebih awal | — | `org.ActingEnded.v1` / `ORG_ACTING_ENDED` |

Terlarang: ACTIVE tanpa tanggal akhir; dua acting untuk satu jabatan pada rentang tumpang tindih; Wakil Ketua/Wakil Kepala otomatis menjadi acting tanpa record (00 §3.2 "acting eksplisit, tidak otomatis"); acting memakai izin setelah ENDED.

### 3.8 `emergency_access_grants` (break-glass, A10)

| Dari → Ke | Aktor | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| → REQUESTED | `KETUA_KPI` atau `SEKJEND` (`org.emergency.request`), AAL2 | Alasan, target (resource atau scope), permission, durasi ≤ `org.emergency_access.max_duration`; fitur nonaktif di production bila key `NOT_SET` | Notifikasi segera ke calon approver | `org.EmergencyAccessRequested.v1` / `ORG_BREAK_GLASS_REQUESTED` (prioritas tinggi) |
| REQUESTED → APPROVED | Pejabat lain di pasangan `KETUA_KPI`/`SEKJEND` (`org.emergency.approve`), AAL2; jalur cadangan = `org.emergency_access.backup_approvers` (`NOT_SET` → tidak ada jalur cadangan; permintaan menunggu) | Approver ≠ requester ≠ grantee | — | — / `ORG_BREAK_GLASS_APPROVED` |
| APPROVED → ACTIVE | Sistem langsung setelah APPROVED | — | Banner + hitung mundur untuk grantee; indikator untuk `KETUA_KPI`, `SEKJEND`, `ADMIN_SISTEM`, Auditor; setiap aksi grantee dengan sumber izin `EMERGENCY` diaudit prioritas tinggi. **Tidak** melewati AAL2 dan step-up PIN | `org.EmergencyAccessActivated.v1` / `ORG_BREAK_GLASS_ACTIVATED` |
| ACTIVE → EXPIRED | Sistem | `valid_until` lewat (policy menolak sejak detik itu) | Tugas post-review dibuat | `org.EmergencyAccessEnded.v1` / `ORG_BREAK_GLASS_EXPIRED` |
| ACTIVE → REVOKED | Requester, approver, `KETUA_KPI`, `SEKJEND` | Alasan (insiden selesai) | Tugas post-review dibuat | `org.EmergencyAccessEnded.v1` / `ORG_BREAK_GLASS_REVOKED` |
| EXPIRED/REVOKED → POST_REVIEWED | Reviewer (`org.emergency.post_review`): `KETUA_KPI` atau Auditor fungsional, bukan grantee | Catatan review wajib | — | — / `ORG_BREAK_GLASS_POST_REVIEWED` |
| REQUESTED → REVOKED | Requester atau approver | Penolakan beralasan | — | — / `ORG_BREAK_GLASS_REJECTED` |

Terlarang: ACTIVE tanpa approver/alasan/expiry (PERM-08, RP-11); approve oleh requester; perpanjangan (buat permintaan baru); tombol "bypass langsung" (02-PETA-LAYAR A10); POST_REVIEWED oleh grantee; akses darurat untuk `DEVELOPER` (pakai `DEVELOPER_TEMP`).

### 3.9 `admin_designations` (Q03, Q27, RP-08, RP-09, PERM-05)

| Dari → Ke | Aktor | Syarat | Efek | Event / Audit |
|---|---|---|---|---|
| → PROPOSED (`OFFICE_HOLDER_Q03`) | `ADMIN_SISTEM` aktif, atau seed awal lewat migrasi + berita acara (bootstrap, 5.9) | Subjek punya assignment ACTIVE `KETUA_KPI` atau `SEKRETARIS` | — | — / `ORG_ADMIN_DESIGNATION_PROPOSED` |
| → PROPOSED (`DEMISIONER_*`) | `SEKRETARIS` atau `ADMIN_SISTEM` | Subjek pernah memegang `KETUA_KPI`/`SEKRETARIS` di periode yang CLOSING/CLOSED | — | — / sama |
| PROPOSED → IN_ASSEMBLY | Pengusul | Hanya untuk `DEMISIONER_*` | Menunggu sidang anggota | — / `ORG_ADMIN_DESIGNATION_IN_ASSEMBLY` |
| IN_ASSEMBLY → APPROVED | `KETUA_KPI` atau pejabat pencatat sidang (`org.admin_designation.approve`) | Keputusan sidang terisi | — | — / `ORG_ADMIN_DESIGNATION_APPROVED` |
| PROPOSED → APPROVED (`OFFICE_HOLDER_Q03`) | Admin aktif lain (maker-checker), bukan subjek | — | — | — / sama |
| APPROVED → ACTIVE | Sistem | `DEMISIONER_*`: **tidak ada** designation `OFFICE_HOLDER_Q03` ACTIVE di periode aktif (RP-08); `OFFICE_HOLDER_Q03`: akun subjek pernah login AAL2 (`first_aal2_at` terisi) | Izin `ADMIN_SISTEM` scope `SYSTEM` saja. `DEMISIONER_*` tidak memberi izin data bisnis apa pun (Q27). **Saat `OFFICE_HOLDER_Q03` menjadi ACTIVE, semua `DEMISIONER_*` ACTIVE di-REVOKE di transaksi yang sama** (RP-09, dok 21 §18) | `org.AdminDesignationChanged.v1` + `org.AccessGranted.v1` / `ORG_ADMIN_GRANTED` |
| ACTIVE → REVOKED | Sistem (admin baru, assignment jabatan berakhir) atau `KETUA_KPI` | Alasan (`ADMIN_TRANSFER`, `TERM_END`, `SECURITY`) | Sesi dicabut bila alasan keamanan | `org.AdminDesignationChanged.v1` + `org.AccessRevoked.v1` / `ORG_ADMIN_REVOKED` |

Terlarang: demisioner ACTIVE tanpa keputusan sidang; demisioner ACTIVE setelah admin baru ACTIVE; admin menyetujui designation dirinya; `ADMIN_SISTEM` membuka isi dokumen/kasus/keuangan karena peran admin (dok 18 §7, RPM §13); `OFFICE_HOLDER_Q03` tetap ACTIVE setelah assignment jabatannya berakhir.

### 3.10 `access_revocations`

| Dari → Ke | Aktor | Syarat | Efek | Audit |
|---|---|---|---|---|
| → TRIGGERED | Sistem (kedaluwarsa, deaktivasi, penggantian) atau `ADMIN_SISTEM`/`SEKRETARIS` (`org.revocation.trigger`) | Trigger + related record | Izin sudah ditolak policy sejak `planned_effective_at` | `ORG_REVOCATION_TRIGGERED` |
| TRIGGERED → REVIEWED | `ADMIN_SISTEM` atau `SEKRETARIS` (`org.revocation.review`) | Cek: sesi dicabut, grant/delegasi/acting turunan berakhir, pekerjaan diteruskan ke HAND | — | `ORG_REVOCATION_REVIEWED` |
| REVIEWED → REVOKED | Sistem atau reviewer | Semua sumber izin subjek terkait berstatus akhir | — | `ORG_ACCESS_REVOKED` |
| TRIGGERED → REVOKED | Sistem, trigger `SECURITY`/`DISMISSAL` | Efektif segera; review menyusul (00 §4.2) | Sesi dicabut | `ORG_ACCESS_REVOKED` |
| REVOKED → ARCHIVED | Sistem | — | — | `ORG_REVOCATION_ARCHIVED` |

Terlarang: REVOKED yang menghidupkan kembali akses; review menunda pencabutan (pencabutan tidak menunggu review, hanya dokumentasinya).

### 3.11 Penggantian dan peralihan akses (H06, ALUR-F11)

Aturan urutan (merekonsiliasi dok 23 §10 "cabut akses lama sebelum mengaktifkan akses baru" untuk **perpindahan orang yang sama** dan H06/dok 21 §18 "akses lama dicabut setelah akses baru terbukti aktif" untuk **penggantian orang berbeda**):

1. **Perpindahan orang yang sama** (divisi/jabatan): butuh `position_change_requests` EFFECTIVE (keputusan sidang). Dalam **satu transaksi** pada `effective_at`: assignment lama → REVOKED (`TRANSFER`, `valid_until = effective_at`), lalu assignment baru → ACTIVE (`valid_from = effective_at`). Tidak ada detik ketika dua jabatan aktif (exclusion constraint) dan izin lama tidak terbawa (dok 23 §2 "No privilege inheritance").
2. **Penggantian orang berbeda**: rencana `access_transition_plans`. `READY` hanya bila (a) assignment masuk APPROVED, (b) akun penerima ACTIVE, (c) `first_aal2_at` terisi (terbukti bisa masuk dengan MFA). Pada `effective_at`, dalam satu transaksi: assignment keluar → REVOKED (`REPLACEMENT`), assignment masuk → ACTIVE, plan → EXECUTED.
3. **Bila penerima belum siap** saat masa jabatan lama berakhir: assignment lama tetap EXPIRED pada `valid_until` (dok 21 §18: akses dicabut walau pekerjaan belum selesai), plan → BLOCKED dengan peringatan kritis di H06 dan notifikasi ke `SEKRETARIS`, `KETUA_KPI`. Tidak ada perpanjangan otomatis. Masa tenggang = `org.assignment.grace_period` (`NOT_SET` → nol).
4. Pekerjaan berjalan pindah lewat HAND (H05). ORG hanya memancarkan `org.AssignmentChanged.v1`.
5. Penggantian admin mengikuti 3.9 (admin baru ACTIVE dulu, lalu demisioner dicabut di transaksi yang sama).

Status `access_transition_plans`: `DRAFT → READY → EXECUTED`; `DRAFT/READY → BLOCKED → READY`; `DRAFT/READY/BLOCKED → CANCELLED`. Terlarang: `EXECUTED` tanpa `READY`; eksekusi dua kali (idempotency + `FOR UPDATE`).

### 3.12 `position_change_requests` dan `restructuring_requests`

- `position_change_requests`: `SUBMITTED` (anggota/`SEKRETARIS`) → `REVIEWED` (`SEKRETARIS`) → `IN_ASSEMBLY` → `APPROVED`/`REJECTED` (pencatat keputusan sidang, `KETUA_KPI`) → `EFFECTIVE` (sistem saat `effective_at`, menjalankan 3.11 butir 1). Terlarang: `EFFECTIVE` tanpa keputusan sidang; `REJECTED` tanpa alasan. Audit `ORG_POSITION_CHANGE_*`.
- `restructuring_requests`: `PROPOSED` → `CONSULTED` → `IN_ASSEMBLY` → `APPROVED` → `EFFECTIVE`. `EFFECTIVE` membuat unit baru (3.2) dan menandai unit lama `SUPERSEDED` dalam satu transaksi, lalu memancarkan `org.OrganizationRestructured.v1`. Terlarang: `EFFECTIVE` tanpa `IN_ASSEMBLY`. Prioritas P2 (bagian 9); sebelum itu restrukturisasi dijalankan lewat migrasi data + berita acara.

