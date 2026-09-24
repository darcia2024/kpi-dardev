import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import type { TestTaskService } from "@/platform/work/task-service";

export type MeetingRecord = {
  id: string;
  title: string;
  organizationCode: string;
  periodCode: string;
  startsAt: string;
  agenda?: string;
  minutesVersion: number;
  minutesState: "DRAFT" | "FINAL";
  minutesSummary: string;
  participantAccountIds: string[];
  decisionId?: string;
  archivedAt?: string;
};

export class TestMeetingService {
  private readonly meetings: RecordCollection<MeetingRecord>;
  private readonly votes: RecordCollection<{ choice: "SETUJU" | "TUNDA" }>;
  private readonly responses: RecordCollection<{ response: "HADIR" | "TIDAK_HADIR" | "RAGU"; updatedAt: string }>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    const seed = new Map<string, MeetingRecord>();
    if (process.env.NODE_TEST_CONTEXT) seed.set("00000000-0000-4000-8000-000000004001", { id: "00000000-0000-4000-8000-000000004001", title: "Rapat koordinasi fondasi · TEST", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", startsAt: "2026-09-24T17:00:00.000Z", minutesVersion: 1, minutesState: "DRAFT", minutesSummary: "Catatan rapat TEST belum difinalkan.", participantAccountIds: ["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"] });
    this.meetings = database ? new PersistentRecords(database, "meetings", seed) : seed;
    this.votes = database ? new PersistentRecords(database, "meeting-votes", []) : new Map();
    this.responses = database ? new PersistentRecords(database, "meeting-rsvp", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  list(): MeetingRecord[] {
    return Array.from(this.meetings.values()).map((meeting) => ({ ...meeting, participantAccountIds: [...meeting.participantAccountIds] }));
  }

  create(input: { title: string; organizationCode: string; periodCode: string; startsAt: string; agenda: string; participantAccountIds: string[]; actorAccountId: string }): MeetingRecord {
    if (input.title.trim().length < 3 || input.agenda.trim().length < 3 || !Number.isFinite(Date.parse(input.startsAt)) || Date.parse(input.startsAt) <= Date.now() || input.participantAccountIds.length === 0) throw new Error("Invalid meeting invitation.");
    const meeting: MeetingRecord = { id: randomUUID(), title: input.title.trim(), organizationCode: input.organizationCode, periodCode: input.periodCode, startsAt: input.startsAt, agenda: input.agenda.trim(), participantAccountIds: [...new Set(input.participantAccountIds)], minutesVersion: 1, minutesState: "DRAFT", minutesSummary: "Notulen belum ditulis." };
    this.meetings.set(meeting.id, meeting);
    this.audit.record({ action: "MEETING_CREATED", module: "meeting", entityType: "meeting", entityId: meeting.id, actorAccountId: input.actorAccountId, result: "SUCCESS", requestId: `local:${meeting.id}`, metadata: { participantCount: meeting.participantAccountIds.length, startsAt: meeting.startsAt } });
    return { ...meeting, participantAccountIds: [...meeting.participantAccountIds] };
  }

  respond(id: string, actorAccountId: string, response: "HADIR" | "TIDAK_HADIR" | "RAGU") {
    const meeting = this.meetings.get(id);
    if (!meeting || meeting.archivedAt || Date.parse(meeting.startsAt) <= Date.now() || !meeting.participantAccountIds.includes(actorAccountId)) return null;
    const record = { response, updatedAt: new Date().toISOString() };
    this.responses.set(`${id}:${actorAccountId}`, record);
    this.audit.record({ action: "MEETING_RSVP_UPDATED", module: "meeting", entityType: "meeting", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { response } });
    return { ...record };
  }

  getResponse(id: string, actorAccountId: string) {
    return this.responses.get(`${id}:${actorAccountId}`) ?? null;
  }

  finalizeMinutes(id: string, actorAccountId?: string): MeetingRecord | null {
    const meeting = this.meetings.get(id);
    if (!meeting || meeting.archivedAt || meeting.minutesState === "FINAL") return null;
    const updated = { ...meeting, minutesState: "FINAL" as const };
    this.meetings.set(id, updated);
    this.audit.record({ action: "MEETING_MINUTES_FINALIZED", module: "meeting", entityType: "meeting", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { minutesVersion: updated.minutesVersion } });
    return { ...updated };
  }

  reviseMinutes(id: string, summary: string, actorAccountId?: string): MeetingRecord | null {
    const meeting = this.meetings.get(id);
    if (!meeting || meeting.archivedAt || meeting.minutesState !== "DRAFT" || !summary.trim()) return null;
    const updated = { ...meeting, minutesSummary: summary.trim(), minutesVersion: meeting.minutesVersion + 1 };
    this.meetings.set(id, updated);
    this.audit.record({ action: "MEETING_MINUTES_REVISED", module: "meeting", entityType: "meeting", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { minutesVersion: updated.minutesVersion } });
    return { ...updated };
  }

  castVote(input: { meetingId: string; round: number; voterAccountId: string; choice: "SETUJU" | "TUNDA" }): "SETUJU" | "TUNDA" | null {
    const meeting = this.meetings.get(input.meetingId);
    if (!meeting || meeting.archivedAt || input.round < 1 || !meeting.participantAccountIds.includes(input.voterAccountId)) return null;
    const key = `${input.meetingId}:${input.round}:${input.voterAccountId}`;
    const existing = this.votes.get(key);
    if (existing) return existing.choice;
    this.votes.set(key, { choice: input.choice });
    this.audit.record({ action: "MEETING_VOTE_CAST", module: "meeting", entityType: "meeting_vote", entityId: key, actorAccountId: input.voterAccountId, result: "SUCCESS", requestId: `local:${key}`, metadata: { meetingId: input.meetingId, round: input.round, choice: input.choice } });
    return input.choice;
  }

  getVote(meetingId: string, round: number, voterAccountId: string): "SETUJU" | "TUNDA" | null {
    const meeting = this.meetings.get(meetingId);
    if (!meeting?.participantAccountIds.includes(voterAccountId)) return null;
    return this.votes.get(`${meetingId}:${round}:${voterAccountId}`)?.choice ?? null;
  }

  createFollowUp(meetingId: string, tasks: TestTaskService, creatorAccountId: string, ownerAccountId: string, title: string) {
    const meeting = this.meetings.get(meetingId);
    if (!meeting || meeting.archivedAt || meeting.minutesState !== "FINAL") return null;
    const decisionId = meeting.decisionId ?? randomUUID();
    this.meetings.set(meetingId, { ...meeting, decisionId });
    const task = tasks.create({ title, organizationCode: meeting.organizationCode, periodCode: meeting.periodCode, ownerAccountId, createdByAccountId: creatorAccountId, sourceDecisionId: decisionId });
    this.audit.record({ action: "MEETING_FOLLOW_UP_CREATED", module: "meeting", entityType: "meeting", entityId: meetingId, actorAccountId: creatorAccountId, result: "SUCCESS", requestId: `local:${meetingId}`, metadata: { decisionId, taskId: task.id } });
    return task;
  }

  archive(id: string, actorAccountId: string, reason: string): MeetingRecord | null {
    const meeting = this.meetings.get(id);
    if (!meeting || meeting.archivedAt || meeting.minutesState !== "FINAL" || reason.trim().length < 3) return null;
    const updated = { ...meeting, archivedAt: new Date().toISOString() };
    this.meetings.set(id, updated);
    this.audit.record({ action: "MEETING_ARCHIVED", module: "meeting", entityType: "meeting", entityId: id, actorAccountId, reason: reason.trim(), result: "SUCCESS", requestId: `local:${id}`, metadata: { minutesVersion: meeting.minutesVersion } });
    return { ...updated, participantAccountIds: [...updated.participantAccountIds] };
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

export function getLocalMeetingService(): TestMeetingService {
  return new TestMeetingService(getLocalRecordDatabase());
}
