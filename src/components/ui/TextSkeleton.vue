<template>
  <div class="skeleton" :class="skeletonClass">
    <div class="skeleton-line" v-for="line in lines" :key="line" :style="getLineStyle(line)"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  lines?: number
  height?: string
  variant?: 'text' | 'rectangle' | 'circle'
  animation?: 'pulse' | 'wave' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  lines: 3,
  height: '16px',
  variant: 'text',
  animation: 'pulse'
})

const skeletonClass = computed(() => {
  return {
    [`skeleton-${props.variant}`]: true,
    [`skeleton-${props.animation}`]: true
  }
})

const getLineStyle = (lineNumber: number) => {
  const isLastLine = lineNumber === props.lines
  const width = isLastLine ? '70%' : '100%'
  
  return {
    height: props.height,
    width: width,
    marginBottom: lineNumber < props.lines ? '12px' : '0'
  }
}
</script>

<style scoped>
.skeleton {
  display: flex;
  flex-direction: column;
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
}

/* 动画效果 */
.skeleton-pulse .skeleton-line {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-wave .skeleton-line {
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 变体样式 */
.skeleton-circle .skeleton-line {
  border-radius: 50%;
  width: var(--skeleton-size, 40px) !important;
  height: var(--skeleton-size, 40px) !important;
}

.skeleton-rectangle .skeleton-line {
  border-radius: 8px;
}

.skeleton-text .skeleton-line {
  border-radius: 4px;
}
</style>
