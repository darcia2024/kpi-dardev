import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";

export type TaskStatus = "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "ACCEPTED" | "ARCHIVED";

export type TaskRecord = {
  id: string;
  title: string;
  organizationCode: string;
  periodCode: string;
  ownerAccountId: string;
  createdByAccountId: string;
  status: TaskStatus;
  progress: number;
  evidenceAssetId?: string;
  submittedByAccountId?: string;
  acceptedByAccountId?: string;
  sourceDecisionId?: string;
  sourceTemplateId?: string;
  sourceTemplateVersion?: number;
  dependencyTaskIds?: string[];
  dueAt?: string;
  closedAt?: string;
  updatedAt: string;
};

export class TestTaskService {
  private readonly records: RecordCollection<TaskRecord>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase, private readonly assets = new TestAssetRepository()) {
    const seed = new Map<string, TaskRecord>();
    if (process.env.NODE_TEST_CONTEXT) seed.set("00000000-0000-4000-8000-000000003001", { id: "00000000-0000-4000-8000-000000003001", title: "Rancang struktur halaman publik · TEST", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", ownerAccountId: "00000000-0000-4000-8000-000000000102", createdByAccountId: "00000000-0000-4000-8000-000000000101", status: "IN_PROGRESS", progress: 65, updatedAt: "2026-09-22T08:00:00.000Z" });
    this.records = database ? new PersistentRecords(database, "tasks", seed) : seed;
    this.audit = new LocalBusinessAuditService(database);
  }

  list(): TaskRecord[] {
    return Array.from(this.records.values()).map(cloneTask);
  }

  get(id: string): TaskRecord | null {
    const task = this.records.get(id);
    return task ? cloneTask(task) : null;
  }

  create(input: Omit<TaskRecord, "id" | "status" | "progress" | "updatedAt">): TaskRecord {
    if (input.dueAt && (!Number.isFinite(Date.parse(input.dueAt)) || Date.parse(input.dueAt) <= Date.now())) throw new Error("Task deadline must be in the future.");
    const dependencyTaskIds = [...new Set(input.dependencyTaskIds ?? [])];
    if (dependencyTaskIds.some((dependencyId) => { const dependency = this.records.get(dependencyId); return !dependency || dependency.organizationCode !== input.organizationCode || dependency.periodCode !== input.periodCode; })) throw new Error("Task dependency does not exist in this period.");
    const record: TaskRecord = { id: randomUUID(), ...input, dependencyTaskIds, status: "IN_PROGRESS", progress: 0, updatedAt: new Date().toISOString() };
    this.records.set(record.id, record);
    this.audit.record({ action: "TASK_CREATED", module: "task", entityType: "task", entityId: record.id, actorAccountId: record.createdByAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { sourceDecisionId: record.sourceDecisionId, dependencyCount: dependencyTaskIds.length } });
    return cloneTask(record);
  }

  submit(id: string, actorAccountId: string, evidenceAssetId: string): TaskRecord | null {
    const task = this.records.get(id);
    if (!task || task.ownerAccountId !== actorAccountId || task.status !== "IN_PROGRESS" || !evidenceAssetId) return null;
    if ((task.dependencyTaskIds ?? []).some((dependencyId) => this.records.get(dependencyId)?.status !== "ACCEPTED")) return null;
    if (!this.assets.canUseEvidence(evidenceAssetId, actorAccountId, task.organizationCode, task.periodCode)) return null;
    const updated: TaskRecord = { ...task, status: "IN_REVIEW", progress: 100, evidenceAssetId, submittedByAccountId: actorAccountId, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "TASK_SUBMITTED", module: "task", entityType: "task", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { status: updated.status, evidenceAssetId } });
    return cloneTask(updated);
  }

  review(id: string, reviewerAccountId: string, accepted: boolean, reason?: string): TaskRecord | null {
    const task = this.records.get(id);
    if (!task || task.status !== "IN_REVIEW" || task.ownerAccountId === reviewerAccountId || task.submittedByAccountId === reviewerAccountId || (!accepted && !reason?.trim())) return null;
    if (accepted && (!task.evidenceAssetId || !this.assets.canUseEvidence(task.evidenceAssetId, reviewerAccountId, task.organizationCode, task.periodCode))) return null;
    const updated: TaskRecord = accepted
      ? { ...task, status: "ACCEPTED", acceptedByAccountId: reviewerAccountId, updatedAt: new Date().toISOString() }
      : { ...task, status: "IN_PROGRESS", progress: 80, evidenceAssetId: undefined, submittedByAccountId: undefined, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: accepted ? "TASK_ACCEPTED" : "TASK_RETURNED", module: "task", entityType: "task", entityId: id, actorAccountId: reviewerAccountId, reason: reason?.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { status: updated.status } });
    return cloneTask(updated);
  }

  extendDeadline(id: string, actorAccountId: string, dueAt: string, reason: string): TaskRecord | null {
    const task = this.records.get(id);
    const next = Date.parse(dueAt);
    if (!task || task.createdByAccountId !== actorAccountId || task.status === "ARCHIVED" || task.status === "ACCEPTED" || !task.dueAt || !reason.trim() || !Number.isFinite(next) || next <= Date.now() || next <= Date.parse(task.dueAt)) return null;
    const updated = { ...task, dueAt: new Date(next).toISOString(), updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "TASK_DEADLINE_EXTENDED", module: "task", entityType: "task", entityId: id, actorAccountId, reason: reason.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { previousDueAt: task.dueAt, nextDueAt: updated.dueAt } });
    return cloneTask(updated);
  }

  delegate(id: string, actorAccountId: string, successorAccountId: string, reason: string): TaskRecord | null {
    const task = this.records.get(id);
    if (!task || task.createdByAccountId !== actorAccountId || !["IN_PROGRESS", "BLOCKED"].includes(task.status) || !reason.trim() || !successorAccountId || successorAccountId === task.ownerAccountId) return null;
    const updated: TaskRecord = { ...task, ownerAccountId: successorAccountId, status: "IN_PROGRESS", updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "TASK_DELEGATED", module: "task", entityType: "task", entityId: id, actorAccountId, reason: reason.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { previousOwnerAccountId: task.ownerAccountId, successorAccountId } });
    return cloneTask(updated);
  }

  close(id: string, actorAccountId: string, action: "CANCEL" | "ARCHIVE", reason: string): TaskRecord | null {
    const task = this.records.get(id);
    if (!task || task.createdByAccountId !== actorAccountId || !reason.trim()) return null;
    if (action === "CANCEL" && !["IN_PROGRESS", "BLOCKED"].includes(task.status)) return null;
    if (action === "ARCHIVE" && task.status !== "ACCEPTED") return null;
    const now = new Date().toISOString();
    const updated: TaskRecord = { ...task, status: "ARCHIVED", closedAt: now, updatedAt: now };
    this.records.set(id, updated);
    this.audit.record({ action: action === "CANCEL" ? "TASK_CANCELLED" : "TASK_ARCHIVED", module: "task", entityType: "task", entityId: id, actorAccountId, reason: reason.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { previousStatus: task.status, nextStatus: updated.status } });
    return cloneTask(updated);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalTaskService(): TestTaskService {
  return new TestTaskService(getLocalRecordDatabase(), getLocalAssetRepository());
}

function cloneTask(task: TaskRecord): TaskRecord {
  return { ...task, dependencyTaskIds: [...(task.dependencyTaskIds ?? [])] };
}
