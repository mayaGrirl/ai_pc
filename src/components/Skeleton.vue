<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  borderRadius?: string
  animated?: boolean
}>()
</script>

<template>
  <div
    class="skeleton"
    :class="{ 'skeleton--animated': animated !== false }"
    :style="{
      width: width || '100%',
      height: height || '16px',
      borderRadius: borderRadius || '4px'
    }"
  />
</template>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
}

.skeleton--animated {
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
