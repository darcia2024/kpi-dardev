// Checks run before a public article is published or scheduled. Shared by the editor UI
// (to show the list) and the server (to enforce it); blocking checks stop publication.
import { isSafeHref } from "@/lib/rich-text";

export type PreflightInput = {
  title: string;
  description: string;
  body?: string;
  locale: "id" | "en";
  mediaStatus?: string | null;
  translationState?: string | null;
};
export type PreflightCheck = { id: "personal-data" | "links" | "media" | "translation"; label: string; ok: boolean; blocking: boolean; detail: string };

const email = /[\w.+-]+@[\w-]+\.[\w.-]+/;
// International (+20, +62) or local mobile formats with at least 9 digits.
const phone = /(?:\+\d{1,3}[\s-]?\d{2,4}|\b0\d{2,4})[\s-]?\d{3,4}[\s-]?\d{3,5}\b/;
const nationalId = /\b\d{16}\b/;

export function preflight(input: PreflightInput): PreflightCheck[] {
  const text = `${input.title}\n${input.description}\n${input.body ?? ""}`;
  const personal = [email.test(text) && "alamat email", phone.test(text) && "nomor telepon", nationalId.test(text) && "nomor identitas 16 digit"].filter(Boolean) as string[];
  const links = [...(input.body ?? "").matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)].map((match) => match[1]);
  const unsafe = links.filter((href) => !isSafeHref(href));
  const otherLanguage = input.locale === "id" ? "English" : "Indonesia";
  return [
    { id: "personal-data", label: "Tidak memuat data pribadi", ok: personal.length === 0, blocking: true, detail: personal.length ? `Ditemukan ${personal.join(", ")}. Hapus sebelum terbit.` : "Tidak ditemukan email, nomor telepon, atau nomor identitas." },
    { id: "links", label: "Tautan aman", ok: unsafe.length === 0, blocking: true, detail: unsafe.length ? `${unsafe.length} tautan bukan https atau alamat situs.` : links.length ? `${links.length} tautan diperiksa.` : "Tidak ada tautan." },
    { id: "media", label: "Gambar utama lolos pemeriksaan", ok: !input.mediaStatus || input.mediaStatus === "AVAILABLE", blocking: true, detail: !input.mediaStatus ? "Tanpa gambar utama." : input.mediaStatus === "AVAILABLE" ? "File sudah diperiksa." : "File masih diperiksa atau tidak dapat dibuka." },
    // Language fallback policy is still open (Q11), so a missing translation warns but does not block.
    { id: "translation", label: `Versi ${otherLanguage} disetujui`, ok: input.translationState === "APPROVED" || input.translationState === "PUBLISHED", blocking: false, detail: !input.translationState ? `Belum ada versi ${otherLanguage}. Situs tidak akan menampilkan draf sebagai pengganti.` : input.translationState === "APPROVED" || input.translationState === "PUBLISHED" ? `Versi ${otherLanguage} siap.` : `Versi ${otherLanguage} masih berstatus draf/review.` }
  ];
}

export function blockingFailures(checks: PreflightCheck[]): PreflightCheck[] {
  return checks.filter((check) => check.blocking && !check.ok);
}
