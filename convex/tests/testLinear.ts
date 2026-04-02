"use node";

import { action } from "../_generated/server";
import { LinearClient } from "@linear/sdk";

export const testConnection = action({
  args: {},
  handler: async (): Promise<string> => {
    const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY! });
    const teamKey = process.env.LINEAR_TEAM_KEY!;

    const team = await linear.team(teamKey);
    const { nodes: issues } = await team.issues({ first: 5 });

    const summary = issues.map((i) => `${i.identifier}: ${i.title}`).join("\n");
    return `Found ${issues.length} issues in team ${team.name}:\n${summary}`;
  },
});
