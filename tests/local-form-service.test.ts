import assert from "node:assert/strict";
import test from "node:test";
import { LocalFormService } from "../src/platform/intake/local-form-service";

const authorAccountId = "00000000-0000-4000-8000-000000000101";
const input = { code: "layanan-kpi", title: "Permohonan layanan", consentText: "Saya menyetujui pemrosesan data untuk kebutuhan layanan ini.", fields: [{ key: "email", label: "Alamat email", type: "email" as const, required: true }], authorAccountId, organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

test("draft form versions and validation enforce fields and consent without storing answers", () => {
  const service = new LocalFormService();
  const form = service.save(input);
  assert.ok(form);
  assert.equal(form.version, 1);
  assert.deepEqual(service.validatePreview(form.id, { email: "invalid" }, false), { valid: false, errors: { consent: "Persetujuan pemrosesan data diperlukan.", email: "Alamat email tidak valid." } });
  assert.equal(service.validatePreview(form.id, { email: "anggota@example.com" }, true)?.valid, true);
  assert.equal(service.validatePreview(form.id, { email: "anggota@example.com", secret: "x" }, true)?.valid, false);
  assert.equal(service.save({ ...input, id: form.id, expectedVersion: 1, title: "Permohonan baru" })?.version, 2);
  assert.equal(service.save({ ...input, id: form.id, expectedVersion: 1 }), null);
  assert.equal(service.save({ ...input, code: "layanan-kpi" }), null);
  assert.equal(service.list("OTHER", input.periodCode).length, 0);
});
