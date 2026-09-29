import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalMeetingService } from "@/platform/work/meeting-service";

const createSchema = z.object({ title: z.string().trim().min(3).max(180), startsAt: z.iso.datetime(), agenda: z.string().trim().min(3).max(5_000), participantAccountIds: z.array(z.string().uuid()).min(1).max(20) });
const previewAccountIds = ["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"];

export async function GET(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity || !hasTestPermission(identity, "MEETING_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const service = getLocalMeetingService();
    return Response.json({ meetings: service.list().filter((meeting) => meeting.organizationCode === testScope.organizationCode && meeting.periodCode === testScope.periodCode).map((meeting) => ({ ...meeting, myVote: service.getVote(meeting.id, 1, identity.accountId), myRsvp: service.getResponse(meeting.id, identity.accountId)?.response ?? null })) }, { headers: { "x-request-id": requestId } });
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
    if (!identity || !hasTestPermission(identity, "MEETING_MANAGE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const input = createSchema.parse(await request.json());
    if (input.participantAccountIds.some((id) => !previewAccountIds.includes(id))) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const meeting = getLocalMeetingService().create({ ...input, ...testScope, actorAccountId: identity.accountId });
    return Response.json({ meeting }, { status: 201, headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof Error && error.message === "Invalid meeting invitation.") return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
