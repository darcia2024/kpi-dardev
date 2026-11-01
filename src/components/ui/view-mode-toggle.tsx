"use client";

import { useEffect, useState } from "react";
import { IconDeviceDesktop, IconDeviceMobile } from "@tabler/icons-react";
import { desktopViewport, mobileViewport, viewModeStorageKey as storageKey } from "@/lib/view-mode";

type ViewMode = "mobile" | "desktop";

function applyViewMode(mode: ViewMode): void {
  const content = mode === "desktop" ? desktopViewport : mobileViewport;
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="viewport"]');
  if (metas.length === 0) { const meta = document.createElement("meta"); meta.name = "viewport"; meta.content = content; document.head.append(meta); }
  metas.forEach((meta) => { if (meta.content !== content) meta.content = content; });
}

function readStoredMode(): ViewMode {
  try { return window.localStorage.getItem(storageKey) === "desktop" ? "desktop" : "mobile"; } catch { return "mobile"; }
}

/** Pilihan tampilan HP atau desktop. Hanya muncul di layar kecil; di laptop selalu tampilan desktop. */
export function ViewModeToggle({ className }: { className?: string }): React.JSX.Element | null {
  const [mode, setMode] = useState<ViewMode | null>(null);

  useEffect(() => {
    // screen.width tetap lebar layar fisik walaupun viewport sedang dipaksa 1280.
    if (window.screen.width >= 900) return;
    const current = readStoredMode();
    applyViewMode(current);
    setMode(current);
  }, []);

  // Next.js menulis ulang meta viewport saat pindah halaman; pasang lagi pilihan pengguna setiap kali itu terjadi.
  useEffect(() => {
    if (window.screen.width >= 900) return;
    const observer = new MutationObserver(() => applyViewMode(readStoredMode()));
    observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ["content"] });
    return () => observer.disconnect();
  }, []);

  if (!mode) return null;

  function toggle(): void {
    const next: ViewMode = mode === "desktop" ? "mobile" : "desktop";
    try { if (next === "desktop") window.localStorage.setItem(storageKey, next); else window.localStorage.removeItem(storageKey); } catch {}
    applyViewMode(next);
    setMode(next);
    window.scrollTo(0, 0);
  }

  return <button className={`view-mode-toggle${className ? ` ${className}` : ""}`} onClick={toggle} type="button" title={mode === "desktop" ? "Kembali ke tampilan HP" : "Tampilkan versi desktop"}>
    {mode === "desktop" ? <IconDeviceMobile aria-hidden="true" size={17} stroke={1.8} /> : <IconDeviceDesktop aria-hidden="true" size={17} stroke={1.8} />}
    {mode === "desktop" ? "Tampilan HP" : "Tampilan desktop"}
  </button>;
}
