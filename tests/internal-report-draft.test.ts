import assert from "node:assert/strict";
import test from "node:test";
import { structureInternalReport } from "../src/lib/internal-report-draft";
import { TestAspirationService } from "../src/platform/intake/aspiration-service";

test("a free-form incident becomes an editable complaint draft without adding facts", () => {
  const story = "Saya ingin melaporkan bahwa ada persoalan interaksi saat diskusi organisasi. Saya belum mengetahui waktu pastinya.";
  const draft = structureInternalReport(story);
  assert.equal(draft.kind, "PENGADUAN");
  assert.equal(draft.subject, "Ada persoalan interaksi saat diskusi organisasi");
  assert.equal(draft.description, story);
  assert.equal(draft.description.includes("lokasi"), false);
});

test("suggestions and questions are routed by explicit language", () => {
  assert.equal(structureInternalReport("Saya punya saran agar penjelasan alur layanan dibuat lebih jelas untuk semua anggota.").kind, "SARAN");
  assert.equal(structureInternalReport("Bagaimana cara mengetahui tahapan penanganan laporan yang sudah masuk?").kind, "PERTANYAAN");
});

test("a submitted portal report is marked as internal and remains idempotent", () => {
  const service = new TestAspirationService();
  const input = { kind: "PENGADUAN" as const, subject: "Interaksi dalam forum", description: "Uraian kejadian yang cukup panjang untuk ditelaah oleh petugas berizin.", idempotencyKey: "00000000-0000-4000-8000-000000009999", source: "PORTAL_ASSISTANT" as const, submittedByAccountId: "00000000-0000-4000-8000-000000000102" };
  const first = service.submit(input);
  const second = service.submit(input);
  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.equal(service.listCases()[0].source, "PORTAL_ASSISTANT");
  assert.equal(service.listCases().length, 1);
});
