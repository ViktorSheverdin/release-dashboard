<script setup lang="ts">
import type { TransactionItem } from '../../types'
import BarChart from '../dashboard/BarChart.vue'
import type { BarChartData } from '../../types'

const props = defineProps<{
  item: TransactionItem
  onDrillDown?: (title: string, subtitle: string) => void
}>()

function formatAmount(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

// Mock historical spend for this vendor
const historyChart = computed<BarChartData>(() => ({
  title: `${props.item.vendor} — Monthly Spend`,
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: props.item.vendor,
      values: [
        Math.round(props.item.amount * 0.7),
        Math.round(props.item.amount * 1.1),
        Math.round(props.item.amount * 0.9),
        Math.round(props.item.amount * 1.2),
        Math.round(props.item.amount * 0.85),
        props.item.amount,
      ],
      color: '#4A7C59',
    },
  ],
}))

// Mock similar transactions
const similar = computed(() => [
  { date: '14 May 2026', amount: Math.round(props.item.amount * 0.95) },
  { date: '30 Apr 2026', amount: Math.round(props.item.amount * 1.1) },
  { date: '15 Apr 2026', amount: Math.round(props.item.amount * 0.88) },
])
</script>

<template>
  <div :style="{ display: 'flex', flexDirection: 'column', gap: '20px' }">

    <!-- Amount hero -->
    <div
      :style="{
        background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
        borderRadius: '12px',
        padding: '20px',
        color: 'white',
      }"
    >
      <p :style="{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }">Transaction Amount</p>
      <p :style="{ fontSize: '28px', fontWeight: '700' }">{{ formatAmount(item.amount) }}</p>
      <div :style="{ display: 'flex', gap: '16px', marginTop: '12px' }">
        <div>
          <p :style="{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }">Date</p>
          <p :style="{ fontSize: '13px', fontWeight: '500' }">{{ item.date }}</p>
        </div>
        <div>
          <p :style="{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }">Category</p>
          <p :style="{ fontSize: '13px', fontWeight: '500' }">{{ item.category }}</p>
        </div>
        <div v-if="item.clients">
          <p :style="{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }">Clients</p>
          <p :style="{ fontSize: '13px', fontWeight: '500' }">{{ item.clients }}</p>
        </div>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="item.tags.length">
      <p :style="{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }">Tags</p>
      <div :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap' }">
        <span
          v-for="tag in item.tags"
          :key="tag.label"
          :style="{
            fontSize: '12px',
            padding: '4px 12px',
            borderRadius: '6px',
            background: tag.color + '15',
            color: tag.color,
            fontWeight: '500',
          }"
        >
          {{ tag.label }}
        </span>
      </div>
    </div>

    <!-- Historical chart -->
    <BarChart :data="historyChart" />

    <!-- Similar transactions -->
    <div>
      <p :style="{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }">Similar Transactions</p>
      <div
        v-for="tx in similar"
        :key="tx.date"
        class="similar-row"
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }"
        @click="onDrillDown?.(item.vendor + ' — ' + tx.date, formatAmount(tx.amount))"
      >
        <div :style="{ display: 'flex', alignItems: 'center', gap: '10px' }">
          <div
            :style="{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#F0EDE8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
              color: '#6b7280',
            }"
          >
            {{ item.vendor.charAt(0) }}
          </div>
          <div>
            <p :style="{ fontSize: '13px', fontWeight: '500', color: '#374151' }">{{ item.vendor }}</p>
            <p :style="{ fontSize: '11px', color: '#9ca3af' }">{{ tx.date }}</p>
          </div>
        </div>
        <div :style="{ display: 'flex', alignItems: 'center', gap: '8px' }">
          <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">{{ formatAmount(tx.amount) }}</p>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.similar-row:hover { background: #FAFAF7; }
</style>
