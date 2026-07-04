<template>
  <ModuleCard title="透镜聚焦光斑" description="Lens Focusing Spot">
    <div class="func-line">
      <span class="func-cn">功能：</span>计算透镜聚焦后的光斑尺寸、焦深与等效 f/#
    </div>
    <FormulaToggle>
      <div class="formula-block">
        <div>聚焦光斑半径：<code>w_f = M²·λ·f / (π·w_in)</code></div>
        <div>焦深：<code>DOF = 2π·w_f² / (M²·λ)</code></div>
        <div>等效 f/#：<code>f/# = f / D</code></div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <InputGroup label-cn="波长 λ" v-model="lambda" :unit="lamUnit" :units="['nm','μm']" @update:unit="(u)=>lamUnit=u" />
        <InputGroup label-cn="入射光束直径 D (1/e²)" v-model="beamD" :unit="bdUnit" :units="['mm','cm']" @update:unit="(u)=>bdUnit=u" />
        <InputGroup label-cn="透镜焦距 f" v-model="focal" :unit="focUnit" :units="['mm','cm']" @update:unit="(u)=>focUnit=u" />
        <InputGroup label-cn="光束质量 M²" v-model="M2" :step="0.1" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <OutputCard label-cn="聚焦光斑半径 w_f" :value="result.wf_um" unit="μm" :alt-text="`${fmt(result.wf_mm)} mm`" />
          <OutputCard label-cn="聚焦光斑直径 D_f" :value="result.Df_um" unit="μm" />
          <OutputCard label-cn="焦深 DOF" :value="result.DOF_mm" unit="mm" :alt-text="`${fmt(result.DOF_um)} μm`" />
          <OutputCard label-cn="等效 f/#" :value="result.fNum" :decimals="2" />
        </div>
      </div>
    </div>
    <ChartPanel title="聚焦光斑半径 w_f 随焦距 f 变化 / Spot Radius vs Focal Length" :show="true" :option="chartOption" />
  </ModuleCard>
</template>
<script setup>
import { ref, computed } from 'vue'
import ModuleCard from '../../components/shared/ModuleCard.vue'
import FormulaToggle from '../../components/shared/FormulaToggle.vue'
import InputGroup from '../../components/shared/InputGroup.vue'
import OutputCard from '../../components/shared/OutputCard.vue'
import ChartPanel from '../../components/shared/ChartPanel.vue'
import { calcLensFocus } from '../../utils/formulas.js'
const lambda = ref(1550); const lamUnit = ref('nm')
const beamD = ref(10); const bdUnit = ref('mm')
const focal = ref(50); const focUnit = ref('mm')
const M2 = ref(1.0)
const result = computed(() => calcLensFocus(lamUnit.value==='nm'?lambda.value:lambda.value*1e3, bdUnit.value==='mm'?beamD.value:beamD.value*10, focUnit.value==='mm'?focal.value:focal.value*10, M2.value))
const chartOption = computed(() => {
  const isDark = document.querySelector('.app-container')?.getAttribute('data-theme') === 'dark'
  const s = isDark ? '#333' : '#eee'
  const l = isDark ? '#888' : '#666'
  const n = isDark ? '#aaa' : '#888'
  return { tooltip: {trigger:'axis',valueFormatter:v=>v.toFixed(4)}, xAxis: {type:'value',name:'f (mm)',nameTextStyle:{color:n},axisLabel:{color:l},splitLine:{lineStyle:{color:s}}}, yAxis: {type:'value',name:'w_f (μm)',nameTextStyle:{color:n},axisLabel:{color:l},splitLine:{lineStyle:{color:s}}}, series: [{data: result.value.chartPoints.map(p=>[p.f,p.wf]), type:'line', smooth:true, showSymbol:false, lineStyle:{color:'#3b82f6',width:2}, areaStyle:{color:'rgba(59,130,246,0.08)'}}], grid: { left: 60, right: 20, top: 20, bottom: 40 }, backgroundColor:'transparent', }
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
