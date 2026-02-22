import { v } from "convex/values";
import {
  mutation,
  query,
  internalQuery,
  internalMutation,
} from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createThread } from "@convex-dev/agent";
import { components, internal } from "../_generated/api";

const threadFields = {
  _id: v.id("threads"),
  _creationTime: v.number(),
  userId: v.id("users"),
  title: v.string(),
  agentThreadId: v.optional(v.string()),
  summary: v.optional(v.string()),
  themes: v.optional(v.array(v.string())),
  summaryGeneratedAt: v.optional(v.number()),
};

export const list = query({
  args: {},
  returns: v.array(v.object(threadFields)),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return ctx.db
      .query("threads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { threadId: v.id("threads") },
  returns: v.union(v.object(threadFields), v.null()),
  handler: async (ctx, { threadId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const thread = await ctx.db.get(threadId);
    if (!thread || thread.userId !== userId) return null;

    return thread;
  },
});

export const getById = internalQuery({
  args: { threadId: v.id("threads") },
  returns: v.union(v.object(threadFields), v.null()),
  handler: async (ctx, { threadId }) => {
    return ctx.db.get(threadId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
  },
  returns: v.id("threads"),
  handler: async (ctx, { title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const agentThreadId = await createThread(ctx, components.agent, {
      userId: userId.toString(),
      title,
    });

    const threadId = await ctx.db.insert("threads", {
      userId,
      title,
      agentThreadId,
    });

    return threadId;
  },
});

export const rename = mutation({
  args: {
    threadId: v.id("threads"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { threadId, title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const thread = await ctx.db.get(threadId);
    if (!thread || thread.userId !== userId) throw new Error("Thread not found");

    await ctx.db.patch(threadId, { title });
    return null;
  },
});

export const remove = mutation({
  args: {
    threadId: v.id("threads"),
  },
  returns: v.null(),
  handler: async (ctx, { threadId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const thread = await ctx.db.get(threadId);
    if (!thread || thread.userId !== userId) throw new Error("Thread not found");

    await ctx.db.delete(threadId);

    if (thread.agentThreadId) {
      await ctx.scheduler.runAfter(
        0,
        internal.functions.agent.deleteAgentThread,
        { agentThreadId: thread.agentThreadId }
      );
    }

    return null;
  },
});

export const updateSummary = internalMutation({
  args: {
    threadId: v.id("threads"),
    title: v.string(),
    summary: v.string(),
    themes: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { threadId, title, summary, themes }) => {
    await ctx.db.patch(threadId, {
      title,
      summary,
      themes,
      summaryGeneratedAt: Date.now(),
    });
    return null;
  },
});
