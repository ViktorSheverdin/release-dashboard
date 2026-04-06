<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title?: string
  subtitle?: string
  width?: string
  canGoBack?: boolean
}>()

const emit = defineEmits<{
  close: []
  back: []
}>()

function handleBackdropClick(e: MouseEvent) {
  if ((e.target as HTMLElement).dataset.backdrop) {
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="open"
        data-backdrop="true"
        :style="{
          position: 'fixed',
          inset: '0',
          background: 'rgba(0,0,0,0.2)',
          zIndex: '100',
          backdropFilter: 'blur(1px)',
        }"
        @click="handleBackdropClick"
      >
        <Transition name="panel">
          <div
            v-if="open"
            :style="{
              position: 'absolute',
              top: '0',
              right: '0',
              bottom: '0',
              width: width || '480px',
              background: '#ffffff',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
            }"
            @click.stop
          >
            <!-- Header -->
            <div
              :style="{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 24px',
                borderBottom: '1px solid #f0ede8',
                flexShrink: '0',
              }"
            >
              <!-- Back button -->
              <button
                v-if="canGoBack"
                :style="{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: '1px solid #E8E5DF',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  flexShrink: '0',
                }"
                @click="emit('back')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <!-- Title -->
              <div :style="{ flex: '1', minWidth: '0' }">
                <h3 :style="{ fontSize: '15px', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }">
                  {{ title || 'Details' }}
                </h3>
                <p v-if="subtitle" :style="{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }">{{ subtitle }}</p>
              </div>

              <!-- Close button -->
              <button
                :style="{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  border: '1px solid #E8E5DF',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280',
                  flexShrink: '0',
                }"
                @click="emit('close')"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Content -->
            <div :style="{ flex: '1', overflowY: 'auto', padding: '20px 24px' }">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" :style="{ flexShrink: '0', padding: '16px 24px', borderTop: '1px solid #f0ede8' }">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.2s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }
.panel-enter-active, .panel-leave-active { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.panel-enter-from, .panel-leave-to { transform: translateX(100%); }
</style>
