<script setup lang="ts">
import { api } from '../../convex/_generated/api'

const { data: releases, pending: loading } = useConvexQuery(api.releases.list, {})
const { execute: triggerSync, pending: syncing, error: syncError } = useConvexAction(api.syncActions.triggerSync)

async function handleSync() {
  try {
    const result = await triggerSync({})
    if (result === 'no_new_prs') {
      alert('No new merged PRs found since last sync.')
    }
  } catch {
    // error tracked by composable
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-2xl font-bold">Release Dashboard</h2>
        <p class="text-gray-400 mt-1">Sync GitHub PRs with Linear tickets, generate AI summaries</p>
      </div>
      <button
        @click="handleSync"
        :disabled="syncing"
        class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
      >
        <svg
          v-if="syncing"
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ syncing ? 'Syncing...' : 'Sync Now' }}
      </button>
    </div>

    <div v-if="syncError" class="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
      {{ syncError.message }}
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20 text-gray-500">
      <p>Connecting to Convex...</p>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="releases && releases.length === 0"
      class="text-center py-20 text-gray-500"
    >
      <div class="text-5xl mb-4">📦</div>
      <p class="text-lg">No syncs yet</p>
      <p class="text-sm mt-1">Click "Sync Now" to fetch PRs and generate release intelligence</p>
    </div>

    <!-- Release list -->
    <template v-else v-for="release in releases" :key="release._id">
      <!-- Team group cards -->
      <div class="space-y-4 mb-4">
        <NuxtLink
          v-for="group in release.groups"
          :key="group.teamKey"
          :to="`/releases/${release._id}?team=${group.teamKey}`"
          class="block p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
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
              <div>
                <div class="font-medium">
                  {{ group.teamName }} ({{ group.teamKey }})
                  <span class="text-gray-500 font-normal">
                    ({{ group.count }} PR{{ group.count !== 1 ? 's' : '' }} synced)
                  </span>
                </div>
                <div class="text-sm text-gray-500 mt-0.5">
                  {{ new Date(release.syncedAt).toLocaleString() }}
                </div>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <!-- Global Changes as its own card -->
        <NuxtLink
          v-if="release.globalGroup"
          :to="`/releases/${release._id}?team=__global__`"
          class="block p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">
                {{ release.globalGroup.status }}
              </span>
              <div>
                <div class="font-medium text-gray-300">
                  Global Changes
                  <span class="text-gray-500 font-normal">
                    ({{ release.globalGroup.count }} PR{{ release.globalGroup.count !== 1 ? 's' : '' }} synced)
                  </span>
                </div>
                <div class="text-sm text-gray-500 mt-0.5">
                  {{ new Date(release.syncedAt).toLocaleString() }}
                </div>
              </div>
            </div>
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
