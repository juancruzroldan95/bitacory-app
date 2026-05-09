import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.optional(v.id("profiles")),
      _creationTime: v.optional(v.number()),
      userId: v.id("users"),
      email: v.optional(v.string()),
      displayName: v.string(),
      avatarUrl: v.union(v.string(), v.null()),
      avatarId: v.optional(v.id("_storage")),
    }),
    v.null()
  ),
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
    let displayName = user.name ?? user.email ?? "Usuario";

    if (profile) {
      if (profile.displayName) displayName = profile.displayName;
      if (profile.avatarId) {
        avatarUrl = await ctx.storage.getUrl(profile.avatarId);
      }
    }

    return {
      _id: profile?._id,
      _creationTime: profile?._creationTime,
      userId,
      email: user.email,
      displayName,
      avatarUrl,
      avatarId: profile?.avatarId,
    };
  },
});

export const update = mutation({
  args: {
    displayName: v.string(),
  },
  returns: v.null(),
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

    return null;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
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
  returns: v.null(),
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
      const user = await ctx.db.get(userId);
      await ctx.db.insert("profiles", {
        userId,
        displayName: user?.name ?? user?.email ?? "Usuario",
        avatarId: args.storageId,
      });
    }

    return null;
  },
});
