import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../src/app/api/v1/health/route";
import { getRequestId } from "../src/platform/http/request-id";

test("keeps a valid client request ID", () => {
  assert.equal(getRequestId("request-id-from-client-20260921"), "request-id-from-client-20260921");
});

test("replaces an unsafe request ID", () => {
  const requestId = getRequestId("<script>alert(1)</script>");
  assert.match(requestId, /^[a-f0-9-]{36}$/);
});

test("health endpoint returns a structured configuration error", async () => {
  const previous = {
    KPI_APP_ENV: process.env.KPI_APP_ENV,
    KPI_APP_NAME: process.env.KPI_APP_NAME,
    KPI_REQUEST_ID_HEADER: process.env.KPI_REQUEST_ID_HEADER,
    KPI_TEST_AUTH_ENABLED: process.env.KPI_TEST_AUTH_ENABLED
  };

  try {
    delete process.env.KPI_APP_ENV;
    process.env.KPI_APP_NAME = "kpi-ppmi-mesir";
    process.env.KPI_REQUEST_ID_HEADER = "x-request-id";
    process.env.KPI_TEST_AUTH_ENABLED = "true";

    const response = GET(new Request("http://localhost/api/v1/health", {
      headers: { "x-request-id": "health-config-error-20260921" }
    }));

    assert.equal(response.status, 503);
    assert.equal(response.headers.get("x-request-id"), "health-config-error-20260921");
    assert.deepEqual(await response.json(), {
      error: {
        code: "CONFIGURATION_INVALID",
        requestId: "health-config-error-20260921"
      }
    });
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
});
