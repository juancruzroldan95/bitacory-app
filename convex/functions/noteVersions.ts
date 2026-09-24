import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const noteVersionFields = {
  _id: v.id("noteVersions"),
  _creationTime: v.number(),
  noteId: v.id("notes"),
  userId: v.id("users"),
  title: v.string(),
  body: v.string(),
  tags: v.optional(v.array(v.string())),
  goalId: v.optional(v.id("goals")),
  createdAt: v.number(),
  author: v.union(v.literal("ai"), v.literal("user")),
  actionType: v.union(
    v.literal("ai_edit"),
    v.literal("manual_checkpoint"),
    v.literal("restore_rollback")
  ),
  summary: v.optional(v.string()),
  sessionId: v.optional(v.id("sessions")),
};

export const listByNote = query({
  args: { noteId: v.id("notes") },
  returns: v.array(v.object(noteVersionFields)),
  handler: async (ctx, { noteId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) return [];

    return ctx.db
      .query("noteVersions")
      .withIndex("by_noteId", (q) => q.eq("noteId", noteId))
      .order("desc")
      .take(50);
  },
});

export const listBySession = query({
  args: { sessionId: v.id("sessions") },
  returns: v.array(v.object(noteVersionFields)),
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) return [];

    const versions = await ctx.db
      .query("noteVersions")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(20);

    return versions.filter((v) => v.userId === userId);
  },
});

export const createCheckpoint = mutation({
  args: {
    noteId: v.id("notes"),
    summary: v.optional(v.string()),
  },
  returns: v.id("noteVersions"),
  handler: async (ctx, { noteId, summary }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) throw new Error("Note not found");

    return ctx.db.insert("noteVersions", {
      noteId,
      userId,
      title: note.title,
      body: note.body,
      tags: note.tags,
      goalId: note.goalId,
      createdAt: Date.now(),
      author: "user",
      actionType: "manual_checkpoint",
      summary: summary?.trim().slice(0, 500) || "Punto de control manual",
    });
  },
});

export const restore = mutation({
  args: {
    noteId: v.id("notes"),
    versionId: v.id("noteVersions"),
  },
  returns: v.null(),
  handler: async (ctx, { noteId, versionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(noteId);
    if (!note || note.userId !== userId) throw new Error("Note not found");

    const version = await ctx.db.get(versionId);
    if (!version || version.userId !== userId || version.noteId !== noteId) {
      throw new Error("Version not found");
    }

    // Save a rollback snapshot of current state before restoring
    await ctx.db.insert("noteVersions", {
      noteId,
      userId,
      title: note.title,
      body: note.body,
      tags: note.tags,
      goalId: note.goalId,
      createdAt: Date.now(),
      author: "user",
      actionType: "restore_rollback",
      summary: "Punto de control previo a restaurar versión",
    });

    // Restore note contents from version
    await ctx.db.patch(noteId, {
      title: version.title,
      body: version.body,
      tags: version.tags,
      goalId: version.goalId,
      updatedAt: Date.now(),
    });

    return null;
  },
});
