import { describe, it, expect, vi } from "vitest";
import { useTheme } from "./useTheme";
import { useTheme as originalUseTheme } from "@/contexts/ThemeProvider";

vi.mock("@/contexts/ThemeProvider", () => ({
  useTheme: vi.fn(),
}));

describe("useTheme", () => {
  it("should re-export useTheme from ThemeProvider context", () => {
    const mockContext = { theme: "dark" as const, setTheme: vi.fn() };
    vi.mocked(originalUseTheme).mockReturnValue(mockContext);

    const result = useTheme();
    expect(result).toBe(mockContext);
    expect(originalUseTheme).toHaveBeenCalled();
  });
});
