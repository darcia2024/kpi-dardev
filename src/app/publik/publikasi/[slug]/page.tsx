import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { articlePath, loadPublishedArticle, PublicationArticle } from "@/components/public/publication-article";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const loaded = await loadPublishedArticle((await params).slug, "id");
  if (!loaded) return { title: "Publikasi tidak ditemukan | KPI PPMI Mesir" };
  const english = loaded.published.find((record) => record.slug === loaded.article.slug && record.locale === "en");
  return { title: `${loaded.article.title} | KPI PPMI Mesir`, description: loaded.article.description, alternates: english ? { languages: { id: articlePath(loaded.article), en: articlePath(english) } } : undefined };
}

export default async function PublicationArticlePage({ params, searchParams }: Props): Promise<React.JSX.Element> {
  const { slug } = await params;
  // Older links used ?lang=en; English articles now live under /en/publications.
  if ((await searchParams).lang === "en") redirect(`/en/publications/${slug}`);
  const loaded = await loadPublishedArticle(slug, "id");
  if (!loaded) notFound();
  return <PublicationArticle {...loaded} />;
}
