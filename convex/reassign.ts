"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { LinearClient } from "@linear/sdk";

export const reassignTicket = action({
  args: {
    itemId: v.id("syncItems"),
    ticketId: v.string(), // e.g. "ARD-17" or "" to clear
  },
  handler: async (ctx, args) => {
    const { itemId, ticketId } = args;

    // Clear ticket reference
    if (!ticketId.trim()) {
      await ctx.runMutation(internal.syncMutations.updateTicketReference, {
        itemId,
        linearTicketId: undefined,
        linearTitle: undefined,
        linearDescription: undefined,
        linearUrl: undefined,
        linearTeamKey: undefined,
        linearTeamName: undefined,
      });
      // No analysis for unlinked items
      await ctx.runMutation(internal.syncMutations.updateItemStatus, {
        itemId,
        status: "analyzed",
      });
      return { success: true, cleared: true };
    }

    // Look up the ticket in Linear
    const linearApiKey = process.env.LINEAR_API_KEY!;
    const linear = new LinearClient({ apiKey: linearApiKey });

    const teamKeyMatch = ticketId.trim().toUpperCase().match(/^([A-Z]+)-\d+$/);
    if (!teamKeyMatch) {
      throw new Error(
        `Invalid ticket ID format: "${ticketId}". Expected format like ARD-123.`
      );
    }

    const teamKey = teamKeyMatch[1];
    const { nodes: teams } = await linear.teams();
    const team = teams.find((t) => t.key === teamKey);
    if (!team) {
      throw new Error(
        `No Linear team found with key "${teamKey}". Available: ${teams.map((t) => t.key).join(", ")}`
      );
    }

    const issue = await linear.issue(ticketId.trim().toUpperCase());
    if (!issue) {
      throw new Error(`Ticket "${ticketId}" not found in Linear.`);
    }

    // Update the sync item with the new ticket
    await ctx.runMutation(internal.syncMutations.updateTicketReference, {
      itemId,
      linearTicketId: issue.identifier,
      linearTitle: issue.title,
      linearDescription: issue.description ?? undefined,
      linearUrl: issue.url,
      linearTeamKey: teamKey,
      linearTeamName: team.name,
    });

    // Re-trigger AI analysis
    await ctx.runAction(internal.analyze.analyzeItem, { itemId });

    return { success: true, ticketId: issue.identifier, title: issue.title };
  },
});
