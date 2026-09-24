"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/components/portal/api-client";
import type { AiActivationReadiness, AiPolicyDraft, AiProviderDraft } from "@/platform/ai/local-ai-governance";

type Data = { readiness: AiActivationReadiness; canManage: boolean; providers: AiProviderDraft[]; policies: AiPolicyDraft[] };
const blankProvider = { providerName: "", modelId: "", processingRegion: "", promptVersion: "" };
const blankPolicy = { allowedDataClasses: "", processingRegion: "", retentionDays: "", humanReviewRequired: true };

export function AiGovernanceWorkspace(): React.JSX.Element {
  const [data, setData] = useState<Data | null>(null);
  const [provider, setProvider] = useState(blankProvider);
  const [policy, setPolicy] = useState(blankPolicy);
  const [selectedProvider, setSelectedProvider] = useState<AiProviderDraft | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<AiPolicyDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function reload(): Promise<void> { setData(await apiJson<Data>("/api/v1/ai/governance")); }
  useEffect(() => { void reload().catch(() => setMessage("Status AI belum dapat dimuat.")); }, []);

  async function submit(body: object, success: string): Promise<void> {
    setBusy(true); setMessage("");
    try { await apiJson("/api/v1/ai/governance", body); await reload(); setSelectedProvider(null); setProvider(blankProvider); setSelectedPolicy(null); setPolicy(blankPolicy); setMessage(success); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Draf gagal disimpan."); }
    finally { setBusy(false); }
  }

  return <section className="ai-governance" aria-label="Tata kelola AI">
    <article className="ai-banner"><div><span className="eyebrow">I04–I05 · Gerbang aktivasi</span><strong>AI eksternal belum aktif</strong></div><p>{data?.readiness.blockers.join(" ") ?? "Memuat status tata kelola…"}</p></article>
    {data?.canManage ? <div className="operations-grid">
      <article className="operations-panel">
        <p className="eyebrow">I04 · Registry provider</p><h2>Calon provider dan model</h2>
        <p>Catat kandidat untuk review. Draf tidak mengaktifkan koneksi dan tidak menyimpan API key.</p>
        <label>Nama provider<input maxLength={120} value={provider.providerName} onChange={(event) => setProvider({ ...provider, providerName: event.target.value })} /></label>
        <label>ID model<input maxLength={160} value={provider.modelId} onChange={(event) => setProvider({ ...provider, modelId: event.target.value })} /></label>
        <label>Wilayah pemrosesan<input maxLength={120} value={provider.processingRegion} onChange={(event) => setProvider({ ...provider, processingRegion: event.target.value })} /></label>
        <label>Versi prompt<input maxLength={80} value={provider.promptVersion} onChange={(event) => setProvider({ ...provider, promptVersion: event.target.value })} /></label>
        <div className="ai-form-actions"><button className="button button--quiet" disabled={busy} onClick={() => void submit({ action: "SAVE_PROVIDER", ...provider, id: selectedProvider?.id, expectedVersion: selectedProvider?.version }, "Draf provider tersimpan; AI tetap nonaktif.")} type="button">{selectedProvider ? "Simpan revisi" : "Simpan draf"}</button>{selectedProvider ? <button className="button button--quiet" disabled={busy} onClick={() => { setSelectedProvider(null); setProvider(blankProvider); }} type="button">Draf baru</button> : null}</div>
        <h3>Registry lokal</h3>{data.providers.length ? <ol>{data.providers.map((item) => <li key={item.id}><strong>{item.providerName || "Provider belum diisi"} · v{item.version}</strong><p>{item.modelId || "Model belum diisi"} · {item.status === "DRAFT" ? "Draf" : "Menunggu review"}</p>{item.status === "DRAFT" ? <div className="ai-form-actions"><button className="button button--quiet" disabled={busy} onClick={() => { setSelectedProvider(item); setProvider({ providerName: item.providerName, modelId: item.modelId, processingRegion: item.processingRegion, promptVersion: item.promptVersion }); }} type="button">Edit</button><button className="button button--quiet" disabled={busy} onClick={() => void submit({ action: "SUBMIT_PROVIDER", id: item.id, version: item.version }, "Kandidat dikirim untuk review; belum aktif.")} type="button">Ajukan review</button></div> : null}</li>)}</ol> : <p>Belum ada kandidat.</p>}
      </article>
      <article className="operations-panel">
        <p className="eyebrow">I05 · Kebijakan AI</p><h2>Batas penggunaan data</h2>
        <p>Susun usulan kelas data, lokasi, dan retensi. Nilai yang ditulis di sini belum menjadi kebijakan resmi.</p>
        <label>Kelas data yang diusulkan, pisahkan dengan koma<input maxLength={500} value={policy.allowedDataClasses} onChange={(event) => setPolicy({ ...policy, allowedDataClasses: event.target.value })} /></label>
        <label>Wilayah pemrosesan<input maxLength={120} value={policy.processingRegion} onChange={(event) => setPolicy({ ...policy, processingRegion: event.target.value })} /></label>
        <label>Retensi yang diusulkan (hari)<input min={0} max={3650} type="number" value={policy.retentionDays} onChange={(event) => setPolicy({ ...policy, retentionDays: event.target.value })} /></label>
        <label className="check-field"><input checked={policy.humanReviewRequired} onChange={(event) => setPolicy({ ...policy, humanReviewRequired: event.target.checked })} type="checkbox" /> Tindakan AI memerlukan tinjauan manusia</label>
        <div className="ai-form-actions"><button className="button button--quiet" disabled={busy} onClick={() => void submit({ action: "SAVE_POLICY", allowedDataClasses: policy.allowedDataClasses.split(",").map((value) => value.trim()).filter(Boolean), processingRegion: policy.processingRegion, retentionDays: policy.retentionDays === "" ? null : Number(policy.retentionDays), humanReviewRequired: policy.humanReviewRequired, id: selectedPolicy?.id, expectedVersion: selectedPolicy?.version }, "Usulan kebijakan tersimpan; AI tetap nonaktif.")} type="button">{selectedPolicy ? "Simpan revisi" : "Simpan draf"}</button>{selectedPolicy ? <button className="button button--quiet" disabled={busy} onClick={() => { setSelectedPolicy(null); setPolicy(blankPolicy); }} type="button">Draf baru</button> : null}</div>
        <h3>Usulan lokal</h3>{data.policies.length ? <ol>{data.policies.map((item) => <li key={item.id}><strong>Versi {item.version} · {item.status === "DRAFT" ? "Draf" : "Menunggu review"}</strong><p>{item.allowedDataClasses.join(", ") || "Kelas data belum diisi"} · {item.processingRegion || "Wilayah belum diisi"}</p>{item.status === "DRAFT" ? <div className="ai-form-actions"><button className="button button--quiet" disabled={busy} onClick={() => { setSelectedPolicy(item); setPolicy({ allowedDataClasses: item.allowedDataClasses.join(", "), processingRegion: item.processingRegion, retentionDays: item.retentionDays === null ? "" : String(item.retentionDays), humanReviewRequired: item.humanReviewRequired }); }} type="button">Edit</button><button className="button button--quiet" disabled={busy} onClick={() => void submit({ action: "SUBMIT_POLICY", id: item.id, version: item.version }, "Usulan dikirim untuk review; belum berlaku.")} type="button">Ajukan review</button></div> : null}</li>)}</ol> : <p>Belum ada usulan.</p>}
      </article>
    </div> : <p className="task-footnote">Registry dan usulan kebijakan hanya dapat dilihat oleh pengelola konfigurasi.</p>}
    {message ? <p role="status" className="task-footnote">{message}</p> : null}
  </section>;
}
