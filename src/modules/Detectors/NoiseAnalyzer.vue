<template>
  <ModuleCard title="探测器噪声 / SNR" description="Detector Noise &amp; SNR Analysis">
    <div class="func-line"><span class="func-cn">功能：</span>计算散粒噪声、热噪声与信噪比 SNR（忽略 RIN 和 1/f 噪声）</div>
    <FormulaToggle>
      <div class="formula-block">
        <div v-if="!apdMode">散粒噪声：<code>i_shot = √(2e·I·Δf)</code></div>
        <div v-if="!apdMode">热噪声：<code>i_thermal = √(4k_BT·Δf/R)</code></div>
        <div v-if="!apdMode">总噪声：<code>i_total = √(i_shot² + i_thermal²)</code></div>
        <div v-if="!apdMode">SNR：<code>SNR = I / i_total</code></div>
        <div v-if="apdMode">过量噪声因子：<code>F = k·M + (1−k)·(2−1/M)</code></div>
        <div v-if="apdMode">APD 散粒噪声：<code>i_shot = √(2e·I·M²·F·Δf)</code></div>
        <div v-if="apdMode">APD SNR：<code>SNR = M·I / i_total</code></div>
        <div class="formula-note">注：忽略 RIN 和 1/f 噪声</div>
      </div>
    </FormulaToggle>
    <div class="io-section">
      <div class="io-inputs">
        <div class="input-row">
          <label class="input-label"><span class="label-cn">APD 模式</span></label>
          <label class="switch-label">
            <input type="checkbox" v-model="apdMode" />
            <span class="slider"></span>
          </label>
        </div>
        <template v-if="apdMode">
          <div class="input-row">
            <label class="input-label"><span class="label-cn">APD 类型</span></label>
            <div class="apd-type-select">
              <button :class="{ active: apdType === 'si' }" @click="selectType('si')">Si APD</button>
              <button :class="{ active: apdType === 'ingaas' }" @click="selectType('ingaas')">InGaAs APD</button>
              <button :class="{ active: apdType === 'ge' }" @click="selectType('ge')">Ge APD</button>
              <button :class="{ active: apdType === 'custom' }" @click="selectType('custom')">Custom</button>
            </div>
          </div>
          <div class="input-row">
            <label class="input-label"><span class="label-cn">k 值（电离系数比）</span></label>
            <template v-if="apdType === 'custom'">
              <input type="number" class="num-input" v-model.number="kValue" :step="0.01" />
            </template>
            <template v-else>
              <div class="fixed-value">{{ apdPresetK.toFixed(4) }}</div>
            </template>
          </div>
          <InputGroup label-cn="倍增因子 M" v-model="Mvalue" :step="1" />
        </template>
        <InputGroup label-cn="光电流 I" v-model="current" :unit="curUnit" :units="['μA','mA','A']" @update:unit="(u)=>curUnit=u" />
        <InputGroup label-cn="带宽 Δf" v-model="bandwidth" :unit="bwUnit" :units="['Hz','kHz','MHz','GHz']" @update:unit="(u)=>bwUnit=u" />
        <InputGroup label-cn="负载 R" v-model="loadR" :unit="rUnit" :units="['Ω','kΩ']" @update:unit="(u)=>rUnit=u" />
        <InputGroup label-cn="温度 T" v-model="temp" :unit="tUnit" :units="['K','°C']" @update:unit="(u)=>tUnit=u" />
        <InputGroup label-cn="暗电流 I_dark" v-model="darkCurrent" unit="nA" :units="['nA','μA']" @update:unit="(u)=>dcUnit=u" />
      </div>
      <div class="io-outputs">
        <div class="output-grid">
          <template v-if="apdMode">
            <OutputCard label-cn="过量噪声因子 F" :value="result.F" :decimals="4" />
            <OutputCard label-cn="倍增后信号 I_sig" :value="result.I_sig_uA" unit="μA" />
          </template>
          <OutputCard label-cn="散粒噪声 i_shot" :value="result.iShot_nA" unit="nA" :alt-text="`${result.iShot_A.toExponential(3)} A`" />
          <OutputCard label-cn="热噪声 i_thermal" :value="result.iThermal_nA" unit="nA" :alt-text="`${result.iThermal_A.toExponential(3)} A`" />
          <OutputCard label-cn="总噪声 i_total" :value="result.iTotal_nA" unit="nA" :alt-text="`${result.iTotal_A.toExponential(3)} A`" />
          <OutputCard label-cn="信噪比 SNR" :value="result.SNR_dB" unit="dB" :alt-text="`${result.SNR.toFixed(4)} (linear)`" />
        </div>
      </div>
    </div>
    <ChartPanel title="SNR 随带宽变化 / SNR vs Bandwidth" :show="true" :option="chartOption" />
  </ModuleCard>
</template>
<script setup>
import { ref, computed } from 'vue'
import ModuleCard from '../../components/shared/ModuleCard.vue'
import FormulaToggle from '../../components/shared/FormulaToggle.vue'
import InputGroup from '../../components/shared/InputGroup.vue'
import OutputCard from '../../components/shared/OutputCard.vue'
import ChartPanel from '../../components/shared/ChartPanel.vue'
import { calcDetectorNoise, calcAPDNoise } from '../../utils/formulas.js'

const current = ref(10); const curUnit = ref('μA')
const bandwidth = ref(1); const bwUnit = ref('Hz')
const loadR = ref(50); const rUnit = ref('Ω')
const temp = ref(300); const tUnit = ref('K')
const darkCurrent = ref(1); const dcUnit = ref('nA')

const apdMode = ref(false)
const apdType = ref('si')
const kValue = ref(0.02)
const Mvalue = ref(10)

const apdPresetK = computed(() => {
  const map = { si: 0.02, ingaas: 0.4, ge: 0.7 }
  return map[apdType.value] || 0.02
})

function selectType(key) {
  apdType.value = key
  if (key !== 'custom') kValue.value = apdPresetK.value
}

const result = computed(() => {
  let i = current.value
  if (curUnit.value === 'mA') i *= 1e3
  else if (curUnit.value === 'A') i *= 1e6
  let bw = bandwidth.value
  if (bwUnit.value === 'kHz') bw *= 1e3
  else if (bwUnit.value === 'MHz') bw *= 1e6
  else if (bwUnit.value === 'GHz') bw *= 1e9
  const r = rUnit.value === 'Ω' ? loadR.value : loadR.value * 1e3
  const t = tUnit.value === 'K' ? temp.value : temp.value + 273.15
  const dc = dcUnit.value === 'nA' ? darkCurrent.value : darkCurrent.value * 1e3

  if (apdMode.value) {
    return calcAPDNoise({ current_uA: i, bandwidth_Hz: bw, load_Ohm: r, temp_K: t, M: Mvalue.value, k: kValue.value, darkCurrent_nA: dc })
  }
  return calcDetectorNoise(i, bw, r, t, dc)
})

const chartOption = computed(() => {
  const isDark = document.querySelector('.app-container')?.getAttribute('data-theme') === 'dark'
  const s = isDark ? '#333' : '#eee'
  const l = isDark ? '#888' : '#666'
  const n = isDark ? '#aaa' : '#888'
  return ({
  tooltip: { trigger: 'axis', valueFormatter: v => v.toExponential(3) },
  legend: { data: ['SNR', 'Shot Noise', 'Thermal Noise'], textStyle: { color: '#888' }, bottom: 0 },
  xAxis: { type: 'log', name: 'Δf (Hz)', nameTextStyle: { color: n }, axisLabel: { color: l }, splitLine: { lineStyle: { color: s } } },
  yAxis: { type: 'value', nameTextStyle: { color: n }, axisLabel: { color: l }, splitLine: { lineStyle: { color: s } } },
  series: [
    { name: 'SNR (dB)', type: 'line', smooth: true, showSymbol: false, data: result.value.chartPoints.map(p => [p.freq, p.snr_dB]), lineStyle: { color: '#3b82f6', width: 2 } },
    { name: 'Shot Noise (nA)', type: 'line', smooth: true, showSymbol: false, data: result.value.chartPoints.map(p => [p.freq, p.shot * 1e9]), lineStyle: { color: '#ef4444', width: 1, type: 'dashed' } },
    { name: 'Thermal Noise (nA)', type: 'line', smooth: true, showSymbol: false, data: result.value.chartPoints.map(p => [p.freq, p.thermal * 1e9]), lineStyle: { color: '#f59e0b', width: 1, type: 'dashed' } },
  ],
  grid: { left: 60, right: 20, top: 20, bottom: 50 }, backgroundColor: 'transparent',
})})
</script>
<style scoped>
.func-line { font-size: 12px; margin-bottom: 16px; padding: 8px 12px; background: var(--scenario-bg); border-radius: 6px; color: var(--text-secondary); }
.func-cn { color: var(--accent-text); }
.formula-block { font-size: 14px; line-height: 2; color: var(--text-secondary); }
.formula-block code { color: var(--accent-text); background: var(--accent-bg); padding: 2px 6px; border-radius: 4px; }
.formula-note { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.io-section { display: flex; flex-direction: column; gap: 20px; }
.io-inputs { display: flex; flex-direction: column; gap: 4px; }
.output-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.input-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border); }
.input-label { min-width: 140px; font-size: 13px; }
.label-cn { color: var(--text-label); }
.num-input { width: 120px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-input); color: var(--text-primary); font-size: 14px; text-align: right; outline: none; }
.num-input:focus { border-color: var(--border-focus); }
.fixed-value { font-size: 16px; font-weight: 600; color: var(--accent-text); padding: 6px 10px; background: var(--bg-input); border: 1px solid var(--border); border-radius: 6px; min-width: 120px; text-align: right; }
.switch-label { position: relative; display: inline-block; width: 40px; height: 22px; }
.switch-label input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: var(--switch-bg); border-radius: 22px; transition: 0.3s; }
.slider:before { content: ''; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: 0.3s; }
input:checked+.slider { background: var(--switch-active); }
input:checked+.slider:before { transform: translateX(18px); }
.apd-type-select { display: flex; gap: 6px; flex-wrap: wrap; }
.apd-type-select button { padding: 5px 14px; border: 1px solid var(--btn-border); border-radius: 6px; background: var(--btn-bg); color: var(--btn-text); cursor: pointer; font-size: 12px; transition: all 0.2s; }
.apd-type-select button:hover { border-color: var(--btn-hover); }
.apd-type-select button.active { border-color: var(--accent); color: var(--accent-text); background: var(--accent-bg); }
</style>
