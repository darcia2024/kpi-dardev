import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";
import { getLocalPrivateBlobStore } from "@/platform/storage/local-private-blob-store";

export const runtime = "nodejs";
const query = z.object({ id: z.string().uuid(), download: z.enum(["0", "1"]).default("0") });

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASSET_DOWNLOAD", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const url = new URL(request.url);
    const { id, download } = query.parse({ id: url.searchParams.get("id"), download: url.searchParams.get("download") ?? "0" });
    const repository = getLocalAssetRepository();
    const asset = repository.getVisible(id, identity.accountId);
    if (!asset || asset.organizationCode !== scope.organizationCode || asset.periodCode !== scope.periodCode || asset.status !== "AVAILABLE" || !asset.contentSha256) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    const bytes = await getLocalPrivateBlobStore().read(id);
    if (!bytes || createHash("sha256").update(bytes).digest("hex") !== asset.contentSha256) return errorResponse("INTERNAL_ERROR", requestId, 503);
    const inline = download === "0" && ["application/pdf", "image/png", "image/jpeg"].includes(asset.mimeType);
    const disposition = inline ? "inline" : "attachment";
    await repository.recordDownload(id, identity.accountId, disposition);
    const safeName = asset.fileName.replace(/[\r\n"\\]/g, "_");
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": asset.mimeType, "Content-Disposition": `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(asset.fileName)}`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("INTERNAL_ERROR", requestId, 500);
  }
}
