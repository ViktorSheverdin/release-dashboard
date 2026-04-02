import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

async function callClaude(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Claude API error:", JSON.stringify(data));
    throw new Error(`Claude API ${response.status}: ${data?.error?.message ?? "unknown error"}`);
  }

  if (!data.content?.[0]?.text) {
    console.error("Unexpected Claude response:", JSON.stringify(data));
    throw new Error("No text in Claude response");
  }

  return data.content[0].text;
}

export const analyzeItem = internalAction({
  args: { itemId: v.id("syncItems") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.syncMutations.updateItemStatus, {
      itemId: args.itemId,
      status: "analyzing",
    });

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

      console.log(`Analyzing PR #${item.prNumber}, API key starts with: ${apiKey.slice(0, 10)}...`);

      const technicalSummary = await callClaude(
        apiKey,
        `You are a senior engineer writing a technical release note. Summarize the following PR changes concisely. Focus on: what code/logic changed, API changes, potential breaking changes, and architectural impact. Keep it to 2-4 sentences.\n\n${context}`
      );

      const businessSummary = await callClaude(
        apiKey,
        `You are writing a release note for Sales and Customer Experience teams. Explain what this change means for end users in plain language. Focus on: which user pain points are solved, what new capabilities are available, and what workflows improve. Keep it to 2-4 sentences. Do NOT use technical jargon.\n\n${context}`
      );

      let keyChanges: string[] = [];
      let impactedAreas: string[] = [];
      try {
        const structuredText = await callClaude(
          apiKey,
          `Analyze this PR and return ONLY valid JSON with no markdown formatting:\n{"keyChanges": ["change 1", "change 2"], "impactedAreas": ["area1", "area2"]}\n\nKey changes should be short bullet points. Impacted areas should be system areas like "auth", "billing", "api", "ui", "database", etc.\n\n${context}`
        );
        const parsed = JSON.parse(structuredText);
        keyChanges = parsed.keyChanges ?? [];
        impactedAreas = parsed.impactedAreas ?? [];
      } catch {
        keyChanges = ["Unable to parse structured changes"];
        impactedAreas = ["unknown"];
      }

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
