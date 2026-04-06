<script setup lang="ts">
import type { DashboardView, TransactionItem, PayrollItem, SummaryCardData, BarChartData, TabbedBarChartData, TransactionListData, PayrollData } from '../types'
import { mockDataMap } from '../data/mockData'
import SummaryCard from './dashboard/SummaryCard.vue'
import BarChart from './dashboard/BarChart.vue'
import TabbedBarChart from './dashboard/TabbedBarChart.vue'
import TransactionList from './dashboard/TransactionList.vue'
import PayrollTable from './dashboard/PayrollTable.vue'

const props = defineProps<{
  view: DashboardView | null
}>()

const emit = defineEmits<{
  selectTransaction: [item: TransactionItem]
  selectEmployee: [item: PayrollItem]
}>()

function getData(dataKey: string): unknown {
  return mockDataMap[dataKey]
}

const isVisible = ref(false)
watch(
  () => props.view,
  () => {
    isVisible.value = false
    if (props.view) setTimeout(() => { isVisible.value = true }, 60)
  },
  { immediate: true }
)
</script>

<template>
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; background: #ffffff;">

    <!-- Header -->
    <div style="flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 15px 24px; border-bottom: 1px solid #f0ede8;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span
          :style="{
            width: '8px', height: '8px', borderRadius: '50%',
            background: view ? '#4A7C59' : '#d1d5db',
            display: 'inline-block',
          }"
        />
        <h2 style="font-size: 14px; font-weight: 600; color: #374151;">
          {{ view?.title || 'Weekly Snapshot' }}
        </h2>
      </div>
      <span style="font-size: 12px; color: #9ca3af;">{{ view?.subtitle || 'Dashboard' }}</span>
    </div>

    <!-- Content -->
    <div style="flex: 1; overflow-y: auto; min-height: 0; padding: 20px 24px;">

      <!-- Empty state -->
      <div
        v-if="!view"
        style="display: flex; align-items: center; justify-content: center; height: 100%;"
      >
        <div style="text-align: center; max-width: 240px;">
          <div style="width: 52px; height: 52px; border-radius: 14px; background: #F0EDE8; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9B9585" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h3 style="font-size: 13px; font-weight: 500; color: #6b7280; margin-bottom: 4px;">Dashboard panels will appear here</h3>
          <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">Start a conversation to generate financial insights and interactive charts.</p>
        </div>
      </div>

      <!-- Registry-driven components -->
      <div
        v-else
        :style="{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          opacity: isVisible ? '1' : '0',
          transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
        }"
      >
        <template v-for="(comp, idx) in view.components" :key="idx">
          <div
            v-if="comp.type === 'summary-cards'"
            style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;"
          >
            <SummaryCard
              v-for="(card, cardIdx) in (getData(comp.dataKey) as SummaryCardData[])"
              :key="cardIdx"
              :data="card"
            />
          </div>

          <BarChart
            v-else-if="comp.type === 'bar-chart'"
            :data="getData(comp.dataKey) as BarChartData"
          />

          <TabbedBarChart
            v-else-if="comp.type === 'tabbed-bar-chart'"
            :data="getData(comp.dataKey) as TabbedBarChartData"
          />

          <TransactionList
            v-else-if="comp.type === 'transaction-list'"
            :data="getData(comp.dataKey) as TransactionListData"
            @select-transaction="emit('selectTransaction', $event)"
          />

          <PayrollTable
            v-else-if="comp.type === 'payroll-table'"
            :data="getData(comp.dataKey) as PayrollData"
            @select-employee="emit('selectEmployee', $event)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
