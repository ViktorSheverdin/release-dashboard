<script setup lang="ts">
import ComponentShowcase from './ComponentShowcase.vue'
import type { DashboardView, TransactionItem } from '../types'

defineProps<{
  view: DashboardView | null
}>()

defineEmits<{
  selectTransaction: [item: TransactionItem]
}>()
</script>

<template>
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; background: #ffffff;">

    <!-- Header -->
    <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 15px 24px; border-bottom: 1px solid #f0ede8;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: #4A7C59; display: inline-block;" />
        <h2 style="font-size: 14px; font-weight: 600; color: #374151;">Component Showcase</h2>
      </div>
      <span style="font-size: 12px; color: #9ca3af;">All components</span>
    </div>

    <!-- Content -->
    <div style="flex: 1; overflow-y: auto; min-height: 0; padding: 20px 24px;">
      <ComponentShowcase />
    </div>
  </div>
</template>
