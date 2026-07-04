<template>
  <div class="tab-nav">
    <div
      v-for="tab in tabs"
      :key="tab.key"
      class="tab-item"
      :class="{ active: activeKey === tab.key }"
      @click="$emit('select', tab.key)"
    >
      <span class="tab-label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: Array,
  activeKey: String,
})
defineEmits(['select'])
</script>

<style scoped>
.tab-nav {
  display: flex; gap: 2px; overflow-x: auto; padding: 4px 0; margin-bottom: 24px;
  border-bottom: 1px solid var(--tab-border);
}
.tab-item {
  padding: 10px 20px; cursor: pointer; font-size: 14px; color: var(--text-muted);
  border-bottom: 2px solid transparent; transition: all 0.2s;
  white-space: nowrap;
}
.tab-item:hover { color: var(--tab-hover); }
.tab-item.active { color: var(--tab-active); border-bottom-color: var(--tab-active); }
.tab-label { font-weight: 500; }
</style>
