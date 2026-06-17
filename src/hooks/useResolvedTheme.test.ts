import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useResolvedTheme } from "./useResolvedTheme";
import { useTheme } from "@/hooks/useTheme";

// Mock dependencies
const mockSetSystemDark = vi.fn();
let mockSystemDarkVal = false;

vi.mock("react", () => ({
  useState: vi.fn(() => {
    // We override return value with mockSystemDarkVal for controlled testing
    return [mockSystemDarkVal, mockSetSystemDark];
  }),
  useEffect: vi.fn((effect) => effect()),
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: vi.fn(),
}));

describe("useResolvedTheme", () => {
  let originalMatchMedia: typeof window.matchMedia;
  let mockMql: {
    matches: boolean;
    addEventListener: any;
    removeEventListener: any;
  };
  let capturedOnChange: ((e: { matches: boolean }) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSystemDarkVal = false;
    capturedOnChange = null;
    originalMatchMedia = window.matchMedia;

    mockMql = {
      matches: false,
      addEventListener: vi.fn((event, cb) => {
        if (event === "change") {
          capturedOnChange = cb;
        }
      }),
      removeEventListener: vi.fn(),
    };
    window.matchMedia = vi.fn().mockReturnValue(mockMql);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  // Class 1 (Explicit Light Theme)
  it("should return light if theme is explicitly set to light", () => {
    vi.mocked(useTheme).mockReturnValue({ theme: "light", setTheme: vi.fn() });
    const resolved = useResolvedTheme();
    expect(resolved).toBe("light");
  });

  // Class 2 (Explicit Dark Theme)
  it("should return dark if theme is explicitly set to dark", () => {
    vi.mocked(useTheme).mockReturnValue({ theme: "dark", setTheme: vi.fn() });
    const resolved = useResolvedTheme();
    expect(resolved).toBe("dark");
  });

  // Class 3 (System Theme - prefers dark)
  it("should return dark if theme is system and prefers dark is true", () => {
    vi.mocked(useTheme).mockReturnValue({ theme: "system", setTheme: vi.fn() });
    mockSystemDarkVal = true;
    const resolved = useResolvedTheme();
    expect(resolved).toBe("dark");
  });

  // Class 4 (System Theme - prefers light)
  it("should return light if theme is system and prefers dark is false", () => {
    vi.mocked(useTheme).mockReturnValue({ theme: "system", setTheme: vi.fn() });
    mockSystemDarkVal = false;
    const resolved = useResolvedTheme();
    expect(resolved).toBe("light");
  });

  // Class 5 (Dynamic System Theme Change)
  it("should setup event listener and update state on media query change", () => {
    vi.mocked(useTheme).mockReturnValue({ theme: "system", setTheme: vi.fn() });
    
    // Call the hook to setup the effect
    useResolvedTheme();

    expect(mockMql.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
    expect(capturedOnChange).not.toBeNull();

    // Trigger change event to dark
    capturedOnChange!({ matches: true });
    expect(mockSetSystemDark).toHaveBeenCalledWith(true);

    // Trigger change event to light
    capturedOnChange!({ matches: false });
    expect(mockSetSystemDark).toHaveBeenCalledWith(false);
  });
});
