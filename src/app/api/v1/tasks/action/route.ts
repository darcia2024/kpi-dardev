import { z } from "zod";
import { errorResponse } from "@/platform/http/response";
import { portalRoute } from "@/platform/http/portal-route";
import { getLocalTaskService } from "@/platform/work/task-service";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("SUBMIT"), taskId: z.string().uuid(), evidenceAssetId: z.string().uuid(), note: z.string().trim().max(1_000).optional() }),
  z.object({ action: z.literal("ADD_SUBTASK"), taskId: z.string().uuid(), title: z.string().trim().min(2).max(180) }),
  z.object({ action: z.literal("SET_SUBTASK"), taskId: z.string().uuid(), subtaskId: z.string().uuid(), done: z.boolean() }),
  z.object({ action: z.literal("COMMENT"), taskId: z.string().uuid(), body: z.string().trim().min(1).max(2_000) }),
  z.object({ action: z.literal("START"), taskId: z.string().uuid() }),
  z.object({ action: z.literal("SET_BLOCKED"), taskId: z.string().uuid(), blocked: z.boolean(), reason: z.string().trim().max(500).optional() }),
  z.object({ action: z.literal("REVIEW"), taskId: z.string().uuid(), accepted: z.boolean(), reason: z.string().trim().max(500).optional() }),
  z.object({ action: z.literal("EXTEND_DEADLINE"), taskId: z.string().uuid(), dueAt: z.iso.datetime(), reason: z.string().trim().min(3).max(500) }),
  z.object({ action: z.literal("DELEGATE"), taskId: z.string().uuid(), successorAccountId: z.string().uuid(), reason: z.string().trim().min(3).max(500) }),
  z.object({ action: z.enum(["CANCEL", "ARCHIVE"]), taskId: z.string().uuid(), reason: z.string().trim().min(3).max(500) })
]);

export async function POST(request: Request): Promise<Response> {
  return portalRoute(request, async (context, requestId) => {
    let input: z.infer<typeof actionSchema>;
    try { input = actionSchema.parse(await request.json()); }
    catch { return errorResponse("AUTHENTICATION_INVALID", requestId, 400); }
    const service = getLocalTaskService();
    const existing = service.get(input.taskId);
    if (!existing || existing.organizationCode !== context.scope.organizationCode || existing.periodCode !== context.scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const actor = context.identity.accountId;
    if (input.action === "COMMENT") {
      const comment = context.can("TASK_READ") ? service.addComment(input.taskId, actor, input.body) : null;
      if (!comment) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      return Response.json({ comment }, { headers: { "x-request-id": requestId } });
    }
    const task = input.action === "SUBMIT"
      ? context.can("TASK_SUBMIT") ? service.submit(input.taskId, actor, input.evidenceAssetId, input.note) : null
      : input.action === "START"
        ? context.can("TASK_SUBMIT") ? service.start(input.taskId, actor) : null
      : input.action === "SET_BLOCKED"
        ? context.can("TASK_SUBMIT") ? service.setBlocked(input.taskId, actor, input.blocked, input.reason) : null
      : input.action === "ADD_SUBTASK"
        ? context.can("TASK_READ") ? service.addSubtask(input.taskId, actor, input.title) : null
      : input.action === "SET_SUBTASK"
        ? context.can("TASK_SUBMIT") ? service.setSubtaskDone(input.taskId, actor, input.subtaskId, input.done) : null
      : input.action === "REVIEW"
        ? context.can("TASK_REVIEW") ? service.review(input.taskId, actor, input.accepted, input.reason) : null
      : input.action === "EXTEND_DEADLINE"
        ? context.can("TASK_CREATE") ? service.extendDeadline(input.taskId, actor, input.dueAt, input.reason) : null
      : input.action === "DELEGATE"
        ? context.can("TASK_CREATE") && await context.isAssignableAccount(input.successorAccountId) ? service.delegate(input.taskId, actor, input.successorAccountId, input.reason) : null
      : context.can("TASK_CREATE") ? service.close(input.taskId, actor, input.action, input.reason) : null;
    if (!task) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ task }, { headers: { "x-request-id": requestId } });
  });
}
