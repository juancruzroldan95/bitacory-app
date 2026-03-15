import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { listMessages, saveMessage, syncStreams, vStreamArgs, listUIMessages } from "@convex-dev/agent";
import { components, internal } from "../_generated/api";
import type { MessageDoc } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";

const messageReturnType = v.object({
  _id: v.string(),
  _creationTime: v.number(),
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("success"),
    v.literal("failed")
  ),
});

export const list = query({
  args: {
    threadId: v.id("threads"),
    paginationOpts: paginationOptsValidator,
    streamArgs: v.optional(vStreamArgs),
  },
  handler: async (ctx, { threadId, paginationOpts, streamArgs }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], isDone: true, continueCursor: "", streams: undefined };
    }

    const thread = await ctx.db.get(threadId);
    if (!thread || thread.userId !== userId || !thread.agentThreadId) {
      return { page: [], isDone: true, continueCursor: "", streams: undefined };
    }

    const paginated = await listUIMessages(ctx, components.agent, {
      threadId: thread.agentThreadId,
      paginationOpts,
    });

    const streams = await syncStreams(ctx, components.agent, {
      threadId: thread.agentThreadId,
      streamArgs,
    });

    return { ...paginated, streams };
  },
});

export const send = mutation({
  args: {
    threadId: v.id("threads"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { threadId, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const thread = await ctx.db.get(threadId);
    if (!thread || thread.userId !== userId || !thread.agentThreadId)
      throw new Error("Thread not found");

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: thread.agentThreadId,
      prompt: content,
      userId: userId.toString(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.functions.agent.generateResponse,
      {
        agentThreadId: thread.agentThreadId,
        promptMessageId: messageId,
        userId: userId.toString(),
      }
    );

    return null;
  },
});
