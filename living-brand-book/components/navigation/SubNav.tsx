"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SectionLink = {
  href: string;
  label: string;
};

const SUB_NAV_BY_ROUTE: Record<string, SectionLink[]> = {
  "/het-merk": [
    { href: "#missie-visie", label: "Missie en visie" },
    { href: "#merkwaarden", label: "Merkwaarden" },
    { href: "#tone-of-voice", label: "Tone of voice" },
    { href: "#design-gallery", label: "Design gallery" },
  ],
  "/design-system": [
    { href: "#kleuren", label: "Kleuren" },
    { href: "#typografie", label: "Typografie" },
    { href: "#componenten", label: "Componenten" },
  ],
};

export function SubNav() {
  const pathname = usePathname();
  const links = SUB_NAV_BY_ROUTE[pathname] ?? [];

  if (links.length === 0) {
    return null;
  }

  return (
    <nav className="w4-sub-nav" aria-label="Sectienavigatie">
      <div className="w4-sub-nav__inner">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="w4-sub-nav__link">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
