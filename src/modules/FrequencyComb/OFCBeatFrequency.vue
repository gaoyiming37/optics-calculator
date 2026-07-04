<template>
  <ModuleCard title="光频梳拍频" description="OFC Beat Frequency Calculator">
    <div class="func-line"><span class="func-cn">功能：</span>由拍频方程 f_CW = n·f_rep + s₁·f_CEO + s₂·f_beat 自动推导未知量；或根据光频预估值推算梳齿数</div>

    <FormulaToggle>
      <div class="formula-block">
        <div>拍频方程：<code>f_CW = n·f_rep + s₁·f_CEO + s₂·f_beat</code></div>
        <div>梳齿序号：<code>n = (f_CW - s₁·f_CEO - s₂·f_beat) / f_rep</code></div>
        <div>近似模式：<code>n ≈ (f_CW_unsure - s₁·f_CEO - s₂·f_beat) / f_rep</code></div>
      </div>
    </FormulaToggle>

    <div class="mode-nav">
      <div class="mode-item" :class="{ active: mode === 'exact' }" @click="mode='exact'">精确计算 <span class="en-sm">Exact</span></div>
      <div class="mode-item" :class="{ active: mode === 'approx' }" @click="mode='approx'">近似推算 <span class="en-sm">Approx</span></div>
    </div>

    <!-- ═══════ 模式 A：精确计算 ═══════ -->
    <div v-show="mode === 'exact'" class="io-section">
      <div class="io-inputs">
        <div class="input-row">
          <label class="chk-label"><input type="checkbox" v-model="calcCW" @change="autoCalc" /></label>
          <label class="input-label"><span class="label-cn">f_CW</span></label>
          <input type="number" class="num-input" :class="{ disabled: calcCW }" v-model.number="fCW" :disabled="calcCW" @focus="$event.target.select()" @input="autoCalc" />
          <select class="unit-select" v-model="fCWUnit" @change="autoCalc" :disabled="calcCW">
            <option value="THz">THz</option><option value="GHz">GHz</option><option value="MHz">MHz</option>
          </select>
        </div>
        <div class="input-row">
          <label class="chk-label"><input type="checkbox" v-model="calcN" @change="autoCalc" /></label>
          <label class="input-label"><span class="label-cn">n</span></label>
          <input type="number" class="num-input" :class="{ disabled: calcN }" v-model.number="n" :disabled="calcN" @focus="$event.target.select()" @input="autoCalc" />
        </div>
        <div class="input-row">
          <label class="chk-label"><input type="checkbox" v-model="calcRep" @change="autoCalc" /></label>
          <label class="input-label"><span class="label-cn">f_rep</span></label>
          <input type="number" class="num-input" :class="{ disabled: calcRep }" v-model.number="fRep" :disabled="calcRep" @focus="$event.target.select()" @input="autoCalc" />
          <select class="unit-select" v-model="fRepUnit" @change="autoCalc" :disabled="calcRep">
            <option value="MHz">MHz</option><option value="kHz">kHz</option><option value="GHz">GHz</option>
          </select>
        </div>
        <div class="input-row">
          <label class="chk-label"><input type="checkbox" v-model="calcCEO" @change="autoCalc" /></label>
          <label class="input-label"><span class="label-cn">f_CEO</span></label>
          <div class="sign-select">
            <button :class="{ active: signCEO === 1 }" @click="signCEO = 1; autoCalc()">+</button>
            <button :class="{ active: signCEO === -1 }" @click="signCEO = -1; autoCalc()">−</button>
          </div>
          <input type="number" class="num-input" :class="{ disabled: calcCEO }" v-model.number="fCEO" :disabled="calcCEO" @focus="$event.target.select()" @input="autoCalc" />
          <select class="unit-select" v-model="fCEOUnit" @change="autoCalc" :disabled="calcCEO">
            <option value="MHz">MHz</option><option value="kHz">kHz</option>
          </select>
        </div>
        <div class="input-row">
          <label class="chk-label"><input type="checkbox" v-model="calcBeat" @change="autoCalc" /></label>
          <label class="input-label"><span class="label-cn">f_beat</span></label>
          <div class="sign-select">
            <button :class="{ active: signBeat === 1 }" @click="signBeat = 1; autoCalc()">+</button>
            <button :class="{ active: signBeat === -1 }" @click="signBeat = -1; autoCalc()">−</button>
          </div>
          <input type="number" class="num-input" :class="{ disabled: calcBeat }" v-model.number="fBeat" :disabled="calcBeat" @focus="$event.target.select()" @input="autoCalc" />
          <select class="unit-select" v-model="fBeatUnit" @change="autoCalc" :disabled="calcBeat">
            <option value="MHz">MHz</option><option value="kHz">kHz</option><option value="GHz">GHz</option>
          </select>
        </div>
      </div>

      <div class="calc-hint">勾选"☐"的项为待计算项，系统将根据其他已知量自动推导</div>

      <div class="io-outputs" v-if="beatResult._key">
        <div class="output-grid">
          <OutputCard v-if="beatResult._key === 'f_CW'" label-cn="f_CW" :value="beatResult.f_CW_THz" unit="THz" :decimals="6" labelAbove
            :alt-text="beatResult.f_CW_nm ? `${beatResult.f_CW_nm.toFixed(4)} nm` : undefined" />
          <OutputCard v-if="beatResult._key === 'n'" label-cn="n" :value="Math.round(beatResult.n)" integer :decimals="0" labelAbove
            :alt-text="beatResult.n?.toExponential(6)" />
          <OutputCard v-if="beatResult._key === 'f_rep'" label-cn="f_rep" :value="beatResult.f_rep_Hz / 1e6" unit="MHz" labelAbove
            :alt-text="`${(beatResult.f_rep_Hz / 1e9).toFixed(6)} GHz`" />
          <OutputCard v-if="beatResult._key === 'f_CEO'" label-cn="f_CEO" labelAbove
            :value="`${beatResult.signCEO > 0 ? '+' : '−'}${(Math.abs(beatResult.f_CEO_Hz) / 1e6).toFixed(4)} MHz`" />
          <OutputCard v-if="beatResult._key === 'f_beat'" label-cn="f_beat" labelAbove
            :value="`${beatResult.signBeat > 0 ? '+' : '−'}${(Math.abs(beatResult.f_beat_Hz) / 1e6).toFixed(4)} MHz`" />
        </div>
      </div>
    </div>

    <!-- ═══════ 模式 B：近似推算 ═══════ -->
    <div v-show="mode === 'approx'" class="io-section">
      <div class="io-inputs">
        <div class="input-row">
          <label class="input-label"><span class="label-cn">光频预估值 f_CW_unsure</span></label>
          <input type="number" class="num-input" v-model.number="fCWunsure" @focus="$event.target.select()" @input="runApprox" />
          <select class="unit-select" v-model="fCWunsureUnit" @change="runApprox">
            <option value="THz">THz</option>
            <option value="GHz">GHz</option>
            <option value="MHz">MHz</option>
          </select>
        </div>
        <div class="input-row">
          <label class="input-label"><span class="label-cn">重复频率 f_rep</span></label>
          <input type="number" class="num-input" v-model.number="approxFrep" @focus="$event.target.select()" />
          <span class="unit-label">MHz</span>
        </div>
        <div class="input-row">
          <label class="input-label"><span class="label-cn">CEO 偏置 f_CEO</span></label>
          <div class="sign-select">
            <button :class="{ active: approxSignCEO === 1 }" @click="approxSignCEO = 1; runApprox()">+</button>
            <button :class="{ active: approxSignCEO === -1 }" @click="approxSignCEO = -1; runApprox()">−</button>
          </div>
          <input type="number" class="num-input" v-model.number="approxFCEO" @focus="$event.target.select()" />
          <span class="unit-label">MHz</span>
        </div>
        <div class="input-row">
          <label class="input-label"><span class="label-cn">拍频 f_beat</span></label>
          <div class="sign-select">
            <button :class="{ active: approxSignBeat === 1 }" @click="approxSignBeat = 1; runApprox()">+</button>
            <button :class="{ active: approxSignBeat === -1 }" @click="approxSignBeat = -1; runApprox()">−</button>
          </div>
          <input type="number" class="num-input" v-model.number="approxFBeat" @focus="$event.target.select()" />
          <span class="unit-label">MHz</span>
        </div>
      </div>

      <div class="io-outputs" v-if="approxResult">
        <div class="output-grid">
          <OutputCard label-cn="n ≈" :value="approxResult.n_approx_2dec" :decimals="2" labelAbove />
          <OutputCard label-cn="取整 n = " :value="approxResult.n_rounded" integer :decimals="0" labelAbove />
          <OutputCard label-cn="精确 f_CW" :value="approxResult.f_CW_precise_THz" unit="THz" :decimals="6" labelAbove
            :alt-text="`${approxResult.f_CW_precise_nm.toFixed(4)} nm`" />
        </div>
      </div>
    </div>
  </ModuleCard>
</template>

<script setup>
import { ref } from 'vue'
import ModuleCard from '../../components/shared/ModuleCard.vue'
import FormulaToggle from '../../components/shared/FormulaToggle.vue'
import OutputCard from '../../components/shared/OutputCard.vue'
import { calcOFCBeat, calcOFCApprox } from '../../utils/formulas.js'

const mode = ref('exact')

// ─── 精确计算参数 ───
const fCW = ref(280.2); const fCWUnit = ref('THz')
const n = ref(1120820)
const fRep = ref(250); const fRepUnit = ref('MHz')
const fCEO = ref(35); const fCEOUnit = ref('MHz'); const signCEO = ref(1)
const fBeat = ref(20); const fBeatUnit = ref('MHz'); const signBeat = ref(1)

const calcCW = ref(false); const calcN = ref(false)
const calcRep = ref(false); const calcCEO = ref(false); const calcBeat = ref(false)

function getHz(val, unit) {
  if (unit === 'THz') return val * 1e12; if (unit === 'GHz') return val * 1e9
  if (unit === 'MHz') return val * 1e6; if (unit === 'kHz') return val * 1e3
  return val
}

const beatResult = ref({ f_CW_Hz: null, n: null })
let calcTimer = null

function autoCalc() {
  clearTimeout(calcTimer)
  calcTimer = setTimeout(() => {
    const selected = [calcCW.value, calcN.value, calcRep.value, calcCEO.value, calcBeat.value].filter(Boolean).length
    if (selected !== 1) {
      beatResult.value = { f_CW_Hz: null, n: null, msg: selected === 0 ? '请勾选一项作为待计算项' : '只能同时勾选一项作为待计算项' }
      return
    }

    const params = {
      f_CW_Hz: calcCW.value ? null : getHz(fCW.value, fCWUnit.value),
      n: calcN.value ? null : n.value,
      f_rep_Hz: calcRep.value ? null : getHz(fRep.value, fRepUnit.value),
      f_CEO_Hz: calcCEO.value ? null : getHz(fCEO.value, fCEOUnit.value),
      f_beat_Hz: calcBeat.value ? null : getHz(fBeat.value, fBeatUnit.value),
      signCEO: signCEO.value,
      signBeat: signBeat.value,
    }
    beatResult.value = calcOFCBeat(params)
  }, 200)
}

// ─── 近似推算参数 ───
const fCWunsure = ref(280.2)
const fCWunsureUnit = ref('THz')
const approxFrep = ref(250)
const approxSignCEO = ref(1)
const approxFCEO = ref(35)
const approxSignBeat = ref(1)
const approxFBeat = ref(20)
const approxResult = ref(null)

function runApprox() {
  const params = {
    f_CW_unsure_Hz: getHz(fCWunsure.value, fCWunsureUnit.value),
    f_rep_Hz: getHz(approxFrep.value, 'MHz'),
    f_CEO_Hz: getHz(approxFCEO.value, 'MHz'),
    f_beat_Hz: getHz(approxFBeat.value, 'MHz'),
    signCEO: approxSignCEO.value,
    signBeat: approxSignBeat.value,
  }
  approxResult.value = calcOFCApprox(params)
}

// 初始触发一次
autoCalc()
runApprox()
</script>

<style scoped>
.func-line { font-size: 12px; margin-bottom: 16px; padding: 8px 12px; background: var(--scenario-bg); border-radius: 6px; color: var(--text-secondary); }
.func-cn { color: var(--accent-text); }
.formula-block { font-size: 14px; line-height: 2; color: var(--text-secondary); }
.formula-block code { color: var(--accent-text); background: var(--accent-bg); padding: 2px 6px; border-radius: 4px; }
.io-section { display: flex; flex-direction: column; gap: 16px; }
.io-inputs { display: flex; flex-direction: column; gap: 2px; }
.output-grid { display: flex; flex-wrap: wrap; gap: 12px; }
.calc-hint { font-size: 11px; color: var(--text-muted); padding: 4px 0; }

.mode-nav { display: flex; gap: 2px; margin-bottom: 16px; border-bottom: 1px solid var(--tab-border); }
.mode-item { padding: 6px 16px; cursor: pointer; font-size: 13px; color: var(--text-muted); border-bottom: 2px solid transparent; transition: all 0.2s; }
.mode-item:hover { color: var(--tab-hover); }
.mode-item.active { color: var(--tab-active); border-bottom-color: var(--tab-active); }
.en-sm { color: var(--text-muted); font-size: 11px; }

.input-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; border-bottom: 1px solid var(--border); }
.input-label { min-width: 70px; font-size: 13px; }
.label-cn { color: var(--text-label); }
.chk-label { min-width: 20px; display: flex; align-items: center; }
.chk-label input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent); }

.num-input { width: 120px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-input); color: var(--text-primary); font-size: 14px; text-align: right; outline: none; transition: border-color 0.2s; }
.num-input:focus { border-color: var(--border-focus); }
.num-input.disabled { opacity: 0.35; cursor: not-allowed; }
.unit-select { padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-input); color: var(--text-secondary); font-size: 12px; cursor: pointer; outline: none; }
.unit-select:disabled { opacity: 0.35; cursor: not-allowed; }
.unit-label { font-size: 12px; color: var(--text-muted); min-width: 40px; }
.sign-select { display: flex; gap: 4px; }
.sign-select button { padding: 4px 12px; border: 1px solid var(--btn-border); border-radius: 6px; background: var(--btn-bg); color: var(--btn-text); cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; min-width: 36px; }
.sign-select button:hover { border-color: var(--btn-hover); }
.sign-select button.active { border-color: var(--accent); color: var(--accent-text); background: var(--accent-bg); }
</style>
