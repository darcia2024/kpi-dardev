"use client";

import { useCallback, useEffect, useState } from "react";

// Server error codes are for logs; people see plain Indonesian.
const errorMessages: Record<string, string> = {
  AUTHENTICATION_INVALID: "Isian belum sesuai atau tindakan ini tidak dapat dilakukan pada status sekarang.",
  AUTHENTICATION_REQUIRED: "Sesi berakhir. Masuk kembali untuk melanjutkan.",
  AUTHORIZATION_DENIED: "Tindakan ini tidak dapat dilakukan oleh akun Anda pada status sekarang.",
  CONFIGURATION_INVALID: "Layanan sedang tidak dapat memproses permintaan. Coba lagi beberapa saat.",
  CONFLICT: "Data ini baru saja diubah oleh orang lain. Muat ulang, lalu ulangi perubahan Anda.",
  SERVICE_NOT_READY: "Modul ini belum siap dipakai: pengaturan organisasi atau periode belum lengkap.",
  INTERNAL_ERROR: "Terjadi kesalahan pada layanan. Coba lagi beberapa saat.",
  MFA_REQUIRED: "Verifikasi dua langkah diperlukan sebelum melanjutkan.",
  SCANNER_UNAVAILABLE: "File sedang diperiksa dan belum dapat digunakan.",
  TEST_AUTH_DISABLED: "Mode pratinjau tidak aktif di lingkungan ini."
};

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
    const code = result?.error?.code ?? result?.code;
    throw new Error((code && errorMessages[code]) ?? `Permintaan gagal diproses (kode ${response.status}). Coba lagi.`);
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
