import { expect, test } from "@playwright/test";
import { signIn, testAccounts } from "./helpers";

const modules = ["/portal", "/portal/workspace", "/portal/tugas", "/portal/rapat", "/portal/dokumen", "/portal/knowledge", "/portal/editor", "/portal/kasus", "/portal/kasus/pedoman", "/portal/keuangan", "/portal/evaluasi", "/portal/handover", "/portal/notifikasi", "/portal/ai", "/portal/operasi", "/portal/katalog", "/portal/akses", "/portal/profil"];

for (const [role, email] of [["admin", testAccounts.admin], ["pengurus", testAccounts.pengurus]] as const) for (const path of modules) {
  test(`modul ${path} terbuka tanpa error untuk ${role}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
    page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
    page.on("response", (response) => { if (response.url().includes("/api/") && response.status() >= 500) errors.push(`${response.status()} ${response.url()}`); });
    await signIn(page, email);
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Terjadi kesalahan|Gagal memuat|Koneksi terputus/)).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Coba lagi" })).toHaveCount(0);
    // Admin pratinjau memegang izin semua modul, jadi penolakan di sini berarti seed izin lokal tidak lengkap.
    if (role === "admin") await expect(page.getByRole("heading", { name: /Belum ada izin/ })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
