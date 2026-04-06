<script setup lang="ts">
import type { TransactionListData, TransactionItem } from '../../types'

const props = defineProps<{
  data: TransactionListData
}>()

const emit = defineEmits<{
  selectTransaction: [item: TransactionItem]
}>()

function formatAmount(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

function getVendorInitial(vendor: string): string {
  return vendor.charAt(0).toUpperCase()
}

const vendorColors: Record<string, string> = {
  S: '#635BFF',
  W: '#4A7C59',
  B: '#E07A5F',
  A: '#8B9DC3',
  T: '#F22F46',
  G: '#4285F4',
  M: '#1877F2',
  L: '#0A66C2',
}

function getVendorColor(vendor: string): string {
  return vendorColors[vendor.charAt(0)] || '#6B8F71'
}

// Compute max amount for the progress bar
const maxAmount = computed(() => {
  return Math.max(...props.data.items.map(i => i.amount))
})

function barWidth(amount: number): string {
  if (maxAmount.value === 0) return '0%'
  return (amount / maxAmount.value) * 100 + '%'
}

// Assign bar colors based on tags or a rotating palette
const barColors = ['#4A7C59', '#E07A5F', '#F2C14E', '#635BFF', '#4285F4', '#1877F2']

function getBarColor(idx: number): string {
  // Use first tag color if available, otherwise rotate
  return barColors[idx % barColors.length]
}
</script>

<template>
  <div
    :style="{
      background: '#ffffff',
      border: '1px solid #E8E5DF',
      borderRadius: '12px',
      overflow: 'hidden',
    }"
  >
    <!-- Header -->
    <div :style="{ padding: '16px 20px', borderBottom: '1px solid #f0ede8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }">
      <div>
        <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">{{ data.title }}</p>
        <p v-if="data.dateRange" :style="{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }">
          {{ data.dateRange }}
        </p>
      </div>
      <span :style="{ fontSize: '11px', color: '#9ca3af' }">{{ data.items.length }} items</span>
    </div>

    <!-- Items -->
    <div :style="{ maxHeight: '380px', overflowY: 'auto' }">
      <div
        v-for="(item, idx) in data.items"
        :key="item.id"
        class="transaction-row"
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          borderBottom: '1px solid #f7f5f2',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }"
        @click="emit('selectTransaction', item)"
      >
        <!-- Vendor icon -->
        <div
          :style="{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: getVendorColor(item.vendor),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            flexShrink: '0',
          }"
        >
          {{ getVendorInitial(item.vendor) }}
        </div>

        <!-- Info -->
        <div :style="{ flex: '1', minWidth: '0' }">
          <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }">
            <p :style="{ fontSize: '13px', fontWeight: '500', color: '#374151' }">{{ item.vendor }}</p>
            <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151', flexShrink: '0' }">{{ formatAmount(item.amount) }}</p>
          </div>
          <p :style="{ fontSize: '11px', color: '#9ca3af', marginBottom: '6px' }">{{ item.date }}</p>

          <!-- Progress bar -->
          <div :style="{ height: '6px', borderRadius: '3px', background: '#f0ede8', overflow: 'hidden' }">
            <div
              :style="{
                height: '100%',
                width: barWidth(item.amount),
                background: getBarColor(idx),
                borderRadius: '3px',
                transition: 'width 0.6s ease',
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transaction-row:hover {
  background: #fafaf7 !important;
}
</style>
