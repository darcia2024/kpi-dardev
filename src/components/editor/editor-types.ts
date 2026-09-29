export type ContentState = "DRAFT" | "IN_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
export type Publication = { id: string; title: string; description: string; body?: string; slug: string; type: string; meta: string; href: string; locale: "id" | "en"; state: ContentState; version: number; authorAccountId: string; mediaAssetId?: string; scheduledPublishAt?: string };
export type Revision = { id: string; version: number; recordedAt: string; snapshot: Publication };

export const stateLabels: Record<ContentState, string> = { DRAFT: "Draf", IN_REVIEW: "Menunggu review", CHANGES_REQUESTED: "Perlu revisi", APPROVED: "Disetujui", PUBLISHED: "Terbit", ARCHIVED: "Arsip" };
export const contentTypes = ["Informasi", "Artikel", "Berita", "Pedoman", "Pengumuman"];
export const localeLabels: Record<Publication["locale"], string> = { id: "Indonesia", en: "English" };

// Mirrors the API draft schema so the editor can explain why saving is blocked.
export const draftRules = { titleMin: 3, titleMax: 180, descriptionMin: 10, descriptionMax: 2_000, bodyMin: 30, bodyMax: 20_000, slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ };
