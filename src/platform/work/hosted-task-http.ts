import { z } from "zod";
import { createHostedAuthClient, resolveHostedAccess } from "@/platform/identity/hosted-auth";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { hostedTaskActionSchema, hostedTaskCreateSchema, hostedTaskDetailSchema, hostedTaskSchema, hostedTaskScopeSchema } from "./hosted-task-contract";

export async function hostedTaskRequest(request: Request, taskId?: string): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    const mutate = request.method === "POST";
    if (mutate && request.headers.get("origin") !== new URL(request.url).origin) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if (mutate && Number(request.headers.get("content-length") || 0) > 32_000) return errorResponse("AUTHENTICATION_INVALID", requestId, 413);
    const client = await createHostedAuthClient();
    if (!client) return errorResponse("CONFIGURATION_INVALID", requestId, 503);
    const { data: auth, error: authError } = await client.auth.getUser();
    const identity = authError ? null : await resolveHostedAccess(client, auth.user);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (taskId) z.string().uuid().parse(taskId);
    let body: unknown;
    if (mutate) {
      const raw = await request.text();
      if (raw.length > 32_000) return errorResponse("TASK_INPUT_INVALID", requestId, 413);
      body = JSON.parse(raw);
    }
    let rpc: string;
    let args: Record<string, unknown>;
    if (taskId && mutate) {
      const input = hostedTaskActionSchema.parse(body);
      rpc = "kpi_task_action";
      args = { task_id: taskId, expected_version: input.expectedVersion, task_action: input.action, action_note: input.note };
    } else if (taskId) {
      rpc = "kpi_task_detail";
      args = { task_id: taskId };
    } else if (mutate) {
      const input = hostedTaskCreateSchema.parse(body);
      rpc = "kpi_task_create";
      args = { organization_code: input.organizationCode, period_code: input.periodCode, division_code: input.divisionCode, task_title: input.title, task_description: input.description, owner_id: input.ownerAccountId, request_key: input.idempotencyKey, deadline: input.dueAt };
    } else {
      const url = new URL(request.url);
      const scope = hostedTaskScopeSchema.parse({ organizationCode: url.searchParams.get("organizationCode"), periodCode: url.searchParams.get("periodCode"), divisionCode: url.searchParams.get("divisionCode") });
      rpc = "kpi_tasks_list";
      args = { organization_code: scope.organizationCode, period_code: scope.periodCode, division_code: scope.divisionCode };
    }
    const { data, error } = await client.rpc(rpc, args);
    if (error) return errorResponse(error.code === "42501" ? "AUTHORIZATION_DENIED" : error.code === "40001" ? "TASK_VERSION_CONFLICT" : error.code === "22023" ? "TASK_INPUT_INVALID" : "CONFIGURATION_INVALID", requestId, error.code === "42501" ? 403 : error.code === "40001" ? 409 : error.code === "22023" ? 400 : 503);
    const payload = rpc === "kpi_tasks_list" ? { tasks: z.array(hostedTaskSchema).parse(data) } : { task: rpc === "kpi_task_detail" ? hostedTaskDetailSchema.parse(data) : hostedTaskSchema.parse(data) };
    return Response.json(payload, { status: rpc === "kpi_task_create" ? 201 : 200, headers: { "x-request-id": requestId, "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return errorResponse("TASK_INPUT_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
