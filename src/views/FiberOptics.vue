<template>
  <div>
    <FiberDelay />
    <FiberAttenuation />
    <CouplingLoss />
    <FiberDispersion />
  </div>
</template>
<script setup>
import FiberDelay from '../modules/FiberOptics/FiberDelay.vue'
import FiberAttenuation from '../modules/FiberOptics/FiberAttenuation.vue'
import CouplingLoss from '../modules/FiberOptics/CouplingLoss.vue'
import FiberDispersion from '../modules/FiberOptics/FiberDispersion.vue'
</script>
