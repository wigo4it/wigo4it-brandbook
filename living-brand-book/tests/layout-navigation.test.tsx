import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MainNav } from "@/components/navigation/MainNav";
import { SubNav } from "@/components/navigation/SubNav";
import { UiModeProvider } from "@/components/providers/UiModeProvider";
import { PixelModeToggle } from "@/components/ui/PixelModeToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const pathnameState = { value: "/het-merk" };

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameState.value,
}));

describe("layout navigation and toggles", () => {
  beforeEach(() => {
    pathnameState.value = "/het-merk";
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.pixelMode = "off";
  });

  it("renders both top-level navigation links", () => {
    render(<MainNav />);

    expect(screen.getByRole("link", { name: "Het Merk" })).toHaveAttribute(
      "href",
      "/het-merk",
    );
    expect(screen.getByRole("link", { name: "Design System" })).toHaveAttribute(
      "href",
      "/design-system",
    );
  });

  it("renders route-specific subnavigation links", () => {
    pathnameState.value = "/design-system";

    render(<SubNav />);

    expect(screen.getByRole("link", { name: "Kleuren" })).toHaveAttribute(
      "href",
      "#kleuren",
    );
    expect(screen.getByRole("link", { name: "Typografie" })).toHaveAttribute(
      "href",
      "#typografie",
    );
  });

  it("toggles dark mode and pixel mode independently", () => {
    render(
      <UiModeProvider>
        <ThemeToggle />
        <PixelModeToggle />
      </UiModeProvider>,
    );

    const darkToggle = screen.getByRole("button", { name: "Schakel dark mode" });
    const pixelToggle = screen.getByRole("button", { name: "Schakel pixel-modus" });

    fireEvent.click(darkToggle);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.pixelMode).toBe("off");

    fireEvent.click(pixelToggle);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.dataset.pixelMode).toBe("on");
  });
});
