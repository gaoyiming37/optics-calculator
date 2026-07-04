<template>
  <ModuleCard title="高斯光束传播" description="Gaussian Beam Propagation">
    <div class="func-line">
      <span class="func-cn">功能：</span>计算光束半径随传播距离的变化、瑞利长度、发散角与波前曲率
    </div>

    <FormulaToggle>
      <div class="formula-block">
        <div>瑞利长度：<code>z_R = π·w₀² / (M²·λ)</code></div>
        <div>光束半径：<code>w(z) = w₀·√(1 + (z/z_R)²)</code></div>
        <div>发散半角：<code>θ = M²·λ / (π·w₀)</code></div>
        <div>波前曲率：<code>R(z) = z·[1 + (z_R/z)²]</code></div>
      </div>
    </FormulaToggle>

    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="波长 λ" v-model="lambda" :unit="lamUnit" :units="['nm','μm']" @update:unit="(u)=>lamUnit=u" />
        <InputGroup label-cn="束腰直径 D₀ (1/e²)" v-model="waistD" :unit="waistUnit" :units="['mm','μm','cm']" @update:unit="(u)=>waistUnit=u" />
        <InputGroup label-cn="传播距离 z" v-model="dist" :unit="distUnit" :units="['mm','cm','m']" @update:unit="(u)=>distUnit=u" />
        <InputGroup label-cn="光束质量 M²" v-model="M2" :step="0.1" />
      </div>

      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="瑞利长度 z_R" :value="result.zR_mm" unit="mm" :alt-text="`${fmt(result.zR_cm)} cm · ${fmt(result.zR_m)} m`" />
          <OutputCard label-cn="焦深 2z_R" :value="result.DOF_mm" unit="mm" />
          <OutputCard label-cn="发散半角 θ" :value="result.theta_mrad" unit="mrad" :alt-text="`${fmt(result.theta_deg)}°`" />
          <OutputCard label-cn="全发散角 Θ" :value="result.fullAngle_mrad" unit="mrad" :alt-text="`${fmt(result.fullAngle_deg)}°`" />
          <OutputCard label-cn="光束半径 w(z)" :value="result.w_z_mm" unit="mm" :alt-text="`${fmt(result.w_z_um)} μm`" />
          <OutputCard label-cn="光束直径 D(z)" :value="result.D_z_mm" unit="mm" />
          <OutputCard label-cn="波前曲率 R(z)" :value="result.R_z_m" unit="m" />
        </div>
      </div>
    </div>

    <ChartPanel title="光束半径 w(z) 随传播距离变化 / Beam Radius vs Propagation Distance" :show="true" :option="chartOption" />
  </ModuleCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import ModuleCard from '../../components/shared/ModuleCard.vue'
import FormulaToggle from '../../components/shared/FormulaToggle.vue'
import InputGroup from '../../components/shared/InputGroup.vue'
import OutputCard from '../../components/shared/OutputCard.vue'
import ChartPanel from '../../components/shared/ChartPanel.vue'
import { calcGaussianBeam } from '../../utils/formulas.js'

const lambda = ref(1550)
const lamUnit = ref('nm')
const waistD = ref(1)
const waistUnit = ref('mm')
const dist = ref(100)
const distUnit = ref('mm')
const M2 = ref(1.0)

const result = computed(() => {
  const lam = lamUnit.value === 'nm' ? lambda.value : lambda.value * 1e3
  const wd = waistUnit.value === 'mm' ? waistD.value
    : waistUnit.value === 'μm' ? waistD.value * 1e-3
    : waistD.value * 10
  const z = distUnit.value === 'mm' ? dist.value
    : distUnit.value === 'cm' ? dist.value * 10
    : dist.value * 1e3
  return calcGaussianBeam(lam, wd, z, M2.value)
})

const chartOption = computed(() => {
  const isDark = document.querySelector('.app-container')?.getAttribute('data-theme') === 'dark'
  const s = isDark ? '#333' : '#eee'
  const l = isDark ? '#888' : '#666'
  const n = isDark ? '#aaa' : '#888'
  return {
  tooltip: { trigger: 'axis', valueFormatter: v => v.toFixed(4) },
  xAxis: { type: 'value', name: 'z (mm)', nameTextStyle: { color: n }, axisLabel: { color: l }, splitLine: { lineStyle: { color: s } } },
  yAxis: { type: 'value', name: 'w(z) (mm)', nameTextStyle: { color: n }, axisLabel: { color: l }, splitLine: { lineStyle: { color: s } } },
  series: [{ data: result.value.chartPoints.map(p => [p.z, p.w]), type: 'line', smooth: true, showSymbol: false, lineStyle: { color: '#3b82f6', width: 2 }, areaStyle: { color: 'rgba(59,130,246,0.08)' } }],
  grid: { left: 60, right: 20, top: 20, bottom: 40 },
  backgroundColor: 'transparent',
}})

function fmt(v) { return typeof v === 'number' && isFinite(v) ? v.toFixed(4) : '∞' }
</script>

<style scoped>
.func-line { font-size: 12px; margin-bottom: 16px; padding: 8px 12px; background: var(--scenario-bg); border-radius: 6px; color: var(--text-secondary); }
.func-cn { color: var(--accent-text); }
.formula-block { font-size: 14px; line-height: 2; color: var(--text-secondary); }
.formula-block code { color: var(--accent-text); background: var(--accent-bg); padding: 2px 6px; border-radius: 4px; }
.io-section { display: flex; flex-direction: column; gap: 20px; }
.io-inputs { display: flex; flex-direction: column; gap: 4px; }
.output-grid { display: flex; flex-wrap: wrap; gap: 12px; }
</style>
