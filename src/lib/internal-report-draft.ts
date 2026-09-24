export type ReportKind = "PENGADUAN" | "SARAN" | "PERTANYAAN";

export type InternalReportDraft = {
  kind: ReportKind;
  subject: string;
  description: string;
};

const suggestionWords = /\b(saran|usul|usulan|masukan|sebaiknya|perlu ada|berharap agar)\b/i;
const questionWords = /\b(bertanya|pertanyaan|apakah|bagaimana|kapan|mengapa|mohon penjelasan)\b/i;

export function structureInternalReport(story: string): InternalReportDraft {
  const description = story.trim().replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n");
  const firstStatement = description.split(/[.!?\n]/, 1)[0]
    .replace(/^(saya|kami)\s+(ingin|mau|hendak)\s+(melaporkan|menyampaikan|bertanya)(\s+bahwa)?\s*/i, "")
    .trim();
  const short = firstStatement.length > 100 ? `${firstStatement.slice(0, 97).trimEnd()}…` : firstStatement;
  const subject = short.length >= 3 ? short[0].toLocaleUpperCase("id-ID") + short.slice(1) : "Informasi terkait interaksi";
  const kind = questionWords.test(description) ? "PERTANYAAN" : suggestionWords.test(description) ? "SARAN" : "PENGADUAN";
  return { kind, subject, description };
}
