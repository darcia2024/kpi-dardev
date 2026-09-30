import { runWithRecordDatabase } from "@/platform/data/record-context";
import { SnapshotRecordDatabase, type RecordChange, type StoredRecord } from "@/platform/data/snapshot-record-database";

export interface RecordStoreGateway {
  load(organizationId: string, skip: readonly string[], include: readonly string[]): Promise<StoredRecord[]>;
  /** Applies every change or none. Throws RecordConflictError when a revision no longer matches. */
  commit(organizationId: string, actorId: string | null, changes: RecordChange[]): Promise<void>;
}

/** Append-only logs that most requests only write to. Load them explicitly when a request reads them. */
export const writeOnlyNamespaces = ["business-audit"] as const;

export type RecordTransactionOptions = {
  organizationId: string;
  actorId?: string | null;
  /** Write-only namespaces this request also needs to read. */
  include?: readonly string[];
};

/**
 * Runs `fn` against a snapshot of the organization's records and commits its
 * writes in one atomic call. Nothing is committed when `fn` throws; a failed
 * commit throws, so callers never report success for unsaved changes.
 */
export async function withRecordTransaction<T>(gateway: RecordStoreGateway, options: RecordTransactionOptions, fn: () => Promise<T> | T): Promise<T> {
  const include = [...(options.include ?? [])];
  const skip = writeOnlyNamespaces.filter((namespace) => !include.includes(namespace));
  const records = await gateway.load(options.organizationId, skip, include);
  const snapshot = new SnapshotRecordDatabase(records, new Set(skip));
  const result = await runWithRecordDatabase(snapshot, fn);
  const changes = snapshot.changes();
  if (changes.length) await gateway.commit(options.organizationId, options.actorId ?? null, changes);
  return result;
}
