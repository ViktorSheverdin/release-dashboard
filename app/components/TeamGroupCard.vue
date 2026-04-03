<script setup lang="ts">
defineProps<{
  to: string
  status: string
  label: string
  count: number
  syncedAt: number
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="block p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UiGroupStatusBadge :status="status" />
        <div>
          <div class="font-medium">
            {{ label }}
            <span class="text-gray-500 font-normal">
              ({{ count }} PR{{ count !== 1 ? 's' : '' }} synced)
            </span>
          </div>
          <div class="text-sm text-gray-500 mt-0.5">
            {{ new Date(syncedAt).toLocaleString() }}
          </div>
        </div>
      </div>
      <UiChevronRight />
    </div>
  </NuxtLink>
</template>
