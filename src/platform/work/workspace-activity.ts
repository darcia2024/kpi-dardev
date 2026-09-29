import type { BusinessAuditRecord } from "@/platform/audit/local-business-audit-service";

export type WorkspaceActivity = {
  id: string;
  action: string;
  kind: "task" | "meeting";
  targetId: string;
  title: string;
  createdAt: string;
  isMine: boolean;
};

export function buildWorkspaceActivity(
  events: BusinessAuditRecord[],
  visibleTasks: Map<string, string>,
  visibleMeetings: Map<string, string>,
  accountId: string
): WorkspaceActivity[] {
  return events.flatMap((event) => {
    if (!event.entityId || event.result !== "SUCCESS") return [];
    const title = event.module === "task" ? visibleTasks.get(event.entityId)
      : event.module === "meeting" ? visibleMeetings.get(event.entityId) : undefined;
    if (!title) return [];
    return [{ id: event.id, action: event.action, kind: event.module as "task" | "meeting", targetId: event.entityId, title, createdAt: event.createdAt, isMine: event.actorAccountId === accountId }];
  }).sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 30);
}
