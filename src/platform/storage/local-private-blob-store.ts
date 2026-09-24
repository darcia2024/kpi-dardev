import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class LocalPrivateBlobStore {
  constructor(private readonly root = join(process.cwd(), ".kpi-test", "private-assets")) {}

  async save(id: string, bytes: Uint8Array): Promise<string> {
    if (!uuid.test(id) || bytes.length === 0 || bytes.length > 25_000_000) throw new Error("Invalid private asset.");
    await mkdir(this.root, { recursive: true });
    await writeFile(join(this.root, id), bytes, { flag: "wx", mode: 0o600 });
    return createHash("sha256").update(bytes).digest("hex");
  }

  async read(id: string): Promise<Buffer | null> {
    if (!uuid.test(id)) return null;
    try { return await readFile(join(this.root, id)); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw error; }
  }
}

export function getLocalPrivateBlobStore(): LocalPrivateBlobStore { return new LocalPrivateBlobStore(); }
