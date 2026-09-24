export type PublicDivision = {
  slug: "intelijen-operasional" | "riset-analisis" | "pencegahan-edukasi" | "media-publikasi";
  name: string;
  englishName: string;
  unitType: "Divisi" | "Subbidang";
  mark: string;
  summary: string;
  purpose: string;
  contributions: string[];
};

export const publicDivisions: PublicDivision[] = [
  {
    slug: "intelijen-operasional",
    name: "Intelijen & Operasional",
    englishName: "Intelligence and Operation Division",
    unitType: "Divisi",
    mark: "/brand/divisions/intelligence-operation-mark.png",
    summary: "Menghimpun informasi awal, memahami konteks, dan mendukung tindak lanjut sesuai prosedur.",
    purpose: "Membantu KPI memahami situasi secara utuh sebelum langkah lanjutan ditentukan.",
    contributions: ["Mengidentifikasi konteks awal secara proporsional.", "Mendukung koordinasi kerja sesuai kebutuhan dan kewenangan.", "Menjaga keteraturan informasi dalam proses operasional."]
  },
  {
    slug: "riset-analisis",
    name: "Riset & Analisis",
    englishName: "Research and Analysis Division",
    unitType: "Divisi",
    mark: "/brand/divisions/research-analysis-mark.png",
    summary: "Mengolah temuan dan kajian menjadi dasar pemahaman serta pertimbangan yang objektif.",
    purpose: "Mengubah temuan dan bahan kajian menjadi pengetahuan yang dapat dipertanggungjawabkan.",
    contributions: ["Mengolah temuan menjadi bahan analisis.", "Mendukung penelaahan yang berlandaskan konteks.", "Menyusun kajian untuk penguatan pemahaman bersama."]
  },
  {
    slug: "pencegahan-edukasi",
    name: "Pencegahan & Edukasi",
    englishName: "Prevention and Education Division",
    unitType: "Divisi",
    mark: "/brand/divisions/prevention-education-mark.png",
    summary: "Membangun pemahaman melalui pendidikan, penyuluhan, dan ruang belajar bersama.",
    purpose: "Mendorong kebiasaan interaksi yang sehat sebelum persoalan berkembang.",
    contributions: ["Menyelenggarakan ruang belajar dan dialog.", "Menguatkan pemahaman mengenai norma dan etika.", "Mendukung pencegahan melalui edukasi yang relevan."]
  },
  {
    slug: "media-publikasi",
    name: "Media & Publikasi",
    englishName: "Media and Publication Subdivision",
    unitType: "Subbidang",
    mark: "/brand/divisions/media-publication-mark.png",
    summary: "Subbidang dalam Pencegahan & Edukasi yang mengemas pengetahuan dan informasi publik agar menjangkau Masisir.",
    purpose: "Membawa pengetahuan dan informasi yang telah layak publik ke ruang yang mudah dijangkau.",
    contributions: ["Mengemas informasi publik dengan bahasa yang mudah dipahami.", "Mendukung dokumentasi dan publikasi edukatif.", "Menjaga pemisahan antara informasi publik dan informasi internal."]
  }
];

export function findPublicDivision(slug: string): PublicDivision | undefined {
  return publicDivisions.find((division) => division.slug === slug);
}
