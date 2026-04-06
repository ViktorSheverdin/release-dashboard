<script setup lang="ts">
import type { BarChartData } from '../../types'

const props = defineProps<{
  data: BarChartData
}>()

const maxValue = computed(() => {
  let max = 0
  for (const ds of props.data.datasets) {
    for (const v of ds.values) {
      if (v > max) max = v
    }
  }
  return max
})

const yAxisTicks = computed(() => {
  const max = maxValue.value
  if (max === 0) return [0]
  // Create 5 nice ticks
  const step = Math.ceil(max / 4 / 1000) * 1000
  const ticks: number[] = []
  for (let i = 0; i <= 4; i++) {
    ticks.push(step * i)
  }
  return ticks.reverse()
})

const chartMax = computed(() => {
  return yAxisTicks.value[0] || maxValue.value
})

function barHeight(value: number): string {
  if (chartMax.value === 0) return '0%'
  return (value / chartMax.value) * 100 + '%'
}

function formatAxisValue(value: number): string {
  if (value === 0) return '$0'
  if (value >= 1000) return '$' + (value / 1000).toFixed(0) + 'k'
  return '$' + value
}

function formatValue(value: number): string {
  if (value >= 1000) return '$' + (value / 1000).toFixed(1) + 'k'
  return '$' + value
}

const mounted = ref(false)
onMounted(() => {
  setTimeout(() => { mounted.value = true }, 50)
})
</script>

<template>
  <div
    :style="{
      background: '#ffffff',
      border: '1px solid #E8E5DF',
      borderRadius: '12px',
      padding: '20px',
    }"
  >
    <!-- Title & Legend -->
    <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }">
      <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">{{ data.title }}</p>
      <div :style="{ display: 'flex', gap: '16px' }">
        <div
          v-for="ds in data.datasets"
          :key="ds.label"
          :style="{ display: 'flex', alignItems: 'center', gap: '6px' }"
        >
          <span :style="{ width: '10px', height: '10px', borderRadius: '3px', background: ds.color }" />
          <span :style="{ fontSize: '12px', color: '#6b7280' }">{{ ds.label }}</span>
        </div>
      </div>
    </div>

    <!-- Chart area with Y-axis -->
    <div :style="{ display: 'flex', gap: '0', height: '200px' }">
      <!-- Y-axis labels -->
      <div
        :style="{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingRight: '12px',
          paddingBottom: '28px',
          flexShrink: '0',
          width: '48px',
        }"
      >
        <span
          v-for="tick in yAxisTicks"
          :key="tick"
          :style="{ fontSize: '11px', color: '#9ca3af', textAlign: 'right', lineHeight: '1' }"
        >
          {{ formatAxisValue(tick) }}
        </span>
      </div>

      <!-- Chart bars area -->
      <div :style="{ flex: '1', position: 'relative' }">
        <!-- Grid lines -->
        <div
          :style="{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'none',
          }"
        >
          <div
            v-for="(_, i) in yAxisTicks"
            :key="i"
            :style="{ borderBottom: '1px solid #f0ede8', width: '100%' }"
          />
        </div>

        <!-- Bars -->
        <div :style="{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: 'calc(100% - 28px)', position: 'relative', zIndex: '1' }">
          <div
            v-for="(label, labelIdx) in data.labels"
            :key="label"
            :style="{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }"
          >
            <div :style="{ flex: '1', display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center' }">
              <div
                v-for="ds in data.datasets"
                :key="ds.label"
                class="bar-segment"
                :style="{
                  width: data.datasets.length === 1 ? '50%' : (60 / data.datasets.length) + '%',
                  height: mounted ? barHeight(ds.values[labelIdx]) : '0%',
                  background: ds.color,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  minHeight: '2px',
                  position: 'relative',
                  cursor: 'pointer',
                }"
              >
                <div class="bar-tooltip">
                  {{ formatValue(ds.values[labelIdx]) }}
                </div>
              </div>
            </div>
            <!-- Label -->
            <p :style="{ fontSize: '11px', color: '#9ca3af', marginTop: '10px', textAlign: 'center', lineHeight: '1' }">{{ label }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar-tooltip {
  position: absolute;
  top: -26px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #ffffff;
  background: #374151;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}

.bar-segment:hover .bar-tooltip {
  opacity: 1;
}
</style>
