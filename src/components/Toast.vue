<script setup lang="ts">
import { useToast, type ToastType } from '@/composables/useToast'

const { toasts, remove } = useToast()

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return '&#10003;' // checkmark
    case 'error':
      return '&#10007;' // x mark
    case 'warning':
      return '&#9888;' // warning triangle
    case 'info':
    default:
      return '&#8505;' // info
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.type}`]"
          @click="remove(toast.id)"
        >
          <span class="toast__icon" v-html="getIcon(toast.type)"></span>
          <span class="toast__message">{{ toast.message }}</span>
          <span class="toast__close">&times;</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 280px;
}

.toast:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.toast__icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  flex-shrink: 0;
}

.toast__message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  word-break: break-word;
}

.toast__close {
  font-size: 18px;
  color: #999;
  opacity: 0.6;
  transition: opacity 0.2s;
  flex-shrink: 0;
  margin-left: 4px;
}

.toast:hover .toast__close {
  opacity: 1;
}

/* Success */
.toast--success {
  border-left: 4px solid #52c41a;
}

.toast--success .toast__icon {
  background: #52c41a;
}

/* Error */
.toast--error {
  border-left: 4px solid #ff4d4f;
}

.toast--error .toast__icon {
  background: #ff4d4f;
}

/* Warning */
.toast--warning {
  border-left: 4px solid #faad14;
}

.toast--warning .toast__icon {
  background: #faad14;
}

/* Info */
.toast--info {
  border-left: 4px solid #1890ff;
}

.toast--info .toast__icon {
  background: #1890ff;
}

/* Transition animations */
.toast-enter-active {
  animation: toast-in 0.3s ease;
}

.toast-leave-active {
  animation: toast-out 0.3s ease;
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>
