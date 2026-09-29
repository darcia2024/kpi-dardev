import assert from "node:assert/strict";
import test from "node:test";
import { countWords, isSafeHref, parseInline, parseRichText, slugify } from "../src/lib/rich-text";

test("plain-text drafts keep one paragraph per line", () => {
  const blocks = parseRichText("Paragraf pertama.\n\nParagraf kedua.\nParagraf ketiga.");
  assert.deepEqual(blocks.map((block) => block.kind), ["paragraph", "paragraph", "paragraph"]);
});

test("headings, quotes, and lists are grouped into blocks", () => {
  const blocks = parseRichText("## Peran KPI\n### Rincian\n> Kutipan satu\n> lanjutan\n- Satu\n- Dua\n1. Pertama\n2) Kedua");
  assert.deepEqual(blocks.map((block) => block.kind), ["heading", "heading", "quote", "list", "list"]);
  assert.equal(blocks[0].kind === "heading" && blocks[0].level, 2);
  assert.equal(blocks[1].kind === "heading" && blocks[1].level, 3);
  assert.deepEqual(blocks[2].kind === "quote" && blocks[2].children, [{ kind: "text", text: "Kutipan satu lanjutan" }]);
  assert.equal(blocks[3].kind === "list" && !blocks[3].ordered && blocks[3].items.length, 2);
  assert.equal(blocks[4].kind === "list" && blocks[4].ordered && blocks[4].items.length, 2);
});

test("inline marks nest and unsafe links degrade to text", () => {
  assert.deepEqual(parseInline("a **b *c* e** d"), [{ kind: "text", text: "a " }, { kind: "strong", children: [{ kind: "text", text: "b " }, { kind: "em", children: [{ kind: "text", text: "c" }] }, { kind: "text", text: " e" }] }, { kind: "text", text: " d" }]);
  assert.deepEqual(parseInline("[aman](/publik/layanan)"), [{ kind: "link", href: "/publik/layanan", children: [{ kind: "text", text: "aman" }] }]);
  assert.deepEqual(parseInline("[klik](javascript:alert(1))"), [{ kind: "text", text: "klik" }, { kind: "text", text: ")" }]);
  for (const href of ["javascript:alert(1)", "data:text/html,x", "//evil.example", "http://plain.example", "https://"]) assert.equal(isSafeHref(href), false, href);
  for (const href of ["/publik", "https://ppmimesir.org/kpi"]) assert.equal(isSafeHref(href), true, href);
});

test("word count ignores markup and slugs are URL-safe", () => {
  assert.equal(countWords("## Judul\n- **satu** [dua](/x)\n> tiga"), 4);
  assert.equal(slugify("Peran KPI: Menjaga Interaksi Masisir!"), "peran-kpi-menjaga-interaksi-masisir");
  assert.equal(slugify("Édukasi — Ramah"), "edukasi-ramah");
});
