import { query } from "./_generated/server";
import { v } from "convex/values";

function computeStatus(items: { status: string }[]): string {
  if (items.length === 0) return "Pending";
  const allAnalyzed = items.every((i) => i.status === "analyzed");
  if (allAnalyzed) return "Completed";
  if (items.some((i) => i.status === "error")) return "Error";
  if (items.some((i) => i.status === "analyzing")) return "Analyzing";
  return "Pending";
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const releases = await ctx.db.query("releases").order("desc").collect();

    return Promise.all(
      releases.map(async (release) => {
        const items = await ctx.db
          .query("syncItems")
          .withIndex("by_releaseId", (q) => q.eq("releaseId", release._id))
          .collect();

        const teamItemsMap = new Map<string, typeof items>();
        const globalItems: typeof items = [];

        for (const item of items) {
          const teamKey =
            item.linearTeamKey ??
            item.linearTicketId?.match(/^([A-Z]+)-/)?.[1];

          if (teamKey) {
            if (!teamItemsMap.has(teamKey)) {
              teamItemsMap.set(teamKey, []);
            }
            teamItemsMap.get(teamKey)!.push(item);
          } else {
            globalItems.push(item);
          }
        }

        const groups = [...teamItemsMap.entries()].map(([teamKey, teamItems]) => ({
          teamKey,
          teamName: teamItems[0].linearTeamName ?? teamKey,
          count: teamItems.length,
          status: computeStatus(teamItems),
        }));

        const globalGroup = globalItems.length > 0
          ? {
              teamKey: "__global__",
              teamName: "Global Changes",
              count: globalItems.length,
              status: computeStatus(globalItems),
            }
          : null;

        return { ...release, groups, globalGroup };
      })
    );
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
