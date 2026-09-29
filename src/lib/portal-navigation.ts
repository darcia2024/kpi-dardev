import type { Permission } from "@/platform/authorization/permissions";

export type PortalNavigationItem = { href: string; label: string; group: string; icon: string };

const destinations: Array<PortalNavigationItem & { permissions: Permission[] }> = [
  { href: "/portal", label: "Beranda", group: "Beranda", icon: "home", permissions: [] },
  { href: "/portal/profil", label: "Profil saya", group: "Beranda", icon: "access", permissions: [] },
  { href: "/portal/workspace", label: "Workspace", group: "Pekerjaan", icon: "workspace", permissions: ["WORKSPACE_READ"] },
  { href: "/portal/tugas", label: "Tugas", group: "Pekerjaan", icon: "task", permissions: ["TASK_READ"] },
  { href: "/portal/rapat", label: "Rapat", group: "Pekerjaan", icon: "meeting", permissions: ["MEETING_READ"] },
  { href: "/portal/dokumen", label: "Dokumen", group: "Layanan", icon: "document", permissions: ["ASSET_DOWNLOAD"] },
  { href: "/portal/notifikasi", label: "Kotak masuk", group: "Layanan", icon: "notification", permissions: ["NOTIFICATION_READ"] },
  { href: "/portal/kasus", label: "Kasus", group: "Layanan", icon: "case", permissions: ["ASPIRATION_TRIAGE"] },
  { href: "/portal/editor", label: "Redaksi", group: "Konten", icon: "editor", permissions: ["CONTENT_DRAFT_WRITE", "CONTENT_REVIEW", "CONTENT_PUBLISH"] },
  { href: "/portal/knowledge", label: "Knowledge", group: "Konten", icon: "document", permissions: ["KNOWLEDGE_READ"] },
  { href: "/portal/ai", label: "AI terkendali", group: "Konten", icon: "ai", permissions: ["AI_READ"] },
  { href: "/portal/keuangan", label: "Keuangan", group: "Tata kelola", icon: "finance", permissions: ["FINANCE_READ"] },
  { href: "/portal/evaluasi", label: "Evaluasi", group: "Tata kelola", icon: "evaluation", permissions: ["EVALUATION_READ"] },
  { href: "/portal/handover", label: "Handover", group: "Tata kelola", icon: "handover", permissions: ["HANDOVER_READ"] },
  { href: "/portal/akses", label: "Akses & identitas", group: "Admin", icon: "access", permissions: ["IDENTITY_READ", "IDENTITY_MANAGE"] },
  { href: "/portal/operasi", label: "Operasi & audit", group: "Admin", icon: "catalog", permissions: ["SYSTEM_CONFIGURATION_READ"] },
  { href: "/portal/katalog", label: "Katalog layar", group: "Admin", icon: "catalog", permissions: ["SYSTEM_CONFIGURATION_READ"] }
];

export function visiblePortalNavigation(can: (permission: Permission) => boolean): PortalNavigationItem[] {
  return destinations.filter((item) => item.permissions.length === 0 || item.permissions.some(can))
    .map(({ href, label, group, icon }) => ({ href, label, group, icon }));
}
