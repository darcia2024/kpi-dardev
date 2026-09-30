import Link from "next/link";
import { IconArrowUpRight, IconSearch } from "@tabler/icons-react";
import { PublicFooter } from "@/components/public/public-footer";
import { queryTerms, searchPublic } from "@/lib/public-search";
import { publicSearchDocuments } from "@/lib/public-search-index";

const copy = {
  id: { base: "/publik/cari", eyebrow: "Pencarian", title: "Cari informasi KPI", label: "Kata kunci", placeholder: "Contoh: pengaduan, edukasi, peran KPI", submit: "Cari", kinds: { all: "Semua", article: "Artikel", page: "Halaman" }, count: (n: number, q: string) => `${n} hasil untuk “${q}”`, none: (q: string) => `Tidak ada hasil untuk “${q}”.`, short: "Masukkan kata kunci minimal dua huruf.", hint: "Coba kata lain yang lebih umum, atau jelajahi halaman berikut.", suggestions: [["/publik/layanan", "Layanan publik"], ["/publik/publikasi", "Publikasi & edukasi"], ["/publik/divisi", "Profil divisi"]], previous: "← Sebelumnya", next: "Berikutnya →", page: (c: number, t: number) => `Halaman ${c} dari ${t}`, filter: "Saring jenis hasil", pages: "Halaman hasil" },
  en: { base: "/en/search", eyebrow: "Search", title: "Search KPI information", label: "Keywords", placeholder: "For example: complaint, education, role of KPI", submit: "Search", kinds: { all: "All", article: "Articles", page: "Pages" }, count: (n: number, q: string) => `${n} result${n === 1 ? "" : "s"} for “${q}”`, none: (q: string) => `No results for “${q}”.`, short: "Enter a keyword of at least two letters.", hint: "Try a broader word, or browse these pages.", suggestions: [["/en/services", "Public services"], ["/en/publications", "Publications"], ["/en/divisions", "Divisions"]], previous: "← Previous", next: "Next →", page: (c: number, t: number) => `Page ${c} of ${t}`, filter: "Filter result type", pages: "Result pages" }
} as const;

const pageSize = 10;
type Kind = "all" | "article" | "page";
const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export async function PublicSearchView({ locale, params }: { locale: "id" | "en"; params: { q?: string | string[]; jenis?: string | string[]; type?: string | string[]; halaman?: string | string[]; page?: string | string[] } }): Promise<React.JSX.Element> {
  const text = copy[locale];
  const kindParam = locale === "en" ? "type" : "jenis";
  const pageParam = locale === "en" ? "page" : "halaman";
  const query = first(params.q).slice(0, 100);
  const kind: Kind = (["all", "article", "page"] as const).find((item) => item === first(params[kindParam])) ?? "all";
  const results = searchPublic(query, await publicSearchDocuments(locale), kind);
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const current = Math.min(pages, Math.max(1, Number.parseInt(first(params[pageParam]), 10) || 1));
  const shown = results.slice((current - 1) * pageSize, current * pageSize);
  const hasTerms = queryTerms(query).length > 0;
  const link = (changes: { kind?: Kind; page?: number }) => {
    const search = new URLSearchParams({ q: query });
    const nextKind = changes.kind ?? kind;
    if (nextKind !== "all") search.set(kindParam, nextKind);
    if ((changes.page ?? 1) > 1) search.set(pageParam, String(changes.page));
    return `${text.base}?${search.toString()}`;
  };

  return <div className="kp-site kp-search-page" lang={locale}>
    <section className="kp-wrap kp-search" aria-labelledby="search-title">
      <p className="kp-eyebrow"><span /> {text.eyebrow}</p>
      <h1 id="search-title">{text.title}</h1>
      <form action={text.base} className="kp-search__form" method="get" role="search">
        <label className="sr-only" htmlFor="public-search">{text.label}</label>
        <IconSearch aria-hidden="true" size={20} />
        <input autoFocus={!query} defaultValue={query} id="public-search" maxLength={100} name="q" placeholder={text.placeholder} type="search" />
        {kind !== "all" && <input name={kindParam} type="hidden" value={kind} />}
        <button className="kp-button kp-button--red" type="submit">{text.submit}</button>
      </form>
      {hasTerms && <>
        <nav aria-label={text.filter} className="kp-search__kinds">{(["all", "article", "page"] as const).map((value) => <Link aria-current={kind === value ? "page" : undefined} href={link({ kind: value })} key={value}>{text.kinds[value]}</Link>)}</nav>
        <p className="kp-search__count" role="status">{results.length ? text.count(results.length, query) : text.none(query)}</p>
      </>}
      {query && !hasTerms && <p className="kp-search__count" role="status">{text.short}</p>}
      {shown.length > 0 && <ol className="kp-search__results">{shown.map(({ document, snippet }) => <li key={document.id}><Link href={document.href}><span className="kp-search__label">{text.kinds[document.kind]} · {document.label}</span><strong>{document.title}</strong><p>{snippet}</p><span className="kp-search__url">{document.href.split("?")[0]} <IconArrowUpRight aria-hidden="true" size={14} /></span></Link></li>)}</ol>}
      {hasTerms && results.length === 0 && <div className="kp-search__empty"><p>{text.hint}</p><div>{text.suggestions.map(([href, label]) => <Link href={href} key={href}>{label}</Link>)}</div></div>}
      {pages > 1 && <nav aria-label={text.pages} className="kp-search__pages">{current > 1 && <Link href={link({ page: current - 1 })}>{text.previous}</Link>}<span>{text.page(current, pages)}</span>{current < pages && <Link href={link({ page: current + 1 })}>{text.next}</Link>}</nav>}
    </section>
    <PublicFooter locale={locale} />
  </div>;
}
