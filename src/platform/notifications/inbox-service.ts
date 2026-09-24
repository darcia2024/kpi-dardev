import type { TaskRecord } from "@/platform/work/task-service";
import type { BusinessAuditRecord } from "@/platform/audit/local-business-audit-service";

export type InboxNotice = {
  id: string;
  recipientAccountId: string;
  title: string;
  description: string;
  href: string;
  createdAt: string;
  readAt?: string;
};

export function taskAssignmentNotices(tasks: TaskRecord[], audit: BusinessAuditRecord[], recipientAccountId: string, organizationCode: string, periodCode: string): InboxNotice[] {
  const createdAt = new Map(audit.filter((event) => event.action === "TASK_CREATED" && event.result === "SUCCESS" && event.entityId).map((event) => [event.entityId, event.createdAt]));
  return tasks
    .filter((task) => task.organizationCode === organizationCode && task.periodCode === periodCode && task.ownerAccountId === recipientAccountId && task.createdByAccountId !== recipientAccountId)
    .map((task) => ({ id: `task-assigned:${task.id}`, recipientAccountId, title: "Tugas ditugaskan kepada Anda", description: task.title, href: "/portal/tugas", createdAt: createdAt.get(task.id) ?? task.updatedAt }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
