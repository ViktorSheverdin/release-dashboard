"use node";

import { action } from "../_generated/server";
import { Octokit } from "octokit";

export const testConnection = action({
  args: {},
  handler: async (): Promise<string> => {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN! });
    const owner = process.env.GITHUB_OWNER!;
    const repo = process.env.GITHUB_REPO!;

    const { data: prs } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "closed",
      sort: "updated",
      direction: "desc",
      per_page: 5,
    });

    const merged = prs.filter((pr) => pr.merged_at !== null);
    const summary = merged.map((pr) => `#${pr.number}: ${pr.title} (${pr.head.ref})`).join("\n");
    return `Found ${merged.length} merged PRs in ${owner}/${repo}:\n${summary}`;
  },
});
