import assert from "node:assert/strict";
import test from "node:test";
import { TestEvaluationKnowledgeService } from "@/platform/governance/evaluation-knowledge-service";
import { TestFinanceService } from "@/platform/governance/finance-service";
import { TestHandoverService } from "@/platform/governance/handover-service";
import { TestAssetRepository } from "@/platform/storage/asset-repository";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";
const evidence = "00000000-0000-4000-8000-000000002001";

test("a TEST finance record needs evidence and a separate reviewer before reconciliation", () => {
  const service = new TestFinanceService();
  const record = service.list()[0];
  assert.equal(service.submit(record.id, pengurus, evidence)?.status, "PENDING_APPROVAL");
  assert.equal(service.approve(record.id, pengurus, true), null);
  assert.equal(service.approve(record.id, admin, true)?.status, "APPROVED");
  assert.equal(service.markPaid(record.id, admin)?.status, "PAID");
  assert.equal(service.reconcile(record.id, pengurus), null);
  assert.equal(service.reconcile(record.id, admin)?.status, "RECONCILED");
  assert.deepEqual(service.listEvents(record.id).map((event) => event.action), ["SUBMITTED", "APPROVED", "PAID", "RECONCILED"]);
  assert.equal(service.listAudit(record.id).map((event) => event.action).includes("FINANCE_RECONCILED"), true);
  assert.deepEqual(service.listAudit(record.id).find((event) => event.action === "FINANCE_SUBMITTED")?.metadata, { previousStatus: "DRAFT", nextStatus: "PENDING_APPROVAL" });
});

test("a new TEST finance draft belongs to its requester and rejection records a reason", () => {
  const service = new TestFinanceService();
  const record = service.create({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Klaim kegiatan TEST", currency: "TEST", amountMinor: 45000, requesterAccountId: pengurus });
  assert.equal(service.submit(record.id, admin, evidence), null);
  assert.equal(service.submit(record.id, pengurus, evidence)?.status, "PENDING_APPROVAL");
  assert.equal(service.approve(record.id, admin, false), null);
  assert.equal(service.approve(record.id, admin, false, "Bukti perlu diperbaiki")?.status, "REJECTED");
  assert.equal(service.listEvents(record.id).at(-1)?.reason, "Bukti perlu diperbaiki");
  assert.equal(service.listAudit(record.id).at(-1)?.reason, "Bukti perlu diperbaiki");
});

test("TEST evaluation preserves missing values and knowledge retains a source version", () => {
  const service = new TestEvaluationKnowledgeService();
  const evaluation = service.listEvaluations()[0];
  assert.equal(service.reviewEvaluation(evaluation.id, pengurus, 90, [evidence], "Penilaian awal"), null);
  assert.equal(service.reviewEvaluation(evaluation.id, admin, 90, [], "Tanpa bukti yang sah"), null);
  const reviewed = service.reviewEvaluation(evaluation.id, admin, null, [evidence], "Belum dapat dinilai");
  assert.equal(reviewed?.value, null);
  assert.deepEqual(reviewed?.evidenceAssetIds, [evidence]);
  const content = { summary: "Ringkasan untuk telaah bersama.", body: "Artikel contoh ini menjelaskan langkah kerja yang perlu ditelaah bersama pengurus.", sourceLocator: "Bab II, halaman 12" };
  assert.equal(service.createArticle({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Tanpa isi", sourceAssetId: evidence }, admin), null);
  const article = service.createArticle({ organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Catatan TEST", sourceAssetId: evidence, ...content }, admin);
  assert.equal(article?.version, 1);
  assert.equal(article?.sourceVersion, 1);
  assert.equal(article && service.publishArticle(article.id, pengurus), null);
  assert.equal(article && service.submitArticle(article.id, admin)?.status, "IN_REVIEW");
  assert.equal(article && service.publishArticle(article.id, admin), null);
  assert.equal(article && service.publishArticle(article.id, pengurus)?.status, "PUBLISHED");
  const revision = article && service.createArticleRevision(article.id, { title: "Catatan TEST revisi", ...content, sourceAssetId: evidence }, admin);
  assert.equal(revision?.version, 2);
  assert.equal(revision?.previousArticleId, article?.id);
  assert.equal(article && service.createArticleRevision(article.id, { title: "Duplikat", ...content, sourceAssetId: evidence }, admin), null);
  assert.equal(article && service.listArticles(true, admin).find((item) => item.id === article.id)?.status, "PUBLISHED");
  assert.deepEqual(article && service.listAudit(article.id).map((event) => event.action), ["KNOWLEDGE_ARTICLE_CREATED", "KNOWLEDGE_ARTICLE_SUBMITTED", "KNOWLEDGE_ARTICLE_PUBLISHED"]);
  assert.equal(article && service.archiveArticle(article.id, pengurus, "Diganti versi sumber baru")?.status, "ARCHIVED");
});

test("evaluation changes preserve a revision trail and a subject can appeal once", () => {
  const service = new TestEvaluationKnowledgeService();
  const evaluation = service.listEvaluations()[0];
  assert.equal(service.reviewEvaluation(evaluation.id, admin, 81, [evidence], "Penilaian awal")?.status, "REVIEWED");
  assert.equal(service.previewReport("KPI_TEST", "2026_2027_TEST", admin, true)[0].readiness, "READY");
  assert.equal(service.previewReport("KPI_TEST", "2026_2027_TEST", admin, true)[0].evidence[0].version, 1);
  assert.equal(service.listRevisions(evaluation.id).length, 1);
  const appeal = service.submitAppeal(evaluation.id, pengurus, "Mohon telaah ulang bukti kegiatan.");
  assert.equal(appeal?.status, "OPEN");
  assert.equal(service.previewReport("KPI_TEST", "2026_2027_TEST", admin, true)[0].readiness, "OPEN_APPEAL");
  assert.equal(service.submitAppeal(evaluation.id, pengurus, "Duplikasi."), null);
  assert.equal(service.resolveAppeal({ appealId: appeal!.id, reviewerAccountId: pengurus, resolution: "Tidak boleh menilai sanggahan sendiri." }), null);
  assert.equal(service.resolveAppeal({ appealId: appeal!.id, reviewerAccountId: admin, resolution: "Bukti telah diverifikasi.", correction: { value: 90, evidenceAssetIds: [evidence], reason: "Koreksi setelah sanggahan" } })?.status, "RESOLVED");
  assert.equal(service.listRevisions(evaluation.id).length, 2);
  assert.equal(service.previewReport("KPI_TEST", "2026_2027_TEST", admin, true)[0].readiness, "READY");
  assert.deepEqual(service.previewReport("KPI_TEST", "different-period", admin, true), []);
  assert.equal(service.listAudit(evaluation.id).filter((event) => event.action === "EVALUATION_REVIEWED").length, 2);
});

test("TEST handover can only be accepted by its named successor", () => {
  const service = new TestHandoverService();
  const item = service.list()[0];
  assert.equal(service.accept(item.id, admin), null);
  assert.equal(service.accept(item.id, pengurus)?.acceptedByAccountId, pengurus);
  assert.equal(service.archive(item.id, pengurus), null);
  assert.match(service.archive(item.id, admin)?.archiveSha256 ?? "", /^[0-9a-f]{64}$/);
  assert.equal(service.archive(item.id, admin), null);
  assert.deepEqual(service.listAudit(item.id).map((event) => event.action).sort(), ["HANDOVER_ACCEPTED", "HANDOVER_ARCHIVED"].sort());
});

test("knowledge titles do not leak after the linked source access is revoked", async () => {
  const assets = new TestAssetRepository();
  const service = new TestEvaluationKnowledgeService(undefined, assets);
  assert.equal(service.listArticles(false, pengurus).length, 1);
  await assets.revokeDownload(evidence, pengurus, admin);
  assert.equal(service.listArticles(false, pengurus).length, 0);
});

test("evaluation report marks revoked evidence unavailable to the subject", async () => {
  const assets = new TestAssetRepository();
  const service = new TestEvaluationKnowledgeService(undefined, assets);
  const evaluation = service.listEvaluations()[0];
  assert.equal(service.reviewEvaluation(evaluation.id, admin, 85, [evidence], "Bukti kerja telah diperiksa")?.status, "REVIEWED");
  assert.equal(service.previewReport("KPI_TEST", "2026_2027_TEST", pengurus, false)[0].readiness, "READY");
  await assets.revokeDownload(evidence, pengurus, admin);
  assert.equal(service.previewReport("KPI_TEST", "2026_2027_TEST", pengurus, false)[0].readiness, "SOURCE_UNAVAILABLE");
});
