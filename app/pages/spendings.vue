<script setup lang="ts">
import ChatPanel from '~/spendings/components/ChatPanel.vue'
import DashboardPanel from '~/spendings/components/DashboardPanel.vue'
import { componentRegistry } from '~/spendings/config/componentRegistry'
import type { DashboardView } from '~/spendings/types'

definePageMeta({
  layout: 'spendings',
})

const currentIntent = ref<string | null>(null)

const currentView = computed<DashboardView | null>(() => {
  if (!currentIntent.value) return null
  return componentRegistry[currentIntent.value] || null
})

function onIntentChange(intent: string) {
  currentIntent.value = intent
}
</script>

<template>
  <div
    style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex;"
    :style="{ background: '#FAF9F6', color: '#1f2937' }"
  >
    <!-- Chat Panel — left side -->
    <div style="width: 420px; flex-shrink: 0; position: relative;" :style="{ borderRight: '1px solid #e5e2dc' }">
      <ChatPanel @intent-change="onIntentChange" />
    </div>

    <!-- Dashboard Panel — right side -->
    <div style="flex: 1; min-width: 0; position: relative;">
      <DashboardPanel :view="currentView" />
    </div>
  </div>
</template>
