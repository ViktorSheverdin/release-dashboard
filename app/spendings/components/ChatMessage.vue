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

const bubbleStyle = computed(() => {
  if (isUser.value) {
    return {
      background: '#F0F0F0',
      color: '#1f2937',
      borderTopRightRadius: '6px',
    }
  }
  return {
    background: '#4A7C59',
    color: '#ffffff',
    borderTopLeftRadius: '6px',
  }
})
</script>

<template>
  <div
    class="message-enter"
    :style="{
      display: 'flex',
      gap: '10px',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
    }"
  >
    <!-- AI avatar (only for assistant) -->
    <div
      v-if="!isUser"
      :style="{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: '#4A7C59',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: '0',
      }"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 8V4H8" />
        <rect x="8" y="8" width="8" height="8" rx="2" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
      </svg>
    </div>

    <!-- Message bubble -->
    <div
      :style="{
        maxWidth: '80%',
        borderRadius: '16px',
        padding: '10px 16px',
        fontSize: '13px',
        lineHeight: '1.6',
        ...bubbleStyle,
      }"
    >
      <div v-html="formattedContent" />
      <span
        v-if="message.isStreaming"
        :style="{
          display: 'inline-block',
          width: '6px',
          height: '16px',
          marginLeft: '2px',
          verticalAlign: 'middle',
          background: isUser ? '#6b7280' : 'rgba(255,255,255,0.7)',
        }"
        class="animate-blink"
      />
    </div>
  </div>
</template>

<style scoped>
.message-enter {
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-blink {
  animation: blink 0.8s infinite;
}
</style>
