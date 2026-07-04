<template>
  <ModuleCard title="光纤色散" description="Fiber Dispersion">
    <div class="func-line"><span class="func-cn">功能：</span>计算单模光纤的色散系数 D、二阶色散 β₂ 与零色散波长</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>色散公式：<code>D(λ) = S₀/4 · [λ − λ₀⁴/λ³]</code></div>
        <div>二阶色散：<code>β₂ = −λ²·D / (2πc)</code></div>
        <div>色散斜率：<code>S = S₀ · (1 + (λ₀/λ)⁴) / 2</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="工作波长 λ" v-model="lambda" unit="nm" />
        <div class="input-row">
          <label class="input-label"><span class="label-cn">光纤类型</span></label>
          <div class="bw-type-select">
            <button :class="{ active: fiberType === 'smf' }" @click="selectFiber('smf')">SMF-28</button>
            <button :class="{ active: fiberType === 'custom' }" @click="selectFiber('custom')">Custom</button>
          </div>
        </div>
        <template v-if="fiberType === 'custom'">
          <InputGroup label-cn="零色散波长 λ₀" v-model="lambda0" unit="nm" />
          <InputGroup label-cn="零色散斜率 S₀" v-model="S0" :step="0.001" />
        </template>
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="色散 D" :value="result.D_ps_nm_km" unit="ps/(nm·km)" :decimals="4" />
          <OutputCard label-cn="β₂" :value="result.beta2_ps2_km" unit="ps²/km" :decimals="4" />
          <OutputCard label-cn="色散斜率 S" :value="result.S_ps_nm2_km" unit="ps/(nm²·km)" :decimals="4" />
          <OutputCard label-cn="零色散波长 λ₀" :value="result.lambda0_nm" unit="nm" :decimals="1" />
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
import { calcFiberDispersion } from '../../utils/formulas.js'
const lambda = ref(1550)
const fiberType = ref('smf')
const lambda0 = ref(1310)
const S0 = ref(0.092)

function selectFiber(type) {
  fiberType.value = type
  if (type === 'smf') { lambda0.value = 1310; S0.value = 0.092 }
}

const result = computed(() => calcFiberDispersion(lambda.value, fiberType.value, lambda0.value, S0.value))
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
.input-label { min-width: 130px; font-size: 13px; }
.label-cn { color: var(--text-label); }
.bw-type-select { display: flex; gap: 8px; }
.bw-type-select button { padding: 6px 16px; border: 1px solid var(--btn-border); border-radius: 6px; background: var(--btn-bg); color: var(--btn-text); cursor: pointer; font-size: 13px; transition: all 0.2s; }
.bw-type-select button:hover { border-color: var(--btn-hover); }
.bw-type-select button.active { border-color: var(--accent); color: var(--accent-text); }
</style>
