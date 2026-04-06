<script setup lang="ts">
import ChatPanel from '~/spendings/components/ChatPanel.vue'
import DashboardPanel from '~/spendings/components/DashboardPanel.vue'

definePageMeta({
  layout: 'spendings',
})
</script>

<template>
  <div
    style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex;"
    class="bg-[#FAF9F6] text-gray-800"
  >
    <!-- Chat Panel — left side -->
    <div style="width: 420px; flex-shrink: 0; position: relative;" class="border-r border-gray-200">
      <ChatPanel />
    </div>

    <!-- Dashboard Panel — right side -->
    <div style="flex: 1; min-width: 0; position: relative;">
      <DashboardPanel />
    </div>
  </div>
</template>
