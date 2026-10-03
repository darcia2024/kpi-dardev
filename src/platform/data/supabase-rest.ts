import { getSupabaseConfiguration, type SupabaseConfiguration } from "@/platform/config/integrations";

export class IntegrationUnavailableError extends Error {
  constructor() {
    super("Supabase is not configured for this environment.");
    this.name = "IntegrationUnavailableError";
  }
}

export function createSupabaseRestClient(values = process.env) {
  const configuration = getSupabaseConfiguration(values);
  if (!configuration) throw new IntegrationUnavailableError();
  return new SupabaseRestClient(configuration);
}

export class SupabaseRestClient {
  constructor(private readonly configuration: SupabaseConfiguration) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.configuration.url}/rest/v1/${path.replace(/^\//, "")}`, {
      ...init,
      headers: {
        apikey: this.configuration.serviceRoleKey,
        Authorization: `Bearer ${this.configuration.serviceRoleKey}`,
        "Content-Type": "application/json",
        ...init.headers
      },
      cache: "no-store"
    });

    if (!response.ok) throw new Error(`Supabase request failed with status ${response.status}.`);
    return response.json() as Promise<T>;
  }
}
