<template>
  <div class="output-card" @click="copy" :class="{ 'label-above': labelAbove }">
    <template v-if="labelAbove">
      <div class="output-label">
        <span class="ol-cn">{{ labelCn }}</span>
      </div>
      <div class="output-value">{{ displayValue }}</div>
    </template>
    <template v-else>
      <div class="output-value">{{ displayValue }}</div>
      <div class="output-label">
        <span class="ol-cn">{{ labelCn }}</span>
      </div>
    </template>
    <div v-if="altText" class="output-alt">{{ displayAlt }}</div>
    <div class="copy-hint" v-if="copied">已复制</div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  labelCn: String,
  labelEn: String,
  value: [Number, String],
  unit: String,
  decimals: { type: Number, default: 4 },
  altText: String,
  integer: { type: Boolean, default: false },
  labelAbove: { type: Boolean, default: false },
})
const copied = ref(false)
const displayAlt = computed(() => {
  if (!props.altText) return ''
  return props.altText.replace(/(\d+\.\d*?)0+(?=\D|$)/g, (m, p1) => p1.replace(/\.$/, ''))
})
function formatVal(v) {
  if (v === null || v === undefined || v === Infinity || v === -Infinity) return '∞'
  if (typeof v === 'string') return v
  if (v === 0) return '0'
  if (props.integer) return Math.round(v).toString()
  const abs = Math.abs(v)
  let s
  if (abs > 5000 || (abs > 0 && abs < 0.0001)) {
    s = v.toExponential(props.decimals)
  } else {
    s = v.toFixed(props.decimals)
  }
  if (s.includes('e')) {
    const [mantissa, exponent] = s.split('e')
    s = mantissa.replace(/\.?0+$/, '') + 'e' + exponent
  } else {
    s = s.replace(/\.?0+$/, '')
  }
  return s
}
const displayValue = computed(() => {
  const f = formatVal(props.value)
  return props.unit ? `${f} ${props.unit}` : `${f}`
})
function copy() {
  const text = `${props.labelCn}: ${displayValue.value}`
  navigator.clipboard?.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 1500)
}
</script>
<style scoped>
.output-card {
  position: relative; min-width: 160px; flex: 1; padding: 12px 16px;
  background: var(--bg-card-alt); border: 1px solid var(--border); border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
}
.output-card:hover { border-color: var(--accent); background: var(--accent-bg); }
.output-value { font-size: 20px; font-weight: 600; color: var(--accent-text); font-variant-numeric: tabular-nums; }
.output-label { margin-top: 4px; font-size: 12px; }
.ol-cn { color: var(--output-label); }
.output-alt { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.copy-hint {
  position: absolute; top: -8px; right: 8px; font-size: 11px;
  color: var(--accent-text); background: var(--bg-card); padding: 2px 8px; border-radius: 4px;
  animation: copyFadeOut 1.5s ease forwards;
  pointer-events: none;
}
@keyframes copyFadeOut {
  0% { opacity: 1; transform: translateY(0); }
  70% { opacity: 1; transform: translateY(-2px); }
  100% { opacity: 0; transform: translateY(-6px); }
}
</style>
