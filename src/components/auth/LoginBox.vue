<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login, loginSendSmsToMobile } from '@/api/auth'
import { httpConfigRKey } from '@/api/common'
import SodiumEncryptor from '@/utils/sodium'
import { useToast } from '@/composables/useToast'
import { Smartphone, Lock, ShieldCheck, User, MessageSquare, Eye, EyeOff } from 'lucide-vue-next'

const props = defineProps({
  redirect: {
    type: String,
    default: '/'
  },
  compact: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['success'])

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const loginType = ref<'password' | 'sms'>('password')
const showPassword = ref(false)
const loading = ref(false)
const publicKey = ref('')
const countdown = ref(0)
let timer: any = null

const form = reactive({
  mobile: '',
  password: '',
  code: '',
  rememberMe: true
})

// Fetch public key for password encryption
const fetchPublicKey = async () => {
  try {
    const { data, code } = await httpConfigRKey()
    if (code === 200 && data) {
      publicKey.value = data.key
    }
  } catch (error) {
    console.error('Failed to get public key:', error)
  }
}

onMounted(() => {
  fetchPublicKey()
})
// 关闭定时任务
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
// 倒计时
const startCountdown = () => {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 发送短信验证码
const handleSendSms = async () => {
  if (!form.mobile) {
    toast.error('请输入手机号')
    return
  }
  if (!/^1[3-9]\d{9}$/.test(form.mobile)) {
    toast.error('请输入正确的手机号')
    return
  }

  try {
    const { code, message } = await loginSendSmsToMobile(form.mobile)
    if (code === 200) {
      toast.success('验证码已发送')
      startCountdown()
    } else {
      toast.error(message || '发送失败')
    }
  } catch (error: any) {
    toast.error(error.message || '发送失败')
  }
}

// 登录
const handleLogin = async () => {
  if (!form.mobile) {
    toast.error('请输入手机号')
    return
  }
  if (loginType.value === 'password') {
    if (!form.password) {
      toast.error('请输入密码')
      return
    }
    if (!publicKey.value) {
      toast.error('系统初始化中，请稍后')
      await fetchPublicKey()
      return
    }
  } else {
    if (!form.code) {
      toast.error('请输入验证码')
      return
    }
  }

  loading.value = true
  try {
    let loginData: any = {
      mobile: form.mobile,
      type: loginType.value === 'password' ? 1 : 2 // 1: password, 2: sms
    }

    if (loginType.value === 'password') {
      loginData.password = await SodiumEncryptor.encrypt(form.password, publicKey.value)
    } else {
      loginData.code = form.code
    }

    const res = await login(loginData)

    if (res.code === 200 && res.data) {
      authStore.setToken(
        res.data.access_token!,
        res.data.token_type!,
        res.data.expires_at!
      )
      await authStore.fetchCurrentCustomer()
      toast.success('登录成功')
      emit('success')

      const targetPath = (route.query.redirect as string) || props.redirect
      router.push(targetPath)
    } else {
      toast.error(res.message || '登录失败')
    }
  } catch (error: any) {
    toast.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="w-full bg-white rounded-3xl animate-in fade-in zoom-in duration-500"
    :class="[
      compact ? 'max-w-[340px]' : 'p-8 max-w-[420px] shadow-xl shadow-gray-200/50 border border-gray-100'
    ]"
  >
    <!-- Header/Tabs -->
    <div
      class="flex items-center justify-center p-1 bg-gray-50 rounded-2xl"
      :class="compact ? 'mb-1' : 'mb-8'"
    >
      <button
        @click="loginType = 'password'"
        class="flex-1 text-sm font-bold rounded-xl transition-all"
        :class="[
          loginType === 'password' ? 'bg-white text-[#ff4757] shadow-sm' : 'text-gray-400 hover:text-gray-600',
          compact ? 'py-1.5' : 'py-3'
        ]"
      >
        账号密码登录
      </button>
      <button
        @click="loginType = 'sms'"
        class="flex-1 text-sm font-bold rounded-xl transition-all"
        :class="[
          loginType === 'sms' ? 'bg-white text-[#ff4757] shadow-sm' : 'text-gray-400 hover:text-gray-600',
          compact ? 'py-1.5' : 'py-3'
        ]"
      >
        短信动态登录
      </button>
    </div>

    <div :class="compact ? 'space-y-2' : 'space-y-5'">
      <!-- Mobile Input -->
      <div class="space-y-2">
        <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">手机号码</label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Smartphone class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
          </div>
          <input
            v-model="form.mobile"
            type="text"
            maxlength="11"
            placeholder="请输入11位手机号"
            :class="compact ? 'py-1' : 'py-4'"
            class="w-full pl-12 pr-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
          />
        </div>
      </div>

      <!-- Password Input (Conditional) -->
      <div v-if="loginType === 'password'" class="space-y-2 animate-in slide-in-from-top-2 duration-300">
        <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">登录密码</label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
          </div>
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="请输入您的登录密码"
            :class="compact ? 'py-1' : 'py-4'"
            class="w-full pl-12 pr-12 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- SMS Code Input (Conditional) -->
      <div v-if="loginType === 'sms'" class="space-y-2 animate-in slide-in-from-top-2 duration-300">
        <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">动态验证码</label>
        <div class="relative group flex gap-3">
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <ShieldCheck class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
            </div>
            <input
              v-model="form.code"
              type="text"
              maxlength="6"
              placeholder="6位验证码"
              :class="compact ? 'py-1' : 'py-4'"
              class="w-full pl-12 pr-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
            />
          </div>
          <button
            @click="handleSendSms"
            :disabled="countdown > 0"
            :class="compact ? 'px-4 py-1' : 'px-6 py-4'"
            class="bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[100px]"
          >
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </div>
      </div>

      <!-- Options -->
      <div class="flex items-center justify-between px-1" :class="compact ? '' : 'pt-2'">
        <label class="flex items-center gap-2 cursor-pointer group">
          <input type="checkbox" v-model="form.rememberMe" class="hidden" />
          <div
            class="rounded-md border-2 flex items-center justify-center transition-all"
            :class="[
              form.rememberMe ? 'bg-[#ff4757] border-[#ff4757]' : 'border-gray-200 group-hover:border-gray-300',
              compact ? 'w-4 h-4' : 'w-5 h-5'
            ]"
          >
            <div v-show="form.rememberMe" class="bg-white rounded-[1px]" :class="compact ? 'w-2 h-2' : 'w-2.5 h-2.5'"></div>
          </div>
          <span class="text-sm text-gray-500 font-medium">记住登录状态</span>
        </label>
        <router-link to="/forgot-password" v-if="loginType === 'password'" class="text-sm text-gray-400 hover:text-[#ff4757] transition-colors font-medium">
          忘记密码?
        </router-link>
      </div>

      <button
        @click="handleLogin"
        :disabled="loading"
        :class="compact ? 'py-1 mt-2' : 'py-4 mt-4'"
        class="w-full bg-gradient-to-r from-[#ff4757] to-[#ee5a6f] text-white font-black rounded-2xl shadow-lg shadow-red-100 hover:shadow-red-200 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0"
      >
        <span v-if="loading" class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
        <span v-else>立即登录</span>
      </button>

      <!-- Register Link -->
      <div
        class="text-center z-[101]"
        :class="compact ? 'pt-1' : 'pt-6 pb-2'"
      >
        <span class="text-gray-400 text-sm font-medium">还没有账号?</span>
        <router-link to="/register" class="ml-2 text-[#ff4757] text-sm font-black hover:underline underline-offset-4">
          免费注册
        </router-link>
      </div>
    </div>
  </div>
</template>
