import assert from "node:assert/strict";
import test from "node:test";
import { TestMeetingService } from "@/platform/work/meeting-service";

test("a participant can read their saved vote after the voting action", () => {
  const service = new TestMeetingService();
  const meeting = service.list()[0];
  const participant = meeting.participantAccountIds[0];
  assert.equal(service.getVote(meeting.id, 1, participant), null);
  assert.equal(service.castVote({ meetingId: meeting.id, round: 1, voterAccountId: participant, choice: "SETUJU" }), "SETUJU");
  assert.equal(service.getVote(meeting.id, 1, participant), "SETUJU");
  assert.equal(service.getVote(meeting.id, 1, "00000000-0000-4000-8000-000000009999"), null);
});
