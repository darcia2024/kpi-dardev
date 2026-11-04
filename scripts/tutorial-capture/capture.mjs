// Takes the /tutorial screenshots from the portal started by start.mjs. Run: node scripts/tutorial-capture/capture.mjs [name-filter]
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const base = `http://localhost:${process.env.TUTORIAL_PORT ?? 3100}`;
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public", "tutorial");
mkdirSync(out, { recursive: true });
const only = process.argv[2];
const people = { admin: "093b761f-d1c7-433c-8153-0f271e85664c", ketua: "c0a00000-0000-4000-8000-000000000001", sekretaris: "c0a00000-0000-4000-8000-000000000002", bendahara: "c0a00000-0000-4000-8000-000000000003", koordinator: "c0a00000-0000-4000-8000-000000000004", media: "c0a00000-0000-4000-8000-000000000005", intelijen: "c0a00000-0000-4000-8000-000000000006" };
const session = (sub) => { const token = `h.${Buffer.from(JSON.stringify({ sub, exp: 4102444800 })).toString("base64url")}.s`; return { name: "sb-tutorial-auth-token", value: "base64-" + Buffer.from(JSON.stringify({ access_token: token, refresh_token: "r", token_type: "bearer", expires_in: 3600, expires_at: 4102444800, user: { id: sub } })).toString("base64url"), domain: "localhost", path: "/" }; };
const quiet = "nextjs-portal,.report-assistant__trigger{display:none!important}.portal-topbar{position:static!important}*{transition:none!important;animation:none!important;caret-color:transparent}";

const browser = await chromium.launch();
const results = [];
async function as(who, path) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5, locale: "id-ID", timezoneId: "Africa/Cairo", colorScheme: "light" });
  await context.addCookies([session(people[who])]);
  await context.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch { /* optional */ } });
  const page = await context.newPage();
  page.go = async (href) => { await page.goto(base + href, { waitUntil: "networkidle", timeout: 120000 }); await page.addStyleTag({ content: quiet }); await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light")); };
  await page.go(path);
  return page;
}
const mark = (locator) => locator.evaluateAll((els) => els.forEach((el) => { el.dataset.mark = "1"; el.style.outline = "3px solid #b91632"; el.style.outlineOffset = "3px"; }));
const unmark = (page) => page.evaluate(() => document.querySelectorAll("[data-mark]").forEach((el) => { el.style.outline = ""; el.style.outlineOffset = ""; delete el.dataset.mark; }));
async function save(page, name, target, highlight) {
  await page.evaluate(() => document.activeElement?.blur?.());
  if (highlight) await mark(highlight);
  const path = join(out, `${name}.jpg`);
  if (target) await target.first().screenshot({ path, type: "jpeg", quality: 82 });
  else { await page.evaluate(() => window.scrollTo(0, 0)); await page.screenshot({ path, type: "jpeg", quality: 82 }); }
  if (highlight) await unmark(page);
}
async function scene(name, who, path, work) {
  if (only && !name.includes(only)) return;
  let page;
  try { page = await as(who, path); await work(page); results.push(`ok   ${name}`); }
  catch (error) { results.push(`FAIL ${name}: ${String(error.message).split("\n")[0]}`); }
  finally { await page?.context().close(); }
}
const field = (root, name) => root.locator("label", { has: root.page().locator(`span:text-is("${name}")`) }).locator("select,input,textarea").first();
const card = (page, text) => page.locator(".portal-form-card,.operations-panel").filter({ has: page.getByRole("heading", { name: text }) });
const button = (page, name) => page.getByRole("button", { name, exact: true });
const tab = (page, name) => page.locator(".governance-tabs button", { hasText: name }).click();
const openDetails = async (page, text) => { const el = page.locator("details", { has: page.locator("summary", { hasText: text }) }).first(); await el.evaluate((d) => { d.open = true; }); return el; };
const openRecord = (page, text) => page.locator(".hosted-task-list__row", { hasText: text }).first().click().then(() => page.waitForTimeout(500));

if (!only || "masuk".includes(only)) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1.5, locale: "id-ID", colorScheme: "light" });
  const page = await context.newPage();
  await page.goto(`${base}/masuk`, { waitUntil: "networkidle", timeout: 120000 });
  await page.addStyleTag({ content: quiet });
  await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
  await page.screenshot({ path: join(out, "masuk.jpg"), type: "jpeg", quality: 82 });
  await context.close();
  results.push("ok   masuk");
}
await scene("beranda", "koordinator", "/portal", async (page) => { await save(page, "beranda"); await page.go("/portal/workspace"); await save(page, "ruang-kerja"); });
await scene("f05", "ketua", "/portal/kebijakan", async (page) => { await tab(page, "F05"); await openDetails(page, "Buat F05"); await save(page, "f05", page.locator("details", { has: page.locator("summary", { hasText: "Buat F05" }) }).first()); });
await scene("klasifikasi", "ketua", "/portal/kebijakan", async (page) => { await tab(page, "Klasifikasi"); await openDetails(page, "Buat Klasifikasi"); await save(page, "klasifikasi", page.locator("details", { has: page.locator("summary", { hasText: "Buat Klasifikasi" }) }).first()); });
await scene("asisten", "admin", "/portal/ai", async (page) => { await save(page, "asisten"); });
await scene("katalog", "admin", "/portal/katalog", async (page) => { await save(page, "katalog"); });
await scene("akun", "koordinator", "/portal/profil", async (page) => {
  await save(page, "akun-profil");
  await page.go("/portal/akses");
  await save(page, "akun-izin", card(page, "Izin aktif"));
});
await scene("f01-ajukan", "koordinator", "/portal/kebijakan", async (page) => {
  await save(page, "f01-tab", null, page.locator(".governance-tabs button", { hasText: "F01" }));
  const form = await openDetails(page, "Buat F01");
  await form.getByLabel("Nomor formulir").fill("F01-2026-021");
  await form.getByLabel("Kategori informasi").selectOption("INTERNAL");
  await form.getByLabel("Jenis permohonan").selectOption("GRANT");
  await form.getByLabel("Izin yang diminta").selectOption(["MEETING_READ"]);
  await form.getByLabel("Dasar penugasan").fill("Keputusan penugasan koordinator");
  await form.getByLabel("Tujuan dan kebutuhan").fill("Menyiapkan rapat koordinasi sosialisasi");
  await form.getByLabel("Informasi, sistem").fill("Rapat Divisi Pencegahan & Edukasi");
  await save(page, "f01-form", form);
  await openRecord(page, "F01-CONTOH-014");
  await openDetails(page, "Tarik pengajuan");
  await save(page, "f01-detail", card(page, "F01-CONTOH-014"), page.locator("summary", { hasText: "Tarik pengajuan" }));
});
await scene("konflik", "intelijen", "/portal/kebijakan", async (page) => {
  await tab(page, "F02");
  await openDetails(page, "Nyatakan konflik saya");
  await save(page, "konflik", card(page, "Konflik kepentingan"));
});
await scene("tugas", "intelijen", "/portal/tugas", async (page) => {
  await save(page, "tugas-daftar", page.locator("section[aria-labelledby=hosted-task-list]"));
  await openRecord(page, "Verifikasi informasi awal");
  await page.getByLabel("Catatan tindakan").fill("Mulai memeriksa informasi dari sekretariat.");
  await save(page, "tugas-mulai", page.locator("section[aria-labelledby=hosted-task-detail]"), button(page, "Mulai tugas"));
});
await scene("rapat-ikut", "intelijen", "/portal/rapat", async (page) => {
  await save(page, "rapat-daftar", card(page, "Rapat organisasi"));
  await openRecord(page, "Evaluasi program sosialisasi");
  await save(page, "rapat-konfirmasi", card(page, "CONTOH · Evaluasi program sosialisasi"), page.getByRole("button", { name: /^Konfirmasi / }));
});
await scene("dokumen", "admin", "/portal/dokumen", async (page) => {
  await save(page, "dokumen-unggah", card(page, "Upload dokumen"), page.getByLabel("Kategori dokumen"));
  await save(page, "dokumen-daftar", card(page, "Dokumen tersimpan"));
  await save(page, "dokumen-virus", card(page, "Pemeriksaan virus belum aktif"));
});
await scene("notifikasi", "ketua", "/portal/notifikasi", async (page) => { await save(page, "notifikasi"); });
await scene("keputusan", "ketua", "/portal/kebijakan", async (page) => {
  await openRecord(page, "F01-CONTOH-014");
  const form = await openDetails(page, "Catat keputusan");
  await field(form, "Keputusan").selectOption("PARTIAL");
  await field(form, "Izin yang disetujui").selectOption(["MEETING_READ"]);
  await form.getByLabel("Hasil pemeriksaan").fill("Dibutuhkan untuk rapat koordinasi. Izin review belum perlu.");
  await form.getByLabel("Catatan dan dasar").fill("Disetujui sebagian");
  await form.getByLabel("Rujukan bukti").fill("Keputusan Ketua No. 14 (CONTOH)");
  await save(page, "keputusan-form", form);
  await save(page, "keputusan-detail", card(page, "F01-CONTOH-014"));
});
await scene("tinjau", "ketua", "/portal/kebijakan", async (page) => {
  await tab(page, "F02");
  await mark(page.getByText("sudah waktunya ditinjau"));
  await page.getByRole("heading", { name: "Register akses dan peninjauan" }).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40));
  await page.screenshot({ path: join(out, "tinjau-tanda.jpg"), type: "jpeg", quality: 82 });
  await unmark(page);
  const item = page.locator(".governance-register", { hasText: "Peninjauan sudah jatuh tempo" }).first();
  await item.locator("details", { hasText: "Catat peninjauan" }).first().evaluate((d) => { d.open = true; });
  await save(page, "tinjau-form", item);
});
await scene("cabut", "ketua", "/portal/kebijakan", async (page) => {
  await tab(page, "F02");
  const item = page.locator(".governance-register", { hasText: "Pemegang: Laila" }).first();
  await item.locator("details", { hasText: "Ajukan pencabutan" }).first().evaluate((d) => { d.open = true; });
  await save(page, "cabut", item);
});
await scene("insiden", "ketua", "/portal/kebijakan", async (page) => {
  await tab(page, "F03");
  await openRecord(page, "F03-CONTOH-002");
  await openDetails(page, "Tetapkan PIC");
  await save(page, "insiden", card(page, "F03-CONTOH-002"), page.locator("summary", { hasText: "Tetapkan PIC" }));
});
await scene("notulen", "ketua", "/portal/rapat", async (page) => {
  await openRecord(page, "Evaluasi program sosialisasi");
  await page.getByLabel("Catatan tindakan").fill("Notulen sudah sesuai pembahasan.");
  await save(page, "notulen-sahkan", card(page, "CONTOH · Evaluasi program sosialisasi"), page.getByRole("button", { name: "Setujui notulen" }));
});
await scene("rapat-buat", "koordinator", "/portal/rapat", async (page) => {
  const form = card(page, "Buat undangan rapat");
  await form.getByLabel("Judul").fill("Rapat koordinasi sosialisasi");
  await form.getByLabel("Agenda").fill("Pembagian tugas sesi sosialisasi mahasiswa baru.");
  await form.getByLabel("Kategori rapat").selectOption("INTERNAL");
  await form.getByRole("checkbox").first().check();
  await save(page, "rapat-buat", form);
});
await scene("rapat-jalan", "koordinator", "/portal/rapat", async (page) => {
  await openRecord(page, "Rapat pleno bulanan");
  await page.getByLabel("Catatan tindakan").fill("Kehadiran dicatat saat rapat.");
  const detail = card(page, "CONTOH · Rapat pleno bulanan KPI");
  await save(page, "rapat-jalan", detail);
});
await scene("kasus", "admin", "/portal/kasus", async (page) => {
  await save(page, "kasus-daftar", card(page, "Laporan dan pengaduan"));
  await page.getByRole("button", { name: /Buka detail/ }).first().click();
  await page.waitForTimeout(800);
  await save(page, "kasus-detail", page.locator(".operations-panel,.portal-form-card").filter({ has: page.getByRole("heading", { name: "Riwayat tindak lanjut" }) }));
});
await scene("tugas-kelola", "koordinator", "/portal/tugas", async (page) => {
  const form = card(page, "Buat tugas");
  await form.getByLabel("Judul").fill("Rekap peserta sosialisasi");
  await form.getByLabel("Uraian pekerjaan").fill("Rekap daftar hadir untuk laporan kegiatan.");
  await save(page, "tugas-buat", form);
});
await scene("tugas-periksa", "ketua", "/portal/tugas", async (page) => {
  await openRecord(page, "Desain poster kampanye");
  await page.getByLabel("Catatan tindakan").fill("Warna poster sudah sesuai.");
  await save(page, "tugas-periksa", page.locator("section[aria-labelledby=hosted-task-detail]"), page.getByRole("button", { name: /Setujui hasil|Minta revisi/ }));
});
await scene("keuangan", "bendahara", "/portal/keuangan", async (page) => { await save(page, "keuangan"); });
await scene("redaksi", "ketua", "/portal/editor", async (page) => {
  await save(page, "redaksi-daftar");
  await openRecord(page, "Panduan menyampaikan aspirasi");
  await page.waitForTimeout(800);
  await save(page, "redaksi-periksa", card(page, "CONTOH · Panduan menyampaikan aspirasi"));
});
await scene("rujukan", "media", "/portal/knowledge", async (page) => { await save(page, "rujukan"); });
await scene("evaluasi", "ketua", "/portal/evaluasi", async (page) => { await save(page, "evaluasi"); });
await scene("handover", "ketua", "/portal/handover", async (page) => { await save(page, "handover"); });
await scene("admin-pengurus", "admin", "/portal/pengaturan", async (page) => {
 const roster = card(page, "Pengurus, unit kerja, mandat, dan penerimaan");
  await roster.locator("label", { hasText: /^Pengaturan/ }).locator("select").selectOption("ASSIGN");
  await save(page, "admin-penugasan", roster.locator("form").first());
  await roster.locator("label", { hasText: /^Pengaturan/ }).locator("select").selectOption("MANDATE_PROPOSE");
  await save(page, "admin-mandat", roster.locator("form").first());
});
await scene("admin-laksana", "admin", "/portal/kebijakan", async (page) => {
  await openRecord(page, "F01-CONTOH-015");
  await openDetails(page, "Laksanakan keputusan");
  await save(page, "admin-laksana", card(page, "F01-CONTOH-015"), page.locator("summary", { hasText: "Laksanakan keputusan" }));
});
await scene("admin-operasi", "admin", "/portal/operasi", async (page) => { await save(page, "admin-operasi"); });
await scene("super-periode", "admin", "/portal/pengaturan", async (page) => {
  await page.getByLabel("Rujukan keputusan resmi").fill("Keputusan Ketua KPI No. 1 (CONTOH)");
  await save(page, "super-periode", card(page, "Data yang tersimpan"), page.getByRole("button", { name: /Aktifkan periode|Tutup periode/ }));
});
await scene("super-baca", "admin", "/portal/rapat", async (page) => {
  const select = page.getByLabel("Periode dan divisi");
  await select.selectOption({ label: "KPI_PPMI_MESIR · 2026_2027 · Baca saja" });
  await page.waitForTimeout(600);
  await save(page, "super-baca", page.locator(".portal-form-card").first(), select);
});
await browser.close();
console.log(results.join("\n"));
