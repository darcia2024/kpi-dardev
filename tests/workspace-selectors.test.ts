import assert from "node:assert/strict";
import test from "node:test";
import { requiredActions, searchWorkspace, type WorkspaceTask } from "@/lib/workspace-selectors";

const mine = "00000000-0000-4000-8000-000000000101";
const other = "00000000-0000-4000-8000-000000000102";
const tasks: WorkspaceTask[] = [
  { id: "00000000-0000-4000-8000-000000003001", title: "Periksa laporan", ownerAccountId: mine, status: "IN_PROGRESS" },
  { id: "00000000-0000-4000-8000-000000003002", title: "Tinjau laporan", ownerAccountId: other, status: "IN_REVIEW" },
  { id: "00000000-0000-4000-8000-000000003003", title: "Laporan selesai", ownerAccountId: other, status: "ACCEPTED" }
];

test("action required contains only actions granted to the signed-in account and links to that task", () => {
  assert.deepEqual(requiredActions(tasks, mine, false, false), []);
  assert.deepEqual(requiredActions(tasks, mine, true, false).map((item) => item.id), ["work:00000000-0000-4000-8000-000000003001"]);
  const actions = requiredActions(tasks, mine, true, true);
  assert.deepEqual(actions.map((item) => item.id), ["review:00000000-0000-4000-8000-000000003002", "work:00000000-0000-4000-8000-000000003001"]);
  assert.equal(actions[0]?.href, "/portal/tugas?task=00000000-0000-4000-8000-000000003002");
});

test("workspace search links each result to its own visible record", () => {
  const result = searchWorkspace("laporan", tasks, [{ id: "00000000-0000-4000-8000-000000004001", title: "Rapat laporan", startsAt: "2026-09-24T12:00:00Z", participantAccountIds: [mine] }], [{ id: "00000000-0000-4000-8000-000000002001", fileName: "Laporan.pdf" }]);
  assert.deepEqual(result.map((item) => item.kind), ["Tugas", "Tugas", "Tugas", "Rapat", "Dokumen"]);
  assert.equal(result[3]?.href, "/portal/rapat?meeting=00000000-0000-4000-8000-000000004001");
  assert.equal(result[4]?.href, "/portal/dokumen?document=00000000-0000-4000-8000-000000002001");
  assert.deepEqual(searchWorkspace("l", tasks, [], []), []);
});
