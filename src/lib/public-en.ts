// English copy for the public site. Faithful translations of the Indonesian preview copy;
// the English site is labelled as a preview until KPI reviews the translation.

export const divisionsEn: Record<string, { unitType: "Division" | "Subdivision"; summary: string; purpose: string; contributions: string[] }> = {
  "intelijen-operasional": {
    unitType: "Division",
    summary: "Gathers initial information, understands the context, and supports follow-up according to procedure.",
    purpose: "Helps KPI understand a situation fully before further steps are decided.",
    contributions: ["Identifies the initial context proportionately.", "Supports coordination as needed and within its authority.", "Keeps information orderly throughout operational processes."]
  },
  "riset-analisis": {
    unitType: "Division",
    summary: "Turns findings and studies into a basis for objective understanding and consideration.",
    purpose: "Turns findings and study material into accountable knowledge.",
    contributions: ["Processes findings into material for analysis.", "Supports context-based review.", "Prepares studies that strengthen shared understanding."]
  },
  "pencegahan-edukasi": {
    unitType: "Division",
    summary: "Builds understanding through education, outreach, and shared learning spaces.",
    purpose: "Encourages healthy interaction habits before problems develop.",
    contributions: ["Organises learning and dialogue spaces.", "Strengthens understanding of norms and ethics.", "Supports prevention through relevant education."]
  },
  "media-publikasi": {
    unitType: "Subdivision",
    summary: "A subdivision within Prevention and Education that packages public knowledge and information so it reaches Indonesian students in Egypt.",
    purpose: "Brings knowledge and information that is fit for the public to places that are easy to reach.",
    contributions: ["Packages public information in plain language.", "Supports documentation and educational publications.", "Keeps public information separate from internal information."]
  }
};

export const pillarsEn = [
  { label: "Prevention & education", title: "Helping students understand boundaries and responsibilities.", text: "Interaction education, discussions, studies, and publications help build habits that respect one another." },
  { label: "Oversight & information", title: "Recognising issues before taking steps.", text: "KPI oversees interaction issues and receives information to examine its context and fit with the organisation's mandate." },
  { label: "Handling", title: "Acting according to procedure and authority.", text: "Issues are handled objectively and proportionately while protecting the confidentiality, rights, and dignity of those involved." }
];

export const missionsEn = [
  "Improve the quality of prevention and education.",
  "Handle issues objectively, proportionately, and according to procedure.",
  "Strengthen coordination with PPMI, regional family associations, WIHDAH, and related institutions.",
  "Protect the confidentiality, dignity, and rights of every party."
];

// Services link to English pages where they exist; forms and flows remain in Indonesian for now.
export const servicesEn = [
  { title: "About KPI", description: "KPI's mandate, working principles, vision, and mission.", href: "/en", category: "Organisation", english: true },
  { title: "Divisions", description: "Three divisions and one subdivision that support KPI's mandate.", href: "/en/divisions", category: "Organisation", english: true },
  { title: "Publications & education", description: "Introductory material on healthy interaction, prevention, and protection principles.", href: "/en/publications", category: "Knowledge", english: true },
  { title: "Structure", description: "KPI's position within PPMI Egypt, its divisions, and subdivision.", href: "/publik/struktur", category: "Organisation", english: false },
  { title: "Activities & documentation", description: "Moments of dialogue, coordination, learning, and togetherness.", href: "/publik/kegiatan", category: "Information", english: false },
  { title: "Aspiration flow", description: "Learn how to share suggestions and questions. The form does not accept official submissions yet.", href: "/publik/aspirasi", category: "Services", english: false },
  { title: "Complaint service", description: "Understand how complaints are handled. Real complaints cannot be submitted yet.", href: "/publik/pengaduan", category: "Services", english: false }
] as const;

// Pairs of Indonesian and English paths for the language switcher and hreflang.
export function englishPathFor(pathname: string): string {
  if (pathname.startsWith("/publik/divisi/")) return pathname.replace("/publik/divisi/", "/en/divisions/");
  if (pathname.startsWith("/publik/publikasi/")) return pathname.replace("/publik/publikasi/", "/en/publications/");
  return ({ "/publik/divisi": "/en/divisions", "/publik/layanan": "/en/services", "/publik/publikasi": "/en/publications", "/publik/cari": "/en/search" } as Record<string, string>)[pathname] ?? "/en";
}

export function indonesianPathFor(pathname: string): string {
  if (pathname.startsWith("/en/divisions/")) return pathname.replace("/en/divisions/", "/publik/divisi/");
  if (pathname.startsWith("/en/publications/")) return pathname.replace("/en/publications/", "/publik/publikasi/");
  return ({ "/en": "/publik", "/en/divisions": "/publik/divisi", "/en/services": "/publik/layanan", "/en/publications": "/publik/publikasi", "/en/search": "/publik/cari" } as Record<string, string>)[pathname] ?? "/";
}
