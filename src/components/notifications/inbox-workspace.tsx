"use client";

import Link from "next/link";
import { useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import type { InboxNotice } from "@/platform/notifications/inbox-service";

export function InboxWorkspace(): React.JSX.Element {
  const notices = usePortalResource<InboxNotice>("/api/v1/notifications/inbox", "notices");
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  async function markRead(noticeId: string): Promise<void> {
    setBusyId(noticeId); setActionError("");
    try { await apiJson("/api/v1/notifications/inbox", { action: "MARK_READ", noticeId }); await notices.reload(); }
    catch (cause) { setActionError(cause instanceof Error ? cause.message : "Status baca gagal disimpan."); }
    finally { setBusyId(""); }
  }
  return <section aria-labelledby="inbox-title" className="inbox-panel"><div className="inbox-panel__head"><div><p className="eyebrow">N01 · Kotak masuk</p><h2 id="inbox-title">Untuk akun Anda</h2></div><span>{notices.items.length} pemberitahuan</span></div>
    {actionError && <p role="alert">{actionError}</p>}
    {notices.loading ? <p role="status">Memuat kotak masuk…</p> : notices.error ? <p role="alert">{notices.error} <button className="button button--quiet" onClick={() => void notices.reload()} type="button">Coba lagi</button></p> : notices.items.length ? <ol>{notices.items.map((notice) => <li key={notice.id}><div><strong>{notice.title}</strong><p>{notice.description}</p><time dateTime={notice.createdAt}>{new Date(notice.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo" })} waktu Kairo</time><small className="inbox-panel__read-state">{notice.readAt ? "Sudah dibaca" : "Belum dibaca"}</small></div><div className="inbox-panel__actions">{!notice.readAt && <button className="button button--quiet" disabled={!!busyId} onClick={() => void markRead(notice.id)} type="button">{busyId === notice.id ? "Menyimpan…" : "Tandai dibaca"}</button>}{notice.id.startsWith("task-assigned:") ? <Link href={notice.href}>Buka tugas <span aria-hidden="true">↗</span></Link> : null}</div></li>)}</ol> : <p className="inbox-panel__empty">Belum ada pesan atau penugasan untuk Anda pada periode ini.</p>}
  </section>;
}
