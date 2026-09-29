import assert from "node:assert/strict";
import test from "node:test";
import { LocalPasswordRecovery, passwordProblems, recoveryLifetimeMs } from "../src/platform/identity/password-recovery";
import { completeTestMfa, getTestSession, setPasswordStateForTests, startTestSignIn } from "../src/platform/identity/test-auth";

const pengurus = "00000000-0000-4000-8000-000000000102";
const localEnvironment = { KPI_APP_ENV: "local", KPI_TEST_AUTH_ENABLED: "true", KPI_APP_NAME: "kpi-ppmi-mesir", KPI_REQUEST_ID_HEADER: "x-request-id" } as NodeJS.ProcessEnv;

test("recovery tokens are single-use and expire", () => {
  const recovery = new LocalPasswordRecovery();
  const token = recovery.request(pengurus, 1_000)!;
  assert.equal(recovery.peek(token, 1_000), pengurus);
  assert.equal(recovery.peek(token, 1_000 + recoveryLifetimeMs), null, "expired");
  assert.deepEqual(recovery.reset("tebakan-token", "SandiBaru2026!", 1_000), { error: "TOKEN_INVALID" });
  assert.deepEqual(recovery.reset(token, "pendek1", 1_000), { error: "PASSWORD_WEAK" });
  assert.deepEqual(recovery.reset(token, "SandiBaruKPI2026", 1_000), { accountId: pengurus });
  assert.deepEqual(recovery.reset(token, "SandiLainKPI2027", 1_001), { error: "TOKEN_INVALID" }, "cannot reuse");
});

test("requests are rate-limited per account", () => {
  const recovery = new LocalPasswordRecovery();
  for (let index = 0; index < 3; index += 1) assert.ok(recovery.request(pengurus, 10_000 + index));
  assert.equal(recovery.request(pengurus, 10_010), null);
  assert.ok(recovery.request(pengurus, 10_000 + 15 * 60 * 1000 + 1), "window resets");
});

test("password policy explains what is missing", () => {
  assert.deepEqual(passwordProblems("abc"), ["minimal 12 karakter", "memuat angka"]);
  assert.deepEqual(passwordProblems("SandiBaruKPI2026"), []);
});

test("after a reset the new password signs in, the old one fails, and older sessions end", () => {
  const recovery = new LocalPasswordRecovery();
  setPasswordStateForTests(() => recovery);
  try {
    const before = completeTestMfa(startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 1_000)!, "000000", 1_000)!;
    assert.ok(getTestSession(before, 1_500, localEnvironment));
    recovery.reset(recovery.request(pengurus, 2_000)!, "SandiBaruKPI2026", 2_000);
    assert.equal(getTestSession(before, 2_500, localEnvironment), null, "sessions issued before the reset are revoked");
    assert.equal(startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 3_000), null);
    const after = completeTestMfa(startTestSignIn("pengurus.test@kpi.local", "SandiBaruKPI2026", 3_000)!, "000000", 3_000)!;
    assert.equal(getTestSession(after, 3_500, localEnvironment)?.accountId, pengurus);
  } finally {
    setPasswordStateForTests(() => null);
  }
});
