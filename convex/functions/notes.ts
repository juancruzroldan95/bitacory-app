import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const noteFields = {
  _id: v.id("notes"),
  _creationTime: v.number(),
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
};

export const list = query({
  args: {},
  returns: v.array(v.object(noteFields)),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return ctx.db
      .query("notes")
      .withIndex("by_user_updatedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .take(200);
  },
});

export const get = query({
  args: { noteId: v.id("notes") },
  returns: v.union(v.object(noteFields), v.null()),
  handler: async (ctx, { noteId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) return null;

    return note;
  },
});

export const search = query({
  args: { query: v.string() },
  returns: v.array(v.object(noteFields)),
  handler: async (ctx, { query: searchQuery }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!searchQuery.trim()) return [];

    return ctx.db
      .query("notes")
      .withSearchIndex("search_notes", (q) =>
        q.search("body", searchQuery).eq("userId", userId)
      )
      .take(20);
  },
});

export const getByIds = internalQuery({
  args: { noteIds: v.array(v.id("notes")) },
  returns: v.array(v.object(noteFields)),
  handler: async (ctx, { noteIds }) => {
    const notes = await Promise.all(
      noteIds.slice(0, 5).map((id) => ctx.db.get(id))
    );
    return notes.filter((n): n is NonNullable<typeof n> => n !== null);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    body: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("notes"),
  handler: async (ctx, { title, body, tags }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return ctx.db.insert("notes", {
      userId,
      title,
      body,
      tags: tags?.slice(0, 10),
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, { noteId, title, body, tags }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) throw new Error("Note not found");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (title !== undefined) patch.title = title;
    if (body !== undefined) patch.body = body;
    if (tags !== undefined) patch.tags = tags.slice(0, 10);

    await ctx.db.patch(noteId, patch);
    return null;
  },
});

export const remove = mutation({
  args: { noteId: v.id("notes") },
  returns: v.null(),
  handler: async (ctx, { noteId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) throw new Error("Note not found");

    await ctx.db.delete(noteId);
    return null;
  },
});

export const clearPendingAiEdit = mutation({
  args: { noteId: v.id("notes") },
  returns: v.null(),
  handler: async (ctx, { noteId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) throw new Error("Note not found");

    await ctx.db.patch(noteId, { pendingAiEdit: undefined });
    return null;
  },
});

export const savePendingAiEdit = internalMutation({
  args: {
    noteId: v.id("notes"),
    proposedBody: v.string(),
    prompt: v.string(),
    userId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, { noteId, proposedBody, prompt, userId }) => {
    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) return null;
    await ctx.db.patch(noteId, {
      pendingAiEdit: {
        proposedBody: proposedBody.slice(0, 50_000),
        prompt: prompt.slice(0, 500),
        generatedAt: Date.now(),
      },
    });
    return null;
  },
});

export const internalCreate = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("notes"),
  handler: async (ctx, { userId, title, body, tags }) => {
    return ctx.db.insert("notes", {
      userId,
      title,
      body,
      tags: tags?.slice(0, 10),
      updatedAt: Date.now(),
    });
  },
});
