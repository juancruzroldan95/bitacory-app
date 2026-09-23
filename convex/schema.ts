import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    tags: v.optional(v.array(v.string())),
    goalId: v.optional(v.id("goals")),
    updatedAt: v.number(),
    pendingAiEdit: v.optional(v.object({
      proposedBody: v.string(),
      prompt: v.string(),
      generatedAt: v.number(),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_user_updatedAt", ["userId", "updatedAt"])
    .index("by_user_goalId", ["userId", "goalId"])
    .searchIndex("search_notes", {
      searchField: "body",
      filterFields: ["userId"],
    }),

  sessions: defineTable({
    userId: v.id("users"),
    title: v.string(),
    agentThreadId: v.optional(v.string()),
    summary: v.optional(v.string()),
    themes: v.optional(v.array(v.string())),
    summaryGeneratedAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    avatarId: v.optional(v.id("_storage")),
    therapySchedule: v.optional(
      v.object({
        frequency: v.union(v.literal("weekly"), v.literal("biweekly"), v.literal("monthly")),
        dayOfWeek: v.number(),
        timeOfDay: v.string(),
        notifyPreSession: v.boolean(),
        notifyPostSession: v.boolean(),
      })
    ),
  }).index("by_user", ["userId"]),

  goals: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    status: v.union(v.literal("in_progress"), v.literal("completed"), v.literal("paused")),
    milestones: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        completed: v.boolean(),
        completedAt: v.optional(v.number()),
      })
    ),
    targetDate: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
