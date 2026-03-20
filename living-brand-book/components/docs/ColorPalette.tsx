"use client";

import { useEffect, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

type BrandColor = {
  name: string;
  token: string;
  hex: string;
  tailwindClass: string;
  swatchClass: string;
};

const BRAND_COLORS: BrandColor[] = [
  {
    name: "Dark Blue",
    token: "dark-blue",
    hex: "#434d8e",
    tailwindClass: "bg-dark-blue text-white",
    swatchClass: "w4-color-swatch--dark-blue",
  },
  {
    name: "Aubergine",
    token: "aubergine",
    hex: "#362c46",
    tailwindClass: "bg-aubergine text-white",
    swatchClass: "w4-color-swatch--aubergine",
  },
  {
    name: "Dark Green",
    token: "dark-green",
    hex: "#005351",
    tailwindClass: "bg-dark-green text-white",
    swatchClass: "w4-color-swatch--dark-green",
  },
  {
    name: "Light Green",
    token: "light-green",
    hex: "#63cf92",
    tailwindClass: "bg-light-green text-dark-green",
    swatchClass: "w4-color-swatch--light-green",
  },
  {
    name: "Soft Yellow",
    token: "soft-yellow",
    hex: "#e9eb86",
    tailwindClass: "bg-soft-yellow text-night",
    swatchClass: "w4-color-swatch--soft-yellow",
  },
  {
    name: "Bright Red",
    token: "bright-red",
    hex: "#f56e6d",
    tailwindClass: "bg-bright-red text-night",
    swatchClass: "w4-color-swatch--bright-red",
  },
  {
    name: "Bright Pink",
    token: "bright-pink",
    hex: "#bb55a9",
    tailwindClass: "bg-bright-pink text-white",
    swatchClass: "w4-color-swatch--bright-pink",
  },
  {
    name: "Light Grey",
    token: "light-grey",
    hex: "#cfd6cc",
    tailwindClass: "bg-light-grey text-night",
    swatchClass: "w4-color-swatch--light-grey",
  },
];

async function copyTextToClipboard(value: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  if (typeof document === "undefined") {
    return false;
  }

  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "true");
  helper.style.position = "fixed";
  helper.style.opacity = "0";
  document.body.appendChild(helper);
  helper.select();

  const success = document.execCommand("copy");
  document.body.removeChild(helper);
  return success;
}

export function ColorPalette() {
  const [copyState, setCopyState] = useState<Record<string, CopyState>>({});

  useEffect(() => {
    const activeKeys = Object.entries(copyState)
      .filter(([, value]) => value !== "idle")
      .map(([key]) => key);

    if (activeKeys.length === 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setCopyState((previous) => {
        const resetState = { ...previous };
        activeKeys.forEach((key) => {
          resetState[key] = "idle";
        });
        return resetState;
      });
    }, 1600);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [copyState]);

  const handleCopy = async (key: string, value: string) => {
    try {
      const success = await copyTextToClipboard(value);
      setCopyState((previous) => ({
        ...previous,
        [key]: success ? "copied" : "failed",
      }));
    } catch {
      setCopyState((previous) => ({
        ...previous,
        [key]: "failed",
      }));
    }
  };

  return (
    <div className="w4-color-grid" role="list" aria-label="Wigo4it merkkleuren">
      {BRAND_COLORS.map((color) => {
        const hexKey = `${color.token}-hex`;
        const classKey = `${color.token}-class`;
        const hexState = copyState[hexKey] ?? "idle";
        const classState = copyState[classKey] ?? "idle";

        return (
          <article key={color.token} className="w4-color-card" role="listitem">
            <div className={`w4-color-swatch ${color.swatchClass}`} aria-hidden="true" />
            <h3 className="w4-color-name">{color.name}</h3>
            <p className="w4-color-token">{color.token}</p>
            <p className="w4-color-value">{color.hex}</p>

            <div className="w4-color-actions">
              <button
                type="button"
                className="w4-copy-button"
                onClick={() => handleCopy(hexKey, color.hex)}
              >
                {hexState === "copied" ? "HEX gekopieerd" : "Kopieer HEX"}
              </button>
              <button
                type="button"
                className="w4-copy-button w4-copy-button--alt"
                onClick={() => handleCopy(classKey, color.tailwindClass)}
              >
                {classState === "copied" ? "Class gekopieerd" : "Kopieer class"}
              </button>
            </div>

            <p className="w4-copy-status" aria-live="polite">
              {hexState === "failed" || classState === "failed"
                ? "Kopieren mislukt"
                : hexState === "copied" || classState === "copied"
                  ? "Gekopieerd"
                  : ""}
            </p>
          </article>
        );
      })}
    </div>
  );
}
