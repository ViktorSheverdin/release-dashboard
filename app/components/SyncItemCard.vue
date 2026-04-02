<script setup lang="ts">
defineProps<{
  item: {
    _id: string
    prNumber: number
    prTitle: string
    prUrl: string
    prAuthor: string
    prMergedAt: string
    linearTicketId?: string
    linearTitle?: string
    linearUrl?: string
    status: string
    technicalSummary?: string
    businessSummary?: string
    keyChanges?: string[]
    impactedAreas?: string[]
    slackSent: boolean
  }
  sending: boolean
}>()

defineEmits<{
  sendSlack: []
}>()

const showTechnical = ref(false)
</script>

<template>
  <div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="p-5">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <StatusBadge :status="item.status" />
            <span v-if="item.slackSent" class="text-xs text-green-400">
              ✓ Sent to Slack
            </span>
          </div>
          <a
            :href="item.prUrl"
            target="_blank"
            class="text-lg font-medium hover:text-indigo-400 transition-colors"
          >
            PR #{{ item.prNumber }}: {{ item.prTitle }}
          </a>
          <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span>by {{ item.prAuthor }}</span>
            <span>&middot;</span>
            <span>merged {{ new Date(item.prMergedAt).toLocaleDateString() }}</span>
          </div>
        </div>
        <button
          v-if="item.status === 'analyzed' && !item.slackSent"
          @click="$emit('sendSlack')"
          :disabled="sending"
          class="ml-4 px-3 py-1.5 bg-green-700 hover:bg-green-600 disabled:bg-green-900 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
        >
          {{ sending ? 'Sending...' : 'Send to Slack' }}
        </button>
      </div>

      <!-- Linear ticket link -->
      <div v-if="item.linearTicketId" class="mt-3 flex items-center gap-2 text-sm">
        <span class="px-2 py-0.5 bg-violet-900/50 text-violet-300 rounded text-xs font-mono">
          {{ item.linearTicketId }}
        </span>
        <a
          v-if="item.linearUrl"
          :href="item.linearUrl"
          target="_blank"
          class="text-gray-400 hover:text-violet-300 transition-colors"
        >
          {{ item.linearTitle }}
        </a>
      </div>
    </div>

    <!-- Skeleton loading state -->
    <div v-if="item.status === 'pending' || item.status === 'analyzing'" class="px-5 pb-5">
      <div class="space-y-3 animate-pulse">
        <div class="h-4 bg-gray-800 rounded w-3/4" />
        <div class="h-4 bg-gray-800 rounded w-1/2" />
        <div class="h-4 bg-gray-800 rounded w-5/6" />
      </div>
      <p v-if="item.status === 'analyzing'" class="text-sm text-amber-400 mt-3">
        AI is generating summaries...
      </p>
    </div>

    <!-- Analyzed content -->
    <div v-if="item.status === 'analyzed'" class="border-t border-gray-800">
      <!-- Business summary (shown by default) -->
      <div class="p-5">
        <h4 class="text-sm font-semibold text-green-400 mb-2">💡 What This Means for Users</h4>
        <p class="text-sm text-gray-300 leading-relaxed">{{ item.businessSummary }}</p>
      </div>

      <!-- Toggle for technical details -->
      <div class="border-t border-gray-800">
        <button
          @click="showTechnical = !showTechnical"
          class="w-full px-5 py-3 text-sm text-gray-400 hover:text-gray-200 flex items-center justify-between transition-colors"
        >
          <span>🔧 Technical Details</span>
          <svg
            class="w-4 h-4 transition-transform"
            :class="{ 'rotate-180': showTechnical }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="showTechnical" class="px-5 pb-5 space-y-4">
          <div>
            <h4 class="text-sm font-semibold text-blue-400 mb-2">Technical Summary</h4>
            <p class="text-sm text-gray-300 leading-relaxed">{{ item.technicalSummary }}</p>
          </div>

          <div v-if="item.keyChanges && item.keyChanges.length > 0">
            <h4 class="text-sm font-semibold text-gray-400 mb-2">Key Changes</h4>
            <ul class="text-sm text-gray-400 space-y-1">
              <li v-for="change in item.keyChanges" :key="change" class="flex items-start gap-2">
                <span class="text-gray-600 mt-0.5">•</span>
                {{ change }}
              </li>
            </ul>
          </div>

          <div v-if="item.impactedAreas && item.impactedAreas.length > 0">
            <h4 class="text-sm font-semibold text-gray-400 mb-2">Impacted Areas</h4>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="area in item.impactedAreas"
                :key="area"
                class="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs"
              >
                {{ area }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Error state -->
    <div v-if="item.status === 'error'" class="px-5 pb-5">
      <p class="text-sm text-red-400">Analysis failed. The item may be retried on next sync.</p>
    </div>
  </div>
</template>
