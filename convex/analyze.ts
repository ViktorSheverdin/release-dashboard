import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { createGeminiProvider } from "./lib/aiProvider";
import {
  buildContext,
  technicalSummaryPrompt,
  businessSummaryPrompt,
  structuredAnalysisPrompt,
} from "./lib/prompts";

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

    try {
      const ai = createGeminiProvider(process.env.GEMINI_API_KEY!);
      const context = buildContext(item);

      const technicalSummary = await ai.complete(
        technicalSummaryPrompt(context)
      );

      const businessSummary = await ai.complete(
        businessSummaryPrompt(context)
      );

      let keyChanges: string[] = [];
      let impactedAreas: string[] = [];
      try {
        const structuredText = await ai.complete(
          structuredAnalysisPrompt(context)
        );
        const cleaned = structuredText.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned);
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
