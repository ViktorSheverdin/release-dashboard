<script setup lang="ts">
const props = defineProps<{
  tabs: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div
    :style="{
      display: 'inline-flex',
      background: '#F0EDE8',
      borderRadius: '10px',
      padding: '3px',
      gap: '2px',
    }"
  >
    <button
      v-for="tab in tabs"
      :key="tab"
      :style="{
        padding: '6px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: modelValue === tab ? '600' : '400',
        color: modelValue === tab ? '#1B4332' : '#6b7280',
        background: modelValue === tab ? '#ffffff' : 'transparent',
        boxShadow: modelValue === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.15s ease',
        whiteSpace: 'nowrap',
      }"
      @click="emit('update:modelValue', tab)"
    >
      {{ tab }}
    </button>
  </div>
</template>
