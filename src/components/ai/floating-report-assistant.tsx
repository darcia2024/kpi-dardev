"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconArrowRight, IconCheck, IconShieldLock, IconX } from "@tabler/icons-react";
import { structureInternalReport, type InternalReportDraft, type ReportKind } from "@/lib/internal-report-draft";

type SubmittedReport = { caseId: string; trackingToken: string; status: string };
type Step = "story" | "review" | "done";

const kindLabels: Record<ReportKind, string> = {
  PENGADUAN: "Pengaduan interaksi",
  SARAN: "Saran",
  PERTANYAAN: "Pertanyaan"
};

export function FloatingReportAssistant(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("story");
  const [story, setStory] = useState("");
  const [draft, setDraft] = useState<InternalReportDraft | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedReport | null>(null);
  const [tracking, setTracking] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const opener = useRef<HTMLButtonElement>(null);
  const storyInput = useRef<HTMLTextAreaElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) window.setTimeout(() => (step === "story" ? storyInput.current : closeButton.current)?.focus(), 0);
  }, [open, step]);

  function close(): void {
    setOpen(false);
    window.setTimeout(() => opener.current?.focus(), 0);
  }

  function structure(): void {
    if (story.trim().length < 20) return;
    setDraft(structureInternalReport(story));
    setIdempotencyKey(crypto.randomUUID());
    setReviewed(false);
    setError("");
    setStep("review");
  }

  async function submit(): Promise<void> {
    if (!draft || !reviewed || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/v1/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, reviewed: true, idempotencyKey })
      });
      if (!response.ok) throw new Error(response.status === 403 ? "Sesi atau izin Anda sudah berubah. Masuk ulang sebelum mencoba lagi." : "Laporan belum dapat disimpan. Periksa isian dan coba lagi.");
      setSubmitted(await response.json() as SubmittedReport);
      setStep("done");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Laporan belum dapat disimpan.");
    } finally {
      setBusy(false);
    }
  }

  function reset(): void {
    setStory("");
    setDraft(null);
    setSubmitted(null);
    setTracking("");
    setReviewed(false);
    setError("");
    setIdempotencyKey("");
    setStep("story");
  }

  async function checkStatus(): Promise<void> {
    if (!submitted) return;
    try {
      const response = await fetch("/api/v1/public/aspirations/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackingToken: submitted.trackingToken }) });
      if (!response.ok) throw new Error("Status belum dapat diperiksa.");
      const result = await response.json() as { tracking: { status: string; latestUpdate: string } };
      setTracking(`${result.tracking.status}: ${result.tracking.latestUpdate}`);
    } catch { setTracking("Status belum dapat diperiksa. Coba lagi nanti."); }
  }

  return <>
    {!open && <button ref={opener} aria-label="Buka asisten laporan" aria-controls="floating-report-panel" aria-expanded={false} className="report-assistant__trigger" onClick={() => setOpen(true)} type="button"><Image alt="" aria-hidden="true" className="report-assistant__logo" height={32} src="/brand/kpi-ppmi-mesir-logo.png" width={32} /></button>}
    {open && <>
      <button aria-label="Tutup asisten laporan" className="report-assistant__scrim" onClick={close} type="button" />
      <section aria-label="Asisten laporan internal" aria-modal="false" className="report-assistant__panel" id="floating-report-panel" onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); close(); } }} role="dialog">
        <header className="report-assistant__header"><div><span className="report-assistant__eyebrow">PRATINJAU LOKAL · KPI</span><h2>Asisten laporan</h2></div><button ref={closeButton} aria-label="Tutup asisten laporan" onClick={close} type="button"><IconX size={20} aria-hidden="true" /></button></header>
        <div className="report-assistant__content">
          {step === "story" && <div className="report-assistant__step"><p className="report-assistant__lead">Ceritakan hal yang ingin disampaikan. Sistem akan merapikan isi menjadi draf pengaduan, saran, atau pertanyaan.</p><label htmlFor="report-story">Cerita Anda</label><textarea ref={storyInput} id="report-story" maxLength={4000} minLength={20} onChange={(event) => setStory(event.target.value)} placeholder="Contoh: Saya ingin melaporkan kejadian dalam kegiatan..." rows={7} value={story} /><span className="report-assistant__count">{story.trim().length}/4000 karakter · minimal 20</span><div className="report-assistant__privacy"><IconShieldLock size={19} aria-hidden="true" /><p>Penyusunan draf berjalan di browser. Jangan gunakan data pribadi atau perkara nyata pada lingkungan pratinjau ini.</p></div><button className="report-assistant__primary" disabled={story.trim().length < 20} onClick={structure} type="button">Susun draf <IconArrowRight size={18} aria-hidden="true" /></button></div>}
          {step === "review" && draft && <div className="report-assistant__step"><p className="report-assistant__lead">Periksa dan ubah hasilnya sebelum dikirim. Kategori ini hanya saran otomatis berbasis kata kunci; Anda yang menentukan tujuan akhirnya.</p><label htmlFor="report-kind">Tujuan laporan</label><select id="report-kind" onChange={(event) => { setDraft({ ...draft, kind: event.target.value as ReportKind }); setReviewed(false); }} value={draft.kind}>{Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label htmlFor="report-subject">Judul</label><input id="report-subject" maxLength={180} minLength={3} onChange={(event) => { setDraft({ ...draft, subject: event.target.value }); setReviewed(false); }} value={draft.subject} /><label htmlFor="report-description">Uraian</label><textarea id="report-description" maxLength={4000} minLength={20} onChange={(event) => { setDraft({ ...draft, description: event.target.value }); setReviewed(false); }} rows={6} value={draft.description} /><div className="report-assistant__route"><strong>Setelah dikirim</strong><p>Masuk ke antrean kasus/aspirasi lokal untuk petugas yang memiliki izin. Pengaduan memerlukan telaah manusia; pengiriman ini tidak menetapkan kesalahan siapa pun.</p></div><label className="report-assistant__check"><input checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} type="checkbox" /><span>Saya sudah memeriksa kategori, judul, dan isi laporan pratinjau ini.</span></label>{error && <p className="report-assistant__error" role="alert">{error}</p>}<div className="report-assistant__actions"><button className="report-assistant__secondary" onClick={() => setStep("story")} type="button"><IconArrowLeft size={17} aria-hidden="true" /> Ubah cerita</button><button className="report-assistant__primary" disabled={!reviewed || busy || draft.subject.trim().length < 3 || draft.description.trim().length < 20} onClick={() => void submit()} type="button">{busy ? "Menyimpan…" : "Kirim laporan pratinjau"} <IconArrowRight size={17} aria-hidden="true" /></button></div></div>}
          {step === "done" && submitted && <div className="report-assistant__step report-assistant__success" role="status"><span className="report-assistant__success-icon"><IconCheck size={27} aria-hidden="true" /></span><h3>Laporan masuk antrean.</h3><p>Draf yang Anda periksa telah disimpan pada backend lokal pratinjau. Petugas berizin dapat menelaahnya sebelum tindak lanjut.</p><dl><div><dt>Nomor</dt><dd>{submitted.caseId}</dd></div><div><dt>Status</dt><dd>Diterima</dd></div></dl><p className="report-assistant__token-label">Kode pelacakan pratinjau</p><code>{submitted.trackingToken}</code><small>Simpan kode ini untuk memeriksa status laporan pratinjau.</small><div className="report-assistant__actions"><button className="report-assistant__secondary" onClick={() => void checkStatus()} type="button">Cek status</button><button className="report-assistant__primary" onClick={reset} type="button">Buat laporan lain <IconArrowRight size={18} aria-hidden="true" /></button></div>{tracking && <p role="status">{tracking}</p>}</div>}
        </div>
        <footer className="report-assistant__footer">Provider AI belum aktif · tidak ada data yang dikirim ke layanan AI luar</footer>
      </section>
    </>}
  </>;
}
