<script setup lang="ts">
export interface LineChartData {
  title: string
  labels: string[]
  datasets: {
    label: string
    values: number[]
    color: string
    fill?: boolean
  }[]
}

const props = defineProps<{
  data: LineChartData
}>()

const svgWidth = ref(0)
const containerEl = ref<HTMLDivElement | null>(null)
const svgHeight = 180
const paddingLeft = 48
const paddingRight = 16
const paddingTop = 12
const paddingBottom = 28

const mounted = ref(false)

onMounted(() => {
  if (containerEl.value) {
    svgWidth.value = containerEl.value.clientWidth
  }
  setTimeout(() => { mounted.value = true }, 50)
})

const maxValue = computed(() => {
  let max = 0
  for (const ds of props.data.datasets) {
    for (const v of ds.values) {
      if (v > max) max = v
    }
  }
  return max || 1
})

const yTicks = computed(() => {
  const max = maxValue.value
  const step = Math.ceil(max / 4 / 1000) * 1000 || 1
  return [0, step, step * 2, step * 3, step * 4].reverse()
})

const chartMax = computed(() => yTicks.value[0])

function xPos(idx: number): number {
  const count = props.data.labels.length
  if (count <= 1) return paddingLeft
  const w = svgWidth.value - paddingLeft - paddingRight
  return paddingLeft + (idx / (count - 1)) * w
}

function yPos(value: number): number {
  const h = svgHeight - paddingTop - paddingBottom
  return paddingTop + h - (value / chartMax.value) * h
}

function buildPath(values: number[]): string {
  if (!mounted.value) {
    const baseline = yPos(0)
    return values.map((_, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${baseline}`).join(' ')
  }
  return values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yPos(v)}`).join(' ')
}

function buildFillPath(values: number[]): string {
  const line = buildPath(values)
  const lastX = xPos(values.length - 1)
  const firstX = xPos(0)
  const baseline = yPos(0)
  return `${line} L${lastX},${baseline} L${firstX},${baseline} Z`
}

function formatTick(v: number): string {
  if (v === 0) return '$0'
  if (v >= 1000) return '$' + (v / 1000).toFixed(0) + 'k'
  return '$' + v
}
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
    <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }">
      <p :style="{ fontSize: '13px', fontWeight: '600', color: '#374151' }">{{ data.title }}</p>
      <div :style="{ display: 'flex', gap: '16px' }">
        <div
          v-for="ds in data.datasets"
          :key="ds.label"
          :style="{ display: 'flex', alignItems: 'center', gap: '6px' }"
        >
          <span :style="{ width: '20px', height: '2px', background: ds.color, display: 'inline-block', borderRadius: '2px' }" />
          <span :style="{ fontSize: '12px', color: '#6b7280' }">{{ ds.label }}</span>
        </div>
      </div>
    </div>

    <div ref="containerEl" :style="{ width: '100%' }">
      <svg
        v-if="svgWidth > 0"
        :width="svgWidth"
        :height="svgHeight"
        :style="{ overflow: 'visible' }"
      >
        <!-- Grid lines + Y labels -->
        <g v-for="(tick, i) in yTicks" :key="i">
          <line
            :x1="paddingLeft"
            :y1="yPos(tick)"
            :x2="svgWidth - paddingRight"
            :y2="yPos(tick)"
            stroke="#f0ede8"
            stroke-width="1"
          />
          <text
            :x="paddingLeft - 8"
            :y="yPos(tick) + 4"
            text-anchor="end"
            :style="{ fontSize: '11px', fill: '#9ca3af' }"
          >
            {{ formatTick(tick) }}
          </text>
        </g>

        <!-- Datasets -->
        <g v-for="ds in data.datasets" :key="ds.label">
          <!-- Fill area -->
          <path
            v-if="ds.fill"
            :d="buildFillPath(ds.values)"
            :fill="ds.color"
            fill-opacity="0.08"
            :style="{ transition: 'd 0.6s ease' }"
          />
          <!-- Line -->
          <path
            :d="buildPath(ds.values)"
            :stroke="ds.color"
            stroke-width="2"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
            :style="{ transition: 'd 0.6s ease' }"
          />
          <!-- Dots -->
          <circle
            v-for="(v, idx) in ds.values"
            :key="idx"
            :cx="xPos(idx)"
            :cy="mounted ? yPos(v) : yPos(0)"
            r="3.5"
            :fill="ds.color"
            stroke="white"
            stroke-width="2"
            :style="{ transition: 'cy 0.6s ease' }"
          />
        </g>

        <!-- X-axis labels -->
        <text
          v-for="(label, idx) in data.labels"
          :key="label"
          :x="xPos(idx)"
          :y="svgHeight - 4"
          text-anchor="middle"
          :style="{ fontSize: '11px', fill: '#9ca3af' }"
        >
          {{ label }}
        </text>
      </svg>
    </div>
  </div>
</template>
