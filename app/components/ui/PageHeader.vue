<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-8">
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-3">
        {{ title }}
        <slot name="badge" />
      </h2>
      <p v-if="subtitle" class="text-gray-400 mt-1">{{ subtitle }}</p>
    </div>
    <slot name="action" />
  </div>
</template>
