import assert from "node:assert/strict";
import test from "node:test";
import { motionOutcome, TestMeetingService } from "@/platform/work/meeting-service";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";
const guest = "00000000-0000-4000-8000-000000000103";

function newMeeting(service: TestMeetingService) {
  return service.create({ title: "Sidang pleno · TEST", organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", startsAt: new Date(Date.now() + 86_400_000).toISOString(), agenda: "Pengesahan SOP", participantAccountIds: [admin, pengurus, guest], actorAccountId: admin });
}

test("eligible voters are snapshotted from attendance when the motion opens", () => {
  const service = new TestMeetingService();
  const meeting = newMeeting(service);
  service.recordAttendance(meeting.id, admin, admin, "HADIR");
  service.recordAttendance(meeting.id, admin, pengurus, "HADIR");
  service.recordAttendance(meeting.id, admin, guest, "IZIN");
  const round = service.openMotion(meeting.id, admin, "Pengesahan SOP serah terima")!.motions![0].round;
  assert.equal(service.castVote({ meetingId: meeting.id, round, voterAccountId: guest, choice: "SETUJU" }), null, "absent members cannot vote");
  service.recordAttendance(meeting.id, admin, guest, "HADIR");
  assert.equal(service.castVote({ meetingId: meeting.id, round, voterAccountId: guest, choice: "SETUJU" }), null, "late arrival does not change the snapshot");
  assert.equal(service.castVote({ meetingId: meeting.id, round, voterAccountId: pengurus, choice: "TUNDA" }), null, "legacy choice is not accepted on motions");
  assert.equal(service.castVote({ meetingId: meeting.id, round, voterAccountId: pengurus, choice: "SETUJU" }), "SETUJU");
});

test("tallies stay hidden until the motion closes and the outcome respects quorum", () => {
  const service = new TestMeetingService();
  const meeting = newMeeting(service);
  for (const accountId of [admin, pengurus]) service.recordAttendance(meeting.id, admin, accountId, "HADIR");
  service.setQuorum(meeting.id, admin, 2);
  const round = service.openMotion(meeting.id, admin, "Pengesahan anggaran program")!.motions![0].round;
  assert.equal(service.openMotion(meeting.id, admin, "Mosi kedua bersamaan"), null, "only one open motion at a time");
  service.castVote({ meetingId: meeting.id, round, voterAccountId: admin, choice: "SETUJU" });
  service.castVote({ meetingId: meeting.id, round, voterAccountId: pengurus, choice: "ABSTAIN" });
  const open = service.motionViews(meeting.id)[0];
  assert.deepEqual([open.votesCast, open.tally, open.outcome], [2, undefined, undefined]);
  service.closeMotion(meeting.id, admin);
  const closed = service.motionViews(meeting.id)[0];
  assert.deepEqual(closed.tally, { SETUJU: 1, TOLAK: 0, ABSTAIN: 1 });
  assert.equal(closed.outcome, "ACCEPTED");
  assert.equal(service.castVote({ meetingId: meeting.id, round, voterAccountId: admin, choice: "TOLAK" }), null, "closed motions refuse votes");
});

test("without an official quorum value no motion is declared valid", () => {
  assert.equal(motionOutcome(undefined, 20, { SETUJU: 16, TOLAK: 1 }), "PENDING_RULE");
  assert.equal(motionOutcome(18, 12, { SETUJU: 12, TOLAK: 0 }), "NO_QUORUM");
  assert.equal(motionOutcome(18, 18, { SETUJU: 8, TOLAK: 8 }), "REJECTED", "a tie is not accepted");
});

test("quorum must fit the invitation and attendance locks once minutes are final", () => {
  const service = new TestMeetingService();
  const meeting = newMeeting(service);
  assert.equal(service.setQuorum(meeting.id, admin, 4), null);
  assert.equal(service.setQuorum(meeting.id, admin, 0), null);
  assert.equal(service.recordAttendance(meeting.id, admin, "00000000-0000-4000-8000-000000000199", "HADIR"), null);
  service.finalizeMinutes(meeting.id, admin);
  assert.equal(service.recordAttendance(meeting.id, admin, admin, "HADIR"), null);
});
