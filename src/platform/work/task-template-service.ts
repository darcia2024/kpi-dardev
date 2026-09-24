import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import type { TestTaskService, TaskRecord } from "@/platform/work/task-service";

export type TaskTemplate = {
  id: string;
  title: string;
  version: number;
  organizationCode: string;
  periodCode: string;
  createdByAccountId: string;
  updatedAt: string;
};

export class TaskTemplateService {
  private readonly records: RecordCollection<TaskTemplate>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    this.records = database ? new PersistentRecords(database, "task-templates", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  list(organizationCode: string, periodCode: string): TaskTemplate[] {
    return Array.from(this.records.values()).filter((record) => record.organizationCode === organizationCode && record.periodCode === periodCode).map((record) => ({ ...record }));
  }

  create(input: Omit<TaskTemplate, "id" | "version" | "updatedAt">): TaskTemplate {
    if (input.title.trim().length < 3) throw new Error("Template title is too short.");
    const record: TaskTemplate = { ...input, id: randomUUID(), title: input.title.trim(), version: 1, updatedAt: new Date().toISOString() };
    this.records.set(record.id, record);
    this.audit.record({ action: "TASK_TEMPLATE_CREATED", module: "task", entityType: "task_template", entityId: record.id, actorAccountId: record.createdByAccountId, result: "SUCCESS", requestId: `local:${record.id}`, metadata: { version: record.version } });
    return { ...record };
  }

  revise(id: string, actorAccountId: string, title: string): TaskTemplate | null {
    const record = this.records.get(id);
    if (!record || record.createdByAccountId !== actorAccountId || title.trim().length < 3 || title.trim() === record.title) return null;
    const updated = { ...record, title: title.trim(), version: record.version + 1, updatedAt: new Date().toISOString() };
    this.records.set(id, updated);
    this.audit.record({ action: "TASK_TEMPLATE_REVISED", module: "task", entityType: "task_template", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { previousVersion: record.version, nextVersion: updated.version } });
    return { ...updated };
  }

  instantiate(input: { templateId: string; organizationCode: string; periodCode: string; ownerAccountId: string; createdByAccountId: string; dueAt?: string }, tasks: TestTaskService): TaskRecord | null {
    const template = this.records.get(input.templateId);
    if (!template || template.organizationCode !== input.organizationCode || template.periodCode !== input.periodCode) return null;
    const task = tasks.create({ title: template.title, organizationCode: input.organizationCode, periodCode: input.periodCode, ownerAccountId: input.ownerAccountId, createdByAccountId: input.createdByAccountId, dueAt: input.dueAt, sourceTemplateId: template.id, sourceTemplateVersion: template.version });
    this.audit.record({ action: "TASK_TEMPLATE_USED", module: "task", entityType: "task_template", entityId: template.id, actorAccountId: input.createdByAccountId, result: "SUCCESS", requestId: `local:${task.id}`, metadata: { templateVersion: template.version, taskId: task.id } });
    return task;
  }
}

export function getLocalTaskTemplateService(): TaskTemplateService {
  return new TaskTemplateService(getLocalRecordDatabase());
}
