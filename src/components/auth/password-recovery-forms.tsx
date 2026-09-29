"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const rules = [
  { test: (value: string) => value.length >= 12, label: "Minimal 12 karakter" },
  { test: (value: string) => /[A-Za-z]/.test(value), label: "Memuat huruf" },
  { test: (value: string) => /\d/.test(value), label: "Memuat angka" }
];

export function RecoveryRequestForm(): React.JSX.Element {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ message: string; previewLink?: string } | null>(null);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true); setError("");
    try {
      const response = await fetch("/api/v1/auth/recovery", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "REQUEST", email: new FormData(event.currentTarget).get("email") }) });
      if (!response.ok) { setError(response.status >= 500 ? "Layanan pemulihan sedang tidak tersedia. Coba lagi nanti." : "Periksa kembali format email."); return; }
      setResult(await response.json());
    } catch { setError("Koneksi terputus. Coba lagi."); }
    finally { setPending(false); }
  }

  if (result) return <div className="auth-form" role="status">
    <p className="auth-recovery__done">{result.message}</p>
    {result.previewLink && <div className="auth-recovery__preview"><strong>Pratinjau lokal</strong><span>Kanal email belum aktif, jadi tautan yang akan dikirim ditampilkan di sini.</span><Link className="button button--quiet" href={result.previewLink}>Buka tautan pemulihan</Link></div>}
    <Link className="auth-form__link" href="/masuk">Kembali ke halaman masuk</Link>
  </div>;

  return <form className="auth-form" onSubmit={submit}>
    <label>Email akun pengurus<input autoComplete="username" name="email" required type="email" /></label>
    {error && <p className="form-message" role="alert">{error}</p>}
    <button className="button button--primary" disabled={pending} type="submit">{pending ? "Mengirim…" : "Kirim tautan pemulihan"}</button>
    <Link className="auth-form__link" href="/masuk">Kembali ke halaman masuk</Link>
  </form>;
}

export function ResetPasswordForm({ token }: { token: string }): React.JSX.Element {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const valid = rules.every((rule) => rule.test(password)) && password === confirm;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!valid) return;
    setPending(true); setError("");
    try {
      const response = await fetch("/api/v1/auth/recovery", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "RESET", token, password }) });
      if (response.ok) { setDone(true); return; }
      setError(response.status === 422 ? "Kata sandi belum memenuhi syarat." : response.status >= 500 ? "Layanan pemulihan sedang tidak tersedia." : "Tautan pemulihan tidak berlaku atau sudah digunakan. Minta tautan baru.");
    } catch { setError("Koneksi terputus. Coba lagi."); }
    finally { setPending(false); }
  }

  if (!token) return <div className="auth-form"><p className="form-message" role="alert">Tautan pemulihan tidak lengkap.</p><Link className="button button--quiet" href="/masuk/lupa-sandi">Minta tautan baru</Link></div>;
  if (done) return <div className="auth-form" role="status"><p className="auth-recovery__done">Kata sandi diperbarui. Semua sesi lama sudah dikeluarkan, jadi silakan masuk kembali.</p><Link className="button button--primary" href="/masuk">Masuk ke portal</Link></div>;

  return <form className="auth-form" onSubmit={submit}>
    <label>Kata sandi baru<input autoComplete="new-password" maxLength={128} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
    <ul className="auth-rules">{rules.map((rule) => <li className={rule.test(password) ? "is-ok" : ""} key={rule.label}>{rule.test(password) ? "✓" : "•"} {rule.label}</li>)}<li className={password && password === confirm ? "is-ok" : ""}>{password && password === confirm ? "✓" : "•"} Konfirmasi sama</li></ul>
    <label>Ulangi kata sandi baru<input autoComplete="new-password" maxLength={128} onChange={(event) => setConfirm(event.target.value)} required type="password" value={confirm} /></label>
    {error && <p className="form-message" role="alert">{error}</p>}
    <button className="button button--primary" disabled={pending || !valid} type="submit">{pending ? "Menyimpan…" : "Simpan kata sandi baru"}</button>
  </form>;
}
