import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  releases: defineTable({
    syncedAt: v.number(),
    status: v.union(
      v.literal("syncing"),
      v.literal("synced"),
      v.literal("error")
    ),
    prCount: v.number(),
    matchedCount: v.number(),
  }),

  syncItems: defineTable({
    releaseId: v.id("releases"),
    // GitHub PR data
    prNumber: v.number(),
    prTitle: v.string(),
    prUrl: v.string(),
    prAuthor: v.string(),
    prMergedAt: v.string(),
    prDiff: v.optional(v.string()),
    // Linear ticket data (optional — not all PRs match a ticket)
    linearTicketId: v.optional(v.string()),
    linearTitle: v.optional(v.string()),
    linearDescription: v.optional(v.string()),
    linearUrl: v.optional(v.string()),
    // Linear team data (for grouping by team)
    linearTeamKey: v.optional(v.string()),
    linearTeamName: v.optional(v.string()),
    // AI-generated summaries — structured, queryable fields
    status: v.union(
      v.literal("pending"),
      v.literal("analyzing"),
      v.literal("analyzed"),
      v.literal("error")
    ),
    technicalSummary: v.optional(v.string()),
    businessSummary: v.optional(v.string()),
    keyChanges: v.optional(v.array(v.string())),
    impactedAreas: v.optional(v.array(v.string())),
    slackSent: v.boolean(),
  })
    .index("by_releaseId", ["releaseId"])
    .index("by_status", ["status"]),
});
