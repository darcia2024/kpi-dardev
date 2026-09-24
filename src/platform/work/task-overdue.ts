import type { TaskStatus } from "@/platform/work/task-service";

export function isTaskOverdue(task: { status: TaskStatus; dueAt?: string }, now = Date.now()): boolean {
  if (!task.dueAt || !["IN_PROGRESS", "BLOCKED", "IN_REVIEW"].includes(task.status)) return false;
  const dueAt = Date.parse(task.dueAt);
  return Number.isFinite(dueAt) && dueAt < now;
}
