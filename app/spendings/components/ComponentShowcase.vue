<script setup lang="ts">
import SummaryCard from './dashboard/SummaryCard.vue'
import BarChart from './dashboard/BarChart.vue'
import LineChart from './dashboard/LineChart.vue'
import TransactionList from './dashboard/TransactionList.vue'
import PayrollTable from './dashboard/PayrollTable.vue'
import TabSelector from './dashboard/TabSelector.vue'
import SlidePanel from './SlidePanel.vue'
import type { SummaryCardData, BarChartData, TransactionListData, PayrollData } from '../types'
import type { LineChartData } from './dashboard/LineChart.vue'

// ── Sample data ──────────────────────────────────────────────────────

const cards: SummaryCardData[] = [
  { label: 'Total Revenue', value: '$44,636', icon: 'dollar', trend: { direction: 'up', percentage: '+12.4%' }, variant: 'green' },
  { label: 'Total Expenses', value: '$38,516', icon: 'chart', trend: { direction: 'up', percentage: '+8.2%' }, variant: 'red' },
  { label: 'Net Cash Flow', value: '$6,120', icon: 'trending', trend: { direction: 'down', percentage: '-1.1%' }, variant: 'amber' },
  { label: 'Employees', value: '12', icon: 'users', variant: 'neutral' },
]

const barData: BarChartData = {
  title: 'Revenue vs Expenses',
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    { label: 'Revenue', values: [6200, 8100, 5400, 7300, 9200, 4800, 3600], color: '#4A7C59' },
    { label: 'Expenses', values: [4800, 6200, 5100, 5900, 7100, 5200, 4200], color: '#E07A5F' },
  ],
}

const lineData: LineChartData = {
  title: 'Monthly Trend',
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    { label: 'Revenue', values: [32000, 38000, 35000, 42000, 44000, 48000], color: '#4A7C59', fill: true },
    { label: 'Expenses', values: [28000, 31000, 29000, 35000, 38000, 36000], color: '#E07A5F', fill: true },
  ],
}

const transactions: TransactionListData = {
  title: 'Recent Transactions',
  dateRange: 'May 2026',
  items: [
    { id: '1', vendor: 'Stripe', category: 'Sales & Marketing', amount: 8500, date: '28 May 2026', tags: [{ label: 'Revenue', color: '#4A7C59' }] },
    { id: '2', vendor: 'Google Ads', category: 'Marketing', amount: 5200, date: '27 May 2026', tags: [{ label: 'Ad Spend', color: '#E07A5F' }] },
    { id: '3', vendor: 'Meta Ads', category: 'Marketing', amount: 4350, date: '26 May 2026', tags: [{ label: 'Ad Spend', color: '#E07A5F' }] },
    { id: '4', vendor: 'Welch and Sons', category: 'Advertising', amount: 3200, date: '25 May 2026', tags: [{ label: 'Team', color: '#6B8F71' }] },
    { id: '5', vendor: 'LinkedIn', category: 'Marketing', amount: 2900, date: '24 May 2026', tags: [{ label: 'Campaign', color: '#8B9DC3' }] },
  ],
}

const payroll: PayrollData = {
  title: 'Payroll Summary',
  period: 'March 2026',
  totalAmount: 28300,
  items: [
    { id: 'p1', name: 'Sarah Chen', department: 'Engineering', amount: 4200, status: 'paid', date: 'Mar 01' },
    { id: 'p2', name: 'Marcus Johnson', department: 'Engineering', amount: 3800, status: 'paid', date: 'Mar 01' },
    { id: 'p3', name: 'Emily Rodriguez', department: 'Design', amount: 3200, status: 'paid', date: 'Mar 01' },
    { id: 'p4', name: 'Lisa Wang', department: 'Operations', amount: 2400, status: 'processing', date: 'Mar 01' },
    { id: 'p5', name: 'Tom Bradley', department: 'Support', amount: 1500, status: 'pending', date: 'Mar 01' },
  ],
}

// ── Interaction state ────────────────────────────────────────────────

const activeTab = ref('Revenue')
const panelOpen = ref(false)
const panelDetail = ref<{ title: string; subtitle: string } | null>(null)

function openPanel(title: string, subtitle: string) {
  panelDetail.value = { title, subtitle }
  panelOpen.value = true
}
</script>

<template>
  <div :style="{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }">

    <!-- Section: Summary Cards -->
    <section>
      <p :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }">Summary Cards</p>
      <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }">
        <SummaryCard v-for="(card, i) in cards" :key="i" :data="card" />
      </div>
    </section>

    <!-- Section: Tab Selector -->
    <section>
      <p :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }">Tab Selector</p>
      <div :style="{ display: 'flex', alignItems: 'center', gap: '16px' }">
        <TabSelector v-model="activeTab" :tabs="['Revenue', 'Expenses', 'Payroll']" />
        <span :style="{ fontSize: '13px', color: '#9ca3af' }">Active: <strong :style="{ color: '#374151' }">{{ activeTab }}</strong></span>
      </div>
    </section>

    <!-- Section: Bar Chart -->
    <section>
      <p :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }">Bar Chart</p>
      <BarChart :data="barData" />
    </section>

    <!-- Section: Line Chart -->
    <section>
      <p :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }">Line Chart</p>
      <LineChart :data="lineData" />
    </section>

    <!-- Section: Transaction List -->
    <section>
      <p :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }">Transaction List</p>
      <TransactionList
        :data="transactions"
        @select-transaction="openPanel($event.vendor, $event.category)"
      />
    </section>

    <!-- Section: Payroll Table -->
    <section>
      <p :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }">Payroll Table</p>
      <PayrollTable :data="payroll" />
    </section>

    <!-- Section: Slide Panel trigger -->
    <section>
      <p :style="{ fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }">Slide Panel</p>
      <div :style="{ display: 'flex', gap: '10px', flexWrap: 'wrap' }">
        <button
          :style="{
            padding: '9px 18px',
            borderRadius: '8px',
            border: 'none',
            background: '#1B4332',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }"
          @click="openPanel('Transaction Detail', 'Stripe · 28 May 2026')"
        >
          Open Slide Panel
        </button>
        <button
          :style="{
            padding: '9px 18px',
            borderRadius: '8px',
            border: '1px solid #E8E5DF',
            background: '#ffffff',
            color: '#374151',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }"
          @click="openPanel('Employee Detail', 'Sarah Chen · Engineering')"
        >
          Open with subtitle
        </button>
      </div>
    </section>

  </div>

  <!-- Slide Panel -->
  <SlidePanel
    :open="panelOpen"
    :title="panelDetail?.title"
    :subtitle="panelDetail?.subtitle"
    @close="panelOpen = false"
  >
    <!-- Demo content inside panel -->
    <div :style="{ display: 'flex', flexDirection: 'column', gap: '20px' }">
      <div
        :style="{
          background: '#FAFAF7',
          borderRadius: '10px',
          padding: '16px',
          border: '1px solid #E8E5DF',
        }"
      >
        <p :style="{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }">Amount</p>
        <p :style="{ fontSize: '24px', fontWeight: '700', color: '#1B4332' }">$8,500.00</p>
      </div>

      <div :style="{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }">
        <div v-for="label in ['Category', 'Date', 'Status', 'Reference']" :key="label"
          :style="{ background: '#FAFAF7', borderRadius: '8px', padding: '12px 14px', border: '1px solid #E8E5DF' }"
        >
          <p :style="{ fontSize: '11px', color: '#9ca3af', marginBottom: '3px' }">{{ label }}</p>
          <p :style="{ fontSize: '13px', fontWeight: '500', color: '#374151' }">—</p>
        </div>
      </div>

      <div>
        <p :style="{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }">Similar transactions</p>
        <div
          v-for="i in 3"
          :key="i"
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #f0ede8',
          }"
        >
          <div>
            <p :style="{ fontSize: '13px', fontWeight: '500', color: '#374151' }">Stripe</p>
            <p :style="{ fontSize: '11px', color: '#9ca3af' }">{{ 20 + i }} May 2026</p>
          </div>
          <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">${{ (7000 + i * 500).toLocaleString() }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div :style="{ display: 'flex', gap: '8px' }">
        <button
          :style="{
            flex: '1',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #E8E5DF',
            background: 'transparent',
            color: '#374151',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }"
          @click="panelOpen = false"
        >
          Dismiss
        </button>
        <button
          :style="{
            flex: '1',
            padding: '10px',
            borderRadius: '8px',
            border: 'none',
            background: '#1B4332',
            color: 'white',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }"
        >
          View Full Report
        </button>
      </div>
    </template>
  </SlidePanel>
</template>
