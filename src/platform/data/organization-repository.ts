import { getSupabaseConfiguration } from "@/platform/config/integrations";
import { createSupabaseRestClient } from "@/platform/data/supabase-rest";
import { parseEnvironment } from "@/platform/config/environment";

export type OrganizationRecord = {
  id: string;
  code: string;
  name: string;
};

export type PeriodRecord = {
  id: string;
  organizationId: string;
  code: string;
  startsOn: string;
  endsOn: string;
  status: "PLANNED" | "ACTIVE" | "CLOSING" | "CLOSED";
};

export interface OrganizationRepository {
  getOrganizationByCode(code: string): Promise<OrganizationRecord | null>;
  getPeriods(organizationId: string): Promise<PeriodRecord[]>;
}

const testOrganization: OrganizationRecord = {
  id: "00000000-0000-4000-8000-000000000001",
  code: "KPI_TEST",
  name: "KPI PPMI Mesir (Pratinjau)"
};

export const testPeriods: PeriodRecord[] = [
  {
    id: "00000000-0000-4000-8000-000000000002",
    organizationId: testOrganization.id,
    code: "2026_2027_TEST",
    startsOn: "2026-01-01",
    endsOn: "2027-12-31",
    status: "PLANNED"
  }
];

export class TestOrganizationRepository implements OrganizationRepository {
  async getOrganizationByCode(code: string): Promise<OrganizationRecord | null> {
    return testOrganization.code === code.trim().toUpperCase() ? { ...testOrganization } : null;
  }

  async getPeriods(organizationId: string): Promise<PeriodRecord[]> {
    return testPeriods.filter((period) => period.organizationId === organizationId).map((period) => ({ ...period }));
  }
}

type SupabaseOrganization = { id: string; code: string; name: string };
type SupabasePeriod = { id: string; organization_id: string; code: string; starts_on: string; ends_on: string; status: PeriodRecord["status"] };

export class SupabaseOrganizationRepository implements OrganizationRepository {
  async getOrganizationByCode(code: string): Promise<OrganizationRecord | null> {
    const client = createSupabaseRestClient();
    const records = await client.request<SupabaseOrganization[]>(`organizations?code=eq.${encodeURIComponent(code.trim().toUpperCase())}&select=id,code,name`, {
      headers: { "Accept-Profile": "org" }
    });
    const organization = records[0];
    return organization ? { id: organization.id, code: organization.code, name: organization.name } : null;
  }

  async getPeriods(organizationId: string): Promise<PeriodRecord[]> {
    const client = createSupabaseRestClient();
    const records = await client.request<SupabasePeriod[]>(`periods?organization_id=eq.${encodeURIComponent(organizationId)}&select=id,organization_id,code,starts_on,ends_on,status&order=starts_on.desc`, {
      headers: { "Accept-Profile": "org" }
    });
    return records.map((period) => ({
      id: period.id,
      organizationId: period.organization_id,
      code: period.code,
      startsOn: period.starts_on,
      endsOn: period.ends_on,
      status: period.status
    }));
  }
}

export function createOrganizationRepository(values = process.env): OrganizationRepository {
  const environment = parseEnvironment(values);
  if (getSupabaseConfiguration(values)) return new SupabaseOrganizationRepository();
  if (environment.KPI_APP_ENV === "local" && environment.KPI_TEST_AUTH_ENABLED === "true") return new TestOrganizationRepository();
  throw new Error("Organization repository requires an approved Supabase configuration outside local TEST.");
}
