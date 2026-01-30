<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { registration, sendSmsToMobile } from '@/api/auth'
import { httpConfigRKey } from '@/api/common'
import SodiumEncryptor from '@/utils/sodium'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { Smartphone, ShieldCheck, Lock, UserPlus, ArrowLeft, ArrowRight, MessageSquare, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const loading = ref<boolean>(false)
const showPassword = ref<boolean>(false)
const showConfirmPassword = ref<boolean>(false)
const countdown = ref<number>(0)
const publicKey = ref<string>('')
let timer: any = null

// 推荐人key (从URL读取)
const recommend = computed(() => (route.query.t as string) || '')

const form = reactive({
  mobile: '',
  verify_code: '',
  password: '',
  confirm_password: ''
})

// 获取公钥
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

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 6) strength++
  if (pwd.length >= 8) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  return Math.min(strength, 4)
})

const strengthText = computed(() => {
  const texts = ['太简单', '弱', '中', '强', '极强']
  return texts[passwordStrength.value]
})

const strengthColor = computed(() => {
  const colors = ['bg-gray-100', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  return colors[passwordStrength.value]
})

// 发送验证码
const handleSendCode = async () => {
  if (!form.mobile || !/^1[3-9]\d{9}$/.test(form.mobile)) {
    toast.error('请输入正确的11位手机号')
    return
  }

  try {
    const res = await sendSmsToMobile(form.mobile)
    if (res.code === 200) {
      toast.success('验证码已发送')
      startCountdown()
    } else {
      toast.error(res.message || '获取验证码失败')
    }
  } catch (error: any) {
    toast.error(error.message || '获取验证码失败')
  }
}

const handleRegister = async () => {
  if (!form.mobile || form.mobile.length !== 11) {
    toast.error('请输入正确的手机号')
    return
  }
  if (!form.verify_code) {
    toast.error('请输入短信验证码')
    return
  }
  if (!form.password || form.password.length < 8) {
    toast.error('密码长度至少为8位')
    return
  }
  if (form.password !== form.confirm_password) {
    toast.error('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    // 加密密码
    let encryptedPassword = form.password
    let encryptedConfirmPassword = form.confirm_password
    if (publicKey.value) {
      encryptedPassword = await SodiumEncryptor.encrypt(form.password, publicKey.value)
      encryptedConfirmPassword = await SodiumEncryptor.encrypt(form.confirm_password, publicKey.value)
    }

    const res = await registration({
      mobile: form.mobile,
      verify_code: form.verify_code,
      password: encryptedPassword,
      confirm_password: encryptedConfirmPassword,
      recommend: recommend.value || undefined
    })

    if (res.code === 200 && res.data) {
      authStore.setToken(
        res.data.access_token!,
        res.data.token_type!,
        res.data.expires_at!
      )
      await authStore.fetchCurrentCustomer()
      toast.success('注册成功')
      await router.push('/')
    } else {
      toast.error(res.message || '注册失败')
    }
  } catch (error: any) {
    toast.error(error.message || '注册过程中发生错误')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="min-h-[calc(100vh-160px)] bg-gray-50/50 flex items-center justify-center p-6 relative overflow-hidden">
      <div class="w-full max-w-[520px] bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-white/50 p-5 relative z-10 animate-in fade-in zoom-in duration-500">
        <!-- Back Button -->
        <button
          @click="router.push('/login')"
          class="absolute top-8 left-8 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all group"
        >
          <ArrowLeft class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <!-- Header -->
        <div class="text-center mb-4">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-50 to-orange-50 rounded-[32px] mb-3 shadow-sm">
            <UserPlus class="w-10 h-10 text-[#ff4757]" />
          </div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-3">创建新账号</h1>
          <p class="text-gray-500 font-medium">加入 鼎丰28，享受安全可信赖的游戏体验</p>
        </div>

        <div class="space-y-5">
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
                placeholder="请输入您的11位手机号"
                class="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
              />
            </div>
          </div>

          <!-- Code Input -->
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

          <!-- Password Input -->
          <div class="space-y-2">
            <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">设置登录密码</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
              </div>
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="密码不少于6位"
                class="w-full pl-12 pr-12 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <component :is="showPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </div>

            <!-- Password Strength -->
            <div v-if="form.password" class="px-1 pt-1 flex items-center justify-between">
              <div class="flex gap-1 flex-1 max-w-[160px]">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-1.5 flex-1 rounded-full transition-all duration-500"
                  :class="i <= passwordStrength ? strengthColor : 'bg-gray-100'"
                ></div>
              </div>
              <span class="text-[11px] font-bold" :class="passwordStrength > 0 ? 'text-gray-500' : 'text-gray-300'">
                强度: {{ strengthText }}
              </span>
            </div>
          </div>

          <!-- Confirm Password -->
          <div class="space-y-2">
            <label class="text-[12px] font-bold text-gray-400 uppercase tracking-wider ml-1">确认新密码</label>
            <div class="relative group">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock class="w-5 h-5 text-gray-300 group-focus-within:text-[#ff4757] transition-colors" />
              </div>
              <input
                v-model="form.confirm_password"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="请再次填写您的密码"
                class="w-full pl-12 pr-12 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-[#ff4757] focus:ring-4 focus:ring-red-50 rounded-2xl text-gray-700 font-medium transition-all outline-none border-2"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <component :is="showConfirmPassword ? EyeOff : Eye" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            @click="handleRegister"
            :disabled="loading"
            class="w-full py-3 mt-4 bg-gradient-to-r from-[#ff4757] to-[#ee5a6f] text-white font-black rounded-3xl shadow-xl shadow-red-100 hover:shadow-red-200 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <span v-if="loading" class="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
            <span v-else class="flex items-center gap-2 text-lg">立即创建账户 <ArrowRight class="w-5 h-5" /></span>
          </button>

          <!-- Login Link -->
          <div class="text-center">
            <span class="text-gray-400 font-medium">已有账户?</span>
            <router-link to="/login" class="ml-2 text-[#ff4757] font-black hover:underline underline-offset-4">
              直接登录
            </router-link>
          </div>
        </div>

        <!-- Footer Help -->
        <div class="mt-5 border-t border-gray-50 flex items-center justify-center gap-2 text-sm text-gray-400 italic">
          <MessageSquare class="w-4 h-4" />
          <span>遇到问题? 请联系您的代理提供支持</span>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
