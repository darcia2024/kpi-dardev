"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton(): React.JSX.Element {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  async function signOut(): Promise<void> {
    setPending(true);
    setError(false);
    try {
      const response = await fetch("/api/v1/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign-out failed");
      router.replace("/masuk");
      router.refresh();
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return <span><button className="button button--quiet" disabled={pending} onClick={signOut} type="button">{pending ? "Keluar…" : "Keluar"}</button>{error ? <span role="alert">Gagal keluar. Coba lagi.</span> : null}</span>;
}
