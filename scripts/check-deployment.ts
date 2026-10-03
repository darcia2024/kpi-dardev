import { checkSupabaseConnection, validateDeployment } from "../src/platform/config/deployment";

async function main(): Promise<void> {
  try {
    validateDeployment(process.env);
    console.log("Deployment configuration: PASS");
    if (process.argv.includes("--connect")) {
      const checks = await checkSupabaseConnection(process.env);
      for (const check of checks) console.log(`${check.name}: ${check.ok ? "PASS" : "FAIL"}${check.status ? ` HTTP ${check.status}` : ""}${check.code ? ` ${check.code}` : ""}`);
      if (checks.some((check) => !check.ok)) process.exitCode = 1;
    }
  } catch (error) {
    // URL parsing and remote failures must not print credential-bearing values.
    console.error(error instanceof TypeError ? "Deployment configuration: invalid project URL." : error instanceof Error ? error.message : "Deployment configuration failed.");
    process.exitCode = 1;
  }
}

void main();
