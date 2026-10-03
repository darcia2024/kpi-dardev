import { z } from "zod";
import { hostedTaskScopeSchema } from "./hosted-task-contract";

export const meetingCreateSchema = hostedTaskScopeSchema.extend({
  title: z.string().trim().min(3).max(180), agenda: z.string().trim().min(3).max(6000),
  startsAt: z.string().datetime({ offset: true }), participantAccountIds: z.array(z.string().uuid()).min(1).max(100),
  idempotencyKey: z.string().uuid()
}).strict();
const actionBase = { expectedVersion: z.number().int().positive(), note: z.string().trim().min(3).max(2000) };
export const meetingActionSchema = z.discriminatedUnion("action", [
  z.object({ ...actionBase, action: z.literal("SAVE_MINUTES"), summary: z.string().trim().min(3).max(16000) }).strict(),
  z.object({ ...actionBase, action: z.enum(["SUBMIT_MINUTES", "APPROVE_MINUTES", "REQUEST_REVISION", "ARCHIVE"]) }).strict(),
  z.object({ ...actionBase, action: z.literal("RSVP"), response: z.enum(["HADIR", "TIDAK_HADIR", "RAGU"]) }).strict(),
  z.object({ ...actionBase, action: z.literal("ATTENDANCE"), accountId: z.string().uuid(), attendance: z.enum(["HADIR", "IZIN", "TIDAK_HADIR"]) }).strict(),
  z.object({ ...actionBase, action: z.literal("OPEN_MOTION"), text: z.string().trim().min(3).max(2000), quorum: z.number().int().min(1).max(100) }).strict(),
  z.object({ ...actionBase, action: z.literal("VOTE"), motionId: z.string().uuid(), choice: z.enum(["SETUJU", "TOLAK", "ABSTAIN"]) }).strict(),
  z.object({ ...actionBase, action: z.literal("CLOSE_MOTION"), motionId: z.string().uuid() }).strict()
]);
export const meetingSchema = z.object({
  id: z.string().uuid(), title: z.string(), agenda: z.string(), startsAt: z.string(),
  divisionCode: z.string().nullable(), createdByAccountId: z.string().uuid(), minutesAuthorId: z.string().uuid().nullable(),
  minutesSummary: z.string(), status: z.enum(["DRAFT", "IN_REVIEW", "REVISION", "FINAL", "ARCHIVED"]),
  version: z.number().int(), updatedAt: z.string(),
  participants: z.array(z.object({ accountId: z.string().uuid(), name: z.string(), response: z.string().nullable(), attendance: z.string().nullable() })),
  motions: z.array(z.object({ id: z.string().uuid(), text: z.string(), quorum: z.number(), eligibleCount: z.number(), votesCast: z.number(), closedAt: z.string().nullable(), tally: z.object({ SETUJU: z.number(), TOLAK: z.number(), ABSTAIN: z.number() }).nullable() })),
  events: z.array(z.object({ action: z.string(), actorName: z.string(), note: z.string(), version: z.number(), createdAt: z.string() }))
});
export type HostedMeeting = z.infer<typeof meetingSchema>;
