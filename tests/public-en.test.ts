import assert from "node:assert/strict";
import test from "node:test";
import { divisionsEn, englishPathFor, indonesianPathFor, servicesEn } from "../src/lib/public-en";
import { publicDivisions } from "../src/lib/public-organization";

test("every division has an English translation", () => {
  for (const division of publicDivisions) {
    const english = divisionsEn[division.slug];
    assert.ok(english, division.slug);
    assert.equal(english.contributions.length, division.contributions.length, division.slug);
    assert.equal(english.unitType === "Subdivision", division.unitType === "Subbidang", division.slug);
  }
});

test("language switcher pairs pages in both directions", () => {
  for (const [id, en] of [["/publik/divisi", "/en/divisions"], ["/publik/divisi/riset-analisis", "/en/divisions/riset-analisis"], ["/publik/layanan", "/en/services"], ["/publik/publikasi", "/en/publications"], ["/publik/publikasi/peran-kpi", "/en/publications/peran-kpi"], ["/publik/cari", "/en/search"]]) {
    assert.equal(englishPathFor(id), en);
    assert.equal(indonesianPathFor(en), id);
  }
  assert.equal(englishPathFor("/publik/pengaduan"), "/en", "pages without a translation go to the English home");
  assert.equal(indonesianPathFor("/en"), "/publik");
});

test("English service links point to English pages only where they exist", () => {
  for (const service of servicesEn) assert.equal(service.href.startsWith("/en"), service.english, service.title);
});
