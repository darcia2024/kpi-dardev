import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";

const schema = z.object({ contentId: z.string().uuid(), expectedVersion: z.number().int().positive(), mediaAssetId: z.string().uuid().nullable() });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "CONTENT_DRAFT_WRITE", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = schema.parse(await request.json());
    const repository = getLocalContentRepository();
    const content = await repository.getById(input.contentId);
    if (!content || content.organizationCode !== scope.organizationCode || content.periodCode !== scope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if (input.mediaAssetId) {
      const asset = getLocalAssetRepository().getVisible(input.mediaAssetId, identity.accountId);
      if (!asset || asset.status !== "AVAILABLE" || !asset.contentSha256 || asset.organizationCode !== scope.organizationCode || asset.periodCode !== scope.periodCode || !["image/jpeg", "image/png"].includes(asset.mimeType)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    }
    const record = await repository.attachMedia(input.contentId, identity.accountId, input.expectedVersion, input.mediaAssetId);
    return record ? Response.json({ record }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 409);
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("INTERNAL_ERROR", requestId, 500);
  }
}
