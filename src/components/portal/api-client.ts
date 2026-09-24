"use client";

import { useCallback, useEffect, useState } from "react";

export async function apiJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    credentials: "same-origin",
    cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  if (!response.ok) {
    const result = await response.json().catch(() => null) as { error?: { code?: string }; code?: string } | null;
    if (response.status === 401) throw new Error("Sesi berakhir. Masuk kembali untuk melanjutkan.");
    if (response.status === 403) throw new Error("Akun ini tidak memiliki izin untuk tindakan tersebut.");
    throw new Error(result?.error?.code ?? result?.code ?? `Permintaan gagal (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

export function usePortalResource<T>(url: string, key: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await apiJson<Record<string, T[]>>(url);
      setItems(result[key] ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [url, key]);
  useEffect(() => { void reload(); }, [reload]);
  return { items, loading, error, setError, reload };
}
