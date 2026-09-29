import assert from "node:assert/strict";
import test from "node:test";
import { PerformanceSheetService, weightedScore } from "@/platform/governance/performance-sheet-service";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";
const ketua = "00000000-0000-4000-8000-000000000103";
const evidence = "00000000-0000-4000-8000-000000002001";
const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

function activeScheme(service: PerformanceSheetService) {
  const draft = service.createDraft(scope.organizationCode, scope.periodCode, admin)!;
  service.setIndicator(draft.id, admin, { name: "Ketepatan waktu tugas", weightPercent: 30 });
  service.setIndicator(draft.id, admin, { name: "Tugas diterima", weightPercent: 30 });
  service.setIndicator(draft.id, admin, { name: "Kelengkapan bukti", weightPercent: 25 });
  assert.equal(service.activate(draft.id, admin), null, "weights must total 100%");
  service.setIndicator(draft.id, admin, { name: "Kehadiran rapat", weightPercent: 15 });
  assert.equal(service.setIndicator(draft.id, admin, { name: "Lebih dari seratus", weightPercent: 1 }), null);
  return service.activate(draft.id, admin)!;
}

test("a scheme activates only with weights totalling exactly 100%", () => {
  const service = new PerformanceSheetService();
  const scheme = activeScheme(service);
  assert.equal(scheme.status, "ACTIVE");
  assert.equal(scheme.indicators.length, 4);
  assert.equal(service.setIndicator(scheme.id, admin, { name: "Ubah setelah aktif", weightPercent: 10 }), null, "active schemes are locked");
});

test("rubric scores need a reason, evidence for numbers, and no conflict of interest", () => {
  const service = new PerformanceSheetService();
  const scheme = activeScheme(service);
  const indicatorId = scheme.indicators[0].id;
  const base = { ...scope, indicatorId, subjectAccountId: pengurus, evaluatorAccountId: ketua, evidenceAssetIds: [evidence] };
  assert.equal(service.assess({ ...base, score: 4, reason: "Pendek" }), null);
  assert.equal(service.assess({ ...base, score: 4, reason: "Tugas selesai sebelum tenggat", evidenceAssetIds: [] }), null);
  assert.equal(service.assess({ ...base, score: 6 as 5, reason: "Nilai di luar rubrik" }), null);
  assert.equal(service.assess({ ...base, evaluatorAccountId: pengurus, score: 5, reason: "Menilai diri sendiri" }), null);
  assert.equal(service.declareConflict({ ...scope, evaluatorAccountId: ketua, subjectAccountId: pengurus, reason: "Satu tim kepanitiaan" })?.subjectAccountId, pengurus);
  assert.equal(service.assess({ ...base, score: 4, reason: "Tugas selesai sebelum tenggat" }), null, "declared conflicts block assessment");
  assert.equal(service.assess({ ...base, evaluatorAccountId: admin, score: 4, reason: "Tugas selesai sebelum tenggat" })?.score, 4);
});

test("missing data is not zero and the weighted score covers only indicators with data", () => {
  const service = new PerformanceSheetService();
  const scheme = activeScheme(service);
  const [timeliness, accepted, , attendance] = scheme.indicators;
  const base = { ...scope, subjectAccountId: pengurus, evaluatorAccountId: admin, evidenceAssetIds: [evidence] };
  service.assess({ ...base, indicatorId: timeliness.id, score: 5, reason: "Semua tugas tepat waktu" });
  service.assess({ ...base, indicatorId: accepted.id, score: 3, reason: "Sebagian tugas dikembalikan" });
  service.assess({ ...base, indicatorId: attendance.id, score: null, reason: "Belum ada data presensi rapat", evidenceAssetIds: [] });
  const summary = service.summarize(scheme, pengurus);
  assert.equal(summary.coveredWeightPercent, 60);
  assert.equal(summary.weightedPercent, 80, "(30×5/5 + 30×3/5) ÷ 60 = 80%");
  assert.equal(summary.indicators.find((item) => item.indicatorId === attendance.id)?.averageScore, null);
  assert.deepEqual(weightedScore([{ weightPercent: 50, averageScore: null }]), { weightedPercent: null, coveredWeightPercent: 0 });
});

test("activating a revised scheme retires the previous version and allows the next draft", () => {
  const service = new PerformanceSheetService();
  const first = activeScheme(service);
  const revision = service.createDraft(scope.organizationCode, scope.periodCode, admin)!;
  assert.equal(revision.indicators.length, 4, "a draft starts from the active indicators");
  assert.equal(service.createDraft(scope.organizationCode, scope.periodCode, admin), null, "only one draft at a time");
  service.activate(revision.id, admin);
  assert.equal(service.activeScheme(scope.organizationCode, scope.periodCode)?.id, revision.id);
  assert.equal(service.schemesFor(scope.organizationCode, scope.periodCode).find((item) => item.id === first.id)?.status, "RETIRED");
  assert.ok(service.createDraft(scope.organizationCode, scope.periodCode, admin));
});
