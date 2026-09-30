import { RecordConflictError, type RecordDatabase } from "@/platform/data/local-record-store";

export type StoredRecord = { namespace: string; id: string; revision: number; payload: unknown };
export type RecordChange = { namespace: string; id: string; expectedRevision: number; payload: unknown };

export class NamespaceNotLoadedError extends Error {
  constructor(namespace: string) {
    super(`Namespace "${namespace}" was not loaded for this request.`);
    this.name = "NamespaceNotLoadedError";
  }
}

type Row = { payload: string; revision: number };

/**
 * In-memory view of one organization's records for a single request.
 *
 * Services run their existing synchronous logic against it; every write is
 * checked against the loaded revision and queued. The queue is committed once,
 * atomically, when the request finishes (see withRecordTransaction).
 *
 * Namespaces listed as write-only (large append-only logs) are not loaded:
 * reading them throws, and they only accept new records, whose uniqueness the
 * database checks on commit.
 */
export class SnapshotRecordDatabase implements RecordDatabase {
  private readonly rows = new Map<string, Map<string, Row>>();
  private readonly pending = new Map<string, RecordChange>();

  constructor(records: Iterable<StoredRecord>, private readonly writeOnly: ReadonlySet<string> = new Set()) {
    for (const record of records) {
      this.namespace(record.namespace).set(record.id, { payload: JSON.stringify(record.payload), revision: record.revision });
    }
  }

  read(namespace: string, id: string): Row | undefined {
    this.requireLoaded(namespace);
    const row = this.rows.get(namespace)?.get(id);
    return row ? { ...row } : undefined;
  }

  entries(namespace: string): { id: string; payload: string; revision: number }[] {
    this.requireLoaded(namespace);
    return Array.from(this.rows.get(namespace) ?? new Map<string, Row>())
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
      .map(([id, row]) => ({ id, ...row }));
  }

  /** Fixtures belong to local TEST data only; production starts empty. */
  seed(): void {}

  write(namespace: string, id: string, value: unknown, expectedRevision: number): number {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) throw new TypeError("Record payload must be JSON-serializable.");
    const key = `${namespace}\u0000${id}`;
    const queued = this.pending.get(key);

    if (this.writeOnly.has(namespace)) {
      if (expectedRevision !== 0 || queued) throw new RecordConflictError();
      this.pending.set(key, { namespace, id, expectedRevision: 0, payload: JSON.parse(serialized) });
      return 1;
    }

    const current = this.rows.get(namespace)?.get(id)?.revision ?? 0;
    if (current !== expectedRevision) throw new RecordConflictError();
    const revision = expectedRevision + 1;
    this.namespace(namespace).set(id, { payload: serialized, revision });
    // A record written several times in one request is committed once, checked
    // against the revision it had when the request loaded it.
    this.pending.set(key, { namespace, id, expectedRevision: queued ? queued.expectedRevision : expectedRevision, payload: JSON.parse(serialized) });
    return revision;
  }

  changes(): RecordChange[] {
    return Array.from(this.pending.values(), (change) => ({ ...change }));
  }

  private namespace(namespace: string): Map<string, Row> {
    let rows = this.rows.get(namespace);
    if (!rows) { rows = new Map(); this.rows.set(namespace, rows); }
    return rows;
  }

  private requireLoaded(namespace: string): void {
    if (this.writeOnly.has(namespace)) throw new NamespaceNotLoadedError(namespace);
  }
}
