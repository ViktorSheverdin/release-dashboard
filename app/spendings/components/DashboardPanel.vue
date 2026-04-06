<script setup lang="ts">
</script>

<template>
  <div
    style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column;"
    class="bg-white rounded-l-2xl shadow-lg border-l border-gray-200 overflow-hidden"
  >
    <!-- Header -->
    <div style="flex-shrink: 0;" class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-[#4A7C59]" />
        <h2 class="text-sm font-semibold text-gray-700">Weekly Snapshot</h2>
      </div>
      <span class="text-xs text-gray-400">Dashboard</span>
    </div>

    <!-- Placeholder content -->
    <div style="flex: 1; min-height: 0;" class="flex items-center justify-center p-8">
      <div class="text-center max-w-xs">
        <div class="w-16 h-16 rounded-2xl bg-[#F0EDE8] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9B9585" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <h3 class="text-sm font-medium text-gray-600 mb-1">Dashboard panels will appear here</h3>
        <p class="text-xs text-gray-400 leading-relaxed">
          Start a conversation to generate financial insights and interactive charts.
        </p>
      </div>
    </div>
  </div>
</template>
