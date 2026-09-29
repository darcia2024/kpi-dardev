import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";

// Local TEST password recovery. Tokens are stored only as SHA-256 hashes, expire after 30 minutes,
// and are single-use. Hosted accounts use Supabase recovery instead (see the recovery route).
type RecoveryRequest = { id: string; accountId: string; expiresAt: number; requestedAt: number; usedAt?: number };
type PasswordOverride = { id: string; accountId: string; salt: string; hash: string; changedAt: number };

export const recoveryLifetimeMs = 30 * 60 * 1000;
const requestWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 3;

export function passwordProblems(password: string): string[] {
  return [
    password.length < 12 && "minimal 12 karakter",
    password.length > 128 && "maksimal 128 karakter",
    !/[A-Za-z]/.test(password) && "memuat huruf",
    !/\d/.test(password) && "memuat angka"
  ].filter((item): item is string => !!item);
}

const tokenHash = (token: string) => createHash("sha256").update(`kpi-recovery:${token}`).digest("hex");

export class LocalPasswordRecovery {
  private readonly requests: RecordCollection<RecoveryRequest>;
  private readonly overrides: RecordCollection<PasswordOverride>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: LocalRecordDatabase) {
    this.requests = database ? new PersistentRecords(database, "password-recovery", []) : new Map();
    this.overrides = database ? new PersistentRecords(database, "password-overrides", []) : new Map();
    this.audit = new LocalBusinessAuditService(database);
  }

  // Returns the raw token only to the caller; null when rate-limited. Callers must answer the
  // user the same way whether or not the account exists.
  request(accountId: string, now = Date.now()): string | null {
    const recent = Array.from(this.requests.values()).filter((item) => item.accountId === accountId && item.requestedAt > now - requestWindowMs);
    if (recent.length >= maxRequestsPerWindow) {
      this.audit.record({ action: "PASSWORD_RECOVERY_RATE_LIMITED", module: "identity", entityType: "account", entityId: accountId, result: "DENIED", requestId: `local:recovery:${now}` });
      return null;
    }
    const token = randomBytes(32).toString("base64url");
    this.requests.set(tokenHash(token), { id: tokenHash(token), accountId, requestedAt: now, expiresAt: now + recoveryLifetimeMs });
    this.audit.record({ action: "PASSWORD_RECOVERY_REQUESTED", module: "identity", entityType: "account", entityId: accountId, result: "SUCCESS", requestId: `local:recovery:${now}` });
    return token;
  }

  // Valid, unused, unexpired token → account id; anything else → null.
  peek(token: string, now = Date.now()): string | null {
    const request = this.requests.get(tokenHash(token));
    return request && !request.usedAt && request.expiresAt > now ? request.accountId : null;
  }

  reset(token: string, newPassword: string, now = Date.now()): { accountId: string } | { error: "TOKEN_INVALID" | "PASSWORD_WEAK" } {
    const accountId = this.peek(token, now);
    if (!accountId) return { error: "TOKEN_INVALID" };
    if (passwordProblems(newPassword).length) return { error: "PASSWORD_WEAK" };
    const request = this.requests.get(tokenHash(token))!;
    this.requests.set(request.id, { ...request, usedAt: now });
    const salt = randomBytes(16).toString("hex");
    this.overrides.set(accountId, { id: accountId, accountId, salt, hash: scryptSync(newPassword, salt, 32).toString("hex"), changedAt: now });
    this.audit.record({ action: "PASSWORD_RESET_COMPLETED", module: "identity", entityType: "account", entityId: accountId, result: "SUCCESS", requestId: `local:recovery:${now}`, metadata: { sessionsRevoked: true } });
    return { accountId };
  }

  // null = no override, so the fixture password still applies.
  verifyOverride(accountId: string, password: string): boolean | null {
    const override = this.overrides.get(accountId);
    if (!override) return null;
    const supplied = scryptSync(password, override.salt, 32);
    return timingSafeEqual(supplied, Buffer.from(override.hash, "hex"));
  }

  // Sessions issued before this moment are no longer valid ("keluar dari semua perangkat").
  passwordChangedAt(accountId: string): number | null {
    return this.overrides.get(accountId)?.changedAt ?? null;
  }
}

let localRecovery: LocalPasswordRecovery | undefined;
export function getLocalPasswordRecovery(): LocalPasswordRecovery {
  localRecovery ??= new LocalPasswordRecovery(getLocalRecordDatabase());
  return localRecovery;
}
