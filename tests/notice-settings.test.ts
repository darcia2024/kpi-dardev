import assert from "node:assert/strict";
import test from "node:test";
import { LocalNoticeSettingsRepository } from "../src/platform/notifications/settings-repository";

test("notification preference belongs to one account and template revisions remain drafts", () => {
  const settings = new LocalNoticeSettingsRepository();
  assert.equal(settings.getPreference("member-a").optionalInApp, true);
  settings.savePreference("member-a", { optionalInApp: false });
  assert.equal(settings.getPreference("member-a").optionalInApp, false);
  assert.equal(settings.getPreference("member-b").optionalInApp, true);
  const first = settings.createTemplate({ code: "pembaruan-kasus", locale: "id", title: "Pembaruan kasus", body: "Ada pembaruan pada laporan Anda.", authorAccountId: "member-a" });
  const second = settings.createTemplate({ code: "pembaruan-kasus", locale: "id", title: "Pembaruan kasus", body: "Laporan Anda mendapat pembaruan baru.", authorAccountId: "member-a" });
  assert.equal(first.version, 1);
  assert.equal(second.version, 2);
  assert.ok(settings.listTemplates().every((item) => item.status === "DRAFT"));
});

test("category preferences merge partially and reject invalid quiet hours", () => {
  const settings = new LocalNoticeSettingsRepository();
  const defaults = settings.getPreference("member-a");
  assert.deepEqual([defaults.taskReminders, defaults.announcements, defaults.emailDigest, defaults.quietHours.enabled], [true, true, false, false]);
  settings.savePreference("member-a", { announcements: false });
  settings.savePreference("member-a", { quietHours: { enabled: true, start: "22:00", end: "05:30" } });
  const saved = settings.getPreference("member-a");
  assert.equal(saved.announcements, false);
  assert.equal(saved.taskReminders, true, "unrelated fields stay untouched");
  assert.deepEqual(saved.quietHours, { enabled: true, start: "22:00", end: "05:30" });
  assert.equal(settings.savePreference("member-a", { quietHours: { enabled: true, start: "24:00", end: "05:00" } }), null);
  assert.equal(settings.getPreference("member-a").quietHours.start, "22:00");
});
