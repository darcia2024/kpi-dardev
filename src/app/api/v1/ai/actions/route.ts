import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalTestAiService } from "@/platform/ai/test-ai-service";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const inputSchema = z.discriminatedUnion("action", [z.object({ action: z.literal("PREPARE"), target: z.string().trim().min(3).max(160) }), z.object({ action: z.literal("CONFIRM"), actionId: z.string().uuid(), payloadVersion: z.string().trim().min(1).max(80) })]);
export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "AI_ACTION_CONFIRM", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = inputSchema.parse(await request.json());
    const service = getLocalTestAiService();
    const preview = input.action === "PREPARE" ? service.prepareAction(input.target, identity.accountId, testScope) : service.confirmAction(input.actionId, input.payloadVersion, identity.accountId, Date.now(), testScope);
    return preview ? Response.json({ preview }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
