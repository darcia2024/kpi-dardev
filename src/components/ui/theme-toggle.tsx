"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "kpi-theme";

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

export function ThemeToggle(): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(storageKey);
    const nextTheme: Theme = storedTheme === "dark" ||
      (storedTheme === null && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";

    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function toggleTheme(): void {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    window.localStorage.setItem(storageKey, nextTheme);
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      aria-pressed={theme === "dark"}
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
    >
      Tampilan: {theme === "dark" ? "Gelap" : "Terang"}
    </button>
  );
}
