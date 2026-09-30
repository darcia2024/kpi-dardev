import { errorResponse } from "@/platform/http/response";
import { portalRoute } from "@/platform/http/portal-route";

// Accounts that tasks can be assigned or delegated to. Name and email only.
export async function GET(request: Request): Promise<Response> {
  return portalRoute(request, async (context, requestId) => {
    if (!context.can("TASK_CREATE")) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const accounts = (await context.listAssignableAccounts()).map(({ accountId, name, email }) => ({ accountId, name, email }));
    return Response.json({ accounts }, { headers: { "x-request-id": requestId, "Cache-Control": "private, no-store" } });
  });
}
