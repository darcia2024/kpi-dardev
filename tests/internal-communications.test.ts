import assert from "node:assert/strict";
import test from "node:test";
import { LocalInternalCommunicationService } from "../src/platform/notifications/internal-communication-service";

const author = "00000000-0000-4000-8000-000000000101";
const recipient = "00000000-0000-4000-8000-000000000102";

test("internal announcement reaches only its named recipient after another account approves", () => {
  const service = new LocalInternalCommunicationService();
  const message = service.create({ kind: "ANNOUNCEMENT", title: "Informasi rapat", body: "Rapat internal dijadwalkan ulang setelah konfirmasi.", recipientAccountIds: [recipient], authorAccountId: author, organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" });
  assert.equal(service.inbox(recipient, "KPI_TEST", "2026_2027_TEST").length, 0);
  assert.equal(service.approveAndDeliver(message.id, recipient), null);
  assert.equal(service.submit(message.id, recipient), null);
  assert.equal(service.submit(message.id, author)?.status, "IN_REVIEW");
  assert.equal(service.approveAndDeliver(message.id, author), null);
  assert.equal(service.approveAndDeliver(message.id, recipient)?.status, "DELIVERED");
  assert.equal(service.inbox(recipient, "KPI_TEST", "2026_2027_TEST").length, 1);
  assert.equal(service.inbox(author, "KPI_TEST", "2026_2027_TEST").length, 0);
  assert.equal(service.inbox(recipient, "OTHER", "2026_2027_TEST").length, 0);
  assert.deepEqual(service.listAudit(message.id).map((event) => event.action), ["INTERNAL_MESSAGE_DRAFTED", "INTERNAL_MESSAGE_SUBMITTED", "INTERNAL_MESSAGE_DELIVERED"]);
});

test("direct messages require exactly one explicit recipient", () => {
  const service = new LocalInternalCommunicationService();
  assert.throws(() => service.create({ kind: "DIRECT", title: "Informasi", body: "Pembaruan internal untuk penerima.", recipientAccountIds: [author, recipient], authorAccountId: author, organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" }));
});
