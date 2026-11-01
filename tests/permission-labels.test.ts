import assert from "node:assert/strict";
import test from "node:test";
import type { HostedAccess } from "../src/platform/authorization/hosted-access";
import { isReadOnlyScope, scopeLabel } from "../src/platform/authorization/hosted-scopes";
import { permissions } from "../src/platform/authorization/permission-catalog";
import { permissionLabel, permissionLabels } from "../src/platform/authorization/permission-labels";

test("every permission in the catalog has an Indonesian label", () => {
  assert.deepEqual(permissions.filter(code => !permissionLabels[code]), []);
  assert.equal(permissionLabel("ASSET_READ"), "Melihat dokumen");
  assert.equal(permissionLabel("KODE_BARU"), "KODE BARU");
});

test("only periods a super admin can merely read are labelled read-only", () => {
  const access = { superAdminScopes: [{ organizationCode: "KPI", periodCode: "CONTOH", divisionCode: null, operational: true }, { organizationCode: "KPI", periodCode: "2026_2027", divisionCode: null, operational: false }] } as unknown as HostedAccess;
  assert.equal(scopeLabel(access, { organizationCode: "KPI", periodCode: "CONTOH", divisionCode: null }), "KPI · CONTOH");
  assert.equal(scopeLabel(access, { organizationCode: "KPI", periodCode: "2026_2027", divisionCode: null }), "KPI · 2026_2027 · Baca saja");
  assert.equal(isReadOnlyScope({} as HostedAccess, { organizationCode: "KPI", periodCode: "2026_2027", divisionCode: null }), false);
});
