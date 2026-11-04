import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";
import { guideRoleForAccount, guideSlug, portalGuide, searchGuide } from "../src/lib/portal-guide";

test("every guide feature points at a page that exists and says what to do", async () => {
  assert.equal(new Set(portalGuide.map(role => role.key)).size, portalGuide.length);
  for (const role of portalGuide) {
    assert.ok(role.features.length > 0);
    for (const feature of role.features) {
      assert.ok(feature.steps.length > 0, feature.title);
      assert.ok(feature.shots.length > 0, feature.title);
      for (const shot of feature.shots) { assert.ok(shot.caption.length > 5); await access(new URL(`../public/tutorial/${shot.file}.jpg`, import.meta.url)); }
      await access(new URL(`../src/app${feature.href}/page.tsx`, import.meta.url));
    }
  }
});

test("tutorial anchors are unique and search matches every word across roles", () => {
  const slugs = portalGuide.flatMap(role => role.features.map(feature => guideSlug(feature.title)));
  assert.equal(new Set(slugs).size, slugs.length);
  assert.ok(slugs.every(slug => /^[a-z0-9-]+$/.test(slug)));
  assert.ok(searchGuide("dokumen unggah").some(({ feature }) => feature.title === "Mengunggah dokumen"));
  assert.ok(searchGuide("AKTIFKAN periode").some(({ role }) => role.key === "super"));
  assert.deepEqual(searchGuide("kata yang tidak ada di panduan"), []);
  assert.deepEqual(searchGuide("   "), []);
});

test("the guide opens on the reader's own role", () => {
  assert.equal(guideRoleForAccount({ systemAdmin: true, superAdmin: true }), "super");
  assert.equal(guideRoleForAccount({ systemAdmin: true }), "admin");
  assert.equal(guideRoleForAccount({}), "semua");
  assert.ok(portalGuide.some(role => role.key === "super") && portalGuide.some(role => role.key === "admin"));
});
