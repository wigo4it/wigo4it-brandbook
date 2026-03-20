// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MainNav } from "../../components/navigation/MainNav";
import { SubNav } from "../../components/navigation/SubNav";
import { UiModeProvider } from "../../components/providers/UiModeProvider";
import { PixelModeToggle } from "../../components/ui/PixelModeToggle";
import { ThemeToggle } from "../../components/ui/ThemeToggle";

const mockedUsePathname = vi.fn(() => "/het-merk");

vi.mock("next/navigation", () => ({
  usePathname: () => mockedUsePathname(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : ""} {...props}>
      {children}
    </a>
  ),
}));

describe("Layout navigation", () => {
  beforeEach(() => {
    mockedUsePathname.mockReset();
    window.localStorage.clear();
  });

  it("renders hoofdroute-links", () => {
    mockedUsePathname.mockReturnValue("/het-merk");

    render(<MainNav />);

    expect(screen.getByRole("link", { name: "Het Merk" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Design System" })).toBeTruthy();
  });

  it("updates dark mode and pixel mode independently", () => {
    render(
      <UiModeProvider>
        <ThemeToggle />
        <PixelModeToggle />
      </UiModeProvider>,
    );

    const darkModeButton = screen.getByRole("button", { name: "Schakel dark mode" });
    const pixelModeButton = screen.getByRole("button", { name: "Schakel pixel modus" });

    expect(darkModeButton.getAttribute("aria-pressed")).toBe("false");
    expect(pixelModeButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(darkModeButton);
    expect(darkModeButton.getAttribute("aria-pressed")).toBe("true");
    expect(pixelModeButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(pixelModeButton);
    expect(darkModeButton.getAttribute("aria-pressed")).toBe("true");
    expect(pixelModeButton.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(darkModeButton);
    expect(darkModeButton.getAttribute("aria-pressed")).toBe("false");
    expect(pixelModeButton.getAttribute("aria-pressed")).toBe("true");
  });

  it("renders subnavigatielinks for the active route", () => {
    mockedUsePathname.mockReturnValue("/het-merk");

    render(<SubNav />);

    expect(screen.getByRole("link", { name: "Missie en visie" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Merkwaarden" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Tone of voice" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Design gallery" })).toBeTruthy();
  });
});
