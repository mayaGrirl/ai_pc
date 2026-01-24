<script setup lang="ts">
import {ref, watch, onUnmounted} from 'vue'
import {useI18n} from 'vue-i18n'
import {customerReceiveSms} from '@/api/customer'
import {useToast} from "@/composables/useToast.ts";

const DURATION = 60

// Props
interface Props {
  scene: string
  modelValue?: string
  disabled?: boolean
}

const toast = useToast()
const props = defineProps<Props>()

// Emits (v-model)
const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const {t} = useI18n()

// 状态
const countdown = ref(0)
const isSending = ref(false)

let timer: number | null = null

// 倒计时逻辑
watch(countdown, (val) => {
  if (val <= 0) return

  timer = window.setTimeout(() => {
    countdown.value--
  }, 1000)
})

// 组件卸载清理
onUnmounted(() => {
  if (timer) clearTimeout(timer)
})

// 发送短信
const sendSms = async () => {
  if (isSending.value || countdown.value > 0) return

  isSending.value = true
  try {
    const {code, message} = await customerReceiveSms(props.scene)

    if (code !== 200) {
      toast.error(message)
    } else {
      toast.success('发送成功')
      countdown.value = DURATION
    }
  } catch (error: any) {
    const msg = error?.message || '发送失败，请稍后再试';
    toast.error(msg)
  } finally {
    isSending.value = false
  }
}

// input change
const onInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)
}
</script>

<template>
  <!-- 输入框 -->
  <input
    id="verify_code"
    :value="modelValue"
    @input="onInput"
    type="text"
    inputmode="numeric"
    pattern="[0-9]*"
    autocomplete="one-time-code"
    placeholder="请输入验证码"
    class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none"
  />

  <!-- 按钮 -->
  <button
    type="button"
    :disabled="disabled || isSending || countdown > 0"
    @click="sendSms"
    :class="[
      'shrink-0 h-8 px-3 rounded text-xs whitespace-nowrap transition',
      disabled || isSending || countdown > 0
        ? 'bg-gray-600 text-white cursor-not-allowed'
        : 'bg-blue-600 text-white active:scale-95 cursor-pointer'
    ]"
  >
    <span v-if="isSending">发送中...</span>
    <span v-else-if="countdown > 0">
      {{ countdown }}s
    </span>
    <span v-else>发送验证码</span>
  </button>
</template>
