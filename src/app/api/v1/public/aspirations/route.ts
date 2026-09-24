import { z } from "zod";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getLocalAspirationService } from "@/platform/intake/aspiration-service";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";
import { getLocalDirectoryService } from "@/platform/identity/local-directory-service";

const submissionSchema = z.object({
  kind: z.enum(["SARAN", "PERTANYAAN", "PENGADUAN"]),
  subject: z.string().trim().min(3).max(180),
  description: z.string().trim().min(20).max(4_000),
  contact: z.string().email().max(254).optional().or(z.literal("")),
  consent: z.literal(true),
  website: z.literal("").optional(),
  idempotencyKey: z.string().uuid()
});

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const input = submissionSchema.parse(await request.json());
    if (input.website) return errorResponse("AUTHORIZATION_DENIED", requestId, 400);
    const activePeriod = getLocalDirectoryService().listPeriods().find((period) => period.status === "ACTIVE");
    const result = getLocalAspirationService().submit({ kind: input.kind, subject: input.subject, description: input.description, contact: input.contact || undefined, idempotencyKey: input.idempotencyKey, periodCode: activePeriod?.code ?? "2026_2027_TEST" });
    return Response.json(result, { status: result.created ? 201 : 200, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
