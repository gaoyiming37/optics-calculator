<template>
  <div class="module-card">
    <div class="module-header">
      <span class="module-title">{{ title }}</span>
      <span class="module-desc">{{ description }}</span>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title: String,
  description: String,
})
</script>

<style scoped>
.module-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px;
  padding: 24px; margin-bottom: 24px;
}
.module-header { margin-bottom: 20px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
.module-title { font-size: 20px; font-weight: 600; color: var(--text-primary); display: block; }
.module-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: block; }
</style>
