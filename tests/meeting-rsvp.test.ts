import assert from "node:assert/strict";
import test from "node:test";
import { TestMeetingService } from "../src/platform/work/meeting-service";

test("invited participant may revise RSVP before meeting while outsiders cannot", () => {
  const service = new TestMeetingService();
  const meeting = service.create({ title: "Koordinasi kasus", agenda: "Pembagian tindak lanjut", startsAt: new Date(Date.now() + 86_400_000).toISOString(), participantAccountIds: ["member"], organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST", actorAccountId: "chair" });
  assert.equal(service.respond(meeting.id, "outsider", "HADIR"), null);
  assert.equal(service.respond(meeting.id, "member", "RAGU")?.response, "RAGU");
  assert.equal(service.respond(meeting.id, "member", "HADIR")?.response, "HADIR");
  assert.equal(service.getResponse(meeting.id, "member")?.response, "HADIR");
  assert.equal(service.listAudit(meeting.id).filter((event) => event.action === "MEETING_RSVP_UPDATED").length, 2);
  assert.equal(service.list().find((item) => item.id === meeting.id)?.agenda, "Pembagian tindak lanjut");
});
