<script setup lang="ts">
defineProps<{
  status: string
}>()

const classes: Record<string, string> = {
  Completed: 'bg-green-900/50 text-green-400',
  Analyzing: 'bg-yellow-900/50 text-yellow-400',
  Pending: 'bg-gray-700 text-gray-400',
  Error: 'bg-red-900/50 text-red-400',
}
</script>

<template>
  <span
    class="text-xs font-medium px-2 py-0.5 rounded-full"
    :class="classes[status] ?? classes.Pending"
  >
    {{ status }}
  </span>
</template>
