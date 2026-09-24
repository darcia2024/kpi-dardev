import assert from "node:assert/strict";
import test from "node:test";
import { TaskTemplateService } from "../src/platform/work/task-template-service";
import { TestTaskService } from "../src/platform/work/task-service";

const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" };

test("task instances retain their template version after a later revision", () => {
  const templates = new TaskTemplateService();
  const tasks = new TestTaskService();
  const template = templates.create({ ...scope, title: "Periksa berkas", createdByAccountId: "creator" });
  const first = templates.instantiate({ ...scope, templateId: template.id, ownerAccountId: "owner", createdByAccountId: "creator" }, tasks);
  assert.equal(first?.sourceTemplateVersion, 1);
  assert.equal(first?.title, "Periksa berkas");
  assert.equal(templates.revise(template.id, "owner", "Periksa ulang berkas"), null);
  assert.equal(templates.revise(template.id, "creator", "Periksa ulang berkas")?.version, 2);
  const second = templates.instantiate({ ...scope, templateId: template.id, ownerAccountId: "owner", createdByAccountId: "creator" }, tasks);
  assert.equal(second?.sourceTemplateVersion, 2);
  assert.equal(second?.title, "Periksa ulang berkas");
  assert.equal(tasks.get(first!.id)?.title, "Periksa berkas");
  assert.equal(templates.instantiate({ organizationCode: "OTHER", periodCode: scope.periodCode, templateId: template.id, ownerAccountId: "owner", createdByAccountId: "creator" }, tasks), null);
});
