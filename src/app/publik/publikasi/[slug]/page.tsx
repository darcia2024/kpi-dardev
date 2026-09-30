import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft, IconArrowUpRight, IconClock, IconLanguage } from "@tabler/icons-react";
import { RichTextView } from "@/components/editor/rich-text-view";
import { PublicFooter } from "@/components/public/public-footer";
import { readingMinutes } from "@/lib/rich-text";
import { getLocalContentRepository, type ContentRecord } from "@/platform/content/content-repository";
import { publishDueContent } from "@/platform/content/scheduled-publishing";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string | string[] }> };

// Only PUBLISHED records are readable; a missing translation never falls back to a draft (Q11).
async function loadArticle(slug: string, lang: string | string[] | undefined): Promise<{ article: ContentRecord; published: ContentRecord[] } | null> {
  if (!isTestAuthEnabled() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const repository = await publishDueContent(getLocalContentRepository());
  const published = (await repository.listAll()).filter((record) => record.state === "PUBLISHED");
  const locale = lang === "en" ? "en" : "id";
  const article = published.find((record) => record.slug === slug && record.locale === locale);
  return article ? { article, published } : null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const loaded = await loadArticle((await params).slug, (await searchParams).lang);
  if (!loaded) return { title: "Publikasi tidak ditemukan | KPI PPMI Mesir" };
  return { title: `${loaded.article.title} | KPI PPMI Mesir`, description: loaded.article.description };
}

export default async function PublicationArticlePage({ params, searchParams }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;
  const loaded = await loadArticle(slug, (await searchParams).lang);
  if (!loaded) notFound();
  const { article, published } = loaded;
  const repository = getLocalContentRepository();
  const publishedAt = (await repository.listRevisions(article.id)).filter((revision) => revision.snapshot.state === "PUBLISHED").at(-1)?.recordedAt;
  const translation = published.find((record) => record.slug === article.slug && record.locale !== article.locale);
  const related = published.filter((record) => record.locale === article.locale && record.id !== article.id).slice(0, 3);
  const english = article.locale === "en";

  return <div className="kp-site kp-library">
    <article className="kp-example-article kp-wrap" lang={article.locale}>
      <Link className="kp-text-link" href="/publik/publikasi"><IconArrowLeft size={18} aria-hidden="true" /> {english ? "Back to publications" : "Kembali ke publikasi"}</Link>
      <div className="kp-example-article__heading">
        <p className="kp-eyebrow">{article.type}{publishedAt ? ` · ${new Date(publishedAt).toLocaleDateString(english ? "en-GB" : "id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Cairo" })}` : ""}</p>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
      </div>
      <p className="kp-article-meta"><span><IconClock size={16} aria-hidden="true" /> {english ? `${readingMinutes(article.body ?? "")} min read` : `±${readingMinutes(article.body ?? "")} menit baca`}</span>{translation && <Link href={`/publik/publikasi/${translation.slug}${translation.locale === "en" ? "?lang=en" : ""}`}><IconLanguage size={16} aria-hidden="true" /> {translation.locale === "en" ? "Read in English" : "Baca dalam Bahasa Indonesia"}</Link>}</p>
      <div className="kp-example-article__notice" role="note">{english ? "Local preview content. Official publications appear after KPI approval." : "Konten pratinjau lokal. Publikasi resmi tampil setelah disetujui KPI."}</div>
      {article.body ? <RichTextView className="kp-example-article__body kp-article-prose" source={article.body} /> : <div className="kp-example-article__body"><p>{article.description}</p></div>}
      {related.length > 0 && <aside className="kp-article-related" aria-labelledby="related-title"><h2 id="related-title">{english ? "More to read" : "Baca juga"}</h2><ul>{related.map((item) => <li key={item.id}><Link href={`/publik/publikasi/${item.slug}${item.locale === "en" ? "?lang=en" : ""}`}><span>{item.type}</span><strong>{item.title}</strong><small>{item.description}</small></Link></li>)}</ul></aside>}
      <div className="kp-example-article__end"><p>{english ? "Need to understand the reporting channel?" : "Butuh memahami jalur penyampaian informasi?"}</p><Link className="kp-button kp-button--outline" href="/publik/layanan">{english ? "See public services" : "Lihat layanan publik"} <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </article>
    <PublicFooter />
  </div>;
}
