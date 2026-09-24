import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import type { ContentState } from "@/platform/workflow/content-lifecycle";

export type PublicationAccent = "red" | "rose" | "plum" | "sand";

export type ContentRecord = {
  id: string;
  organizationCode: string;
  periodCode: string;
  slug: string;
  title: string;
  description: string;
  body?: string;
  type: string;
  meta: string;
  href: string;
  accent: PublicationAccent;
  locale: "id" | "en";
  state: ContentState;
  version: number;
  authorAccountId: string;
  mediaAssetId?: string;
};

export type CreateDraftInput = Pick<ContentRecord, "title" | "description" | "body" | "type" | "meta" | "href" | "accent" | "locale" | "authorAccountId"> & {
  slug: string;
  organizationCode: string;
  periodCode: string;
};

export type ContentRevision = { id: string; contentId: string; version: number; recordedAt: string; actorAccountId?: string; snapshot: ContentRecord };

export interface ContentRepository {
  listAll(): Promise<ContentRecord[]>;
  listPublished(locale?: ContentRecord["locale"]): Promise<ContentRecord[]>;
  getById(id: string): Promise<ContentRecord | null>;
  listRevisions(id: string): Promise<ContentRevision[]>;
  createDraft(input: CreateDraftInput): Promise<ContentRecord>;
  updateDraft(id: string, actorAccountId: string, expectedVersion: number, title: string, description: string, body?: string): Promise<ContentRecord | null>;
  attachMedia(id: string, actorAccountId: string, expectedVersion: number, mediaAssetId: string | null): Promise<ContentRecord | null>;
  setState(id: string, state: ContentState, actorAccountId?: string, reason?: string): Promise<ContentRecord | null>;
}

export class TestContentRepository implements ContentRepository {
  private readonly records: RecordCollection<ContentRecord>;
  private readonly revisions: RecordCollection<ContentRevision>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    const seed = new Map<string, ContentRecord>();
    if (process.env.NODE_TEST_CONTEXT) {
      const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };
      seed.set("00000000-0000-4000-8000-000000001001", { id: "00000000-0000-4000-8000-000000001001", ...scope, slug: "mengenal-kpi", title: "Mengenal Komisi Peduli Interaksi", description: "Ringkasan kedudukan, mandat, prinsip kerja, serta ruang lingkup KPI sebagai Badan Semi Otonom PPMI Mesir.", type: "Pedoman", meta: "Tentang KPI", href: "/publik", accent: "red", locale: "id", state: "PUBLISHED", version: 1, authorAccountId: "00000000-0000-4000-8000-000000000101" });
    }
    this.records = database ? new PersistentRecords(database, "content", seed) : seed;
    this.revisions = database ? new PersistentRecords(database, "content-revisions", []) : new Map();
    for (const record of this.records.values()) {
      if (!this.revisions.get(`${record.id}:${record.version}`)) this.saveRevision(record);
    }
    this.audit = new LocalBusinessAuditService(database);
  }

  private saveRevision(record: ContentRecord, actorAccountId?: string): void {
    const id = `${record.id}:${record.version}`;
    if (this.revisions.get(id)) return;
    this.revisions.set(id, { id, contentId: record.id, version: record.version, recordedAt: new Date().toISOString(), actorAccountId, snapshot: clone(record) });
  }

  async listAll(): Promise<ContentRecord[]> {
    return Array.from(this.records.values()).map(clone).sort((a, b) => a.title.localeCompare(b.title, "id"));
  }

  async listPublished(locale: ContentRecord["locale"] = "id"): Promise<ContentRecord[]> {
    return (await this.listAll()).filter((record) => record.state === "PUBLISHED" && record.locale === locale);
  }

  async getById(id: string): Promise<ContentRecord | null> {
    const record = this.records.get(id);
    return record ? clone(record) : null;
  }

  async listRevisions(id: string): Promise<ContentRevision[]> {
    return Array.from(this.revisions.values()).filter((revision) => revision.contentId === id).sort((a, b) => b.version - a.version).map((revision) => ({ ...revision, snapshot: clone(revision.snapshot) }));
  }

  async createDraft(input: CreateDraftInput): Promise<ContentRecord> {
    const duplicate = Array.from(this.records.values()).some((record) => record.slug === input.slug && record.locale === input.locale && record.organizationCode === input.organizationCode && record.periodCode === input.periodCode);
    if (duplicate) throw new Error("Content slug already exists in this locale and scope.");
    const record: ContentRecord = { id: randomUUID(), ...input, state: "DRAFT", version: 1 };
    this.records.set(record.id, record);
    this.saveRevision(record, record.authorAccountId);
    this.audit.record({ action: "CONTENT_DRAFT_CREATED", module: "content", entityType: "content", entityId: record.id, actorAccountId: record.authorAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { state: record.state, version: record.version, locale: record.locale } });
    return clone(record);
  }

  async updateDraft(id: string, actorAccountId: string, expectedVersion: number, title: string, description: string, body?: string): Promise<ContentRecord | null> {
    const existing = this.records.get(id);
    if (!existing || existing.authorAccountId !== actorAccountId || existing.version !== expectedVersion || !["DRAFT", "CHANGES_REQUESTED"].includes(existing.state)) return null;
    const updated: ContentRecord = { ...existing, title: title.trim(), description: description.trim(), ...(body === undefined ? {} : { body: body.trim() }), state: "DRAFT", version: existing.version + 1 };
    this.records.set(id, updated);
    this.saveRevision(updated, actorAccountId);
    this.audit.record({ action: "CONTENT_DRAFT_UPDATED", module: "content", entityType: "content", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousVersion: existing.version, version: updated.version } });
    return clone(updated);
  }

  async attachMedia(id: string, actorAccountId: string, expectedVersion: number, mediaAssetId: string | null): Promise<ContentRecord | null> {
    const existing = this.records.get(id);
    if (!existing || existing.authorAccountId !== actorAccountId || existing.version !== expectedVersion || !["DRAFT", "CHANGES_REQUESTED"].includes(existing.state)) return null;
    const updated: ContentRecord = { ...existing, mediaAssetId: mediaAssetId ?? undefined, version: existing.version + 1 };
    this.records.set(id, updated);
    this.saveRevision(updated, actorAccountId);
    this.audit.record({ action: "CONTENT_MEDIA_CHANGED", module: "content", entityType: "content", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousVersion: existing.version, version: updated.version, hasMedia: !!mediaAssetId } });
    return clone(updated);
  }

  async setState(id: string, state: ContentState, actorAccountId?: string, reason?: string): Promise<ContentRecord | null> {
    const existing = this.records.get(id);
    if (!existing) return null;
    const updated = { ...existing, state, version: existing.version + 1 };
    this.records.set(id, updated);
    this.saveRevision(updated, actorAccountId);
    this.audit.record({ action: "CONTENT_STATE_CHANGED", module: "content", entityType: "content", entityId: id, actorAccountId, reason: reason?.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { previousState: existing.state, nextState: updated.state, version: updated.version } });
    return clone(updated);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalContentRepository(): ContentRepository {
  return new TestContentRepository(getLocalRecordDatabase());
}

function clone(record: ContentRecord): ContentRecord {
  return { ...record };
}
