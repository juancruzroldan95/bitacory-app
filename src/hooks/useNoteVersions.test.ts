import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNoteVersions, useSessionNoteVersions } from "./useNoteVersions";
import { useQuery, useMutation } from "convex/react";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

describe("useNoteVersions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call query with skip when noteId is undefined", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const result = useNoteVersions(undefined);
    expect(result.versions).toBeUndefined();
    expect(useQuery).toHaveBeenCalledWith(expect.any(Object), "skip");
  });

  it("should query note versions when noteId is provided", () => {
    const mockVersions = [{ _id: "v1", noteId: "n1", title: "V1", body: "Hello" }];
    vi.mocked(useQuery).mockReturnValue(mockVersions);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const result = useNoteVersions("n1" as any);
    expect(result.versions).toBe(mockVersions);
    expect(useQuery).toHaveBeenCalledWith(expect.any(Object), { noteId: "n1" });
    expect(result.createCheckpoint).toBe(mockMutation);
    expect(result.restoreVersion).toBe(mockMutation);
  });
});

describe("useSessionNoteVersions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call query with skip when sessionId is undefined", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const result = useSessionNoteVersions(undefined);
    expect(result.sessionVersions).toBeUndefined();
    expect(useQuery).toHaveBeenCalledWith(expect.any(Object), "skip");
  });

  it("should query session versions when sessionId is provided", () => {
    const mockSessionVersions = [{ _id: "v1", sessionId: "s1", title: "Note" }];
    vi.mocked(useQuery).mockReturnValue(mockSessionVersions);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const result = useSessionNoteVersions("s1" as any);
    expect(result.sessionVersions).toBe(mockSessionVersions);
    expect(useQuery).toHaveBeenCalledWith(expect.any(Object), { sessionId: "s1" });
  });
});
