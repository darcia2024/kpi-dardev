import {HostedPublicAttachments} from "./hosted-public-attachments";
import Link from "next/link";
import { IconArrowLeft, IconArrowUpRight, IconClock, IconLanguage } from "@tabler/icons-react";
import { RichTextView } from "@/components/editor/rich-text-view";
import { PublicFooter } from "@/components/public/public-footer";
import { readingMinutes } from "@/lib/rich-text";
import { getLocalContentRepository, type ContentRecord } from "@/platform/content/content-repository";
import { publishDueContent } from "@/platform/content/scheduled-publishing";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";
import {getHostedAuthConfiguration} from "@/platform/identity/hosted-auth";
import {hostedPublications} from "@/platform/content/hosted-publications";
type Article=Pick<ContentRecord,"id"|"title"|"description"|"body"|"type"|"locale"|"slug">;

export const articlePath = (record: Pick<ContentRecord, "slug" | "locale">) => record.locale === "en" ? `/en/publications/${record.slug}` : `/publik/publikasi/${record.slug}`;

// Only PUBLISHED records are readable; a missing translation never falls back to a draft (Q11).
export async function loadPublishedArticle(slug: string, locale: "id" | "en"): Promise<{ article: Article; published: Article[]; publishedAt?: string; source?:string; hosted?:boolean } | null> {
  if(getHostedAuthConfiguration()) {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>150)return null;
    const [selected,all,translated]=await Promise.all([hostedPublications(locale,slug),hostedPublications(locale),hostedPublications(locale==="id"?"en":"id",slug)]);
    if(!selected.length)return null;
    return {article:selected[0],published:[...all,...translated],publishedAt:selected[0].publishedAt,source:selected[0].meta,hosted:true};
  }
  if (!isTestAuthEnabled() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const repository = await publishDueContent(getLocalContentRepository());
  const published = (await repository.listAll()).filter((record) => record.state === "PUBLISHED");
  const article = published.find((record) => record.slug === slug && record.locale === locale);
  if (!article) return null;
  const publishedAt = (await repository.listRevisions(article.id)).filter((revision) => revision.snapshot.state === "PUBLISHED").at(-1)?.recordedAt;
  return { article, published, publishedAt };
}

export async function PublicationArticle({ article, published, publishedAt, source, hosted }: { article: Article; published: Article[]; publishedAt?: string; source?:string; hosted?:boolean }): Promise<React.JSX.Element> {
  const english = article.locale === "en";
  const translation = published.find((record) => record.slug === article.slug && record.locale !== article.locale);
  const related = published.filter((record) => record.locale === article.locale && record.id !== article.id).slice(0, 3);
  const minutes = readingMinutes(article.body ?? "");

  return <div className="kp-site kp-library" lang={article.locale}>
    <article className="kp-example-article kp-wrap">
      <Link className="kp-text-link" href={english ? "/en/publications" : "/publik/publikasi"}><IconArrowLeft size={18} aria-hidden="true" /> {english ? "Back to publications" : "Kembali ke publikasi"}</Link>
      <div className="kp-example-article__heading">
        <p className="kp-eyebrow">{article.type}{publishedAt ? ` · ${new Date(publishedAt).toLocaleDateString(english ? "en-GB" : "id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Cairo" })}` : ""}</p>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
      </div>
      <p className="kp-article-meta"><span><IconClock size={16} aria-hidden="true" /> {english ? `${minutes} min read` : `±${minutes} menit baca`}</span>{translation && <Link href={articlePath(translation)} hrefLang={translation.locale} lang={translation.locale}><IconLanguage size={16} aria-hidden="true" /> {translation.locale === "en" ? "Read in English" : "Baca dalam Bahasa Indonesia"}</Link>}</p>
      <div className="kp-example-article__notice" role="note">{hosted ? `${english?"Source":"Sumber"}: ${source}` : english ? "Local preview content. Official publications appear after KPI approval." : "Konten pratinjau lokal. Publikasi resmi tampil setelah disetujui KPI."}</div>
      {article.body ? <RichTextView className="kp-example-article__body kp-article-prose" source={article.body} /> : <div className="kp-example-article__body"><p>{article.description}</p></div>}
      {hosted&&<HostedPublicAttachments itemId={article.id}/>}
      {related.length > 0 && <aside className="kp-article-related" aria-labelledby="related-title"><h2 id="related-title">{english ? "More to read" : "Baca juga"}</h2><ul>{related.map((item) => <li key={item.id}><Link href={articlePath(item)}><span>{item.type}</span><strong>{item.title}</strong><small>{item.description}</small></Link></li>)}</ul></aside>}
      <div className="kp-example-article__end"><p>{english ? "Need to understand the reporting channel?" : "Butuh memahami jalur penyampaian informasi?"}</p><Link className="kp-button kp-button--outline" href={english ? "/en/services" : "/publik/layanan"}>{english ? "See public services" : "Lihat layanan publik"} <IconArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </article>
    <PublicFooter locale={article.locale} />
  </div>;
}
