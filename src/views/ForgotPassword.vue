<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { forgotPasswordSendSms, forgotPasswordVerifyCode, forgetPasswordReset } from '@/api/auth'
import { httpConfigRKey } from '@/api/common'
import SodiumEncryptor from '@/utils/sodium'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useToast } from '@/composables/useToast'
import { Smartphone, ShieldCheck, Lock, CheckCircle2, ArrowLeft, ArrowRight, ChevronRight, MessageSquare } from 'lucide-vue-next'

const router = useRouter()
const toast = useToast()

const currentStep = ref(2) // 1: Verify, 2: Reset, 3: Success
const loading = ref(false)
const countdown = ref(0)
const publicKey = ref('')
let timer: any = null

const form = reactive({
  mobile: '',
  verify_code: '',
  password: '',
  confirm_password: ''
})

// Fetch public key for password encryption
onMounted(async () => {
  try {
    const res = await httpConfigRKey()
    if (res.code === 200 && res.data) {
      publicKey.value = res.data.key
    }
  } catch (error) {
    console.error('Failed to get public key:', error)
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const startCountdown = () => {
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleSendCode = async () => {
  if (!form.mobile || !/^1[3-9]\d{9}$/.test(form.mobile)) {
    toast.error('请输入正确的手机号')
    return
  }

  try {
    const res = await forgotPasswordSendSms(form.mobile)
    if (res.code === 200) {
      toast.success('验证码已发送')
      startCountdown()
    } else {
      toast.error(res.message || '发送验证码失败')
    }
  } catch (error: any) {
    toast.error(error.message || '发送验证码失败')
  }
}

const handleVerify = async () => {
  if (!form.mobile || !form.verify_code) {
    toast.error('请填写手机号和验证码')
    return
  }

  loading.value = true
  try {
    const res = await forgotPasswordVerifyCode({
      mobile: form.mobile,
      verify_code: form.verify_code,
      password: '', // Dummy for DTO
      confirm_password: '' // Dummy for DTO
    })

    if (res.code === 200) {
      currentStep.value = 2
    } else {
      toast.error(res.message || '验证码错误')
    }
  } catch (error: any) {
    toast.error(error.message || '验证失败')
  } finally {
    loading.value = false
  }
}

const handleReset = async () => {
  if (!form.password || form.password.length < 8) {
    toast.error('密码长度至少为6位')
    return
  }
  if (form.password !== form.confirm_password) {
    toast.error('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    let encryptedPassword = form.password
    let encryptedConfirmPassword = form.confirm_password

    if (publicKey.value) {
      encryptedPassword = await SodiumEncryptor.encrypt(form.password, publicKey.value)
      encryptedConfirmPassword = await SodiumEncryptor.encrypt(form.confirm_password, publicKey.value)
    }

    const res = await forgetPasswordReset({
      mobile: form.mobile,
      verify_code: form.verify_code,
      password: encryptedPassword,
      confirm_password: encryptedConfirmPassword
    })

    if (res.code === 200) {
      currentStep.value = 3
    } else {
      toast.error(res.message || '提交失败')
    }
  } catch (error: any) {
    toast.error(error.message || '提交错误')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="min-h-[calc(100vh-160px)] bg-gray-50/50 flex items-center justify-center p-6 relative overflow-hidden">
      <!-- Background Decorations -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-red-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-50/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div class="w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 border border-white p-10 relative z-10 animate-in fade-in zoom-in duration-500">
        <!-- Back Button -->
        <button
          @click="router.push('/login')"
          class="absolute top-8 left-8 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all group"
        >
          <ArrowLeft class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <!-- Centered Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-6">
            <Lock class="w-8 h-8 text-[#ff4757]" />
          </div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2">找回密码</h1>
          <p class="text-gray-500 font-medium">账户安全保护为您提供快速密码重置</p>
        </div>

        <!-- Stepper Indicator -->
        <div class="flex items-center justify-center gap-4 mb-10">
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all"
            :class="currentStep >= 1 ? 'bg-red-50 text-[#ff4757]' : 'text-gray-300'"
          >
            <span>01</span>
            <span class="hidden sm:inline">身份验证</span>
          </div>
          <ChevronRight class="w-4 h-4 text-gray-200" />
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all"
            :class="currentStep >= 2 ? 'bg-red-50 text-[#ff4757]' : 'text-gray-300'"
          >
            <span>02</span>
            <span class="hidden sm:inline">重置密码</span>
          </div>
          <ChevronRight class="w-4 h-4 text-gray-200" />
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all"
            :class="currentStep >= 3 ? 'bg-red-50 text-[#ff4757]' : 'text-gray-300'"
          >
            <span>03</span>
            <span class="hidden sm:inline">完成</span>
          </div>
        </div>

        <!-- Step 1: Verification -->
        <div v-if="currentStep === 1" class="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div class="space-y-2">
            <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">注册手机号</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Smartphone class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
              </div>
              <input
                v-model="form.mobile"
                type="text"
                maxlength="11"
                placeholder="请输入注册时绑定的手机号"
                class="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">短信验证码</label>
            <div class="flex gap-3">
              <div class="relative flex-1 group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheck class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
                </div>
                <input
                  v-model="form.verify_code"
                  type="text"
                  maxlength="6"
                  placeholder="6位验证码"
                  class="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
                />
              </div>
              <button
                @click="handleSendCode"
                :disabled="countdown > 0"
                class="px-6 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap min-w-[120px]"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>

          <button
            @click="handleVerify"
            :disabled="loading"
            class="w-full py-4 mt-4 bg-gradient-to-r from-[#ff4757] to-[#ee5a6f] text-white font-black rounded-2xl shadow-lg shadow-red-100 hover:shadow-red-200 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <span v-if="loading" class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else class="flex items-center gap-2">下一步 <ArrowRight class="w-4 h-4" /></span>
          </button>
        </div>

        <!-- Step 2: Reset Password -->
        <div v-if="currentStep === 2" class="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div class="space-y-2">
            <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">新登录密码</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
              </div>
              <input
                v-model="form.password"
                type="password"
                placeholder="建议包含字母和数字"
                class="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">确认新密码</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
              </div>
              <input
                v-model="form.confirm_password"
                type="password"
                placeholder="请再次确认您的新密码"
                class="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
              />
            </div>
          </div>

          <button
            @click="handleReset"
            :disabled="loading"
            class="w-full py-4 mt-4 bg-gradient-to-r from-[#ff4757] to-[#ee5a6f] text-white font-black rounded-2xl shadow-lg shadow-red-100 hover:shadow-red-200 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            <span v-if="loading" class="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else>重置并登录</span>
          </button>
        </div>

        <!-- Step 3: Success -->
        <div v-if="currentStep === 3" class="text-center py-6 animate-in zoom-in duration-500">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-green-50 rounded-full mb-8">
            <CheckCircle2 class="w-12 h-12 text-green-500" />
          </div>
          <h2 class="text-3xl font-black text-gray-900 mb-2">重置成功</h2>
          <p class="text-gray-500 font-medium mb-10">您的登录密码已更新，请重新登录账号。</p>
          <button
            @click="router.push('/login')"
            class="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-gray-800 transition-all"
          >
            去登录
          </button>
        </div>

        <!-- Need Help -->
        <div class="mt-12 pt-8 border-t border-gray-50 flex items-center justify-center gap-2 text-sm text-gray-400">
          <MessageSquare class="w-4 h-4" />
          <span>无法获取验证码? </span>
          <a href="#" class="text-[#ff4757] font-bold hover:underline">请联系您的代理</a>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
