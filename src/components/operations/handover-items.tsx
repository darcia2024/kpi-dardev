"use client";

import { useState } from "react";
import { IconAlertTriangle, IconCircleCheck, IconCircleDashed, IconClockHour4 } from "@tabler/icons-react";
import { apiJson } from "@/components/portal/api-client";

export type HandoverItem = { id: string; title: string; detail?: string; mandatory: boolean; status: "NOT_READY" | "READY" | "CLARIFICATION" | "ACCEPTED"; clarificationRequest?: string; clarificationResponse?: string };
type Package = { id: string; status: "PENDING" | "ACCEPTED" | "ARCHIVED"; outgoingOwnerAccountId: string; successorAccountId: string; items?: HandoverItem[] };

// Status always pairs an icon with text, never colour alone.
const statusView: Record<HandoverItem["status"], { label: string; icon: React.ReactNode }> = {
  NOT_READY: { label: "Belum siap", icon: <IconCircleDashed size={15} aria-hidden="true" /> },
  READY: { label: "Menunggu diperiksa", icon: <IconClockHour4 size={15} aria-hidden="true" /> },
  CLARIFICATION: { label: "Perlu klarifikasi", icon: <IconAlertTriangle size={15} aria-hidden="true" /> },
  ACCEPTED: { label: "Diterima", icon: <IconCircleCheck size={15} aria-hidden="true" /> }
};

export function blockingItems(record: Package): HandoverItem[] {
  return (record.items ?? []).filter((item) => item.mandatory && item.status !== "ACCEPTED");
}

export function HandoverItems({ record, accountId, canAct, onChanged }: { record: Package; accountId: string; canAct: boolean; onChanged: () => Promise<void> }): React.JSX.Element {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [mandatory, setMandatory] = useState(true);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const items = record.items ?? [];
  const accepted = items.filter((item) => item.status === "ACCEPTED").length;
  const isOutgoing = canAct && record.status === "PENDING" && record.outgoingOwnerAccountId === accountId;
  const isSuccessor = canAct && record.status === "PENDING" && record.successorAccountId === accountId;

  async function run(body: Record<string, unknown>, itemId?: string): Promise<void> {
    setBusy(true); setError("");
    try {
      await apiJson("/api/v1/handover", { handoverId: record.id, ...body });
      if (itemId) setTexts((current) => ({ ...current, [itemId]: "" }));
      if (body.action === "ADD_ITEM") { setTitle(""); setDetail(""); }
      await onChanged();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Item paket gagal diperbarui."); }
    finally { setBusy(false); }
  }

  return <section className="handover-items" aria-label="Isi paket serah terima">
    <div className="handover-items__head"><h3>Daftar item</h3><span>{items.length ? `${accepted} dari ${items.length} item diterima` : "Belum ada item"}</span></div>
    {items.length > 0 && <div className="handover-items__bar" aria-hidden="true"><span style={{ width: `${Math.round(accepted / items.length * 100)}%` }} /></div>}
    <ol>{items.map((item) => {
      const view = statusView[item.status];
      const text = texts[item.id] ?? "";
      return <li className={`handover-item handover-item--${item.status.toLowerCase()}`} key={item.id}>
        <div className="handover-item__main"><strong>{item.title}</strong><span>{item.mandatory ? "Wajib" : "Opsional"}{item.detail ? ` · ${item.detail}` : ""}</span></div>
        <span className="handover-item__status">{view.icon}{view.label}</span>
        {item.clarificationRequest && <div className="handover-item__thread"><p><b>Pertanyaan penerus:</b> {item.clarificationRequest}</p>{item.clarificationResponse && <p><b>Tanggapan pengurus lama:</b> {item.clarificationResponse}</p>}</div>}
        {isOutgoing && item.status === "NOT_READY" && <button className="button button--quiet" disabled={busy} onClick={() => void run({ action: "ITEM_READY", itemId: item.id })} type="button">Tandai siap diperiksa</button>}
        {isOutgoing && item.status === "CLARIFICATION" && <div className="handover-item__form"><label>Tanggapan<textarea maxLength={1000} onChange={(event) => setTexts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Tulis penjelasan…" rows={2} value={text} /></label><button className="button button--primary" disabled={busy || !text.trim()} onClick={() => void run({ action: "ITEM_READY", itemId: item.id, response: text }, item.id)} type="button">Kirim tanggapan</button></div>}
        {isSuccessor && item.status === "READY" && <div className="handover-item__form"><label>Pertanyaan (wajib bila minta klarifikasi)<textarea maxLength={1000} onChange={(event) => setTexts((current) => ({ ...current, [item.id]: event.target.value }))} rows={2} value={text} /></label><div className="portal-form-actions"><button className="button button--primary" disabled={busy} onClick={() => void run({ action: "ITEM_REVIEW", itemId: item.id, decision: "ACCEPT" }, item.id)} type="button">Terima item</button><button className="button button--quiet" disabled={busy || !text.trim()} onClick={() => void run({ action: "ITEM_REVIEW", itemId: item.id, decision: "CLARIFY", question: text }, item.id)} type="button">Minta klarifikasi</button></div></div>}
      </li>;
    })}</ol>
    {isOutgoing && <form className="handover-items__add" onSubmit={(event) => { event.preventDefault(); void run({ action: "ADD_ITEM", title, detail: detail || undefined, mandatory }); }}>
      <div className="portal-form-grid"><label>Item baru<input maxLength={180} onChange={(event) => setTitle(event.target.value)} placeholder="Contoh: Arsip surat masuk & keluar" value={title} /></label><label>Keterangan (opsional)<input maxLength={500} onChange={(event) => setDetail(event.target.value)} placeholder="Contoh: 142 berkas" value={detail} /></label></div>
      <div className="portal-form-actions"><label className="check-field"><input checked={mandatory} onChange={(event) => setMandatory(event.target.checked)} type="checkbox" /><span>Item wajib</span></label><button className="button button--quiet" disabled={busy || title.trim().length < 2} type="submit">Tambah item</button></div>
    </form>}
    {error && <p className="form-message" role="alert">{error}</p>}
  </section>;
}
