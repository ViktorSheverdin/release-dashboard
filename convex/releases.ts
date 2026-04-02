import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("releases").order("desc").collect();
  },
});

export const get = query({
  args: { id: v.id("releases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getItems = query({
  args: { releaseId: v.id("releases") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("syncItems")
      .withIndex("by_releaseId", (q) => q.eq("releaseId", args.releaseId))
      .collect();
  },
});
