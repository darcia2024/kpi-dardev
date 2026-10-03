import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";

const assetSchema = z.object({
  documentKey: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  fileName: z.string().trim().min(1).max(240),
  mimeType: z.string().trim().min(3).max(160),
  sizeBytes: z.number().int().positive().max(100_000_000),
  classification: z.enum(["INTERNAL", "RESTRICTED"])
});


export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASSET_DOWNLOAD", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ assets: (await getLocalAssetRepository().listVisible(identity.accountId)).filter((asset) => asset.organizationCode === testScope.organizationCode && asset.periodCode === testScope.periodCode) }, { headers: { "x-request-id": requestId } });
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASSET_UPLOAD", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = assetSchema.parse(await request.json());
    const asset = await getLocalAssetRepository().register({ ...input, ...testScope, ownerAccountId: identity.accountId });
    return Response.json({ asset }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
