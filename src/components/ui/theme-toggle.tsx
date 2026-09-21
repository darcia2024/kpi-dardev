"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

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
      {theme === "dark" ? <IconMoon aria-hidden="true" className="nav-icon" size={17} stroke={1.8} /> : <IconSun aria-hidden="true" className="nav-icon" size={17} stroke={1.8} />}
      Tampilan: {theme === "dark" ? "Gelap" : "Terang"}
    </button>
  );
}
