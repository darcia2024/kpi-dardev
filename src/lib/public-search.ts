// Public search (P14): published articles and public pages only; drafts never enter the index.
import { plainText } from "@/lib/rich-text";

export type SearchDocument = { id: string; kind: "article" | "page"; label: string; title: string; description: string; body?: string; href: string };
export type SearchResult = { document: SearchDocument; score: number; snippet: string };

const normalize = (text: string) => text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function queryTerms(query: string): string[] {
  return [...new Set(normalize(query.slice(0, 100)).split(/[^\p{L}\p{N}]+/u).filter((term) => term.length >= 2))].slice(0, 8);
}

function snippetFor(document: SearchDocument, terms: string[]): string {
  const text = [document.description, plainText(document.body ?? "")].join(" ").replace(/\s+/g, " ").trim();
  const lower = normalize(text);
  const hit = Math.min(...terms.map((term) => lower.indexOf(term)).filter((index) => index >= 0), Number.POSITIVE_INFINITY);
  if (!Number.isFinite(hit) || hit < 90) return text.length > 180 ? `${text.slice(0, 180).trimEnd()}…` : text;
  const start = text.lastIndexOf(" ", hit - 70) + 1;
  const piece = text.slice(start, start + 180).trimEnd();
  return `…${piece}${start + 180 < text.length ? "…" : ""}`;
}

// Every term must match somewhere; title matches weigh most, then summary, then body.
export function searchPublic(query: string, documents: SearchDocument[], kind: "all" | SearchDocument["kind"] = "all"): SearchResult[] {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const phrase = normalize(query.trim());
  return documents
    .filter((document) => kind === "all" || document.kind === kind)
    .map((document) => {
      const title = normalize(document.title);
      const description = normalize(document.description);
      const body = normalize(plainText(document.body ?? ""));
      let score = 0;
      for (const term of terms) {
        const inTitle = title.includes(term), inDescription = description.includes(term), inBody = body.includes(term);
        if (!inTitle && !inDescription && !inBody) return null;
        score += (inTitle ? 5 : 0) + (inDescription ? 2 : 0) + (inBody ? 1 : 0);
      }
      if (phrase.length > 3 && title.includes(phrase)) score += 5;
      return { document, score, snippet: snippetFor(document, terms) };
    })
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.score - a.score || a.document.title.localeCompare(b.document.title, "id"));
}
