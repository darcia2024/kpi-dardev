import { RecordConflictError } from "@/platform/data/local-record-store";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { runInPortal, type PortalContext } from "@/platform/identity/portal-context";

/**
 * Shared entry for portal API routes. Resolves the account (local TEST or
 * hosted), runs the handler with the matching storage, and turns a failed
 * commit into a 409 so the browser never sees success for unsaved changes.
 */
export async function portalRoute(
  request: Request,
  handler: (context: PortalContext, requestId: string) => Promise<Response>,
  options: { include?: readonly string[] } = {}
): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    const outcome = await runInPortal((context) => handler(context, requestId), options);
    if (outcome.status === "READY") return outcome.value;
    if (outcome.status === "ANONYMOUS") return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    if (outcome.status === "DISABLED") return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    return errorResponse("SERVICE_NOT_READY", requestId, 503);
  } catch (error) {
    if (error instanceof RecordConflictError) return errorResponse("CONFLICT", requestId, 409);
    // Only the error type is logged: messages may contain record content.
    console.error(`[portal-route] ${requestId} ${error instanceof Error ? error.name : "unknown error"}`);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
