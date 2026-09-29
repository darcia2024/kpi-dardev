import { parseEnvironment } from "@/platform/config/environment";
import { errorResponse } from "@/platform/http/response";
import { getRequestId } from "@/platform/http/request-id";

export const runtime = "nodejs";

export function GET(request: Request): Response {
  const requestId = getRequestId(request.headers.get("x-request-id"));

  try {
    const environment = parseEnvironment(process.env);

    return Response.json(
      {
        status: "ok",
        environment: environment.KPI_APP_ENV,
        requestId
      },
      { headers: { "x-request-id": requestId } }
    );
  } catch {
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
