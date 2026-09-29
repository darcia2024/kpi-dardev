import assert from "node:assert/strict";
import test from "node:test";
import { TestMeetingService } from "../src/platform/work/meeting-service";
import { TestTaskService } from "../src/platform/work/task-service";

test("a final meeting can be archived with an audit reason and becomes read-only", () => {
  const service = new TestMeetingService();
  const meeting = service.list()[0];
  const actor = meeting.participantAccountIds[0];
  assert.equal(service.archive(meeting.id, actor, "Sudah selesai"), null);
  service.finalizeMinutes(meeting.id, actor);
  assert.equal(service.archive(meeting.id, actor, ""), null);
  const archived = service.archive(meeting.id, actor, "Sudah selesai");
  assert.ok(archived?.archivedAt);
  assert.equal(service.archive(meeting.id, actor, "Lagi"), null);
  assert.equal(service.castVote({ meetingId: meeting.id, round: 1, voterAccountId: actor, choice: "SETUJU" }), null);
  assert.equal(service.createFollowUp(meeting.id, new TestTaskService(), actor, actor, "Tugas baru"), null);
  assert.equal(service.listAudit(meeting.id).at(-1)?.action, "MEETING_ARCHIVED");
});
