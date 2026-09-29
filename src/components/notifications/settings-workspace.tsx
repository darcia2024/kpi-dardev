"use client";

import { useEffect, useState } from "react";
import { apiJson } from "@/components/portal/api-client";
import type { NoticeTemplate } from "@/platform/notifications/settings-repository";

export function NotificationSettingsWorkspace({ accountId, canManageTemplates, canReviewTemplates }: { accountId: string; canManageTemplates: boolean; canReviewTemplates: boolean }): React.JSX.Element {
  const [optionalInApp, setOptionalInApp] = useState(true);
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [locale, setLocale] = useState<"id" | "en">("id");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void apiJson<{ preference: { optionalInApp: boolean }; templates: NoticeTemplate[] }>("/api/v1/notifications/settings")
      .then((result) => { setOptionalInApp(result.preference.optionalInApp); setTemplates(result.templates); })
      .catch(() => setMessage("Pengaturan belum dapat dimuat."));
  }, []);

  async function savePreference(next: boolean): Promise<void> {
    setBusy(true); setMessage("");
    try { await apiJson("/api/v1/notifications/settings", { action: "PREFERENCE", optionalInApp: next }); setOptionalInApp(next); setMessage("Preferensi tersimpan. Pemberitahuan wajib tetap masuk."); }
    catch { setMessage("Preferensi gagal disimpan."); }
    finally { setBusy(false); }
  }

  async function act(payload: Record<string, unknown>): Promise<void> {
    setBusy(true); setMessage("");
    try {
      const result = await apiJson<{ template: NoticeTemplate }>("/api/v1/notifications/settings", payload);
      setTemplates((items) => [result.template, ...items.filter((item) => item.id !== result.template.id)]);
      if (payload.action === "TEMPLATE_DRAFT") { setTitle(""); setBody(""); }
      setMessage(payload.action === "TEMPLATE_REVIEW" ? "Template ditelaah dalam pratinjau; belum aktif untuk pengiriman." : payload.action === "TEMPLATE_SUBMIT" ? "Template dikirim untuk telaah." : "Draf template tersimpan.");
    } catch { setMessage("Perubahan template gagal. Periksa izin dan statusnya."); }
    finally { setBusy(false); }
  }

  return <section className="document-detail-grid" aria-label="Pengaturan notifikasi">
    <article className="detail-panel"><p className="eyebrow">N02 · Preferensi</p><h2>Pemberitahuan dalam aplikasi</h2><p>Atur pemberitahuan pilihan. Penugasan dan pesan wajib tetap masuk ke kotak notifikasi Anda.</p><label className="check-field"><input type="checkbox" checked={optionalInApp} disabled={busy} onChange={(event) => void savePreference(event.target.checked)} /> Terima pemberitahuan pilihan dalam aplikasi</label></article>
    <article className="detail-panel"><p className="eyebrow">N03 · Template</p><h2>Template pesan</h2><p>Versi ID/EN ditelaah oleh akun berbeda. Template pratinjau tidak dipakai untuk pengiriman sebelum isi resmi KPI disahkan.</p>
      {canManageTemplates && <div className="editor-edit"><label>Kode template<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="contoh: pembaruan-kasus" /></label><label>Bahasa<select value={locale} onChange={(event) => setLocale(event.target.value as "id" | "en")}><option value="id">Indonesia</option><option value="en">English</option></select></label><label>Judul<input value={title} maxLength={180} onChange={(event) => setTitle(event.target.value)} /></label><label>Isi<textarea value={body} maxLength={2000} rows={3} onChange={(event) => setBody(event.target.value)} /></label><button className="button button--quiet" disabled={busy || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) || title.trim().length < 3 || body.trim().length < 10} onClick={() => void act({ action: "TEMPLATE_DRAFT", code, locale, title, body })} type="button">Simpan draf</button></div>}
      {canManageTemplates || canReviewTemplates ? <ol>{templates.map((item) => <li key={item.id}><strong>{item.code} · {item.locale.toUpperCase()} · v{item.version}</strong><p>{item.title} · {item.status === "DRAFT" ? "Draf" : item.status === "IN_REVIEW" ? "Menunggu telaah" : "Sudah ditelaah"}</p>{canManageTemplates && item.authorAccountId === accountId && item.status === "DRAFT" && <button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "TEMPLATE_SUBMIT", templateId: item.id })} type="button">Kirim untuk telaah</button>}{canReviewTemplates && item.authorAccountId !== accountId && item.status === "IN_REVIEW" && <button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "TEMPLATE_REVIEW", templateId: item.id })} type="button">Tandai sudah ditelaah</button>}</li>)}</ol> : <p>Pengelolaan template hanya untuk akun berizin.</p>}
    </article>{message && <p role="status">{message}</p>}
  </section>;
}
