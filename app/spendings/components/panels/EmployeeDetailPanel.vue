<script setup lang="ts">
import type { PayrollItem } from '../../types'

const props = defineProps<{
  item: PayrollItem
  onDrillDown?: (title: string, subtitle: string) => void
}>()

function formatAmount(n: number) {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  paid: { bg: 'rgba(74,124,89,0.12)', color: '#2E6B3A', label: 'Paid' },
  pending: { bg: 'rgba(242,193,78,0.15)', color: '#92580A', label: 'Pending' },
  processing: { bg: 'rgba(59,130,246,0.12)', color: '#1D4ED8', label: 'Processing' },
}

const deptColors: Record<string, string> = {
  Engineering: '#635BFF',
  Design: '#E07A5F',
  Sales: '#4A7C59',
  Marketing: '#F2C14E',
  Operations: '#4285F4',
  HR: '#EC4899',
  Support: '#8B9DC3',
}

function getDeptColor(dept: string) {
  return deptColors[dept] || '#6b7280'
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

// Mock payment history
const history = computed(() => [
  { period: 'Feb 2026', amount: props.item.amount, status: 'paid' },
  { period: 'Jan 2026', amount: props.item.amount, status: 'paid' },
  { period: 'Dec 2025', amount: Math.round(props.item.amount * 0.97), status: 'paid' },
  { period: 'Nov 2025', amount: Math.round(props.item.amount * 0.97), status: 'paid' },
])
</script>

<template>
  <div :style="{ display: 'flex', flexDirection: 'column', gap: '20px' }">

    <!-- Profile hero -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        background: '#FAFAF7',
        borderRadius: '12px',
        border: '1px solid #E8E5DF',
      }"
    >
      <div
        :style="{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: getDeptColor(item.department),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '700',
          color: 'white',
          flexShrink: '0',
        }"
      >
        {{ getInitials(item.name) }}
      </div>
      <div>
        <p :style="{ fontSize: '16px', fontWeight: '600', color: '#374151' }">{{ item.name }}</p>
        <p :style="{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }">{{ item.department }}</p>
        <span
          :style="{
            display: 'inline-flex',
            marginTop: '6px',
            fontSize: '11px',
            fontWeight: '500',
            padding: '3px 10px',
            borderRadius: '6px',
            background: statusStyles[item.status].bg,
            color: statusStyles[item.status].color,
          }"
        >
          {{ statusStyles[item.status].label }}
        </span>
      </div>
      <div :style="{ marginLeft: 'auto', textAlign: 'right' }">
        <p :style="{ fontSize: '11px', color: '#9ca3af' }">Monthly salary</p>
        <p :style="{ fontSize: '20px', fontWeight: '700', color: '#1B4332', marginTop: '2px' }">{{ formatAmount(item.amount) }}</p>
      </div>
    </div>

    <!-- Stats row -->
    <div :style="{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }">
      <div
        v-for="stat in [
          { label: 'YTD Paid', value: formatAmount(item.amount * 3) },
          { label: 'Pay Date', value: item.date },
          { label: 'Department', value: item.department },
        ]"
        :key="stat.label"
        :style="{
          padding: '12px 14px',
          background: '#FAFAF7',
          borderRadius: '8px',
          border: '1px solid #E8E5DF',
        }"
      >
        <p :style="{ fontSize: '11px', color: '#9ca3af', marginBottom: '3px' }">{{ stat.label }}</p>
        <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Payment history -->
    <div>
      <p :style="{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '10px' }">Payment History</p>
      <div
        v-for="entry in history"
        :key="entry.period"
        class="history-row"
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 12px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }"
        @click="onDrillDown?.(item.name + ' — ' + entry.period, formatAmount(entry.amount))"
      >
        <div>
          <p :style="{ fontSize: '13px', fontWeight: '500', color: '#374151' }">{{ entry.period }}</p>
          <p :style="{ fontSize: '11px', color: '#9ca3af' }">Salary payment</p>
        </div>
        <div :style="{ display: 'flex', alignItems: 'center', gap: '10px' }">
          <span
            :style="{
              fontSize: '11px',
              fontWeight: '500',
              padding: '2px 8px',
              borderRadius: '5px',
              background: statusStyles[entry.status as 'paid'].bg,
              color: statusStyles[entry.status as 'paid'].color,
            }"
          >
            {{ statusStyles[entry.status as 'paid'].label }}
          </span>
          <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">{{ formatAmount(entry.amount) }}</p>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.history-row:hover { background: #FAFAF7; }
</style>
