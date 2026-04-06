<script setup lang="ts">
import type { TransactionItem } from '../../types'

const props = defineProps<{
  transaction: TransactionItem
}>()

const emit = defineEmits<{
  select: [item: TransactionItem]
  close: []
}>()

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

// Generate similar transactions based on same category
const similar = computed<TransactionItem[]>(() => [
  {
    id: 'sim-1',
    vendor: props.transaction.vendor,
    category: props.transaction.category,
    amount: Math.round(props.transaction.amount * 0.92),
    date: '14 May 2026',
    tags: props.transaction.tags,
  },
  {
    id: 'sim-2',
    vendor: props.transaction.vendor,
    category: props.transaction.category,
    amount: Math.round(props.transaction.amount * 1.08),
    date: '30 Apr 2026',
    tags: props.transaction.tags,
  },
  {
    id: 'sim-3',
    vendor: props.transaction.vendor,
    category: props.transaction.category,
    amount: Math.round(props.transaction.amount * 0.85),
    date: '15 Apr 2026',
    tags: props.transaction.tags,
  },
  {
    id: 'sim-4',
    vendor: props.transaction.vendor,
    category: props.transaction.category,
    amount: Math.round(props.transaction.amount * 1.15),
    date: '31 Mar 2026',
    tags: props.transaction.tags,
  },
])

const maxAmount = computed(() => Math.max(...similar.value.map(t => t.amount)))
function barWidth(amount: number) {
  return (amount / maxAmount.value) * 100 + '%'
}
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#FAFAF7',
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
        borderBottom: '1px solid #E8E5DF',
        flexShrink: '0',
        background: '#ffffff',
      }"
    >
      <div>
        <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">Similar Transactions</p>
        <p :style="{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }">{{ transaction.vendor }}</p>
      </div>
      <button
        :style="{
          width: '28px', height: '28px', borderRadius: '7px',
          border: '1px solid #E8E5DF', background: 'transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#6b7280',
        }"
        @click="emit('close')"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Current transaction highlight -->
    <div :style="{ padding: '12px 16px', borderBottom: '1px solid #E8E5DF', background: '#ffffff' }">
      <p :style="{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }">Selected</p>
      <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }">
        <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">{{ transaction.date }}</p>
        <p :style="{ fontSize: '15px', fontWeight: '700', color: '#1B4332' }">{{ formatAmount(transaction.amount) }}</p>
      </div>
    </div>

    <!-- Similar list -->
    <div :style="{ flex: '1', overflowY: 'auto', padding: '8px 0' }">
      <div
        v-for="item in similar"
        :key="item.id"
        class="sim-row"
        :style="{
          padding: '10px 16px',
          cursor: 'pointer',
          transition: 'background 0.15s',
          borderBottom: '1px solid #f0ede8',
        }"
        @click="emit('select', item)"
      >
        <div :style="{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }">
          <div
            :style="{
              width: '28px', height: '28px', borderRadius: '7px',
              background: getColor(item.vendor),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '11px', fontWeight: '700', flexShrink: '0',
            }"
          >
            {{ item.vendor.charAt(0) }}
          </div>
          <div :style="{ flex: '1', minWidth: '0' }">
            <div :style="{ display: 'flex', justifyContent: 'space-between' }">
              <p :style="{ fontSize: '12px', color: '#9ca3af' }">{{ item.date }}</p>
              <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">{{ formatAmount(item.amount) }}</p>
            </div>
            <div :style="{ height: '5px', borderRadius: '3px', background: '#E8E5DF', marginTop: '6px', overflow: 'hidden' }">
              <div
                :style="{
                  height: '100%',
                  width: barWidth(item.amount),
                  background: getColor(item.vendor),
                  borderRadius: '3px',
                }"
              />
            </div>
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-row:hover { background: #f0ede8; }
</style>
