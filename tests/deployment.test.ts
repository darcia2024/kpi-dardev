import assert from "node:assert/strict";
import test from "node:test";
import { checkSupabaseConnection, validateDeployment } from "../src/platform/config/deployment";

const production = { KPI_APP_ENV: "production", KPI_APP_NAME: "kpi-ppmi-mesir", KPI_REQUEST_ID_HEADER: "x-request-id", KPI_TEST_AUTH_ENABLED: "false", KPI_AUTH_PROVIDER: "supabase", KPI_SUPABASE_URL: "https://example.supabase.co", KPI_SUPABASE_PUBLISHABLE_KEY: "publishable-fixture", KPI_SUPABASE_SERVICE_ROLE_KEY: "server-fixture", VERCEL_ENV: "production" };

test("hosted configuration rejects local authentication and environment mixups", () => {
  assert.doesNotThrow(() => validateDeployment(production));
  assert.doesNotThrow(() => validateDeployment({ ...production, VERCEL_ENV: undefined }));
  assert.throws(() => validateDeployment({ ...production, KPI_APP_ENV: "staging", VERCEL_ENV: "preview" }));
  for (const patch of [{ KPI_APP_ENV: "local" }, { KPI_TEST_AUTH_ENABLED: "true" }, { KPI_APP_ENV: "staging" }, { VERCEL_ENV: "preview" }, { KPI_AUTH_PROVIDER: "" }, { KPI_SUPABASE_SERVICE_ROLE_KEY: "[SENSITIVE]" }, { KPI_SUPABASE_URL: "http://example.supabase.co" }, { NEXT_PUBLIC_SECRET: production.KPI_SUPABASE_SERVICE_ROLE_KEY }, { KPI_SUPABASE_PUBLISHABLE_KEY: production.KPI_SUPABASE_SERVICE_ROLE_KEY }]) {
    assert.throws(() => validateDeployment({ ...production, ...patch }));
  }
});

test("connection probes use separate keys, avoid records and never follow redirects", async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const request: typeof fetch = async (input, init) => { calls.push({ url: String(input), init }); return new Response(/kpi_(tasks|admin|operations_schema)_ready$/.test(String(input)) ? "true" : "{}", { status: 200 }); };
  const checks = await checkSupabaseConnection(production, request);
  assert.equal(checks.every((check) => check.ok), true);
  assert.equal(calls[0].init?.headers && (calls[0].init.headers as Record<string, string>).apikey, production.KPI_SUPABASE_PUBLISHABLE_KEY);
  assert.equal(calls[2].init?.headers && (calls[2].init.headers as Record<string, string>)["Accept-Profile"], "org");
  assert.equal(calls[2].url.endsWith("?select=id&limit=0"), true);
  assert.equal(calls[3].init?.method, "POST");
  assert.equal(calls[3].init?.body, "{}");
  assert.equal(calls.every((call) => call.init?.redirect === "error"), true);
});

test("failed probes disclose only safe codes, never response details or thrown secrets", async () => {
  let count = 0;
  const request: typeof fetch = async () => {
    if (++count === 1) throw new Error(production.KPI_SUPABASE_SERVICE_ROLE_KEY);
    return Response.json({ code: "PGRST106", message: production.KPI_SUPABASE_SERVICE_ROLE_KEY }, { status: 406 });
  };
  const checks = await checkSupabaseConnection(production, request);
  assert.equal(checks.every((check) => !check.ok), true);
  assert.equal(JSON.stringify(checks).includes(production.KPI_SUPABASE_SERVICE_ROLE_KEY), false);
  assert.equal(checks[1].code, "PGRST106");
});
