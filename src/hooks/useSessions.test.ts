import { describe, it, expect, vi, beforeEach } from "vitest";
import { useSessions, useSession } from "./useSessions";
import { useQuery, useMutation } from "convex/react";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

describe("useSessions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Class 1 (useSessions - Loading)
  it("should return undefined sessions and mutation handlers when loading", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const result = useSessions();

    expect(result.sessions).toBeUndefined();
    expect(result.createSession).toBe(mockMutation);
    expect(result.renameSession).toBe(mockMutation);
    expect(result.deleteSession).toBe(mockMutation);
    expect(useQuery).toHaveBeenCalled();
    expect(useMutation).toHaveBeenCalledTimes(3);
  });

  // Class 2 (useSessions - Loaded)
  it("should return list of sessions and mutation handlers when loaded", () => {
    const mockSessions = [
      { _id: "s1", title: "Session 1", userId: "u1" },
      { _id: "s2", title: "Session 2", userId: "u1" },
    ];
    vi.mocked(useQuery).mockReturnValue(mockSessions);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const result = useSessions();

    expect(result.sessions).toBe(mockSessions);
    expect(result.createSession).toBe(mockMutation);
  });
});

describe("useSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Class 3 (useSession - Loading)
  it("should return undefined session when loading", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const sessionId = "session_123" as any;
    const result = useSession(sessionId);

    expect(result.session).toBeUndefined();
    expect(result.deleteSession).toBe(mockMutation);
    expect(useQuery).toHaveBeenCalledWith(expect.any(Object), { sessionId });
  });

  // Class 4 (useSession - Loaded)
  it("should return session details when loaded", () => {
    const mockSession = { _id: "session_123", title: "Session 1", userId: "u1" };
    vi.mocked(useQuery).mockReturnValue(mockSession);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const sessionId = "session_123" as any;
    const result = useSession(sessionId);

    expect(result.session).toBe(mockSession);
    expect(result.deleteSession).toBe(mockMutation);
  });
});
