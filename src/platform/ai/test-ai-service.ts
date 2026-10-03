import { createHash, randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";

export type AiCitation = { sourceAssetId: string; title: string; version: number; excerpt: string };
export type AiPreview = { answer: string; citations: AiCitation[]; providerStatus: "NOT_CONFIGURED"; generatedAt: string };
export type AiActionPreview = { id: string; ownerAccountId: string; target: string; organizationCode: string; periodCode: string; payloadVersion: string; expiresAt: string; status: "PENDING_CONFIRMATION" | "CONFIRMED" };

export class TestAiService {
  private readonly actions: RecordCollection<AiActionPreview>;
  private readonly audit: LocalBusinessAuditService;
  constructor(private readonly assets = new TestAssetRepository(), database?: LocalRecordDatabase) {
    this.actions = database ? new PersistentRecords(database, "ai-actions", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  answer(question: string, accountId: string): AiPreview {
    void question;
    void accountId;
    return {
      answer: "AI belum dikonfigurasi dan belum ada dokumen yang dapat dijadikan sumber. Unggah dan sahkan dokumen terlebih dahulu sebelum menggunakan fitur ini.",
      citations: [],
      providerStatus: "NOT_CONFIGURED",
      generatedAt: new Date().toISOString()
    };
  }

  resolveCitation(sourceAssetId: string, version: number, accountId: string, organizationCode: string, periodCode: string): { sourceAssetId: string; version: number; fileName: string; href: string | null } | null {
    if (!this.assets.canUseEvidence(sourceAssetId, accountId, organizationCode, periodCode)) return null;
    const asset = this.assets.getVisible(sourceAssetId, accountId);
    if (!asset || asset.version !== version) return null;
    return { sourceAssetId, version, fileName: asset.fileName, href: asset.contentSha256 ? `/api/v1/documents/file?id=${encodeURIComponent(sourceAssetId)}` : null };
  }

  prepareAction(target: string, ownerAccountId: string, scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" }): AiActionPreview {
    const id = randomUUID();
    const payloadVersion = createHash("sha256").update(JSON.stringify({ id, ownerAccountId, target, scope })).digest("hex").slice(0, 16);
    const preview: AiActionPreview = { id, ownerAccountId, target, ...scope, payloadVersion, expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), status: "PENDING_CONFIRMATION" };
    this.actions.set(preview.id, preview);
    this.audit.record({ action: "AI_ACTION_PREPARED", module: "ai", entityType: "ai_action", entityId: preview.id, actorAccountId: ownerAccountId, result: "SUCCESS", requestId: `local:${preview.id}`, metadata: { payloadVersion: preview.payloadVersion, expiresAt: preview.expiresAt } });
    return { ...preview };
  }

  confirmAction(id: string, payloadVersion: string, accountId: string, now = Date.now(), scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" }): AiActionPreview | null {
    const action = this.actions.get(id);
    if (!action || action.ownerAccountId !== accountId || action.organizationCode !== scope.organizationCode || action.periodCode !== scope.periodCode || action.status !== "PENDING_CONFIRMATION" || action.payloadVersion !== payloadVersion || Date.parse(action.expiresAt) <= now) return null;
    const confirmed = { ...action, status: "CONFIRMED" as const };
    this.actions.set(id, confirmed);
    this.audit.record({ action: "AI_ACTION_CONFIRMED", module: "ai", entityType: "ai_action", entityId: id, actorAccountId: accountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { payloadVersion } });
    return { ...confirmed };
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalTestAiService(): TestAiService { return new TestAiService(getLocalAssetRepository(), getLocalRecordDatabase()); }
