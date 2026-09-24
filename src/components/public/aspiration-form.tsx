"use client";

import { FormEvent, useState } from "react";

export function AspirationForm(): React.JSX.Element {
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");
  const [tracking, setTracking] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setMessage("");
    const response = await fetch("/api/v1/public/aspirations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: String(form.get("kind")).toUpperCase(), subject: form.get("subject"), description: form.get("description"), contact: form.get("contact"), consent: form.get("consent") === "on", website: form.get("website"), idempotencyKey: crypto.randomUUID() }) });
    setSubmitting(false);
    if (!response.ok) { setMessage("Pengiriman pratinjau tidak dapat diproses. Periksa isian lalu coba lagi."); return; }
    const result = await response.json() as { trackingToken: string };
    setToken(result.trackingToken);
    setSent(true);
  }

  async function checkTracking(): Promise<void> {
    const response = await fetch("/api/v1/public/aspirations/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trackingToken: token }) });
    if (!response.ok) { setTracking("Kode pelacakan tidak ditemukan atau data pratinjau sudah direset."); return; }
    const result = await response.json() as { tracking: { status: string; latestUpdate: string } };
    setTracking(`Status ${result.tracking.status}: ${result.tracking.latestUpdate}`);
  }

  if (sent) return <div className="submission-result" role="status"><p className="eyebrow">Pratinjau pengiriman</p><h2>Contoh aspirasi tersimpan secara lokal.</h2><p>Catatan ini hanya berada di lingkungan pengembangan. Tidak ada petugas atau tindak lanjut resmi yang terhubung.</p><div className="tracking-token">{token}</div><button className="button button--primary" onClick={checkTracking} type="button">Cek status pratinjau</button>{tracking ? <p className="form-success">{tracking}</p> : null}<button className="button button--quiet" onClick={() => { setSent(false); setTracking(""); }} type="button">Kirim contoh lain</button></div>;

  return <form className="public-form" onSubmit={submit}><input aria-hidden="true" autoComplete="off" className="sr-only" name="website" tabIndex={-1} type="text" /><label>Jenis aspirasi<select defaultValue="saran" name="kind"><option value="saran">Saran</option><option value="pertanyaan">Pertanyaan</option></select></label><label>Subjek<input name="subject" required type="text" /></label><label>Uraian<textarea minLength={20} name="description" required rows={6} /></label><label>Kontak (opsional)<input autoComplete="email" name="contact" type="email" /></label><label className="check-field"><input name="consent" required type="checkbox" /> Saya hanya memasukkan informasi contoh untuk meninjau alur ini.</label><button className="button button--primary" disabled={submitting} type="submit">{submitting ? "Menyimpan…" : "Kirim contoh aspirasi"}</button>{message ? <p className="form-message" role="alert">{message}</p> : null}</form>;
}
