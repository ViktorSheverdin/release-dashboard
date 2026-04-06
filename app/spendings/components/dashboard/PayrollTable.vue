<script setup lang="ts">
import type { PayrollData, PayrollItem } from '../../types'

defineProps<{
  data: PayrollData
}>()

const emit = defineEmits<{
  selectEmployee: [item: PayrollItem]
}>()

function formatAmount(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
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

function getDeptColor(dept: string): string {
  return deptColors[dept] || '#6b7280'
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
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
        <p :style="{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }">{{ data.period }}</p>
      </div>
      <p :style="{ fontSize: '15px', fontWeight: '700', color: '#1B4332' }">{{ formatAmount(data.totalAmount) }}</p>
    </div>

    <!-- Column headers -->
    <div
      :style="{
        display: 'grid',
        gridTemplateColumns: '1fr 120px 90px 80px',
        padding: '8px 20px',
        borderBottom: '1px solid #f0ede8',
        background: '#FAFAF7',
      }"
    >
      <span :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }">Employee</span>
      <span :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }">Department</span>
      <span :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }">Status</span>
      <span :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }">Amount</span>
    </div>

    <!-- Rows -->
    <div :style="{ maxHeight: '340px', overflowY: 'auto' }">
      <div
        v-for="item in data.items"
        :key="item.id"
        class="payroll-row"
        :style="{
          display: 'grid',
          gridTemplateColumns: '1fr 120px 90px 80px',
          alignItems: 'center',
          padding: '10px 20px',
          borderBottom: '1px solid #f7f5f2',
          transition: 'background 0.15s',
          cursor: 'pointer',
        }"
        @click="emit('selectEmployee', item)"
      >
        <!-- Employee -->
        <div :style="{ display: 'flex', alignItems: 'center', gap: '10px' }">
          <div
            :style="{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: getDeptColor(item.department),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: '700',
              color: 'white',
              flexShrink: '0',
            }"
          >
            {{ getInitials(item.name) }}
          </div>
          <p :style="{ fontSize: '13px', fontWeight: '500', color: '#374151' }">{{ item.name }}</p>
        </div>

        <!-- Department -->
        <p :style="{ fontSize: '12px', color: '#6b7280' }">{{ item.department }}</p>

        <!-- Status -->
        <span
          :style="{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: '500',
            padding: '3px 10px',
            borderRadius: '6px',
            background: statusStyles[item.status].bg,
            color: statusStyles[item.status].color,
            width: 'fit-content',
          }"
        >
          {{ statusStyles[item.status].label }}
        </span>

        <!-- Amount -->
        <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151', textAlign: 'right' }">
          {{ formatAmount(item.amount) }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.payroll-row:hover {
  background: #fafaf7 !important;
}
</style>
