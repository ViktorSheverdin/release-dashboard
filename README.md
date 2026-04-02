# Release Intelligence Dashboard

A real-time release dashboard that syncs GitHub PRs with Linear tickets, generates AI-powered dual-format summaries (technical + business), and distributes them to Slack.

The team prefix is ARD
Small change

## Architecture

### Data Flow: Sync → AI Processing → Database Update

```
1. triggerSync (Action)
   ├── Fetches merged PRs from GitHub via Octokit
   ├── Fetches tickets from Linear API
   └── Correlates PRs ↔ tickets via regex on branch names + PR body
          │
2. createRelease (Mutation — transactional)
   ├── Inserts Release record (status: "syncing")
   ├── Inserts SyncItem records (status: "pending")
   └── Schedules analyzeItem Action for each item
          │
3. analyzeItem (Internal Action — background, non-blocking)
   ├── Calls Gemini API for technical summary
   ├── Calls Gemini API for business summary
   ├── Calls Gemini API for structured data (keyChanges, impactedAreas)
   └── Calls updateItemAnalysis Mutation
          │
4. updateItemAnalysis (Mutation)
   ├── Patches SyncItem with AI results (status: "analyzed")
   └── Checks if all items done → updates Release status to "synced"
```

### Why these specific Convex functions?

- **Actions** for external API calls (GitHub, Linear, Gemini, Slack). Actions can make network requests but cannot write to the DB directly.
- **Mutations** for all database writes. Mutations are transactional — all writes succeed or none do. They can also schedule Actions, which is how we chain the async pipeline.
- **Queries** for reactive reads. The frontend subscribes to queries, and Convex automatically pushes updates via WebSocket when underlying data changes.
- **`ctx.scheduler.runAfter(0, ...)`** — This is the key pattern for non-blocking AI processing. The mutation writes "pending" items instantly (UI updates immediately), then background Actions process each item with AI asynchronously.

### Why Convex over a traditional cron job?

1. **Real-time reactivity**: When an AI analysis completes and the mutation updates the DB, every connected client sees the change instantly. No polling, no refresh buttons, no stale data.
2. **Transactional guarantees**: Mutations are atomic. No race conditions when multiple items finish analyzing simultaneously.
3. **Built-in scheduling**: `ctx.scheduler.runAfter()` replaces the need for separate job queue infrastructure (Redis, Bull, SQS). The scheduler is integrated with the database — scheduled jobs reference DB records by ID with type safety.
4. **Type-safe end-to-end**: Schema → backend functions → generated API → frontend composables, all TypeScript with auto-completion.
5. **No infrastructure management**: No servers, no connection pooling, no deployment pipelines. `npx convex dev` syncs functions to the cloud.

## Tech Stack

- **Frontend**: Nuxt 3 (Vue 3 Composition API + TypeScript)
- **Backend**: Convex (database + serverless functions)
- **AI**: Google Gemini 2.5 Flash (via direct API calls from Convex Actions)
- **APIs**: Linear SDK, Octokit (GitHub), Slack Incoming Webhooks
- **Styling**: Tailwind CSS

## Setup

```bash
# Install dependencies
pnpm install

# Start Convex (authenticates via GitHub, creates project)
npx convex dev

# Set environment variables in Convex
npx convex env set GITHUB_TOKEN "ghp_..."
npx convex env set GITHUB_OWNER "your-username"
npx convex env set GITHUB_REPO "your-repo"
npx convex env set LINEAR_API_KEY "lin_api_..."
npx convex env set LINEAR_TEAM_KEY "ENG"
npx convex env set GEMINI_API_KEY "AIza..."
npx convex env set SLACK_WEBHOOK_URL "https://hooks.slack.com/..."

# Start the dev server (in a separate terminal)
pnpm dev
```

## Development

Run both Convex and Nuxt in separate terminals:

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Nuxt frontend
pnpm dev
```

Visit `http://localhost:3000`, click "Sync Now", and watch the real-time pipeline in action.
