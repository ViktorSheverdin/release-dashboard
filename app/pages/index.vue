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
    <UiPageHeader
      title="Release Dashboard"
      subtitle="Sync GitHub PRs with Linear tickets, generate AI summaries"
    >
      <template #action>
        <UiActionButton :disabled="syncing" @click="handleSync">
          <UiSpinnerIcon v-if="syncing" />
          {{ syncing ? 'Syncing...' : 'Sync Now' }}
        </UiActionButton>
      </template>
    </UiPageHeader>

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
      <div class="space-y-4 mb-4">
        <TeamGroupCard
          v-for="group in release.groups"
          :key="group.teamKey"
          :to="`/releases/${release._id}?team=${group.teamKey}`"
          :status="group.status"
          :label="`${group.teamName} (${group.teamKey})`"
          :count="group.count"
          :synced-at="release.syncedAt"
        />

        <TeamGroupCard
          v-if="release.globalGroup"
          :to="`/releases/${release._id}?team=__global__`"
          :status="release.globalGroup.status"
          label="Global Changes"
          :count="release.globalGroup.count"
          :synced-at="release.syncedAt"
        />
      </div>
    </template>
  </div>
</template>
