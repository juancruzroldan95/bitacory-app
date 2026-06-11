import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as React from "react";
import { useIsMobile } from "./use-mobile";

// Mock React hook mechanisms
const mockSetIsMobile = vi.fn();
let mockUseStateVal: any = undefined;

vi.mock("react", () => {
  return {
    useState: vi.fn((init) => {
      // If we already set a mock value, use it, otherwise use initial value
      const val = mockUseStateVal !== undefined ? mockUseStateVal : init;
      return [val, mockSetIsMobile];
    }),
    useEffect: vi.fn((effect) => {
      return effect(); // execute immediately
    }),
  };
});

describe("useIsMobile", () => {
  let originalInnerWidth: number;
  let originalMatchMedia: typeof window.matchMedia;
  let mockMql: {
    matches: boolean;
    media: string;
    onchange: null;
    addListener: any;
    removeListener: any;
    addEventListener: any;
    removeEventListener: any;
    dispatchEvent: any;
  };
  let capturedOnChange: (() => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseStateVal = undefined;
    capturedOnChange = null;
    originalInnerWidth = window.innerWidth;
    originalMatchMedia = window.matchMedia;

    mockMql = {
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn((event, cb) => {
        if (event === "change") {
          capturedOnChange = cb;
        }
      }),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };

    window.matchMedia = vi.fn().mockReturnValue(mockMql);
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    window.matchMedia = originalMatchMedia;
  });

  // Class 1 (Mobile Viewport)
  it("should return false on initial render (undefined state) and trigger setIsMobile with true when innerWidth is mobile", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const isMobile = useIsMobile();
    // Since useState initial value is undefined, !!undefined evaluates to false
    expect(isMobile).toBe(false);
    expect(mockSetIsMobile).toHaveBeenCalledWith(true);
    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
    expect(mockMql.addEventListener).toHaveBeenCalledWith("change", expect.any(Function));
  });

  // Class 2 (Desktop Viewport)
  it("should return false on initial render and trigger setIsMobile with false when innerWidth is desktop", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const isMobile = useIsMobile();
    expect(isMobile).toBe(false);
    expect(mockSetIsMobile).toHaveBeenCalledWith(false);
  });

  // Returns actual state if state is initialized
  it("should return true if the state value is set to true", () => {
    mockUseStateVal = true;
    const isMobile = useIsMobile();
    expect(isMobile).toBe(true);
  });

  // Class 3 & 4 (Dynamic Resize and Cleanup)
  it("should handle dynamic window resizing and cleanup event listeners", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024, // starts as desktop
    });

    // Run hook to set up listeners
    let cleanupFn: any;
    vi.mocked(React.useEffect).mockImplementationOnce((effect) => {
      cleanupFn = effect();
      return undefined;
    });

    useIsMobile();

    expect(capturedOnChange).not.toBeNull();

    // Simulate window resizing to mobile (375px)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });

    // Trigger the change handler
    capturedOnChange!();
    expect(mockSetIsMobile).toHaveBeenCalledWith(true);

    // Call cleanup and verify listener removal
    cleanupFn();
    expect(mockMql.removeEventListener).toHaveBeenCalledWith("change", capturedOnChange);
  });
});
