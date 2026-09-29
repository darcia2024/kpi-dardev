import { cookies } from "next/headers";
import { z } from "zod";
import { blockingFailures } from "@/lib/content-preflight";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { publishChecksFor } from "@/platform/content/content-workflow";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";
import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";

const scheduleSchema = z.object({ contentId: z.string().uuid(), publishAt: z.iso.datetime().nullable() });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (!hasTestPermission(identity, "CONTENT_PUBLISH", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = scheduleSchema.parse(await request.json());
    const repository = getLocalContentRepository();
    const current = await repository.getById(input.contentId);
    if (!current || current.organizationCode !== scope.organizationCode || current.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if (input.publishAt) {
      const assets = getLocalAssetRepository();
      const checks = await publishChecksFor(repository, current, (assetId) => assets.getVisible(assetId, identity.accountId)?.status);
      if (blockingFailures(checks).length) return errorResponse("AUTHENTICATION_INVALID", requestId, 422);
    }
    const record = await repository.schedulePublish(input.contentId, identity.accountId, input.publishAt);
    return record ? Response.json({ record }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHENTICATION_INVALID", requestId, 400);
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
