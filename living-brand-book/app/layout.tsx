import type { Metadata } from "next";
import localFont from "next/font/local";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
