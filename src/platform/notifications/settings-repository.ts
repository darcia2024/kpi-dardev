import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { defaultQuietHours, isValidClock, type QuietHours } from "@/platform/notifications/quiet-hours";

// Approval and account-security notices are mandatory and have no switch.
export type NoticePreference = { id: string; accountId: string; optionalInApp: boolean; taskReminders: boolean; announcements: boolean; emailDigest: boolean; quietHours: QuietHours; updatedAt: string };
export type NoticePreferenceChange = Partial<Pick<NoticePreference, "optionalInApp" | "taskReminders" | "announcements" | "emailDigest" | "quietHours">>;
const defaultPreference = { optionalInApp: true, taskReminders: true, announcements: true, emailDigest: false, quietHours: defaultQuietHours };
export type NoticeTemplate = { id: string; code: string; locale: "id" | "en"; title: string; body: string; version: number; status: "DRAFT" | "IN_REVIEW" | "REVIEWED"; authorAccountId: string; reviewerAccountId?: string; createdAt: string };

export class LocalNoticeSettingsRepository {
  private readonly preferences: RecordCollection<NoticePreference>;
  private readonly templates: RecordCollection<NoticeTemplate>;
  private readonly audit: LocalBusinessAuditService;
  constructor(database?: LocalRecordDatabase) {
    this.preferences = database ? new PersistentRecords(database, "notice-preferences", []) : new Map();
    this.templates = database ? new PersistentRecords(database, "notice-templates", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }
  getPreference(accountId: string): NoticePreference {
    // Older records only stored optionalInApp; fill the newer fields with defaults.
    const stored = this.preferences.get(accountId);
    return { ...defaultPreference, id: accountId, accountId, updatedAt: "", ...stored, quietHours: { ...defaultQuietHours, ...stored?.quietHours } };
  }
  savePreference(accountId: string, change: NoticePreferenceChange): NoticePreference | null {
    if (change.quietHours && (!isValidClock(change.quietHours.start) || !isValidClock(change.quietHours.end))) return null;
    const record: NoticePreference = { ...this.getPreference(accountId), ...change, updatedAt: new Date().toISOString() };
    this.preferences.set(accountId, record);
    this.audit.record({ action: "NOTICE_PREFERENCE_UPDATED", module: "notification", entityType: "account", entityId: accountId, actorAccountId: accountId, result: "SUCCESS", requestId: `local:${accountId}`, metadata: { changed: Object.keys(change).join(",") } });
    return { ...record, quietHours: { ...record.quietHours } };
  }
  listTemplates(): NoticeTemplate[] { return Array.from(this.templates.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  createTemplate(input: Pick<NoticeTemplate, "code" | "locale" | "title" | "body" | "authorAccountId">): NoticeTemplate {
    const matching = this.listTemplates().filter((item) => item.code === input.code && item.locale === input.locale);
    const record: NoticeTemplate = { ...input, id: randomUUID(), version: Math.max(0, ...matching.map((item) => item.version)) + 1, status: "DRAFT", createdAt: new Date().toISOString() };
    this.templates.set(record.id, record);
    this.audit.record({ action: "NOTICE_TEMPLATE_DRAFT_CREATED", module: "notification", entityType: "template", entityId: record.id, actorAccountId: input.authorAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { code: record.code, version: record.version, locale: record.locale } });
    return record;
  }
  submitTemplate(id: string, actorAccountId: string): NoticeTemplate | null {
    const current = this.templates.get(id);
    if (!current || current.authorAccountId !== actorAccountId || current.status !== "DRAFT") return null;
    const updated: NoticeTemplate = { ...current, status: "IN_REVIEW" };
    this.templates.set(id, updated);
    this.audit.record({ action: "NOTICE_TEMPLATE_SUBMITTED", module: "notification", entityType: "template", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { version: updated.version, locale: updated.locale } });
    return { ...updated };
  }
  reviewTemplate(id: string, reviewerAccountId: string): NoticeTemplate | null {
    const current = this.templates.get(id);
    if (!current || current.status !== "IN_REVIEW" || current.authorAccountId === reviewerAccountId) return null;
    const updated: NoticeTemplate = { ...current, status: "REVIEWED", reviewerAccountId };
    this.templates.set(id, updated);
    this.audit.record({ action: "NOTICE_TEMPLATE_REVIEWED", module: "notification", entityType: "template", entityId: id, actorAccountId: reviewerAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { version: updated.version, locale: updated.locale } });
    return { ...updated };
  }
}

export function getLocalNoticeSettingsRepository(): LocalNoticeSettingsRepository { return new LocalNoticeSettingsRepository(getLocalRecordDatabase()); }
