import { getSupabaseConfiguration } from "@/platform/config/integrations";
import { createSupabaseRestClient } from "@/platform/data/supabase-rest";
import { createOrganizationRepository, type OrganizationRecord, type PeriodRecord } from "@/platform/data/organization-repository";
import { listTestIdentities } from "@/platform/identity/test-auth";
import type { LocalDirectoryService } from "@/platform/identity/local-directory-service";

export type DirectoryAccount = { id: string; email: string; name: string; status: "INVITED" | "ACTIVE" | "SUSPENDED" | "ARCHIVED"; roles: string[]; createdAt?: string; deactivatedAt?: string };
export type DirectoryPosition = { id: string; code: string; name: string; divisionId?: string };
export type DirectoryDivision = { id: string; code: string; name: string };
export type DirectoryAssignment = { id: string; accountId: string; positionId: string; periodId: string; startsOn: string; endsOn?: string };
export type DirectorySnapshot = { organization: OrganizationRecord | null; periods: PeriodRecord[]; accounts: DirectoryAccount[]; divisions: DirectoryDivision[]; positions: DirectoryPosition[]; assignments: DirectoryAssignment[]; source: "LOCAL_PREVIEW" | "SUPABASE" };

function inFilter(ids: string[]): string {
  return `in.(${ids.map((id) => encodeURIComponent(id)).join(",")})`;
}

export async function loadDirectory(organizationCode: string, values = process.env, localDirectory?: LocalDirectoryService): Promise<DirectorySnapshot> {
  const repository = createOrganizationRepository(values);
  const organization = await repository.getOrganizationByCode(organizationCode);
  const periods = organization ? await repository.getPeriods(organization.id) : [];
  if (!getSupabaseConfiguration(values)) {
    if (organizationCode !== "KPI_TEST" || !organization) return { organization, periods, source: "LOCAL_PREVIEW", accounts: [], divisions: [], positions: [], assignments: [] };
    return {
      organization, periods: localDirectory?.listPeriods() ?? periods, source: "LOCAL_PREVIEW",
      accounts: listTestIdentities().map((item) => ({ id: item.accountId, email: item.email, name: item.name, status: "ACTIVE", roles: [...item.roles] })),
      divisions: localDirectory?.listDivisions() ?? [], positions: localDirectory?.listPositions() ?? [], assignments: localDirectory?.listAssignments() ?? []
    };
  }
  if (!organization) return { organization: null, periods: [], accounts: [], divisions: [], positions: [], assignments: [], source: "SUPABASE" };
  const client = createSupabaseRestClient(values);
  const positionRows = await client.request<Array<{ id: string; code: string; name: string }>>(`positions?organization_id=eq.${encodeURIComponent(organization.id)}&select=id,code,name&order=name`, { headers: { "Accept-Profile": "org" } });
  const positions = positionRows.map((row) => ({ ...row }));
  if (!positions.length) return { organization, periods, accounts: [], divisions: [], positions, assignments: [], source: "SUPABASE" };
  const assignmentRows = await client.request<Array<{ id: string; account_id: string; position_id: string; period_id: string; starts_on: string; ends_on: string | null }>>(`assignments?position_id=${inFilter(positions.map((item) => item.id))}&select=id,account_id,position_id,period_id,starts_on,ends_on`, { headers: { "Accept-Profile": "org" } });
  const periodIds = new Set(periods.map((period) => period.id));
  const assignments = assignmentRows.filter((row) => periodIds.has(row.period_id)).map((row) => ({ id: row.id, accountId: row.account_id, positionId: row.position_id, periodId: row.period_id, startsOn: row.starts_on, endsOn: row.ends_on ?? undefined }));
  const accountIds = [...new Set(assignments.map((item) => item.accountId))];
  if (!accountIds.length) return { organization, periods, accounts: [], divisions: [], positions, assignments, source: "SUPABASE" };
  const accountRows = await client.request<Array<{ id: string; email: string; display_name: string; status: DirectoryAccount["status"]; created_at: string; deactivated_at: string | null }>>(`accounts?id=${inFilter(accountIds)}&select=id,email,display_name,status,created_at,deactivated_at`, { headers: { "Accept-Profile": "identity" } });
  const accountRoleRows = await client.request<Array<{ account_id: string; role_id: string; starts_at: string; ends_at: string | null }>>(`account_roles?account_id=${inFilter(accountIds)}&select=account_id,role_id,starts_at,ends_at`, { headers: { "Accept-Profile": "identity" } });
  const activeRoleRows = accountRoleRows.filter((row) => Date.parse(row.starts_at) <= Date.now() && (!row.ends_at || Date.parse(row.ends_at) > Date.now()));
  const roleIds = [...new Set(activeRoleRows.map((row) => row.role_id))];
  const roleRows = roleIds.length ? await client.request<Array<{ id: string; code: string }>>(`roles?id=${inFilter(roleIds)}&select=id,code`, { headers: { "Accept-Profile": "identity" } }) : [];
  const roleCodes = new Map(roleRows.map((row) => [row.id, row.code]));
  const accounts = accountRows.map((row) => ({ id: row.id, email: row.email, name: row.display_name, status: row.status, createdAt: row.created_at, deactivatedAt: row.deactivated_at ?? undefined, roles: activeRoleRows.filter((role) => role.account_id === row.id).map((role) => roleCodes.get(role.role_id)).filter((code): code is string => !!code) }));
  return { organization, periods, accounts, divisions: [], positions, assignments, source: "SUPABASE" };
}
