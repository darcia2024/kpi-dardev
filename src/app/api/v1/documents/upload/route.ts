import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalAssetRepository } from "@/platform/storage/asset-repository";
import { getLocalPrivateBlobStore } from "@/platform/storage/local-private-blob-store";
import { evaluateUpload } from "@/platform/storage/upload-policy";

export const runtime = "nodejs";
const fields = z.object({ documentKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), classification: z.enum(["INTERNAL", "RESTRICTED"]) });
const policy = { maxBytes: 25_000_000, allowedMimeTypes: ["application/pdf", "application/msword", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/jpeg", "image/png", "application/zip"] };

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const scope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "ASSET_UPLOAD", scope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const form = await request.formData();
    const file = form.get("file");
    const input = fields.parse({ documentKey: form.get("documentKey"), classification: form.get("classification") });
    if (!(file instanceof File) || file.name.length < 1 || file.name.length > 240) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    const candidate = { fileName: file.name, mimeType: file.type, sizeBytes: file.size };
    if (!evaluateUpload(candidate, policy).allowed) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.byteLength !== file.size) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    const repository = getLocalAssetRepository();
    const asset = await repository.register({ ...candidate, ...input, ...scope, ownerAccountId: identity.accountId });
    const sha256 = await getLocalPrivateBlobStore().save(asset.id, bytes);
    const stored = await repository.attachContent(asset.id, identity.accountId, sha256);
    if (!stored) return errorResponse("INTERNAL_ERROR", requestId, 500);
    return Response.json({ asset: stored }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof TypeError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("INTERNAL_ERROR", requestId, 500);
  }
}
