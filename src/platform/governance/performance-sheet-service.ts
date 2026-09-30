import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type RecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";

// Indicators and weights are preview values; the official formula waits for KPI (Q13).
export type PerformanceIndicator = { id: string; name: string; weightPercent: number };
export type PerformanceScheme = { id: string; organizationCode: string; periodCode: string; version: number; status: "DRAFT" | "ACTIVE" | "RETIRED"; indicators: PerformanceIndicator[]; createdByAccountId: string; updatedAt: string };
export type ConflictDeclaration = { id: string; organizationCode: string; periodCode: string; evaluatorAccountId: string; subjectAccountId: string; reason: string; declaredAt: string };
// score null means "belum ada data" and is never counted as zero.
export type RubricAssessment = { id: string; schemeId: string; indicatorId: string; subjectAccountId: string; evaluatorAccountId: string; score: 1 | 2 | 3 | 4 | 5 | null; reason: string; evidenceAssetIds: string[]; updatedAt: string };
export type SubjectSummary = { subjectAccountId: string; indicators: { indicatorId: string; name: string; weightPercent: number; averageScore: number | null; assessments: number }[]; weightedPercent: number | null; coveredWeightPercent: number };

export class PerformanceSheetService {
  private readonly schemes: RecordCollection<PerformanceScheme>;
  private readonly conflicts: RecordCollection<ConflictDeclaration>;
  private readonly assessments: RecordCollection<RubricAssessment>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: RecordDatabase, private readonly assets = new TestAssetRepository()) {
    this.schemes = database ? new PersistentRecords(database, "performance-schemes", []) : new Map();
    this.conflicts = database ? new PersistentRecords(database, "performance-conflicts", []) : new Map();
    this.assessments = database ? new PersistentRecords(database, "performance-assessments", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  schemesFor(organizationCode: string, periodCode: string): PerformanceScheme[] {
    return Array.from(this.schemes.values()).filter((scheme) => scheme.organizationCode === organizationCode && scheme.periodCode === periodCode).map(cloneScheme).sort((a, b) => b.version - a.version);
  }

  activeScheme(organizationCode: string, periodCode: string): PerformanceScheme | null {
    return this.schemesFor(organizationCode, periodCode).find((scheme) => scheme.status === "ACTIVE") ?? null;
  }

  // A new draft copies the active scheme's indicators so revisions start from the current version.
  createDraft(organizationCode: string, periodCode: string, actorAccountId: string): PerformanceScheme | null {
    const existing = this.schemesFor(organizationCode, periodCode);
    if (existing.some((scheme) => scheme.status === "DRAFT")) return null;
    const active = existing.find((scheme) => scheme.status === "ACTIVE");
    const scheme: PerformanceScheme = { id: randomUUID(), organizationCode, periodCode, version: (existing[0]?.version ?? 0) + 1, status: "DRAFT", indicators: active?.indicators.map((indicator) => ({ ...indicator, id: randomUUID() })) ?? [], createdByAccountId: actorAccountId, updatedAt: new Date().toISOString() };
    this.schemes.set(scheme.id, scheme);
    this.audit.record({ action: "PERFORMANCE_SCHEME_DRAFTED", module: "evaluation", entityType: "performance_scheme", entityId: scheme.id, actorAccountId, result: "SUCCESS", requestId: `local:${scheme.id}`, metadata: { version: scheme.version } });
    return cloneScheme(scheme);
  }

  setIndicator(schemeId: string, actorAccountId: string, input: { indicatorId?: string; name: string; weightPercent: number }): PerformanceScheme | null {
    const scheme = this.schemes.get(schemeId);
    const name = input.name.trim();
    if (!scheme || scheme.status !== "DRAFT" || name.length < 3 || !Number.isInteger(input.weightPercent) || input.weightPercent < 1 || input.weightPercent > 100) return null;
    if (input.indicatorId && !scheme.indicators.some((indicator) => indicator.id === input.indicatorId)) return null;
    const indicators = input.indicatorId
      ? scheme.indicators.map((indicator) => indicator.id === input.indicatorId ? { ...indicator, name, weightPercent: input.weightPercent } : indicator)
      : [...scheme.indicators, { id: randomUUID(), name, weightPercent: input.weightPercent }];
    if (indicators.length > 20 || totalWeight(indicators) > 100) return null;
    return this.saveScheme({ ...scheme, indicators }, actorAccountId, "PERFORMANCE_INDICATOR_SET");
  }

  removeIndicator(schemeId: string, actorAccountId: string, indicatorId: string): PerformanceScheme | null {
    const scheme = this.schemes.get(schemeId);
    if (!scheme || scheme.status !== "DRAFT" || !scheme.indicators.some((indicator) => indicator.id === indicatorId)) return null;
    return this.saveScheme({ ...scheme, indicators: scheme.indicators.filter((indicator) => indicator.id !== indicatorId) }, actorAccountId, "PERFORMANCE_INDICATOR_REMOVED");
  }

  // Activation needs weights totalling exactly 100%; the previously active version is retired.
  activate(schemeId: string, actorAccountId: string): PerformanceScheme | null {
    const scheme = this.schemes.get(schemeId);
    if (!scheme || scheme.status !== "DRAFT" || !scheme.indicators.length || totalWeight(scheme.indicators) !== 100) return null;
    const previous = this.activeScheme(scheme.organizationCode, scheme.periodCode);
    if (previous) this.schemes.set(previous.id, { ...previous, status: "RETIRED", updatedAt: new Date().toISOString() });
    return this.saveScheme({ ...scheme, status: "ACTIVE" }, actorAccountId, "PERFORMANCE_SCHEME_ACTIVATED");
  }

  declareConflict(input: Omit<ConflictDeclaration, "id" | "declaredAt">): ConflictDeclaration | null {
    const reason = input.reason.trim();
    if (reason.length < 5 || input.evaluatorAccountId === input.subjectAccountId || this.hasConflict(input.organizationCode, input.periodCode, input.evaluatorAccountId, input.subjectAccountId)) return null;
    const declaration: ConflictDeclaration = { ...input, reason, id: randomUUID(), declaredAt: new Date().toISOString() };
    this.conflicts.set(declaration.id, declaration);
    this.audit.record({ action: "PERFORMANCE_CONFLICT_DECLARED", module: "evaluation", entityType: "performance_conflict", entityId: declaration.id, actorAccountId: input.evaluatorAccountId, reason, result: "SUCCESS", requestId: `local:${declaration.id}`, metadata: { subjectAccountId: input.subjectAccountId } });
    return { ...declaration };
  }

  hasConflict(organizationCode: string, periodCode: string, evaluatorAccountId: string, subjectAccountId: string): boolean {
    if (evaluatorAccountId === subjectAccountId) return true;
    return Array.from(this.conflicts.values()).some((item) => item.organizationCode === organizationCode && item.periodCode === periodCode && item.evaluatorAccountId === evaluatorAccountId && item.subjectAccountId === subjectAccountId);
  }

  conflictsFor(organizationCode: string, periodCode: string, evaluatorAccountId: string): ConflictDeclaration[] {
    return Array.from(this.conflicts.values()).filter((item) => item.organizationCode === organizationCode && item.periodCode === periodCode && item.evaluatorAccountId === evaluatorAccountId).map((item) => ({ ...item }));
  }

  // One assessment per evaluator, subject, and indicator; saving again revises it.
  assess(input: { organizationCode: string; periodCode: string; indicatorId: string; subjectAccountId: string; evaluatorAccountId: string; score: RubricAssessment["score"]; reason: string; evidenceAssetIds: string[] }): RubricAssessment | null {
    const scheme = this.activeScheme(input.organizationCode, input.periodCode);
    const reason = input.reason.trim();
    if (!scheme || !scheme.indicators.some((indicator) => indicator.id === input.indicatorId) || reason.length < 10) return null;
    if (this.hasConflict(input.organizationCode, input.periodCode, input.evaluatorAccountId, input.subjectAccountId)) return null;
    if (input.score !== null && (![1, 2, 3, 4, 5].includes(input.score) || input.evidenceAssetIds.length === 0)) return null;
    const evidence = [...new Set(input.evidenceAssetIds)];
    if (evidence.some((assetId) => !this.assets.canUseEvidence(assetId, input.evaluatorAccountId, input.organizationCode, input.periodCode))) return null;
    const id = `${scheme.id}:${input.indicatorId}:${input.subjectAccountId}:${input.evaluatorAccountId}`;
    const assessment: RubricAssessment = { id, schemeId: scheme.id, indicatorId: input.indicatorId, subjectAccountId: input.subjectAccountId, evaluatorAccountId: input.evaluatorAccountId, score: input.score, reason, evidenceAssetIds: evidence, updatedAt: new Date().toISOString() };
    const revised = !!this.assessments.get(id);
    this.assessments.set(id, assessment);
    this.audit.record({ action: revised ? "PERFORMANCE_ASSESSMENT_REVISED" : "PERFORMANCE_ASSESSED", module: "evaluation", entityType: "performance_assessment", entityId: id, actorAccountId: input.evaluatorAccountId, reason, result: "SUCCESS", requestId: `local:${id}`, metadata: { score: input.score, indicatorId: input.indicatorId } });
    return { ...assessment, evidenceAssetIds: [...evidence] };
  }

  assessmentsBy(schemeId: string, evaluatorAccountId: string): RubricAssessment[] {
    return Array.from(this.assessments.values()).filter((item) => item.schemeId === schemeId && item.evaluatorAccountId === evaluatorAccountId).map((item) => ({ ...item, evidenceAssetIds: [...item.evidenceAssetIds] }));
  }

  summarize(scheme: PerformanceScheme, subjectAccountId: string): SubjectSummary {
    const rows = Array.from(this.assessments.values()).filter((item) => item.schemeId === scheme.id && item.subjectAccountId === subjectAccountId);
    const indicators = scheme.indicators.map((indicator) => {
      const scored = rows.filter((item) => item.indicatorId === indicator.id && item.score !== null).map((item) => item.score as number);
      return { indicatorId: indicator.id, name: indicator.name, weightPercent: indicator.weightPercent, averageScore: scored.length ? scored.reduce((sum, score) => sum + score, 0) / scored.length : null, assessments: rows.filter((item) => item.indicatorId === indicator.id).length };
    });
    return { subjectAccountId, indicators, ...weightedScore(indicators) };
  }

  private saveScheme(scheme: PerformanceScheme, actorAccountId: string, action: string): PerformanceScheme {
    const updated = { ...scheme, updatedAt: new Date().toISOString() };
    this.schemes.set(scheme.id, updated);
    this.audit.record({ action, module: "evaluation", entityType: "performance_scheme", entityId: scheme.id, actorAccountId, result: "SUCCESS", requestId: `local:${scheme.id}`, metadata: { version: scheme.version, totalWeight: totalWeight(scheme.indicators) } });
    return cloneScheme(updated);
  }
}

export function totalWeight(indicators: Array<Pick<PerformanceIndicator, "weightPercent">>): number {
  return indicators.reduce((sum, indicator) => sum + indicator.weightPercent, 0);
}

// Weighted percentage over indicators that have data only; coverage says how much weight that is.
export function weightedScore(indicators: { weightPercent: number; averageScore: number | null }[]): { weightedPercent: number | null; coveredWeightPercent: number } {
  const covered = indicators.filter((indicator) => indicator.averageScore !== null);
  const coveredWeightPercent = totalWeight(covered);
  if (!coveredWeightPercent) return { weightedPercent: null, coveredWeightPercent: 0 };
  const weighted = covered.reduce((sum, indicator) => sum + indicator.weightPercent * (indicator.averageScore! / 5), 0) / coveredWeightPercent * 100;
  return { weightedPercent: Math.round(weighted * 10) / 10, coveredWeightPercent };
}

export function getLocalPerformanceSheetService(): PerformanceSheetService {
  return new PerformanceSheetService(getLocalRecordDatabase(), getLocalAssetRepository());
}

function cloneScheme(scheme: PerformanceScheme): PerformanceScheme {
  return { ...scheme, indicators: scheme.indicators.map((indicator) => ({ ...indicator })) };
}
