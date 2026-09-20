import assert from "node:assert/strict";
import test from "node:test";
import { completeTestMfa, getTestSession, hasRole, revokeTestSession, startTestSignIn } from "../src/platform/identity/test-auth";

test("requires valid TEST credentials and a second MFA factor before creating a session", () => {
  assert.equal(startTestSignIn("invalid@kpi.local", "wrong"), null);

  const challengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 1_000);
  assert.ok(challengeId);
  assert.equal(completeTestMfa(challengeId, "123456", 1_001), null);

  const validChallengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 2_000);
  assert.ok(validChallengeId);
  const sessionId = completeTestMfa(validChallengeId, "000000", 2_001);
  assert.ok(sessionId);
  assert.deepEqual(getTestSession(sessionId, 2_002), {
    email: "pengurus.test@kpi.local",
    name: "Pengurus TEST",
    roles: ["PENGURUS"]
  });
});

test("rejects an expired or revoked TEST session", () => {
  const challengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 10_000);
  assert.ok(challengeId);
  const sessionId = completeTestMfa(challengeId, "000000", 10_001);
  assert.ok(sessionId);
  assert.equal(getTestSession(sessionId, 10_000 + 8 * 60 * 60 * 1000 + 1), null);

  const secondChallengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 20_000);
  assert.ok(secondChallengeId);
  const secondSessionId = completeTestMfa(secondChallengeId, "000000", 20_001);
  assert.ok(secondSessionId);
  revokeTestSession(secondSessionId);
  assert.equal(getTestSession(secondSessionId, 20_002), null);
});

test("does not grant system administration to a pengurus TEST identity", () => {
  const challengeId = startTestSignIn("pengurus.test@kpi.local", "KPI-TEST-2026", 30_000);
  assert.ok(challengeId);
  const sessionId = completeTestMfa(challengeId, "000000", 30_001);
  assert.ok(sessionId);
  const identity = getTestSession(sessionId, 30_002);
  assert.ok(identity);
  assert.equal(hasRole(identity, "PENGURUS"), true);
  assert.equal(hasRole(identity, "ADMIN_SISTEM"), false);
});
