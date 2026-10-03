import { createHash, randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";

export type AspirationKind = "SARAN" | "PERTANYAAN" | "PENGADUAN";
export type CaseStatus = "RECEIVED" | "TRIAGED" | "IN_PROGRESS" | "CLOSED";
export type CaseUrgency = "LOW" | "NORMAL" | "HIGH";

export type SubmitAspirationInput = {
  periodCode?: string;
  kind: AspirationKind;
  subject: string;
  description: string;
  contact?: string;
  idempotencyKey: string;
  source?: "PORTAL_ASSISTANT";
  submittedByAccountId?: string;
};

export type AspirationRecord = SubmitAspirationInput & {
  periodCode: string;
  id: string;
  caseId: string;
  trackingTokenHash: string;
  status: CaseStatus;
  submittedAt: string;
  ownerAccountId?: string;
  urgency?: CaseUrgency;
  triageReason?: string;
  internalNotes: string[];
  publicUpdates: string[];
  triageIdempotencyKeys: string[];
  events?: CaseEvent[];
};

export type CaseEvent = { id: string; at: string; actorAccountId?: string; visibility: "PUBLIC" | "INTERNAL"; message: string; status: CaseStatus };
export type CaseDetail = Pick<AspirationRecord, "caseId" | "periodCode" | "kind" | "subject" | "description" | "status" | "submittedAt" | "ownerAccountId" | "urgency" | "triageReason" | "source"> & { events: CaseEvent[] };

export type PublicTracking = {
  caseId: string;
  status: CaseStatus;
  submittedAt: string;
  latestUpdate: string;
};

export type NotificationRecord = {
  id: string;
  event: "ASPIRATION_RECEIVED" | "CASE_TRIAGED" | "CASE_UPDATED";
  recipientType: "TRIAGE_QUEUE" | "REPORTER";
  caseId: string;
  status: "QUEUED" | "DELIVERING" | "SENT";
  attempts: number;
  sentAt?: string;
  nextAttemptAt: string;
  lastFailure?: string;
  claimToken?: string;
  claimedAt?: string;
  idempotencyKey: string;
  createdAt: string;
};

export type TriageInput = {
  caseId: string;
  actorAccountId: string;
  ownerAccountId: string;
  urgency: CaseUrgency;
  reason: string;
  internalNote: string;
  publicUpdate: string;
  idempotencyKey: string;
};

export class TestAspirationService {
  private readonly records: RecordCollection<AspirationRecord>;
  private readonly notifications: RecordCollection<NotificationRecord>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    this.records = database ? new PersistentRecords(database, "aspirations", []) : new Map();
    this.notifications = database ? new PersistentRecords(database, "notifications", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  submit(input: SubmitAspirationInput): { trackingToken: string; tracking: PublicTracking; created: boolean } {
    const existing = Array.from(this.records.values()).find((record) => record.idempotencyKey === input.idempotencyKey);
    if (existing) {
      return { trackingToken: createTrackingToken(existing.idempotencyKey), tracking: toPublicTracking(existing), created: false };
    }

    const trackingToken = createTrackingToken(input.idempotencyKey);
    const id = randomUUID();
    const record: AspirationRecord = {
      ...input,
      periodCode: input.periodCode ?? "2026_2027_TEST",
      id,
      caseId: `KPI-TST-${id.slice(0, 8).toUpperCase()}`,
      trackingTokenHash: hashToken(trackingToken),
      status: "RECEIVED",
      submittedAt: new Date().toISOString(),
      internalNotes: [],
      publicUpdates: [`${input.kind === "PENGADUAN" ? "Pengaduan" : "Aspirasi"} TEST telah diterima dalam antrean simulasi.`],
      triageIdempotencyKeys: [],
      events: [{ id: randomUUID(), at: new Date().toISOString(), visibility: "PUBLIC", message: `${input.kind === "PENGADUAN" ? "Pengaduan" : "Aspirasi"} TEST diterima.`, status: "RECEIVED" }]
    };
    this.records.set(id, record);
    this.queueNotification({ event: "ASPIRATION_RECEIVED", recipientType: "TRIAGE_QUEUE", caseId: record.caseId, idempotencyKey: `received:${input.idempotencyKey}` });
    this.audit.record({ action: "ASPIRATION_RECEIVED", module: "aspiration", entityType: "case", entityId: record.caseId, result: "SUCCESS", requestId: `local:${record.caseId}`, metadata: { kind: record.kind, status: record.status } });
    return { trackingToken, tracking: toPublicTracking(record), created: true };
  }

  track(trackingToken: string): PublicTracking | null {
    const record = Array.from(this.records.values()).find((candidate) => candidate.trackingTokenHash === hashToken(trackingToken));
    return record ? toPublicTracking(record) : null;
  }

  listCases(periodCode?: string): Array<Pick<AspirationRecord, "caseId" | "periodCode" | "kind" | "subject" | "status" | "submittedAt" | "ownerAccountId" | "urgency" | "source">> {
    return Array.from(this.records.values()).filter((record) => !periodCode || (record.periodCode ?? "2026_2027_TEST") === periodCode).map(({ caseId, periodCode, kind, subject, status, submittedAt, ownerAccountId, urgency, source }) => ({ caseId, periodCode: periodCode ?? "2026_2027_TEST", kind, subject, status, submittedAt, ownerAccountId, urgency, source }));
  }

  getCaseDetail(caseId: string): CaseDetail | null {
    const record = Array.from(this.records.values()).find((candidate) => candidate.caseId === caseId);
    if (!record) return null;
    const { kind, subject, description, status, submittedAt, ownerAccountId, urgency, triageReason, source } = record;
    return { caseId, periodCode: record.periodCode ?? "2026_2027_TEST", kind, subject, description, status, submittedAt, ownerAccountId, urgency, triageReason, source, events: [...(record.events ?? [])] };
  }

  triage(input: TriageInput): PublicTracking | null {
    const repeated = Array.from(this.records.values()).find((record) => record.triageIdempotencyKeys.includes(input.idempotencyKey));
    if (repeated) return toPublicTracking(repeated);
    const record = Array.from(this.records.values()).find((candidate) => candidate.caseId === input.caseId);
    if (!record || record.status !== "RECEIVED" || !input.ownerAccountId || input.reason.trim().length < 10) return null;
    const at = new Date().toISOString();
    const updated: AspirationRecord = { ...record, status: "TRIAGED", ownerAccountId: input.ownerAccountId, urgency: input.urgency, triageReason: input.reason.trim(), internalNotes: [...record.internalNotes, input.internalNote], publicUpdates: [...record.publicUpdates, input.publicUpdate], triageIdempotencyKeys: [...record.triageIdempotencyKeys, input.idempotencyKey], events: [...(record.events ?? []), { id: randomUUID(), at, actorAccountId: input.actorAccountId, visibility: "PUBLIC", message: input.publicUpdate, status: "TRIAGED" }, { id: randomUUID(), at, actorAccountId: input.actorAccountId, visibility: "INTERNAL", message: `${input.reason.trim()} · ${input.internalNote}`, status: "TRIAGED" }] };
    this.records.set(updated.id, updated);
    this.queueNotification({ event: "CASE_TRIAGED", recipientType: "REPORTER", caseId: record.caseId, idempotencyKey: `triaged:${input.idempotencyKey}` });
    this.audit.record({ action: "CASE_TRIAGED", module: "aspiration", entityType: "case", entityId: record.caseId, actorAccountId: input.actorAccountId, reason: input.reason.trim(), result: "SUCCESS", requestId: `local:${record.caseId}`, metadata: { previousStatus: record.status, nextStatus: updated.status, ownerAccountId: input.ownerAccountId, urgency: input.urgency } });
    return toPublicTracking(updated);
  }

  advanceCase(input: { caseId: string; actorAccountId: string; action: "START" | "UPDATE" | "CLOSE" | "REOPEN"; publicUpdate: string; internalNote: string }): CaseDetail | null {
    const record = Array.from(this.records.values()).find((candidate) => candidate.caseId === input.caseId);
    if (!record || !input.publicUpdate.trim() || !input.internalNote.trim()) return null;
    const nextStatus: CaseStatus | null = input.action === "START" && record.status === "TRIAGED" ? "IN_PROGRESS"
      : input.action === "UPDATE" && record.status === "IN_PROGRESS" ? "IN_PROGRESS"
        : input.action === "CLOSE" && record.status === "IN_PROGRESS" ? "CLOSED"
          : input.action === "REOPEN" && record.status === "CLOSED" ? "IN_PROGRESS" : null;
    if (!nextStatus || (record.ownerAccountId && record.ownerAccountId !== input.actorAccountId)) return null;
    const at = new Date().toISOString();
    const updated: AspirationRecord = { ...record, status: nextStatus, publicUpdates: [...record.publicUpdates, input.publicUpdate.trim()], internalNotes: [...record.internalNotes, input.internalNote.trim()], events: [...(record.events ?? []), { id: randomUUID(), at, actorAccountId: input.actorAccountId, visibility: "PUBLIC", message: input.publicUpdate.trim(), status: nextStatus }, { id: randomUUID(), at, actorAccountId: input.actorAccountId, visibility: "INTERNAL", message: input.internalNote.trim(), status: nextStatus }] };
    this.records.set(updated.id, updated);
    this.queueNotification({ event: "CASE_UPDATED", recipientType: "REPORTER", caseId: record.caseId, idempotencyKey: `updated:${updated.events?.at(-1)?.id}` });
    this.audit.record({ action: `CASE_${input.action}`, module: "aspiration", entityType: "case", entityId: record.caseId, actorAccountId: input.actorAccountId, result: "SUCCESS", requestId: `local:${record.caseId}`, metadata: { previousStatus: record.status, nextStatus } });
    return this.getCaseDetail(record.caseId);
  }

  listNotifications(periodCode?: string): Array<Omit<NotificationRecord, "claimToken">> {
    return Array.from(this.notifications.values()).filter((notification) => !periodCode || this.getCaseDetail(notification.caseId)?.periodCode === periodCode).map(({ claimToken: _claimToken, ...notification }) => ({ ...notification }));
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }

  claimNextNotification(now = new Date()): NotificationRecord | null {
    const leaseExpiredBefore = new Date(now.getTime() - 5 * 60_000).toISOString();
    const notification = Array.from(this.notifications.values())
      .filter((candidate) =>
        (candidate.status === "QUEUED" && (candidate.nextAttemptAt ?? candidate.createdAt) <= now.toISOString())
        || (candidate.status === "DELIVERING" && !!candidate.claimedAt && candidate.claimedAt <= leaseExpiredBefore))
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt))[0];
    if (!notification) return null;
    const updated: NotificationRecord = { ...notification, status: "DELIVERING", attempts: notification.attempts + 1, lastFailure: undefined, claimToken: randomUUID(), claimedAt: now.toISOString() };
    this.notifications.set(updated.id, updated);
    return { ...updated };
  }

  markNotificationSent(id: string, claimToken: string, now = new Date()): NotificationRecord | null {
    const notification = this.notifications.get(id);
    if (!notification || notification.status !== "DELIVERING" || notification.claimToken !== claimToken) return null;
    const updated: NotificationRecord = { ...notification, status: "SENT", sentAt: now.toISOString(), claimToken: undefined, claimedAt: undefined };
    this.notifications.set(id, updated);
    return { ...updated };
  }

  retryNotification(id: string, claimToken: string, failure: string, now = new Date()): NotificationRecord | null {
    const notification = this.notifications.get(id);
    if (!notification || notification.status !== "DELIVERING" || notification.claimToken !== claimToken || !failure.trim()) return null;
    const delayMinutes = Math.min(60, 2 ** Math.min(notification.attempts, 5));
    const nextAttemptAt = new Date(now.getTime() + delayMinutes * 60_000).toISOString();
    const updated: NotificationRecord = { ...notification, status: "QUEUED", lastFailure: failure.trim().slice(0, 500), nextAttemptAt, claimToken: undefined, claimedAt: undefined };
    this.notifications.set(id, updated);
    return { ...updated };
  }

  private queueNotification(input: Omit<NotificationRecord, "id" | "status" | "attempts" | "sentAt" | "nextAttemptAt" | "lastFailure" | "claimToken" | "claimedAt" | "createdAt">): NotificationRecord {
    const existing = Array.from(this.notifications.values()).find((notification) => notification.idempotencyKey === input.idempotencyKey);
    if (existing) return { ...existing };
    const createdAt = new Date().toISOString();
    const notification: NotificationRecord = { id: randomUUID(), ...input, status: "QUEUED", attempts: 0, nextAttemptAt: createdAt, createdAt };
    this.notifications.set(notification.id, notification);
    return { ...notification };
  }
}

export function getLocalAspirationService(): TestAspirationService {
  return new TestAspirationService(getLocalRecordDatabase());
}

function hashToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

function createTrackingToken(idempotencyKey: string): string {
  return `TST-${createHash("sha256").update(`kpi-local-test:${idempotencyKey}`).digest("hex").slice(0, 12).toUpperCase()}`;
}

function toPublicTracking(record: AspirationRecord): PublicTracking {
  return { caseId: record.caseId, status: record.status, submittedAt: record.submittedAt, latestUpdate: record.publicUpdates.at(-1) ?? "Belum ada pembaruan TEST." };
}
