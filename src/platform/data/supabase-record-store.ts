import { RecordConflictError } from "@/platform/data/local-record-store";
import { SupabaseRequestError, type SupabaseRestClient } from "@/platform/data/supabase-rest";
import type { RecordStoreGateway } from "@/platform/data/record-transaction";
import type { RecordChange, StoredRecord } from "@/platform/data/snapshot-record-database";

/** Record storage in the KPI Supabase project (migration 20260930000000_record_store). */
export class SupabaseRecordStore implements RecordStoreGateway {
  constructor(private readonly client: SupabaseRestClient) {}

  async load(organizationId: string, skip: readonly string[], include: readonly string[]): Promise<StoredRecord[]> {
    const records = await this.client.rpc<unknown>("kpi_load_records", { p_organization_id: organizationId, p_skip: skip, p_include: include });
    if (!Array.isArray(records)) throw new Error("Unexpected record store response.");
    return records.map((record) => {
      const { namespace, id, revision, payload } = record as Record<string, unknown>;
      if (typeof namespace !== "string" || typeof id !== "string" || typeof revision !== "number") throw new Error("Unexpected record store response.");
      return { namespace, id, revision, payload };
    });
  }

  async commit(organizationId: string, actorId: string | null, changes: RecordChange[]): Promise<void> {
    try {
      await this.client.rpc<number>("kpi_commit_records", { p_organization_id: organizationId, p_actor_id: actorId, p_changes: changes });
    } catch (error) {
      if (error instanceof SupabaseRequestError && error.databaseMessage.includes("RECORD_CONFLICT")) throw new RecordConflictError();
      throw error;
    }
  }
}
