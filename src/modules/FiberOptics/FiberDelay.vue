<template>
  <ModuleCard title="光纤传输延迟" description="Fiber Transmission Delay">
    <div class="func-line"><span class="func-cn">功能：</span>计算光纤传输的光程差与时间延迟</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>光程差：<code>OPL = n·L</code>（单程）／<code>2nL</code>（往返）</div>
        <div>时间延迟：<code>Δt = nL/c</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="单程光纤长度 L" v-model="length" :unit="lenUnit" :units="['km','m']" @update:unit="(u)=>lenUnit=u" />
        <InputGroup label-cn="光纤折射率 n" v-model="n" :step="0.0001" />
        <div class="input-row">
          <label class="input-label"><span class="label-cn">往返</span></label>
          <label class="switch-label">
            <input type="checkbox" v-model="roundTrip" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="光程差 OPL" :value="result.OPL_km" unit="km" :alt-text="`${fmt(result.OPL_m)} m`" />
          <OutputCard label-cn="时间延迟 Δt" :value="result.delay_us" unit="μs" :alt-text="`${fmt(result.delay_ns)} ns`" />
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
import { calcFiberDelay } from '../../utils/formulas.js'
const length = ref(30); const lenUnit = ref('km')
const n = ref(1.4682); const roundTrip = ref(false)
const result = computed(() => {
  const L = lenUnit.value === 'km' ? length.value : length.value * 1e-3
  return calcFiberDelay(L, n.value, roundTrip.value)
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
.switch-label { position: relative; display: inline-block; width: 40px; height: 22px; }
.switch-label input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top:0; left:0; right:0; bottom:0; background: var(--switch-bg); border-radius: 22px; transition: 0.3s; }
.slider:before { content:''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.3s; }
input:checked+.slider { background: var(--switch-active); }
input:checked+.slider:before { transform: translateX(18px); }
</style>
