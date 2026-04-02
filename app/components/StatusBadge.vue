<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const config = computed(() => {
  switch (props.status) {
    case 'syncing':
      return { label: 'Syncing', class: 'bg-blue-900/50 text-blue-300 border-blue-800', pulse: true }
    case 'synced':
      return { label: 'Complete', class: 'bg-green-900/50 text-green-300 border-green-800', pulse: false }
    case 'pending':
      return { label: 'Pending', class: 'bg-gray-800 text-gray-400 border-gray-700', pulse: false }
    case 'analyzing':
      return { label: 'Analyzing', class: 'bg-amber-900/50 text-amber-300 border-amber-800', pulse: true }
    case 'analyzed':
      return { label: 'Analyzed', class: 'bg-green-900/50 text-green-300 border-green-800', pulse: false }
    case 'error':
      return { label: 'Error', class: 'bg-red-900/50 text-red-300 border-red-800', pulse: false }
    default:
      return { label: props.status, class: 'bg-gray-800 text-gray-400 border-gray-700', pulse: false }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
    :class="config.class"
  >
    <span v-if="config.pulse" class="relative flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
      <span class="relative inline-flex rounded-full h-2 w-2 bg-current" />
    </span>
    {{ config.label }}
  </span>
</template>
