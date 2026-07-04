<template>
  <ModuleCard title="光纤耦合损耗" description="Fiber Coupling Loss">
    <div class="func-line"><span class="func-cn">功能：</span>估算模场失配与横向偏移引起的光纤耦合损耗</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>耦合效率：<code>η = [2MFD₁MFD₂/(MFD₁²+MFD₂²)]² · exp[-2d²/(MFD₁²+MFD₂²)]</code></div>
        <div>耦合损耗：<code>Loss = -10·log₁₀(η) (dB)</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="模场直径 MFD₁" v-model="MFD1" unit="μm" />
        <InputGroup label-cn="模场直径 MFD₂" v-model="MFD2" unit="μm" />
        <InputGroup label-cn="横向偏移 d" v-model="offset" unit="μm" :step="0.1" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="耦合效率 η" :value="result.eta_pct" unit="%" :alt-text="`${fmt(result.eta)} (linear)`" />
          <OutputCard label-cn="耦合损耗" :value="result.loss_dB" unit="dB" :decimals="2" />
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
import { calcCouplingLoss } from '../../utils/formulas.js'
const MFD1 = ref(10.4); const MFD2 = ref(10.4); const offset = ref(2)
const result = computed(() => calcCouplingLoss(MFD1.value, MFD2.value, offset.value))
function fmt(v) { return typeof v === 'number' && isFinite(v) ? v.toFixed(6) : '∞' }
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
