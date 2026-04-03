"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Octokit } from "octokit";
import { LinearClient } from "@linear/sdk";

// ── Ticket ID extraction ────────────────────────────────────────────────────
// Searches text for ticket IDs matching any of the given team prefixes
function extractTicketIds(text: string, teamPrefixes: string[]): string[] {
  const ids: string[] = [];
  const prefixPattern = teamPrefixes.join("|");

  // Match direct ticket IDs (e.g., ARD-123, OPS-5)
  const directRegex = new RegExp(`((?:${prefixPattern})-\\d+)`, "gi");
  const directMatches = text.match(directRegex);
  if (directMatches) ids.push(...directMatches);

  // Match Linear URLs containing ticket IDs
  const urlRegex = new RegExp(
    `linear\\.app/[^/]+/issue/((?:${prefixPattern})-\\d+)`,
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

    // 3. Fetch ALL Linear teams and their recent tickets
    const linear = new LinearClient({ apiKey: linearApiKey });
    const { nodes: teams } = await linear.teams();

    // Map of team key -> team info
    const teamInfoMap = new Map<
      string,
      { key: string; name: string }
    >();

    // Map of ticket identifier -> ticket data
    const ticketMap = new Map<
      string,
      { id: string; title: string; description?: string; url: string; teamKey: string; teamName: string }
    >();

    for (const team of teams) {
      teamInfoMap.set(team.key, { key: team.key, name: team.name });

      const { nodes: issues } = await team.issues({ first: 10 });

      for (const issue of issues) {
        ticketMap.set(issue.identifier, {
          id: issue.identifier,
          title: issue.title,
          description: issue.description ?? undefined,
          url: issue.url,
          teamKey: team.key,
          teamName: team.name,
        });
      }
      console.log(`Found ${issues.length} Linear tickets in team ${team.name} (${team.key})`);
    }

    const teamPrefixes = [...teamInfoMap.keys()];

    // 4. Correlate PRs with Linear tickets across all teams
    const items = newPrs.map((pr) => {
      const branchTickets = extractTicketIds(pr.head?.ref ?? "", teamPrefixes);
      const titleTickets = extractTicketIds(pr.title ?? "", teamPrefixes);
      const bodyTickets = extractTicketIds(pr.body ?? "", teamPrefixes);
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
        linearTeamKey: matchedTicket?.teamKey,
        linearTeamName: matchedTicket?.teamName,
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
