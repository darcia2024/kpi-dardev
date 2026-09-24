import { getSelectedPreviewScope } from "@/platform/identity/preview-period-context";
import { cookies } from "next/headers";
import { z } from "zod";
import { hasTestPermission } from "@/platform/authorization/permissions";
import { getRequestId } from "@/platform/http/request-id";
import { errorResponse } from "@/platform/http/response";
import { getTestSession, isTestAuthEnabled, sessionCookieName } from "@/platform/identity/test-auth";
import { getLocalMeetingService } from "@/platform/work/meeting-service";
import { getLocalTaskService } from "@/platform/work/task-service";

const actionSchema = z.discriminatedUnion("action", [z.object({ action: z.literal("RSVP"), meetingId: z.string().uuid(), response: z.enum(["HADIR", "TIDAK_HADIR", "RAGU"]) }), z.object({ action: z.literal("FINALIZE_MINUTES"), meetingId: z.string().uuid() }), z.object({ action: z.literal("REVISE_MINUTES"), meetingId: z.string().uuid(), summary: z.string().trim().min(3).max(5_000) }), z.object({ action: z.literal("VOTE"), meetingId: z.string().uuid(), round: z.number().int().positive(), choice: z.enum(["SETUJU", "TUNDA"]) }), z.object({ action: z.literal("CREATE_FOLLOW_UP"), meetingId: z.string().uuid(), title: z.string().trim().min(3).max(180), ownerAccountId: z.string().uuid() }), z.object({ action: z.literal("ARCHIVE"), meetingId: z.string().uuid(), reason: z.string().trim().min(3).max(500) })]);

export async function POST(request: Request): Promise<Response> {
  const requestId = getRequestId(request.headers.get("x-request-id"));
  try {
    if (!isTestAuthEnabled()) return errorResponse("TEST_AUTH_DISABLED", requestId, 503);
    const testScope = await getSelectedPreviewScope();
    const identity = getTestSession((await cookies()).get(sessionCookieName)?.value);
    if (!identity) return errorResponse("AUTHENTICATION_REQUIRED", requestId, 401);
    const input = actionSchema.parse(await request.json());
    const meetings = getLocalMeetingService();
    const existing = meetings.list().find((meeting) => meeting.id === input.meetingId);
    if (!existing || existing.organizationCode !== testScope.organizationCode || existing.periodCode !== testScope.periodCode) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    if (input.action === "RSVP") {
      if (!hasTestPermission(identity, "MEETING_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      const response = meetings.respond(input.meetingId, identity.accountId, input.response);
      return response ? Response.json({ response }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    }
    if (input.action === "VOTE") {
      if (!hasTestPermission(identity, "MEETING_READ", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
      const choice = meetings.castVote({ meetingId: input.meetingId, round: input.round, voterAccountId: identity.accountId, choice: input.choice });
      return choice ? Response.json({ choice }, { headers: { "x-request-id": requestId } }) : errorResponse("AUTHORIZATION_DENIED", requestId, 404);
    }
    if (!hasTestPermission(identity, "MEETING_MANAGE", testScope)) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    const result = input.action === "FINALIZE_MINUTES"
      ? meetings.finalizeMinutes(input.meetingId, identity.accountId)
      : input.action === "REVISE_MINUTES"
        ? meetings.reviseMinutes(input.meetingId, input.summary, identity.accountId)
        : input.action === "CREATE_FOLLOW_UP"
          ? meetings.createFollowUp(input.meetingId, getLocalTaskService(), identity.accountId, input.ownerAccountId, input.title)
          : meetings.archive(input.meetingId, identity.accountId, input.reason);
    if (!result) return errorResponse("AUTHORIZATION_DENIED", requestId, 403);
    return Response.json({ result }, { headers: { "x-request-id": requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) return errorResponse("AUTHENTICATION_INVALID", requestId, 400);
    return errorResponse("CONFIGURATION_INVALID", requestId, 503);
  }
}
