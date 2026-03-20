"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

const routes = [
  { href: "/het-merk", label: "Het Merk" },
  { href: "/design-system", label: "Design System" },
] as const satisfies ReadonlyArray<{ href: Route; label: string }>;

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Hoofdnavigatie" className="w-full">
      <ul className="flex flex-wrap items-center gap-2 sm:gap-3">
        {routes.map((route) => {
          const isActive = pathname === route.href;

          return (
            <li key={route.href}>
              <Link
                href={route.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "border-[var(--color-dark-blue)] bg-[var(--color-dark-blue)] text-white"
                    : "border-black/20 bg-white/80 text-[color:var(--foreground)] hover:border-[var(--color-dark-green)] hover:text-[var(--color-dark-green)]"
                }`}
              >
                {route.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}