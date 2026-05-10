import { v } from "convex/values";
import { mutation, query, internalQuery } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { saveMessage, syncStreams, vStreamArgs, listUIMessages } from "@convex-dev/agent";
import { components, internal } from "../_generated/api";
import { paginationOptsValidator } from "convex/server";

export const list = query({
  args: {
    sessionId: v.id("sessions"),
    paginationOpts: paginationOptsValidator,
    streamArgs: v.optional(vStreamArgs),
  },
  handler: async (ctx, { sessionId, paginationOpts, streamArgs }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { page: [], isDone: true, continueCursor: "", streams: undefined };
    }

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId || !session.agentThreadId) {
      return { page: [], isDone: true, continueCursor: "", streams: undefined };
    }

    const paginated = await listUIMessages(ctx, components.agent, {
      threadId: session.agentThreadId,
      paginationOpts,
    });

    const streams = await syncStreams(ctx, components.agent, {
      threadId: session.agentThreadId,
      streamArgs,
    });

    return { ...paginated, streams };
  },
});

export const getMessagesForSummary = internalQuery({
  args: { agentThreadId: v.string() },
  returns: v.array(v.object({ role: v.string(), text: v.string() })),
  handler: async (ctx, { agentThreadId }) => {
    const result = await listUIMessages(ctx, components.agent, {
      threadId: agentThreadId,
      paginationOpts: { cursor: null, numItems: 40 },
    });
    return result.page
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as string,
        text: m.parts
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join(" "),
      }))
      .filter((m) => m.text.trim().length > 0);
  },
});

export const send = mutation({
  args: {
    sessionId: v.id("sessions"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { sessionId, content }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId || !session.agentThreadId)
      throw new Error("Session not found");

    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId: session.agentThreadId,
      prompt: content,
      userId: userId.toString(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.functions.agent.generateResponse,
      {
        agentThreadId: session.agentThreadId,
        promptMessageId: messageId,
        sessionId,
        content,
      }
    );

    return null;
  },
});
