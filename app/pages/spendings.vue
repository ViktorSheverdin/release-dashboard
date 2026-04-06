<script setup lang="ts">
import ChatPanel from '~/spendings/components/ChatPanel.vue'
import DashboardPanel from '~/spendings/components/DashboardPanel.vue'
import SimilarTransactionsPane from '~/spendings/components/panes/SimilarTransactionsPane.vue'
import TransactionDetailPane from '~/spendings/components/panes/TransactionDetailPane.vue'
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
  // Reset panes when dashboard view changes
  selectedTransaction.value = null
  selectedSimilar.value = null
}

// ── Multi-pane transaction state ─────────────────────────────────────
const selectedTransaction = ref<TransactionItem | null>(null)
const selectedSimilar = ref<TransactionItem | null>(null)

function onSelectTransaction(item: TransactionItem) {
  // Clicking a different transaction resets pane 3
  if (selectedTransaction.value?.id !== item.id) {
    selectedSimilar.value = null
  }
  selectedTransaction.value = item
}

function onSelectSimilar(item: TransactionItem) {
  selectedSimilar.value = item
}

function closeSimilarPane() {
  selectedTransaction.value = null
  selectedSimilar.value = null
}

function closeDetailPane() {
  selectedSimilar.value = null
}

// Payroll uses the legacy slide panel
import SlidePanel from '~/spendings/components/SlidePanel.vue'
import EmployeeDetailPanel from '~/spendings/components/panels/EmployeeDetailPanel.vue'

const selectedEmployee = ref<PayrollItem | null>(null)
</script>

<template>
  <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; display: flex; background: #FAF9F6; color: #1f2937;">

    <!-- Chat Panel -->
    <div style="width: 420px; flex-shrink: 0; position: relative; border-right: 1px solid #e5e2dc;">
      <ChatPanel @intent-change="onIntentChange" />
    </div>

    <!-- Dashboard area -->
    <div style="flex: 1; min-width: 0; position: relative; overflow: hidden;">

      <!-- Main dashboard always fills full space -->
      <DashboardPanel
        :view="currentView"
        @select-transaction="onSelectTransaction"
        @select-employee="selectedEmployee = $event"
      />

      <!-- Overlay pane container: anchored to right edge, grows leftward as panes open -->
      <div
        style="position: absolute; top: 0; right: 0; bottom: 0; display: flex; pointer-events: none; z-index: 10;"
      >
        <!-- Pane 2: Similar transactions -->
        <Transition name="pane">
          <div
            v-if="selectedTransaction"
            style="width: 300px; height: 100%; flex-shrink: 0; pointer-events: auto;"
          >
            <SimilarTransactionsPane
              :transaction="selectedTransaction"
              @select="onSelectSimilar"
              @close="closeSimilarPane"
            />
          </div>
        </Transition>

        <!-- Pane 3: Transaction detail -->
        <Transition name="pane">
          <div
            v-if="selectedSimilar"
            style="width: 300px; height: 100%; flex-shrink: 0; pointer-events: auto;"
          >
            <TransactionDetailPane
              :transaction="selectedSimilar"
              @close="closeDetailPane"
            />
          </div>
        </Transition>
      </div>

    </div>
  </div>

  <!-- Employee slide panel (payroll rows) -->
  <SlidePanel
    :open="!!selectedEmployee"
    :title="selectedEmployee?.name"
    :subtitle="selectedEmployee?.department"
    @close="selectedEmployee = null"
  >
    <EmployeeDetailPanel
      v-if="selectedEmployee"
      :item="selectedEmployee"
    />
  </SlidePanel>
</template>

<style>
.pane-enter-active {
  transition: width 0.25s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s ease;
}
.pane-leave-active {
  transition: width 0.2s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.15s ease;
}
.pane-enter-from,
.pane-leave-to {
  width: 0 !important;
  opacity: 0;
}
</style>
