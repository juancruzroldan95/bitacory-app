import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    let avatarUrl = user.image ?? null;
    // Auth users might have 'name' or 'email'
    let displayName = user.name ?? user.email ?? "Usuario";

    if (profile) {
      if (profile.displayName) displayName = profile.displayName;
      if (profile.avatarId) {
        avatarUrl = await ctx.storage.getUrl(profile.avatarId);
      }
    }

    return {
      ...(profile ?? {}),
      userId,
      email: user.email as string | undefined,
      displayName,
      avatarUrl,
    };
  },
});

export const update = mutation({
  args: {
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
      });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        displayName: args.displayName,
      });
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateAvatar = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        avatarId: args.storageId,
      });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        displayName: "User",
        avatarId: args.storageId,
      });
    }
  },
});
