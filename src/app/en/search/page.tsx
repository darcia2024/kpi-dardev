import type { Metadata } from "next";
import { PublicSearchView } from "@/components/public/public-search-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search | KPI PPMI Egypt", description: "Search KPI PPMI Egypt publications and information pages.", alternates: { languages: { id: "/publik/cari", en: "/en/search" } } };

export default async function EnglishSearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; type?: string | string[]; page?: string | string[] }> }): Promise<React.JSX.Element> {
  return <PublicSearchView locale="en" params={await searchParams} />;
}
