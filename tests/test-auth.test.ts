import assert from "node:assert/strict";
import test from "node:test";
import { completeTestMfa, getTestSession, hasRole, revokeTestSession, startTestSignIn } from "../src/platform/identity/test-auth";

const localEnvironment = { KPI_APP_ENV: "local", KPI_APP_NAME: "kpi-ppmi-mesir", KPI_REQUEST_ID_HEADER: "x-request-id", KPI_TEST_AUTH_ENABLED: "true" };
const productionEnvironment = { ...localEnvironment, KPI_APP_ENV: "production", KPI_TEST_AUTH_ENABLED: "false" };

test("requires valid TEST credentials and a second MFA factor before creating a session", () => {
  assert.equal(startTestSignIn("invalid@kpi.local", "wrong"), null);

  const challengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 1_000);
  assert.ok(challengeId);
  assert.equal(completeTestMfa(challengeId, "123456", 1_001), null);

  const validChallengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 2_000);
  assert.ok(validChallengeId);
  const sessionId = completeTestMfa(validChallengeId, "000000", 2_001);
  assert.ok(sessionId);
  assert.deepEqual(getTestSession(sessionId, 2_002, localEnvironment), {
    accountId: "00000000-0000-4000-8000-000000000102",
    email: "pengurus.test@kpi.local",
    name: "Pengurus Pratinjau",
    roles: ["PENGURUS"]
  });
  assert.equal(getTestSession(sessionId, 2_002, productionEnvironment), null);
});

test("rejects an expired or revoked TEST session", () => {
  const challengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 10_000);
  assert.ok(challengeId);
  const sessionId = completeTestMfa(challengeId, "000000", 10_001);
  assert.ok(sessionId);
  assert.equal(getTestSession(sessionId, 10_000 + 8 * 60 * 60 * 1000 + 1, localEnvironment), null);

  const secondChallengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 20_000);
  assert.ok(secondChallengeId);
  const secondSessionId = completeTestMfa(secondChallengeId, "000000", 20_001);
  assert.ok(secondSessionId);
  revokeTestSession(secondSessionId);
  assert.equal(getTestSession(secondSessionId, 20_002, localEnvironment), null);
});

test("rejects a session whose signed payload has been modified", () => {
  const challengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 50_000);
  assert.ok(challengeId);
  const token = completeTestMfa(challengeId, "000000", 50_001);
  assert.ok(token);
  assert.equal(getTestSession(`${token}tampered`, 50_002, localEnvironment), null);
});

test("does not grant system administration to a pengurus TEST identity", () => {
  const challengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 30_000);
  assert.ok(challengeId);
  const sessionId = completeTestMfa(challengeId, "000000", 30_001);
  assert.ok(sessionId);
  const identity = getTestSession(sessionId, 30_002, localEnvironment);
  assert.ok(identity);
  assert.equal(hasRole(identity, "PENGURUS"), true);
  assert.equal(hasRole(identity, "ADMIN_SISTEM"), false);
});
