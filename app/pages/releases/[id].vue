<script setup lang="ts">
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

const route = useRoute()
const releaseId = route.params.id as Id<'releases'>

const { data: release } = useConvexQuery(api.releases.get, { id: releaseId })
const { data: items } = useConvexQuery(api.releases.getItems, { releaseId })
const { execute: sendToSlack } = useConvexAction(api.slack.sendToSlack)
const { execute: sendReleaseToSlack } = useConvexAction(api.slack.sendReleaseToSlack)

const sendingSlack = ref<Record<string, boolean>>({})
const sendingAll = ref(false)

async function handleSendToSlack(itemId: string) {
  sendingSlack.value[itemId] = true
  try {
    await sendToSlack({ itemId: itemId as Id<'syncItems'> })
  } catch (e) {
    console.error('Slack send failed:', e)
  } finally {
    sendingSlack.value[itemId] = false
  }
}

async function handleSendAll() {
  sendingAll.value = true
  try {
    await sendReleaseToSlack({ releaseId })
  } catch (e) {
    console.error('Slack send failed:', e)
  } finally {
    sendingAll.value = false
  }
}

const analyzedCount = computed(() =>
  items.value?.filter((i) => i.status === 'analyzed').length ?? 0
)
const totalCount = computed(() => items.value?.length ?? 0)

// Derive group status from item statuses
function getGroupStatus(groupItems: typeof items.value): string {
  if (!groupItems || groupItems.length === 0) return 'Pending'
  const allAnalyzed = groupItems.every((i) => i.status === 'analyzed')
  if (allAnalyzed) return 'Completed'
  const hasError = groupItems.some((i) => i.status === 'error')
  if (hasError) return 'Error'
  const hasAnalyzing = groupItems.some((i) => i.status === 'analyzing')
  if (hasAnalyzing) return 'Analyzing'
  return 'Pending'
}

// Group items by team tag — PRs without a team go under "Global Changes"
const groupedItems = computed(() => {
  if (!items.value) return []

  const groups = new Map<string, { label: string; status: string; items: typeof items.value }>()

  for (const item of items.value) {
    // Determine team key: prefer stored field, fall back to extracting from ticket ID
    const teamKey = item.linearTeamKey ?? item.linearTicketId?.match(/^([A-Z]+)-/)?.[1]
    const teamName = item.linearTeamName

    if (teamKey) {
      if (!groups.has(teamKey)) {
        const displayName = teamName ? `${teamName} (${teamKey})` : teamKey
        groups.set(teamKey, {
          label: displayName,
          status: '',
          items: [],
        })
      }
      groups.get(teamKey)!.items.push(item)
    } else {
      if (!groups.has('__global__')) {
        groups.set('__global__', { label: 'Global Changes', status: '', items: [] })
      }
      groups.get('__global__')!.items.push(item)
    }
  }

  // Sort items within each group by merge date (most recent first) and compute status
  for (const group of groups.values()) {
    group.items.sort((a, b) => new Date(b.prMergedAt).getTime() - new Date(a.prMergedAt).getTime())
    group.status = getGroupStatus(group.items)
  }

  // Team groups first, Global Changes last
  const sorted = [...groups.entries()].sort((a, b) => {
    if (a[0] === '__global__') return 1
    if (b[0] === '__global__') return -1
    return 0
  })

  return sorted.map(([, group]) => group)
})
</script>

<template>
  <div>
    <NuxtLink to="/" class="text-sm text-indigo-400 hover:text-indigo-300 mb-6 inline-flex items-center gap-1">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Dashboard
    </NuxtLink>

    <div v-if="release" class="mt-4">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold flex items-center gap-3">
            Release Report
            <StatusBadge :status="release.status" />
          </h2>
          <p class="text-gray-400 mt-1">
            {{ new Date(release.syncedAt).toLocaleString() }}
            &middot; {{ analyzedCount }}/{{ totalCount }} analyzed
          </p>
        </div>
        <button
          v-if="analyzedCount > 0"
          @click="handleSendAll"
          :disabled="sendingAll"
          class="px-4 py-2 bg-green-700 hover:bg-green-600 disabled:bg-green-900 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {{ sendingAll ? 'Sending...' : `Send All to Slack (${analyzedCount})` }}
        </button>
      </div>

      <!-- Progress bar -->
      <div class="mb-8 bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          class="h-full bg-indigo-500 transition-all duration-500 ease-out"
          :style="{ width: totalCount > 0 ? `${(analyzedCount / totalCount) * 100}%` : '0%' }"
        />
      </div>

      <!-- Grouped items -->
      <div class="space-y-8">
        <div v-for="group in groupedItems" :key="group.label">
          <!-- Group header -->
          <div class="mb-3">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="{
                  'bg-green-900/50 text-green-400': group.status === 'Completed',
                  'bg-yellow-900/50 text-yellow-400': group.status === 'Analyzing',
                  'bg-gray-700 text-gray-400': group.status === 'Pending',
                  'bg-red-900/50 text-red-400': group.status === 'Error',
                }"
              >
                {{ group.status }}
              </span>
              <span class="text-gray-300">{{ group.label }}</span>
              <span class="text-gray-500 font-normal">
                ({{ group.items.length }} PR{{ group.items.length !== 1 ? 's' : '' }} synced)
              </span>
            </h3>
          </div>

          <!-- Items in group -->
          <div class="space-y-4">
            <SyncItemCard
              v-for="item in group.items"
              :key="item._id"
              :item="item"
              :sending="sendingSlack[item._id] ?? false"
              @send-slack="handleSendToSlack(item._id)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
