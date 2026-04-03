import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const syncItemValidator = v.object({
  prNumber: v.number(),
  prTitle: v.string(),
  prUrl: v.string(),
  prAuthor: v.string(),
  prMergedAt: v.string(),
  prDiff: v.optional(v.string()),
  linearTicketId: v.optional(v.string()),
  linearTitle: v.optional(v.string()),
  linearDescription: v.optional(v.string()),
  linearUrl: v.optional(v.string()),
  linearTeamKey: v.optional(v.string()),
  linearTeamName: v.optional(v.string()),
});

// ── Mutation: add items to the latest release, or create one ────────────────
// This ensures multiple syncs add to the same release instead of creating new ones
export const addToRelease = internalMutation({
  args: {
    items: v.array(syncItemValidator),
  },
  handler: async (ctx, args) => {
    // Find the latest release
    const latestRelease = await ctx.db
      .query("releases")
      .order("desc")
      .first();

    let releaseId;

    if (latestRelease) {
      // Add to existing release — update counts
      const newMatched = args.items.filter((i) => i.linearTicketId).length;
      await ctx.db.patch(latestRelease._id, {
        syncedAt: Date.now(),
        status: "syncing",
        prCount: latestRelease.prCount + args.items.length,
        matchedCount: latestRelease.matchedCount + newMatched,
      });
      releaseId = latestRelease._id;
    } else {
      // First sync ever — create new release
      const matchedCount = args.items.filter((i) => i.linearTicketId).length;
      releaseId = await ctx.db.insert("releases", {
        syncedAt: Date.now(),
        status: "syncing",
        prCount: args.items.length,
        matchedCount,
      });
    }

    for (const item of args.items) {
      const itemId = await ctx.db.insert("syncItems", {
        releaseId,
        ...item,
        status: "pending",
        slackSent: false,
      });

      await ctx.scheduler.runAfter(0, internal.analyze.analyzeItem, {
        itemId,
      });
    }

    return releaseId;
  },
});

// Keep createRelease for backwards compat, but prefer addToRelease
export const createRelease = internalMutation({
  args: { items: v.array(syncItemValidator) },
  handler: async (ctx, args) => {
    const matchedCount = args.items.filter((i) => i.linearTicketId).length;
    const releaseId = await ctx.db.insert("releases", {
      syncedAt: Date.now(),
      status: "syncing",
      prCount: args.items.length,
      matchedCount,
    });

    for (const item of args.items) {
      const itemId = await ctx.db.insert("syncItems", {
        releaseId,
        ...item,
        status: "pending",
        slackSent: false,
      });
      await ctx.scheduler.runAfter(0, internal.analyze.analyzeItem, {
        itemId,
      });
    }
    return releaseId;
  },
});

// ── Query: get all synced PR numbers (for dedup) ────────────────────────────
export const getAllSyncedPrNumbers = internalQuery({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("syncItems").collect();
    return items.map((i) => ({ prNumber: i.prNumber }));
  },
});

// ── Internal query to fetch a single item ───────────────────────────────────
export const getItem = internalQuery({
  args: { itemId: v.id("syncItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.itemId);
  },
});

// ── Mutation: update item status ────────────────────────────────────────────
export const updateItemStatus = internalMutation({
  args: {
    itemId: v.id("syncItems"),
    status: v.union(
      v.literal("pending"),
      v.literal("analyzing"),
      v.literal("analyzed"),
      v.literal("error")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, { status: args.status });
  },
});

// ── Mutation: update item with AI analysis results ──────────────────────────
export const updateItemAnalysis = internalMutation({
  args: {
    itemId: v.id("syncItems"),
    technicalSummary: v.string(),
    businessSummary: v.string(),
    keyChanges: v.array(v.string()),
    impactedAreas: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      status: "analyzed",
      technicalSummary: args.technicalSummary,
      businessSummary: args.businessSummary,
      keyChanges: args.keyChanges,
      impactedAreas: args.impactedAreas,
    });

    const item = await ctx.db.get(args.itemId);
    if (!item) return;

    const allItems = await ctx.db
      .query("syncItems")
      .withIndex("by_releaseId", (q) => q.eq("releaseId", item.releaseId))
      .collect();

    const allDone = allItems.every(
      (i) => i.status === "analyzed" || i.status === "error"
    );

    if (allDone) {
      await ctx.db.patch(item.releaseId, { status: "synced" });
    }
  },
});
