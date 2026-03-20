import type { Metadata } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { MainNav } from "@/components/navigation/MainNav";
import { SubNav } from "@/components/navigation/SubNav";
import { UiModeProvider } from "@/components/providers/UiModeProvider";
import { PixelModeToggle } from "@/components/ui/PixelModeToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import "./globals.css";

const headingFont = localFont({
  src: [
    {
      path: "../public/fonts/neue-machina/PPNeueMachina-PlainRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-machina/PPNeueMachina-PlainSemibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-machina/PPNeueMachina-PlainBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-heading-local",
  display: "swap",
});

const bodyFont = localFont({
  src: [
    {
      path: "../public/fonts/raleway/Raleway-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/raleway/Raleway-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/raleway/Raleway-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-body-local",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Living Brand Book | Wigo4it",
  description: "Interactieve Living Brand Book applicatie voor Wigo4it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`h-full antialiased ${headingFont.variable} ${bodyFont.variable}`}
    >
      <body className="min-h-full">
        <UiModeProvider>
          <div className="w4-blueprint-grid min-h-screen">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold"
            >
              Ga direct naar inhoud
            </a>

            <header className="sticky top-0 z-40 border-b border-black/10 bg-white/85 backdrop-blur">
              <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                <Link
                  href="/het-merk"
                  className="w4-font-heading text-lg font-bold uppercase tracking-[0.08em] text-[var(--color-dark-green)]"
                >
                  Wigo4it Living Brand Book
                </Link>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <PixelModeToggle />
                </div>
              </div>

              <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:px-8">
                <MainNav />
              </div>

              <SubNav />
            </header>

            <main id="main-content" className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </UiModeProvider>
      </body>
    </html>
  );
}
