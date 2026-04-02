import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// ── Background Action: AI analysis ──────────────────────────────────────────
// Runs in the default Convex runtime (only needs fetch(), no Node.js built-ins)
// Runs asynchronously — does NOT block the UI
export const analyzeItem = internalAction({
  args: { itemId: v.id("syncItems") },
  handler: async (ctx, args) => {
    // Mark as analyzing
    await ctx.runMutation(internal.syncMutations.updateItemStatus, {
      itemId: args.itemId,
      status: "analyzing",
    });

    // Fetch item data
    const item = await ctx.runQuery(internal.syncMutations.getItem, {
      itemId: args.itemId,
    });
    if (!item) return;

    const context = `
PR #${item.prNumber}: ${item.prTitle}
Author: ${item.prAuthor}
Merged: ${item.prMergedAt}
PR Description: ${item.prDiff ?? "No description"}
${item.linearTicketId ? `Linear Ticket: ${item.linearTicketId} - ${item.linearTitle}` : "No linked Linear ticket"}
${item.linearDescription ? `Ticket Description: ${item.linearDescription}` : ""}
    `.trim();

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY!;

      // Generate technical summary (Format A)
      const technicalResponse = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `You are a senior engineer writing a technical release note. Summarize the following PR changes concisely. Focus on: what code/logic changed, API changes, potential breaking changes, and architectural impact. Keep it to 2-4 sentences.\n\n${context}`,
              },
            ],
          }),
        }
      );
      const technicalData = (await technicalResponse.json()) as {
        content: { text: string }[];
      };
      const technicalSummary = technicalData.content[0].text;

      // Generate business summary (Format B)
      const businessResponse = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1024,
            messages: [
              {
                role: "user",
                content: `You are writing a release note for Sales and Customer Experience teams. Explain what this change means for end users in plain language. Focus on: which user pain points are solved, what new capabilities are available, and what workflows improve. Keep it to 2-4 sentences. Do NOT use technical jargon.\n\n${context}`,
              },
            ],
          }),
        }
      );
      const businessData = (await businessResponse.json()) as {
        content: { text: string }[];
      };
      const businessSummary = businessData.content[0].text;

      // Generate structured data (key changes + impacted areas)
      const structuredResponse = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 512,
            messages: [
              {
                role: "user",
                content: `Analyze this PR and return ONLY valid JSON with no markdown formatting:\n{"keyChanges": ["change 1", "change 2"], "impactedAreas": ["area1", "area2"]}\n\nKey changes should be short bullet points. Impacted areas should be system areas like "auth", "billing", "api", "ui", "database", etc.\n\n${context}`,
              },
            ],
          }),
        }
      );
      const structuredData = (await structuredResponse.json()) as {
        content: { text: string }[];
      };
      let keyChanges: string[] = [];
      let impactedAreas: string[] = [];
      try {
        const parsed = JSON.parse(structuredData.content[0].text);
        keyChanges = parsed.keyChanges ?? [];
        impactedAreas = parsed.impactedAreas ?? [];
      } catch {
        keyChanges = ["Unable to parse structured changes"];
        impactedAreas = ["unknown"];
      }

      // Update item with AI results
      await ctx.runMutation(internal.syncMutations.updateItemAnalysis, {
        itemId: args.itemId,
        technicalSummary,
        businessSummary,
        keyChanges,
        impactedAreas,
      });
    } catch (error) {
      console.error("AI analysis failed:", error);
      await ctx.runMutation(internal.syncMutations.updateItemStatus, {
        itemId: args.itemId,
        status: "error",
      });
    }
  },
});
