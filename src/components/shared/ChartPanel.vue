<template>
  <div class="chart-panel" v-if="show">
    <div class="chart-title">{{ title }}</div>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: String,
  show: { type: Boolean, default: true },
  option: { type: Object, default: () => ({}) },
})

const chartRef = ref(null)
let chart = null

function renderChart() {
  if (!chartRef.value || !props.option) return
  if (!chart) {
    chart = echarts.init(chartRef.value)
  }
  chart.setOption(props.option, true)
}

onMounted(renderChart)
watch(() => props.option, renderChart, { deep: true })

onUnmounted(() => { chart?.dispose() })
</script>

<style scoped>
.chart-panel { margin-top: 16px; padding: 16px; background: var(--bg-card-alt); border: 1px solid var(--border); border-radius: 8px; }
.chart-title { font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
.chart-container { width: 100%; height: 300px; }
</style>
