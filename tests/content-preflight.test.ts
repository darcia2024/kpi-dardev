import assert from "node:assert/strict";
import test from "node:test";
import { blockingFailures, preflight } from "../src/lib/content-preflight";

const clean = { title: "Mengenal peran KPI", description: "Ringkasan mandat dan jalur aman.", body: "Lihat [layanan](/publik/layanan) dan [PPMI](https://ppmimesir.org).", locale: "id" as const };

test("clean content passes every blocking check", () => {
  const checks = preflight({ ...clean, mediaStatus: "AVAILABLE", translationState: "APPROVED" });
  assert.equal(blockingFailures(checks).length, 0);
  assert.ok(checks.every((check) => check.ok));
});

test("personal data blocks publication", () => {
  for (const body of ["Hubungi ahmad.fauzi@gmail.com", "WA +20 112 345 6789", "Nomor 0812-3456-7890", "NIK 3201234567890123"]) {
    const failures = blockingFailures(preflight({ ...clean, body }));
    assert.deepEqual(failures.map((check) => check.id), ["personal-data"], body);
  }
  assert.equal(blockingFailures(preflight({ ...clean, body: "Tahun 2026, 3 divisi dan 1 subbidang." })).length, 0, "ordinary numbers are fine");
});

test("unsafe links and unchecked media block; a missing translation only warns", () => {
  assert.deepEqual(blockingFailures(preflight({ ...clean, body: "[klik](javascript:alert(1))" })).map((check) => check.id), ["links"]);
  assert.deepEqual(blockingFailures(preflight({ ...clean, mediaStatus: "PENDING" })).map((check) => check.id), ["media"]);
  const translation = preflight({ ...clean }).find((check) => check.id === "translation")!;
  assert.deepEqual([translation.ok, translation.blocking], [false, false]);
});
