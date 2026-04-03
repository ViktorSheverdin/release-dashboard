<script setup lang="ts">
defineProps<{
  disabled?: boolean
  variant?: 'primary' | 'success' | 'ghost'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <button
    :disabled="disabled"
    class="font-medium transition-colors flex items-center gap-2"
    :class="[
      size === 'sm' ? 'px-3 py-1.5 rounded-lg text-xs' : 'px-5 py-2.5 rounded-lg text-sm',
      variant === 'success'
        ? 'bg-green-700 hover:bg-green-600 disabled:bg-green-900'
        : variant === 'ghost'
          ? 'text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-600'
          : 'bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-not-allowed',
    ]"
  >
    <slot />
  </button>
</template>
