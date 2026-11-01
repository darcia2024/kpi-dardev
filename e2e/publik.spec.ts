import { expect, test } from "@playwright/test";

test("beranda, pitch, dan situs publik terbuka tanpa error konsol", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/", "/pitch", "/publik", "/publik/divisi", "/en"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1").first(), path).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("security headers terpasang dan tidak memblokir isi halaman", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => { if (/Content Security Policy|Content-Security-Policy/i.test(message.text())) violations.push(message.text()); });
  for (const path of ["/", "/pitch", "/publik", "/en", "/masuk", "/masuk/lupa-sandi"]) {
    const response = await page.goto(path);
    const headers = response?.headers() ?? {};
    expect(headers["content-security-policy"], path).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"], path).toBe("DENY");
    expect(headers["x-content-type-options"], path).toBe("nosniff");
    await expect(page.locator("h1").first(), path).toBeVisible();
  }
  expect(violations).toEqual([]);
});

test("halaman publik tidak bergeser ke samping di layar sempit", async ({ page }) => {
  for (const path of ["/", "/pitch", "/publik"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
});

test("di HP pengunjung bisa pindah ke tampilan desktop dan balik lagi", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "tombol cuma muncul di layar kecil");
  const viewport = () => page.evaluate(() => ({ meta: document.querySelector('meta[name="viewport"]')?.getAttribute("content"), width: window.innerWidth }));
  await page.goto("/");
  await page.getByRole("button", { name: "Buka menu" }).click();
  await page.getByRole("button", { name: "Tampilan desktop" }).click();
  await expect.poll(async () => (await viewport()).width).toBe(1280);
  await page.reload();
  expect((await viewport()).meta).toBe("width=1280");
  await page.getByRole("link", { name: "Divisi", exact: true }).first().click();
  await expect(page).toHaveURL(/\/publik\/divisi$/);
  expect((await viewport()).meta, "pilihan bertahan saat pindah halaman").toBe("width=1280");
  await page.getByRole("button", { name: "Tampilan HP" }).click();
  await expect.poll(async () => (await viewport()).width).toBeLessThan(500);
  await page.reload();
  expect((await viewport()).meta).toBe("width=device-width, initial-scale=1");
});

test("halaman pitch memuat semua gambar layar", async ({ page }) => {
  await page.goto("/pitch");
  const broken = await page.evaluate(async () => {
    const images = [...document.images];
    images.forEach((image) => { image.loading = "eager"; });
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    return images.filter((image) => image.naturalWidth === 0).map((image) => image.src);
  });
  expect(broken).toEqual([]);
});
