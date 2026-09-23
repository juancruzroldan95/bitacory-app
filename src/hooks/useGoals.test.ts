import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGoals, useGoal } from "./useGoals";
import { useQuery, useMutation, useAction } from "convex/react";

vi.mock("convex/react", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useAction: vi.fn(),
}));

describe("useGoals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined goals when loading", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const mockMutation = vi.fn();
    const mockAction = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);
    vi.mocked(useAction).mockReturnValue(mockAction as any);

    const result = useGoals();
    expect(result.goals).toBeUndefined();
    expect(result.createGoal).toBe(mockMutation);
    expect(result.updateGoal).toBe(mockMutation);
    expect(result.removeGoal).toBe(mockMutation);
    expect(result.toggleMilestone).toBe(mockMutation);
    expect(result.addMilestone).toBe(mockMutation);
    expect(result.removeMilestone).toBe(mockMutation);
    expect(result.suggestMilestones).toBe(mockAction);
    expect(useQuery).toHaveBeenCalled();
    expect(useMutation).toHaveBeenCalledTimes(6);
    expect(useAction).toHaveBeenCalledTimes(1);
  });

  it("should return goals list when loaded", () => {
    const mockGoals = [{ _id: "g1", title: "Meta 1", userId: "u1", milestones: [], status: "in_progress" }];
    vi.mocked(useQuery).mockReturnValue(mockGoals);
    const mockMutation = vi.fn();
    const mockAction = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);
    vi.mocked(useAction).mockReturnValue(mockAction as any);

    const result = useGoals();
    expect(result.goals).toBe(mockGoals);
  });
});

describe("useGoal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call query with skip when goalId is undefined", () => {
    vi.mocked(useQuery).mockReturnValue(undefined);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const result = useGoal(undefined);
    expect(result.goal).toBeUndefined();
    expect(result.linkedNotes).toBeUndefined();
    expect(useQuery).toHaveBeenCalledWith(expect.any(Object), "skip");
  });

  it("should call query with goalId and return goal details and linked notes", () => {
    const mockGoal = { _id: "goal_123", title: "Mi Meta", status: "in_progress" };
    const mockNotes = [{ _id: "note_1", title: "Nota sobre la meta" }];
    vi.mocked(useQuery).mockImplementation(((_query: any, args: any) => {
      if (args && (args as any).goalId === "goal_123") {
        return mockGoal as any;
      }
      return mockNotes as any;
    }) as any);
    const mockMutation = vi.fn();
    vi.mocked(useMutation).mockReturnValue(mockMutation as any);

    const goalId = "goal_123" as any;
    const result = useGoal(goalId);
    expect(result.goal).toBeDefined();
    expect(useQuery).toHaveBeenCalled();
  });
});
