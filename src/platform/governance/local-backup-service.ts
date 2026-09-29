import { createHash, randomUUID } from "node:crypto";
import { copyFile, lstat, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { DatabaseSync } from "node:sqlite";
import { LocalBusinessAuditService } from "@/platform/audit/local-business-audit-service";
import { getLocalRecordDatabase, PersistentRecords, type LocalRecordDatabase, type RecordCollection } from "@/platform/data/local-record-store";

export type BackupRun = { id: string; createdAt: string; status: "VERIFIED"; recordCount: number; assetCount: number; sqliteSha256: string; actorAccountId: string };
type AssetWithHash = { id: string; contentSha256?: string };

export class LocalBackupService {
  private readonly runs: RecordCollection<BackupRun>;
  private readonly audit: LocalBusinessAuditService;
  constructor(private readonly db: LocalRecordDatabase, private readonly assetRoot: string, private readonly backupRoot: string) {
    this.runs = new PersistentRecords(db, "backup-runs", []);
    this.audit = new LocalBusinessAuditService(db);
  }
  list(): BackupRun[] { return Array.from(this.runs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async createAndVerify(actorAccountId: string): Promise<BackupRun> {
    const id = randomUUID();
    await mkdir(this.backupRoot, { recursive: true, mode: 0o700 });
    const staging = join(this.backupRoot, `.staging-${id}`);
    const destination = join(this.backupRoot, id);
    await mkdir(staging, { mode: 0o700 });
    try {
      const databasePath = join(staging, "records.sqlite");
      await this.db.backupTo(databasePath);
      const assetDestination = join(staging, "private-assets");
      await mkdir(assetDestination, { mode: 0o700 });
      const names = await readdir(this.assetRoot).catch((error: NodeJS.ErrnoException) => { if (error.code === "ENOENT") return []; throw error; });
      for (const name of names) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name)) continue;
        const source = join(this.assetRoot, name);
        if (!(await lstat(source)).isFile()) continue;
        await copyFile(source, join(assetDestination, name));
      }
      const result = await verifyBackup(databasePath, assetDestination);
      const run: BackupRun = { id, createdAt: new Date().toISOString(), status: "VERIFIED", actorAccountId, ...result };
      await writeFile(join(staging, "manifest.json"), JSON.stringify(run, null, 2), { flag: "wx", mode: 0o600 });
      await rename(staging, destination);
      this.runs.set(id, run);
      this.audit.record({ action: "LOCAL_BACKUP_VERIFIED", module: "backup", entityType: "backup", entityId: id, actorAccountId, result: "SUCCESS", requestId: `local:${id}`, metadata: { recordCount: run.recordCount, assetCount: run.assetCount } });
      return { ...run };
    } catch (error) { await rm(staging, { recursive: true, force: true }); throw error; }
  }
}

async function verifyBackup(databasePath: string, assetRoot: string): Promise<Pick<BackupRun, "recordCount" | "assetCount" | "sqliteSha256">> {
  const drillPath = `${databasePath}.restore-drill`;
  await copyFile(databasePath, drillPath);
  const restored = new DatabaseSync(drillPath, { readOnly: true });
  try {
    const integrity = restored.prepare("PRAGMA integrity_check").get() as { integrity_check: string };
    if (integrity.integrity_check !== "ok") throw new Error("SQLite backup integrity check failed.");
    const recordCount = Number((restored.prepare("SELECT count(*) AS total FROM records").get() as { total: number }).total);
    const assets = restored.prepare("SELECT payload FROM records WHERE namespace = 'assets'").all() as { payload: string }[];
    for (const row of assets) {
      const asset = JSON.parse(row.payload) as AssetWithHash;
      if (!asset.contentSha256) continue;
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(asset.id)) throw new Error("Invalid private asset identifier in snapshot.");
      const bytes = await readFile(join(assetRoot, asset.id));
      if (createHash("sha256").update(bytes).digest("hex") !== asset.contentSha256) throw new Error("Private asset checksum mismatch.");
    }
    const assetCount = (await readdir(assetRoot)).length;
    const sqliteSha256 = createHash("sha256").update(await readFile(databasePath)).digest("hex");
    return { recordCount, assetCount, sqliteSha256 };
  } finally { restored.close(); await rm(drillPath, { force: true }); }
}

export function getLocalBackupService(): LocalBackupService {
  const root = join(process.cwd(), ".kpi-test");
  const backupRoot = join(process.env.LOCALAPPDATA ?? tmpdir(), "KPI-Dardev", "backups");
  return new LocalBackupService(getLocalRecordDatabase(), join(root, "private-assets"), backupRoot);
}
