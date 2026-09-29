"use client";

import { useEffect, useState } from "react";
import { IconLock, IconMoon } from "@tabler/icons-react";
import { apiJson } from "@/components/portal/api-client";
import { isWithinQuietHours } from "@/platform/notifications/quiet-hours";
import type { NoticePreference, NoticePreferenceChange, NoticeTemplate } from "@/platform/notifications/settings-repository";

const switches: Array<{ key: "optionalInApp" | "taskReminders" | "announcements" | "emailDigest"; label: string; hint: string }> = [
  { key: "taskReminders", label: "Pengingat tenggat tugas", hint: "Pengingat sebelum tenggat tugas Anda." },
  { key: "announcements", label: "Pengumuman umum", hint: "Kabar organisasi yang tidak memerlukan tindakan." },
  { key: "optionalInApp", label: "Pemberitahuan pilihan lainnya", hint: "Info tambahan di kotak masuk aplikasi." },
  { key: "emailDigest", label: "Ringkasan harian lewat email", hint: "Tersimpan sebagai pilihan; baru dikirim setelah kanal email disetujui KPI." }
];

export function NotificationSettingsWorkspace({ accountId, canManageTemplates, canReviewTemplates }: { accountId: string; canManageTemplates: boolean; canReviewTemplates: boolean }): React.JSX.Element {
  const [preference, setPreference] = useState<NoticePreference | null>(null);
  const [quietStart, setQuietStart] = useState("23:00");
  const [quietEnd, setQuietEnd] = useState("06:00");
  const [templates, setTemplates] = useState<NoticeTemplate[]>([]);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [locale, setLocale] = useState<"id" | "en">("id");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void apiJson<{ preference: NoticePreference; templates: NoticeTemplate[] }>("/api/v1/notifications/settings")
      .then((result) => { setPreference(result.preference); setQuietStart(result.preference.quietHours.start); setQuietEnd(result.preference.quietHours.end); setTemplates(result.templates); })
      .catch(() => setMessage("Pengaturan belum dapat dimuat."));
  }, []);

  async function savePreference(change: NoticePreferenceChange): Promise<void> {
    setBusy(true); setMessage("");
    try { const result = await apiJson<{ preference: NoticePreference }>("/api/v1/notifications/settings", { action: "PREFERENCE", ...change }); setPreference(result.preference); setMessage("Preferensi tersimpan. Pemberitahuan wajib tetap masuk."); }
    catch { setMessage("Preferensi gagal disimpan."); }
    finally { setBusy(false); }
  }
  const quiet = preference?.quietHours;
  const quietNow = quiet ? isWithinQuietHours(quiet, new Date()) : false;

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
    <article className="detail-panel"><p className="eyebrow">N02 · Preferensi</p><h2>Preferensi notifikasi</h2><p>Atur pemberitahuan pilihan. Penugasan dan pesan wajib tetap masuk ke kotak notifikasi Anda.</p>
      {!preference ? <p>Memuat preferensi…</p> : <>
        <div className="notice-prefs">{switches.map((item) => <label className="check-field notice-pref" key={item.key}><input checked={preference[item.key]} disabled={busy} onChange={(event) => void savePreference({ [item.key]: event.target.checked })} type="checkbox" /><span><strong>{item.label}</strong><small>{item.hint}</small></span></label>)}
          <div className="notice-pref notice-pref--locked"><IconLock size={18} aria-hidden="true" /><span><strong>Persetujuan & keamanan akun</strong><small>Wajib, jadi tidak bisa dimatikan.</small></span></div></div>
        <fieldset className="notice-quiet"><legend><IconMoon size={16} aria-hidden="true" />Jam tenang</legend>
          <label className="check-field"><input checked={preference.quietHours.enabled} disabled={busy} onChange={(event) => void savePreference({ quietHours: { enabled: event.target.checked, start: quietStart, end: quietEnd } })} type="checkbox" /><span>Tahan pemberitahuan pilihan di kanal luar selama jam tenang</span></label>
          <div className="portal-form-grid"><label>Mulai<input onChange={(event) => setQuietStart(event.target.value)} type="time" value={quietStart} /></label><label>Selesai<input onChange={(event) => setQuietEnd(event.target.value)} type="time" value={quietEnd} /></label></div>
          <div className="portal-form-actions"><button className="button button--quiet" disabled={busy || !quietStart || !quietEnd || quietStart === quiet?.start && quietEnd === quiet?.end} onClick={() => void savePreference({ quietHours: { enabled: preference.quietHours.enabled, start: quietStart, end: quietEnd } })} type="button">Simpan jam</button><small className="notice-quiet__state">{quiet?.enabled ? quietNow ? "Jam tenang sedang berlaku (waktu Kairo)." : `Berlaku ${quiet.start}–${quiet.end} waktu Kairo.` : "Nonaktif."}</small></div>
          <p>Kotak masuk aplikasi tetap menerima semua pemberitahuan. Notifikasi wajib tetap dikirim.</p>
        </fieldset>
      </>}
    </article>
    <article className="detail-panel"><p className="eyebrow">N03 · Template</p><h2>Template pesan</h2><p>Versi ID/EN ditelaah oleh akun berbeda. Template pratinjau tidak dipakai untuk pengiriman sebelum isi resmi KPI disahkan.</p>
      {canManageTemplates && <div className="editor-edit"><label>Kode template<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="contoh: pembaruan-kasus" /></label><label>Bahasa<select value={locale} onChange={(event) => setLocale(event.target.value as "id" | "en")}><option value="id">Indonesia</option><option value="en">English</option></select></label><label>Judul<input value={title} maxLength={180} onChange={(event) => setTitle(event.target.value)} /></label><label>Isi<textarea value={body} maxLength={2000} rows={3} onChange={(event) => setBody(event.target.value)} /></label><button className="button button--quiet" disabled={busy || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) || title.trim().length < 3 || body.trim().length < 10} onClick={() => void act({ action: "TEMPLATE_DRAFT", code, locale, title, body })} type="button">Simpan draf</button></div>}
      {canManageTemplates || canReviewTemplates ? templates.length === 0 ? <p className="portal-note">Belum ada template tersimpan.</p> : <ol className="notice-template-list">{templates.map((item) => <li key={item.id}><strong>{item.code} · {item.locale.toUpperCase()} · v{item.version}</strong><p>{item.title} · {item.status === "DRAFT" ? "Draf" : item.status === "IN_REVIEW" ? "Menunggu telaah" : "Sudah ditelaah"}</p>{canManageTemplates && item.authorAccountId === accountId && item.status === "DRAFT" && <button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "TEMPLATE_SUBMIT", templateId: item.id })} type="button">Kirim untuk telaah</button>}{canReviewTemplates && item.authorAccountId !== accountId && item.status === "IN_REVIEW" && <button className="button button--quiet" disabled={busy} onClick={() => void act({ action: "TEMPLATE_REVIEW", templateId: item.id })} type="button">Tandai sudah ditelaah</button>}</li>)}</ol> : <p>Pengelolaan template hanya untuk akun berizin.</p>}
    </article>{message && <p className="form-message" role="status">{message}</p>}
  </section>;
}
