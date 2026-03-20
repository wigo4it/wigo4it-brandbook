// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ColorPalette } from "../../components/docs/ColorPalette";

describe("ColorPalette", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders all required color tokens", () => {
    render(<ColorPalette />);

    expect(screen.getByText("dark-blue")).toBeTruthy();
    expect(screen.getByText("aubergine")).toBeTruthy();
    expect(screen.getByText("dark-green")).toBeTruthy();
    expect(screen.getByText("light-green")).toBeTruthy();
    expect(screen.getByText("soft-yellow")).toBeTruthy();
    expect(screen.getByText("bright-red")).toBeTruthy();
    expect(screen.getByText("bright-pink")).toBeTruthy();
    expect(screen.getByText("light-grey")).toBeTruthy();
  });

  it("copies hex values and class names", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(<ColorPalette />);

    fireEvent.click(screen.getAllByRole("button", { name: "Kopieer HEX" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Kopieer class" })[0]);

    expect(writeText).toHaveBeenCalledWith("#434d8e");
    expect(writeText).toHaveBeenCalledWith("bg-dark-blue text-white");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "HEX gekopieerd" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Class gekopieerd" })).toBeTruthy();
      expect(screen.getAllByText("Gekopieerd")[0]).toBeTruthy();
    });
  });
});
