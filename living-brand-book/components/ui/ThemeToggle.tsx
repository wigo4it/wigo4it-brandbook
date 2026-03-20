"use client";

import { useUiMode } from "../providers/UiModeProvider";

export function ThemeToggle() {
  const { isDarkMode, toggleDarkMode } = useUiMode();

  return (
    <button
      type="button"
      className="w4-mode-toggle"
      data-enabled={isDarkMode}
      aria-label="Schakel dark mode"
      aria-pressed={isDarkMode}
      onClick={toggleDarkMode}
    >
      {isDarkMode ? "Dark mode aan" : "Dark mode uit"}
    </button>
  );
}
