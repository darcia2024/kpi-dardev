import assert from "node:assert/strict";
import test from "node:test";
import { TestMeetingService } from "../src/platform/work/meeting-service";
import { TestTaskService } from "../src/platform/work/task-service";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";

test("a TEST task requires evidence and a separate reviewer before acceptance", () => {
  const tasks = new TestTaskService();
  const task = tasks.list()[0];
  assert.equal(tasks.submit(task.id, pengurus, "00000000-0000-4000-8000-000000002001")?.status, "IN_REVIEW");
  assert.equal(tasks.review(task.id, pengurus, true), null);
  assert.equal(tasks.review(task.id, admin, true)?.status, "ACCEPTED");
  assert.equal(tasks.listAudit(task.id).at(-1)?.action, "TASK_ACCEPTED");
});

test("a final meeting minute can create one traceable follow-up task", () => {
  const tasks = new TestTaskService();
  const meetings = new TestMeetingService();
  const meeting = meetings.list()[0];
  assert.equal(meetings.createFollowUp(meeting.id, tasks, admin, pengurus, "Tindak lanjut TEST"), null);
  assert.equal(meetings.finalizeMinutes(meeting.id)?.minutesState, "FINAL");
  const followUp = meetings.createFollowUp(meeting.id, tasks, admin, pengurus, "Tindak lanjut TEST");
  assert.ok(followUp?.sourceDecisionId);
  assert.equal(followUp?.ownerAccountId, pengurus);
});

test("meeting minutes can be revised while draft but never after finalization", () => {
  const meetings = new TestMeetingService();
  const meeting = meetings.list()[0];
  assert.equal(meetings.reviseMinutes(meeting.id, "Ringkasan TEST yang direvisi.")?.minutesVersion, 2);
  assert.equal(meetings.finalizeMinutes(meeting.id)?.minutesState, "FINAL");
  assert.equal(meetings.reviseMinutes(meeting.id, "Perubahan terlambat."), null);
  assert.equal(meetings.listAudit(meeting.id).some((event) => event.action === "MEETING_MINUTES_REVISED"), true);
});

test("a TEST voter can submit one immutable choice per round", () => {
  const meetings = new TestMeetingService();
  const meeting = meetings.list()[0];
  assert.equal(meetings.castVote({ meetingId: meeting.id, round: 1, voterAccountId: pengurus, choice: "SETUJU" }), "SETUJU");
  assert.equal(meetings.castVote({ meetingId: meeting.id, round: 1, voterAccountId: pengurus, choice: "TUNDA" }), "SETUJU");
  assert.equal(meetings.castVote({ meetingId: meeting.id, round: 1, voterAccountId: "00000000-0000-4000-8000-000000000199", choice: "SETUJU" }), null);
  assert.equal(meetings.listAudit().filter((event) => event.action === "MEETING_VOTE_CAST").length, 1);
});
