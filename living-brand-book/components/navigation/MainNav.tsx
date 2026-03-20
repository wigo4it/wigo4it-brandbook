"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/het-merk", label: "Het Merk" },
  { href: "/design-system", label: "Design System" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="w4-main-nav" aria-label="Hoofdnavigatie">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="w4-main-nav__link"
            data-active={isActive}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
