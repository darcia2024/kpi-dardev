import assert from "node:assert/strict";
import test from "node:test";
import { TestHandoverService } from "@/platform/governance/handover-service";

const outgoing = "00000000-0000-4000-8000-000000000101";
const successor = "00000000-0000-4000-8000-000000000102";
const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

function newPackage(service: TestHandoverService) {
  const record = service.create({ ...scope, title: "Paket Sekretaris · TEST", outgoingOwnerAccountId: outgoing, successorAccountId: successor })!;
  service.addItem(record.id, outgoing, { title: "Arsip surat masuk & keluar", mandatory: true });
  service.addItem(record.id, outgoing, { title: "Daftar kontak mitra", mandatory: false });
  return service.get(record.id)!;
}

test("a package cannot close while a mandatory item is not accepted", () => {
  const service = new TestHandoverService();
  const record = newPackage(service);
  const [mandatory, optional] = record.items!;
  assert.equal(service.accept(record.id, successor), null);
  assert.equal(service.markItemReady(record.id, outgoing, mandatory.id)?.items?.[0].status, "READY");
  assert.equal(service.reviewItem(record.id, successor, mandatory.id, "ACCEPT")?.items?.[0].status, "ACCEPTED");
  assert.equal(service.get(record.id)?.items?.[1].id, optional.id);
  assert.equal(service.accept(record.id, successor)?.status, "ACCEPTED", "optional items do not block closing");
});

test("clarification needs a question and the outgoing owner must answer before it is ready again", () => {
  const service = new TestHandoverService();
  const record = newPackage(service);
  const item = record.items![0];
  service.markItemReady(record.id, outgoing, item.id);
  assert.equal(service.reviewItem(record.id, successor, item.id, "CLARIFY"), null);
  assert.equal(service.reviewItem(record.id, successor, item.id, "CLARIFY", "Siapa PJ dua tugas yang lewat tenggat?")?.items?.[0].status, "CLARIFICATION");
  assert.equal(service.markItemReady(record.id, outgoing, item.id), null);
  const answered = service.markItemReady(record.id, outgoing, item.id, "PJ dialihkan ke Sekjend.")!.items![0];
  assert.deepEqual([answered.status, answered.clarificationResponse], ["READY", "PJ dialihkan ke Sekjend."]);
});

test("roles are enforced: only outgoing prepares items and only the successor reviews them", () => {
  const service = new TestHandoverService();
  const record = newPackage(service);
  const item = record.items![0];
  assert.equal(service.addItem(record.id, successor, { title: "Bukan hak penerus", mandatory: true }), null);
  assert.equal(service.markItemReady(record.id, successor, item.id), null);
  service.markItemReady(record.id, outgoing, item.id);
  assert.equal(service.reviewItem(record.id, outgoing, item.id, "ACCEPT"), null);
  assert.equal(service.create({ ...scope, title: "Diri sendiri", outgoingOwnerAccountId: outgoing, successorAccountId: outgoing }), null);
});
