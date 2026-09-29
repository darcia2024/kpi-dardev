import assert from "node:assert/strict";
import test from "node:test";
import { TestTaskService } from "@/platform/work/task-service";

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";
const outsider = "00000000-0000-4000-8000-000000000199";
const evidence = "00000000-0000-4000-8000-000000002001";

test("a task with open subtasks cannot be submitted until every subtask is done", () => {
  const service = new TestTaskService();
  const task = service.list()[0];
  const withSubtasks = service.addSubtask(task.id, admin, "Susun kerangka · TEST");
  assert.equal(withSubtasks?.subtasks?.length, 1);
  assert.equal(service.addSubtask(task.id, pengurus, "Kumpulkan bahan · TEST")?.subtasks?.length, 2);
  assert.equal(service.submit(task.id, pengurus, evidence), null);
  const [first, second] = service.get(task.id)!.subtasks!;
  assert.equal(service.setSubtaskDone(task.id, pengurus, first.id, true)?.progress, 45);
  assert.equal(service.setSubtaskDone(task.id, pengurus, second.id, true)?.progress, 90);
  assert.equal(service.submit(task.id, pengurus, evidence, "Semua bab sudah direvisi")?.status, "IN_REVIEW");
  assert.equal(service.get(task.id)?.submissionNote, "Semua bab sudah direvisi");
});

test("only the owner can tick subtasks and only owner or creator can add them", () => {
  const service = new TestTaskService();
  const task = service.list()[0];
  assert.equal(service.addSubtask(task.id, outsider, "Tidak berhak"), null);
  const subtask = service.addSubtask(task.id, admin, "Langkah pertama")!.subtasks![0];
  assert.equal(service.setSubtaskDone(task.id, admin, subtask.id, true), null);
  assert.equal(service.setSubtaskDone(task.id, pengurus, subtask.id, true)?.subtasks?.[0].doneByAccountId, pengurus);
  assert.equal(service.setSubtaskDone(task.id, pengurus, subtask.id, true), null, "no-op toggles are rejected");
});

test("returning a submitted task keeps subtask-based progress and clears the submission note", () => {
  const service = new TestTaskService();
  const task = service.list()[0];
  const subtask = service.addSubtask(task.id, admin, "Satu-satunya langkah")!.subtasks![0];
  service.setSubtaskDone(task.id, pengurus, subtask.id, true);
  service.submit(task.id, pengurus, evidence, "Catatan");
  const returned = service.review(task.id, admin, false, "Lengkapi grafik");
  assert.equal(returned?.progress, 90);
  assert.equal(returned?.submissionNote, undefined);
});

test("discussion is ordered, trimmed, and closed once the task is archived", () => {
  const service = new TestTaskService();
  const task = service.list()[0];
  assert.equal(service.addComment(task.id, pengurus, "   "), null);
  service.addComment(task.id, pengurus, "  Draf pertama sudah diunggah.  ");
  service.addComment(task.id, admin, "Terima kasih, akan saya periksa.");
  assert.deepEqual(service.listComments(task.id).map((comment) => comment.body), ["Draf pertama sudah diunggah.", "Terima kasih, akan saya periksa."]);
  assert.equal(service.close(task.id, admin, "CANCEL", "Tidak diperlukan lagi")?.status, "ARCHIVED");
  assert.equal(service.addComment(task.id, admin, "Komentar terlambat"), null);
});
