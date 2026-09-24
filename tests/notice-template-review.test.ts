import assert from "node:assert/strict";
import test from "node:test";
import { LocalRecordDatabase } from "../src/platform/data/local-record-store";
import { LocalNoticeSettingsRepository } from "../src/platform/notifications/settings-repository";

test("notification templates retain ID/EN versions and require another reviewer", () => {
  const database = new LocalRecordDatabase(":memory:");
  const writer = "00000000-0000-4000-8000-000000000101";
  const reviewer = "00000000-0000-4000-8000-000000000102";
  const settings = new LocalNoticeSettingsRepository(database);
  const first = settings.createTemplate({ code: "case-update", locale: "id", title: "Pembaruan kasus", body: "Kasus Anda telah diperbarui.", authorAccountId: writer });
  const english = settings.createTemplate({ code: "case-update", locale: "en", title: "Case update", body: "Your case has been updated.", authorAccountId: writer });
  const next = settings.createTemplate({ code: "case-update", locale: "id", title: "Pembaruan layanan", body: "Layanan Anda telah diperbarui.", authorAccountId: writer });
  assert.equal(first.version, 1);
  assert.equal(english.version, 1);
  assert.equal(next.version, 2);
  assert.equal(settings.reviewTemplate(first.id, reviewer), null);
  assert.equal(settings.submitTemplate(first.id, writer)?.status, "IN_REVIEW");
  assert.equal(settings.reviewTemplate(first.id, writer), null);
  assert.equal(new LocalNoticeSettingsRepository(database).reviewTemplate(first.id, reviewer)?.status, "REVIEWED");
  database.close();
});
