"use client";

import { useCallback, useEffect, useState } from "react";
import { apiJson } from "@/components/portal/api-client";
import type { InternalMessage } from "@/platform/notifications/internal-communication-service";

type Recipient = { accountId: string; name: string };
export function InternalCommunicationsWorkspace({ accountId, canCreate, canReview }: { accountId: string; canCreate: boolean; canReview: boolean }): React.JSX.Element {
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [kind, setKind] = useState<"ANNOUNCEMENT" | "DIRECT">("ANNOUNCEMENT");
  const [recipientAccountIds, setRecipientAccountIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const reload = useCallback(async () => { const data = await apiJson<{ messages: InternalMessage[]; recipients: Recipient[] }>("/api/v1/cases/communications"); setMessages(data.messages); setRecipients(data.recipients); }, []);
  useEffect(() => { void reload().catch(() => setNotice("Daftar komunikasi belum dapat dimuat.")); }, [reload]);
  async function act(payload: unknown, success: string): Promise<void> {
    setBusy(true); setNotice("");
    try { await apiJson("/api/v1/cases/communications", payload); await reload(); setNotice(success); if ((payload as { action?: string }).action === "CREATE") { setTitle(""); setBody(""); setRecipientAccountIds([]); } }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Perubahan pesan gagal."); }
    finally { setBusy(false); }
  }
  return <section className="document-detail-grid" aria-label="Komunikasi internal"><article className="detail-panel"><p className="eyebrow">S05–S06 · Komunikasi internal</p><h2>Pesan dengan penerima jelas</h2><p>Draf perlu diperiksa oleh akun lain sebelum muncul di kotak masuk penerima. Pengumuman dapat diperiksa editor; pesan terarah memerlukan petugas kasus kedua yang berizin. Tidak ada pengiriman ke kanal luar.</p>{canCreate ? <><label>Jenis<select value={kind} onChange={(event) => { setKind(event.target.value as "ANNOUNCEMENT" | "DIRECT"); setRecipientAccountIds([]); }}><option value="ANNOUNCEMENT">Pengumuman internal</option><option value="DIRECT">Pesan terarah</option></select></label><label>Judul<input maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Isi<textarea maxLength={2000} rows={4} value={body} onChange={(event) => setBody(event.target.value)} /></label><fieldset><legend>Penerima</legend>{recipients.filter((person) => person.accountId !== accountId).map((person) => <label className="check-field" key={person.accountId}><input type={kind === "DIRECT" ? "radio" : "checkbox"} name={kind === "DIRECT" ? "message-recipient" : undefined} checked={recipientAccountIds.includes(person.accountId)} onChange={(event) => setRecipientAccountIds(kind === "DIRECT" ? [person.accountId] : event.target.checked ? [...recipientAccountIds, person.accountId] : recipientAccountIds.filter((id) => id !== person.accountId))} />{person.name}</label>)}</fieldset><button className="button button--quiet" disabled={busy || title.trim().length < 3 || body.trim().length < 10 || recipientAccountIds.length === 0} onClick={() => void act({ action: "CREATE", kind, title, body, recipientAccountIds }, "Draf tersimpan. Ajukan untuk diperiksa sebelum diterima penerima.")} type="button">Simpan draf</button></> : <p>Persetujuan pengumuman tersedia untuk akun pemeriksa.</p>}</article><article className="detail-panel"><p className="eyebrow">Antrean persetujuan</p><h2>{messages.length} pesan</h2>{messages.length === 0 ? <p>Belum ada draf atau pesan yang menunggu pemeriksaan.</p> : <ol>{messages.map((message) => <li key={message.id}><strong>{message.title}</strong><p>{message.body}</p><small>{message.kind === "ANNOUNCEMENT" ? "Pengumuman" : "Pesan terarah"} · {message.recipientAccountIds.length} penerima · {message.status === "DRAFT" ? "Draf" : message.status === "IN_REVIEW" ? "Menunggu persetujuan" : "Terkirim di aplikasi"}</small><div className="task-detail__actions">{message.status === "DRAFT" && message.authorAccountId === accountId ? <button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "SUBMIT", id: message.id }, "Pesan diajukan untuk pemeriksaan.")} type="button">Ajukan pemeriksaan</button> : null}{message.status === "IN_REVIEW" && message.authorAccountId !== accountId && canReview ? <button className="button button--primary" disabled={busy} onClick={() => void act({ action: "APPROVE", id: message.id }, "Pesan disetujui dan masuk ke kotak penerima.")} type="button">Setujui dan kirim dalam aplikasi</button> : null}</div></li>)}</ol>}</article>{notice ? <p role="status">{notice}</p> : null}</section>;
}
