<script setup lang="ts">
import { useChat } from '../composables/useChat'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

const emit = defineEmits<{
  intentChange: [intent: string]
}>()

const { messages, isResponding, currentIntent, sendMessage } = useChat()

const messagesContainer = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth',
      })
    }
  })
}

watch(
  () => messages.value.length,
  () => scrollToBottom()
)

watch(
  () => messages.value[messages.value.length - 1]?.content,
  () => {
    if (messages.value[messages.value.length - 1]?.isStreaming) {
      scrollToBottom()
    }
  }
)

watch(currentIntent, (intent) => {
  if (intent) emit('intentChange', intent)
})
</script>

<template>
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; background: #FAFAF7;">

    <!-- Messages -->
    <div
      ref="messagesContainer"
      style="flex: 1; overflow-y: auto; min-height: 0; padding: 20px 16px;"
    >
      <!-- Welcome state -->
      <div
        v-if="messages.length === 0"
        style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;"
      >
        <div
          style="width: 44px; height: 44px; border-radius: 50%; background: rgba(74,124,89,0.1); display: flex; align-items: center; justify-content: center; margin-bottom: 12px;"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h3 style="font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px;">Welcome to Financial Insights</h3>
        <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; max-width: 220px;">
          Ask about your spending, transactions, payroll, or ad spend to get started.
        </p>
      </div>

      <!-- Message list -->
      <div v-else style="display: flex; flex-direction: column; gap: 16px;">
        <ChatMessage
          v-for="msg in messages"
          :key="msg.id"
          :message="msg"
        />
      </div>

      <!-- Typing indicator -->
      <div
        v-if="isResponding && !messages[messages.length - 1]?.isStreaming"
        style="display: flex; gap: 10px; align-items: flex-start; margin-top: 16px;"
      >
        <div
          style="width: 30px; height: 30px; border-radius: 50%; background: #1B4332; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
        >
          <span style="font-size: 11px; font-weight: 700; color: white;">F</span>
        </div>
        <div style="background: #ffffff; border: 1px solid #E8E5DF; border-radius: 14px 14px 14px 4px; padding: 10px 14px;">
          <div style="display: flex; gap: 4px;">
            <span class="bounce-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation-delay: 0ms;" />
            <span class="bounce-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation-delay: 150ms;" />
            <span class="bounce-dot" style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation-delay: 300ms;" />
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div style="flex-shrink: 0;">
      <ChatInput :disabled="isResponding" @send="sendMessage" />
    </div>

    <!-- Footer identity -->
    <div style="flex-shrink: 0; display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-top: 1px solid #e5e2dc; background: #F4F3EF;">
      <div
        style="width: 32px; height: 32px; border-radius: 50%; background: #1B4332; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
      >
        <span style="font-size: 12px; font-weight: 700; color: white;">F</span>
      </div>
      <div>
        <p style="font-size: 13px; font-weight: 600; color: #374151; line-height: 1.2;">Frank, AI Assistant</p>
        <p style="font-size: 11px; color: #9ca3af; margin-top: 1px;">Financial Insights</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bounce-dot {
  animation: bounce 1.4s infinite ease-in-out;
}

@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
}
</style>
