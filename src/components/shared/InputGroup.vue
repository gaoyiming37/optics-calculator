<template>
  <div class="input-row">
    <label class="input-label">
      <span class="label-cn">{{ labelCn }}</span>
    </label>
    <div class="input-controls">
      <input
        type="number"
        class="num-input"
        :value="modelValue"
        @input="onInput"
        @focus="$event.target.select()"
        :min="min"
        :max="max"
        :step="step"
      />
      <select v-if="units" class="unit-select" :value="unit" @change="onUnit">
        <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
      </select>
      <span v-else-if="unit" class="unit-label">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  labelCn: String,
  labelEn: String,
  modelValue: [Number, String],
  units: Array,
  unit: String,
  min: [Number, String],
  max: [Number, String],
  step: [Number, String],
})
const emit = defineEmits(['update:modelValue', 'update:unit'])
function onInput(e) { emit('update:modelValue', parseFloat(e.target.value) || 0) }
function onUnit(e) { emit('update:unit', e.target.value) }
</script>

<style scoped>
.input-row {
  display: flex; align-items: center; gap: 12px;
  padding: 6px 0; border-bottom: 1px solid var(--border);
}
.input-row:last-child { border-bottom: none; }
.input-label { min-width: 180px; font-size: 13px; }
.label-cn { color: var(--text-label); }
.input-controls { display: flex; gap: 6px; align-items: center; }
.num-input {
  width: 120px; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px;
  background: var(--bg-input); color: var(--text-primary); font-size: 14px; text-align: right;
  outline: none; transition: border-color 0.2s;
}
.num-input:focus { border-color: var(--border-focus); }
.unit-select {
  padding: 6px 8px; border: 1px solid var(--border); border-radius: 6px;
  background: var(--bg-input); color: var(--text-secondary); font-size: 12px; cursor: pointer;
  outline: none;
}
.unit-select:focus { border-color: var(--border-focus); }
.unit-label {
  font-size: 12px; color: var(--text-muted); min-width: 50px;
}
</style>
