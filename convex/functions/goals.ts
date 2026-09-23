import { v } from "convex/values";
import { mutation, query, internalQuery, action } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const milestoneField = v.object({
  id: v.string(),
  title: v.string(),
  completed: v.boolean(),
  completedAt: v.optional(v.number()),
});

const goalFields = {
  _id: v.id("goals"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  category: v.optional(v.string()),
  status: v.union(v.literal("in_progress"), v.literal("completed"), v.literal("paused")),
  milestones: v.array(milestoneField),
  targetDate: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const list = query({
  args: {},
  returns: v.array(v.object(goalFields)),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return ctx.db
      .query("goals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
  },
});

export const get = query({
  args: { goalId: v.id("goals") },
  returns: v.union(v.object(goalFields), v.null()),
  handler: async (ctx, { goalId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const goal = await ctx.db.get(goalId);
    if (!goal || goal.userId !== userId) return null;

    return goal;
  },
});

export const getActiveGoalsForUser = internalQuery({
  args: { userId: v.id("users") },
  returns: v.array(v.object(goalFields)),
  handler: async (ctx, { userId }) => {
    return ctx.db
      .query("goals")
      .withIndex("by_user_status", (q) => q.eq("userId", userId).eq("status", "in_progress"))
      .take(10);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    milestones: v.optional(v.array(v.string())),
    targetDate: v.optional(v.string()),
  },
  returns: v.id("goals"),
  handler: async (ctx, { title, description, category, milestones, targetDate }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const formattedMilestones = (milestones ?? []).map((mTitle, index) => ({
      id: `${now.toString(36)}-${index}-${Math.random().toString(36).slice(2, 6)}`,
      title: mTitle.trim(),
      completed: false,
    })).filter((m) => m.title.length > 0);

    return ctx.db.insert("goals", {
      userId,
      title: title.trim(),
      description: description?.trim(),
      category: category?.trim(),
      status: "in_progress",
      milestones: formattedMilestones,
      targetDate: targetDate?.trim(),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    goalId: v.id("goals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.optional(v.union(v.literal("in_progress"), v.literal("completed"), v.literal("paused"))),
    targetDate: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { goalId, title, description, category, status, targetDate }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const goal = await ctx.db.get(goalId);
    if (!goal || goal.userId !== userId) throw new Error("Goal not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (title !== undefined) patch.title = title.trim();
    if (description !== undefined) patch.description = description.trim();
    if (category !== undefined) patch.category = category.trim();
    if (status !== undefined) patch.status = status;
    if (targetDate !== undefined) patch.targetDate = targetDate.trim();

    await ctx.db.patch(goalId, patch);
    return null;
  },
});

export const toggleMilestone = mutation({
  args: {
    goalId: v.id("goals"),
    milestoneId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { goalId, milestoneId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const goal = await ctx.db.get(goalId);
    if (!goal || goal.userId !== userId) throw new Error("Goal not found");

    const now = Date.now();
    let milestoneFound = false;

    const updatedMilestones = goal.milestones.map((m) => {
      if (m.id === milestoneId) {
        milestoneFound = true;
        const newCompleted = !m.completed;
        return {
          ...m,
          completed: newCompleted,
          completedAt: newCompleted ? now : undefined,
        };
      }
      return m;
    });

    if (!milestoneFound) throw new Error("Milestone not found");

    const allCompleted = updatedMilestones.length > 0 && updatedMilestones.every((m) => m.completed);
    let newStatus = goal.status;
    if (allCompleted && goal.status === "in_progress") {
      newStatus = "completed";
    } else if (!allCompleted && goal.status === "completed") {
      newStatus = "in_progress";
    }

    await ctx.db.patch(goalId, {
      milestones: updatedMilestones,
      status: newStatus,
      updatedAt: now,
    });

    return null;
  },
});

export const addMilestone = mutation({
  args: {
    goalId: v.id("goals"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { goalId, title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const goal = await ctx.db.get(goalId);
    if (!goal || goal.userId !== userId) throw new Error("Goal not found");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) throw new Error("Milestone title cannot be empty");

    const now = Date.now();
    const newMilestone = {
      id: `${now.toString(36)}-${goal.milestones.length}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmedTitle,
      completed: false,
    };

    const updatedMilestones = [...goal.milestones, newMilestone];
    const newStatus = goal.status === "completed" ? "in_progress" : goal.status;

    await ctx.db.patch(goalId, {
      milestones: updatedMilestones,
      status: newStatus,
      updatedAt: now,
    });

    return null;
  },
});

export const removeMilestone = mutation({
  args: {
    goalId: v.id("goals"),
    milestoneId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { goalId, milestoneId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const goal = await ctx.db.get(goalId);
    if (!goal || goal.userId !== userId) throw new Error("Goal not found");

    const updatedMilestones = goal.milestones.filter((m) => m.id !== milestoneId);
    const now = Date.now();

    const allCompleted = updatedMilestones.length > 0 && updatedMilestones.every((m) => m.completed);
    let newStatus = goal.status;
    if (allCompleted && goal.status === "in_progress") {
      newStatus = "completed";
    }

    await ctx.db.patch(goalId, {
      milestones: updatedMilestones,
      status: newStatus,
      updatedAt: now,
    });

    return null;
  },
});

export const remove = mutation({
  args: { goalId: v.id("goals") },
  returns: v.null(),
  handler: async (ctx, { goalId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const goal = await ctx.db.get(goalId);
    if (!goal || goal.userId !== userId) throw new Error("Goal not found");

    // Unlink any notes referencing this goal
    const linkedNotes = await ctx.db
      .query("notes")
      .withIndex("by_user_goalId", (q) => q.eq("userId", userId).eq("goalId", goalId))
      .take(100);

    for (const note of linkedNotes) {
      await ctx.db.patch(note._id, { goalId: undefined });
    }

    await ctx.db.delete(goalId);
    return null;
  },
});

export const suggestMilestones = action({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  returns: v.array(v.string()),
  handler: async (ctx, { title, description, category }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prompt = `El usuario quiere definir un objetivo en su espacio terapéutico:
Título: "${title}"
${description ? `Motivación/Sentido: "${description}"` : ""}
${category ? `Categoría: "${category}"` : ""}

Generá de 3 a 4 pasos o hitos de acción realistas, concretos, alcanzables y medibles (enfoque SMART conductual/terapéutico).
Cada paso debe ser una frase corta y accionable (máximo 12 palabras), en español, en infinitivo o primera persona.
Respondé ÚNICAMENTE con un array JSON de strings, por ejemplo:
["Identificar y registrar los disparadores", "Practicar 5 minutos de respiración diafragmática al sentir tensión", "Decir que no con amabilidad ante una demanda fuera de horario"]`;

    try {
      const response = await generateText({
        model: openai.chat("gpt-4o-mini"),
        prompt,
      });

      const text = response.text.trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
          return parsed.slice(0, 5);
        }
      }
    } catch (err) {
      console.error("[suggestMilestones] Error generating steps:", err);
    }

    return [
      "Definir el primer paso concreto y específico",
      "Registrar avances y dificultades en una nota",
      "Evaluar cómo me sentí al implementarlo",
    ];
  },
});
