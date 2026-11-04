import assert from "node:assert/strict";
import test from "node:test";
import { readdir } from "node:fs/promises";
import { createHostedDatabase, hostedFixture as f, loginHostedFixture } from "./fixtures/hosted-database";
import { meetingActionSchema } from "../src/platform/work/hosted-meeting-contract";
import type { PGlite } from "@electric-sql/pglite";

// Runs on the full migration set, unlike the older module tests, so the rules decided on 4 November 2026 are covered with the SOP in force.
async function database(): Promise<PGlite> {
  const names = (await readdir(new URL("../supabase/migrations/", import.meta.url))).filter(n => /^2026100200(0[3-9]|1[0-9]|2[0-3])00|^2026100300|^20261005003100|^20261006003[23]00|^202611/.test(n)).sort();
  return createHostedDatabase(names.map(n => `migrations/${n}`), []);
}
const { owner, reviewer, stranger, organization, period } = f;
const soon = () => new Date(Date.now() - 1000).toISOString();
const later = () => new Date(Date.now() + 3600000).toISOString();
type R = { id: string; version: number; status: string; events: { action: string; note: string }[] };
async function value<T>(db: PGlite, query: string, params: unknown[] = []): Promise<T> { return (await db.query<{ v: T }>(`select ${query} as v`, params)).rows[0].v; }
const create = (db: PGlite, input: object, kind = "ACCESS") => value<R>(db, "public.kpi_governance_create($1,$2,$3)", [kind, JSON.stringify({ organizationId: organization, periodId: period, classification: "INTERNAL", ...input }), crypto.randomUUID()]);
const act = (db: PGlite, r: R, action: string, input: object = {}) => value<R>(db, "public.kpi_governance_action($1,$2,$3,$4)", [r.id, r.version, action, JSON.stringify(input)]);
const access = (extra: object = {}) => ({ formReference: "F01-1", requestType: "GRANT", permissions: ["MEETING_READ"], purpose: "Koordinasi", informationScope: "Rapat", mandateReference: "SK Tugas", startsAt: soon(), expiresAt: later(), ...extra });
const decide = (authority: string, extra: object = {}) => ({ authorityId: authority, outcome: "APPROVED", approvedPermissions: ["MEETING_READ"], reference: "Keputusan", needFinding: "Perlu", note: "Disetujui", ...extra });
async function mandate(db: PGlite, account: string, permissions: string[], classifications = ["INTERNAL", "TERBATAS", "RAHASIA"]): Promise<string> {
  await db.exec("reset role;");
  return (await db.query<{ id: string }>("insert into governance.access_authorities(account_id,organization_id,period_id,classifications,permissions,mandate_reference,starts_at,expires_at) values($1,$2,$3,$4,$5,'SK mandat',now()-interval '1 hour',now()+interval '1 day') returning id", [account, organization, period, classifications, permissions])).rows[0].id;
}
async function admin(db: PGlite, account: string, superAdmin = false): Promise<void> {
  await db.exec(`reset role;insert into identity.roles(code,name) values('ADMIN_SISTEM','Admin') on conflict do nothing;insert into identity.account_roles(account_id,role_id) select '${account}',id from identity.roles where code='ADMIN_SISTEM';insert into identity.system_administrators(account_id,approved_reason) values('${account}','Fixture approval');`);
  if (superAdmin) await db.exec(`insert into identity.super_administrators(account_id,organization_id,approved_reference) values('${account}','${organization}','Fixture approval');`);
}
async function grant(db: PGlite, recipient: string, approver: string, permissions: string[], classification = "INTERNAL", objectId: string | null = null): Promise<void> {
  const authority = await mandate(db, approver, permissions);
  const implementer = recipient === stranger ? owner : stranger;
  await admin(db, implementer).catch(() => undefined);
  await loginHostedFixture(db, recipient);
  let r = await create(db, access({ permissions, classification, objectId }));
  await loginHostedFixture(db, approver);
  if (classification === "RAHASIA") { await db.exec("reset role;"); await db.query("update governance.access_authorities set permissions=permissions||'{SOP_SECRET_APPROVE}' where id=$1", [authority]); await loginHostedFixture(db, approver); }
  r = await act(db, r, "DECIDE", decide(authority, { approvedPermissions: permissions }));
  await loginHostedFixture(db, implementer);
  await act(db, r, "IMPLEMENT", { reference: "Pelaksanaan" });
  await db.exec("reset role;");
}
const canRead = (db: PGlite, id: string) => value<unknown>(db, "public.kpi_meeting_detail($1)", [id]).then(() => true, () => false);

test("RSVP and votes need no note; managing a meeting still does", () => {
  assert.equal(meetingActionSchema.safeParse({ action: "RSVP", expectedVersion: 1, note: "", response: "HADIR" }).success, true);
  assert.equal(meetingActionSchema.safeParse({ action: "VOTE", expectedVersion: 1, motionId: owner, choice: "SETUJU" }).success, true);
  assert.equal(meetingActionSchema.safeParse({ action: "RSVP", expectedVersion: 1, note: "ok", response: "HADIR" }).success, false);
  assert.equal(meetingActionSchema.safeParse({ action: "ARCHIVE", expectedVersion: 1, note: "" }).success, false);
});

test("periods: saving plans only; one running period; a super admin activates with a decision", async () => {
  const db = await database();
  try {
    await admin(db, owner, true); await admin(db, reviewer);
    await loginHostedFixture(db, owner);
    const dir = await value<{ periods: { id: string; code: string; status: string }[] }>(db, "public.kpi_admin_setup('KPI','KPI','NEXT',current_date-1,current_date+30)");
    const next = dir.periods.find(p => p.code === "NEXT");
    assert.equal(next?.status, "PLANNED");
    assert.equal((await value<{ unchanged?: boolean }>(db, "public.kpi_admin_setup('KPI','KPI','NEXT',current_date-1,current_date+30)")).unchanged, true);
    await assert.rejects(value(db, "public.kpi_admin_period_action($1,'ACTIVATE','Keputusan 1')", [next?.id]), /Another period/);
    await assert.rejects(value(db, "public.kpi_admin_period_action($1,'CLOSE','x')", [period]), /reference required/);
    await value(db, "public.kpi_admin_period_action($1,'CLOSE','Keputusan tutup')", [period]);
    await loginHostedFixture(db, reviewer);
    await assert.rejects(value(db, "public.kpi_admin_period_action($1,'ACTIVATE','Keputusan 1')", [next?.id]), /Access denied/);
    await loginHostedFixture(db, owner);
    const after = await value<{ periods: { code: string; status: string }[] }>(db, "public.kpi_admin_period_action($1,'ACTIVATE','Keputusan 1')", [next?.id]);
    assert.equal(after.periods.find(p => p.code === "NEXT")?.status, "ACTIVE");
    await db.exec("reset role;");
    await assert.rejects(db.query("update org.periods set status='ACTIVE' where id=$1", [period]), /periods_one_running/);
    assert.equal((await db.query("select 1 from audit.audit_events where action='OFFICIAL_PERIOD_ACTIVATED'")).rows.length, 1);
  } finally { await db.close(); }
});

test("F01: requests fail early, secrets need the special mandate, requests can be withdrawn or cancelled", async () => {
  const db = await database();
  try {
    const authority = await mandate(db, reviewer, ["MEETING_READ", "TASK_READ"]);
    await admin(db, stranger);
    await db.exec(`reset role;insert into org.assignments(account_id,position_id,period_id,starts_on) select '${stranger}',id,'${period}',current_date-1 from org.positions;`);
    const asset = (await db.query<{ id: string }>("insert into files.managed_assets(organization_id,period_id,owner_account_id,original_name,mime_type,size_bytes,sha256,object_path,request_key,status) values($1,$2,$3,'a.pdf','application/pdf',100,$4,'p',gen_random_uuid(),'AVAILABLE') returning id", [organization, period, reviewer, "a".repeat(64)])).rows[0].id;
    await loginHostedFixture(db, owner);
    await assert.rejects(create(db, access({ classification: "RAHASIA" })), /identified information object/);
    await assert.rejects(create(db, access({ startsAt: new Date(Date.now() - 30 * 86400000).toISOString() })), /within the assignment/);
    let secret = await create(db, access({ classification: "RAHASIA", objectId: asset }));
    await loginHostedFixture(db, reviewer);
    await assert.rejects(act(db, secret, "DECIDE", decide(authority)), /Secret approval mandate/);
    secret = await act(db, secret, "DECIDE", decide(authority, { outcome: "DENIED", approvedPermissions: [], note: "Tidak perlu" }));
    assert.equal(secret.status, "DENIED");
    assert.match(secret.events.at(-1)?.note ?? "", /^Hasil: ditolak\./);

    await loginHostedFixture(db, owner);
    let pending = await create(db, access({ formReference: "F01-2" }));
    await loginHostedFixture(db, reviewer);
    await assert.rejects(act(db, pending, "WITHDRAW"), /Only the requester/);
    await loginHostedFixture(db, owner);
    pending = await act(db, pending, "WITHDRAW");
    assert.equal(pending.status, "CLOSED");

    let approved = await create(db, access({ formReference: "F01-3" }));
    await loginHostedFixture(db, reviewer);
    approved = await act(db, approved, "DECIDE", decide(authority));
    assert.match(approved.events.at(-1)?.note ?? "", /^Hasil: disetujui\./);
    await loginHostedFixture(db, stranger);
    approved = await act(db, approved, "CANCEL", { reference: "Batal", note: "Salah tanggal" });
    assert.equal(approved.status, "CLOSED");
    await db.exec("reset role;");
    assert.equal((await db.query("select 1 from governance.access_decisions where revoked_at is null")).rows.length, 0);
  } finally { await db.close(); }
});

test("F01: a mandate holder revokes someone else's access, even after the approver's mandate ends", async () => {
  const db = await database();
  try {
    const authority = await mandate(db, reviewer, ["MEETING_READ", "SOP_ACCESS_REVIEW"]);
    await admin(db, stranger);
    await db.exec(`reset role;insert into org.assignments(account_id,position_id,period_id,starts_on) select '${stranger}',id,'${period}',current_date-1 from org.positions;`);
    await loginHostedFixture(db, owner);
    let request = await create(db, access());
    await loginHostedFixture(db, reviewer);
    request = await act(db, request, "DECIDE", decide(authority));
    await loginHostedFixture(db, stranger);
    await act(db, request, "IMPLEMENT", { reference: "Pelaksanaan" });
    await db.exec("reset role;");
    const decision = (await db.query<{ id: string }>("select id from governance.access_decisions")).rows[0].id;
    const second = await mandate(db, stranger, ["MEETING_READ"]);
    const has = async () => { await loginHostedFixture(db, owner); return value<boolean>(db, "(select count(*)>0 from jsonb_array_elements(public.kpi_access_context()->'grants'))"); };
    assert.equal(await has(), true);

    await loginHostedFixture(db, reviewer);
    let revoke = await create(db, access({ formReference: "F01-R", requestType: "REVOKE", targetDecisionId: decision }));
    assert.equal(revoke.status, "SUBMITTED");
    await assert.rejects(act(db, revoke, "DECIDE", decide(authority)), /Independent decision/);
    await loginHostedFixture(db, stranger);
    revoke = await act(db, revoke, "DECIDE", decide(second));
    assert.equal(revoke.status, "APPROVED");
    await db.exec(`reset role;update governance.access_authorities set revoked_at=now() where id='${second}';`);
    await admin(db, owner);
    await loginHostedFixture(db, owner);
    revoke = await act(db, revoke, "IMPLEMENT", { reference: "Pencabutan" });
    assert.equal(revoke.status, "IMPLEMENTED");
    assert.equal(await has(), false);

    await loginHostedFixture(db, stranger);
    await assert.rejects(create(db, access({ formReference: "F01-Y", requestType: "REVOKE", targetDecisionId: crypto.randomUUID() })), /Decision not owned/);
  } finally { await db.close(); }
});

test("conflicts: self-declared, ended only by someone else with review authority", async () => {
  const db = await database();
  try {
    await mandate(db, reviewer, ["SOP_ACCESS_REVIEW"]);
    await loginHostedFixture(db, owner);
    const id = await value<string>(db, "public.kpi_conflict_action('DECLARE',$1)", [JSON.stringify({ organizationId: organization, periodId: period, reference: "Keluarga pemohon" })]);
    await assert.rejects(value(db, "public.kpi_conflict_action('DECLARE',$1)", [JSON.stringify({ organizationId: organization, periodId: period, accountId: reviewer, reference: "Bukan haknya" })]), /declaration denied/);
    assert.equal((await value<{ conflicts: unknown[] }>(db, "public.kpi_governance_context()")).conflicts.length, 1);
    await assert.rejects(value(db, "public.kpi_conflict_action('END',$1)", [JSON.stringify({ id, reference: "Selesai" })]), /Independent conflict/);
    await loginHostedFixture(db, reviewer);
    await value(db, "public.kpi_conflict_action('END',$1)", [JSON.stringify({ id, reference: "Selesai" })]);
    await loginHostedFixture(db, owner);
    assert.equal((await value<{ conflicts: unknown[] }>(db, "public.kpi_governance_context()")).conflicts.length, 0);
  } finally { await db.close(); }
});

test("meetings: internal opens to permission or invitation; restricted needs both", async () => {
  const db = await database();
  try {
    await grant(db, owner, reviewer, ["MEETING_READ", "MEETING_MANAGE"], "TERBATAS");
    await db.exec(`reset role;insert into org.assignments(account_id,position_id,period_id,starts_on) select '${stranger}',id,'${period}',current_date-1 from org.positions;`);
    await grant(db, stranger, reviewer, ["MEETING_READ"], "TERBATAS");
    await loginHostedFixture(db, owner);
    const meeting = (classification: string, participants: string[]) => value<{ id: string; version: number; classification: string }>(db, "public.kpi_meeting_create('KPI','CURRENT',$1)", [JSON.stringify({ title: "Rapat", agenda: "Agenda", startsAt: later(), participantAccountIds: participants, idempotencyKey: crypto.randomUUID(), classification })]);
    const internal = await meeting("INTERNAL", [reviewer]);
    const restricted = await meeting("TERBATAS", [reviewer]);
    assert.equal(restricted.classification, "TERBATAS");

    // Invited without any grant: internal opens and RSVP works without a note; restricted stays closed.
    await db.exec(`reset role;delete from identity.permission_grants where account_id='${reviewer}';`);
    await loginHostedFixture(db, reviewer);
    assert.equal(await canRead(db, internal.id), true);
    assert.equal(await canRead(db, restricted.id), false);
    assert.deepEqual((await value<{ id: string }[]>(db, "public.kpi_meetings_list('KPI','CURRENT')")).map(m => m.id), [internal.id]);
    const rsvp = await value<{ events: { note: string }[] }>(db, "public.kpi_meeting_action($1,$2,'RSVP',$3)", [internal.id, internal.version, JSON.stringify({ response: "HADIR" })]);
    assert.equal(rsvp.events.at(-1)?.note, "Konfirmasi kehadiran.");
    await assert.rejects(value(db, "public.kpi_meeting_action($1,$2,'ARCHIVE',$3)", [internal.id, 2, JSON.stringify({ note: "Coba" })]), /Access denied/);

    // Holding the permission without an invitation: internal opens; restricted does not, for all the grant's rank.
    await loginHostedFixture(db, stranger);
    assert.equal(await canRead(db, internal.id), true);
    assert.equal(await canRead(db, restricted.id), false);

    // The creator keeps their meeting.
    await loginHostedFixture(db, owner);
    assert.equal(await canRead(db, restricted.id), true);
    await value(db, "public.kpi_meeting_action($1,$2,'SAVE_MINUTES',$3)", [restricted.id, restricted.version, JSON.stringify({ note: "Catatan", summary: "Isi notulen" })]);
  } finally { await db.close(); }
});

test("documents: the uploader chooses the class and keeps sight of the file; others follow the class", async () => {
  const db = await database();
  try {
    await grant(db, owner, reviewer, ["ASSET_READ", "ASSET_UPLOAD"], "INTERNAL");
    await db.exec(`reset role;insert into org.assignments(account_id,position_id,period_id,starts_on) select '${stranger}',id,'${period}',current_date-1 from org.positions;`);
    await grant(db, stranger, reviewer, ["ASSET_READ"], "INTERNAL");
    const upload = (classification?: string, previousAssetId?: string) => value<{ id: string; classification: string }>(db, "public.kpi_asset_register('KPI','CURRENT',$1)", [JSON.stringify({ name: "a.pdf", mimeType: "application/pdf", sizeBytes: 10, sha256: crypto.randomUUID().replaceAll("-", "").padEnd(64, "0"), idempotencyKey: crypto.randomUUID(), classification, previousAssetId })]);
    const classOf = async (id: string) => { await db.exec("reset role;"); const c = (await db.query<{ classification: string }>("select classification from governance.information_resources where id=$1", [id])).rows[0].classification; return c; };
    const list = () => value<{ id: string }[]>(db, "public.kpi_assets_list('KPI','CURRENT')");
    await loginHostedFixture(db, owner);
    const open = await upload("INTERNAL");
    const secret = await upload("RAHASIA");
    const unmarked = await upload();
    await assert.rejects(upload("TERBUKA"), /Invalid classification/);
    assert.equal(await classOf(open.id), "INTERNAL");
    assert.equal(await classOf(secret.id), "RAHASIA");
    assert.equal(await classOf(unmarked.id), "RAHASIA");
    await loginHostedFixture(db, owner);
    assert.equal((await list()).length, 3);
    const version = await upload(undefined, secret.id);
    assert.equal(await classOf(version.id), "RAHASIA");

    await loginHostedFixture(db, stranger);
    assert.deepEqual((await list()).map(a => a.id), [open.id]);
    await assert.rejects(value(db, "public.kpi_asset_versions($1)", [secret.id]), /Access denied/);
    await assert.rejects(value(db, "public.kpi_asset_download($1)", [open.id]), /Access denied/);

    await db.exec(`reset role;update files.managed_assets set status='AVAILABLE' where id='${secret.id}';`);
    await loginHostedFixture(db, owner);
    assert.ok(await value(db, "public.kpi_asset_download($1)", [secret.id]));
  } finally { await db.close(); }
});
