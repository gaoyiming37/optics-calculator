<template>
  <div>
    <GaussianBeam />
    <LensFocus />
    <BeamQuality />
    <PowerDensity />
  </div>
</template>

<script setup>
import GaussianBeam from '../modules/LaserBeam/GaussianBeam.vue'
import LensFocus from '../modules/LaserBeam/LensFocus.vue'
import BeamQuality from '../modules/LaserBeam/BeamQuality.vue'
import PowerDensity from '../modules/LaserBeam/PowerDensity.vue'
</script>
