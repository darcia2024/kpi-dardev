import { randomUUID } from "node:crypto";
import { parseEnvironment } from "@/platform/config/environment";

export const sessionCookieName = "kpi_test_session";

export type Role = "ADMIN_SISTEM" | "PENGURUS";

export type TestIdentity = {
  email: string;
  name: string;
  roles: Role[];
};

type Challenge = TestIdentity & { expiresAt: number };
type Session = TestIdentity & { expiresAt: number };

const testPassword = "KPI-TEST-2026";
const testMfaCode = "000000";
const challengeLifetimeMs = 5 * 60 * 1000;
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

const accounts: Array<TestIdentity & { password: string }> = [
  { email: "pengurus.test@kpi.local", name: "Pengurus TEST", password: testPassword, roles: ["PENGURUS"] },
  { email: "admin.test@kpi.local", name: "Admin Sistem TEST", password: testPassword, roles: ["ADMIN_SISTEM", "PENGURUS"] }
];

const challenges = new Map<string, Challenge>();
const sessions = new Map<string, Session>();

export function isTestAuthEnabled(values = process.env): boolean {
  const environment = parseEnvironment(values);
  return environment.KPI_APP_ENV === "local" && environment.KPI_TEST_AUTH_ENABLED === "true";
}

export function startTestSignIn(email: string, password: string, now = Date.now()): string | null {
  const account = accounts.find((candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password);
  if (!account) return null;

  const challengeId = randomUUID();
  challenges.set(challengeId, { email: account.email, name: account.name, roles: account.roles, expiresAt: now + challengeLifetimeMs });
  return challengeId;
}

export function completeTestMfa(challengeId: string, code: string, now = Date.now()): string | null {
  const challenge = challenges.get(challengeId);
  challenges.delete(challengeId);
  if (!challenge || challenge.expiresAt <= now || code !== testMfaCode) return null;

  const sessionId = randomUUID();
  sessions.set(sessionId, { email: challenge.email, name: challenge.name, roles: challenge.roles, expiresAt: now + sessionLifetimeMs });
  return sessionId;
}

export function getTestSession(sessionId: string | undefined, now = Date.now()): TestIdentity | null {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session || session.expiresAt <= now) {
    sessions.delete(sessionId);
    return null;
  }
  return { email: session.email, name: session.name, roles: session.roles };
}

export function revokeTestSession(sessionId: string | undefined): void {
  if (sessionId) sessions.delete(sessionId);
}

export function hasRole(identity: TestIdentity, role: Role): boolean {
  return identity.roles.includes(role);
}
