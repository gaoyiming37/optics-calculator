<template>
  <ModuleCard title="光束质量 M² / BPP" description="Beam Quality Factor &amp; BPP">
    <div class="func-line"><span class="func-cn">功能：</span>由束腰半径与发散角计算 BPP 与 M² 因子</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>BPP：<code>BPP = w₀·θ</code></div>
        <div>M²：<code>M² = π·w₀·θ / λ</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="波长 λ" v-model="lambda" :unit="lamUnit" :units="['nm','μm']" @update:unit="(u)=>lamUnit=u" />
        <InputGroup label-cn="束腰半径 w₀" v-model="waistR" :unit="wrUnit" :units="['μm','mm']" @update:unit="(u)=>wrUnit=u" />
        <InputGroup label-cn="发散半角 θ" v-model="theta" :unit="thUnit" :units="['mrad','°','rad']" @update:unit="(u)=>thUnit=u" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="BPP" :value="result.BPP_mm_mrad" unit="mm·mrad" :alt-text="`${fmt(result.BPP_mm_deg)} mm·°`" />
          <OutputCard label-cn="M²" :value="result.M2" :decimals="4" />
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
import { calcBeamQuality } from '../../utils/formulas.js'
const lambda = ref(1550); const lamUnit = ref('nm')
const waistR = ref(500); const wrUnit = ref('μm')
const theta = ref(1); const thUnit = ref('mrad')
const result = computed(() => {
  const lam = lamUnit.value==='nm'?lambda.value:lambda.value*1e3
  const wr = wrUnit.value==='μm'?waistR.value:waistR.value*1e3
  let th = thUnit.value==='mrad'?theta.value: thUnit.value==='°'?theta.value*Math.PI/180*1e3: theta.value*1e3
  return calcBeamQuality(lam,wr,th)
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
</style>
