<script setup lang="ts">
defineProps<{
  to: string
  label?: string
}>()
</script>

<template>
  <NuxtLink :to="to" class="text-sm text-indigo-400 hover:text-indigo-300 mb-6 inline-flex items-center gap-1">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
    {{ label ?? 'Back' }}
  </NuxtLink>
</template>
