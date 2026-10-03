import assert from "node:assert/strict";
import test from "node:test";
import { hasHostedPermission, parseHostedAccess, type HostedAccess } from "../src/platform/authorization/hosted-access";

const access: HostedAccess = { accountId: "00000000-0000-4000-8000-000000000001", authUserId: "00000000-0000-4000-8000-000000000002", email: "member@example.org", name: "Member", roles: ["ADMIN_SISTEM"], memberships: [{ organizationCode: "KPI", periodCode: "PERIODE", divisionCode: "IOD", position: "OIC" }], grants: [{ permission: "TASK_READ", organizationCode: "KPI", periodCode: "PERIODE", divisionCode: "IOD", objectId: null, expiresAt: "2050-01-01T00:00:00Z" }] };

test("hosted context cannot substitute another authenticated user or email", () => {
  assert.ok(parseHostedAccess(access, access.authUserId, access.email));
  assert.equal(parseHostedAccess(access, access.accountId, access.email), null);
  assert.equal(parseHostedAccess(access, access.authUserId, "other@example.org"), null);
  assert.equal(parseHostedAccess({ ...access, roles: [] }, access.authUserId, access.email), null);
});

test("hosted permissions require exact organization, period, division and an explicit grant", () => {
  const scope = { organizationCode: "KPI", periodCode: "PERIODE", divisionCode: "IOD" };
  assert.equal(hasHostedPermission(access, "TASK_READ", scope), true);
  for (const wrong of [{}, { ...scope, organizationCode: "OTHER" }, { ...scope, periodCode: "OLD" }, { ...scope, divisionCode: "RAD" }, { organizationCode: "KPI", periodCode: "PERIODE" }]) assert.equal(hasHostedPermission(access, "TASK_READ", wrong), false);
  assert.equal(hasHostedPermission(access, "FINANCE_READ", scope), false);
  assert.equal(hasHostedPermission({ ...access, memberships: [] }, "TASK_READ", scope), false);
});

test("expired and object-restricted grants cannot become unrestricted permissions", () => {
  const scope = { organizationCode: "KPI", periodCode: "PERIODE", divisionCode: "IOD" };
  const objectId = "00000000-0000-4000-8000-000000000003";
  const restricted = { ...access, grants: [{ ...access.grants[0], objectId }] };
  assert.equal(hasHostedPermission(restricted, "TASK_READ", scope), false);
  assert.equal(hasHostedPermission(restricted, "TASK_READ", { ...scope, objectId }), true);
  const expired = { ...access, grants: [{ ...access.grants[0], expiresAt: "2026-01-01T00:00:00Z" }] };
  assert.equal(hasHostedPermission(expired, "TASK_READ", scope, Date.parse("2026-01-01T00:00:00Z")), false);
});
