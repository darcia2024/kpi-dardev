import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";

export type EvaluationRecord = {
  id: string;
  organizationCode: string;
  periodCode: string;
  subjectAccountId: string;
  indicator: string;
  value: number | null;
  formulaVersion: string;
  evidenceAssetIds: string[];
  status: "DRAFT" | "REVIEWED" | "CORRECTED";
  updatedAt: string;
};

export type KnowledgeArticle = {
  id: string;
  organizationCode: string;
  periodCode: string;
  title: string;
  version: number;
  sourceAssetId: string;
  sourceVersion?: number;
  summary?: string;
  body?: string;
  sourceLocator?: string;
  authorAccountId?: string;
  reviewerAccountId?: string;
  previousArticleId?: string;
  archivedReason?: string;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string;
};

export type EvaluationRevision = {
  id: string;
  evaluationId: string;
  version: number;
  value: number | null;
  evidenceAssetIds: string[];
  evidenceVersions?: { assetId: string; version: number }[];
  actorAccountId: string;
  reason: string;
  kind: "REVIEW" | "CORRECTION";
  createdAt: string;
};

export type EvaluationReportRow = {
  evaluationId: string;
  subjectAccountId: string;
  indicator: string;
  value: number | null;
  formulaVersion: string;
  revisionId: string | null;
  evidence: { assetId: string; version: number; accessible: boolean }[];
  readiness: "READY" | "UNREVIEWED" | "MISSING_VALUE" | "OPEN_APPEAL" | "SOURCE_UNAVAILABLE";
};

export type EvaluationAppeal = {
  id: string;
  evaluationId: string;
  submittedByAccountId: string;
  reason: string;
  status: "OPEN" | "RESOLVED";
  resolution?: string;
  resolvedByAccountId?: string;
  resolvedAt?: string;
  resolvedRevisionId?: string;
  createdAt: string;
};

export class TestEvaluationKnowledgeService {
  private readonly evaluations: RecordCollection<EvaluationRecord>;
  private readonly articles: RecordCollection<KnowledgeArticle>;
  private readonly revisions: RecordCollection<EvaluationRevision>;
  private readonly appeals: RecordCollection<EvaluationAppeal>;

  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase, private readonly assets = new TestAssetRepository()) {
    const evaluationSeed = new Map<string, EvaluationRecord>();
    const articleSeed = new Map<string, KnowledgeArticle>();
    if (process.env.NODE_TEST_CONTEXT) {
      evaluationSeed.set("00000000-0000-4000-8000-000000006001", { id: "00000000-0000-4000-8000-000000006001", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", subjectAccountId: "00000000-0000-4000-8000-000000000102", indicator: "Penyelesaian tugas · TEST", value: null, formulaVersion: "TEST-DRAFT-v1", evidenceAssetIds: [], status: "DRAFT", updatedAt: "2026-09-22T08:00:00.000Z" });
      articleSeed.set("00000000-0000-4000-8000-000000006101", { id: "00000000-0000-4000-8000-000000006101", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", title: "Panduan kerja pengurus · TEST", version: 1, sourceAssetId: "00000000-0000-4000-8000-000000002001", sourceVersion: 1, summary: "Rujukan metadata untuk panduan kerja pengurus dalam lingkungan TEST.", status: "PUBLISHED", updatedAt: "2026-09-22T08:00:00.000Z" });
    }
    this.evaluations = database ? new PersistentRecords(database, "evaluations", evaluationSeed) : evaluationSeed;
    this.articles = database ? new PersistentRecords(database, "knowledge", articleSeed) : articleSeed;
    this.revisions = database ? new PersistentRecords(database, "evaluation-revisions", []) : new Map();
    this.appeals = database ? new PersistentRecords(database, "evaluation-appeals", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  listEvaluations(): EvaluationRecord[] { return Array.from(this.evaluations.values(), cloneEvaluation); }
  listArticles(includeNonPublished: boolean, accountId?: string): KnowledgeArticle[] {
    return Array.from(this.articles.values())
      .filter((article) => includeNonPublished || article.status === "PUBLISHED")
      .filter((article) => !accountId || this.sourceIsReadable(article, accountId))
      .map(cloneArticle);
  }

  sourceIsReadable(article: KnowledgeArticle, accountId: string): boolean {
    if (!this.assets.canUseEvidence(article.sourceAssetId, accountId, article.organizationCode, article.periodCode)) return false;
    return this.assets.getVisible(article.sourceAssetId, accountId)?.version === article.sourceVersion;
  }

  listRevisions(evaluationId: string): EvaluationRevision[] {
    return Array.from(this.revisions.values())
      .filter((revision) => revision.evaluationId === evaluationId)
      .sort((left, right) => left.version - right.version)
      .map(cloneRevision);
  }

  listAppeals(accountId: string, canReview: boolean): EvaluationAppeal[] {
    return Array.from(this.appeals.values())
      .filter((appeal) => canReview || appeal.submittedByAccountId === accountId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map(cloneAppeal);
  }

  previewReport(organizationCode: string, periodCode: string, accountId: string, canReview: boolean): EvaluationReportRow[] {
    return this.listEvaluations()
      .filter((record) => record.organizationCode === organizationCode && record.periodCode === periodCode && (canReview || record.subjectAccountId === accountId))
      .map((record) => {
        const revision = this.listRevisions(record.id).at(-1);
        const evidence = (revision?.evidenceVersions ?? record.evidenceAssetIds.map((assetId) => ({ assetId, version: this.assets.getVisible(assetId, accountId)?.version ?? 0 })))
          .map(({ assetId, version }) => ({ assetId, version, accessible: this.assets.canUseEvidence(assetId, accountId, organizationCode, periodCode) && this.assets.getVisible(assetId, accountId)?.version === version }));
        const openAppeal = Array.from(this.appeals.values()).some((appeal) => appeal.evaluationId === record.id && appeal.status === "OPEN");
        const readiness = !revision ? "UNREVIEWED" : openAppeal ? "OPEN_APPEAL" : record.value === null ? "MISSING_VALUE" : evidence.length === 0 || evidence.some((item) => !item.accessible) ? "SOURCE_UNAVAILABLE" : "READY";
        return { evaluationId: record.id, subjectAccountId: record.subjectAccountId, indicator: record.indicator, value: record.value, formulaVersion: record.formulaVersion, revisionId: revision?.id ?? null, evidence, readiness };
      });
  }

  reviewEvaluation(id: string, reviewerAccountId: string, value: number | null, evidenceAssetIds: string[], reason: string): EvaluationRecord | null {
    const record = this.evaluations.get(id);
    if (!record || record.subjectAccountId === reviewerAccountId || reason.trim().length < 10 || value !== null && (!Number.isFinite(value) || evidenceAssetIds.length === 0) || new Set(evidenceAssetIds).size !== evidenceAssetIds.length) return null;
    if (evidenceAssetIds.some((assetId) => !this.assets.canUseEvidence(assetId, reviewerAccountId, record.organizationCode, record.periodCode))) return null;
    const updated: EvaluationRecord = { ...record, value, evidenceAssetIds: [...new Set(evidenceAssetIds)], status: record.status === "DRAFT" ? "REVIEWED" : "CORRECTED", updatedAt: new Date().toISOString() };
    this.evaluations.set(id, updated);
    this.recordRevision(updated, reviewerAccountId, reason, record.status === "DRAFT" ? "REVIEW" : "CORRECTION");
    this.audit.record({ action: "EVALUATION_REVIEWED", module: "evaluation", entityType: "evaluation", entityId: id, actorAccountId: reviewerAccountId, reason: reason.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { previousStatus: record.status, nextStatus: updated.status } });
    return cloneEvaluation(updated);
  }

  submitAppeal(evaluationId: string, subjectAccountId: string, reason: string): EvaluationAppeal | null {
    const evaluation = this.evaluations.get(evaluationId);
    if (!evaluation || evaluation.subjectAccountId !== subjectAccountId || !reason.trim()) return null;
    if (Array.from(this.appeals.values()).some((appeal) => appeal.evaluationId === evaluationId && appeal.submittedByAccountId === subjectAccountId && appeal.status === "OPEN")) return null;
    const appeal: EvaluationAppeal = { id: randomUUID(), evaluationId, submittedByAccountId: subjectAccountId, reason: reason.trim(), status: "OPEN", createdAt: new Date().toISOString() };
    this.appeals.set(appeal.id, appeal);
    this.audit.record({ action: "EVALUATION_APPEALED", module: "evaluation", entityType: "evaluation_appeal", entityId: appeal.id, actorAccountId: subjectAccountId, reason: appeal.reason, result: "SUCCESS", requestId: `local:${appeal.id}`, metadata: { evaluationId } });
    return cloneAppeal(appeal);
  }

  resolveAppeal(input: { appealId: string; reviewerAccountId: string; resolution: string; correction?: { value: number | null; evidenceAssetIds: string[]; reason: string } }): EvaluationAppeal | null {
    const appeal = this.appeals.get(input.appealId);
    if (!appeal || appeal.status !== "OPEN" || appeal.submittedByAccountId === input.reviewerAccountId || !input.resolution.trim()) return null;
    const evaluation = this.evaluations.get(appeal.evaluationId);
    if (!evaluation) return null;
    let resolvedRevisionId: string | undefined;
    if (input.correction) {
      const corrected = this.reviewEvaluation(evaluation.id, input.reviewerAccountId, input.correction.value, input.correction.evidenceAssetIds, input.correction.reason);
      if (!corrected) return null;
      resolvedRevisionId = this.listRevisions(evaluation.id).at(-1)?.id;
    }
    const updated: EvaluationAppeal = { ...appeal, status: "RESOLVED", resolution: input.resolution.trim(), resolvedByAccountId: input.reviewerAccountId, resolvedAt: new Date().toISOString(), ...(resolvedRevisionId ? { resolvedRevisionId } : {}) };
    this.appeals.set(updated.id, updated);
    this.audit.record({ action: "EVALUATION_APPEAL_RESOLVED", module: "evaluation", entityType: "evaluation_appeal", entityId: updated.id, actorAccountId: input.reviewerAccountId, reason: updated.resolution, result: "SUCCESS", requestId: `local:${updated.id}`, metadata: { evaluationId: updated.evaluationId, corrected: Boolean(resolvedRevisionId) } });
    return cloneAppeal(updated);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }

  private recordRevision(record: EvaluationRecord, actorAccountId: string, reason: string, kind: EvaluationRevision["kind"]): void {
    const version = this.listRevisions(record.id).length + 1;
    const id = randomUUID();
    this.revisions.set(id, { id, evaluationId: record.id, version, value: record.value, evidenceAssetIds: [...record.evidenceAssetIds], evidenceVersions: record.evidenceAssetIds.map((assetId) => ({ assetId, version: this.assets.getVisible(assetId, actorAccountId)?.version ?? 0 })), actorAccountId, reason: reason.trim(), kind, createdAt: new Date().toISOString() });
  }

  createArticle(input: Omit<KnowledgeArticle, "id" | "version" | "status" | "updatedAt" | "sourceVersion">, actorAccountId: string): KnowledgeArticle | null {
    if (!input.body || input.body.trim().length < 30 || !input.sourceLocator?.trim() || !this.assets.canUseEvidence(input.sourceAssetId, actorAccountId, input.organizationCode, input.periodCode)) return null;
    const source = this.assets.getVisible(input.sourceAssetId, actorAccountId);
    const record: KnowledgeArticle = { ...input, body: input.body.trim(), sourceLocator: input.sourceLocator.trim(), sourceVersion: source?.version, authorAccountId: actorAccountId, id: randomUUID(), version: 1, status: "DRAFT", updatedAt: new Date().toISOString() };
    this.articles.set(record.id, record);
    this.audit.record({ action: "KNOWLEDGE_ARTICLE_CREATED", module: "knowledge", entityType: "knowledge_article", entityId: record.id, actorAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { status: record.status, version: record.version, sourceAssetId: record.sourceAssetId } });
    return cloneArticle(record);
  }

  createArticleRevision(previousArticleId: string, input: { title: string; summary: string; body: string; sourceLocator: string; sourceAssetId: string }, actorAccountId: string): KnowledgeArticle | null {
    const previous = this.articles.get(previousArticleId);
    if (!previous || previous.authorAccountId !== actorAccountId || !["PUBLISHED", "ARCHIVED"].includes(previous.status) || this.listArticles(true).some((item) => item.previousArticleId === previousArticleId && item.status !== "ARCHIVED")) return null;
    if (input.title.trim().length < 3 || input.summary.trim().length < 10 || input.body.trim().length < 30 || !input.sourceLocator.trim() || !this.assets.canUseEvidence(input.sourceAssetId, actorAccountId, previous.organizationCode, previous.periodCode)) return null;
    const source = this.assets.getVisible(input.sourceAssetId, actorAccountId);
    const record: KnowledgeArticle = { id: randomUUID(), organizationCode: previous.organizationCode, periodCode: previous.periodCode, title: input.title.trim(), summary: input.summary.trim(), body: input.body.trim(), sourceLocator: input.sourceLocator.trim(), sourceAssetId: input.sourceAssetId, sourceVersion: source?.version, authorAccountId: actorAccountId, previousArticleId, version: previous.version + 1, status: "DRAFT", updatedAt: new Date().toISOString() };
    this.articles.set(record.id, record);
    this.audit.record({ action: "KNOWLEDGE_ARTICLE_REVISION_CREATED", module: "knowledge", entityType: "knowledge_article", entityId: record.id, actorAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { previousArticleId, version: record.version, sourceVersion: record.sourceVersion } });
    return cloneArticle(record);
  }

  submitArticle(id: string, actorAccountId: string): KnowledgeArticle | null {
    const record = this.articles.get(id);
    if (!record || record.status !== "DRAFT" || record.authorAccountId !== actorAccountId || !record.body || record.body.trim().length < 30 || !record.sourceLocator?.trim() || !this.sourceIsReadable(record, actorAccountId)) return null;
    const updated = { ...record, status: "IN_REVIEW" as const, updatedAt: new Date().toISOString() };
    this.articles.set(id, updated);
    this.audit.record({ action: "KNOWLEDGE_ARTICLE_SUBMITTED", module: "knowledge", entityType: "knowledge_article", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousStatus: record.status, nextStatus: updated.status } });
    return cloneArticle(updated);
  }

  publishArticle(id: string, actorAccountId: string): KnowledgeArticle | null {
    const record = this.articles.get(id);
    if (!record || record.status !== "IN_REVIEW" || record.authorAccountId === actorAccountId || !this.sourceIsReadable(record, actorAccountId)) return null;
    const updated = { ...record, reviewerAccountId: actorAccountId, status: "PUBLISHED" as const, updatedAt: new Date().toISOString() };
    this.articles.set(id, updated);
    this.audit.record({ action: "KNOWLEDGE_ARTICLE_PUBLISHED", module: "knowledge", entityType: "knowledge_article", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousStatus: record.status, nextStatus: updated.status, sourceVersion: record.sourceVersion } });
    return cloneArticle(updated);
  }

  archiveArticle(id: string, actorAccountId: string, reason: string): KnowledgeArticle | null {
    const record = this.articles.get(id);
    if (!record || record.status !== "PUBLISHED" || reason.trim().length < 10) return null;
    const updated = { ...record, archivedReason: reason.trim(), status: "ARCHIVED" as const, updatedAt: new Date().toISOString() };
    this.articles.set(id, updated);
    this.audit.record({ action: "KNOWLEDGE_ARTICLE_ARCHIVED", module: "knowledge", entityType: "knowledge_article", entityId: id, actorAccountId, reason: reason.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { previousStatus: record.status, nextStatus: updated.status } });
    return cloneArticle(updated);
  }
}

export function getLocalEvaluationKnowledgeService(): TestEvaluationKnowledgeService { return new TestEvaluationKnowledgeService(getLocalRecordDatabase(), getLocalAssetRepository()); }
function cloneEvaluation(record: EvaluationRecord): EvaluationRecord { return { ...record, evidenceAssetIds: [...record.evidenceAssetIds] }; }
function cloneArticle(record: KnowledgeArticle): KnowledgeArticle { return { ...record }; }
function cloneRevision(record: EvaluationRevision): EvaluationRevision { return { ...record, evidenceAssetIds: [...record.evidenceAssetIds], evidenceVersions: record.evidenceVersions?.map((item) => ({ ...item })) }; }
function cloneAppeal(record: EvaluationAppeal): EvaluationAppeal { return { ...record }; }
