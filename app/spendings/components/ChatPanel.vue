<script setup lang="ts">
import { useChat } from '../composables/useChat'
import ChatMessage from './ChatMessage.vue'
import ChatInput from './ChatInput.vue'

const { messages, isResponding, sendMessage } = useChat()

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
</script>

<template>
  <div
    style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column;"
    class="bg-[#FAFAF7]"
  >
    <!-- Header -->
    <div
      style="flex-shrink: 0;"
      class="flex items-center gap-3 px-5 py-4 border-b border-gray-200/80 bg-white"
    >
      <div class="w-9 h-9 rounded-full bg-[#4A7C59] flex items-center justify-center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8V4H8" />
          <rect x="8" y="8" width="8" height="8" rx="2" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-semibold text-gray-800 leading-tight">Frank AI</h2>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <p class="text-xs text-gray-400">Online</p>
        </div>
      </div>
    </div>

    <!-- Messages -->
    <div
      ref="messagesContainer"
      style="flex: 1; overflow-y: auto; min-height: 0;"
      class="px-5 py-5 space-y-4"
    >
      <!-- Welcome message -->
      <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
        <div class="text-center max-w-[260px]">
          <div class="w-12 h-12 rounded-full bg-[#4A7C59]/10 flex items-center justify-center mx-auto mb-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4A7C59" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 class="text-sm font-semibold text-gray-700 mb-1">Financial Insights</h3>
          <p class="text-xs text-gray-400 leading-relaxed">
            Ask about your spending, transactions, payroll, or ad spend to get started.
          </p>
        </div>
      </div>

      <ChatMessage
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
      />

      <!-- Typing indicator -->
      <div v-if="isResponding && !messages[messages.length - 1]?.isStreaming" class="flex gap-3 items-start">
        <div class="w-8 h-8 rounded-full bg-[#4A7C59] flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 8V4H8" />
            <rect x="8" y="8" width="8" height="8" rx="2" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
          </svg>
        </div>
        <div class="bg-[#4A7C59] rounded-2xl rounded-tl-md px-4 py-3">
          <div class="flex gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style="animation-delay: 0ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style="animation-delay: 150ms" />
            <span class="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div style="flex-shrink: 0;">
      <ChatInput :disabled="isResponding" @send="sendMessage" />
    </div>
  </div>
</template>
