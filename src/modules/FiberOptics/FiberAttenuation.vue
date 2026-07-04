<template>
  <ModuleCard title="光纤衰减" description="Fiber Attenuation &amp; Link Budget">
    <div class="func-line"><span class="func-cn">功能：</span>计算光纤链路总损耗、透射比与传输时间</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>总损耗：<code>Loss_total (dB) = α·L + n·Loss_node</code></div>
        <div>透射比：<code>T = 10^{-Loss/10}</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="衰减系数 α" v-model="alpha" unit="dB/km" :step="0.01" />
        <InputGroup label-cn="光纤长度 L" v-model="length" :unit="lenUnit" :units="['km','m']" @update:unit="(u)=>lenUnit=u" />
        <InputGroup label-cn="节点数（法兰）" v-model="nodes" :step="1" />
        <InputGroup label-cn="节点损耗" v-model="nodeLoss" unit="dB/节点" :step="0.01" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="总损耗" :value="result.totalLoss_dB" unit="dB" :decimals="2" />
          <OutputCard label-cn="透射比 P_out/P_in" :value="result.transmittance_pct" unit="%" :alt-text="`${fmt(result.transmittance)} (linear)`" />
          <OutputCard label-cn="传输时间" :value="result.delay_us" unit="μs" :alt-text="`${fmt(result.delay_ns)} ns · ${fmt(result.delay_ps)} ps`" />
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
import { calcFiberAttenuation } from '../../utils/formulas.js'
const alpha = ref(0.2)
const length = ref(30); const lenUnit = ref('km')
const nodes = ref(2); const nodeLoss = ref(0.1)
const result = computed(() => {
  const L = lenUnit.value === 'km' ? length.value : length.value * 1e-3
  return calcFiberAttenuation(alpha.value, L, nodes.value, nodeLoss.value)
})
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
