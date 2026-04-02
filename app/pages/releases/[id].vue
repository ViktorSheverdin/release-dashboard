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

// Group items: by Linear ticket, unmatched go under "Global Changes"
const groupedItems = computed(() => {
  if (!items.value) return []

  const groups = new Map<string, { label: string; ticketUrl?: string; items: typeof items.value }>()

  for (const item of items.value) {
    if (item.linearTicketId) {
      const key = item.linearTicketId
      if (!groups.has(key)) {
        groups.set(key, {
          label: `${item.linearTicketId} — ${item.linearTitle ?? 'Unknown'}`,
          ticketUrl: item.linearUrl,
          items: [],
        })
      }
      groups.get(key)!.items.push(item)
    } else {
      if (!groups.has('__global__')) {
        groups.set('__global__', { label: 'Global Changes', items: [] })
      }
      groups.get('__global__')!.items.push(item)
    }
  }

  // Put matched tickets first, Global Changes last
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
          <div class="flex items-center gap-2 mb-3">
            <h3 class="text-lg font-semibold">
              <a
                v-if="group.ticketUrl"
                :href="group.ticketUrl"
                target="_blank"
                class="text-violet-400 hover:text-violet-300 transition-colors"
              >
                {{ group.label }}
              </a>
              <span v-else class="text-gray-300">{{ group.label }}</span>
            </h3>
            <span class="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
              {{ group.items.length }} PR{{ group.items.length !== 1 ? 's' : '' }}
            </span>
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
