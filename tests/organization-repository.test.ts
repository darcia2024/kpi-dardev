import assert from "node:assert/strict";
import test from "node:test";
import { createOrganizationRepository, TestOrganizationRepository } from "../src/platform/data/organization-repository";

const testEnvironment = {
  KPI_APP_ENV: "local",
  KPI_APP_NAME: "kpi-ppmi-mesir",
  KPI_REQUEST_ID_HEADER: "x-request-id",
  KPI_TEST_AUTH_ENABLED: "true"
};

test("TEST organization repository returns deterministic synthetic records", async () => {
  const repository = new TestOrganizationRepository();
  const organization = await repository.getOrganizationByCode("kpi_test");
  assert.deepEqual(organization, {
    id: "00000000-0000-4000-8000-000000000001",
    code: "KPI_TEST",
    name: "KPI PPMI Mesir (Pratinjau)"
  });
  assert.deepEqual(await repository.getPeriods(organization.id), [{
    id: "00000000-0000-4000-8000-000000000002",
    organizationId: organization.id,
    code: "2026_2027_TEST",
    startsOn: "2026-01-01",
    endsOn: "2027-12-31",
    status: "PLANNED"
  }]);
});

test("repository factory uses fixtures only for local TEST", async () => {
  const repository = createOrganizationRepository(testEnvironment);
  assert.ok(repository instanceof TestOrganizationRepository);
  assert.equal(await repository.getOrganizationByCode("UNKNOWN"), null);
  assert.throws(
    () => createOrganizationRepository({ ...testEnvironment, KPI_APP_ENV: "staging", KPI_TEST_AUTH_ENABLED: "false" }),
    /approved Supabase configuration/
  );
});
