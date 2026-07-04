<template>
  <ModuleCard title="F-P 标准具" description="Fabry-Perot Etalon">
    <div class="func-line"><span class="func-cn">功能：</span>计算法布里-珀罗标准具的自由光谱范围、精细度与半高全宽</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>FSR：<code>FSR_f = c/(2nL)</code>，<code>FSR_λ = λ²/(2nL)</code></div>
        <div>精细度：<code>F = π√R / (1−R)</code></div>
        <div>FWHM：<code>FWHM = FSR / F</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="腔长 L" v-model="L" :unit="Lunit" :units="['mm','cm','m']" @update:unit="(u)=>Lunit=u" />
        <InputGroup label-cn="介质折射率 n" v-model="n" :step="0.001" />
        <InputGroup label-cn="镜面反射率 R" v-model="R" :step="0.001" />
        <InputGroup label-cn="工作波长 λ" v-model="lambda" unit="nm" :units="['nm','μm']" @update:unit="(u)=>lamUnit=u" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="FSR (频率)" :value="result.FSR_f_GHz" unit="GHz" :decimals="4"
            :alt-text="`${result.FSR_f_MHz.toFixed(4)} MHz`" />
          <OutputCard label-cn="FSR (波长)" :value="result.FSR_lam_nm" unit="nm" :decimals="4" :alt-text="`${result.FSR_lam_pm.toFixed(4)} pm`" />
          <OutputCard label-cn="精细度 F" :value="result.Finesse" :decimals="2" />
          <OutputCard label-cn="FWHM (频率)" :value="result.FWHM_f_MHz" unit="MHz" :decimals="4" />
          <OutputCard label-cn="FWHM (波长)" :value="result.FWHM_lam_pm" unit="pm" :decimals="4" />
          <OutputCard label-cn="Q 值" :value="result.Q" :decimals="2" />
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
import { calcEtalon } from '../../utils/formulas.js'
const L = ref(1); const Lunit = ref('mm')
const n = ref(1.0); const R = ref(0.99)
const lambda = ref(1550); const lamUnit = ref('nm')
const result = computed(() => {
  const Lm = Lunit.value === 'mm' ? L.value * 1e-3 : Lunit.value === 'cm' ? L.value * 1e-2 : L.value
  const lam = lamUnit.value === 'nm' ? lambda.value : lambda.value * 1e3
  return calcEtalon(Lm, n.value, R.value, lam)
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
