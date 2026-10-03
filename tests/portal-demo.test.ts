import test from "node:test";
import assert from "node:assert/strict";
import {portalDemos, findPortalDemo} from "../src/lib/portal-demo";
import {visiblePortalNavigation} from "../src/lib/portal-navigation";

test("each work module has exactly one identifiable demo, including organization setup", () => {
  const expected = [...visiblePortalNavigation(() => true).filter(item => item.href !== "/portal/kebijakan").map(item => item.href), "/portal/pengaturan"];
  assert.equal(portalDemos.length, expected.length);
  assert.equal(new Set(portalDemos.map(item => item.href)).size, expected.length);
  assert.equal(new Set(portalDemos.map(item => item.id)).size, expected.length);
  for (const href of expected) {
    const demo = findPortalDemo(href);
    assert.ok(demo, href);
    assert.match(demo.id, /^DEMO-/);
    assert.ok(demo.fields.length >= 3);
    assert.ok(demo.flow.length >= 3);
  }
  assert.equal(findPortalDemo("/portal/not-a-module"), undefined);
});

test("demo identities and sensitive examples cannot be mistaken for operational records", () => {
  for (const item of portalDemos) {
    for (const [, value] of item.fields) {
      for (const email of value.match(/[\w.-]+@[\w.-]+/g) || []) assert.ok(email.endsWith(".invalid"));
    }
  }
  assert.match(findPortalDemo("/portal/kasus")!.summary, /fiktif/);
  assert.match(findPortalDemo("/portal/keuangan")!.summary, /tidak masuk saldo/);
  assert.match(findPortalDemo("/portal/akses")!.summary, /Tidak membuat pengguna/);
  assert.match(findPortalDemo("/portal/ai")!.summary, /bukan respons dari provider/);
});
