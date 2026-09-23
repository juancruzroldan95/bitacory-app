import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useGoals() {
  const goals = useQuery(api.functions.goals.list);
  const createGoal = useMutation(api.functions.goals.create);
  const updateGoal = useMutation(api.functions.goals.update);
  const removeGoal = useMutation(api.functions.goals.remove);
  const toggleMilestone = useMutation(api.functions.goals.toggleMilestone);
  const addMilestone = useMutation(api.functions.goals.addMilestone);
  const removeMilestone = useMutation(api.functions.goals.removeMilestone);
  const suggestMilestones = useAction(api.functions.goals.suggestMilestones);

  return {
    goals,
    createGoal,
    updateGoal,
    removeGoal,
    toggleMilestone,
    addMilestone,
    removeMilestone,
    suggestMilestones,
  };
}

export function useGoal(goalId: Id<"goals"> | undefined) {
  const goal = useQuery(api.functions.goals.get, goalId ? { goalId } : "skip");
  const linkedNotes = useQuery(api.functions.notes.getByGoalId, goalId ? { goalId } : "skip");
  const updateGoal = useMutation(api.functions.goals.update);
  const toggleMilestone = useMutation(api.functions.goals.toggleMilestone);
  const addMilestone = useMutation(api.functions.goals.addMilestone);
  const removeMilestone = useMutation(api.functions.goals.removeMilestone);

  return {
    goal,
    linkedNotes,
    updateGoal,
    toggleMilestone,
    addMilestone,
    removeMilestone,
  };
}
