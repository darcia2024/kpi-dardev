import { expect, type Page } from "@playwright/test";

// Akun fixture mode pratinjau lokal dari src/platform/identity/test-auth.ts. Tidak berlaku di production.
export const testAccounts = { admin: "admin.test@kpi.local", pengurus: "pengurus.test@kpi.local", ketua: "ketua.test@kpi.local" } as const;
const testPassword = "KPI-TEST-2026";
const testMfaCode = "000000";

export async function signIn(page: Page, email: string): Promise<void> {
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi").fill(testPassword);
  await page.getByRole("button", { name: "Lanjut ke MFA" }).click();
  await page.getByLabel("Kode verifikasi").fill(testMfaCode);
  await page.getByRole("button", { name: "Masuk ke portal" }).click();
  await expect(page).toHaveURL(/\/portal$/);
}
