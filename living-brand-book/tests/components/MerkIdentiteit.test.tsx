// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MerkIdentiteit } from "../../components/pages/MerkIdentiteit";

class IntersectionObserverMock {
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(globalThis, "IntersectionObserver", {
  writable: true,
  value: IntersectionObserverMock,
});

describe("MerkIdentiteit page", () => {
  it("renders kernsecties en slogans", () => {
    render(<MerkIdentiteit />);

    expect(screen.getByRole("heading", { name: "IT die mensen vooruit helpt, niet andersom." })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Merkwaarden in actie" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Tone of voice die energie geeft" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Design gallery in opbouw" })).toBeTruthy();

    expect(screen.getByText("Good code, Good cause")).toBeTruthy();
    expect(screen.getByText("Be your own limit")).toBeTruthy();
  });

  it("opens and closes expandable cards", () => {
    render(<MerkIdentiteit />);

    const innovatieButton = screen.getAllByRole("button", { name: /Innovatie/i })[0];
    expect(innovatieButton.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(innovatieButton);
    expect(innovatieButton.getAttribute("aria-expanded")).toBe("true");
    expect(
      screen.getByText(
        /Je gebruikt nieuwe technieken wanneer ze echte waarde toevoegen\./i,
      ),
    ).toBeTruthy();

    fireEvent.click(innovatieButton);
    expect(innovatieButton.getAttribute("aria-expanded")).toBe("false");
  });
});
