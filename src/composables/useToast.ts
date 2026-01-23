import { ref, reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: number
  message: string
  type: ToastType
  duration: number
}

// Global state for toast messages
const toasts = reactive<ToastMessage[]>([])
let toastId = 0

// Default durations for each type (ms)
const defaultDurations: Record<ToastType, number> = {
  success: 2500,
  error: 3500,
  warning: 3000,
  info: 2500
}

export function useToast() {
  const show = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = ++toastId
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration: duration ?? defaultDurations[type]
    }

    toasts.push(toast)

    // Auto remove after duration
    setTimeout(() => {
      remove(id)
    }, toast.duration)

    return id
  }

  const remove = (id: number) => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => show(message, 'success', duration)
  const error = (message: string, duration?: number) => show(message, 'error', duration)
  const warning = (message: string, duration?: number) => show(message, 'warning', duration)
  const info = (message: string, duration?: number) => show(message, 'info', duration)

  const clear = () => {
    toasts.splice(0, toasts.length)
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info,
    clear
  }
}
