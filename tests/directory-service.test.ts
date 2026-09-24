import assert from "node:assert/strict";
import test from "node:test";
import { loadDirectory } from "../src/platform/identity/directory-service";

const localEnvironment = {
  KPI_APP_ENV: "local",
  KPI_APP_NAME: "kpi-ppmi-mesir",
  KPI_REQUEST_ID_HEADER: "x-request-id",
  KPI_TEST_AUTH_ENABLED: "true"
};

test("local directory separates preview accounts from official assignments", async () => {
  const directory = await loadDirectory("KPI_TEST", localEnvironment);
  assert.equal(directory.source, "LOCAL_PREVIEW");
  assert.equal(directory.accounts.length, 2);
  assert.equal(directory.positions.length, 0);
  assert.equal(directory.assignments.length, 0);
  assert.equal(directory.periods.length, 1);
  assert.equal(directory.periods[0].status, "PLANNED");
  assert.ok(directory.accounts.every((account) => !Object.hasOwn(account, "password")));
});

test("local directory never returns preview accounts for another organization", async () => {
  const directory = await loadDirectory("OTHER_ORGANIZATION", localEnvironment);
  assert.equal(directory.accounts.length, 0);
  assert.equal(directory.assignments.length, 0);
});
