"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/components/portal/api-client";
import type { LegalHold } from "@/platform/governance/local-legal-hold";
import type { AssetRecord } from "@/platform/storage/asset-repository";

export function LegalHoldWorkspace(): React.JSX.Element {
  const [holds, setHolds] = useState<LegalHold[]>([]);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [assetId, setAssetId] = useState("");
  const [reason, setReason] = useState("");
  const [releaseId, setReleaseId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function reload(): Promise<void> {
    const [holdResult, assetResult] = await Promise.all([apiJson<{ holds: LegalHold[] }>("/api/v1/admin/holds"), apiJson<{ assets: AssetRecord[] }>("/api/v1/documents")]);
    setHolds(holdResult.holds); setAssets(assetResult.assets);
  }
  useEffect(() => { void reload().catch(() => setMessage("Data hold belum dapat dimuat.")); }, []);
  async function submit(action: "PLACE" | "RELEASE"): Promise<void> {
    setBusy(true); setMessage("");
    try { await apiJson("/api/v1/admin/holds", action === "PLACE" ? { action, assetId, reason } : { action, id: releaseId, reason }); await reload(); setReason(""); setReleaseId(""); setMessage(action === "PLACE" ? "Hold aktif; dokumen tidak dapat diarsipkan." : "Hold dilepas dan dicatat dalam audit."); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Perubahan hold gagal."); }
    finally { setBusy(false); }
  }
  return <section className="operations-grid" aria-label="Legal hold lokal"><article className="operations-panel"><p className="eyebrow">A14 · Legal hold</p><h2>Tahan arsip dokumen</h2><p>Hold lokal mencegah arsip selama pemeriksaan. Jadwal retensi dan kewenangan resmi belum ditetapkan.</p><label>Dokumen<select value={assetId} disabled={!!releaseId} onChange={(event) => setAssetId(event.target.value)}><option value="">Pilih dokumen</option>{assets.filter((asset) => asset.status !== "REVOKED").map((asset) => <option value={asset.id} key={asset.id}>{asset.fileName}</option>)}</select></label><label>Alasan<textarea value={reason} rows={3} maxLength={500} onChange={(event) => setReason(event.target.value)} /></label><button className="button button--quiet" disabled={busy || !assetId || reason.trim().length < 10} onClick={() => void submit(releaseId ? "RELEASE" : "PLACE")} type="button">{releaseId ? "Lepas hold" : "Aktifkan hold"}</button>{releaseId ? <button className="button button--quiet" onClick={() => setReleaseId("")} type="button">Batal melepas</button> : null}{message ? <p role="status">{message}</p> : null}</article><article className="operations-panel"><p className="eyebrow">Riwayat hold</p><h2>{holds.filter((hold) => !hold.releasedAt).length} aktif</h2>{holds.length ? <ol>{holds.map((hold) => <li key={hold.id}><strong>{assets.find((asset) => asset.id === hold.assetId)?.fileName ?? hold.assetId.slice(0, 8)}</strong><p>{hold.reason}</p><small>{hold.releasedAt ? `Dilepas ${new Date(hold.releasedAt).toLocaleString("id-ID")}` : `Aktif sejak ${new Date(hold.placedAt).toLocaleString("id-ID")}`}</small>{!hold.releasedAt ? <button className="button button--quiet" disabled={busy} onClick={() => { setReleaseId(hold.id); setReason(""); setAssetId(hold.assetId); }} type="button">Siapkan pelepasan</button> : null}</li>)}</ol> : <p>Belum ada hold.</p>}</article></section>;
}
