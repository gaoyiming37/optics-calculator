<template>
  <ModuleCard title="探测器响应度 / 探测率" description="Detector Responsivity &amp; Detectivity">
    <div class="func-line"><span class="func-cn">功能：</span>根据量子效率计算响应度 (A/W) 与光电流，根据 NEP 计算探测率 D*</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>响应度：<code>R = η·λ(μm) / 1.24 (A/W)</code></div>
        <div>光电流：<code>I_ph = R · P_opt</code></div>
        <div>探测率：<code>D* = √A / NEP (cm·√Hz/W)</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="波长 λ" v-model="lambda" :unit="lamUnit" :units="['nm','μm']" @update:unit="(u)=>lamUnit=u" />
        <InputGroup label-cn="量子效率 η" v-model="QE" :step="0.01" />
        <InputGroup label-cn="入射光功率 P_opt" v-model="Popt" unit="mW" :units="['W','mW','μW']" @update:unit="(u)=>poptUnit=u" />
        <InputGroup label-cn="探测器面积 A" v-model="area" :unit="areaUnit" :units="['mm²','cm²','μm²']" @update:unit="(u)=>areaUnit=u" />
        <InputGroup label-cn="NEP" v-model="nep" :unit="nepUnit" :units="['W/√Hz','pW/√Hz']" @update:unit="(u)=>nepUnit=u" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="响应度 R" :value="result.R_AW" unit="A/W" :decimals="4" />
          <OutputCard label-cn="光电流 I_ph" :value="result.I_ph_uA" unit="μA" :alt-text="`${(result.I_ph_A * 1e3).toExponential(4)} mA`" />
          <OutputCard label-cn="探测率 D*" :value="result.Dstar_cm_sqrtHz_W" unit="cm·√Hz/W" :decimals="2" />
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
import { calcDetectorResponsivity, calcPhotocurrent } from '../../utils/formulas.js'
const lambda = ref(1550); const lamUnit = ref('nm')
const QE = ref(0.8)
const Popt = ref(1); const poptUnit = ref('mW')
const area = ref(1); const areaUnit = ref('mm²')
const nep = ref(1e-12); const nepUnit = ref('W/√Hz')
const result = computed(() => {
  const a = areaUnit.value === 'mm²' ? area.value : areaUnit.value === 'cm²' ? area.value*100 : area.value*1e-6
  const n = nepUnit.value === 'W/√Hz' ? nep.value : nep.value*1e-12
  const r = calcDetectorResponsivity(lambda.value, QE.value, a, n)
  const p = poptUnit.value === 'W' ? Popt.value : poptUnit.value === 'μW' ? Popt.value * 1e-6 : Popt.value * 1e-3
  const ph = calcPhotocurrent(r.R_AW, p)
  return { ...r, ...ph }
})
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
