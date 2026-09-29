import assert from "node:assert/strict";
import test from "node:test";
import { resolvePreviewPeriod } from "@/platform/identity/preview-period-context";
import { testPeriods } from "@/platform/data/organization-repository";
import { formatPreviewPeriodLabel } from "@/lib/period-label";

test("selected local period resolves only to a known open period", () => {
  const periods = [testPeriods[0], { ...testPeriods[0], id: "another", code: "2028_2029_TEST", status: "ACTIVE" as const }];
  assert.equal(resolvePreviewPeriod("2028_2029_TEST", periods).code, "2028_2029_TEST");
  assert.equal(resolvePreviewPeriod("forged", periods).code, testPeriods[0].code);
  assert.equal(resolvePreviewPeriod("2028_2029_TEST", [{ ...periods[1], status: "CLOSED" }, periods[0]]).code, testPeriods[0].code);
});

test("period label shows a readable year range without exposing internal seed codes", () => {
  assert.equal(formatPreviewPeriodLabel("2026_2027_TEST"), "2026–2027");
  assert.equal(formatPreviewPeriodLabel("PERIODE_BARU_TEST"), "PERIODE BARU");
});
