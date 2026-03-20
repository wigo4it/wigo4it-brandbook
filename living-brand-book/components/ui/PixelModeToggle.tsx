"use client";

import { useUiMode } from "@/components/providers/UiModeProvider";

export function PixelModeToggle() {
  const { isPixelMode, togglePixelMode } = useUiMode();

  return (
    <button
      type="button"
      onClick={togglePixelMode}
      aria-pressed={isPixelMode}
      aria-label="Schakel pixel-modus"
      className="inline-flex items-center gap-2 rounded-full border border-black/20 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black transition-colors hover:border-[var(--color-bright-pink)] hover:text-[var(--color-bright-pink)]"
    >
      <span aria-hidden="true">PX</span>
      <span>{isPixelMode ? "Pixel aan" : "Pixel uit"}</span>
    </button>
  );
}