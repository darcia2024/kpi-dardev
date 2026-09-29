"use client";

import { useState } from "react";
import { apiJson } from "@/components/portal/api-client";
import { AiGovernanceWorkspace } from "@/components/ai/ai-governance-workspace";

type Citation = { sourceAssetId: string; title: string; version: number; excerpt: string };
type AiPreview = { answer: string; citations: Citation[]; providerStatus: "NOT_CONFIGURED"; generatedAt: string };
type ActionPreview = { id: string; target: string; payloadVersion: string; expiresAt: string; status: "PENDING_CONFIRMATION" | "CONFIRMED" };
type SessionEntry = { id: string; question: string; preview: AiPreview; feedback: "HELPFUL" | "NOT_HELPFUL" | null; correction: string };
type ResolvedCitation = { sourceAssetId: string; version: number; fileName: string; href: string | null };

export function AiWorkspace(): React.JSX.Element {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<AiPreview | null>(null);
  const [actionPreview, setActionPreview] = useState<ActionPreview | null>(null);
  const [approved, setApproved] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SessionEntry[]>([]);
  const [resolvedCitations, setResolvedCitations] = useState<Record<string, ResolvedCitation | "UNAVAILABLE">>({});

  async function resolveCitation(citation: Citation): Promise<void> {
    const key = `${citation.sourceAssetId}:${citation.version}`;
    try {
      const response = await fetch(`/api/v1/ai/citation?sourceAssetId=${encodeURIComponent(citation.sourceAssetId)}&version=${citation.version}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Sumber tidak lagi dapat diakses.");
      const result = await response.json() as { citation: ResolvedCitation };
      setResolvedCitations((items) => ({ ...items, [key]: result.citation }));
    } catch { setResolvedCitations((items) => ({ ...items, [key]: "UNAVAILABLE" })); }
  }

  async function ask(): Promise<void> {
    setLoading(true); setNotice("");
    try {
      const response = await fetch("/api/v1/ai/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question }) });
      if (!response.ok) throw new Error("Akses atau preview pratinjau belum tersedia.");
      const preview = (await response.json() as { preview: AiPreview }).preview;
      setAnswer(preview);
      setHistory((entries) => [{ id: crypto.randomUUID(), question: question.trim(), preview, feedback: null, correction: "" }, ...entries]);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Preview tidak dapat dimuat."); }
    finally { setLoading(false); }
  }

  async function prepareAction(): Promise<void> {
    setLoading(true); setNotice(""); setApproved(false);
    try { setActionPreview((await apiJson<{ preview: ActionPreview }>("/api/v1/ai/actions", { action: "PREPARE", target: "Task pratinjau · tidak dikirim" })).preview); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Aksi pratinjau gagal disiapkan."); }
    finally { setLoading(false); }
  }

  async function confirmAction(): Promise<void> {
    if (!actionPreview || !approved) return;
    setLoading(true); setNotice("");
    try { setActionPreview((await apiJson<{ preview: ActionPreview }>("/api/v1/ai/actions", { action: "CONFIRM", actionId: actionPreview.id, payloadVersion: actionPreview.payloadVersion })).preview); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Aksi pratinjau kedaluwarsa atau izin berubah; siapkan ulang payload."); }
    finally { setLoading(false); }
  }

  return <>
    <section className="ai-banner"><div><span className="eyebrow">Status provider</span><strong>Nonaktif · menunggu OD-08</strong></div><p>Preview ini tidak mengirim data ke provider. Belum ada dokumen yang dapat digunakan sebagai sumber jawaban.</p></section>
    <section className="ai-layout"><article className="ai-panel"><p className="eyebrow">I01–I02 · Tanya jawab & sumber</p><h2>Tanya sumber pratinjau</h2><textarea aria-label="Pertanyaan AI" onChange={(event) => setQuestion(event.target.value)} placeholder="Tulis pertanyaan tentang sumber yang telah disahkan" rows={4} value={question} /><button className="button button--primary" disabled={!question.trim() || loading} onClick={ask} type="button">{loading ? "Memeriksa sumber…" : "Tampilkan preview"}</button>{answer ? <div className="ai-answer" aria-live="polite"><strong>{answer.answer}</strong><p>Provider tetap tidak dikonfigurasi. Periksa sumber berikut sebelum mengambil keputusan.</p>{answer.citations.map((citation) => { const resolved = resolvedCitations[`${citation.sourceAssetId}:${citation.version}`]; return <div className="citation-row" key={`${citation.sourceAssetId}:${citation.version}`}><span>{citation.title} · v{citation.version}</span><button className="button button--quiet" onClick={() => void resolveCitation(citation)} type="button">Periksa akses sumber</button><small>{citation.excerpt}</small>{resolved === "UNAVAILABLE" ? <small role="alert">Sumber tidak lagi dapat diakses.</small> : resolved?.href ? <a href={resolved.href} rel="noopener noreferrer" target="_blank">Buka {resolved.fileName}</a> : resolved ? <small>Versi sesuai, berkas belum tersedia.</small> : null}</div>; })}</div> : null}</article><article className="ai-panel"><p className="eyebrow">I03 · Riwayat & feedback</p><h2>Riwayat sesi ini</h2><p>Hanya tersimpan di memori halaman ini. Riwayat hilang saat halaman dimuat ulang; tidak ada isi pertanyaan atau koreksi yang disimpan di server.</p>{history.length ? <ol className="ai-history">{history.map((entry) => <li key={entry.id}><strong>{entry.question}</strong><p>{entry.preview.answer}</p><div className="ai-form-actions"><button aria-pressed={entry.feedback === "HELPFUL"} className="button button--quiet" onClick={() => setHistory((items) => items.map((item) => item.id === entry.id ? { ...item, feedback: "HELPFUL" } : item))} type="button">Membantu</button><button aria-pressed={entry.feedback === "NOT_HELPFUL"} className="button button--quiet" onClick={() => setHistory((items) => items.map((item) => item.id === entry.id ? { ...item, feedback: "NOT_HELPFUL" } : item))} type="button">Perlu diperbaiki</button><button className="button button--quiet" onClick={() => setHistory((items) => items.filter((item) => item.id !== entry.id))} type="button">Hapus</button></div><label>Catatan koreksi sesi<textarea maxLength={500} rows={2} value={entry.correction} onChange={(event) => setHistory((items) => items.map((item) => item.id === entry.id ? { ...item, correction: event.target.value } : item))} /></label></li>)}</ol> : <p>Belum ada pertanyaan di sesi ini.</p>}</article></section>
    <AiGovernanceWorkspace />
    <section className="ai-action-panel"><div><p className="eyebrow">I06 · Usulan tindakan</p><h2>Review sebelum menjalankan aksi.</h2><p>Target, payload, kedaluwarsa, serta izin diperiksa ulang saat konfirmasi. Konfirmasi pratinjau tidak menjalankan perubahan ke sistem lain.</p></div><div className="ai-action-preview"><span>Target</span><strong>{actionPreview?.target ?? "Belum disiapkan"}</strong><span>Payload</span><strong>{actionPreview ? `${actionPreview.payloadVersion} · ${actionPreview.status}` : "Belum ada payload"}</strong>{actionPreview && <><span>Berlaku sampai</span><strong>{new Date(actionPreview.expiresAt).toLocaleString("id-ID")}</strong></>}{!actionPreview ? <button className="button button--quiet" disabled={loading} onClick={() => void prepareAction()} type="button">Siapkan aksi pratinjau</button> : <><label className="check-field"><input checked={approved} onChange={(event) => setApproved(event.target.checked)} type="checkbox" /> Saya sudah meninjau payload pratinjau</label><button className="button button--primary" disabled={loading || !approved || actionPreview.status === "CONFIRMED"} onClick={() => void confirmAction()} type="button">{actionPreview.status === "CONFIRMED" ? "Terkonfirmasi sebagai pratinjau" : "Konfirmasi preview"}</button></>}</div></section>
    {notice ? <p className="task-footnote" aria-live="polite">{notice}</p> : null}
    <p className="task-footnote">AI produksi tetap nonaktif sampai provider, region, retensi, sumber berizin, dan kebijakan manusia disetujui KPI.</p>
  </>;
}
