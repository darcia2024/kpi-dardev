import { randomUUID } from "node:crypto";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";

type DraftStatus = "DRAFT" | "IN_REVIEW";
type DraftBase = { id: string; version: number; status: DraftStatus; authorAccountId: string; createdAt: string; updatedAt: string };

export type AiProviderDraft = DraftBase & {
  providerName: string;
  modelId: string;
  processingRegion: string;
  promptVersion: string;
};

export type AiPolicyDraft = DraftBase & {
  allowedDataClasses: string[];
  processingRegion: string;
  retentionDays: number | null;
  humanReviewRequired: boolean;
};

export type AiActivationReadiness = {
  enabled: false;
  blockers: string[];
  providerDraftCount: number;
  policyDraftCount: number;
};

export class LocalAiGovernanceService {
  private readonly providers: RecordCollection<AiProviderDraft>;
  private readonly policies: RecordCollection<AiPolicyDraft>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    this.providers = database ? new PersistentRecords(database, "ai-provider-drafts", []) : new Map();
    this.policies = database ? new PersistentRecords(database, "ai-policy-drafts", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  listProviders(): AiProviderDraft[] { return [...this.providers.values()].map((item) => ({ ...item })).sort(newest); }
  listPolicies(): AiPolicyDraft[] { return [...this.policies.values()].map((item) => ({ ...item, allowedDataClasses: [...item.allowedDataClasses] })).sort(newest); }

  saveProvider(input: Pick<AiProviderDraft, "providerName" | "modelId" | "processingRegion" | "promptVersion">, actorAccountId: string, id?: string, expectedVersion?: number): AiProviderDraft | null {
    const current = id ? this.providers.get(id) : undefined;
    if (id && (!current || current.authorAccountId !== actorAccountId || current.status !== "DRAFT" || current.version !== expectedVersion)) return null;
    const now = new Date().toISOString();
    const draft: AiProviderDraft = {
      id: current?.id ?? randomUUID(), version: (current?.version ?? 0) + 1, status: "DRAFT",
      authorAccountId: current?.authorAccountId ?? actorAccountId, createdAt: current?.createdAt ?? now, updatedAt: now,
      providerName: input.providerName.trim(), modelId: input.modelId.trim(), processingRegion: input.processingRegion.trim(), promptVersion: input.promptVersion.trim()
    };
    this.providers.set(draft.id, draft);
    this.audit.record({ action: "AI_PROVIDER_DRAFT_SAVED", module: "ai", entityType: "ai_provider_draft", entityId: draft.id, actorAccountId, result: "SUCCESS", requestId: `local:${draft.id}`, metadata: { version: draft.version } });
    return { ...draft };
  }

  submitProvider(id: string, version: number, actorAccountId: string): AiProviderDraft | null {
    const current = this.providers.get(id);
    if (!current || current.authorAccountId !== actorAccountId || current.status !== "DRAFT" || current.version !== version || !current.providerName || !current.modelId || !current.processingRegion || !current.promptVersion) return null;
    const updated: AiProviderDraft = { ...current, status: "IN_REVIEW", updatedAt: new Date().toISOString() };
    this.providers.set(id, updated);
    this.audit.record({ action: "AI_PROVIDER_DRAFT_SUBMITTED", module: "ai", entityType: "ai_provider_draft", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { version } });
    return { ...updated };
  }

  savePolicy(input: Pick<AiPolicyDraft, "allowedDataClasses" | "processingRegion" | "retentionDays" | "humanReviewRequired">, actorAccountId: string, id?: string, expectedVersion?: number): AiPolicyDraft | null {
    const current = id ? this.policies.get(id) : undefined;
    if (id && (!current || current.authorAccountId !== actorAccountId || current.status !== "DRAFT" || current.version !== expectedVersion)) return null;
    const now = new Date().toISOString();
    const draft: AiPolicyDraft = {
      id: current?.id ?? randomUUID(), version: (current?.version ?? 0) + 1, status: "DRAFT",
      authorAccountId: current?.authorAccountId ?? actorAccountId, createdAt: current?.createdAt ?? now, updatedAt: now,
      allowedDataClasses: [...new Set(input.allowedDataClasses.map((value) => value.trim()).filter(Boolean))],
      processingRegion: input.processingRegion.trim(), retentionDays: input.retentionDays, humanReviewRequired: input.humanReviewRequired
    };
    this.policies.set(draft.id, draft);
    this.audit.record({ action: "AI_POLICY_DRAFT_SAVED", module: "ai", entityType: "ai_policy_draft", entityId: draft.id, actorAccountId, result: "SUCCESS", requestId: `local:${draft.id}`, metadata: { version: draft.version } });
    return { ...draft, allowedDataClasses: [...draft.allowedDataClasses] };
  }

  submitPolicy(id: string, version: number, actorAccountId: string): AiPolicyDraft | null {
    const current = this.policies.get(id);
    if (!current || current.authorAccountId !== actorAccountId || current.status !== "DRAFT" || current.version !== version || !current.processingRegion || current.retentionDays === null || current.allowedDataClasses.length === 0 || !current.humanReviewRequired) return null;
    const updated: AiPolicyDraft = { ...current, status: "IN_REVIEW", updatedAt: new Date().toISOString() };
    this.policies.set(id, updated);
    this.audit.record({ action: "AI_POLICY_DRAFT_SUBMITTED", module: "ai", entityType: "ai_policy_draft", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { version } });
    return { ...updated, allowedDataClasses: [...updated.allowedDataClasses] };
  }

  readiness(): AiActivationReadiness {
    return {
      enabled: false,
      providerDraftCount: this.listProviders().length,
      policyDraftCount: this.listPolicies().length,
      blockers: ["Persetujuan resmi provider dan model belum tersedia.", "Kebijakan kelas data, wilayah pemrosesan, dan retensi belum disahkan.", "Kredensial, integrasi, serta pengujian keamanan provider belum tersedia."]
    };
  }
}

function newest<T extends DraftBase>(a: T, b: T): number { return b.updatedAt.localeCompare(a.updatedAt); }

export function getLocalAiGovernanceService(): LocalAiGovernanceService { return new LocalAiGovernanceService(getLocalRecordDatabase()); }
