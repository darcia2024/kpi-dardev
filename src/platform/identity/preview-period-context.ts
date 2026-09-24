import { cookies } from "next/headers";
import { getLocalDirectoryService } from "@/platform/identity/local-directory-service";
import { testPeriods, type PeriodRecord } from "@/platform/data/organization-repository";

export const previewPeriodCookieName = "kpi_preview_period";

export function resolvePreviewPeriod(code: string | undefined, periods: PeriodRecord[]): PeriodRecord {
  return periods.find((period) => period.code === code && period.status !== "CLOSED") ?? periods.find((period) => period.code === testPeriods[0].code && period.status !== "CLOSED") ?? periods.find((period) => period.status !== "CLOSED") ?? testPeriods[0];
}

export async function getSelectedPreviewPeriod(): Promise<PeriodRecord> {
  const cookie = (await cookies()).get(previewPeriodCookieName)?.value;
  return resolvePreviewPeriod(cookie, getLocalDirectoryService().listPeriods());
}

export async function getSelectedPreviewScope(): Promise<{ organizationCode: "KPI_TEST"; periodCode: string }> {
  const period = await getSelectedPreviewPeriod();
  return { organizationCode: "KPI_TEST", periodCode: period.code };
}
