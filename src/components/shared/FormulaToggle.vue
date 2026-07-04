<template>
  <div class="formula-toggle">
    <button class="formula-btn" @click="toggle" :class="{ active: visible }">
      <span class="formula-icon">{{ visible ? '⊟' : '⊞' }}</span>
      <span>{{ visible ? '隐藏公式' : '显示公式' }}</span>
    </button>
    <Transition name="fade">
      <div v-if="visible" class="formula-content">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const visible = ref(false)
function toggle() { visible.value = !visible.value }
</script>

<style scoped>
.formula-toggle { margin-bottom: 12px; }
.formula-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 16px; border: 1px solid var(--btn-border); border-radius: 6px;
  background: var(--btn-bg); color: var(--btn-text); cursor: pointer;
  font-size: 13px; transition: all 0.2s;
}
.formula-btn:hover { border-color: var(--btn-hover); color: var(--accent-text); }
.formula-btn.active { border-color: var(--accent); color: var(--accent-text); }
.formula-icon { font-size: 16px; }
.formula-content {
  margin-top: 12px; padding: 16px; background: var(--formula-bg);
  border: 1px solid var(--formula-border);
  border-radius: 8px; font-size: 14px; line-height: 2;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
