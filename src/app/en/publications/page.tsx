import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { articlePath } from "@/components/public/publication-article";
import { PublicFooter } from "@/components/public/public-footer";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { publishDueContent } from "@/platform/content/scheduled-publishing";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Publications | KPI PPMI Egypt", description: "Educational material from KPI PPMI Egypt on healthy interaction, prevention, and protection principles.", alternates: { languages: { id: "/publik/publikasi", en: "/en/publications" } } };

export default async function EnglishPublicationsPage(): Promise<React.JSX.Element> {
  // Only English articles that are themselves published; Indonesian drafts or texts are never substituted.
  const articles = isTestAuthEnabled() ? await publishDueContent(getLocalContentRepository()).then((repository) => repository.listPublished("en")) : [];
  return <div className="kp-site kp-search-page" lang="en">
    <section className="kp-wrap kp-search" aria-labelledby="publications-title">
      <p className="kp-eyebrow"><span /> Public knowledge</p>
      <h1 id="publications-title">Publications</h1>
      <p className="kp-search__count">Material on healthy interaction, prevention, and how KPI works. Only articles with an approved English version are listed; more are available in <Link href="/publik/publikasi" hrefLang="id" lang="id">Bahasa Indonesia</Link>.</p>
      {articles.length ? <ol className="kp-search__results">{articles.map((article) => <li key={article.id}><Link href={articlePath(article)}><span className="kp-search__label">{article.type}</span><strong>{article.title}</strong><p>{article.description}</p><span className="kp-search__url">Read article <IconArrowUpRight aria-hidden="true" size={14} /></span></Link></li>)}</ol> : <div className="kp-search__empty"><p>No English publications are available yet.</p><div><Link href="/publik/publikasi" hrefLang="id">Browse publications in Indonesian</Link></div></div>}
    </section>
    <PublicFooter locale="en" />
  </div>;
}
