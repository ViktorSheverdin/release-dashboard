# Release Intelligence Dashboard

Real-time release dashboard: syncs GitHub PRs with Linear tickets across all teams, generates AI summaries, distributes to Slack.

## File Structure

```
convex/                        # Backend (Convex serverless)
├── schema.ts                  # DB schema: releases, syncItems tables
├── syncActions.ts             # Entry point: GitHub fetch + Linear correlation
├── syncMutations.ts           # DB writes: create releases, update items, reassign tickets
├── releases.ts                # Queries: list (with team groups), get, getItems
├── reassign.ts                # Action: change ticket reference + re-trigger analysis
├── analyze.ts                 # Action: orchestrates AI analysis per item
├── slack.ts                   # Action: send to Slack (single + bulk)
└── lib/
    ├── aiProvider.ts           # Swappable AI provider interface (Gemini impl)
    └── prompts.ts              # All LLM prompt templates (editable for fine-tuning)

app/                           # Frontend (Nuxt 3 + Vue 3)
├── pages/
│   ├── index.vue              # Dashboard: team group cards + global changes
│   └── releases/[id].vue     # Detail: filtered by ?team= query param
├── components/
│   ├── TeamGroupCard.vue      # Clickable card per team on index
│   ├── SyncItemCard.vue       # PR card with analysis, slack, ticket reassign
│   ├── StatusBadge.vue        # Item status pill (syncing/analyzed/error)
│   └── ui/                    # Reusable styled wrappers
│       ├── CardShell.vue      # Dark rounded card container
│       ├── GroupStatusBadge.vue # Team group status pill
│       ├── ProgressBar.vue    # Analysis progress bar
│       ├── PageHeader.vue     # Title + subtitle + action slot
│       ├── ActionButton.vue   # Button variants: primary/success/ghost
│       ├── BackLink.vue       # Back navigation
│       ├── SpinnerIcon.vue    # Loading spinner
│       └── ChevronRight.vue   # Arrow icon
├── composables/
│   └── useConvex.ts           # Reactive query/mutation/action hooks
└── plugins/
    └── convex.client.ts       # ConvexClient initialization
```

## Mutation Order (Sync Pipeline)

```
1. triggerSync (Action)
   ├── Fetch merged PRs from GitHub (Octokit)
   ├── Dedup against existing syncItems
   ├── Fetch ALL Linear teams + last 10 issues per team
   ├── Extract ticket IDs from branch/title/body (regex, all team prefixes)
   └── Match PRs to tickets across teams

2. addToRelease (Mutation — transactional)
   ├── Create or update release record (status: "syncing")
   ├── Insert syncItems (matched → status: "pending", unmatched → "analyzed")
   └── Schedule analyzeItem for matched items only

3. analyzeItem (Internal Action — background, per item)
   ├── Set status → "analyzing"
   ├── Build context from PR + ticket data (lib/prompts.ts)
   ├── Call AI provider 3x (lib/aiProvider.ts):
   │   technical summary, business summary, structured JSON
   └── Call updateItemAnalysis mutation

4. updateItemAnalysis (Mutation)
   ├── Patch item with AI results (status → "analyzed")
   └── Check if all items done → release status → "synced"
```

Key patterns:
- **Actions** = external API calls (can't write DB directly)
- **Mutations** = transactional DB writes (can schedule actions)
- **`ctx.scheduler.runAfter(0, ...)`** = non-blocking: items appear instantly as "pending", AI runs in background
- Unmatched PRs (Global Changes) skip AI analysis entirely

## Render Order (Frontend)

```
index.vue
├── PageHeader ("Release Dashboard" + Sync Now button)
├── For each release:
│   ├── TeamGroupCard per team (status + name + PR count)
│   │   Links to /releases/[id]?team=ARD
│   └── TeamGroupCard for Global Changes (if any)
│       Links to /releases/[id]?team=__global__

releases/[id].vue (filtered by ?team= query param)
├── BackLink → /
├── PageHeader (team name or "Release Report" + Send All button)
├── ProgressBar (analyzed / total)
└── For each group (usually 1 when filtered):
    ├── GroupStatusBadge + label + PR count
    └── SyncItemCard per PR:
        ├── StatusBadge + PR link + author + merge date
        ├── Ticket reference (editable: Change / Link ticket)
        ├── Business summary (always visible)
        ├── Technical details (collapsible)
        │   ├── Technical summary
        │   ├── Key changes (bullets)
        │   └── Impacted areas (tags)
        └── Send to Slack button (3s cooldown)
```

Reactivity: Convex queries auto-update via WebSocket. When AI analysis completes on the backend, the item status and summaries appear on all connected clients instantly.

## Ticket Reassignment Flow

```
User clicks "Change" on SyncItemCard
→ Types new ticket ID (e.g., OPS-5)
→ reassignTicket (Action):
   ├── Look up ticket in Linear API
   ├── Update syncItem (new ticket + team info, clear old analysis)
   └── Re-trigger analyzeItem
→ Item moves to correct team group, new AI summary generated
```

## Tech Stack

- **Frontend**: Nuxt 3 (Vue 3 Composition API + TypeScript)
- **Backend**: Convex (database + serverless functions)
- **AI**: Google Gemini 2.5 Flash (swappable via `lib/aiProvider.ts`)
- **APIs**: Linear SDK, Octokit (GitHub), Slack Incoming Webhooks
- **Styling**: Tailwind CSS

## Setup

```bash
pnpm install
npx convex dev          # Backend (authenticates + syncs functions)
pnpm dev                # Frontend (http://localhost:3000)
```

Environment variables (set via `npx convex env set`):
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`
- `LINEAR_API_KEY`
- `GEMINI_API_KEY`
- `SLACK_WEBHOOK_URL`
