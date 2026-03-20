import { describe, expect, it, vi } from "vitest";

vi.mock("next/font/local", () => ({
  default: vi.fn((options: { variable: string }) => ({
    variable: options.variable,
  })),
}));

describe("app/layout font configuration", () => {
  it("applies heading and body font variables on the html element", async () => {
    const { default: RootLayout } = await import("@/app/layout");

    const element = RootLayout({ children: <div>content</div> });
    const htmlClassName = element.props.className as string;

    expect(htmlClassName).toContain("--font-heading-local");
    expect(htmlClassName).toContain("--font-body-local");
  });
});