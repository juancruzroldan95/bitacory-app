import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  threads: defineTable({
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
