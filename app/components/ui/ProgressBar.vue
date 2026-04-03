<script setup lang="ts">
const props = defineProps<{
  current: number
  total: number
}>()

const percent = computed(() =>
  props.total > 0 ? `${(props.current / props.total) * 100}%` : '0%'
)
</script>

<template>
  <div class="bg-gray-800 rounded-full h-2 overflow-hidden">
    <div
      class="h-full bg-indigo-500 transition-all duration-500 ease-out"
      :style="{ width: percent }"
    />
  </div>
</template>
