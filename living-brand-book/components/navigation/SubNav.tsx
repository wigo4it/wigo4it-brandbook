"use client";

import { usePathname } from "next/navigation";

type SubNavItem = {
  id: string;
  label: string;
};

const subNavByRoute: Record<string, SubNavItem[]> = {
  "/het-merk": [
    { id: "missie-visie", label: "Missie & visie" },
    { id: "merkwaarden", label: "Merkwaarden" },
    { id: "tone-of-voice", label: "Tone of voice" },
    { id: "gallery", label: "Design gallery" },
  ],
  "/design-system": [
    { id: "kleuren", label: "Kleuren" },
    { id: "typografie", label: "Typografie" },
    { id: "componenten", label: "Componenten" },
    { id: "snippets", label: "Snippets" },
  ],
};

export function SubNav() {
  const pathname = usePathname();
  const items = subNavByRoute[pathname] ?? [];

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Subnavigatie"
      className="overflow-x-auto border-t border-black/10 bg-white/70 px-3 py-3 backdrop-blur sm:px-6"
    >
      <ul className="mx-auto flex w-full max-w-6xl items-center gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="inline-flex whitespace-nowrap rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-black/70 transition-colors hover:border-[var(--color-dark-green)] hover:text-[var(--color-dark-green)]"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}