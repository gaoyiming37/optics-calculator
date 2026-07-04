<template>
  <ModuleCard title="光栅衍射（空间分离）" description="Grating Spatial Separation">
    <div class="func-line"><span class="func-cn">功能：</span>计算两波长经光栅衍射后在传播距离 L 处的横向分离</div>
    <FormulaToggle>
      <div class="formula-block">
        <div>光栅方程：<code>d(sinθ_m + sinθ_i) = mλ</code></div>
        <div>角色散：<code>dθ/dλ = m/(d·cosθ_m)</code></div>
        <div>空间分离：<code>Δx = L·(dθ/dλ)·Δλ</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="中心波长 λ" v-model="lambda" :unit="lamUnit" :units="['nm','μm']" @update:unit="(u)=>lamUnit=u" />
        <InputGroup label-cn="波长差 Δλ" v-model="deltaLam" :unit="dlUnit" :units="['nm','pm']" @update:unit="(u)=>dlUnit=u" />
        <InputGroup label-cn="刻线密度 N" v-model="lineDensity" :unit="ldUnit" :units="['lines/mm','lines/cm']" @update:unit="(u)=>ldUnit=u" />
        <InputGroup label-cn="入射角 θ_i" v-model="incAngle" :unit="iaUnit" :units="['°','rad']" @update:unit="(u)=>iaUnit=u" />
        <InputGroup label-cn="衍射级次 m" v-model="order" :step="1" />
        <InputGroup label-cn="传播距离 L" v-model="distance" :unit="distUnit" :units="['mm','cm','m']" @update:unit="(u)=>distUnit=u" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <template v-if="result.error"><div class="error-msg">{{ result.error }}</div></template>
          <template v-else>
            <OutputCard label-cn="衍射角 θ_m" :value="result.theta_m_deg" unit="°" :alt-text="`${fmt(result.theta_m_mrad)} mrad`" />
            <OutputCard label-cn="角色散 dθ/dλ" :value="result.dTheta_dLam_mrad_nm" unit="mrad/nm" :alt-text="`${fmt(result.dTheta_dLam_deg_nm)} °/nm`" />
            <OutputCard label-cn="空间分离 Δx" :value="result.deltaX_mm" unit="mm" :alt-text="`${fmt(result.deltaX_um)} μm · ${fmt(result.deltaX_cm)} cm`" />
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
import { calcGratingSeparation } from '../../utils/formulas.js'
const lambda = ref(1550); const lamUnit = ref('nm')
const deltaLam = ref(1); const dlUnit = ref('nm')
const lineDensity = ref(600); const ldUnit = ref('lines/mm')
const incAngle = ref(0); const iaUnit = ref('°')
const order = ref(1)
const distance = ref(100); const distUnit = ref('mm')
const result = computed(() => {
  const lam = lamUnit.value === 'nm' ? lambda.value : lambda.value * 1e3
  const dl = dlUnit.value === 'nm' ? deltaLam.value : deltaLam.value * 1e-3
  const ia = iaUnit.value === '°' ? incAngle.value : incAngle.value * (180/Math.PI)
  const d = distUnit.value === 'mm' ? distance.value : distUnit.value === 'cm' ? distance.value * 10 : distance.value * 1e3
  return calcGratingSeparation(lam, dl, lineDensity.value, ldUnit.value, ia, order.value, d)
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
