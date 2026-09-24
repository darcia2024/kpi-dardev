import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { parseEnvironment } from "@/platform/config/environment";

export const sessionCookieName = "kpi_test_session";

export type Role = "ADMIN_SISTEM" | "PENGURUS";

export type TestIdentity = {
  accountId: string;
  email: string;
  name: string;
  roles: Role[];
};

type Challenge = TestIdentity & { expiresAt: number };
type SessionPayload = TestIdentity & { expiresAt: number; issuedAt: number; sessionId: string };

const testPassword = "KPI-TEST-2026";
const testMfaCode = "000000";
const challengeLifetimeMs = 5 * 60 * 1000;
const sessionLifetimeMs = 8 * 60 * 60 * 1000;
const testSessionSigningKey = "kpi-local-test-session-v1-not-for-production";

const accounts: Array<TestIdentity & { password: string }> = [
  { accountId: "00000000-0000-4000-8000-000000000102", email: "pengurus.test@kpi.local", name: "Pengurus Pratinjau", password: testPassword, roles: ["PENGURUS"] },
  { accountId: "00000000-0000-4000-8000-000000000101", email: "admin.test@kpi.local", name: "Admin Sistem Pratinjau", password: testPassword, roles: ["ADMIN_SISTEM", "PENGURUS"] }
];

export function listTestIdentities(): TestIdentity[] {
  return accounts.map(({ accountId, email, name, roles }) => ({ accountId, email, name, roles: [...roles] }));
}

const challenges = new Map<string, Challenge>();
const revokedSessionIds = new Map<string, number>();

export function isTestAuthEnabled(values = process.env): boolean {
  const environment = parseEnvironment(values);
  return environment.KPI_APP_ENV === "local" && environment.KPI_TEST_AUTH_ENABLED === "true";
}

export function startTestSignIn(email: string, password: string, now = Date.now()): string | null {
  const account = accounts.find((candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password);
  if (!account) return null;

  const challengeId = randomUUID();
  challenges.set(challengeId, { accountId: account.accountId, email: account.email, name: account.name, roles: account.roles, expiresAt: now + challengeLifetimeMs });
  return challengeId;
}

export function completeTestMfa(challengeId: string, code: string, now = Date.now()): string | null {
  const challenge = challenges.get(challengeId);
  challenges.delete(challengeId);
  if (!challenge || challenge.expiresAt <= now || code !== testMfaCode) return null;

  return signTestSession({
    accountId: challenge.accountId,
    email: challenge.email,
    name: challenge.name,
    roles: challenge.roles,
    sessionId: randomUUID(),
    issuedAt: now,
    expiresAt: now + sessionLifetimeMs
  });
}

export function getTestSession(token: string | undefined, now = Date.now(), values: NodeJS.ProcessEnv = process.env): TestIdentity | null {
  if (!isTestAuthEnabled(values)) return null;
  const session = readTestSession(token);
  if (!session || session.expiresAt <= now || revokedSessionIds.has(session.sessionId)) return null;
  return { accountId: session.accountId, email: session.email, name: session.name.replace(/\sTEST$/, " Pratinjau"), roles: session.roles };
}

export function revokeTestSession(token: string | undefined): void {
  const session = readTestSession(token);
  if (session) revokedSessionIds.set(session.sessionId, session.expiresAt);
}

export function hasRole(identity: TestIdentity, role: Role): boolean {
  return identity.roles.includes(role);
}

function signTestSession(payload: SessionPayload): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", testSessionSigningKey).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

function readTestSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [encodedPayload, suppliedSignature, unexpectedPart] = token.split(".");
  if (!encodedPayload || !suppliedSignature || unexpectedPart) return null;

  const expectedSignature = createHmac("sha256", testSessionSigningKey).update(encodedPayload).digest();
  const suppliedSignatureBytes = Buffer.from(suppliedSignature, "base64url");
  if (expectedSignature.length !== suppliedSignatureBytes.length || !timingSafeEqual(expectedSignature, suppliedSignatureBytes)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    if (!isSessionPayload(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}

function isSessionPayload(payload: SessionPayload): boolean {
  return typeof payload.accountId === "string"
    && typeof payload.email === "string"
    && typeof payload.name === "string"
    && Array.isArray(payload.roles)
    && payload.roles.every((role) => role === "ADMIN_SISTEM" || role === "PENGURUS")
    && typeof payload.sessionId === "string"
    && typeof payload.issuedAt === "number"
    && typeof payload.expiresAt === "number";
}
