"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Octokit } from "octokit";
import { LinearClient } from "@linear/sdk";

// ── Ticket ID extraction ────────────────────────────────────────────────────
const TICKET_REGEX = /([A-Z]{2,10}-\d+)/g;

function extractTicketIds(text: string): string[] {
  const matches = text.match(TICKET_REGEX);
  return matches ? [...new Set(matches)] : [];
}

// ── Main sync action (entry point) ──────────────────────────────────────────
// Uses Node.js runtime because Octokit and Linear SDK require Node built-ins
export const triggerSync = action({
  args: {},
  handler: async (ctx) => {
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

    // 2. Fetch Linear tickets
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

    // 3. Correlate PRs with Linear tickets
    const items = mergedPrs.map((pr) => {
      const branchTickets = extractTicketIds(pr.head?.ref ?? "");
      const bodyTickets = extractTicketIds(pr.body ?? "");
      const allTicketIds = [...new Set([...branchTickets, ...bodyTickets])];

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

    // 4. Call mutation to store data + schedule AI analysis
    const releaseId = await ctx.runMutation(
      internal.syncMutations.createRelease,
      { items }
    );

    return releaseId;
  },
});
