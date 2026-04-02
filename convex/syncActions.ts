"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Octokit } from "octokit";
import { LinearClient } from "@linear/sdk";

// ── Ticket ID extraction ────────────────────────────────────────────────────
function extractTicketIds(text: string, teamPrefix: string): string[] {
  const ids: string[] = [];

  // Match direct ticket IDs (e.g., ARD-123)
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
    const linearTeamKey = process.env.LINEAR_TEAM_KEY!; // e.g. "ARD"

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

    // 3. Fetch Linear tickets — find team by key prefix, not UUID
    const linear = new LinearClient({ apiKey: linearApiKey });
    const { nodes: teams } = await linear.teams();
    const team = teams.find((t) => t.key === linearTeamKey);

    const ticketMap = new Map<
      string,
      { id: string; title: string; description?: string; url: string }
    >();

    if (team) {
      const { nodes: issues } = await team.issues({
        first: 100,
      });

      for (const issue of issues) {
        ticketMap.set(issue.identifier, {
          id: issue.identifier,
          title: issue.title,
          description: issue.description ?? undefined,
          url: issue.url,
        });
      }
      console.log(`Found ${ticketMap.size} Linear tickets in team ${team.name} (${team.key})`);
    } else {
      console.warn(`No Linear team found with key "${linearTeamKey}". Available teams: ${teams.map(t => t.key).join(", ")}`);
    }

    // 4. Correlate PRs with Linear tickets
    const items = newPrs.map((pr) => {
      const branchTickets = extractTicketIds(pr.head?.ref ?? "", linearTeamKey);
      const titleTickets = extractTicketIds(pr.title ?? "", linearTeamKey);
      const bodyTickets = extractTicketIds(pr.body ?? "", linearTeamKey);
      const allTicketIds = [
        ...new Set([...branchTickets, ...titleTickets, ...bodyTickets]),
      ];

      const matchedTicket = allTicketIds
        .map((id) => ticketMap.get(id))
        .find((t) => t !== undefined);

      console.log(`PR #${pr.number} "${pr.title}" — branch: ${pr.head?.ref} — found IDs: [${allTicketIds.join(", ")}] — matched: ${matchedTicket?.id ?? "none"}`);

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

    // 5. Add items to existing release for today, or create new one
    const releaseId = await ctx.runMutation(
      internal.syncMutations.addToRelease,
      { items }
    );

    return releaseId;
  },
});
