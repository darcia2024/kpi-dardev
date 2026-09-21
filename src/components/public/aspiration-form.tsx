"use client";

import { FormEvent, useState } from "react";

export function AspirationForm(): React.JSX.Element {
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState("");

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setToken(`TEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
    setSent(true);
  }

  if (sent) return <div className="submission-result" role="status"><p className="eyebrow">Pratinjau pengiriman</p><h2>Aspirasi TEST tercatat di alur simulasi.</h2><p>Simpan token ini untuk mencoba bentuk halaman tracking. Belum ada petugas atau catatan kasus produksi yang menerima kiriman ini.</p><div className="tracking-token">{token}</div><button className="button button--quiet" onClick={() => setSent(false)} type="button">Kirim contoh lain</button></div>;

  return <form className="public-form" onSubmit={submit}><label>Jenis aspirasi<select defaultValue="saran"><option value="saran">Saran</option><option value="pertanyaan">Pertanyaan</option><option value="pengaduan">Pengaduan</option></select></label><label>Subjek<input name="subject" required type="text" /></label><label>Uraian<textarea name="description" required rows={6} /></label><label>Kontak (opsional)<input autoComplete="email" name="contact" type="email" /></label><label className="check-field"><input name="consent" required type="checkbox" /> Saya memahami ini adalah simulasi TEST.</label><button className="button button--primary" type="submit">Tinjau dan buat token TEST</button></form>;
}
