import { cookies } from "next/headers";
import { getLocalDirectoryService } from "@/platform/identity/local-directory-service";
import { testPeriods, type PeriodRecord } from "@/platform/data/organization-repository";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

export const previewPeriodCookieName = "kpi_preview_period";

export function resolvePreviewPeriod(code: string | undefined, periods: PeriodRecord[]): PeriodRecord {
  return periods.find((period) => period.code === code && period.status !== "CLOSED") ?? periods.find((period) => period.code === testPeriods[0].code && period.status !== "CLOSED") ?? periods.find((period) => period.status !== "CLOSED") ?? testPeriods[0];
}

export async function getSelectedPreviewPeriod(): Promise<PeriodRecord> {
  const cookie = (await cookies()).get(previewPeriodCookieName)?.value;
  // Outside local TEST mode the local store is locked (and no preview session can read data),
  // so portal pages must resolve a period without opening it instead of crashing with a 500.
  if (!isTestAuthEnabled()) return resolvePreviewPeriod(cookie, testPeriods);
  return resolvePreviewPeriod(cookie, getLocalDirectoryService().listPeriods());
}

export async function getSelectedPreviewScope(): Promise<{ organizationCode: "KPI_TEST"; periodCode: string }> {
  const period = await getSelectedPreviewPeriod();
  return { organizationCode: "KPI_TEST", periodCode: period.code };
}
