// Small, safe Markdown subset for editorial content. Parsed into a tree and rendered
// as React elements, so article text never reaches the page as raw HTML.

export type InlineNode =
  | { kind: "text"; text: string }
  | { kind: "strong"; children: InlineNode[] }
  | { kind: "em"; children: InlineNode[] }
  | { kind: "link"; href: string; children: InlineNode[] };

export type BlockNode =
  | { kind: "heading"; level: 2 | 3; children: InlineNode[] }
  | { kind: "paragraph"; children: InlineNode[] }
  | { kind: "quote"; children: InlineNode[] }
  | { kind: "list"; ordered: boolean; items: InlineNode[][] };

const bulletItem = /^[-*]\s+(.*)$/;
const orderedItem = /^\d+[.)]\s+(.*)$/;

// Every non-empty line that is not part of a list or quote becomes its own paragraph,
// which keeps older plain-text drafts (one paragraph per line) rendering as before.
export function parseRichText(source: string): BlockNode[] {
  const blocks: BlockNode[] = [];
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;
    const heading = /^(#{2,3})\s+(.*)$/.exec(line);
    if (heading) { blocks.push({ kind: "heading", level: heading[1].length as 2 | 3, children: parseInline(heading[2]) }); continue; }
    if (line.startsWith(">")) {
      const quoted: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) { quoted.push(lines[index].trim().replace(/^>\s?/, "")); index += 1; }
      index -= 1;
      blocks.push({ kind: "quote", children: parseInline(quoted.join(" ")) });
      continue;
    }
    const listPattern = bulletItem.test(line) ? bulletItem : orderedItem.test(line) ? orderedItem : null;
    if (listPattern) {
      const items: InlineNode[][] = [];
      while (index < lines.length && listPattern.test(lines[index].trim())) { items.push(parseInline(listPattern.exec(lines[index].trim())![1])); index += 1; }
      index -= 1;
      blocks.push({ kind: "list", ordered: listPattern === orderedItem, items });
      continue;
    }
    blocks.push({ kind: "paragraph", children: parseInline(line) });
  }
  return blocks;
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let cursor = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > cursor) nodes.push({ kind: "text", text: text.slice(cursor, match.index) });
    if (match[1] !== undefined) nodes.push({ kind: "strong", children: parseInline(match[1]) });
    else if (match[2] !== undefined) nodes.push({ kind: "em", children: parseInline(match[2]) });
    else if (isSafeHref(match[4])) nodes.push({ kind: "link", href: match[4], children: parseInline(match[3]) });
    else nodes.push({ kind: "text", text: match[3] });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push({ kind: "text", text: text.slice(cursor) });
  return nodes;
}

// Only site-relative paths and https links; blocks javascript:, data:, protocol-relative, etc.
export function isSafeHref(href: string): boolean {
  return /^\/(?!\/)/.test(href) || /^https:\/\/[^\s/]+/.test(href);
}

export function plainText(source: string): string {
  return source.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*#>`]/g, " ").replace(/^\s*(?:[-*]|\d+[.)])\s+/gm, " ");
}

export function countWords(source: string): number {
  return plainText(source).split(/\s+/).filter(Boolean).length;
}

// Indonesian prose averages roughly 200 words per minute for general readers.
export function readingMinutes(source: string): number {
  return Math.max(1, Math.round(countWords(source) / 200));
}

export function slugify(title: string): string {
  return title.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120).replace(/-+$/g, "");
}
