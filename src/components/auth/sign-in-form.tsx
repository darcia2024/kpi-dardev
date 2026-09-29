"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Step = "credentials" | "mfa";

export function SignInForm({ mode = "local" }: { mode?: "local" | "hosted" }): React.JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [challengeId, setChallengeId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function submitCredentials(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setMessage("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/v1/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") })
      });
      const body = await response.json();
      if (!response.ok) return setMessage(response.status >= 500 ? "Layanan masuk sedang tidak tersedia. Coba lagi nanti." : "Email atau kata sandi tidak sesuai, atau akun belum diaktifkan.");
      if (body.next === "PORTAL") {
        router.replace("/portal");
        router.refresh();
        return;
      }
      setChallengeId(body.challengeId);
      setStep("mfa");
    } catch {
      setMessage("Koneksi terputus. Coba lagi.");
    } finally {
      setPending(false);
    }
  }

  async function submitMfa(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/auth/verify-mfa", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId, code: form.get("code") })
    });
    setPending(false);
    if (!response.ok) return setMessage("Kode verifikasi tidak sesuai atau sudah kedaluwarsa.");
    router.replace("/portal");
    router.refresh();
  }

  return step === "credentials" ? (
    <form className="auth-form" onSubmit={submitCredentials}>
      <label>Email<input autoComplete="username" name="email" required type="email" /></label>
      <label>Kata sandi<input autoComplete="current-password" name="password" required type="password" /></label>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <button className="button button--primary" disabled={pending} type="submit">{pending ? "Memeriksa" : mode === "hosted" ? "Masuk ke portal" : "Lanjut ke MFA"}</button>
      <Link className="auth-form__link" href="/masuk/lupa-sandi">Lupa kata sandi?</Link>
    </form>
  ) : (
    <form className="auth-form" onSubmit={submitMfa}>
      <label>Kode verifikasi<input autoComplete="one-time-code" inputMode="numeric" maxLength={6} name="code" pattern="[0-9]{6}" required /></label>
      {message ? <p className="form-message" role="alert">{message}</p> : null}
      <button className="button button--primary" disabled={pending} type="submit">{pending ? "Memverifikasi" : "Masuk ke portal"}</button>
    </form>
  );
}
