import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";
import { guideRoleForAccount, portalGuide } from "../src/lib/portal-guide";

test("every guide feature points at a page that exists and says what to do", async () => {
  assert.equal(new Set(portalGuide.map(role => role.key)).size, portalGuide.length);
  for (const role of portalGuide) {
    assert.ok(role.features.length > 0);
    for (const feature of role.features) {
      assert.ok(feature.steps.length > 0, feature.title);
      await access(new URL(`../src/app${feature.href}/page.tsx`, import.meta.url));
    }
  }
});

test("the guide opens on the reader's own role", () => {
  assert.equal(guideRoleForAccount({ systemAdmin: true, superAdmin: true }), "super");
  assert.equal(guideRoleForAccount({ systemAdmin: true }), "admin");
  assert.equal(guideRoleForAccount({}), "semua");
  assert.ok(portalGuide.some(role => role.key === "super") && portalGuide.some(role => role.key === "admin"));
});
