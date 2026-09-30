import { divisionsEn, servicesEn } from "@/lib/public-en";
import { publicDivisions } from "@/lib/public-organization";
import { publicServices } from "@/lib/public-services";
import type { SearchDocument } from "@/lib/public-search";
import { getLocalContentRepository } from "@/platform/content/content-repository";
import { publishDueContent } from "@/platform/content/scheduled-publishing";
import { isTestAuthEnabled } from "@/platform/identity/test-auth";

// Public pages are always searchable; CMS articles only exist in local preview until production storage is ready.
export async function publicSearchDocuments(locale: "id" | "en" = "id"): Promise<SearchDocument[]> {
  const pages: SearchDocument[] = locale === "en" ? [
    ...servicesEn.map((service) => ({ id: `page:${service.href}:${service.title}`, kind: "page" as const, label: service.category, title: service.title, description: service.english ? service.description : `${service.description} (Indonesian page)`, href: service.href })),
    ...publicDivisions.map((division) => ({ id: `division:${division.slug}`, kind: "page" as const, label: divisionsEn[division.slug].unitType, title: division.englishName, description: `${divisionsEn[division.slug].summary} ${divisionsEn[division.slug].purpose}`, body: divisionsEn[division.slug].contributions.join("\n"), href: `/en/divisions/${division.slug}` }))
  ] : [
    ...publicServices.map((service) => ({ id: `page:${service.href}`, kind: "page" as const, label: service.category, title: service.title, description: service.description, href: service.href })),
    ...publicDivisions.map((division) => ({ id: `division:${division.slug}`, kind: "page" as const, label: division.unitType, title: division.name, description: `${division.summary} ${division.purpose}`, body: division.contributions.join("\n"), href: `/publik/divisi/${division.slug}` }))
  ];
  if (!isTestAuthEnabled()) return pages;
  const repository = await publishDueContent(getLocalContentRepository());
  const articles = (await repository.listPublished(locale)).map((record) => ({ id: `article:${record.id}`, kind: "article" as const, label: record.type, title: record.title, description: record.description, body: record.body, href: locale === "en" ? `/en/publications/${record.slug}` : `/publik/publikasi/${record.slug}` }));
  return [...articles, ...pages];
}
