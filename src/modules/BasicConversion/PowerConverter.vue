<template>
  <ModuleCard title="功率换算" description="Power Converter — W / mW / dBm / V">
    <div class="func-line">
      <span class="func-cn">功能：</span>输入功率值与阻抗，自动换算 W、mW、dBm、Vrms、Vpeak
    </div>

    <FormulaToggle>
      <div class="formula-block">
        <div>dBm→mW：<code>P(mW) = 10^(P(dBm)/10)</code></div>
        <div>W→dBm：<code>P(dBm) = 10·log₁₀(P(mW))</code></div>
        <div>RMS 电压：<code>V_rms = √(P·R)</code></div>
        <div>峰值电压（正弦）：<code>V_peak = V_rms·√2</code></div>
      </div>
    </FormulaToggle>

    <div class="io-section">
      <div class="io-inputs">
        <div class="input-row">
          <label class="input-label"><span class="label-cn">功率数值</span></label>
          <div class="input-controls">
            <input type="number" class="num-input" v-model.number="value" @focus="$event.target.select()" />
            <select class="unit-select" v-model="unit">
              <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
            </select>
          </div>
        </div>
        <InputGroup label-cn="阻抗 R" v-model="impedance" :unit="impUnit" :units="['Ω','kΩ','MΩ']" @update:unit="(u)=>impUnit=u" />
      </div>

      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="功率 P(W)" :value="result.P_W" unit="W" :alt-text="`${fmt(result.P_mW)} mW · ${fmt(result.P_uW)} μW`" />
          <OutputCard label-cn="功率 P(dBm)" :value="result.P_dBm" unit="dBm" />
          <OutputCard label-cn="RMS 电压 Vrms" :value="result.V_rms" unit="V" :alt-text="`${fmt(result.V_rms_mV)} mV`" />
          <OutputCard label-cn="峰值电压 Vpeak" :value="result.V_peak" unit="V" :alt-text="`${fmt(result.V_peak_mV)} mV`" />
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
import { calcPower } from '../../utils/formulas.js'

const value = ref(1)
const unit = ref('mW')
const units = ['W','mW','μW','dBm']
const impedance = ref(50)
const impUnit = ref('Ω')

const result = computed(() => {
  const imp = impUnit.value === 'MΩ' ? impedance.value * 1e6 : impUnit.value === 'kΩ' ? impedance.value * 1e3 : impedance.value
  return calcPower(value.value, unit.value, imp)
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
.input-controls { display: flex; gap: 6px; align-items: center; }
.num-input {
  width: 120px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px;
  background: var(--bg-input); color: var(--text-primary); font-size: 14px; text-align: right; outline: none;
}
.num-input:focus { border-color: var(--border-focus); }
.unit-select { padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-input); color: var(--text-secondary); font-size: 12px; cursor: pointer; outline: none; }
</style>
