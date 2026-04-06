<script setup lang="ts">
import type { SummaryCardData } from '../../types'

defineProps<{
  data: SummaryCardData
}>()

const gradients: Record<string, string> = {
  green: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
  red: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
  amber: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
  neutral: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
}

const trendColors: Record<string, string> = {
  up: '#86EFAC',
  down: '#FCA5A5',
  neutral: 'rgba(255,255,255,0.5)',
}
</script>

<template>
  <div
    :style="{
      background: gradients[data.variant] || gradients.neutral,
      borderRadius: '16px',
      padding: '18px 20px',
      flex: '1',
      minWidth: '140px',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Subtle glow accent -->
    <div
      :style="{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
      }"
    />

    <!-- Icon circle -->
    <div
      :style="{
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '12px',
      }"
    >
      <!-- Dollar -->
      <svg v-if="data.icon === 'dollar' || (!data.icon && data.variant === 'green')" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
      <!-- Chart -->
      <svg v-else-if="data.icon === 'chart'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
      <!-- Users -->
      <svg v-else-if="data.icon === 'users'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <!-- Trending -->
      <svg v-else-if="data.icon === 'trending'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
      <!-- Wallet -->
      <svg v-else-if="data.icon === 'wallet'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M16 12h.01" />
        <path d="M2 10h20" />
      </svg>
      <!-- Tag -->
      <svg v-else-if="data.icon === 'tag'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
      <!-- Default neutral -->
      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    </div>

    <!-- Label -->
    <p :style="{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', lineHeight: '1' }">
      {{ data.label }}
    </p>

    <!-- Value -->
    <p :style="{ fontSize: '22px', fontWeight: '700', color: '#ffffff', lineHeight: '1.3' }">
      {{ data.value }}
    </p>

    <!-- Trend -->
    <div
      v-if="data.trend"
      :style="{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginTop: '8px',
        fontSize: '12px',
        color: trendColors[data.trend.direction],
      }"
    >
      <svg v-if="data.trend.direction === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <svg v-else-if="data.trend.direction === 'down'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <span v-else>&#8212;</span>
      <span>{{ data.trend.percentage }}</span>
    </div>
  </div>
</template>
