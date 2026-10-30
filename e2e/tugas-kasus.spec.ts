import { expect, test } from "@playwright/test";
import { signIn, testAccounts } from "./helpers";

test("tugas baru tersimpan dan tetap ada setelah dimuat ulang", async ({ page }) => {
  const title = `E2E tugas ${Date.now()}`;
  await signIn(page, testAccounts.admin);
  await page.goto("/portal/tugas");
  await page.getByLabel("Judul tugas").fill(title);
  await page.getByRole("button", { name: "Buat tugas", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Tugas baru tersimpan." })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible();
  await page.reload();
  await expect(page.getByText(title).filter({ visible: true }).first()).toBeVisible();
});

test("halaman kasus terbuka untuk petugas berizin", async ({ page }) => {
  await signIn(page, testAccounts.admin);
  await page.goto("/portal/kasus");
  await expect(page.getByRole("heading", { name: "Setiap laporan punya tindak lanjut." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Antrean kasus" })).toBeVisible();
  await expect(page.getByLabel("Cari kasus")).toBeVisible();
  // Antrean bisa kosong di data lokal; yang penting halaman tidak gagal memuat.
  await expect(page.getByRole("button", { name: "Coba lagi" })).toHaveCount(0);
  await page.getByRole("button", { name: "Formulir layanan" }).click();
  await expect(page.getByRole("button", { name: "Formulir layanan" })).toHaveAttribute("aria-pressed", "true");
});

test("pengurus tanpa izin triage tidak bisa membuka kasus lewat URL langsung", async ({ page }) => {
  await signIn(page, testAccounts.pengurus);
  await page.goto("/portal/kasus");
  await expect(page.getByRole("heading", { name: /Belum ada izin untuk/ })).toBeVisible();
  await expect(page.getByLabel("Daftar kasus pratinjau")).toHaveCount(0);
});
