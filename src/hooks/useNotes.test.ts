import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotes, useNote } from "./useNotes";
import { useQuery, useMutation } from "convex/react";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));

describe("useNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Class 1 (useNotes - Loading)
  it("should return undefined notes when loading", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation);

    const result = useNotes();
    expect(result.notes).toBeUndefined();
    expect(result.createNote).toBe(mockMutation);
    expect(result.updateNote).toBe(mockMutation);
    expect(result.removeNote).toBe(mockMutation);
    expect(useQuery).toHaveBeenCalled();
    expect(useMutation).toHaveBeenCalledTimes(3);
  });

  // Class 2 (useNotes - Loaded)
  it("should return notes list when loaded", () => {
    const mockNotes = [{ _id: "n1", title: "Note 1", userId: "u1" }];
    vi.mocked(useQuery).mockReturnValue(mockNotes);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation);

    const result = useNotes();
    expect(result.notes).toBe(mockNotes);
  });
});

describe("useNote", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Class 3 (useNote - Undefined ID)
  it("should call query with skip when noteId is undefined", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation);

    const result = useNote(undefined);
    expect(result.note).toBeUndefined();
    expect(useQuery).toHaveBeenCalledWith(expect.any(Object), "skip");
  });

  // Class 4 (useNote - Loaded)
  it("should call query with noteId and return note details", () => {
    const mockNote = { _id: "note_123", title: "Note 1", body: "Hello", userId: "u1" };
    vi.mocked(useQuery).mockReturnValue(mockNote);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation);

    const noteId = "note_123" as any;
    const result = useNote(noteId);
    expect(result.note).toBe(mockNote);
    expect(useQuery).toHaveBeenCalledWith(expect.any(Object), { noteId });
  });
});
