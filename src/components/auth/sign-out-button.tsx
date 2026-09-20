"use client";

import { useRouter } from "next/navigation";

export function SignOutButton(): React.JSX.Element {
  const router = useRouter();

  async function signOut(): Promise<void> {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.replace("/masuk");
    router.refresh();
  }

  return <button className="button button--quiet" onClick={signOut} type="button">Keluar</button>;
}
