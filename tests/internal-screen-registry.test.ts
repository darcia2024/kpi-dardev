import assert from "node:assert/strict";
import test from "node:test";
import { internalScreens, internalScreenTotals } from "../src/lib/internal-screen-registry";
import { visiblePortalNavigation } from "../src/lib/portal-navigation";

test("internal registry maps all 98 IDs to distinct targets and acceptance criteria", () => {
  assert.equal(internalScreens.length, 98);
  assert.equal(new Set(internalScreens.map((screen) => screen.id)).size, 98);
  assert.equal(internalScreenTotals.connected + internalScreenTotals.partial + internalScreenTotals.planned, 98);
  for (const screen of internalScreens) {
    assert.match(screen.id, /^[AWTMFKCSNBEHI]\d{2}$/);
    assert.ok(screen.title.length > 4);
    assert.ok(screen.acceptance.length > 30);
    assert.ok(screen.route.startsWith("/"));
    assert.ok(screen.api.every((route) => route.startsWith("/api/v1/")));
  }
  assert.ok(internalScreenTotals.partial > 0);
});

test("portal navigation only exposes destinations with a granted read capability", () => {
  const restricted = visiblePortalNavigation((permission) => permission === "TASK_READ" || permission === "ASSET_DOWNLOAD");
  assert.deepEqual(restricted.map((item) => item.href), ["/portal", "/portal/profil", "/portal/tugas", "/portal/dokumen"]);
  const reviewer = visiblePortalNavigation((permission) => permission === "CONTENT_REVIEW");
  assert.deepEqual(reviewer.map((item) => item.href), ["/portal", "/portal/profil", "/portal/editor"]);
});
