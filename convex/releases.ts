import { query } from "./_generated/server";
import { v } from "convex/values";

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

        const teamGroups = new Map<
          string,
          { teamKey: string; teamName: string; count: number; allAnalyzed: boolean; hasError: boolean; hasAnalyzing: boolean }
        >();
        let globalCount = 0;

        for (const item of items) {
          const teamKey =
            item.linearTeamKey ??
            item.linearTicketId?.match(/^([A-Z]+)-/)?.[1];

          if (teamKey) {
            const existing = teamGroups.get(teamKey);
            if (existing) {
              existing.count++;
              if (item.status !== "analyzed") existing.allAnalyzed = false;
              if (item.status === "error") existing.hasError = true;
              if (item.status === "analyzing") existing.hasAnalyzing = true;
            } else {
              teamGroups.set(teamKey, {
                teamKey,
                teamName: item.linearTeamName ?? teamKey,
                count: 1,
                allAnalyzed: item.status === "analyzed",
                hasError: item.status === "error",
                hasAnalyzing: item.status === "analyzing",
              });
            }
          } else {
            globalCount++;
          }
        }

        const groups = [...teamGroups.values()].map((g) => ({
          teamKey: g.teamKey,
          teamName: g.teamName,
          count: g.count,
          status: g.allAnalyzed
            ? "Completed"
            : g.hasError
              ? "Error"
              : g.hasAnalyzing
                ? "Analyzing"
                : "Pending",
        }));

        return { ...release, groups, globalCount };
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
