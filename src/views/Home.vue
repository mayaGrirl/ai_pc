<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import MainLayout from '@/components/layout/MainLayout.vue'
import Skeleton from '@/components/Skeleton.vue'
import { getBanners, getAnnouncements, indexGameHotNew, getHomePopup } from '@/api/home'
import { withdrawalDynamics } from '@/api/customer'
import type { IndexDataItem, gameItem } from '@/types/index.type'
import LoginBox from "@/components/auth/LoginBox.vue";
import { LogOut, Wallet, ShoppingBag, CircleDollarSign, CalendarCheck, MessageSquare, ArrowRight } from 'lucide-vue-next'
import HomeRank from "./components/homeRank.vue";

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const configStore = useConfigStore()

const isLogin = computed(() => authStore.isLogin)
const sysConfig = computed(() => configStore.sysConfig)
const customer = computed(() => authStore.currentCustomer)

// Data
const banners = ref<IndexDataItem[]>([])
const announcements = ref<IndexDataItem[]>([])
const hotGames = ref<gameItem[]>([])
const newGames = ref<gameItem[]>([])
const currentBanner = ref(0)
const loading = ref(true)
const gameCount = ref(611561927)

// Popup announcement
const showPopup = ref(false)
const popupAnnouncement = ref<IndexDataItem | null>(null)

// Withdrawal dynamics
interface WithdrawRecord {
  user: string
  amount: number
}
const withdrawRecords = ref<WithdrawRecord[]>([])
const isScrollPaused = ref(false) // Control CSS animation pause state
let bannerTimer: ReturnType<typeof setInterval> | null = null
let gameCountTimer: ReturnType<typeof setInterval> | null = null

// 生成随机手机号（隐藏中间四位）
const generateRandomPhone = () => {
  const prefixes = ['138', '139', '158', '159', '186', '187', '135', '136', '177', '178']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `${prefix}****${suffix}`
}

// 生成随机提现金额
const generateRandomAmount = () => {
  const amounts = [500, 800, 1000, 1200, 1500, 2000, 2500, 3000, 3500, 5000, 8000, 10000]
  return amounts[Math.floor(Math.random() * amounts.length)]
}

// 生成假数据
const generateFakeRecords = (count: number): WithdrawRecord[] => {
  const fakeRecords: WithdrawRecord[] = []
  for (let i = 0; i < count; i++) {
    fakeRecords.push({
      user: generateRandomPhone(),
      amount: generateRandomAmount()
    })
  }
  return fakeRecords
}

// 获取提现动态数据
const fetchWithdrawRecords = async () => {
  try {
    const res = await withdrawalDynamics(10)
    let records: WithdrawRecord[] = []

    if (res.code === 200 && res.data && res.data.length > 0) {
      // 转换API数据格式
      records = res.data.map(item => ({
        user: item.mobile || generateRandomPhone(),
        amount: Math.abs(item.deposit || 0)
      }))
    }

    // 如果数据不足10条，补充假数据
    if (records.length < 10) {
      const fakeCount = 10 - records.length
      const fakeRecords = generateFakeRecords(fakeCount)
      records = [...records, ...fakeRecords]
    }

    // 打乱顺序
    records = records.sort(() => Math.random() - 0.5)

    withdrawRecords.value = records
  } catch (error) {
    console.error('获取提现动态失败:', error)
    // 失败时使用全部假数据
    withdrawRecords.value = generateFakeRecords(10)
  }
}

// CSS animation control - pause/resume via class binding
const startWithdrawScroll = () => {
  isScrollPaused.value = false
}

// Stop scrolling (pause animation)
const stopWithdrawScroll = () => {
  isScrollPaused.value = true
}

// Shop tabs data
const activeShopTab = ref(0)
const shopTabs = ref([
  {
    name: '数码产品',
    banner: '/index/index_dj_15.jpg',
    products: [
      { id: 1, name: 'Apple 2020新款 MacBook Pro', price: 9600, img: '/index/dj_111.jpg' },
      { id: 2, name: '极米NEW Z6X 投影仪', price: 3199, img: '/index/dj_112.jpg' },
      { id: 3, name: '华为手环4', price: 249, img: '/index/dj_113.jpg' },
      { id: 4, name: 'OPPO K10x', price: 1799, img: '/index/dj_114.jpg' },
      { id: 5, name: '任天堂 Nintendo Switch', price: 2200, img: '/index/dj_125.jpg' },
      { id: 6, name: 'Apple iPad Pro2020年新款', price: 6100, img: '/index/dj_108.jpg' }
    ]
  },
  {
    name: '居家生活',
    banner: '/index/index_dj_06.jpg',
    products: [
      { id: 7, name: '爱丽思IRIS 收纳柜', price: 699, img: '/index/dj_317.jpg' },
      { id: 8, name: '南极人 地毯 140*200cm', price: 120, img: '/index/dj_308.jpg' },
      { id: 9, name: '小熊 纳豆酸奶机', price: 269, img: '/index/dj_303.jpg' },
      { id: 10, name: '美的 低音破壁机', price: 599, img: '/index/dj_314.jpg' },
      { id: 11, name: '美的 电火锅', price: 199, img: '/index/dj_315.jpg' },
      { id: 12, name: '小熊 面包机', price: 499, img: '/index/dj_309.jpg' }
    ]
  },
  {
    name: '母婴玩具',
    banner: '/index/index_dj_04.jpg',
    products: [
      { id: 13, name: '小米 米兔智能故事机', price: 249, img: '/index/dj_401.jpg' },
      { id: 14, name: '特酷婴童 儿童自行车', price: 469, img: '/index/dj_402.jpg' },
      { id: 15, name: '小熊 恒温调奶器', price: 388, img: '/index/dj_407.jpg' },
      { id: 16, name: '迪士尼 手账本', price: 99, img: '/index/dj_404.jpg' },
      { id: 17, name: 'babycare恐龙游戏围栏', price: 999, img: '/index/dj_405.jpg' },
      { id: 18, name: '伟易达 婴幼儿早教益智玩具台', price: 459, img: '/index/dj_406.jpg' }
    ]
  }
])

const currentShopTab = computed(() => shopTabs.value[activeShopTab.value])

// Get localized title
const getLocalizedTitle = (item: IndexDataItem | gameItem) => {
  if ('lang_title' in item && item.lang_title && typeof item.lang_title === 'object' && !Array.isArray(item.lang_title)) {
    const langTitle = item.lang_title as Record<string, string>
    return langTitle[locale.value] || item.title
  }
  if ('lang_name' in item && item.lang_name && typeof item.lang_name === 'object' && !Array.isArray(item.lang_name)) {
    const langName = item.lang_name as Record<string, string>
    return langName[locale.value] || (item as gameItem).name
  }
  return 'title' in item ? item.title : (item as gameItem).name
}

// Banner carousel
const nextBanner = () => {
  if (banners.value.length > 0) {
    currentBanner.value = (currentBanner.value + 1) % banners.value.length
  }
}

const prevBanner = () => {
  if (banners.value.length > 0) {
    currentBanner.value = (currentBanner.value - 1 + banners.value.length) % banners.value.length
  }
}

// Load data
onMounted(async () => {
  // 获取系统配置（通过store统一管理，避免重复请求）
  configStore.fetchConfig()

  // 获取首页弹框公告
  getHomePopup().then(res => {
    if (res.code === 200 && res.data?.length > 0) {
      const popup = res.data[0]
      popupAnnouncement.value = popup
      const popupKey = `home_popup_${popup.id}`
      if (!sessionStorage.getItem(popupKey)) {
        showPopup.value = true
        sessionStorage.setItem(popupKey, 'true')
      }
    }
  }).catch(error => {
    console.error('Failed to get home popup:', error)
  })

  // 获取提现动态数据
  fetchWithdrawRecords().then(() => {
    startWithdrawScroll()
  })

  try {
    const [bannerRes, announcementRes, hotRes] = await Promise.all([
      getBanners(),
      getAnnouncements(),
      indexGameHotNew({ hot_count: 8, new_count: 4 })
    ])

    if (bannerRes.code === 200) {
      banners.value = bannerRes.data || []
    }
    if (announcementRes.code === 200) {
      announcements.value = announcementRes.data || []
    }
    if (hotRes.code === 200 && hotRes.data) {
      hotGames.value = hotRes.data.hot || []
      newGames.value = hotRes.data.new || []
    }

    // Auto-play banner (only if banners exist)
    if (banners.value.length > 0) {
      bannerTimer = setInterval(nextBanner, 5000)
    }

    // Simulate game count growth
    gameCountTimer = setInterval(() => {
      gameCount.value += Math.floor(Math.random() * 100)
    }, 2000)
  } catch (error) {
    console.error('Failed to load home data:', error)
  } finally {
    loading.value = false
  }
})

// Cleanup
onUnmounted(() => {
  stopWithdrawScroll()
  if (bannerTimer) {
    clearInterval(bannerTimer)
    bannerTimer = null
  }
  if (gameCountTimer) {
    clearInterval(gameCountTimer)
    gameCountTimer = null
  }
})

const goToGame = (gameId: number) => {
  router.push({ path: '/games', query: { lottery: String(gameId) } })
}

// 获取游戏图片（优先使用game_logo，否则使用默认图片）
const getGameImage = (game: gameItem, index: number) => {
  if (game.game_logo) {
    return game.game_logo
  }
  // 默认图片 01-08.png
  const defaultIndex = (index % 8) + 1
  return `/index/0${defaultIndex}.png`
}

// Close popup
const closePopup = () => {
  showPopup.value = false
}
</script>

<template>
  <MainLayout>
    <!-- Banner Section -->
    <div class="bannerbox">
      <div class="hd" v-if="banners.length > 1">
        <ul>
          <li v-for="(_, index) in banners" :key="index" :class="{ on: currentBanner === index }" @click="currentBanner = index"></li>
        </ul>
      </div>
      <div class="bd">
        <ul>
          <!-- API轮播图 -->
          <li v-for="(banner, index) in banners" :key="banner.id" :style="{ display: currentBanner === index ? 'list-item' : 'none' }">
            <a :href="banner.jump_url || 'javascript:void(0)'" :target="banner.jump_url ? '_blank' : '_self'">
              <img :src="banner.pc_pic || banner.pic" :alt="banner.title" width="1920" height="384">
            </a>
          </li>
          <!-- 无数据时的默认显示 -->
          <li v-if="banners.length === 0" style="display: list-item;">
            <a href="javascript:void(0)">
              <img src="/index/202304041.png" alt="默认轮播图" width="1920" height="384">
            </a>
          </li>
        </ul>
      </div>
      <a v-if="banners.length > 1" class="prev" href="javascript:void(0)" @click="prevBanner"></a>
      <a v-if="banners.length > 1" class="next" href="javascript:void(0)" @click="nextBanner"></a>

      <!-- Login Box / User Info -->
      <!-- Not logged in: Show login form -->
      <template v-if="!isLogin">
        <div class="bg-white opacity-95 absolute right-[calc(50%-600px)] z-[102] w-[320px] h-auto pt-px pr-4 pb-4 pl-4 top-[15px] box-border rounded-[24px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]">
          <LoginBox compact />
        </div>
      </template>
      <template v-else>
        <div class="bg-white absolute right-[calc(50%-570px)] z-[102] w-[320px] h-auto p-3 top-[15px] box-border rounded-[24px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-500">
          <!-- Header: Avatar & Info -->
          <div class="flex items-center gap-4 mb-2 relative">
            <div class="relative group">
              <div class="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-orange-50 transition-all group-hover:ring-orange-100 shadow-sm">
                <img :src="customer?.avatar_url || '/head/m-1.gif'" :alt="customer?.nickname || ''" class="w-full h-full object-cover">
              </div>
              <div class="absolute -bottom-1 -right-1 p-1  rounded-lg shadow-sm">
                <img
                  :src="`/ranking/vip/${customer?.level || 1}.png`"
                  alt="level-customer"
                  class="w-3 h-3"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="text-base font-black text-gray-900 truncate leading-tight mb-0.5">
                {{ customer?.nickname || '_sg' + customer?.id }}
              </h3>
              <div class="flex items-center gap-2">
                <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">ID: {{ customer?.id }}</span>
                <span class="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-md">{{customer?.gid_label}}</span>
              </div>
            </div>

            <button
              @click="authStore.logout()"
              class="absolute -top-2 -right-2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="退出登录"
            >
              <LogOut class="w-5 h-5" />
            </button>
          </div>

          <!-- Stats/Balance -->
          <div class="bg-gray-50 rounded-2xl p-1 mb-2 border border-gray-100/50">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet class="w-3.5 h-3.5" /> 总余额
              </span>
              <router-link to="/user/detail" class="text-[10px] font-bold text-gray-400 hover:text-gray-600">
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-black text-[#ff4757] tracking-tight">{{ $n(customer?.points || 0) }}</span>
                  <img alt="coin" class="inline-block w-[13px] h-[13px]" src="/ranking/coin.png"/>
                </div>
              </router-link>
            </div>
          </div>

          <!-- Quick Actions Grid -->
          <div class="grid grid-cols-2 gap-3 mb-2">
            <router-link to="/partners" class="flex items-center justify-center gap-2 py-2 bg-gradient-to-br from-[#ff4757] to-[#ee5a6f] text-white rounded-2xl shadow-lg shadow-red-100 hover:shadow-red-200 hover:-translate-y-0.5 transition-all">
              <CircleDollarSign class="w-4 h-4" />
              <span class="font-black text-sm">立即充值</span>
            </router-link>
            <router-link to="/shop" class="flex items-center justify-center gap-2 py-2 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl hover:border-orange-100 hover:bg-orange-50/30 transition-all">
              <ShoppingBag class="w-4 h-4 text-orange-400" />
              <span class="font-bold text-sm">积分商城</span>
            </router-link>
          </div>

          <!-- Bottom Action -->
          <router-link
            to="/user/checkin"
            class="w-full flex items-center justify-between p-2 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition-all"
          >
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white rounded-xl shadow-sm text-green-500">
                <CalendarCheck class="w-5 h-5" />
              </div>
              <span class="font-bold text-gray-700 text-sm">每日签到领奖励</span>
            </div>
            <ArrowRight class="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
          </router-link>

          <!-- Support Banner -->
          <a
            :href="`http://wpa.qq.com/msgrd?v=3&uin=${sysConfig?.connet_qq || '228711'}&site=qq&menu=yes`"
            target="_blank"
            class="mt-2 block relative overflow-hidden rounded-2xl group border border-gray-100 shadow-sm"
          >
            <img src="/index_qq.png" alt="QQ客服" class="w-full h-auto transition-transform duration-500 group-hover:scale-105">
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
            <div class="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-[#12b7f5]">
              <MessageSquare class="w-3 h-3" /> 点击咨询
            </div>
          </a>
        </div>
      </template>
    </div>

    <!-- Main Content -->
    <div class="index_center">
      <div class="center_box">
        <!-- Step Bar -->
        <div class="step_box">
          <span><b>{{ $n(gameCount) }}</b></span>
        </div>

        <!-- Latest Games -->
        <div class="index_box games_box">
          <div class="top">
            <h2>最新游戏</h2>
            <router-link class="more" to="/games">更多<img src="/index_more.png"></router-link>
          </div>
          <div class="list">
            <!-- Skeleton loading -->
            <ul v-if="loading">
              <li v-for="i in 4" :key="`skeleton-new-${i}`">
                <div class="img">
                  <Skeleton width="193px" height="320px" border-radius="4px" />
                </div>
                <div class="text">
                  <dd><Skeleton width="120px" height="20px" style="margin-top: 10px;" /></dd>
                </div>
              </li>
            </ul>
            <!-- Actual content -->
            <ul v-else>
              <li v-for="(game, index) in newGames.slice(0, 4)" :key="game.id" @click="goToGame(game.id)">
                <i class="game-type type"></i>
                <div class="img">
                  <img :src="getGameImage(game, index)" :alt="game.name">
                  <div class="hover">
                    <a class="link_btn" href="javascript:void(0)"></a>
                    <a class="button" href="javascript:void(0)">立即试玩</a>
                  </div>
                </div>
                <div class="text">
                  <dd><span>{{ game.name }}</span></dd>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Announcements -->
        <div class="index_box news_box">
          <div class="top">
            <h2>公告</h2>
            <router-link class="more" to="#">更多<img src="/index_more.png"></router-link>
          </div>
          <ul class="news_list">
            <li v-for="notice in announcements.slice(0, 5)" :key="notice.id">
              <router-link :to="`/announcement/${notice.id}`"><b></b>{{ getLocalizedTitle(notice) }}</router-link>
            </li>
            <li v-if="announcements.length === 0">
              <span class="empty-notice"><b></b>暂无公告</span>
            </li>
          </ul>
        </div>

        <!-- Withdrawal Dynamics -->
        <div class="index_box cash_box">
          <div class="top">
            <h2>提现动态</h2>
          </div>
          <div
            class="cash_list"
            @mouseenter="stopWithdrawScroll"
            @mouseleave="startWithdrawScroll"
          >
            <div class="bd scroll-container">
              <ul
                :class="['infoList', 'scroll-animation', { 'scroll-paused': isScrollPaused }]"
              >
                <!-- 原始数据 -->
                <li v-for="(record, index) in withdrawRecords" :key="`a-${index}`">
                  <p><b><a href="javascript:void(0)">{{ record.user }}</a></b> 提现了</p>
                  <span>{{ $n(record.amount) }}</span>
                </li>
                <!-- 复制一份用于无缝滚动 -->
                <li v-for="(record, index) in withdrawRecords" :key="`b-${index}`">
                  <p><b><a href="javascript:void(0)">{{ record.user }}</a></b> 提现了</p>
                  <span>{{ $n(record.amount) }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Hot Games -->
        <div class="index_box card_box">
          <div class="top">
            <h2>热门游戏</h2>
            <router-link class="more" to="/games">更多<img src="/index_more.png"></router-link>
          </div>
          <div class="list">
            <!-- Skeleton loading -->
            <ul v-if="loading">
              <li v-for="i in 4" :key="`skeleton-hot-${i}`">
                <div class="img">
                  <Skeleton width="193px" height="320px" border-radius="4px" />
                </div>
                <div class="text">
                  <dd><Skeleton width="120px" height="20px" style="margin-top: 10px;" /></dd>
                </div>
              </li>
            </ul>
            <!-- Actual content -->
            <ul v-else>
              <li v-for="(game, index) in hotGames.slice(0, 4)" :key="game.id" @click="goToGame(game.id)">
                <i class="game-type type"></i>
                <div class="img">
                  <img :src="getGameImage(game, index + 4)" :alt="game.name">
                  <div class="hover">
                    <a class="link_btn" href="javascript:void(0)"></a>
                    <a class="button" href="javascript:void(0)">立即试玩</a>
                  </div>
                </div>
                <div class="text">
                  <dd><span>{{ game.name }}</span></dd>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Daily Rankings -->
        <HomeRank />

        <!-- Game Shop -->
        <div class="index_box prize_box">
          <div class="top">
            <h2>游戏商城</h2>
          </div>
          <div class="award_box">
            <div class="hd">
              <ul>
                <li
                  v-for="(tab, index) in shopTabs"
                  :key="index"
                  :class="{ on: activeShopTab === index }"
                  @click="activeShopTab = index"
                >{{ tab.name }}</li>
              </ul>
            </div>
            <div class="bd">
              <div class="pro_box">
                <div class="banner_box">
                  <div class="inbd">
                    <ul>
                      <li><a href="#"><img :src="currentShopTab.banner" width="293" height="414"></a></li>
                    </ul>
                  </div>
                </div>
                <ul class="pro">
                  <li v-for="product in currentShopTab.products" :key="product.id">
                    <a href="#">
                      <div class="img"><img :src="product.img" :alt="product.name"></div>
                      <span>{{ product.name }}</span>
                      <b>{{ product.price }}元</b>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="bask_box">
            <h2><span>蛋友晒奖</span></h2>
            <ul>
              <div class="first">
                <a href="#">
                  <div class="img"><img src="/index/sj003.jpg" width="251" height="133"></div>
                  <span>哈哈，我想继续"薅"蛋蛋的羊毛</span>
                </a>
              </div>
              <li><a href="#"><span><b></b>心心念念的烤箱终于到我碗里啦</span></a></li>
              <li><a href="#"><span><b></b>坚持就是胜利，迎来我的健康养生壶</span></a></li>
              <li><a href="#"><span><b></b>终于兑换了小米蓝牙运动mini耳机</span></a></li>
              <li><a href="#"><span><b></b>2020年第一份幸运！</span></a></li>
              <li><a href="#"><span><b></b>心仪已久的飞利浦智能电饭煲到手啦</span></a></li>
            </ul>
          </div>
        </div>

        <!-- Partners -->
        <div class="index_box work_box">
          <div class="top">
            <h2>合作商家</h2>
          </div>
          <div class="work_list">
            <img src="/index_work.jpg" alt="合作商家">
          </div>
        </div>
      </div>
    </div>

  </MainLayout>

  <!-- 首页弹框公告 -->
  <div v-if="showPopup && popupAnnouncement" class="home-popup-dialog">
    <div class="popup-dialog-box">
      <div class="popup-dialog-content">
        <h1>{{ popupAnnouncement.title }}</h1>
        <div class="popup-dialog-body" v-html="popupAnnouncement.content"></div>
        <a href="javascript:;" class="popup-close-btn" @click="closePopup">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/>
            <path d="M0 0h24v24h-24z" fill="none"/>
          </svg>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Banner */
.bannerbox {
  width: 100vw;
  height: 330px;
  overflow: hidden;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.bannerbox .bd {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
  z-index: 0;
}

.bannerbox .bd ul {
  list-style: none;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
}

.bannerbox .bd li {
  width: 100%;
  height: 330px;
  position: relative;
}

.bannerbox .bd li a {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

.bannerbox .bd img {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  height: 330px;
  width: auto;
  min-width: 100%;
}

.bannerbox .hd {
  z-index: 100;
  border: medium none;
  left: 0;
  right: 0;
  bottom: 20px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  visibility: visible;
  width: 100%;
  text-align: center;
}

.bannerbox .hd ul {
  overflow: hidden;
  zoom: 1;
  display: inline-block;
  height: auto;
}

.bannerbox .hd ul li {
  width: 30px;
  height: 10px;
  text-align: center;
  cursor: pointer;
  display: inline-block;
  border-radius: 15px;
  margin: 0 2px;
  background: #fff;
  transition: .5s;
  opacity: 0.6;
}

.bannerbox .hd ul li.on {
  width: 12px;
  background: #f03736;
  color: #fff;
  transition: .5s;
  opacity: 1;
}

.bannerbox .prev,
.bannerbox .next {
  display: none;
  position: absolute;
  top: 50%;
  margin-top: -30px;
  width: 45px;
  height: 60px;
  background: url("/index_slider-arrow.png") -108px 0 no-repeat;
  opacity: 0.5;
  cursor: pointer;
  z-index: 60;
}

.bannerbox .next {
  right: calc(50% - 560px);
  background-position: 0 0;
}

.bannerbox .prev {
  left: calc(50% - 560px);
}

.bannerbox:hover .prev,
.bannerbox:hover .next {
  display: block;
}

.bannerbox .prev:hover,
.bannerbox .next:hover {
  opacity: .8;
}

/* Login Box */
.bannerbox .fucen_box {
  background: #fff;
  filter: Alpha(opacity=95);
  width: 289px;
  height: 256px;
  padding: 19px 23px 0 23px;
  position: absolute;
  right: calc(50% - 600px);
  top: 26px;
  z-index: 50;
  box-sizing: content-box;
}

.error-msg {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-bottom: 8px;
}

/* User Info Box */
.bannerbox .fucen_box .message_box {
  width: 289px;
  height: auto;
  overflow: hidden;
  padding: 0 0 2px 0;
  margin-bottom: 15px;
}

.bannerbox .fucen_box .message_box .img {
  margin-top: 5px;
  width: 50px;
  height: 50px;
  overflow: hidden;
  float: left;
  border: 2px solid #e9e9e9;
  border-radius: 100px;
}

.bannerbox .fucen_box .message_box .img img {
  width: 50px;
  height: auto;
}

.bannerbox .fucen_box .message_box .text {
  float: left;
  margin-left: 10px;
  color: #666;
  font-size: 12px;
}

.bannerbox .fucen_box .message_box .text h3 {
  margin: 0 auto;
  line-height: 30px;
  margin-top: 2px;
  font-size: 16px;
}

.bannerbox .fucen_box .message_box .text p {
  color: #afafaf;
  line-height: 22px;
}

.bannerbox .fucen_box .message_box .text p a.button {
  margin-top: 1px;
  display: block;
  width: 60px;
  height: 20px;
  line-height: 20px;
  float: right;
  text-align: center;
  background: #fa4c4b;
  color: #fff;
  font-size: 10px;
  border-radius: 100px;
}

.bannerbox .fucen_box .message_box .close_box {
  position: absolute;
  width: 64px;
  height: 64px;
  background: url("/index_ever.png") 0 -82px no-repeat;
  top: 4px;
  right: 4px;
  cursor: pointer;
}

.bannerbox .fucen_box .message_box .close_box:hover {
  background-position: -73px -82px;
}

.bannerbox .fucen_box .user-onwer-list {
  height: 30px;
  width: 289px;
  line-height: 30px;
}

.bannerbox .fucen_box .user-onwer-list p {
  float: left;
  font-size: 13px;
  color: #666;
  line-height: 30px;
  height: 30px;
  display: inline-block;
}

.bannerbox .fucen_box .user-onwer-list p span {
  color: #fa4c4b;
  font-weight: bold;
}

.bannerbox .fucen_box .user-onwer-list a.button {
  float: right;
  display: inline-block;
  width: 31px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  font-size: 12px;
  background: #fff;
  color: #9d9d9d;
  border: 1px solid #9d9d9d;
  margin-left: 5px;
  margin-top: 6px;
}

.bannerbox .fucen_box .user-onwer-list a.button:hover {
  color: #fa4c4b;
  border: 1px solid #fa4c4b;
}

.bannerbox .fucen_box .anniu_box {
  width: 289px;
  height: 59px;
  overflow: hidden;
  line-height: 59px;
  margin: 11px auto auto auto;
  border-top: 1px solid #e8e8eb;
}

.bannerbox .fucen_box .anniu_box a.button {
  margin-top: 12px;
  display: block;
  width: 289px;
  height: 35px;
  line-height: 35px;
  float: right;
  text-align: center;
  background: #fa4c4b;
  color: #fff;
  font-size: 15px;
  border-radius: 100px;
}

.bannerbox .fucen_box .qq-banner {
  height: 75px;
  overflow: hidden;
  width: 335px;
  display: block;
  position: absolute;
  margin-left: -23px;
  bottom: 0;
  text-decoration: none;
}

.bannerbox .fucen_box .qq-banner img {
  display: block;
  width: 335px;
  height: 75px;
}

/* Main Content */
.index_center {
  width: 100%;
  height: auto;
  overflow: hidden;
  padding-bottom: 25px;
  background-color: #f5f6f8;
}

.index_center .center_box {
  width: 1200px;
  height: auto;
  overflow: hidden;
  position: relative;
  z-index: 0;
  margin: 0 auto;
}

/* Step Bar */
.index_center .center_box .step_box {
  width: 1200px;
  height: 68px;
  background: url("/index_step.jpg") no-repeat;
  margin-top: 20px;
  float: left;
}

.index_center .center_box .step_box span {
  color: #fa4c4b;
  font-size: 14px;
  float: right;
  width: 230px;
  text-align: center;
  margin: 29px 6px 0 0;
}

.index_center .center_box .step_box span b {
  font-weight: inherit;
  font-size: 22px;
}

/* Index Box Common */
.index_center .center_box .index_box {
  background: #fff;
  height: auto;
  overflow: hidden;
  margin-top: 20px;
}

.index_center .center_box .index_box .top {
  border-bottom: 1px solid #ececec;
  height: 55px;
  line-height: 55px;
  margin: 0 auto;
}

.index_center .center_box .index_box .top h2 {
  margin: 14px auto auto auto;
  color: #515151;
  font-size: 20px;
  border-left: 4px solid #f03736;
  height: 27px;
  line-height: 27px;
  display: inline-block;
  padding-left: 10px;
  float: left;
}

.index_center .center_box .index_box .top a.more {
  float: right;
  font-size: 13px;
  color: #9a9a9a;
  cursor: pointer;
  margin-right: 10px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.index_center .center_box .index_box .top a.more img {
  margin-left: 5px;
  flex-shrink: 0;
}

/* Games Box */
.index_center .center_box .games_box,
.index_center .center_box .card_box {
  float: left;
  width: 860px;
}

.index_center .center_box .games_box .top,
.index_center .center_box .card_box .top {
  width: 837px;
}

.index_center .center_box .index_box .list {
  height: auto;
  overflow: hidden;
  float: left;
  margin: 28px auto 10px auto;
}

.index_center .center_box .index_box .list ul {
  margin-left: 5px;
}

.index_center .center_box .index_box .list li {
  width: 193px;
  height: auto;
  overflow: hidden;
  float: left;
  margin: auto 10px 13px 10px;
  cursor: pointer;
}

.index_center .center_box .index_box .list li .img {
  width: 193px;
  height: 320px;
  overflow: hidden;
  position: relative;
}

.index_center .center_box .index_box .list li .img img {
  width: 193px;
  height: 320px;
  transition: transform .5s ease-out;
}

.index_center .center_box .index_box .list li .img .hover {
  display: none;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: rgba(0,0,0,.7);
  z-index: 2;
}

.index_center .center_box .index_box .list li .img .hover .link_btn {
  width: 100%;
  height: 100%;
  display: block;
}

.index_center .center_box .index_box .list li .img .hover .button {
  width: 100px;
  height: 35px;
  border-radius: 2px;
  background: #f03736;
  font-size: 14px;
  text-align: center;
  line-height: 35px;
  display: block;
  position: absolute;
  top: 145px;
  left: 50%;
  margin: 0 0 0 -51px;
  color: #fff;
}

.index_center .center_box .index_box .list li:hover .img img {
  transform: scale(1.03,1.03);
}

.index_center .center_box .index_box .list li:hover .hover {
  display: block;
}

.index_center .center_box .index_box .list li .text {
  margin-top: 5px;
}

.index_center .center_box .index_box .list li .text dd {
  margin: 0 auto;
  line-height: 24px;
  height: 24px;
}

.index_center .center_box .index_box .list li .text dd span {
  float: left;
  display: inline-block;
  color: #666;
  text-align: center;
  font-size: 13px;
  width: 193px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 10px;
}

/* News Box */
.index_center .center_box .news_box,
.index_center .center_box .cash_box,
.index_center .center_box .day_box {
  width: 320px;
  float: right;
}

.index_center .center_box .news_box .top,
.index_center .center_box .cash_box .top {
  width: 310px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5px;
  box-sizing: border-box;
}

.index_center .center_box .news_box .top h2,
.index_center .center_box .cash_box .top h2 {
  float: none;
  margin: 0;
}

.index_center .center_box .news_box .top a.more,
.index_center .center_box .cash_box .top a.more {
  float: none;
  margin-right: 0;
  white-space: nowrap;
}

.index_center .center_box .news_box .news_list {
  width: 290px;
  margin: 5px auto;
  display: block;
  list-style: none;
  padding: 0;
}

.index_center .center_box .news_box .news_list li a {
  width: 290px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  line-height: 35px;
  height: 35px;
  color: #666;
  font-size: 13px;
}

.index_center .center_box .news_box .news_list li a b {
  width: 6px;
  height: 6px;
  border-radius: 10px;
  display: inline-block;
  background: #ccc;
  margin: 16px 5px auto auto;
  float: left;
}

.index_center .center_box .news_box .news_list li a:hover {
  color: #f03736;
}

.index_center .center_box .news_box .news_list li a:hover b {
  background: #f03736;
}

.index_center .center_box .news_box .news_list li .empty-notice {
  width: 290px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  line-height: 35px;
  height: 35px;
  color: #999;
  font-size: 13px;
}

.index_center .center_box .news_box .news_list li .empty-notice b {
  width: 6px;
  height: 6px;
  border-radius: 10px;
  display: inline-block;
  background: #ccc;
  margin: 16px 5px auto auto;
  float: left;
}

/* Cash Box */
.index_center .center_box .cash_box .cash_list {
  width: 290px;
  overflow: hidden;
  position: relative;
  margin: 5px auto 15px auto;
}

.index_center .center_box .cash_box .cash_list .scroll-container {
  height: 164px;
  overflow: hidden;
}

.index_center .center_box .cash_box .cash_list .infoList {
  list-style: none;
  padding: 0;
  margin: 0;
  will-change: transform;
}

/* CSS-based smooth scroll animation - replaces JS setInterval for better performance */
.index_center .center_box .cash_box .cash_list .infoList.scroll-animation {
  animation: withdraw-scroll 20s linear infinite;
}

.index_center .center_box .cash_box .cash_list .infoList.scroll-paused {
  animation-play-state: paused;
}

@keyframes withdraw-scroll {
  0% {
    transform: translateY(0);
  }
  100% {
    /* Scroll by half the total height (10 items * 41px = 410px / 2 = 205px) */
    transform: translateY(-205px);
  }
}

.index_center .center_box .cash_box .cash_list .infoList li {
  height: 40px;
  line-height: 40px;
  border-bottom: 1px dashed #ebebeb;
  font-size: 13px;
}

.index_center .center_box .cash_box .cash_list .infoList li p {
  display: inline-block;
  float: left;
  width: 160px;
}

.index_center .center_box .cash_box .cash_list .infoList li p b {
  padding-right: 10px;
  font-weight: inherit;
}

.index_center .center_box .cash_box .cash_list .infoList li p b a {
  color: #666;
}

.index_center .center_box .cash_box .cash_list .infoList li span {
  float: right;
  display: inline-block;
  width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
  color: #5f66c4;
}

/* Prize Box - Shop */
.index_center .center_box .prize_box,
.index_center .center_box .work_box {
  float: left;
  width: 1200px;
}

.index_center .center_box .prize_box .top,
.index_center .center_box .work_box .top {
  width: 1175px;
  padding-left: 25px;
  background: #fff;
}

.index_center .center_box .work_box {
  background: #fff;
  margin-bottom: 20px;
}

.index_center .center_box .prize_box .award_box {
  width: 893px;
  height: auto;
  overflow: hidden;
  text-align: left;
  float: left;
  margin: 20px auto 20px 11px;
}

.index_center .center_box .prize_box .award_box .hd {
  position: relative;
  width: 118px;
  height: 412px;
  float: left;
  overflow: hidden;
}

.index_center .center_box .prize_box .award_box .hd ul {
  position: absolute;
  list-style: none;
  padding: 0;
  margin: 0;
}

.index_center .center_box .prize_box .award_box .hd ul li {
  cursor: pointer;
  width: 116px;
  height: 136px;
  border: 1px solid #f2f2f2;
  text-align: center;
  line-height: 136px;
  font-size: 14px;
  color: #5a5a5a;
  margin-bottom: -1px;
  box-sizing: border-box;
}

.index_center .center_box .prize_box .award_box .hd ul li.on {
  background: #f4605f;
  color: #fff;
  border: 1px solid #f4605f;
}

.index_center .center_box .prize_box .award_box .bd {
  float: left;
}

.index_center .center_box .prize_box .award_box .bd .pro_box {
  float: left;
  width: 775px;
  height: auto;
  overflow: hidden;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .banner_box {
  width: 293px;
  height: 412px;
  overflow: hidden;
  float: left;
  position: relative;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .banner_box .inbd {
  position: relative;
  width: 293px;
  height: 412px;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .banner_box .inbd ul {
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
  width: 293px;
  height: 412px;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .banner_box .inbd li {
  position: absolute;
  width: 293px;
  height: 412px;
  left: 0;
  top: 0;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .banner_box .inbd img {
  width: 293px;
  height: 412px;
  display: block;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .pro {
  width: 480px;
  height: auto;
  overflow: hidden;
  float: left;
  list-style: none;
  padding: 0;
  margin: 0;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .pro li {
  float: left;
  width: 152px;
  height: auto;
  overflow: hidden;
  margin: auto auto auto 8px;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .pro li .img {
  width: 150px;
  height: 150px;
  border: 1px solid #ececec;
  overflow: hidden;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .pro li .img img {
  width: 150px;
  height: 150px;
  transition: transform .5s ease-out;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .pro li:hover .img {
  border: 1px solid #cbcbcb;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .pro li:hover .img img {
  transform: scale(1.03,1.03);
}

.index_center .center_box .prize_box .award_box .bd .pro_box .pro li span {
  display: inline-block;
  width: 150px;
  height: 30px;
  line-height: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

.index_center .center_box .prize_box .award_box .bd .pro_box .pro li b {
  font-weight: inherit;
  color: #f03736;
  display: inline-block;
  height: 14px;
  line-height: 14px;
  padding-bottom: 10px;
}

/* Bask Box */
.index_center .center_box .bask_box {
  float: right;
  margin: 20px 11px auto auto;
  width: 276px;
  height: auto;
  overflow: hidden;
  border: 1px solid #ebebeb;
}

.index_center .center_box .bask_box > h2 {
  width: 262px;
  height: 52px;
  line-height: 52px;
  color: #4c4c4c;
  font-size: 18px;
  font-weight: bold;
  margin: 0 auto;
  border-bottom: 1px solid #ebebeb;
  padding-left: 14px;
}

.index_center .center_box .bask_box > h2 span {
  border-bottom: 2px solid #f03736;
  display: inline-block;
  height: 51px;
  line-height: 51px;
}

.index_center .center_box .bask_box ul {
  width: 251px;
  height: auto;
  overflow: hidden;
  margin: 9px auto auto auto;
  list-style: none;
  padding: 0;
}

.index_center .center_box .bask_box ul div.first .img {
  width: 251px;
  height: 133px;
}

.index_center .center_box .bask_box ul div.first span {
  display: inline-block;
  width: 241px;
  height: 25px;
  line-height: 25px;
  padding: 0 5px;
  background: rgba(0,0,0,.62);
  font-size: 12px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  margin-top: -25px;
  z-index: 11;
}

.index_center .center_box .bask_box ul li a {
  width: 251px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  line-height: 41px;
  height: 41px;
  color: #666;
  font-size: 13px;
  border-bottom: 1px dashed #ebebeb;
}

.index_center .center_box .bask_box ul li a b {
  width: 6px;
  height: 6px;
  border-radius: 10px;
  display: inline-block;
  background: #ccc;
  margin: 19px 10px auto auto;
  float: left;
}

.index_center .center_box .bask_box ul li a span {
  display: block;
  float: left;
  width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.index_center .center_box .bask_box ul li a:hover {
  color: #f03736;
}

.index_center .center_box .bask_box ul li a:hover b {
  background: #f03736;
}

/* Work Box - Partners */
.index_center .center_box .work_box .work_list {
  width: 1148px;
  height: auto;
  overflow: hidden;
  margin: 0 auto;
  padding: 23px 26px;
  background: #fff;
}

.index_center .center_box .work_box .work_list img {
  width: 100%;
  height: auto;
  display: block;
}

/* Global link styles */
a {
  text-decoration: none;
}

a:hover {
  text-decoration: none;
}

.dialog__content h1 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
  font-weight: bold;
  padding-right: 40px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.dialog__body :deep(p) {
  margin: 0 0 10px 0;
}

.dialog__body :deep(img) {
  max-width: 100%;
  height: auto;
}

.dialog__body :deep(a) {
  color: #f03736;
}

.dialog-close svg {
  width: 20px;
  height: 20px;
  fill: #fff;
  pointer-events: none;
  vertical-align: top;
}
</style>

<!-- 弹框公告样式 - 非scoped，因为Teleport渲染到body -->
<style>
.home-popup-dialog {
  will-change: visibility, opacity;
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
}

.home-popup-dialog .popup-dialog-box {
  max-width: 600px;
  width: 90%;
  padding: 1.2rem;
}

.home-popup-dialog .popup-dialog-content {
  position: relative;
  padding: 2.4rem;
  background: #fff;
  background-clip: padding-box;
  box-shadow: 0 12px 15px 0 rgba(0, 0, 0, 0.25);
}

.home-popup-dialog .popup-dialog-content h1 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
  font-weight: bold;
  padding-right: 40px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.home-popup-dialog .popup-dialog-body {
  font-size: 14px;
  line-height: 1.8;
  color: #666;
  max-height: 400px;
  overflow-y: auto;
}

.home-popup-dialog .popup-dialog-body p {
  margin: 0 0 10px 0;
}

.home-popup-dialog .popup-dialog-body img {
  max-width: 100%;
  height: auto;
}

.home-popup-dialog .popup-dialog-body a {
  color: #f03736;
}

.home-popup-dialog .popup-close-btn {
  z-index: 10;
  cursor: pointer;
  position: absolute;
  top: 0;
  right: 0;
  margin: 1.2rem;
  padding: 0.6rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-popup-dialog .popup-close-btn svg {
  width: 20px;
  height: 20px;
  fill: #fff;
  pointer-events: none;
  vertical-align: top;
}

.home-popup-dialog .popup-close-btn:hover {
  background: rgba(0, 0, 0, 0.6);
}
</style>
