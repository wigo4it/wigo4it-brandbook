"use client";

import { useUiMode } from "@/components/providers/UiModeProvider";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useUiMode();

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      aria-pressed={isDarkMode}
      aria-label="Schakel dark mode"
      className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black transition-colors hover:border-[var(--color-dark-blue)] hover:text-[var(--color-dark-blue)]"
    >
      <span aria-hidden="true">{isDarkMode ? "DM" : "LM"}</span>
      <span>{isDarkMode ? "Dark" : "Light"}</span>
    </button>
  );
}