import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";

const schema = z.object({ contentId: z.string().uuid(), expectedVersion: z.number().int().positive(), title: z.string().trim().min(3).max(180), description: z.string().trim().min(10).max(2_000), body: z.string().trim().min(30).max(20_000).optional() });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "CONTENT_DRAFT_WRITE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = schema.parse(await request.json());
    const repository = getLocalContentRepository();
    const existing = await repository.getById(input.contentId);
    if (!existing || existing.organizationCode !== testScope.organizationCode || existing.periodCode !== testScope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const record = await repository.updateDraft(input.contentId, identity.accountId, input.expectedVersion, input.title, input.description, input.body);
    return record ? Response.json({ record }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 409);
  } catch (error) {
    return error instanceof z.ZodError ? errorResponse("AUTHENTICATION_INVALID", requestId, 400) : errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
