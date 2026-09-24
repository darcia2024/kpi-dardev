"use client";

import { useEffect, useState } from "react";
import { apiJson, usePortalResource } from "@/components/portal/api-client";
import type { FormDraft, FormField, FormValidation } from "@/platform/intake/local-form-service";

export function ServiceFormWorkspace(): React.JSX.Element {
  const forms = usePortalResource<FormDraft>("/api/v1/cases/forms", "forms");
  const [selectedId, setSelectedId] = useState("");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [consentText, setConsentText] = useState("");
  const [fields, setFields] = useState<FormField[]>([{ key: "", label: "", type: "text", required: true }]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [validation, setValidation] = useState<FormValidation | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const selected = forms.items.find((form) => form.id === selectedId);
  useEffect(() => { if (selected) { setCode(selected.code); setTitle(selected.title); setConsentText(selected.consentText); setFields(selected.fields); setValues({}); setConsent(false); setValidation(null); } }, [selected?.id, selected?.version]);
  function updateField(index: number, patch: Partial<FormField>): void { setFields((items) => items.map((field, at) => at === index ? { ...field, ...patch } : field)); }
  async function save(): Promise<void> {
    setBusy(true); setMessage("");
    try { const result = await apiJson<{ form: FormDraft }>("/api/v1/cases/forms", { action: "SAVE", ...(selected ? { id: selected.id, expectedVersion: selected.version } : {}), code, title, consentText, fields }); await forms.reload(); setSelectedId(result.form.id); setMessage("Draf form tersimpan. Belum tersedia untuk publik."); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Form gagal disimpan."); }
    finally { setBusy(false); }
  }
  async function validate(): Promise<void> {
    if (!selected) return;
    setBusy(true); setMessage("");
    try { const result = await apiJson<{ validation: FormValidation }>("/api/v1/cases/forms", { action: "VALIDATE", id: selected.id, values, consent }); setValidation(result.validation); setMessage(result.validation.valid ? "Validasi pratinjau lulus. Jawaban tidak disimpan." : "Ada isian yang perlu diperbaiki."); }
    catch (cause) { setMessage(cause instanceof Error ? cause.message : "Validasi gagal."); }
    finally { setBusy(false); }
  }
  return <section className="document-detail-grid" aria-label="Rancangan form layanan"><article className="detail-panel"><p className="eyebrow">S07 · Form layanan</p><h2>Rancang form berversi</h2><p>Susun draf dan uji validasi. Teks persetujuan resmi diperlukan sebelum form dapat dipublikasikan.</p>{forms.error ? <p role="alert">{forms.error}</p> : null}<label>Pilih draf<select value={selectedId} onChange={(event) => { const id = event.target.value; setSelectedId(id); if (!id) { setCode(""); setTitle(""); setConsentText(""); setFields([{ key: "", label: "", type: "text", required: true }]); setValues({}); setConsent(false); setValidation(null); } }}><option value="">Form baru</option>{forms.items.map((form) => <option key={form.id} value={form.id}>{form.title} · v{form.version}</option>)}</select></label><label>Kode<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="layanan-kpi" /></label><label>Judul<input value={title} maxLength={180} onChange={(event) => setTitle(event.target.value)} /></label><label>Teks persetujuan pemrosesan data<textarea value={consentText} maxLength={1000} rows={3} onChange={(event) => setConsentText(event.target.value)} /></label><fieldset><legend>Kolom form</legend>{fields.map((field, index) => <div className="editor-edit" key={index}><label>Kunci<input value={field.key} placeholder="nama_pelapor" onChange={(event) => updateField(index, { key: event.target.value })} /></label><label>Label<input value={field.label} onChange={(event) => updateField(index, { label: event.target.value })} /></label><label>Jenis<select value={field.type} onChange={(event) => updateField(index, { type: event.target.value as FormField["type"] })}><option value="text">Teks</option><option value="email">Email</option><option value="textarea">Uraian</option></select></label><label className="check-field"><input checked={field.required} type="checkbox" onChange={(event) => updateField(index, { required: event.target.checked })} /> Wajib diisi</label><button className="button button--quiet" disabled={fields.length === 1} onClick={() => setFields((items) => items.filter((_, at) => at !== index))} type="button">Hapus kolom</button></div>)}</fieldset><button className="button button--quiet" disabled={fields.length >= 12} onClick={() => setFields((items) => [...items, { key: "", label: "", type: "text", required: true }])} type="button">Tambah kolom</button> <button className="button button--primary" disabled={busy || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(code) || title.trim().length < 3 || consentText.trim().length < 20 || fields.some((field) => !/^[a-z][a-z0-9_]{1,39}$/.test(field.key) || field.label.trim().length < 2)} onClick={() => void save()} type="button">Simpan draf</button></article><article className="detail-panel"><p className="eyebrow">Pratinjau validasi</p><h2>{selected?.title ?? "Pilih draf tersimpan"}</h2>{selected ? <>{selected.fields.map((field) => <label key={field.key}>{field.label}{field.required ? " *" : ""}{field.type === "textarea" ? <textarea rows={3} value={values[field.key] ?? ""} onChange={(event) => setValues((old) => ({ ...old, [field.key]: event.target.value }))} /> : <input type={field.type} value={values[field.key] ?? ""} onChange={(event) => setValues((old) => ({ ...old, [field.key]: event.target.value }))} />}{validation?.errors[field.key] ? <small role="alert">{validation.errors[field.key]}</small> : null}</label>)}<label className="check-field"><input checked={consent} type="checkbox" onChange={(event) => setConsent(event.target.checked)} />{selected.consentText}</label>{validation?.errors.consent ? <p role="alert">{validation.errors.consent}</p> : null}<button className="button button--quiet" disabled={busy} onClick={() => void validate()} type="button">Uji validasi</button><p>Uji ini tidak mengirim atau menyimpan jawaban.</p></> : <p>Belum ada form yang dipilih.</p>}{message ? <p role="status">{message}</p> : null}</article></section>;
}
