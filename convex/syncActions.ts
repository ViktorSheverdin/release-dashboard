"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Octokit } from "octokit";
import { LinearClient } from "@linear/sdk";

// ── Ticket ID extraction ────────────────────────────────────────────────────
// Matches:
// 1. Direct IDs like ENG-123, PROJ-45 (case insensitive)
// 2. Linear URLs like https://linear.app/team/issue/ENG-123/some-title
function extractTicketIds(text: string, teamPrefix: string): string[] {
  const ids: string[] = [];

  // Match direct ticket IDs (e.g., ENG-123)
  const directRegex = new RegExp(`(${teamPrefix}-\\d+)`, "gi");
  const directMatches = text.match(directRegex);
  if (directMatches) ids.push(...directMatches);

  // Match Linear URLs containing ticket IDs
  const urlRegex = new RegExp(
    `linear\\.app/[^/]+/issue/(${teamPrefix}-\\d+)`,
    "gi"
  );
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    ids.push(urlMatch[1]);
  }

  // Normalize to uppercase and deduplicate
  return [...new Set(ids.map((m) => m.toUpperCase()))];
}

// ── Main sync action (entry point) ──────────────────────────────────────────
export const triggerSync = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    const githubToken = process.env.GITHUB_TOKEN!;
    const linearApiKey = process.env.LINEAR_API_KEY!;
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;
    const linearTeamKey = process.env.LINEAR_TEAM_KEY!;

    // 1. Fetch merged PRs from GitHub
    const octokit = new Octokit({ auth: githubToken });
    const { data: prs } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "closed",
      sort: "updated",
      direction: "desc",
      per_page: 30,
    });

    const mergedPrs = prs.filter((pr) => pr.merged_at !== null);

    // 2. Check which PRs are already synced (avoid duplicates)
    const existingItems: { prNumber: number }[] = await ctx.runQuery(
      internal.syncMutations.getAllSyncedPrNumbers
    );
    const syncedPrNumbers = new Set(existingItems.map((i) => i.prNumber));
    const newPrs = mergedPrs.filter((pr) => !syncedPrNumbers.has(pr.number));

    if (newPrs.length === 0) {
      return "no_new_prs";
    }

    // 3. Fetch Linear tickets
    const linear = new LinearClient({ apiKey: linearApiKey });
    const team = await linear.team(linearTeamKey);
    const { nodes: issues } = await team.issues({
      first: 100,
      filter: { state: { type: { in: ["completed", "started"] } } },
    });

    // Build a map of ticket ID → Linear issue for fast lookup
    const ticketMap = new Map<
      string,
      { id: string; title: string; description?: string; url: string }
    >();
    for (const issue of issues) {
      ticketMap.set(issue.identifier, {
        id: issue.identifier,
        title: issue.title,
        description: issue.description ?? undefined,
        url: issue.url,
      });
    }

    // 4. Correlate PRs with Linear tickets
    const items = newPrs.map((pr) => {
      // Search branch name, PR title, and PR body for ticket IDs
      const branchTickets = extractTicketIds(pr.head?.ref ?? "", linearTeamKey);
      const titleTickets = extractTicketIds(pr.title ?? "", linearTeamKey);
      const bodyTickets = extractTicketIds(pr.body ?? "", linearTeamKey);
      const allTicketIds = [
        ...new Set([...branchTickets, ...titleTickets, ...bodyTickets]),
      ];

      // Find first matching Linear ticket
      const matchedTicket = allTicketIds
        .map((id) => ticketMap.get(id))
        .find((t) => t !== undefined);

      const diffSummary = pr.body?.slice(0, 500) ?? "";

      return {
        prNumber: pr.number,
        prTitle: pr.title,
        prUrl: pr.html_url,
        prAuthor: pr.user?.login ?? "unknown",
        prMergedAt: pr.merged_at!,
        prDiff: diffSummary,
        linearTicketId: matchedTicket?.id,
        linearTitle: matchedTicket?.title,
        linearDescription: matchedTicket?.description,
        linearUrl: matchedTicket?.url,
      };
    });

    // 5. Call mutation to store data + schedule AI analysis
    const releaseId = await ctx.runMutation(
      internal.syncMutations.createRelease,
      { items }
    );

    return releaseId;
  },
});
