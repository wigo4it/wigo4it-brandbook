import type { Metadata } from "next";
import localFont from "next/font/local";
import { MainNav } from "../components/navigation/MainNav";
import { SubNav } from "../components/navigation/SubNav";
import { UiModeProvider } from "../components/providers/UiModeProvider";
import { PixelModeToggle } from "../components/ui/PixelModeToggle";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import "./globals.css";

const neueMachina = localFont({
  src: [
    {
      path: "../public/fonts/neue-machina/PPNeueMachina-PlainLight.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-machina/PPNeueMachina-PlainRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-machina/PPNeueMachina-PlainMedium.ttf",
      weight: "500",
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
  variable: "--w4-font-heading",
  display: "swap",
});

const raleway = localFont({
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
  variable: "--w4-font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Living Brand Book | Wigo4it",
  description: "Interactief Living Brand Book voor Wigo4it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      suppressHydrationWarning
      className={`${neueMachina.variable} ${raleway.variable}`}
    >
      <body>
        <UiModeProvider>
          <a className="w4-skip-link" href="#main-content">
            Ga naar de inhoud
          </a>
          <header className="w4-site-header w4-blueprint-overlay" role="banner">
            <div className="w4-site-header__inner">
              <div>
                <p className="w4-site-eyebrow">Wigo4it</p>
                <p className="w4-site-title">Living Brand Book</p>
              </div>
              <MainNav />
              <div className="w4-site-toggles" aria-label="Interface modi">
                <ThemeToggle />
                <PixelModeToggle />
              </div>
            </div>
            <SubNav />
          </header>
          <main id="main-content" className="w4-site-main">
            {children}
          </main>
        </UiModeProvider>
      </body>
    </html>
  );
}
