// ── Prompt templates for AI analysis ────────────────────────────────────────
// Edit these to fine-tune LLM output quality and formatting.

export function buildContext(item: {
  prNumber: number;
  prTitle: string;
  prAuthor: string;
  prMergedAt: string;
  prDiff?: string;
  linearTicketId?: string;
  linearTitle?: string;
  linearDescription?: string;
}): string {
  return `
PR #${item.prNumber}: ${item.prTitle}
Author: ${item.prAuthor}
Merged: ${item.prMergedAt}
PR Description: ${item.prDiff ?? "No description"}
${item.linearTicketId ? `Linear Ticket: ${item.linearTicketId} - ${item.linearTitle}` : "No linked Linear ticket"}
${item.linearDescription ? `Ticket Description: ${item.linearDescription}` : ""}
  `.trim();
}

export function technicalSummaryPrompt(context: string): string {
  return `You are a senior engineer writing a technical release note. Summarize the following PR changes concisely. Focus on: what code/logic changed, API changes, potential breaking changes, and architectural impact. Keep it to 2-4 sentences.\n\n${context}`;
}

export function businessSummaryPrompt(context: string): string {
  return `You are writing a release note for Sales and Customer Experience teams. Explain what this change means for end users in plain language. Focus on: which user pain points are solved, what new capabilities are available, and what workflows improve. Keep it to 2-4 sentences. Do NOT use technical jargon.\n\n${context}`;
}

export function structuredAnalysisPrompt(context: string): string {
  return `Analyze this PR and return ONLY valid JSON with no markdown formatting, no code fences:
{"keyChanges": ["change 1", "change 2"], "impactedAreas": ["area1", "area2"]}

Key changes should be short bullet points. Impacted areas should be system areas like "auth", "billing", "api", "ui", "database", etc.

${context}`;
}
