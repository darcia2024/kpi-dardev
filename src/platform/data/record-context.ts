import { AsyncLocalStorage } from "node:async_hooks";
import type { RecordDatabase } from "@/platform/data/local-record-store";

// Request-scoped record database. Outside a request transaction the local TEST
// store is used; inside one, every service reads and writes the request snapshot.
const storage = new AsyncLocalStorage<RecordDatabase>();

export function getScopedRecordDatabase(): RecordDatabase | undefined {
  return storage.getStore();
}

export function runWithRecordDatabase<T>(database: RecordDatabase, fn: () => T): T {
  return storage.run(database, fn);
}
