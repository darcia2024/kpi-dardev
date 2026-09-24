import assert from "node:assert/strict";
import test from "node:test";
import { TestContentRepository } from "../src/platform/content/content-repository";
import { transitionContent } from "../src/platform/content/content-workflow";
import { LocalRecordDatabase } from "../src/platform/data/local-record-store";

const admin = { accountId: "00000000-0000-4000-8000-000000000101", email: "admin.test@kpi.local", name: "Admin", roles: ["ADMIN_SISTEM", "PENGURUS"] as const };
const pengurus = { accountId: "00000000-0000-4000-8000-000000000102", email: "pengurus.test@kpi.local", name: "Pengurus", roles: ["PENGURUS"] as const };

test("publishes TEST content only after a separate reviewer approves it", async () => {
  const repository = new TestContentRepository();
  const draft = await repository.createDraft({
    organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", slug: "draft-edukasi-test", title: "Draft edukasi TEST", description: "Konten sintetis untuk menguji alur editorial lokal.", body: "Isi naskah lengkap untuk pengujian alur review dan penerbitan konten.", type: "Edukasi", meta: "TEST", href: "/publik", accent: "red", locale: "id", authorAccountId: admin.accountId
  });

  assert.equal((await transitionContent({ repository, contentId: draft.id, targetState: "IN_REVIEW", actor: admin })).ok, true);
  assert.deepEqual(await transitionContent({ repository, contentId: draft.id, targetState: "APPROVED", actor: admin }), { ok: false, reason: "AUTHORIZATION_DENIED" });
  assert.equal((await transitionContent({ repository, contentId: draft.id, targetState: "APPROVED", actor: pengurus })).ok, true);
  assert.equal((await transitionContent({ repository, contentId: draft.id, targetState: "PUBLISHED", actor: admin })).ok, true);
  assert.equal((await repository.listPublished()).some((record) => record.id === draft.id), true);
  assert.deepEqual(repository.listAudit(draft.id).map((event) => event.action), ["CONTENT_DRAFT_CREATED", "CONTENT_STATE_CHANGED", "CONTENT_STATE_CHANGED", "CONTENT_STATE_CHANGED"]);
  assert.equal(repository.listAudit(draft.id).at(-1)?.actorAccountId, admin.accountId);
});

test("public collection excludes draft content", async () => {
  const repository = new TestContentRepository();
  const draft = await repository.createDraft({
    organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", slug: "belum-terbit", title: "Belum terbit", description: "Konten sintetis yang belum lolos alur editorial.", type: "Panduan", meta: "TEST", href: "/publik", accent: "plum", locale: "id", authorAccountId: admin.accountId
  });
  assert.equal((await repository.listPublished()).some((record) => record.id === draft.id), false);
});

test("content rejects a duplicate slug inside its locale and scope", async () => {
  const repository = new TestContentRepository();
  await assert.rejects(() => repository.createDraft({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", slug: "mengenal-kpi", title: "Duplikat TEST", description: "Konten sintetis dengan slug yang sudah digunakan.", type: "Panduan", meta: "TEST", href: "/publik", accent: "red", locale: "id", authorAccountId: admin.accountId }));
});

test("draft edits reject stale versions and review returns require a reason", async () => {
  const repository = new TestContentRepository();
  const draft = await repository.createDraft({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", slug: "revisi-test", title: "Naskah pertama", description: "Deskripsi awal untuk uji revisi.", body: "Naskah lengkap awal untuk menguji proses revisi editorial.", type: "Panduan", meta: "TEST", href: "/publik", accent: "red", locale: "id", authorAccountId: admin.accountId });
  const edited = await repository.updateDraft(draft.id, admin.accountId, draft.version, "Naskah diperbarui", "Deskripsi baru untuk uji revisi.", "Isi versi kedua yang sudah diperbarui untuk proses review.");
  assert.equal(edited?.version, draft.version + 1);
  assert.equal(edited?.body, "Isi versi kedua yang sudah diperbarui untuk proses review.");
  assert.equal(edited?.locale, "id");
  assert.equal(await repository.updateDraft(draft.id, admin.accountId, draft.version, "Terlambat", "Deskripsi lama tidak boleh masuk."), null);
  assert.equal((await transitionContent({ repository, contentId: draft.id, targetState: "IN_REVIEW", actor: admin })).ok, true);
  assert.deepEqual(await transitionContent({ repository, contentId: draft.id, targetState: "CHANGES_REQUESTED", actor: pengurus }), { ok: false, reason: "INVALID_TRANSITION" });
  assert.equal((await transitionContent({ repository, contentId: draft.id, targetState: "CHANGES_REQUESTED", actor: pengurus, reason: "Perjelas sumber" })).ok, true);
  assert.equal(repository.listAudit(draft.id).at(-1)?.reason, "Perjelas sumber");
});

test("a summary-only draft cannot enter review", async () => {
  const repository = new TestContentRepository();
  const draft = await repository.createDraft({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", slug: "ringkasan-saja", title: "Ringkasan saja", description: "Deskripsi tanpa naskah lengkap.", type: "Informasi", meta: "TEST", href: "/publik", accent: "red", locale: "id", authorAccountId: admin.accountId });
  assert.deepEqual(await transitionContent({ repository, contentId: draft.id, targetState: "IN_REVIEW", actor: admin }), { ok: false, reason: "INVALID_TRANSITION" });
});

test("content revision snapshots survive repository reopen and archive", async () => {
  const database = new LocalRecordDatabase(":memory:");
  try {
    const repository = new TestContentRepository(database);
    const draft = await repository.createDraft({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", slug: "versi-naskah", title: "Versi awal", description: "Ringkasan versi awal naskah.", body: "Isi versi awal yang disimpan untuk pembanding perubahan.", type: "Informasi", meta: "TEST", href: "/publik", accent: "red", locale: "id", authorAccountId: admin.accountId });
    const edited = await repository.updateDraft(draft.id, admin.accountId, 1, "Versi baru", "Ringkasan versi baru naskah.", "Isi versi baru yang berbeda dan tetap tersimpan rapi.");
    assert.equal(edited?.version, 2);
    await repository.setState(draft.id, "ARCHIVED", admin.accountId, "Selesai");
    const revisions = await new TestContentRepository(database).listRevisions(draft.id);
    assert.deepEqual(revisions.map((revision) => revision.version), [3, 2, 1]);
    assert.equal(revisions[0].snapshot.state, "ARCHIVED");
    assert.equal(revisions[2].snapshot.body, "Isi versi awal yang disimpan untuk pembanding perubahan.");
    assert.equal(revisions[1].snapshot.body, "Isi versi baru yang berbeda dan tetap tersimpan rapi.");
  } finally { database.close(); }
});
