import { describe, it, expect, vi, beforeEach } from "vitest";
import useTheme from "./useTheme";
import { useContext } from "react";

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useContext: vi.fn(),
  };
});

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw an error when used outside of ThemeProvider", () => {
    vi.mocked(useContext).mockReturnValue(undefined);

    expect(() => useTheme()).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
  });

  it("should return the context when used inside ThemeProvider", () => {
    const mockContext = { theme: "dark" as const, setTheme: vi.fn() };
    vi.mocked(useContext).mockReturnValue(mockContext);

    const result = useTheme();
    expect(result).toBe(mockContext);
  });
});
