<script setup lang="ts">
import type { ChatMessage } from '../types'

const props = defineProps<{
  message: ChatMessage
}>()

const isUser = computed(() => props.message.role === 'user')

const formattedContent = computed(() => {
  return props.message.content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
})
</script>

<template>
  <div
    class="message-enter"
    :style="{
      display: 'flex',
      gap: '8px',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }"
  >
    <!-- Avatar -->
    <div
      :style="{
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        background: isUser ? '#E8E5DF' : '#1B4332',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: '0',
        fontSize: '12px',
        fontWeight: '700',
        color: isUser ? '#6b7280' : 'white',
      }"
    >
      {{ isUser ? 'U' : 'F' }}
    </div>

    <!-- Bubble -->
    <div
      :style="{
        maxWidth: '82%',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        padding: '10px 14px',
        fontSize: '13px',
        lineHeight: '1.6',
        background: isUser ? '#ECEAE5' : '#ffffff',
        color: '#374151',
        border: isUser ? 'none' : '1px solid #E8E5DF',
      }"
    >
      <div v-html="formattedContent" />
      <span
        v-if="message.isStreaming"
        :style="{
          display: 'inline-block',
          width: '2px',
          height: '14px',
          marginLeft: '2px',
          verticalAlign: 'middle',
          background: '#9ca3af',
        }"
        class="animate-blink"
      />
    </div>
  </div>
</template>

<style scoped>
.message-enter {
  animation: messageSlideIn 0.25s ease-out;
}

@keyframes messageSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-blink {
  animation: blink 0.8s infinite;
}
</style>
