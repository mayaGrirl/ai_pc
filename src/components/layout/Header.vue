<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import { LogOut, RefreshCw, Smartphone, HeartPulse} from 'lucide-vue-next'
import Relief from '@/components/relief.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const configStore = useConfigStore()

const isLogin = computed(() => authStore.isLogin)
const customer = computed(() => authStore.currentCustomer)

// System config from store
const sysConfig = computed(() => configStore.sysConfig)

// Game count digits - start from 0, animate to target
const gameCountDigits = ref(['0', '0', '0', '0', '0', '0'])

// Calculate target number based on date (increases daily, never decreases)
const calculateDailyGameCount = (): number => {
  const baseNumber = 300000 // Starting base
  const referenceDate = new Date('2024-01-01')
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset to start of day

  // Calculate days since reference date
  const daysSinceStart = Math.floor((today.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24))

  // Seeded random function based on date string for consistent daily variation
  const dateStr = today.toISOString().split('T')[0]
  let seed = 0
  for (let i = 0; i < dateStr.length; i++) {
    seed = ((seed << 5) - seed) + dateStr.charCodeAt(i)
    seed = seed & seed
  }
  const seededRandom = Math.abs(seed % 1000) // 0-999 variation

  // Daily increment: base growth + seeded random variation
  const dailyBaseGrowth = 500 // Average daily growth
  const totalGrowth = (daysSinceStart * dailyBaseGrowth) + seededRandom

  return baseNumber + totalGrowth
}

const targetNumber = calculateDailyGameCount()

// 领救济弹窗
const showWelfareModal = ref<boolean>(false)

const navItems = [
  { name: '首页', path: '/', key: 'index' },
  { name: '活动中心', path: '/activity', key: 'activ', badge: 'new' },
  { name: '玩游戏', path: '/games', key: 'game' },
  { name: '兑换奖品', path: '/shop', key: 'store', badge: 'hot' },
  { name: '兼职推广', path: '/promotion', key: 'ad' },
  { name: '合作商', path: '/partners', key: 'dl' },
  { name: '用户中心', path: '/user', key: 'member' },
  { name: 'USTD备用金', path: '/usdt', key: 'usdt', external: true }
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// Update digits display from a number
const updateDigits = (num: number) => {
  const padded = num.toString().padStart(6, '0')
  for (let i = 0; i < 6; i++) {
    gameCountDigits.value[i] = padded[i]
  }
}

onMounted(() => {
  // 如果用户已登录，自动获取用户信息（包括余额）
  if (authStore.isLogin && !authStore.currentCustomer) {
    authStore.fetchCurrentCustomer()
  }

  // 获取系统配置（通过store统一管理，避免重复请求）
  configStore.fetchConfig()

  // Animate from 0 to target number on page load
  let currentValue = 0
  const duration = 2000 // 2 seconds animation
  const steps = 60 // 60 steps for smooth animation
  const increment = Math.ceil(targetNumber / steps)
  const intervalTime = duration / steps

  const animateCounter = setInterval(() => {
    currentValue += increment
    if (currentValue >= targetNumber) {
      currentValue = targetNumber
      updateDigits(currentValue)
      clearInterval(animateCounter)

      // After animation completes, continue slow increment
      setInterval(() => {
        currentValue += 1
        updateDigits(currentValue)
      }, 3000)
    } else {
      updateDigits(currentValue)
    }
  }, intervalTime)
})
</script>

<template>
  <header class="w-full bg-white border-b-[3px] border-gray-100 sticky top-0 z-[1000]">
    <!-- Top Bar -->
    <div class="w-full h-9 bg-gray-50 border-b border-gray-200/50">
      <div class="max-w-[1200px] h-full mx-auto px-4 flex justify-between items-center text-[12px]">
        <!-- Top Left: Mobile & Welfare -->
        <div class="flex items-center gap-4 h-full">
          <a :href="sysConfig?.h5_url || '#'" target="_blank" class="flex items-center gap-1.5 text-gray-600 hover:text-[#ff4757] transition-colors h-full group">
            <Smartphone class="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            <span>手机版</span>
          </a>
          <span class="text-gray-300">|</span>
          <button @click="showWelfareModal = true" class="flex items-center gap-1.5 text-gray-600 hover:text-[#ff4757] transition-colors h-full group">
            <HeartPulse class="w-4 h-4 text-[#ff4757] animate-pulse" />
            <span>领救济</span>
          </button>
        </div>

        <!-- Top Right: Welcome & Login Status -->
        <div class="flex items-center gap-4">
          <template v-if="isLogin">
            <div class="flex items-center gap-2 group">
              <span class="text-gray-500">{{ customer?.nickname || '_sg' + customer?.id }}</span>
              <span class="text-gray-400">ID:</span>
              <router-link to="/user" class="text-[#ff4757] font-bold hover:underline">
                {{ customer?.id }}
              </router-link>
            </div>
            <div class="h-3 w-px bg-gray-300"></div>
            <router-link to="/user/detail" class="flex items-center gap-1 text-gray-700 hover:text-[#ff4757] transition-colors">
              <span>余额:</span>
              <b class="text-[#ff4757]">{{ formatNumber(customer?.points || 0) }}</b>
            </router-link>
            <button @click="authStore.fetchCurrentCustomer()" class="text-gray-400 hover:text-gray-600 transition-colors p-1 group">
              <RefreshCw class="w-3.5 h-3.5 group-active:rotate-180 transition-transform duration-500" />
            </button>
            <div class="h-3 w-px bg-gray-300"></div>
            <button @click="handleLogout" class="text-gray-400 hover:text-gray-600 flex items-center gap-1 group">
              <LogOut class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              <span>[退出]</span>
            </button>
          </template>
          <template v-else>
            <span class="text-gray-500">您好，欢迎来鼎丰!</span>
            <div class="flex items-center gap-3">
              <router-link to="/login" class="text-gray-600 hover:text-[#ff4757] transition-colors">登录</router-link>
              <span class="text-gray-300">|</span>
              <router-link to="/register" class="text-gray-600 hover:text-[#ff4757] transition-colors font-medium">注册</router-link>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 菜单 -->
    <div class="max-w-[1200px] h-20 mx-auto px-4 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="shrink-0 hover:opacity-90 transition-opacity">
        <img src="/n_logo.png" class="h-[52px] w-auto" alt="Logo">
      </router-link>

      <!-- Game Counter -->
      <div class="hidden lg:flex flex-col items-center gap-1 px-8">
        <span class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">累计游戏人次</span>
        <div class="flex items-end gap-1">
          <template v-for="(digit, index) in gameCountDigits" :key="index">
            <div v-if="index === 1 || index === 4" class="text-[#ff4757] font-bold text-lg leading-6 mx-0.5 mb-1 animate-pulse">,</div>
            <div class="w-6 h-9 bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-md shadow-sm flex items-center justify-center text-xl font-black text-[#ff4757] relative overflow-hidden">
              <div class="absolute inset-x-0 top-0 h-px bg-white/80"></div>
              <span>{{ digit }}</span>
              <div class="absolute inset-x-0 bottom-0 h-[2px] bg-[#ff4757]/20"></div>
            </div>
          </template>
          <div class="w-6 h-9 bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-md shadow-sm flex items-center justify-center text-xl font-black text-[#ff4757] relative overflow-hidden">
            <div class="absolute inset-x-0 top-0 h-px bg-white/80"></div>
            <span>0</span>
            <div class="absolute inset-x-0 bottom-0 h-[2px] bg-[#ff4757]/20"></div>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="h-full">
        <ul class="flex items-center h-full gap-1">
          <li v-for="item in navItems" :key="item.path" class="relative group h-full">
            <template v-if="item.external">
              <a :href="item.path" target="_blank" class="h-full flex items-center px-4 text-[15px] font-bold text-gray-600 hover:text-[#ff4757] transition-all relative">
                {{ item.name }}
              </a>
            </template>
            <template v-else>
              <router-link :to="item.path"
                class="h-full flex items-center px-4 text-[15px] font-bold transition-all relative z-10"
                :class="isActive(item.path) ? 'text-[#ff4757]' : 'text-gray-600 hover:text-[#ff4757]'"
              >
                {{ item.name }}
                <!-- Active Indicator -->
                <div v-if="isActive(item.path)" class="absolute bottom-0 left-4 right-4 h-0.5 bg-[#ff4757] rounded-t-full shadow-[0_-2px_6px_rgba(255,71,87,0.3)]"></div>
                <div v-else class="absolute bottom-0 left-4 right-4 h-0.5 bg-[#ff4757] rounded-t-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center opacity-40"></div>
              </router-link>
            </template>

            <!-- Badge -->
            <div v-if="item.badge" class="absolute top-[18px] right-1 z-20 pointer-events-none">
              <div class="bg-[#ff413d] text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg animate-bounce flex items-center gap-0.5 whitespace-nowrap font-bold uppercase tracking-tighter">
                {{ item.badge }}
                <div class="absolute -bottom-1 left-1.5 w-1.5 h-1.5 bg-[#ff413d] rotate-45"></div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>

    <!-- 领取救济 -->
    <Teleport to="body" v-if="showWelfareModal">
      <Relief @close="showWelfareModal = false" />
    </Teleport>
  </header>
</template>

<style scoped>
/* No more legacy styles needed, use Tailwind! */
/* Logic for special navigation indicators left here if Tailwind isn't enough */
@keyframes pulse-soft {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(0.98); }
}
</style>

