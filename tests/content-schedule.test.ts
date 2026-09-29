import assert from "node:assert/strict";
import test from "node:test";
import { TestContentRepository } from "../src/platform/content/content-repository";
import { transitionContent } from "../src/platform/content/content-workflow";

const admin = { accountId: "00000000-0000-4000-8000-000000000101", email: "admin.test@kpi.local", name: "Admin", roles: ["ADMIN_SISTEM", "PENGURUS"] as const };
const pengurus = { accountId: "00000000-0000-4000-8000-000000000102", email: "pengurus.test@kpi.local", name: "Pengurus", roles: ["PENGURUS"] as const };
const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

async function approved(repository: TestContentRepository, body = "Isi naskah lengkap untuk pengujian penjadwalan terbit di situs publik.") {
  const draft = await repository.createDraft({ ...scope, slug: `jadwal-${Math.random().toString(36).slice(2, 8)}`, title: "Pengumuman kegiatan", description: "Ringkasan pengumuman kegiatan KPI.", body, type: "Pengumuman", meta: "TEST", href: "/publik", accent: "red", locale: "id", authorAccountId: admin.accountId });
  await transitionContent({ repository, contentId: draft.id, targetState: "IN_REVIEW", actor: admin });
  await transitionContent({ repository, contentId: draft.id, targetState: "APPROVED", actor: pengurus });
  return draft;
}

test("scheduled content publishes once due and stays hidden before", async () => {
  const repository = new TestContentRepository();
  const draft = await approved(repository);
  const now = Date.now();
  assert.equal(await repository.schedulePublish(draft.id, admin.accountId, new Date(now + 30_000).toISOString(), now), null, "must be at least a minute ahead");
  const scheduledAt = new Date(now + 3_600_000).toISOString();
  assert.equal((await repository.schedulePublish(draft.id, admin.accountId, scheduledAt, now))?.scheduledPublishAt, scheduledAt);
  assert.deepEqual(await repository.publishDue(now, () => true), []);
  assert.equal((await repository.listPublished()).some((record) => record.id === draft.id), false);
  const published = await repository.publishDue(now + 3_600_001, () => true);
  assert.equal(published[0]?.state, "PUBLISHED");
  assert.equal(repository.listAudit(draft.id).at(-1)?.reason, "Terbit sesuai jadwal");
});

test("a due schedule that fails re-checks is cancelled instead of published", async () => {
  const repository = new TestContentRepository();
  const draft = await approved(repository);
  const now = Date.now();
  await repository.schedulePublish(draft.id, admin.accountId, new Date(now + 120_000).toISOString(), now);
  assert.deepEqual(await repository.publishDue(now + 200_000, () => false), []);
  const record = await repository.getById(draft.id);
  assert.deepEqual([record?.state, record?.scheduledPublishAt], ["APPROVED", undefined]);
  assert.equal(repository.listAudit(draft.id).at(-1)?.action, "CONTENT_SCHEDULE_BLOCKED");
});

test("leaving APPROVED clears the schedule, and blocking checks stop manual publishing", async () => {
  const repository = new TestContentRepository();
  const draft = await approved(repository);
  const now = Date.now();
  await repository.schedulePublish(draft.id, admin.accountId, new Date(now + 120_000).toISOString(), now);
  await transitionContent({ repository, contentId: draft.id, targetState: "DRAFT", actor: admin });
  assert.equal((await repository.getById(draft.id))?.scheduledPublishAt, undefined);

  const leaky = await approved(repository, "Silakan hubungi koordinator di koordinator.kpi@gmail.com untuk pendaftaran.");
  assert.deepEqual(await transitionContent({ repository, contentId: leaky.id, targetState: "PUBLISHED", actor: admin }), { ok: false, reason: "PREFLIGHT_FAILED" });
});
