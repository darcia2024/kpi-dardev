import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type RecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalAssetRepository, TestAssetRepository } from "@/platform/storage/asset-repository";

export type TaskStatus = "IN_PROGRESS" | "BLOCKED" | "IN_REVIEW" | "ACCEPTED" | "ARCHIVED";
export type Subtask = { id: string; title: string; done: boolean; doneByAccountId?: string; doneAt?: string };
export type TaskComment = { id: string; taskId: string; authorAccountId: string; body: string; createdAt: string };

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
  subtasks?: Subtask[];
  submissionNote?: string;
  // Set when the owner starts work; tasks without it sit in the board's "Belum dikerjakan" column.
  startedAt?: string;
  blockedReason?: string;
  dueAt?: string;
  closedAt?: string;
  updatedAt: string;
};

export class TestTaskService {
  private readonly records: RecordCollection<TaskRecord>;
  private readonly comments: RecordCollection<TaskComment>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: RecordDatabase, private readonly assets = new TestAssetRepository()) {
    const seed = new Map<string, TaskRecord>();
    if (process.env.NODE_TEST_CONTEXT) seed.set("00000000-0000-4000-8000-000000003001", { id: "00000000-0000-4000-8000-000000003001", title: "Rancang struktur halaman publik · TEST", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", ownerAccountId: "00000000-0000-4000-8000-000000000102", createdByAccountId: "00000000-0000-4000-8000-000000000101", status: "IN_PROGRESS", progress: 65, updatedAt: "2026-09-22T08:00:00.000Z" });
    this.records = database ? new PersistentRecords(database, "tasks", seed) : seed;
    this.comments = database ? new PersistentRecords(database, "task-comments", []) : new Map();
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

  submit(id: string, actorAccountId: string, evidenceAssetId: string, note?: string): TaskRecord | null {
    const task = this.records.get(id);
    if (!task || task.ownerAccountId !== actorAccountId || task.status !== "IN_PROGRESS" || !evidenceAssetId) return null;
    if ((task.dependencyTaskIds ?? []).some((dependencyId) => this.records.get(dependencyId)?.status !== "ACCEPTED")) return null;
    // Q04: every subtask done makes the parent ready to submit; review is still required.
    if ((task.subtasks ?? []).some((subtask) => !subtask.done)) return null;
    if (!this.assets.canUseEvidence(evidenceAssetId, actorAccountId, task.organizationCode, task.periodCode)) return null;
    const updated: TaskRecord = { ...task, status: "IN_REVIEW", progress: 100, evidenceAssetId, submissionNote: note?.trim() || undefined, submittedByAccountId: actorAccountId, startedAt: task.startedAt ?? new Date().toISOString(), updatedAt: new Date().toISOString() };
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
      : { ...task, status: "IN_PROGRESS", progress: subtaskProgress(task.subtasks) ?? 80, evidenceAssetId: undefined, submissionNote: undefined, submittedByAccountId: undefined, updatedAt: new Date().toISOString() };
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

  start(id: string, ownerAccountId: string): TaskRecord | null {
    const task = this.records.get(id);
    if (!task || task.ownerAccountId !== ownerAccountId || task.status !== "IN_PROGRESS" || task.startedAt) return null;
    const now = new Date().toISOString();
    const updated: TaskRecord = { ...task, startedAt: now, updatedAt: now };
    this.records.set(id, updated);
    this.audit.record({ action: "TASK_STARTED", module: "task", entityType: "task", entityId: id, actorAccountId: ownerAccountId, result: "SUCCESS", requestId: `local:${id}` });
    return cloneTask(updated);
  }

  // Blocking keeps the task with its owner but stops submission until it is resumed.
  setBlocked(id: string, ownerAccountId: string, blocked: boolean, reason?: string): TaskRecord | null {
    const task = this.records.get(id);
    if (!task || task.ownerAccountId !== ownerAccountId || task.status !== (blocked ? "IN_PROGRESS" : "BLOCKED")) return null;
    if (blocked && !reason?.trim()) return null;
    const now = new Date().toISOString();
    const updated: TaskRecord = { ...task, status: blocked ? "BLOCKED" : "IN_PROGRESS", blockedReason: blocked ? reason!.trim() : undefined, startedAt: task.startedAt ?? now, updatedAt: now };
    this.records.set(id, updated);
    this.audit.record({ action: blocked ? "TASK_BLOCKED" : "TASK_RESUMED", module: "task", entityType: "task", entityId: id, actorAccountId: ownerAccountId, reason: reason?.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { status: updated.status } });
    return cloneTask(updated);
  }

  addSubtask(id: string, actorAccountId: string, title: string): TaskRecord | null {
    const task = this.records.get(id);
    const clean = title.trim();
    if (!task || ![task.ownerAccountId, task.createdByAccountId].includes(actorAccountId) || !["IN_PROGRESS", "BLOCKED"].includes(task.status) || clean.length < 2 || clean.length > 180 || (task.subtasks?.length ?? 0) >= 30) return null;
    const subtasks = [...(task.subtasks ?? []), { id: randomUUID(), title: clean, done: false }];
    const updated: TaskRecord = { ...task, subtasks, progress: subtaskProgress(subtasks) ?? task.progress, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "TASK_SUBTASK_ADDED", module: "task", entityType: "task", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { subtaskCount: subtasks.length } });
    return cloneTask(updated);
  }

  setSubtaskDone(id: string, actorAccountId: string, subtaskId: string, done: boolean): TaskRecord | null {
    const task = this.records.get(id);
    if (!task || task.ownerAccountId !== actorAccountId || !["IN_PROGRESS", "BLOCKED"].includes(task.status)) return null;
    const target = task.subtasks?.find((subtask) => subtask.id === subtaskId);
    if (!target || target.done === done) return null;
    const now = new Date().toISOString();
    const subtasks = task.subtasks!.map((subtask) => subtask.id === subtaskId ? done ? { ...subtask, done, doneByAccountId: actorAccountId, doneAt: now } : { id: subtask.id, title: subtask.title, done } : subtask);
    const updated: TaskRecord = { ...task, subtasks, progress: subtaskProgress(subtasks) ?? task.progress, startedAt: task.startedAt ?? (done ? now : undefined), updatedAt: now };
    this.records.set(id, updated);
    this.audit.record({ action: done ? "TASK_SUBTASK_DONE" : "TASK_SUBTASK_REOPENED", module: "task", entityType: "task", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { subtaskId, progress: updated.progress } });
    return cloneTask(updated);
  }

  addComment(id: string, authorAccountId: string, body: string): TaskComment | null {
    const task = this.records.get(id);
    const clean = body.trim();
    if (!task || task.status === "ARCHIVED" || !clean || clean.length > 2_000) return null;
    const comment: TaskComment = { id: randomUUID(), taskId: id, authorAccountId, body: clean, createdAt: new Date().toISOString() };
    this.comments.set(comment.id, comment);
    this.audit.record({ action: "TASK_COMMENTED", module: "task", entityType: "task", entityId: id, actorAccountId: authorAccountId, result: "SUCCESS", requestId: `local:${comment.id}` });
    return { ...comment };
  }

  listComments(id: string): TaskComment[] {
    return Array.from(this.comments.values()).filter((comment) => comment.taskId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((comment) => ({ ...comment }));
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalTaskService(): TestTaskService {
  return new TestTaskService(getLocalRecordDatabase(), getLocalAssetRepository());
}

function cloneTask(task: TaskRecord): TaskRecord {
  return { ...task, dependencyTaskIds: [...(task.dependencyTaskIds ?? [])], subtasks: task.subtasks?.map((subtask) => ({ ...subtask })) };
}

// Progress follows subtasks up to 90%; the last 10% comes from an accepted submission.
function subtaskProgress(subtasks?: Subtask[]): number | null {
  if (!subtasks?.length) return null;
  return Math.round(subtasks.filter((subtask) => subtask.done).length / subtasks.length * 90);
}
