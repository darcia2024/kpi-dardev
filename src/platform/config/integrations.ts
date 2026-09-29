export type IntegrationStatus = "READY" | "NOT_CONFIGURED" | "INVALID_CONFIGURATION";

export type SupabaseConfiguration = {
  url: string;
  serviceRoleKey: string;
};

export function getSupabaseConfiguration(values: Record<string, string | undefined>): SupabaseConfiguration | null {
  const url = values.KPI_SUPABASE_URL?.trim();
  const serviceRoleKey = values.KPI_SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) return null;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return null;
  } catch {
    return null;
  }

  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

export function getSupabaseIntegrationStatus(values: Record<string, string | undefined>): IntegrationStatus {
  const url = values.KPI_SUPABASE_URL?.trim();
  const serviceRoleKey = values.KPI_SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url && !serviceRoleKey) return "NOT_CONFIGURED";
  return getSupabaseConfiguration(values) ? "READY" : "INVALID_CONFIGURATION";
}
