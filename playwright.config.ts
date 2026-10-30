import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3000);

// Tes browser memakai mode pratinjau lokal (KPI_TEST_AUTH_ENABLED=true) dan data di .kpi-test, bukan Supabase production.
export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL: `http://localhost:${port}`, trace: "retain-on-failure", locale: "id-ID" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /publik\.spec\.ts/ }
  ],
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `http://localhost:${port}/api/v1/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { KPI_APP_ENV: "local", KPI_APP_NAME: "kpi-ppmi-mesir", KPI_REQUEST_ID_HEADER: "x-request-id", KPI_TEST_AUTH_ENABLED: "true" }
  }
});
