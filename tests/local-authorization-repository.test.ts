import assert from "node:assert/strict";
import test from "node:test";
import { LocalRecordDatabase, PersistentRecords } from "@/platform/data/local-record-store";
import { LocalAuthorizationRepository } from "@/platform/authorization/local-authorization-repository";

const admin = { accountId: "00000000-0000-4000-8000-000000000101", email: "admin.test@kpi.local", name: "Admin", roles: ["ADMIN_SISTEM", "PENGURUS"] as const };
const pengurus = { accountId: "00000000-0000-4000-8000-000000000102", email: "pengurus.test@kpi.local", name: "Pengurus", roles: ["PENGURUS"] as const };
const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

test("persistent grants honour scope, expiry and deactivation", () => {
  const database = new LocalRecordDatabase(":memory:");
  try {
    const repository = new LocalAuthorizationRepository(database);
    assert.equal(repository.has(pengurus, "TASK_SUBMIT", scope), true);
    assert.equal(repository.has(pengurus, "TASK_SUBMIT", { ...scope, objectId: "00000000-0000-4000-8000-000000003001" }), true);
    const objectGrant = repository.create({ accountId: pengurus.accountId, permission: "TASK_REVIEW", ...scope, objectId: "00000000-0000-4000-8000-000000003001", active: true, createdByAccountId: admin.accountId });
    assert.equal(repository.has(pengurus, "TASK_REVIEW", { ...scope, objectId: objectGrant.objectId }), true);
    assert.equal(repository.has(pengurus, "TASK_REVIEW", scope), false);
    assert.equal(repository.setActive(objectGrant.id, false)?.active, false);
    assert.equal(repository.has(pengurus, "TASK_REVIEW", { ...scope, objectId: objectGrant.objectId }), false);
    const expired = repository.create({ accountId: pengurus.accountId, permission: "TASK_REVIEW", ...scope, active: true, expiresAt: "2020-01-01T00:00:00.000Z", createdByAccountId: admin.accountId });
    assert.equal(repository.has(pengurus, "TASK_REVIEW", scope), false);
    assert.ok(expired.id);
  } finally { database.close(); }
});

test("disabling a seeded grant survives repository reopen without a replacement grant", () => {
  const database = new LocalRecordDatabase(":memory:");
  try {
    const first = new LocalAuthorizationRepository(database);
    const grant = first.list(pengurus.accountId).find((item) => item.permission === "TASK_SUBMIT")!;
    assert.equal(first.setActive(grant.id, false)?.active, false);
    assert.equal(first.listAudit(grant.id).at(-1)?.action, "GRANT_DISABLED");
    const reopened = new LocalAuthorizationRepository(database);
    assert.equal(reopened.has(pengurus, "TASK_SUBMIT", scope), false);
    assert.equal(reopened.list(pengurus.accountId).filter((item) => item.permission === "TASK_SUBMIT").length, 1);
  } finally { database.close(); }
});

test("old random seed grants are deactivated when stable grants are installed", () => {
  const database = new LocalRecordDatabase(":memory:");
  try {
    const legacyId = "00000000-0000-4000-8000-000000009999";
    const legacy = new PersistentRecords(database, "authorization-grants", []);
    legacy.set(legacyId, { id: legacyId, accountId: pengurus.accountId, permission: "TASK_SUBMIT", ...scope, active: true, createdByAccountId: admin.accountId, createdAt: "2026-09-22T08:00:00.000Z" });
    const repository = new LocalAuthorizationRepository(database);
    assert.equal(repository.list(pengurus.accountId).find((item) => item.id === legacyId)?.active, false);
    const stable = repository.list(pengurus.accountId).find((item) => item.permission === "TASK_SUBMIT" && item.id !== legacyId)!;
    repository.setActive(stable.id, false);
    assert.equal(new LocalAuthorizationRepository(database).has(pengurus, "TASK_SUBMIT", scope), false);
  } finally { database.close(); }
});
