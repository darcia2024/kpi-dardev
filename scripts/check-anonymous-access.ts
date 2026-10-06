import {readdir, readFile} from "node:fs/promises";
import {join, relative} from "node:path";

const target = new URL(process.argv[2] ?? "https://kpi-ppmi-mesir-preview.vercel.app");
if (target.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(target.hostname)) {
  throw new Error("Use HTTPS for a hosted deployment.");
}
const root = join(process.cwd(), "src", "app", "api", "v1", "work");
const fixtureId = "00000000-0000-4000-8000-000000000001";
async function routes(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await routes(path));
    else if (entry.name === "route.ts") {
      const source = await readFile(path, "utf8");
      if (/export\s+(?:(?:async\s+)?function\s+GET\b|const\s+GET\b)/.test(source)) {
        const route = relative(root, directory).replaceAll("\\", "/").replace(/\[[^\]]+\]/g, fixtureId);
        result.push(`/api/v1/work/${route}`);
      }
    }
  }
  return result.sort();
}

async function main() {
const endpoints = await routes(root);
if (!endpoints.length) throw new Error("No internal GET endpoints found; run from the repository root.");
let failures = 0;
for (const path of endpoints) {
  const url = new URL(path, target);
  if (path.endsWith("/export")) url.searchParams.set("formId", fixtureId);
  try {
    const response = await fetch(url, {redirect: "manual", signal: AbortSignal.timeout(20000)});
    await response.arrayBuffer();
    const passed = response.status === 401;
    if (!passed) failures++;
    console.log(`${passed ? "PASS" : "FAIL"} ${response.status} ${path}`);
  } catch {
    failures++;
    console.log(`FAIL NETWORK ${path}`);
  }
}
console.log(`Anonymous GET access: ${endpoints.length - failures}/${endpoints.length} denied with 401.`);
console.log("This check does not verify authenticated permissions, mutations, or private data isolation.");
process.exitCode = failures ? 1 : 0;
}
main().catch(() => {
  console.error("Anonymous access check could not run. Check the target URL and repository directory.");
  process.exitCode = 1;
});
