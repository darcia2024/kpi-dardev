import { z } from "zod";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getLocalAspirationService } from "@/platform/intake/aspiration-service";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

const trackingSchema = z.object({ trackingToken: z.string().trim().regex(/^TST-[A-Z0-9]{12}$/) });

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const { trackingToken } = trackingSchema.parse(await request.json());
    const tracking = getLocalAspirationService().track(trackingToken);
    if (!tracking) return errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    return Response.json({ tracking }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
