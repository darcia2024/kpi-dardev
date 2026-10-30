import { expect, test } from "@playwright/test";
import { signIn, testAccounts } from "./helpers";

test("portal meminta login sebelum menampilkan isi internal", async ({ page }) => {
  for (const path of ["/portal/tugas", "/portal/kasus"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: /Masuk diperlukan/ }), path).toBeVisible();
    await expect(page.locator(".portal-shell").getByRole("link", { name: "Masuk ke portal" }), path).toBeVisible();
  }
});

test("kata sandi salah ditolak tanpa membentuk sesi", async ({ page }) => {
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(testAccounts.admin);
  await page.getByLabel("Kata sandi").fill("kata-sandi-salah");
  await page.getByRole("button", { name: "Lanjut ke MFA" }).click();
  await expect(page.locator(".auth-form").getByRole("alert")).toContainText("tidak sesuai");
  await page.goto("/portal/tugas");
  await expect(page.getByRole("heading", { name: /Masuk diperlukan/ })).toBeVisible();
});

test("kode MFA salah ditolak", async ({ page }) => {
  await page.goto("/masuk");
  await page.getByLabel("Email").fill(testAccounts.admin);
  await page.getByLabel("Kata sandi").fill("KPI-TEST-2026");
  await page.getByRole("button", { name: "Lanjut ke MFA" }).click();
  await page.getByLabel("Kode verifikasi").fill("123456");
  await page.getByRole("button", { name: "Masuk ke portal" }).click();
  await expect(page.locator(".auth-form").getByRole("alert")).toContainText("Kode verifikasi tidak sesuai");
});

test("login dengan kata sandi dan MFA membuka portal", async ({ page }) => {
  await signIn(page, testAccounts.admin);
  await page.goto("/portal/tugas");
  await expect(page.getByRole("heading", { name: "Daftar tugas dan antrean review." })).toBeVisible();
});
