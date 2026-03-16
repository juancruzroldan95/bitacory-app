import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, Resend],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
