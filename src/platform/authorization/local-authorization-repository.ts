import { createHash, randomUUID } from "node:crypto";
import type { TestIdentity } from "@/platform/identity/test-auth";
import { getLocalRecordDatabase, PersistentRecords, type RecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { adminScopedPermissions, adminUnrestrictedPermissions, ketuaScopedPermissions, pengurusScopedPermissions } from "@/platform/authorization/test-personas";

export type AuthorizationScope = { organizationCode?: string; periodCode?: string; divisionCode?: string; objectId?: string };
export type LocalPermissionGrant = AuthorizationScope & { id: string; accountId: string; permission: string; active: boolean; expiresAt?: string; createdByAccountId: string; createdAt: string };

const admin = "00000000-0000-4000-8000-000000000101";
const pengurus = "00000000-0000-4000-8000-000000000102";
const ketua = "00000000-0000-4000-8000-000000000103";
const scope = { organizationCode: "KPI_TEST", periodCode: "2026_2027_TEST" } as const;
const now = "2026-09-22T08:00:00.000Z";

function seedGrants(): LocalPermissionGrant[] {
  const create = (accountId: string, permission: string, scoped: boolean): LocalPermissionGrant => ({ id: seedGrantId(accountId, permission), accountId, permission, ...(scoped ? scope : {}), active: true, createdByAccountId: admin, createdAt: now });
  return [...adminUnrestrictedPermissions.map((permission) => create(admin, permission, false)), ...adminScopedPermissions.map((permission) => create(admin, permission, true)), ...pengurusScopedPermissions.map((permission) => create(pengurus, permission, true)), ...ketuaScopedPermissions.map((permission) => create(ketua, permission, true))];
}

function seedGrantId(accountId: string, permission: string): string {
  const hash = createHash("sha256").update(`KPI_TEST_GRANT:${accountId}:${permission}`).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export class LocalAuthorizationRepository {
  private readonly grants: RecordCollection<LocalPermissionGrant>;
  private readonly audit: LocalBusinessAuditService;

  constructor(database?: RecordDatabase) {
    const seed = new Map(seedGrants().map((grant) => [grant.id, grant]));
    this.grants = database ? new PersistentRecords(database, "authorization-grants", seed) : seed;
    this.audit = new LocalBusinessAuditService(database);
    if (database) {
      for (const grant of this.grants.values()) {
        if (grant.createdAt === now && grant.createdByAccountId === admin && !seed.has(grant.id) && grant.active) {
          this.grants.set(grant.id, { ...grant, active: false });
        }
      }
    }
  }

  list(accountId?: string): LocalPermissionGrant[] {
    return Array.from(this.grants.values()).filter((grant) => !accountId || grant.accountId === accountId).map(cloneGrant);
  }

  has(identity: TestIdentity, permission: string, requested: AuthorizationScope = {}, at = Date.now()): boolean {
    return Array.from(this.grants.values()).some((grant) => grant.accountId === identity.accountId && grant.permission === permission && grant.active && (!grant.expiresAt || Date.parse(grant.expiresAt) > at) && scopeMatches(grant, requested));
  }

  create(input: Omit<LocalPermissionGrant, "id" | "createdAt">): LocalPermissionGrant {
    if (input.expiresAt && Number.isNaN(Date.parse(input.expiresAt))) throw new Error("Invalid grant expiry.");
    const grant = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    this.grants.set(grant.id, grant);
    this.audit.record({ action: "GRANT_CREATED", module: "authorization", entityType: "permission_grant", entityId: grant.id, actorAccountId: grant.createdByAccountId, result: "SUCCESS", requestId: `local:${grant.id}`, metadata: { permission: grant.permission, accountId: grant.accountId, active: grant.active } });
    return cloneGrant(grant);
  }

  setActive(id: string, active: boolean, actorAccountId?: string): LocalPermissionGrant | null {
    const current = this.grants.get(id);
    if (!current) return null;
    if (current.active === active) return cloneGrant(current);
    const updated = { ...current, active };
    this.grants.set(id, updated);
    this.audit.record({ action: active ? "GRANT_ENABLED" : "GRANT_DISABLED", module: "authorization", entityType: "permission_grant", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { permission: current.permission, accountId: current.accountId, previousActive: current.active, nextActive: active } });
    return cloneGrant(updated);
  }

  listAudit(entityId?: string) { return this.audit.list(entityId); }
}

function scopeMatches(grant: AuthorizationScope, requested: AuthorizationScope): boolean {
  return matches(grant.organizationCode, requested.organizationCode) && matches(grant.periodCode, requested.periodCode) && matches(grant.divisionCode, requested.divisionCode) && matches(grant.objectId, requested.objectId);
}
function matches(granted: string | undefined, requested: string | undefined): boolean { return !granted || granted === requested; }
function cloneGrant(grant: LocalPermissionGrant): LocalPermissionGrant { return { ...grant }; }

export function getLocalAuthorizationRepository(): LocalAuthorizationRepository { return new LocalAuthorizationRepository(getLocalRecordDatabase()); }
