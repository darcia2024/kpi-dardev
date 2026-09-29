import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";

const draftSchema = z.object({
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(2_000),
  body: z.string().trim().min(30).max(20_000),
  type: z.string().trim().min(2).max(80),
  meta: z.string().trim().min(2).max(80),
  href: z.string().startsWith("/").max(240),
  accent: z.enum(["red", "rose", "plum", "sand"]),
  locale: z.enum(["id", "en"]),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120)
});

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !["CONTENT_DRAFT_WRITE", "CONTENT_REVIEW", "CONTENT_PUBLISH"].some((permission) => hasTestPermission(identity, permission as "CONTENT_DRAFT_WRITE" | "CONTENT_REVIEW" | "CONTENT_PUBLISH", scope))) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const repository = getLocalContentRepository();
    const contentId = new URL(request.url).searchParams.get("contentId");
    if (contentId) {
      const id = z.string().uuid().parse(contentId);
      const record = await repository.getById(id);
      if (!record || record.organizationCode !== scope.organizationCode || record.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      return Response.json({ revisions: await repository.listRevisions(id) }, { headers: { "x-request-id": requestId } });
    }
    return Response.json({ records: (await repository.listAll()).filter((record) => record.organizationCode === scope.organizationCode && record.periodCode === scope.periodCode) }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "CONTENT_DRAFT_WRITE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = draftSchema.parse(await request.json());
    const record = await getLocalContentRepository().createDraft({ ...input, ...scope, authorAccountId: identity.accountId });
    return Response.json({ record }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
