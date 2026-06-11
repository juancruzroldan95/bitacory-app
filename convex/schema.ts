import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  notes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    tags: v.optional(v.array(v.string())),
    updatedAt: v.number(),
    pendingAiEdit: v.optional(v.object({
      proposedBody: v.string(),
      prompt: v.string(),
      generatedAt: v.number(),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_user_updatedAt", ["userId", "updatedAt"])
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
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
