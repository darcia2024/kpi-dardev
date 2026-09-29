"use client";

import { useState } from "react";
import { IconAlertTriangle, IconScale } from "@tabler/icons-react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";

type Indicator = { id: string; name: string; weightPercent: number };
type Scheme = { id: string; version: number; status: "DRAFT" | "ACTIVE" | "RETIRED"; indicators: Indicator[] };
type Summary = { subjectAccountId: string; indicators: { indicatorId: string; name: string; weightPercent: number; averageScore: number | null; assessments: number }[]; weightedPercent: number | null; coveredWeightPercent: number };
type Assessment = { indicatorId: string; subjectAccountId: string; score: 1 | 2 | 3 | 4 | 5 | null; reason: string; evidenceAssetIds: string[] };
type State = { active: Scheme | null; draft: Scheme | null; subjects: { accountId: string; name: string; conflict: boolean }[]; summaries: Summary[]; myAssessments: Assessment[]; myConflicts: { subjectAccountId: string; reason: string }[] };
type Asset = { id: string; fileName: string; status: string };
type Draft = { score: Assessment["score"] | undefined; reason: string; evidenceAssetId: string };

const rubric: Array<{ value: 1 | 2 | 3 | 4 | 5; label: string }> = [{ value: 1, label: "Sangat kurang" }, { value: 2, label: "Kurang" }, { value: 3, label: "Cukup" }, { value: 4, label: "Baik" }, { value: 5, label: "Sangat baik" }];

export function PerformanceSheet({ accountId, canEvaluate }: { accountId: string; canEvaluate: boolean }): React.JSX.Element {
  const resource = usePortalResource<State>("/api/v1/evaluations/performance", "state");
  const assets = usePortalResource<Asset>("/api/v1/documents", "assets");
  const state = resource.items[0];
  const [subjectId, setSubjectId] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [conflictReason, setConflictReason] = useState("");
  const [indicatorName, setIndicatorName] = useState("");
  const [indicatorWeight, setIndicatorWeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const subjects = state?.subjects.filter((subject) => subject.accountId !== accountId) ?? [];
  const subject = subjects.find((item) => item.accountId === subjectId) ?? subjects.find((item) => !item.conflict) ?? subjects[0];
  const summary = state?.summaries.find((item) => item.subjectAccountId === (canEvaluate ? subject?.accountId : accountId));
  const evidence = assets.items.filter((asset) => asset.status === "AVAILABLE");
  const draftWeight = state?.draft?.indicators.reduce((sum, indicator) => sum + indicator.weightPercent, 0) ?? 0;

  async function act(body: Record<string, unknown>, success: string): Promise<boolean> {
    setBusy(true); setMessage("");
    try { await apiJson("/api/v1/evaluations/performance", body); await resource.reload(); setMessage(success); return true; }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Perubahan gagal disimpan."); return false; }
    finally { setBusy(false); }
  }

  function draftFor(indicatorId: string): Draft {
    const saved = state?.myAssessments.find((item) => item.indicatorId === indicatorId && item.subjectAccountId === subject?.accountId);
    return drafts[`${subject?.accountId}:${indicatorId}`] ?? { score: saved?.score, reason: saved?.reason ?? "", evidenceAssetId: saved?.evidenceAssetIds[0] ?? "" };
  }
  const setDraft = (indicatorId: string, change: Partial<Draft>) => setDrafts((current) => ({ ...current, [`${subject?.accountId}:${indicatorId}`]: { ...draftFor(indicatorId), ...change } }));

  if (resource.loading) return <p role="status">Memuat penilaian kinerja…</p>;
  if (resource.error || !state) return <p role="alert">{resource.error || "Penilaian kinerja gagal dimuat."} <button className="button button--quiet" onClick={() => void resource.reload()} type="button">Coba lagi</button></p>;

  return <section className="performance" aria-label="Penilaian kinerja">
    <article className="performance-panel">
      <div className="performance-panel__head"><div><p className="eyebrow">E04 · Target & capaian</p><h2>{canEvaluate ? subject ? `Capaian ${subject.name}` : "Capaian pengurus" : "Capaian saya"}</h2></div>{state.active && <span className="status-chip">Skema v{state.active.version} · bobot total 100%</span>}</div>
      {!state.active ? <p className="performance-empty">Belum ada skema indikator yang aktif untuk periode ini. {canEvaluate ? "Susun indikator dan bobotnya di bagian bawah." : "Penilai akan menyusunnya."} Formula resmi menunggu keputusan KPI.</p> : <>
        <ul className="performance-indicators">{(summary?.indicators ?? state.active.indicators.map((indicator) => ({ indicatorId: indicator.id, name: indicator.name, weightPercent: indicator.weightPercent, averageScore: null, assessments: 0 }))).map((indicator) => <li key={indicator.indicatorId}>
          <div><span>{indicator.name} <small>(bobot {indicator.weightPercent}%)</small></span><strong>{indicator.averageScore === null ? "Belum ada data" : `${indicator.averageScore.toFixed(1)} / 5`}</strong></div>
          <span className="performance-indicators__track">{indicator.averageScore !== null && <span style={{ width: `${indicator.averageScore / 5 * 100}%` }} />}</span>
        </li>)}</ul>
        <p className="performance-total">{summary?.weightedPercent === null || !summary ? "Nilai tertimbang belum dapat dihitung karena belum ada indikator berdata." : <>Nilai tertimbang <strong>{summary.weightedPercent}%</strong> dari {summary.coveredWeightPercent}% bobot yang sudah berdata. Indikator tanpa data tidak dihitung sebagai nol.</>}</p>
      </>}
    </article>

    {canEvaluate && state.active && <article className="performance-panel">
      <div className="performance-panel__head"><div><p className="eyebrow">E06 · Lembar penilaian</p><h2>Nilai menurut rubrik</h2></div><label className="performance-subject">Yang dinilai<select onChange={(event) => setSubjectId(event.target.value)} value={subject?.accountId ?? ""}>{subjects.map((item) => <option key={item.accountId} value={item.accountId}>{item.name}{item.conflict ? " · konflik kepentingan" : ""}</option>)}</select></label></div>
      {subject?.conflict ? <div className="performance-conflict" role="status"><IconAlertTriangle size={18} aria-hidden="true" /><div><strong>Anda tidak dapat menilai {subject.name}.</strong><span>Penilai yang punya konflik kepentingan tidak boleh menilai orang ini.{state.myConflicts.find((item) => item.subjectAccountId === subject.accountId) ? ` Alasan tercatat: ${state.myConflicts.find((item) => item.subjectAccountId === subject.accountId)!.reason}` : ""}</span></div></div> : subject && <>
        {evidence.length === 0 && <p className="portal-note">Nilai angka memerlukan bukti yang lolos pemeriksaan. Belum ada bukti tersedia, jadi saat ini hanya "Belum ada data" yang dapat disimpan.</p>}
        <ol className="performance-sheet">{state.active.indicators.map((indicator) => {
          const draft = draftFor(indicator.id);
          const valid = draft.score !== undefined && draft.reason.trim().length >= 10 && (draft.score === null || !!draft.evidenceAssetId);
          return <li key={indicator.id}>
            <div className="performance-sheet__title"><strong>{indicator.name}</strong><span>Bobot {indicator.weightPercent}%</span></div>
            <div className="performance-rubric" role="radiogroup" aria-label={`Nilai ${indicator.name}`}>{rubric.map((option) => <button aria-checked={draft.score === option.value} className={draft.score === option.value ? "is-selected" : ""} key={option.value} onClick={() => setDraft(indicator.id, { score: option.value })} role="radio" title={option.label} type="button"><b>{option.value}</b><small>{option.label}</small></button>)}<button aria-checked={draft.score === null} className={`performance-rubric__none ${draft.score === null ? "is-selected" : ""}`} onClick={() => setDraft(indicator.id, { score: null })} role="radio" type="button">Belum ada data</button></div>
            <div className="portal-form-grid"><label className="portal-form-grid__wide">Alasan penilaian (wajib)<textarea maxLength={1000} onChange={(event) => setDraft(indicator.id, { reason: event.target.value })} placeholder="Tulis alasan berdasarkan bukti yang ditinjau…" rows={2} value={draft.reason} /></label>{draft.score !== null && draft.score !== undefined && <label className="portal-form-grid__wide">Bukti<select onChange={(event) => setDraft(indicator.id, { evidenceAssetId: event.target.value })} value={draft.evidenceAssetId}><option value="">Pilih bukti</option>{evidence.map((asset) => <option key={asset.id} value={asset.id}>{asset.fileName}</option>)}</select></label>}</div>
            <div className="portal-form-actions"><button className="button button--quiet" disabled={busy || !valid} onClick={() => void act({ action: "ASSESS", indicatorId: indicator.id, subjectAccountId: subject.accountId, score: draft.score, reason: draft.reason, evidenceAssetIds: draft.score === null ? [] : [draft.evidenceAssetId] }, "Penilaian tersimpan.")} type="button">Simpan penilaian</button>{state.myAssessments.some((item) => item.indicatorId === indicator.id && item.subjectAccountId === subject.accountId) && <small>Tersimpan · menyimpan lagi membuat revisi</small>}</div>
          </li>;
        })}</ol>
        <details className="performance-declare"><summary>Nyatakan konflik kepentingan terhadap {subject.name}</summary><div className="portal-form-inline"><label>Alasan<input maxLength={500} onChange={(event) => setConflictReason(event.target.value)} placeholder="Contoh: satu tim kepanitiaan" value={conflictReason} /></label><button className="button button--quiet" disabled={busy || conflictReason.trim().length < 5} onClick={() => void act({ action: "DECLARE_CONFLICT", subjectAccountId: subject.accountId, reason: conflictReason }, "Konflik kepentingan tercatat. Anda tidak lagi dapat menilai orang ini.").then((ok) => { if (ok) setConflictReason(""); })} type="button">Nyatakan</button></div></details>
      </>}
    </article>}

    {canEvaluate && <article className="performance-panel">
      <div className="performance-panel__head"><div><p className="eyebrow">E02 · Skema indikator</p><h2>Indikator & bobot</h2></div>{state.draft && <span className={`status-chip ${draftWeight === 100 ? "" : "status-chip--warn"}`}><IconScale size={14} aria-hidden="true" /> Total {draftWeight}%</span>}</div>
      {!state.draft ? <><p className="performance-empty">{state.active ? `Skema v${state.active.version} sedang aktif. Buat draf revisi untuk mengubah indikator; nilai lama tetap tercatat pada versinya.` : "Belum ada skema. Mulai dengan draf, tambahkan indikator hingga total bobot tepat 100%."}</p><button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "CREATE_DRAFT" }, "Draf skema dibuat.")} type="button">{state.active ? "Buat draf revisi" : "Buat draf skema"}</button></> : <>
        <ul className="performance-scheme">{state.draft.indicators.map((indicator) => <li key={indicator.id}><span>{indicator.name}</span><strong>{indicator.weightPercent}%</strong><button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "REMOVE_INDICATOR", schemeId: state.draft!.id, indicatorId: indicator.id }, "Indikator dihapus dari draf.")} type="button">Hapus</button></li>)}</ul>
        <div className="portal-form-grid"><label>Nama indikator<input maxLength={120} onChange={(event) => setIndicatorName(event.target.value)} placeholder="Contoh: Ketepatan waktu tugas" value={indicatorName} /></label><label>Bobot (%)<input inputMode="numeric" max={100 - draftWeight} min={1} onChange={(event) => setIndicatorWeight(event.target.value)} type="number" value={indicatorWeight} /></label></div>
        <div className="portal-form-actions"><button className="button button--quiet" disabled={busy || indicatorName.trim().length < 3 || !Number.isInteger(Number(indicatorWeight)) || Number(indicatorWeight) < 1 || draftWeight + Number(indicatorWeight) > 100} onClick={() => void act({ action: "SET_INDICATOR", schemeId: state.draft!.id, name: indicatorName, weightPercent: Number(indicatorWeight) }, "Indikator ditambahkan.").then((ok) => { if (ok) { setIndicatorName(""); setIndicatorWeight(""); } })} type="button">Tambah indikator</button><button className="button button--primary" disabled={busy || draftWeight !== 100} onClick={() => void act({ action: "ACTIVATE", schemeId: state.draft!.id }, "Skema diaktifkan.")} type="button">Aktifkan skema</button>{draftWeight !== 100 && <small>Aktivasi memerlukan total bobot tepat 100%.</small>}</div>
      </>}
    </article>}
    {message && <p className="form-message" role="status">{message}</p>}
  </section>;
}
