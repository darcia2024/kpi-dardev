import { cookies } from "next/headers";
import { z } from "zod";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { transitionContent } from "@/platform/content/content-workflow";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";

const transitionSchema = z.object({ contentId: z.string().uuid(), targetState: z.enum(["DRAFT", "IN_REVIEW", "CHANGES_REQUESTED", "APPROVED", "PUBLISHED", "ARCHIVED"]), reason: z.string().trim().max(500).optional() });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    const input = transitionSchema.parse(await request.json());
    const repository = getLocalContentRepository();
    const current = await repository.getById(input.contentId);
    if (!current || current.organizationCode !== scope.organizationCode || current.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const result = await transitionContent({ repository, contentId: input.contentId, targetState: input.targetState, actor: identity, reason: input.reason });
    if (!result.ok) return errorResponse("AUTHORIZATION_DENIED", requestId, result.reason === "NOT_FOUND" ? 404 : 403);
    return Response.json({ record: result.record }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
