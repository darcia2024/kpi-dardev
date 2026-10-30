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

test("halaman publik tidak bergeser ke samping di layar sempit", async ({ page }) => {
  for (const path of ["/", "/pitch", "/publik"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(1);
  }
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
