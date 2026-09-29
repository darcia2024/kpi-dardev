import assert from "node:assert/strict";
import test from "node:test";
import { TestContentRepository } from "../src/platform/content/content-repository";

test("media change is versioned and cannot alter reviewed content", async () => {
  const repository = new TestContentRepository();
  const authorAccountId = "00000000-0000-4000-8000-000000000101";
  const draft = await repository.createDraft({ title: "Kabar KPI", description: "Ringkasan untuk masyarakat KPI.", type: "Informasi", meta: "KPI", href: "/publik/publikasi", accent: "red", locale: "id", slug: "kabar-kpi", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", authorAccountId });
  const assetId = "00000000-0000-4000-8000-000000002001";
  assert.equal(await repository.attachMedia(draft.id, "other", draft.version, assetId), null);
  const updated = await repository.attachMedia(draft.id, authorAccountId, draft.version, assetId);
  assert.equal(updated?.mediaAssetId, assetId);
  assert.equal(updated?.version, 2);
  assert.equal(await repository.attachMedia(draft.id, authorAccountId, draft.version, null), null);
  await repository.setState(draft.id, "IN_REVIEW", authorAccountId);
  assert.equal(await repository.attachMedia(draft.id, authorAccountId, 3, null), null);
});
