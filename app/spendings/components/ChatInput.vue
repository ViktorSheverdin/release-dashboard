<script setup lang="ts">
const emit = defineEmits<{
  send: [message: string]
}>()

const props = defineProps<{
  disabled?: boolean
}>()

const input = ref('')
const inputEl = ref<HTMLTextAreaElement | null>(null)

function handleSend() {
  if (!input.value.trim() || props.disabled) return
  emit('send', input.value)
  input.value = ''
  nextTick(() => {
    if (inputEl.value) {
      inputEl.value.style.height = 'auto'
    }
  })
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function autoResize(e: Event) {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 120) + 'px'
}
</script>

<template>
  <div
    :style="{
      background: '#ffffff',
      padding: '12px 16px',
      borderTop: '1px solid #f0ede8',
    }"
  >
    <div
      :style="{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        background: '#F7F7F5',
        borderRadius: '12px',
        padding: '8px 12px',
        border: '1px solid rgba(0,0,0,0.06)',
      }"
    >
      <textarea
        ref="inputEl"
        v-model="input"
        :disabled="disabled"
        placeholder="Ask me anything..."
        rows="1"
        :style="{
          flex: '1',
          background: 'transparent',
          fontSize: '14px',
          color: '#374151',
          resize: 'none',
          outline: 'none',
          lineHeight: '1.5',
          maxHeight: '120px',
          border: 'none',
        }"
        @keydown="handleKeydown"
        @input="autoResize"
      />
      <button
        :disabled="!input.trim() || disabled"
        :style="{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#4A7C59',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: !input.trim() || disabled ? 'not-allowed' : 'pointer',
          opacity: !input.trim() || disabled ? '0.3' : '1',
          flexShrink: '0',
          transition: 'opacity 0.2s, transform 0.1s',
        }"
        @click="handleSend"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>
