import { getSupabaseConfiguration } from "@/platform/config/integrations";
import { createSupabaseRestClient, type SupabaseRestClient } from "@/platform/data/supabase-rest";
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

// The org schema is not exposed through the Supabase API; the kpi_* functions
// (service role only) read it on the server.
export class SupabaseOrganizationRepository implements OrganizationRepository {
  constructor(private readonly client: SupabaseRestClient = createSupabaseRestClient()) {}

  async getOrganizationByCode(code: string): Promise<OrganizationRecord | null> {
    const records = await this.client.rpc<SupabaseOrganization[]>("kpi_get_organization", { p_code: code });
    const organization = records[0];
    return organization ? { id: organization.id, code: organization.code, name: organization.name } : null;
  }

  async getPeriods(organizationId: string): Promise<PeriodRecord[]> {
    const records = await this.client.rpc<SupabasePeriod[]>("kpi_list_periods", { p_organization_id: organizationId });
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
