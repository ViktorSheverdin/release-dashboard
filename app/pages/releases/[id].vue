<script setup lang="ts">
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

const route = useRoute()
const releaseId = route.params.id as Id<'releases'>
const teamFilter = computed(() => route.query.team as string | undefined)

const { data: release } = useConvexQuery(api.releases.get, { id: releaseId })
const { data: items } = useConvexQuery(api.releases.getItems, { releaseId })
const { execute: sendToSlack } = useConvexAction(api.slack.sendToSlack)
const { execute: sendReleaseToSlack } = useConvexAction(api.slack.sendReleaseToSlack)
const { execute: reassignTicket } = useConvexAction(api.reassign.reassignTicket)

const sendingSlack = ref<Record<string, boolean>>({})
const reassigning = ref<Record<string, boolean>>({})
const sendingAll = ref(false)

const slackCooldown = ref<Record<string, boolean>>({})
const sendAllCooldown = ref(false)

async function handleSendToSlack(itemId: string) {
  if (slackCooldown.value[itemId]) return
  sendingSlack.value[itemId] = true
  try {
    await sendToSlack({ itemId: itemId as Id<'syncItems'> })
  } catch (e) {
    console.error('Slack send failed:', e)
  } finally {
    sendingSlack.value[itemId] = false
    slackCooldown.value[itemId] = true
    setTimeout(() => { slackCooldown.value[itemId] = false }, 3000)
  }
}

async function handleReassign(itemId: string, ticketId: string) {
  reassigning.value[itemId] = true
  try {
    await reassignTicket({ itemId: itemId as Id<'syncItems'>, ticketId })
  } catch (e) {
    console.error('Reassign failed:', e)
    alert(`Failed to reassign ticket: ${(e as Error).message}`)
  } finally {
    reassigning.value[itemId] = false
  }
}

async function handleSendAll() {
  if (sendAllCooldown.value) return
  sendingAll.value = true
  try {
    await sendReleaseToSlack({ releaseId })
  } catch (e) {
    console.error('Slack send failed:', e)
  } finally {
    sendingAll.value = false
    sendAllCooldown.value = true
    setTimeout(() => { sendAllCooldown.value = false }, 3000)
  }
}

// Filter items by team query param
const filteredItems = computed(() => {
  if (!items.value) return []
  const filter = teamFilter.value
  if (!filter) return items.value

  return items.value.filter((item) => {
    const teamKey = item.linearTeamKey ?? item.linearTicketId?.match(/^([A-Z]+)-/)?.[1]
    if (filter === '__global__') return !teamKey
    return teamKey === filter
  })
})

const analyzedCount = computed(() =>
  filteredItems.value.filter((i) => i.status === 'analyzed').length
)
const totalCount = computed(() => filteredItems.value.length)

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

// Group filtered items by team tag
const groupedItems = computed(() => {
  if (!filteredItems.value.length) return []

  const groups = new Map<string, { label: string; status: string; items: typeof items.value }>()

  for (const item of filteredItems.value) {
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
    <UiBackLink to="/" label="Back to Dashboard" />

    <div v-if="release" class="mt-4">
      <UiPageHeader
        :title="groupedItems.length === 1 ? groupedItems[0].label : 'Release Report'"
        :subtitle="`${new Date(release.syncedAt).toLocaleString()} · ${analyzedCount}/${totalCount} analyzed`"
      >
        <template #badge>
          <StatusBadge :status="release.status" />
        </template>
        <template #action>
          <UiActionButton
            v-if="analyzedCount > 0"
            variant="success"
            :disabled="sendingAll || sendAllCooldown"
            @click="handleSendAll"
          >
            {{ sendingAll ? 'Sending...' : sendAllCooldown ? 'Sent' : `Send All to Slack (${analyzedCount})` }}
          </UiActionButton>
        </template>
      </UiPageHeader>

      <!-- Progress bar -->
      <div class="mb-8">
        <UiProgressBar :current="analyzedCount" :total="totalCount" />
      </div>

      <!-- Grouped items -->
      <div class="space-y-8">
        <div v-for="group in groupedItems" :key="group.label">
          <!-- Group header -->
          <div class="mb-3">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UiGroupStatusBadge :status="group.status" />
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
              :slack-cooldown="slackCooldown[item._id] ?? false"
              :reassigning="reassigning[item._id] ?? false"
              @send-slack="handleSendToSlack(item._id)"
              @reassign="handleReassign(item._id, $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
