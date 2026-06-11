import { describe, it, expect, vi } from "vitest";
import useAuth from "./useAuth";
import { useConvexAuth } from "convex/react";

vi.mock("convex/react", () => ({
  useConvexAuth: vi.fn(),
}));

describe("useAuth", () => {
  // Class 1 (Loading State)
  it("should return isAuthenticated: false and isInitialized: false when loading", () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: true,
      isAuthenticated: false,
    });
    const result = useAuth();
    expect(result).toEqual({ isAuthenticated: false, isInitialized: false });
  });

  // Class 2 (Unauthenticated State)
  it("should return isAuthenticated: false and isInitialized: true when loaded and unauthenticated", () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
    });
    const result = useAuth();
    expect(result).toEqual({ isAuthenticated: false, isInitialized: true });
  });

  // Class 3 (Authenticated State)
  it("should return isAuthenticated: true and isInitialized: true when loaded and authenticated", () => {
    vi.mocked(useConvexAuth).mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
    });
    const result = useAuth();
    expect(result).toEqual({ isAuthenticated: true, isInitialized: true });
  });
});
