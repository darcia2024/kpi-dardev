import { expect, test } from "@playwright/test";
import { signIn, testAccounts } from "./helpers";

function futureLocalDateTime(days: number): string {
  const date = new Date(Date.now() + days * 86_400_000);
  date.setMinutes(0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}

test("undangan rapat tersimpan dan muncul di daftar rapat", async ({ page }) => {
  const title = `E2E rapat ${Date.now()}`;
  await signIn(page, testAccounts.admin);
  await page.goto("/portal/rapat");
  await page.getByLabel("Judul rapat").fill(title);
  await page.getByLabel("Waktu rapat").fill(futureLocalDateTime(3));
  await page.getByLabel("Agenda").fill("Agenda uji otomatis");
  await page.getByRole("checkbox", { name: "Pengurus pratinjau" }).check();
  await page.getByRole("button", { name: "Buat undangan" }).click();
  await expect(page.getByText("Undangan rapat tersimpan.")).toBeVisible();
  await page.getByLabel("Cari rapat").fill(title);
  await expect(page.getByText(title).filter({ visible: true }).first()).toBeVisible();
});

test("draf transaksi keuangan tersimpan dan berhenti sebelum bukti dilampirkan", async ({ page }) => {
  const title = `E2E transaksi ${Date.now()}`;
  await signIn(page, testAccounts.admin);
  await page.goto("/portal/keuangan");
  // Pos anggaran baru muncul setelah daftar anggaran selesai dimuat.
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Judul pengajuan").fill(title);
  await page.getByLabel("Nilai contoh (satuan terkecil)").fill("125000");
  const budgetLine = page.getByLabel("Pos anggaran");
  if (await budgetLine.count()) await budgetLine.selectOption({ index: 1 });
  await page.getByRole("button", { name: "Buat draf" }).click();
  await expect(page.getByText("Draf transaksi pratinjau dibuat. Lampirkan bukti sebelum mengajukan.")).toBeVisible();
  await page.getByLabel("Cari transaksi").fill(title);
  await expect(page.getByText(title).filter({ visible: true }).first()).toBeVisible();
});

test("naskah redaksi baru tersimpan sebagai draf", async ({ page }) => {
  const title = `E2E naskah ${Date.now()}`;
  await signIn(page, testAccounts.admin);
  await page.goto("/portal/editor");
  await page.getByRole("button", { name: "Tulis naskah" }).click();
  await page.getByLabel("Judul naskah").fill(title);
  await page.getByLabel("Ringkasan naskah").fill("Ringkasan naskah uji otomatis.");
  await page.getByLabel("Isi naskah").fill("Isi naskah uji otomatis untuk memastikan draf tersimpan.");
  await page.getByRole("button", { name: "Simpan draf" }).click();
  await expect(page.locator(".form-message[role=alert]")).toHaveCount(0);
  await page.getByRole("button", { name: "Semua naskah" }).click();
  await expect(page.getByText(title).filter({ visible: true }).first()).toBeVisible();
  // Draf belum disetujui tidak boleh tampil di situs publik.
  await page.goto("/publik/publikasi");
  await expect(page.getByText(title)).toHaveCount(0);
});

test("dokumen yang diunggah masuk pustaka", async ({ page }) => {
  const name = `e2e-dokumen-${Date.now()}.pdf`;
  const pdf = "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n";
  await signIn(page, testAccounts.admin);
  await page.goto("/portal/dokumen");
  await page.locator('input[type="file"]').setInputFiles({ name, mimeType: "application/pdf", buffer: Buffer.from(pdf) });
  await page.getByRole("button", { name: "Unggah file" }).click();
  await expect(page.locator(".form-message[role=alert]")).toHaveCount(0);
  await expect(page.getByText(name).filter({ visible: true }).first()).toBeVisible();
});
