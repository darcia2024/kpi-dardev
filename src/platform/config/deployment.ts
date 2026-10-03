import { parseEnvironment } from "./environment";

export function validateDeployment(values: Record<string, string | undefined>): void {
  const environment = parseEnvironment(values);
  if (environment.KPI_APP_ENV !== "production") throw new Error("Hosted KPI deployments require KPI_APP_ENV=production.");
  if (environment.KPI_TEST_AUTH_ENABLED !== "false") throw new Error("Hosted deployments must disable local test authentication.");
  if (values.VERCEL_ENV && values.VERCEL_ENV !== "production") throw new Error("Deploy KPI using the Vercel Production target (--prod).");
  if (values.KPI_AUTH_PROVIDER !== "supabase") throw new Error("Hosted KPI deployments require KPI_AUTH_PROVIDER=supabase.");
  for (const name of ["KPI_SUPABASE_URL", "KPI_SUPABASE_PUBLISHABLE_KEY", "KPI_SUPABASE_SERVICE_ROLE_KEY"]) {
    const value = values[name]?.trim();
    if (!value || value === "[SENSITIVE]" || /your[-_]|replace[-_]/i.test(value)) throw new Error(`Missing or placeholder deployment variable: ${name}.`);
  }
  const url = new URL(values.KPI_SUPABASE_URL!);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("KPI_SUPABASE_URL must be an HTTPS project origin.");
  if (values.KPI_SUPABASE_PUBLISHABLE_KEY === values.KPI_SUPABASE_SERVICE_ROLE_KEY) throw new Error("Publishable and service-role keys must be different.");
  for (const [name, value] of Object.entries(values)) {
    if (name.startsWith("NEXT_PUBLIC_") && value && (name.includes("SERVICE_ROLE") || value === values.KPI_SUPABASE_SERVICE_ROLE_KEY)) throw new Error("Service-role credentials must never be exposed through NEXT_PUBLIC_ variables.");
  }
}

export type ConnectionCheck = { name: string; ok: boolean; status?: number; code?: string };

export async function checkSupabaseConnection(values: Record<string, string | undefined>, request: typeof fetch = fetch): Promise<ConnectionCheck[]> {
  validateDeployment(values);
  const url = values.KPI_SUPABASE_URL!.replace(/\/$/, "");
  const probes = [
    { name: "auth", path: "/auth/v1/settings", key: values.KPI_SUPABASE_PUBLISHABLE_KEY!, schema: undefined },
    { name: "database-api", path: "/rest/v1/", key: values.KPI_SUPABASE_SERVICE_ROLE_KEY!, schema: undefined },
    { name: "organization-schema", path: "/rest/v1/organizations?select=id&limit=0", key: values.KPI_SUPABASE_SERVICE_ROLE_KEY!, schema: "org" },
    { name: "identity-access-rpc", path: "/rest/v1/rpc/kpi_access_context", key: values.KPI_SUPABASE_SERVICE_ROLE_KEY!, schema: undefined },
    { name: "tasks-schema-rpc", path: "/rest/v1/rpc/kpi_tasks_ready", key: values.KPI_SUPABASE_SERVICE_ROLE_KEY!, schema: undefined },
    { name: "admin-schema-rpc", path: "/rest/v1/rpc/kpi_admin_ready", key: values.KPI_SUPABASE_SERVICE_ROLE_KEY!, schema: undefined },
    { name: "operations-schema-rpc", path: "/rest/v1/rpc/kpi_operations_schema_ready", key: values.KPI_SUPABASE_SERVICE_ROLE_KEY!, schema: undefined }
  ];
  return Promise.all(probes.map(async (probe): Promise<ConnectionCheck> => {
    try {
      const headers: Record<string, string> = { apikey: probe.key };
      if (probe.key.startsWith("eyJ")) headers.Authorization = `Bearer ${probe.key}`;
      if (probe.schema) headers["Accept-Profile"] = probe.schema;
      const rpc = probe.name.endsWith("-rpc");
      if (rpc) headers["Content-Type"] = "application/json";
      const response = await request(`${url}${probe.path}`, { headers, ...(rpc ? { method: "POST", body: "{}" } : {}), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000) });
      let code: string | undefined;
      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const candidate = body && typeof body === "object" && "code" in body ? body.code : undefined;
        if (typeof candidate === "string" && /^[A-Z0-9_]{1,32}$/.test(candidate)) code = candidate;
      } else if (probe.name.endsWith("schema-rpc")) {
        if (await response.json() !== true) return { name: probe.name, ok: false, status: response.status, code: "SCHEMA_NOT_READY" };
      } else {
        await response.body?.cancel();
      }
      return { name: probe.name, ok: response.ok, status: response.status, ...(code ? { code } : {}) };
    } catch {
      return { name: probe.name, ok: false, code: "NETWORK_OR_TIMEOUT" };
    }
  }));
}
