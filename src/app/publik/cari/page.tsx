import type { Metadata } from "next";
import { PublicSearchView } from "@/components/public/public-search-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pencarian | KPI PPMI Mesir", description: "Cari publikasi dan halaman informasi KPI PPMI Mesir.", alternates: { languages: { id: "/publik/cari", en: "/en/search" } } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; jenis?: string | string[]; halaman?: string | string[] }> }): Promise<React.JSX.Element> {
  return <PublicSearchView locale="id" params={await searchParams} />;
}
