<template>
  <ModuleCard title="光栅衍射角" description="Grating Diffraction Angle &amp; Littrow Angle">
    <div class="func-line"><span class="func-cn">功能：</span>计算衍射角、Littrow 角与光栅常数</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>衍射角：<code>θ_m = arcsin(mλ/d - sinθ_i)</code></div>
        <div>Littrow 角：<code>θ_L = arcsin(mλ / 2d)</code></div>
        <div>光栅常数：<code>d = 1/N</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="波长 λ" v-model="lambda" :unit="lamUnit" :units="['nm','μm']" @update:unit="(u)=>lamUnit=u" />
        <InputGroup label-cn="刻线密度 N" v-model="lineDensity" :unit="ldUnit" :units="['lines/mm','lines/cm']" @update:unit="(u)=>ldUnit=u" />
        <InputGroup label-cn="入射角 θ_i" v-model="incAngle" :unit="iaUnit" :units="['°','rad']" @update:unit="(u)=>iaUnit=u" />
        <InputGroup label-cn="衍射级次 m" v-model="order" :step="1" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <template v-if="result.error"><div class="error-msg">{{ result.error }}</div></template>
          <template v-else>
            <OutputCard label-cn="光栅常数 d" :value="result.d_um" unit="μm" :alt-text="`${fmt(result.d_nm)} nm`" />
            <OutputCard label-cn="衍射角 θ_m" :value="result.theta_m_deg" unit="°" :alt-text="`${fmt(result.theta_m_mrad)} mrad`" />
            <OutputCard label-cn="Littrow 角 θ_L" :value="result.theta_L_deg ?? '—'" unit="°" :alt-text="result.theta_L_mrad !== null ? `${fmt(result.theta_L_mrad)} mrad` : undefined" />
          </template>
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
import { calcGratingAngle } from '../../utils/formulas.js'
const lambda = ref(1550); const lamUnit = ref('nm')
const lineDensity = ref(600); const ldUnit = ref('lines/mm')
const incAngle = ref(0); const iaUnit = ref('°')
const order = ref(1)
const result = computed(() => {
  const lam = lamUnit.value === 'nm' ? lambda.value : lambda.value * 1e3
  const ia = iaUnit.value === '°' ? incAngle.value : incAngle.value * (180/Math.PI)
  return calcGratingAngle(lam, lineDensity.value, ldUnit.value, ia, order.value)
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
.error-msg { color: var(--error-text); padding: 8px 12px; background: var(--error-bg); border: 1px solid var(--error-border); border-radius: 6px; }
</style>
