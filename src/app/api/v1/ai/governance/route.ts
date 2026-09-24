import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalAiGovernanceService } from "@/platform/ai/local-ai-governance";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

export const runtime = "nodejs";
const reference = { id: z.string().uuid().optional(), expectedVersion: z.number().int().positive().optional() };
const inputSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("SAVE_PROVIDER"), ...reference, providerName: z.string().max(120), modelId: z.string().max(160), processingRegion: z.string().max(120), promptVersion: z.string().max(80) }).refine((value) => Boolean(value.id) === Boolean(value.expectedVersion)),
  z.object({ action: z.literal("SUBMIT_PROVIDER"), id: z.string().uuid(), version: z.number().int().positive() }),
  z.object({ action: z.literal("SAVE_POLICY"), ...reference, allowedDataClasses: z.array(z.string().trim().min(1).max(80)).max(12), processingRegion: z.string().max(120), retentionDays: z.number().int().min(0).max(3650).nullable(), humanReviewRequired: z.boolean() }).refine((value) => Boolean(value.id) === Boolean(value.expectedVersion)),
  z.object({ action: z.literal("SUBMIT_POLICY"), id: z.string().uuid(), version: z.number().int().positive() })
]);

async function access(request: Request) {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  if (!isTestAuthEnabled()) return { requestId, error: errorResponse("TEST_AUTH_DISABLED", requestId, 503) };
  const scope = await getSelectedPreviewScope();
  const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
  if (!identity) return { requestId, error: errorResponse("AUTHENTICATION_REQUIRED", requestId, 401) };
  if (!hasTestPermission(identity, "AI_READ", scope)) return { requestId, error: errorResponse("AUTHORIZATION_DENIED", requestId, 403) };
  return { requestId, identity, admin: hasTestPermission(identity, "SYSTEM_CONFIGURATION_READ") };
}

export async function GET(request: Request): Promise<Response> {
  const auth = await access(request);
  if (auth.error) return auth.error;
  try {
    const service = getLocalAiGovernanceService();
    return Response.json({ readiness: service.readiness(), canManage: !!auth.admin, providers: auth.admin ? service.listProviders() : [], policies: auth.admin ? service.listPolicies() : [] }, { headers: { "x-request-id": auth.requestId } });
  } catch { return errorResponse("INTERNAL_ERROR", auth.requestId, 500); }
}

export async function POST(request: Request): Promise<Response> {
  const auth = await access(request);
  if (auth.error) return auth.error;
  if (!auth.admin) return errorResponse("AUTHORIZATION_DENIED", auth.requestId, 403);
  try {
    const input = inputSchema.parse(await request.json());
    const service = getLocalAiGovernanceService();
    const actor = auth.identity.accountId;
    const draft = input.action === "SAVE_PROVIDER"
      ? service.saveProvider(input, actor, input.id, input.expectedVersion)
      : input.action === "SUBMIT_PROVIDER"
        ? service.submitProvider(input.id, input.version, actor)
        : input.action === "SAVE_POLICY"
          ? service.savePolicy(input, actor, input.id, input.expectedVersion)
          : service.submitPolicy(input.id, input.version, actor);
    return draft ? Response.json({ draft, readiness: service.readiness() }, { headers: { "x-request-id": auth.requestId } }) : errorResponse("AUTHENTICATION_INVALID", auth.requestId, 409);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return errorResponse("AUTHENTICATION_INVALID", auth.requestId, 400);
    return errorResponse("INTERNAL_ERROR", auth.requestId, 500);
  }
}
