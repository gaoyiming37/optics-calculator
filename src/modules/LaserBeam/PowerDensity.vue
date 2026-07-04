<template>
  <ModuleCard title="功率 / 能量密度" description="Power &amp; Energy Density">
    <div class="func-line"><span class="func-cn">功能：</span>计算连续型功率密度或脉冲型峰值功率密度与能量密度</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>光斑面积：<code>A = π·r²</code></div>
        <div>CW 强度：<code>I = P/A</code></div>
        <div>脉冲峰值功率：<code>P_peak = E/τ</code></div>
        <div>脉冲能量密度：<code>F = E/A</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <div class="input-row">
          <label class="input-label"><span class="label-cn">光源类型</span></label>
          <div class="bw-type-select">
            <button :class="{ active: mode === 'CW' }" @click="mode='CW'">连续型 CW</button>
            <button :class="{ active: mode === 'pulsed' }" @click="mode='pulsed'">脉冲型 Pulsed</button>
          </div>
        </div>
        <InputGroup v-if="mode==='CW'" label-cn="功率 P" v-model="power" :unit="powUnit" :units="['W','mW','μW']" @update:unit="(u)=>powUnit=u" />
        <template v-if="mode==='pulsed'">
          <InputGroup label-cn="能量 E" v-model="energy" :unit="engUnit" :units="['J','mJ','μJ']" @update:unit="(u)=>engUnit=u" />
          <InputGroup label-cn="脉冲宽度 τ" v-model="pulseW" :unit="pwUnit" :units="['ns','ps','fs']" @update:unit="(u)=>pwUnit=u" />
        </template>
        <InputGroup label-cn="光斑半径 r (1/e²)" v-model="radius" :unit="rUnit" :units="['mm','μm','cm']" @update:unit="(u)=>rUnit=u" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="光斑面积 A" :value="result.area_mm2" unit="mm²" :alt-text="`${fmt(result.area_cm2)} cm²`" />
          <template v-if="mode==='CW'">
            <OutputCard label-cn="平均功率密度 I" :value="result.intensity_Wcm2" unit="W/cm²" :alt-text="`${fmt(result.intensity_kWcm2)} kW/cm²`" />
          </template>
          <template v-if="mode==='pulsed'">
            <OutputCard label-cn="峰值功率 P_peak" :value="result.peakPower_W" unit="W" />
            <OutputCard label-cn="峰值功率密度 I_peak" :value="result.peakIntensity_Wcm2" unit="W/cm²" :alt-text="`${fmt(result.peakIntensity_kWcm2)} kW/cm²`" />
            <OutputCard label-cn="能量密度 F" :value="result.fluence_Jcm2" unit="J/cm²" :alt-text="`${fmt(result.fluence_mJcm2)} mJ/cm²`" />
          </template>
        </div>
      </div>
    </div>
  </ModuleCard>
</template>
<script setup>
import { ref, computed } from 'vue'
import ModuleCard from '../../components/shared/ModuleCard.vue'
import FormulaToggle from '../../components/shared/FormulaToggle.vue'
import InputGroup from '../../components/shared/InputGroup.vue'
import OutputCard from '../../components/shared/OutputCard.vue'
import { calcPowerDensity } from '../../utils/formulas.js'
const mode = ref('CW')
const power = ref(1); const powUnit = ref('W')
const energy = ref(1); const engUnit = ref('J')
const pulseW = ref(1); const pwUnit = ref('ns')
const radius = ref(1); const rUnit = ref('mm')
const result = computed(() => {
  let pW=power.value; if(powUnit.value==='mW') pW*=1e-3; else if(powUnit.value==='μW') pW*=1e-6
  let eJ=energy.value; if(engUnit.value==='mJ') eJ*=1e-3; else if(engUnit.value==='μJ') eJ*=1e-6
  let ps=pulseW.value; if(pwUnit.value==='ns') ps*=1e-9; else if(pwUnit.value==='ps') ps*=1e-12; else if(pwUnit.value==='fs') ps*=1e-15
  let r=radius.value; if(rUnit.value==='μm') r*=1e-3; else if(rUnit.value==='cm') r*=10
  return calcPowerDensity(mode.value,pW,eJ,ps,r)
})
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
.input-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.input-label { min-width: 180px; font-size: 13px; }
.label-cn { color: var(--text-label); }
.bw-type-select { display: flex; gap: 8px; }
.bw-type-select button { padding: 6px 16px; border: 1px solid var(--btn-border); border-radius: 6px; background: var(--btn-bg); color: var(--btn-text); cursor: pointer; font-size: 13px; transition: all 0.2s; }
.bw-type-select button:hover { border-color: var(--btn-hover); }
.bw-type-select button.active { border-color: var(--accent); color: var(--accent-text); }
</style>
