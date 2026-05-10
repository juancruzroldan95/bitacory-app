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

const sessionFields = {
  _id: v.id("sessions"),
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
  returns: v.array(v.object(sessionFields)),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(200);
  },
});

export const get = query({
  args: { sessionId: v.id("sessions") },
  returns: v.union(v.object(sessionFields), v.null()),
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) return null;

    return session;
  },
});

export const getById = internalQuery({
  args: { sessionId: v.id("sessions") },
  returns: v.union(v.object(sessionFields), v.null()),
  handler: async (ctx, { sessionId }) => {
    return ctx.db.get(sessionId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
  },
  returns: v.id("sessions"),
  handler: async (ctx, { title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const agentThreadId = await createThread(ctx, components.agent, {
      userId: userId.toString(),
      title,
    });

    const sessionId = await ctx.db.insert("sessions", {
      userId,
      title,
      agentThreadId,
    });

    return sessionId;
  },
});

export const rename = mutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { sessionId, title }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) throw new Error("Session not found");

    await ctx.db.patch(sessionId, { title });
    return null;
  },
});

export const remove = mutation({
  args: {
    sessionId: v.id("sessions"),
  },
  returns: v.null(),
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) throw new Error("Session not found");

    await ctx.db.delete(sessionId);

    if (session.agentThreadId) {
      await ctx.scheduler.runAfter(
        0,
        internal.functions.agent.deleteAgentThread,
        { agentThreadId: session.agentThreadId }
      );
    }

    return null;
  },
});

export const updateSummary = internalMutation({
  args: {
    sessionId: v.id("sessions"),
    title: v.string(),
    summary: v.string(),
    themes: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { sessionId, title, summary, themes }) => {
    await ctx.db.patch(sessionId, {
      title,
      summary,
      themes,
      summaryGeneratedAt: Date.now(),
    });
    return null;
  },
});
