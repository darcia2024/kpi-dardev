import { backup, DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

export class RecordConflictError extends Error {
  constructor() { super("Record changed; reload before retrying."); }
}

/** Local synthetic data only. PostgreSQL integration uses a separate adapter. */
export class LocalRecordDatabase {
  private readonly db: DatabaseSync;

  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS records (
        namespace TEXT NOT NULL, id TEXT NOT NULL, revision INTEGER NOT NULL,
        payload TEXT NOT NULL, PRIMARY KEY(namespace, id));
      CREATE TABLE IF NOT EXISTS record_audit (
        sequence INTEGER PRIMARY KEY AUTOINCREMENT, namespace TEXT NOT NULL,
        record_id TEXT NOT NULL, revision INTEGER NOT NULL,
        recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
  }

  read(namespace: string, id: string) {
    return this.db.prepare("SELECT payload, revision FROM records WHERE namespace=? AND id=?").get(namespace, id) as { payload: string; revision: number } | undefined;
  }

  entries(namespace: string) {
    return this.db.prepare("SELECT id, payload, revision FROM records WHERE namespace=? ORDER BY id").all(namespace) as { id: string; payload: string; revision: number }[];
  }

  seed(namespace: string, id: string, value: unknown): void {
    this.db.prepare("INSERT OR IGNORE INTO records(namespace,id,revision,payload) VALUES(?,?,1,?)").run(namespace, id, JSON.stringify(value));
  }

  write(namespace: string, id: string, value: unknown, expectedRevision: number): number {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const current = this.read(namespace, id);
      if ((current?.revision ?? 0) !== expectedRevision) throw new RecordConflictError();
      const revision = expectedRevision + 1;
      this.db.prepare("INSERT INTO records(namespace,id,revision,payload) VALUES(?,?,?,?) ON CONFLICT(namespace,id) DO UPDATE SET revision=excluded.revision,payload=excluded.payload").run(namespace, id, revision, JSON.stringify(value));
      this.db.prepare("INSERT INTO record_audit(namespace,record_id,revision) VALUES(?,?,?)").run(namespace, id, revision);
      this.db.exec("COMMIT");
      return revision;
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }

  auditCount(namespace?: string): number {
    const query = namespace
      ? this.db.prepare("SELECT count(*) AS total FROM record_audit WHERE namespace=?")
      : this.db.prepare("SELECT count(*) AS total FROM record_audit");
    return Number(namespace ? query.get(namespace)?.total : query.get()?.total);
  }

  async backupTo(path: string): Promise<number> { return backup(this.db, path); }

  close(): void { this.db.close(); }
}

export interface RecordCollection<T> {
  get(id: string): T | undefined;
  set(id: string, value: T): unknown;
  values(): IterableIterator<T>;
}

export class PersistentRecords<T> implements RecordCollection<T> {
  private readonly revisions = new Map<string, number>();
  constructor(private readonly db: LocalRecordDatabase, private readonly namespace: string, seed: Iterable<[string, T]>) {
    for (const [id, value] of seed) db.seed(namespace, id, value);
  }
  get(id: string): T | undefined {
    const row = this.db.read(this.namespace, id);
    this.revisions.set(id, row?.revision ?? 0);
    return row ? JSON.parse(row.payload) as T : undefined;
  }
  set(id: string, value: T): void {
    const revision = this.db.write(this.namespace, id, value, this.revisions.get(id) ?? 0);
    this.revisions.set(id, revision);
  }
  *values(): IterableIterator<T> {
    for (const row of this.db.entries(this.namespace)) {
      this.revisions.set(row.id, row.revision);
      yield JSON.parse(row.payload) as T;
    }
  }
}

let database: LocalRecordDatabase | undefined;
export function getLocalRecordDatabase(): LocalRecordDatabase {
  if (process.env.KPI_APP_ENV !== "local" || process.env.KPI_TEST_AUTH_ENABLED !== "true") {
    throw new Error("Persistent TEST storage requires local TEST mode.");
  }
  return database ??= new LocalRecordDatabase(join(process.cwd(), ".kpi-test", "records.sqlite"));
}
