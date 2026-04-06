<script setup lang="ts">
import BarChart from './BarChart.vue'
import TabSelector from './TabSelector.vue'
import type { TabbedBarChartData } from '../../types'

const props = defineProps<{
  data: TabbedBarChartData
}>()

const activeTab = ref(props.data.tabs[0])
const chartKey = ref(0)

// Re-key the chart on tab change so BarChart re-mounts and replays bar animation
watch(activeTab, () => {
  chartKey.value++
})

const currentData = computed(() => props.data.datasets[activeTab.value])
</script>

<template>
  <div>
    <!-- Tab selector above chart -->
    <div :style="{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }">
      <TabSelector v-model="activeTab" :tabs="data.tabs" />
    </div>

    <Transition name="chart-slide" mode="out-in">
      <BarChart v-if="currentData" :key="chartKey" :data="currentData" />
    </Transition>
  </div>
</template>

<style scoped>
.chart-slide-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.chart-slide-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.chart-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.chart-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
