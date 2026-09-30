import { getSupabaseConfiguration, type SupabaseConfiguration } from "@/platform/config/integrations";

export class IntegrationUnavailableError extends Error {
  constructor() {
    super("Supabase is not configured for this environment.");
    this.name = "IntegrationUnavailableError";
  }
}

/** A failed Supabase call. `databaseMessage` is the PostgREST error message, never shown to users. */
export class SupabaseRequestError extends Error {
  constructor(readonly status: number, readonly databaseMessage: string) {
    super(`Supabase request failed with status ${status}.`);
    this.name = "SupabaseRequestError";
  }
}

export function createSupabaseRestClient(values = process.env) {
  const configuration = getSupabaseConfiguration(values);
  if (!configuration) throw new IntegrationUnavailableError();
  return new SupabaseRestClient(configuration);
}

export class SupabaseRestClient {
  constructor(private readonly configuration: SupabaseConfiguration, private readonly fetcher: typeof fetch = fetch) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetcher(`${this.configuration.url}/rest/v1/${path.replace(/^\//, "")}`, {
      ...init,
      headers: {
        apikey: this.configuration.serviceRoleKey,
        Authorization: `Bearer ${this.configuration.serviceRoleKey}`,
        "Content-Type": "application/json",
        ...init.headers
      },
      cache: "no-store"
    });

    if (!response.ok) throw new SupabaseRequestError(response.status, await readDatabaseMessage(response));
    return response.json() as Promise<T>;
  }

  /** Calls a database function exposed in the public schema. */
  rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    return this.request<T>(`rpc/${encodeURIComponent(name)}`, { method: "POST", body: JSON.stringify(args) });
  }

  /** Supabase Auth admin API; server-only because it uses the service role. */
  async authAdmin<T>(path: string): Promise<T> {
    const response = await this.fetcher(`${this.configuration.url}/auth/v1/admin/${path.replace(/^\//, "")}`, {
      headers: { apikey: this.configuration.serviceRoleKey, Authorization: `Bearer ${this.configuration.serviceRoleKey}` },
      cache: "no-store"
    });
    if (!response.ok) throw new SupabaseRequestError(response.status, await readDatabaseMessage(response));
    return response.json() as Promise<T>;
  }
}

async function readDatabaseMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as { message?: unknown; msg?: unknown };
    return typeof body.message === "string" ? body.message : typeof body.msg === "string" ? body.msg : "";
  } catch {
    return "";
  }
}
