<template>
  <ModuleCard title="波长带宽 ↔ 频率带宽" description="Wavelength / Frequency Bandwidth Converter">
    <div class="func-line">
      <span class="func-cn">功能：</span>输入中心波长与带宽数值，自动在波长域与频率域之间换算
    </div>

    <FormulaToggle>
      <div class="formula-block">
        <div>中心频率：<code>f₀ = c / λ₀</code></div>
        <div>频率带宽（Δλ ≪ λ₀）：<code>Δf ≈ c · Δλ / λ₀²</code></div>
        <div class="formula-note">c = 2.998×10⁸ m/s</div>
      </div>
    </FormulaToggle>

    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="中心波长 λ₀" v-model="lambda0" unit="nm" :units="['nm','μm','Å']" @update:unit="(u)=>lambda0Unit=u" />
        <div class="input-row">
          <label class="input-label"><span class="label-cn">带宽类型</span></label>
          <div class="bw-type-select">
            <button :class="{ active: bwType === 'wavelength' }" @click="bwType='wavelength'">波长带宽</button>
            <button :class="{ active: bwType === 'frequency' }" @click="bwType='frequency'">频率带宽</button>
          </div>
        </div>
        <InputGroup
          :label-cn="bwType === 'wavelength' ? '带宽数值 Δλ' : '带宽数值 Δf'"
          v-model="bwValue"
          :unit="bwType === 'wavelength' ? 'nm' : 'GHz'"
          :units="bwType === 'wavelength' ? ['nm','pm','μm'] : ['Hz','kHz','MHz','GHz','THz']"
          @update:unit="(u)=>bwUnit=u"
        />
      </div>

      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="中心频率 f₀" :value="result.centerFreq_THz" unit="THz" :alt-text="`${result.centerFreq_GHz.toFixed(4)} GHz`" />
          <OutputCard label-cn="波长带宽 Δλ" :value="result.deltaLambda_nm" unit="nm" :alt-text="`${result.deltaLambda_pm.toFixed(4)} pm · ${result.deltaLambda_um.toFixed(6)} μm`" />
          <OutputCard label-cn="频率带宽 Δf" :value="result.deltaF_GHz" unit="GHz" :alt-text="`${result.deltaF_MHz.toFixed(4)} MHz · ${result.deltaF_THz.toFixed(6)} THz`" />
        </div>
      </div>
    </div>
  </ModuleCard>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePersistState } from '../../composables/usePersistState.js'
import ModuleCard from '../../components/shared/ModuleCard.vue'
import FormulaToggle from '../../components/shared/FormulaToggle.vue'
import InputGroup from '../../components/shared/InputGroup.vue'
import OutputCard from '../../components/shared/OutputCard.vue'
import { calcBandwidth } from '../../utils/formulas.js'
const lambda0 = ref(1550); const lambda0Unit = ref('nm')
const bwType = ref('wavelength')
const bwValue = ref(0.8); const bwUnit = ref('nm')

usePersistState('bandwidth', { lambda0, lambda0Unit, bwType, bwValue, bwUnit })

const result = computed(() => {
  const l0 = lambda0Unit.value === 'nm' ? lambda0.value
    : lambda0Unit.value === 'μm' ? lambda0.value * 1e3
    : lambda0.value * 0.1
  let bw
  if (bwType.value === 'wavelength') {
    const u = { nm: 1, pm: 1e-3, 'μm': 1e3 }
    bw = bwValue.value * (u[bwUnit.value] || 1)
  } else {
    const u = { Hz: 1e-9, kHz: 1e-6, MHz: 1e-3, GHz: 1, THz: 1e3 }
    bw = bwValue.value * (u[bwUnit.value] || 1)
  }
  return calcBandwidth(l0, bw, bwType.value)
})
</script>

<style scoped>
.func-line { font-size: 12px; margin-bottom: 16px; padding: 8px 12px; background: var(--scenario-bg); border-radius: 6px; color: var(--text-secondary); }
.func-cn { color: var(--accent-text); }
.formula-block { font-size: 14px; line-height: 2; color: var(--text-secondary); }
.formula-block code { color: var(--accent-text); background: var(--accent-bg); padding: 2px 6px; border-radius: 4px; }
.formula-note { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.io-section { display: flex; flex-direction: column; gap: 20px; }
.io-inputs { display: flex; flex-direction: column; gap: 4px; }
.output-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.input-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.input-label { min-width: 180px; font-size: 13px; }
.label-cn { color: var(--text-label); }
.bw-type-select { display: flex; gap: 8px; }
.bw-type-select button {
  padding: 6px 16px; border: 1px solid var(--btn-border); border-radius: 6px;
  background: var(--btn-bg); color: var(--btn-text); cursor: pointer; font-size: 13px;
  transition: all 0.2s;
}
.bw-type-select button:hover { border-color: var(--btn-hover); }
.bw-type-select button.active { border-color: var(--accent); color: var(--accent-text); }
</style>
