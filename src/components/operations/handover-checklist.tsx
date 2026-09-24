"use client";

import { useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";

type ChecklistItem = { id: string; title: string; ownerAccountId: string; dueAt: string; status: "OPEN" | "DONE"; completedAt?: string };

export function HandoverChecklist({ accountId, canManage }: { accountId: string; canManage: boolean }): React.JSX.Element {
  const items = usePortalResource<ChecklistItem>("/api/v1/handover/checklist", "items");
  const [title, setTitle] = useState("");
  const [ownerAccountId, setOwnerAccountId] = useState(accountId);
  const [dueAt, setDueAt] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function act(body: Record<string, unknown>, success: string): Promise<void> {
    setBusy(true); setMessage("");
    try {
      await apiJson("/api/v1/handover/checklist", body);
      if (body.action === "CREATE") { setTitle(""); setDueAt(""); }
      if (body.action === "COMPLETE") setReasons((current) => ({ ...current, [String(body.itemId)]: "" }));
      await items.reload();
      setMessage(success);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Checklist gagal diperbarui."); }
    finally { setBusy(false); }
  }

  return <section className="operations-panel" aria-label="Checklist operasi">
    <p className="eyebrow">H05 · Checklist operasi</p><h2>Tindak lanjut serah terima</h2>
    <p>Setiap butir punya penanggung jawab dan tenggat. Pemilik mencatat alasan saat menandai selesai.</p>
    {message && <p className="form-message" role="status">{message}</p>}
    {items.loading && <p role="status">Memuat checklist…</p>}
    {items.error && <p role="alert">{items.error} <button onClick={() => void items.reload()} type="button">Coba lagi</button></p>}
    {!items.loading && !items.error && items.items.length === 0 && <p>Belum ada butir tindak lanjut.</p>}
    {items.items.map((item) => <div className="knowledge-row" key={item.id}>
      <div><strong>{item.title}</strong><p>{item.status === "DONE" ? "Selesai" : "Terbuka"} · Penanggung jawab: {item.ownerAccountId === accountId ? "Saya" : "Akun pratinjau lain"} · Tenggat {new Date(item.dueAt).toLocaleString("id-ID", { timeZone: "Africa/Cairo", dateStyle: "medium", timeStyle: "short" })} waktu Kairo</p></div>
      {canManage && item.status === "OPEN" && item.ownerAccountId === accountId && <div className="task-detail__actions"><label>Catatan penyelesaian<input maxLength={500} value={reasons[item.id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [item.id]: event.target.value }))} /></label><button className="button button--quiet" disabled={busy || (reasons[item.id] ?? "").trim().length < 3} onClick={() => void act({ action: "COMPLETE", itemId: item.id, reason: reasons[item.id] }, "Butir checklist selesai.")} type="button">Tandai selesai</button></div>}
    </div>)}
    {canManage && <div className="task-toolbar" aria-label="Tambah checklist"><label>Butir baru<input maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Penanggung jawab<select value={ownerAccountId} onChange={(event) => setOwnerAccountId(event.target.value)}><option value="00000000-0000-4000-8000-000000000101">Admin pratinjau</option><option value="00000000-0000-4000-8000-000000000102">Pengurus pratinjau</option></select></label><label>Tenggat (waktu perangkat)<input type="datetime-local" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label><button className="button button--primary" disabled={busy || title.trim().length < 3 || !dueAt || !Number.isFinite(Date.parse(dueAt)) || Date.parse(dueAt) <= Date.now()} onClick={() => void act({ action: "CREATE", title, ownerAccountId, dueAt: new Date(dueAt).toISOString() }, "Butir checklist tersimpan.")} type="button">Tambah butir</button></div>}
  </section>;
}
