<template>
  <ModuleCard title="梳齿频率计算" description="Comb Frequency Calculator">
    <div class="func-line"><span class="func-cn">功能：</span>由重复频率与 CEO 偏置计算梳齿序号、频率与对应波长</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>梳齿频率：<code>f_n = n·f_rep + s·f_CEO</code></div>
        <div>梳齿序号：<code>n = floor((f_target - s·f_CEO) / f_rep)</code></div>
        <div>下变频关系（可互换）：<code>f_rep_downmix = 4·f_rep - 980 MHz</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="重复频率 f_rep" v-model="frep" :unit="frUnit" :units="['MHz','kHz','GHz']" @update:unit="(u)=>{frUnit=u; syncDownmix()}" />
        <InputGroup label-cn="下变频 f_rep_downmix" v-model="frepDownmix" :unit="fdUnit" :units="['MHz','kHz','GHz']" @update:unit="(u)=>{fdUnit=u; syncFrep()}" />
        <div class="input-row">
          <label class="input-label"><span class="label-cn">CEO 偏置 s·f_CEO</span></label>
          <div class="sign-select">
            <button :class="{ active: signCEO === 1 }" @click="signCEO = 1">+</button>
            <button :class="{ active: signCEO === -1 }" @click="signCEO = -1">−</button>
          </div>
          <input type="number" class="num-input" v-model.number="fceo" @focus="$event.target.select()" />
          <select class="unit-select" v-model="fcUnit">
            <option value="MHz">MHz</option>
            <option value="kHz">kHz</option>
          </select>
        </div>
        <InputGroup label-cn="目标波长 λ_target" v-model="targetLambda" :unit="tlUnit" :units="['nm','μm']" @update:unit="(u)=>tlUnit=u" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="梳齿序号 n" :value="result.combIndex" integer :decimals="0" :alt-text="`${result.combIndexScientific}`" />
        </div>
        <div class="teeth-grid">
          <div v-for="tooth in result.teeth" :key="tooth.index" class="tooth-card"
            :class="{ highlight: tooth.index === result.combIndex }">
            <div class="tooth-top">
              <span class="tooth-label">n = {{ tooth.index }}</span>
              <span class="tooth-freq">{{ tooth.freq_THz.toFixed(6) }} THz</span>
            </div>
            <div class="tooth-bottom">
              <span class="tooth-lambda">{{ tooth.lambda_nm.toFixed(4) }} nm</span>
              <span class="tooth-freq-alt">{{ (tooth.freq_Hz).toExponential(6) }} Hz</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ModuleCard>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import ModuleCard from '../../components/shared/ModuleCard.vue'
import FormulaToggle from '../../components/shared/FormulaToggle.vue'
import InputGroup from '../../components/shared/InputGroup.vue'
import OutputCard from '../../components/shared/OutputCard.vue'
import { calcOFC } from '../../utils/formulas.js'

const frep = ref(250)
const frUnit = ref('MHz')
const frepDownmix = ref(20)
const fdUnit = ref('MHz')
const fceo = ref(35)
const fcUnit = ref('MHz')
const signCEO = ref(1)
const targetLambda = ref(1550)
const tlUnit = ref('nm')

let syncing = false

function getFrepHz() {
  const v = frep.value
  if (frUnit.value === 'MHz') return v * 1e6
  if (frUnit.value === 'kHz') return v * 1e3
  return v * 1e9
}
function setFrepFromHz(hz) {
  if (frUnit.value === 'MHz') frep.value = hz / 1e6
  else if (frUnit.value === 'kHz') frep.value = hz / 1e3
  else frep.value = hz / 1e9
}
function getDownmixHz() {
  const v = frepDownmix.value
  if (fdUnit.value === 'MHz') return v * 1e6
  if (fdUnit.value === 'kHz') return v * 1e3
  return v * 1e9
}
function setDownmixFromHz(hz) {
  if (fdUnit.value === 'MHz') frepDownmix.value = hz / 1e6
  else if (fdUnit.value === 'kHz') frepDownmix.value = hz / 1e3
  else frepDownmix.value = hz / 1e9
}
function syncDownmix() {
  if (syncing) return; syncing = true
  const f = getFrepHz()
  setDownmixFromHz(f * 4 - 980e6)
  syncing = false
}
function syncFrep() {
  if (syncing) return; syncing = true
  const d = getDownmixHz()
  setFrepFromHz((d + 980e6) / 4)
  syncing = false
}
watch(frep, syncDownmix)
watch(frUnit, syncDownmix)

const result = computed(() => {
  const fr = getFrepHz()
  const fc = (fcUnit.value === 'MHz' ? fceo.value * 1e6 : fceo.value * 1e3) * signCEO.value
  const tl = tlUnit.value === 'nm' ? targetLambda.value : targetLambda.value * 1e3
  return calcOFC(fr, fc, tl)
})
</script>
<style scoped>
.func-line { font-size: 12px; margin-bottom: 16px; padding: 8px 12px; background: var(--scenario-bg); border-radius: 6px; color: var(--text-secondary); }
.func-cn { color: var(--accent-text); }
.formula-block { font-size: 14px; line-height: 2; color: var(--text-secondary); }
.formula-block code { color: var(--accent-text); background: var(--accent-bg); padding: 2px 6px; border-radius: 4px; }
.io-section { display: flex; flex-direction: column; gap: 20px; }
.io-inputs { display: flex; flex-direction: column; gap: 4px; }
.output-grid { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.teeth-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.tooth-card { flex: 1; min-width: 200px; padding: 10px 14px; border-radius: 8px; background: var(--bg-card-alt); border: 1px solid var(--border); transition: all 0.2s; }
.tooth-card.highlight { border-color: var(--accent); background: var(--accent-bg); }
.tooth-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.tooth-label { font-size: 14px; font-weight: 600; color: var(--accent-text); }
.tooth-freq { font-size: 12px; color: var(--text-secondary); }
.tooth-bottom { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); }
.tooth-freq-alt { font-family: monospace; }
.input-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.input-label { min-width: 180px; font-size: 13px; }
.label-cn { color: var(--text-label); }
.sign-select { display: flex; gap: 4px; }
.sign-select button { padding: 4px 12px; border: 1px solid var(--btn-border); border-radius: 6px; background: var(--btn-bg); color: var(--btn-text); cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; min-width: 36px; }
.sign-select button:hover { border-color: var(--btn-hover); }
.sign-select button.active { border-color: var(--accent); color: var(--accent-text); background: var(--accent-bg); }
.num-input { width: 120px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-input); color: var(--text-primary); font-size: 14px; text-align: right; outline: none; }
.num-input:focus { border-color: var(--border-focus); }
.unit-select { padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-input); color: var(--text-secondary); font-size: 12px; cursor: pointer; outline: none; }
</style>
