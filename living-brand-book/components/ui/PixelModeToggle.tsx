"use client";

import { useUiMode } from "../providers/UiModeProvider";

export function PixelModeToggle() {
  const { isPixelMode, togglePixelMode } = useUiMode();

  return (
    <button
      type="button"
      className="w4-mode-toggle"
      data-enabled={isPixelMode}
      aria-label="Schakel pixel modus"
      aria-pressed={isPixelMode}
      onClick={togglePixelMode}
    >
      {isPixelMode ? "Pixel modus aan" : "Pixel modus uit"}
    </button>
  );
}
