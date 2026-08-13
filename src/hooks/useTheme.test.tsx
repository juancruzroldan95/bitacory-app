import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import useTheme from "./useTheme";

describe("useTheme", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should throw an error when used outside of ThemeProvider", () => {
    vi.spyOn(React, "useContext").mockReturnValue(undefined);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    
    expect(() => useTheme()).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
    
    consoleError.mockRestore();
  });

  it("should return the context when used inside ThemeProvider", () => {
    const mockContext = { theme: "dark" as const, setTheme: vi.fn() };
    vi.spyOn(React, "useContext").mockReturnValue(mockContext);

    const result = useTheme();
    expect(result).toBe(mockContext);
  });
});
