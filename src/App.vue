<template>
  <div class="app-container" :data-theme="theme">
    <header class="app-header">
      <div class="app-title-group">
        <div class="app-title">
          <span class="title-cn">光学计算器</span>
          <span class="title-en"> Optics Calculator</span>
        </div>
        <div class="app-subtitle">面向光学/光子学工程师的在线计算工具集</div>
      </div>
      <button class="theme-toggle" @click="toggleTheme">
        {{ theme === 'light' ? '🌙 暗色 Dark' : '☀️ 亮色 Light' }}
      </button>
    </header>

    <TabNav :tabs="tabs" :activeKey="activeTab" @select="activeTab = $event" />

    <div class="content">
      <KeepAlive>
        <BasicConversion v-if="activeTab === 'conversion'" />
        <LaserBeam v-else-if="activeTab === 'laser'" />
        <GratingDiffraction v-else-if="activeTab === 'grating'" />
        <Detectors v-else-if="activeTab === 'detector'" />
        <FiberOptics v-else-if="activeTab === 'fiber'" />
        <OFCComb v-else-if="activeTab === 'ofc'" />
      </KeepAlive>
    </div>

    <footer class="app-footer">
      Optics Calculator &copy; 2026 &middot; Built with Vue 3 + ECharts
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TabNav from './components/shared/TabNav.vue'
import BasicConversion from './views/BasicConversion.vue'
import LaserBeam from './views/LaserBeam.vue'
import GratingDiffraction from './views/GratingDiffraction.vue'
import Detectors from './views/Detectors.vue'
import FiberOptics from './views/FiberOptics.vue'
import OFCComb from './views/OFCComb.vue'

const activeTab = ref('conversion')
const theme = ref('light')

onMounted(() => {
  const saved = localStorage.getItem('optics-calc-theme')
  if (saved) theme.value = saved
})

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  localStorage.setItem('optics-calc-theme', theme.value)
}

const tabs = [
  { key: 'conversion', label: '基础换算 Basic' },
  { key: 'laser', label: '激光与光束 Laser' },
  { key: 'grating', label: '光栅与衍射 Grating' },
  { key: 'detector', label: '探测器 Detector' },
  { key: 'fiber', label: '光纤光学 Fiber' },
  { key: 'ofc', label: '光频梳 OFC' },
]
</script>
