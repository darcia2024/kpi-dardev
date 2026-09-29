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
  // True while the recipient still has something to do; drives the "Perlu tindakan" filter.
  actionRequired?: boolean;
};

export function taskAssignmentNotices(tasks: TaskRecord[], audit: BusinessAuditRecord[], recipientAccountId: string, organizationCode: string, periodCode: string): InboxNotice[] {
  const createdAt = new Map(audit.filter((event) => event.action === "TASK_CREATED" && event.result === "SUCCESS" && event.entityId).map((event) => [event.entityId, event.createdAt]));
  return tasks
    .filter((task) => task.organizationCode === organizationCode && task.periodCode === periodCode && task.ownerAccountId === recipientAccountId && task.createdByAccountId !== recipientAccountId)
    .map((task) => ({ id: `task-assigned:${task.id}`, recipientAccountId, title: "Tugas ditugaskan kepada Anda", description: task.title, href: `/portal/tugas?task=${task.id}`, createdAt: createdAt.get(task.id) ?? task.updatedAt, actionRequired: ["IN_PROGRESS", "BLOCKED"].includes(task.status) }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

// Reviewers see submitted work they may decide on; owners and submitters never review themselves.
export function taskReviewNotices(tasks: TaskRecord[], audit: BusinessAuditRecord[], reviewerAccountId: string, organizationCode: string, periodCode: string): InboxNotice[] {
  const submittedAt = new Map<string, string>();
  for (const event of audit) if (event.action === "TASK_SUBMITTED" && event.result === "SUCCESS" && event.entityId) submittedAt.set(event.entityId, event.createdAt);
  return tasks
    .filter((task) => task.organizationCode === organizationCode && task.periodCode === periodCode && task.status === "IN_REVIEW" && task.ownerAccountId !== reviewerAccountId && task.submittedByAccountId !== reviewerAccountId)
    .map((task) => ({ id: `task-review:${task.id}`, recipientAccountId: reviewerAccountId, title: "Bukti tugas menunggu diperiksa", description: task.title, href: `/portal/tugas?task=${task.id}`, createdAt: submittedAt.get(task.id) ?? task.updatedAt, actionRequired: true }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
