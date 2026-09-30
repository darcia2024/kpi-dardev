import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articlePath, loadPublishedArticle, PublicationArticle } from "@/components/public/publication-article";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadPublishedArticle((await params).slug, "en");
  if (!loaded) return { title: "Publication not found | KPI PPMI Egypt" };
  const indonesian = loaded.published.find((record) => record.slug === loaded.article.slug && record.locale === "id");
  return { title: `${loaded.article.title} | KPI PPMI Egypt`, description: loaded.article.description, alternates: indonesian ? { languages: { id: articlePath(indonesian), en: articlePath(loaded.article) } } : undefined };
}

export default async function EnglishArticlePage({ params }: Props): Promise<React.JSX.Element> {
  const loaded = await loadPublishedArticle((await params).slug, "en");
  if (!loaded) notFound();
  return <PublicationArticle {...loaded} />;
}
