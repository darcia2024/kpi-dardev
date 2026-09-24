import assert from "node:assert/strict";
import test from "node:test";
import { LocalNoticeSettingsRepository } from "../src/platform/notifications/settings-repository";

test("notification preference belongs to one account and template revisions remain drafts", () => {
  const settings = new LocalNoticeSettingsRepository();
  assert.equal(settings.getPreference("member-a").optionalInApp, true);
  settings.savePreference("member-a", false);
  assert.equal(settings.getPreference("member-a").optionalInApp, false);
  assert.equal(settings.getPreference("member-b").optionalInApp, true);
  const first = settings.createTemplate({ code: "pembaruan-kasus", locale: "id", title: "Pembaruan kasus", body: "Ada pembaruan pada laporan Anda.", authorAccountId: "member-a" });
  const second = settings.createTemplate({ code: "pembaruan-kasus", locale: "id", title: "Pembaruan kasus", body: "Laporan Anda mendapat pembaruan baru.", authorAccountId: "member-a" });
  assert.equal(first.version, 1);
  assert.equal(second.version, 2);
  assert.ok(settings.listTemplates().every((item) => item.status === "DRAFT"));
});
