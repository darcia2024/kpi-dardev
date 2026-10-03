import { z } from "zod";
import { createHostedAuthClient, resolveHostedAccess } from "@/platform/identity/hosted-auth";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { hostedTaskScopeSchema } from "./hosted-task-contract";
import { meetingActionSchema, meetingCreateSchema, meetingSchema } from "./hosted-meeting-contract";

export async function hostedMeetingRequest(request: Request, id?: string): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    const mutate = request.method === "POST";
    if (mutate && request.headers.get("origin") !== new URL(request.url).origin) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const client = await createHostedAuthClient();
    if (!client) return errorResponse("CONFIGURATION_INVALID", requestId, 503);
    const { data: auth, error: authError } = await client.auth.getUser();
    if (authError || !await resolveHostedAccess(client, auth.user)) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (id) z.string().uuid().parse(id);
    let body: unknown;
    if (mutate) {
      if (Number(request.headers.get("content-length") || 0) > 48000) return errorResponse("WORK_INPUT_INVALID", requestId, 413);
      const text = await request.text();
      if (new TextEncoder().encode(text).length > 48000) return errorResponse("WORK_INPUT_INVALID", requestId, 413);
      body = JSON.parse(text);
    }
    let rpc: string; let args: Record<string, unknown>;
    if (id && mutate) {
      const input = meetingActionSchema.parse(body);
      rpc = "kpi_meeting_action"; args = { meeting_id: id, expected_version: input.expectedVersion, command: input.action, input };
    } else if (id) { rpc = "kpi_meeting_detail"; args = { meeting_id: id }; }
    else if (mutate) {
      const input = meetingCreateSchema.parse(body);
      rpc = "kpi_meeting_create"; args = { organization_code: input.organizationCode, period_code: input.periodCode, division_code: input.divisionCode, input };
    } else {
      const url = new URL(request.url);
      const scope = hostedTaskScopeSchema.parse({ organizationCode: url.searchParams.get("organizationCode"), periodCode: url.searchParams.get("periodCode"), divisionCode: url.searchParams.get("divisionCode") });
      rpc = "kpi_meetings_list"; args = { organization_code: scope.organizationCode, period_code: scope.periodCode, division_code: scope.divisionCode };
    }
    const { data, error } = await client.rpc(rpc, args);
    if (error) return errorResponse(error.code === "42501" ? "AUTHORIZATION_DENIED" : error.code === "40001" ? "WORK_VERSION_CONFLICT" : error.code === "22023" ? "WORK_INPUT_INVALID" : "CONFIGURATION_INVALID", requestId, error.code === "42501" ? 403 : error.code === "40001" ? 409 : error.code === "22023" ? 400 : 503);
    const value = rpc === "kpi_meetings_list" ? { meetings: z.array(meetingSchema).parse(data) } : { meeting: meetingSchema.parse(data) };
    return Response.json(value, { status: rpc === "kpi_meeting_create" ? 201 : 200, headers: { "x-request-id": requestId, "Cache-Control": "private, no-store" } });
  } catch (error) {
    return errorResponse(error instanceof z.ZodError || error instanceof SyntaxError ? "WORK_INPUT_INVALID" : "CONFIGURATION_INVALID", requestId, error instanceof z.ZodError || error instanceof SyntaxError ? 400 : 503);
  }
}
