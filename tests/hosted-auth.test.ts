import assert from "node:assert/strict";
import test from "node:test";
import type { User } from "@supabase/supabase-js";
import { getHostedAuthConfiguration, hostedIdentityFromUser } from "../src/platform/identity/hosted-auth";

const configured = {
  KPI_APP_ENV: "staging",
  KPI_AUTH_PROVIDER: "supabase",
  KPI_SUPABASE_URL: "https://example.supabase.co",
  KPI_SUPABASE_PUBLISHABLE_KEY: "publishable-test-key"
};

test("hosted authentication needs an explicit provider and HTTPS configuration", () => {
  assert.deepEqual(getHostedAuthConfiguration(configured), { url: configured.KPI_SUPABASE_URL, key: configured.KPI_SUPABASE_PUBLISHABLE_KEY });
  assert.equal(getHostedAuthConfiguration({ ...configured, KPI_APP_ENV: "local" }), null);
  assert.equal(getHostedAuthConfiguration({ ...configured, KPI_AUTH_PROVIDER: "none" }), null);
  assert.equal(getHostedAuthConfiguration({ ...configured, KPI_SUPABASE_URL: "http://example.supabase.co" }), null);
  assert.equal(getHostedAuthConfiguration({ ...configured, KPI_SUPABASE_PUBLISHABLE_KEY: "" }), null);
});

test("hosted identity rejects unverified or unapproved accounts", () => {
  const approved = {
    id: "account-id", email: "pengurus@example.org", email_confirmed_at: "2026-09-24T00:00:00Z",
    app_metadata: { kpi_access: true, kpi_role: "PENGURUS" }, user_metadata: { display_name: "Pengurus KPI" }
  } as User;
  assert.deepEqual(hostedIdentityFromUser(approved), {
    accountId: "account-id", email: "pengurus@example.org", name: "Pengurus KPI", roles: ["PENGURUS"]
  });
  assert.equal(hostedIdentityFromUser({ ...approved, email_confirmed_at: undefined } as User), null);
  assert.equal(hostedIdentityFromUser({ ...approved, app_metadata: { kpi_role: "PENGURUS" } } as User), null);
  assert.equal(hostedIdentityFromUser({ ...approved, app_metadata: { kpi_access: true, kpi_role: "UNKNOWN" } } as User), null);
});
