// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeSnippet } from "../../components/common/CodeSnippet";

describe("CodeSnippet", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders title and snippet content", () => {
    render(
      <CodeSnippet
        title="Voorbeeld snippet"
        code={`<div class=\"rounded\">Kaart</div>`}
        language="html"
      />,
    );

    expect(screen.getByRole("article", { name: "Voorbeeld snippet" })).toBeTruthy();
    expect(screen.getByText(/HTML snippet/i)).toBeTruthy();
    expect(screen.getByText(/<div class=\"rounded\">Kaart<\/div>/i)).toBeTruthy();
  });

  it("copies snippet text on button click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(
      <CodeSnippet title="Snippet kopieren" code={`<span>Hallo</span>`} language="html" />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Kopieer snippet/i }));

    expect(writeText).toHaveBeenCalledWith("<span>Hallo</span>");
  });
});
