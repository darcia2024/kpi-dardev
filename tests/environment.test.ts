import assert from "node:assert/strict";
import test from "node:test";
import { parseEnvironment } from "../src/platform/config/environment";

const validEnvironment = {
  KPI_APP_ENV: "local",
  KPI_APP_NAME: "kpi-ppmi-mesir",
  KPI_REQUEST_ID_HEADER: "x-request-id",
  KPI_TEST_AUTH_ENABLED: "true"
} as const;

test("accepts the TEST local environment contract", () => {
  assert.deepEqual(parseEnvironment(validEnvironment), validEnvironment);
});

test("rejects an incomplete environment contract", () => {
  assert.throws(() => parseEnvironment({ ...validEnvironment, KPI_APP_NAME: undefined }));
});

test("rejects an unrecognised runtime environment", () => {
  assert.throws(() => parseEnvironment({ ...validEnvironment, KPI_APP_ENV: "preview" }));
});
