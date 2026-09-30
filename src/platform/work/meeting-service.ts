import { randomUUID } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type RecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import type { TestTaskService } from "@/platform/work/task-service";

// TUNDA is kept only for votes recorded before motions existed.
export type VoteChoice = "SETUJU" | "TOLAK" | "ABSTAIN" | "TUNDA";
export type AttendanceStatus = "HADIR" | "IZIN" | "TIDAK_HADIR";
// Eligible voters and present count are snapshotted when the motion opens (Q08).
export type Motion = { round: number; text: string; openedAt: string; closedAt?: string; eligibleAccountIds: string[]; presentAtOpen: number };
export type MotionOutcome = "ACCEPTED" | "REJECTED" | "NO_QUORUM" | "PENDING_RULE";
export type MotionView = Omit<Motion, "eligibleAccountIds"> & { eligibleCount: number; votesCast: number; tally?: { SETUJU: number; TOLAK: number; ABSTAIN: number }; outcome?: MotionOutcome };

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
  // Quorum is a per-meeting preview value until KPI sets the official rule (Q08).
  quorumMinPresent?: number;
  attendance?: Record<string, AttendanceStatus>;
  motions?: Motion[];
};

export class TestMeetingService {
  private readonly meetings: RecordCollection<MeetingRecord>;
  // meetingId/round are stored on the record so tallies can be computed; older votes only have choice.
  private readonly votes: RecordCollection<{ choice: VoteChoice; meetingId?: string; round?: number }>;
  private readonly responses: RecordCollection<{ response: "HADIR" | "TIDAK_HADIR" | "RAGU"; updatedAt: string }>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: RecordDatabase) {
    const seed = new Map<string, MeetingRecord>();
    if (process.env.NODE_TEST_CONTEXT) seed.set("00000000-0000-4000-8000-000000004001", { id: "00000000-0000-4000-8000-000000004001", title: "Rapat koordinasi fondasi · TEST", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", startsAt: "2026-09-24T17:00:00.000Z", minutesVersion: 1, minutesState: "DRAFT", minutesSummary: "Catatan rapat TEST belum difinalkan.", participantAccountIds: ["00000000-0000-4000-8000-000000000101", "00000000-0000-4000-8000-000000000102"] });
    this.meetings = database ? new PersistentRecords(database, "meetings", seed) : seed;
    this.votes = database ? new PersistentRecords(database, "meeting-votes", []) : new Map();
    this.responses = database ? new PersistentRecords(database, "meeting-rsvp", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  list(): MeetingRecord[] {
    return Array.from(this.meetings.values()).map(cloneMeeting);
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

  castVote(input: { meetingId: string; round: number; voterAccountId: string; choice: VoteChoice }): VoteChoice | null {
    const meeting = this.meetings.get(input.meetingId);
    if (!meeting || meeting.archivedAt || input.round < 1 || !meeting.participantAccountIds.includes(input.voterAccountId)) return null;
    if (meeting.motions?.length) {
      const motion = meeting.motions.find((candidate) => candidate.round === input.round);
      if (!motion || motion.closedAt || !motion.eligibleAccountIds.includes(input.voterAccountId) || input.choice === "TUNDA") return null;
    }
    const key = `${input.meetingId}:${input.round}:${input.voterAccountId}`;
    const existing = this.votes.get(key);
    if (existing) return existing.choice;
    this.votes.set(key, { choice: input.choice, meetingId: input.meetingId, round: input.round });
    this.audit.record({ action: "MEETING_VOTE_CAST", module: "meeting", entityType: "meeting_vote", entityId: key, actorAccountId: input.voterAccountId, result: "SUCCESS", requestId: `local:${key}`, metadata: { meetingId: input.meetingId, round: input.round, choice: input.choice } });
    return input.choice;
  }

  getVote(meetingId: string, round: number, voterAccountId: string): VoteChoice | null {
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

  setQuorum(id: string, actorAccountId: string, minPresent: number): MeetingRecord | null {
    const meeting = this.meetings.get(id);
    if (!meeting || meeting.archivedAt || meeting.minutesState === "FINAL" || !Number.isInteger(minPresent) || minPresent < 1 || minPresent > meeting.participantAccountIds.length) return null;
    return this.save({ ...meeting, quorumMinPresent: minPresent }, actorAccountId, "MEETING_QUORUM_SET", { minPresent });
  }

  recordAttendance(id: string, actorAccountId: string, accountId: string, status: AttendanceStatus): MeetingRecord | null {
    const meeting = this.meetings.get(id);
    if (!meeting || meeting.archivedAt || meeting.minutesState === "FINAL" || !meeting.participantAccountIds.includes(accountId)) return null;
    return this.save({ ...meeting, attendance: { ...meeting.attendance, [accountId]: status } }, actorAccountId, "MEETING_ATTENDANCE_RECORDED", { accountId, status });
  }

  openMotion(id: string, actorAccountId: string, text: string): MeetingRecord | null {
    const meeting = this.meetings.get(id);
    const clean = text.trim();
    if (!meeting || meeting.archivedAt || meeting.minutesState === "FINAL" || clean.length < 5 || meeting.motions?.some((motion) => !motion.closedAt)) return null;
    // Legacy votes recorded before motions existed must not leak into a new motion's tally.
    const round = Math.max(this.lastLegacyRound(id), ...(meeting.motions ?? []).map((motion) => motion.round)) + 1;
    const present = presentAccounts(meeting);
    const attendanceTaken = Object.keys(meeting.attendance ?? {}).length > 0;
    const motion: Motion = { round, text: clean, openedAt: new Date().toISOString(), eligibleAccountIds: attendanceTaken ? present : [...meeting.participantAccountIds], presentAtOpen: present.length };
    if (!motion.eligibleAccountIds.length) return null;
    return this.save({ ...meeting, motions: [...(meeting.motions ?? []), motion] }, actorAccountId, "MEETING_MOTION_OPENED", { round, eligibleCount: motion.eligibleAccountIds.length });
  }

  closeMotion(id: string, actorAccountId: string): MeetingRecord | null {
    const meeting = this.meetings.get(id);
    const open = meeting?.motions?.find((motion) => !motion.closedAt);
    if (!meeting || !open || meeting.archivedAt) return null;
    const closedAt = new Date().toISOString();
    return this.save({ ...meeting, motions: meeting.motions!.map((motion) => motion.round === open.round ? { ...motion, closedAt } : motion) }, actorAccountId, "MEETING_MOTION_CLOSED", { round: open.round, ...this.tally(id, open.round) });
  }

  // Secret ballot: individual choices are never exposed, and totals only after the motion closes.
  motionViews(id: string): MotionView[] {
    const meeting = this.meetings.get(id);
    return (meeting?.motions ?? []).map(({ eligibleAccountIds, ...motion }) => {
      const tally = this.tally(id, motion.round);
      const votesCast = tally.SETUJU + tally.TOLAK + tally.ABSTAIN;
      if (!motion.closedAt) return { ...motion, eligibleCount: eligibleAccountIds.length, votesCast };
      return { ...motion, eligibleCount: eligibleAccountIds.length, votesCast, tally, outcome: motionOutcome(meeting!.quorumMinPresent, motion.presentAtOpen, tally) };
    });
  }

  private tally(meetingId: string, round: number): { SETUJU: number; TOLAK: number; ABSTAIN: number } {
    const result = { SETUJU: 0, TOLAK: 0, ABSTAIN: 0 };
    for (const vote of this.votes.values()) if (vote.meetingId === meetingId && vote.round === round) result[vote.choice === "TUNDA" ? "ABSTAIN" : vote.choice] += 1;
    return result;
  }

  // The pre-motion UI only ever voted in round 1.
  private lastLegacyRound(meetingId: string): number {
    const meeting = this.meetings.get(meetingId);
    return meeting?.participantAccountIds.some((accountId) => this.votes.get(`${meetingId}:1:${accountId}`)) ? 1 : 0;
  }

  private save(meeting: MeetingRecord, actorAccountId: string, action: string, metadata: Record<string, unknown>): MeetingRecord {
    this.meetings.set(meeting.id, meeting);
    this.audit.record({ action, module: "meeting", entityType: "meeting", entityId: meeting.id, actorAccountId, result: "SUCCESS", requestId: `local:${meeting.id}`, metadata });
    return cloneMeeting(meeting);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

function cloneMeeting(meeting: MeetingRecord): MeetingRecord {
  return { ...meeting, participantAccountIds: [...meeting.participantAccountIds], attendance: meeting.attendance ? { ...meeting.attendance } : undefined, motions: meeting.motions?.map((motion) => ({ ...motion, eligibleAccountIds: [...motion.eligibleAccountIds] })) };
}

export function presentAccounts(meeting: MeetingRecord): string[] {
  return meeting.participantAccountIds.filter((accountId) => meeting.attendance?.[accountId] === "HADIR");
}

// Simple majority of Setuju over Tolak is a preview rule; without a quorum value nothing is declared valid.
export function motionOutcome(quorumMinPresent: number | undefined, presentAtOpen: number, tally: { SETUJU: number; TOLAK: number }): MotionOutcome {
  if (!quorumMinPresent) return "PENDING_RULE";
  if (presentAtOpen < quorumMinPresent) return "NO_QUORUM";
  return tally.SETUJU > tally.TOLAK ? "ACCEPTED" : "REJECTED";
}

export function getLocalMeetingService(): TestMeetingService {
  return new TestMeetingService(getLocalRecordDatabase());
}
