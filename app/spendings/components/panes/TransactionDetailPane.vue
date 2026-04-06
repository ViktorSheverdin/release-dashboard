<script setup lang="ts">
import type { TransactionItem } from '../../types'

const props = defineProps<{
  transaction: TransactionItem
}>()

defineEmits<{ close: [] }>()

function formatAmount(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

const vendorColors: Record<string, string> = {
  S: '#635BFF', W: '#4A7C59', B: '#E07A5F', A: '#8B9DC3',
  T: '#F22F46', G: '#4285F4', M: '#1877F2', L: '#0A66C2',
}
function getColor(vendor: string) {
  return vendorColors[vendor.charAt(0)] || '#6B8F71'
}

const details = computed(() => [
  { label: 'Category', value: props.transaction.category },
  { label: 'Date', value: props.transaction.date },
  { label: 'Status', value: 'Completed' },
  { label: 'Clients', value: props.transaction.clients ? String(props.transaction.clients) : '—' },
])
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#ffffff',
      borderLeft: '1px solid #E8E5DF',
    }"
  >
    <!-- Header -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '15px 16px',
        borderBottom: '1px solid #f0ede8',
        flexShrink: '0',
      }"
    >
      <div>
        <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">Transaction Detail</p>
        <p :style="{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }">{{ transaction.date }}</p>
      </div>
      <button
        :style="{
          width: '28px', height: '28px', borderRadius: '7px',
          border: '1px solid #E8E5DF', background: 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#6b7280',
        }"
        @click="$emit('close')"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div :style="{ flex: '1', overflowY: 'auto', padding: '16px' }">

      <!-- Hero -->
      <div
        :style="{
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
          borderRadius: '12px',
          padding: '18px',
          marginBottom: '16px',
          color: 'white',
        }"
      >
        <div :style="{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }">
          <div
            :style="{
              width: '36px', height: '36px', borderRadius: '9px',
              background: getColor(transaction.vendor),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', color: 'white',
            }"
          >
            {{ transaction.vendor.charAt(0) }}
          </div>
          <p :style="{ fontSize: '14px', fontWeight: '600' }">{{ transaction.vendor }}</p>
        </div>
        <p :style="{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }">Amount</p>
        <p :style="{ fontSize: '26px', fontWeight: '700' }">{{ formatAmount(transaction.amount) }}</p>
      </div>

      <!-- Detail grid -->
      <div :style="{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }">
        <div
          v-for="d in details"
          :key="d.label"
          :style="{
            padding: '10px 12px',
            background: '#FAFAF7',
            borderRadius: '8px',
            border: '1px solid #E8E5DF',
          }"
        >
          <p :style="{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }">{{ d.label }}</p>
          <p :style="{ fontSize: '12px', fontWeight: '600', color: '#374151' }">{{ d.value }}</p>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="transaction.tags.length" :style="{ marginBottom: '16px' }">
        <p :style="{ fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '6px' }">Tags</p>
        <div :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap' }">
          <span
            v-for="tag in transaction.tags"
            :key="tag.label"
            :style="{
              fontSize: '11px', padding: '3px 10px', borderRadius: '6px',
              background: tag.color + '15', color: tag.color, fontWeight: '500',
            }"
          >
            {{ tag.label }}
          </span>
        </div>
      </div>

      <!-- Note -->
      <div
        :style="{
          padding: '12px',
          background: '#FAFAF7',
          borderRadius: '8px',
          border: '1px solid #E8E5DF',
          fontSize: '12px',
          color: '#9ca3af',
          lineHeight: '1.5',
        }"
      >
        This transaction was automatically categorized based on vendor history. Click <strong style="color: #374151;">View Full Report</strong> to see complete audit trail.
      </div>
    </div>

    <!-- Footer -->
    <div :style="{ flexShrink: '0', padding: '12px 16px', borderTop: '1px solid #f0ede8', display: 'flex', gap: '8px' }">
      <button
        :style="{
          flex: '1', padding: '9px', borderRadius: '8px',
          border: '1px solid #E8E5DF', background: 'transparent',
          color: '#374151', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
        }"
        @click="$emit('close')"
      >
        Dismiss
      </button>
      <button
        :style="{
          flex: '1', padding: '9px', borderRadius: '8px',
          border: 'none', background: '#1B4332',
          color: 'white', fontSize: '12px', fontWeight: '500', cursor: 'pointer',
        }"
      >
        Full Report
      </button>
    </div>
  </div>
</template>
