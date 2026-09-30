import assert from "node:assert/strict";
import test from "node:test";
import { queryTerms, searchPublic, type SearchDocument } from "../src/lib/public-search";

const documents: SearchDocument[] = [
  { id: "a1", kind: "article", label: "Pedoman", title: "Peran KPI bagi Masisir", description: "Mandat dan jalur aman menyampaikan persoalan.", body: "## Apa peran KPI?\nKPI adalah **Badan Semi Otonom** PPMI Mesir.", href: "/publik/publikasi/peran-kpi" },
  { id: "a2", kind: "article", label: "Edukasi", title: "Menjaga Batas dalam Berinteraksi", description: "Lima kebiasaan sederhana.", body: "Hormati batas pribadi dan minta persetujuan sebelum membagikan foto. Peran setiap Masisir penting.", href: "/publik/publikasi/menjaga-batas" },
  { id: "p1", kind: "page", label: "Layanan", title: "Layanan pengaduan", description: "Pahami alur penanganan pengaduan.", href: "/publik/pengaduan" }
];

test("every term must match and title matches rank first", () => {
  assert.deepEqual(searchPublic("peran", documents).map((result) => result.document.id), ["a1", "a2"]);
  assert.deepEqual(searchPublic("peran foto", documents).map((result) => result.document.id), ["a2"]);
  assert.equal(searchPublic("anggaran", documents).length, 0);
});

test("case, accents, and markup do not affect matching", () => {
  assert.deepEqual(searchPublic("OTONOM", documents).map((result) => result.document.id), ["a1"]);
  assert.deepEqual(searchPublic("pengadúan", documents).map((result) => result.document.id), ["p1"]);
  assert.ok(!searchPublic("otonom", documents)[0].snippet.includes("**"), "snippets are plain text");
});

test("kind filter and short or empty queries", () => {
  assert.deepEqual(searchPublic("pengaduan", documents, "article"), []);
  assert.deepEqual(searchPublic("pengaduan", documents, "page").map((result) => result.document.id), ["p1"]);
  assert.deepEqual(searchPublic("a", documents), []);
  assert.deepEqual(queryTerms("  KPI, kpi!! mesir  "), ["kpi", "mesir"]);
});
