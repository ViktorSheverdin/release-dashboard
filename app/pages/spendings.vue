<script setup lang="ts">
import ChatPanel from '~/spendings/components/ChatPanel.vue'
import DashboardPanel from '~/spendings/components/DashboardPanel.vue'
import SlidePanel from '~/spendings/components/SlidePanel.vue'
import TransactionDetailPanel from '~/spendings/components/panels/TransactionDetailPanel.vue'
import EmployeeDetailPanel from '~/spendings/components/panels/EmployeeDetailPanel.vue'
import { componentRegistry } from '~/spendings/config/componentRegistry'
import type { DashboardView, TransactionItem, PayrollItem } from '~/spendings/types'

definePageMeta({ layout: 'spendings' })

// ── Chat intent → dashboard view ────────────────────────────────────
const currentIntent = ref<string | null>(null)

const currentView = computed<DashboardView | null>(() => {
  if (!currentIntent.value) return null
  return componentRegistry[currentIntent.value] || null
})

function onIntentChange(intent: string) {
  currentIntent.value = intent
}

// ── Panel stack ──────────────────────────────────────────────────────
interface PanelConfig {
  type: 'transaction' | 'employee' | 'generic'
  title: string
  subtitle: string
  data?: TransactionItem | PayrollItem
}

const panelStack = ref<PanelConfig[]>([])

const isPanelOpen = computed(() => panelStack.value.length > 0)
const topPanel = computed(() => panelStack.value[panelStack.value.length - 1] ?? null)

function openTransaction(item: TransactionItem) {
  panelStack.value = [{ type: 'transaction', title: item.vendor, subtitle: item.category, data: item }]
}

function openEmployee(item: PayrollItem) {
  panelStack.value = [{ type: 'employee', title: item.name, subtitle: item.department, data: item }]
}

function drillDown(title: string, subtitle: string) {
  panelStack.value = [...panelStack.value, { type: 'generic', title, subtitle }]
}

function popPanel() {
  panelStack.value = panelStack.value.slice(0, -1)
}

function closePanel() {
  panelStack.value = []
}
</script>

<template>
  <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; background: #FAF9F6; color: #1f2937;">

    <!-- Chat Panel -->
    <div style="width: 420px; flex-shrink: 0; position: relative; border-right: 1px solid #e5e2dc;">
      <ChatPanel @intent-change="onIntentChange" />
    </div>

    <!-- Dashboard Panel -->
    <div style="flex: 1; min-width: 0; position: relative;">
      <DashboardPanel
        :view="currentView"
        @select-transaction="openTransaction"
        @select-employee="openEmployee"
      />
    </div>
  </div>

  <!-- Slide Panel — renders on top of everything -->
  <SlidePanel
    :open="isPanelOpen"
    :title="topPanel?.title"
    :subtitle="topPanel?.subtitle"
    :can-go-back="panelStack.length > 1"
    @close="closePanel"
    @back="popPanel"
  >
    <TransactionDetailPanel
      v-if="topPanel?.type === 'transaction'"
      :item="(topPanel.data as TransactionItem)"
      :on-drill-down="drillDown"
    />

    <EmployeeDetailPanel
      v-else-if="topPanel?.type === 'employee'"
      :item="(topPanel.data as PayrollItem)"
      :on-drill-down="drillDown"
    />

    <!-- Generic drill-down level -->
    <div v-else-if="topPanel?.type === 'generic'" :style="{ display: 'flex', flexDirection: 'column', gap: '16px' }">
      <div
        :style="{
          padding: '20px',
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
          borderRadius: '12px',
          color: 'white',
        }"
      >
        <p :style="{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }">Record</p>
        <p :style="{ fontSize: '22px', fontWeight: '700' }">{{ topPanel.title }}</p>
        <p :style="{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }">{{ topPanel.subtitle }}</p>
      </div>
      <p :style="{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', paddingTop: '20px' }">
        Full detail view coming in Phase 4.
      </p>
    </div>

    <template #footer>
      <div :style="{ display: 'flex', gap: '8px' }">
        <button
          :style="{
            flex: '1', padding: '10px', borderRadius: '8px',
            border: '1px solid #E8E5DF', background: 'transparent',
            color: '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
          }"
          @click="closePanel"
        >
          Dismiss
        </button>
        <button
          :style="{
            flex: '1', padding: '10px', borderRadius: '8px',
            border: 'none', background: '#1B4332',
            color: 'white', fontSize: '13px', fontWeight: '500', cursor: 'pointer',
          }"
        >
          View Full Report
        </button>
      </div>
    </template>
  </SlidePanel>
</template>
