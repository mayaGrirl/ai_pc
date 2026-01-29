<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { ChevronRight } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { recommendLink, recommendCustomers, receiveRecommendReward } from '@/api/customer'
import type { RecommendCustomer } from '@/types/customer.type'
import {useTable} from "@/composables/useTable.ts";
import {getSecureToken} from "@/utils/verify-key.ts";
import {useToast} from "@/composables/useToast.ts";
import DataTable from "@/components/ui/DataTable.vue";
import {useClipboard} from "@vueuse/core";
import {PROMOTION_LEVEL_REWARDS} from "@/constants/constants.ts";

const toast = useToast()
const { copy, isSupported } = useClipboard()
const authStore = useAuthStore()
const isLogin = computed(() => authStore.isLogin)
// 推广链接key
const promotionKey = ref('')

// 推广链接文本
const referralText = computed(() => {
  const key = promotionKey.value
  return `重磅推出工资系统，游戏就可以领取工资。另外每日幸运儿奖励千万豆豆作为奖励，幸运儿上线另外可以领取10%奖励！您还在等什么？赶快行动吧！您的推广地址：${window.location.origin}/register?tj=${key}`
})

// 复制邀请链接
const copyUrl = async () => {
  if (isSupported.value) {
    await copy(referralText.value);
    toast.success('已复制推广链接');
  } else {
    toast.error('您的浏览器不支持自动复制');
  }
}

// 加载推广链接
const loadPromotionLink = async () => {
  try {
    const res = await recommendLink()
    if (res.code === 200 && res.data) {
      promotionKey.value = res.data.key
    }
  } catch (error) {
    console.error('加载推广链接失败', error);
    toast.error('加载推广链接失败')
  }
}

// 一键领取投注提成
const claimBetBonus = async () => {
  try {
    const res = await receiveRecommendReward({ type: 34 })
    if (res.code === 200) {
      toast.success('领取成功')
    } else {
      toast.error(res.message || '领取失败')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '检测失败，刷新页面请重试';
    toast.error(msg);
  }
}

// 一键领取升级奖励
const claimUpgradeBonus = async () => {
  try {
    const res = await receiveRecommendReward({ type: 9 })
    if (res.code === 200) {
      toast.success('领取成功')
    } else {
      toast.error(res.message || '领取失败')
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '检测失败，刷新页面请重试';
    toast.error(msg);
  }
}

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<RecommendCustomer>(recommendCustomers, {
  defaultSize: 10,
  initQuery: {t: getSecureToken()}
})

// 列配置
const columns = [
  { key: 'nickname', title: '昵称', width: '25%', align: 'center' as const },
  { key: 'experience', title: '生态值', width: '25%', align: 'center' as const },
  { key: 'tzpoints', title: '今日提成', width: '25%', align: 'center' as const },
  { key: 'tgall', title: '累计提成', width: '25%', align: 'center' as const },
]

onMounted(() => {
  if (!isLogin.value) {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
  }
  loadPromotionLink();
  loadData();
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-[#fcf9f4] relative overflow-x-hidden">
      <!-- Background Images (Full Width) -->
      <div class="absolute top-0 left-0 w-full z-0">
        <div class="w-full h-[404px] bg-[url('/tg-1.jpg')] bg-no-repeat bg-top bg-cover"></div>
        <div class="w-full h-[403px] bg-[url('/tg-2.jpg')] bg-no-repeat bg-top bg-cover"></div>
      </div>

      <!-- Main Content Area -->
      <div class="relative z-10 max-w-[1300px] mx-auto pt-[400px] px-4 pb-20">
        <div class="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12">
          <!-- 推广会员 -->
          <div class="grid grid-cols-1 xl:grid-cols-[1fr_500px] gap-12 lg:gap-20">
            <!-- Left Column: 规则 -->
            <div class="space-y-8">
              <div class="border-l-4 border-[#ff4757] pl-4">
                <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">最佳赚币途径</h2>
                <p class="mt-4 text-gray-600 leading-relaxed font-medium">
                  推荐好友一起来玩，成功推荐一个好友除了可赚取
                  <span class="text-[#ff4757] font-bold">0.2%</span> 投注提成外，还将获得高达
                  <span class="text-[#ff4757] font-bold">168万</span> 豆豆的好友升级奖励！
                </p>
                <p class="text-sm text-gray-400 mt-1">各等级奖励计划：</p>
              </div>

              <div class="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                <table class="w-full text-sm text-center">
                  <thead class="bg-gray-50/50 text-gray-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th class="py-2 px-2">好友等级</th>
                      <th class="py-2 px-2">需要生态值</th>
                      <th class="py-2 px-2">好友升级奖励</th>
                      <th class="py-2 px-2">好友投注提成</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-for="item in PROMOTION_LEVEL_REWARDS" :key="item.level" class="hover:bg-gray-50/50 transition-colors group">
                      <td class="py-2 px-2">
                        <div class="flex justify-center group-hover:scale-110 transition-transform">
                          <img :src="`/skin/pc/wm/images/level/${item.level}.png`" class="w-6 h-6 object-contain" :alt="`Level ${item.level}`" />
                        </div>
                      </td>
                      <td class="py-2 px-2 text-gray-700 font-medium">
                        {{ $n(item.experience) }}
                      </td>
                      <td class="py-2 px-2">
                        <div class="flex items-center justify-center gap-1">
                          <span class="text-[#ff4757] font-bold text-base">{{ $n(item.reward) }}</span>
                          <img src="/ranking/coin.png" class="w-3 h-3" alt="coin" />
                        </div>
                      </td>
                      <td class="py-2 px-2 text-gray-900 font-bold">
                        {{ item.rate }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Right 推广文本 -->
            <div class="space-y-10">
              <!-- Ecovalue Info -->
              <div class="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-8 border border-blue-100/50">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  生态值获取方式
                </h2>
                <a href="/news/help/?#m25" class="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center group">
                  生态值(等级)的获取途径？
                  <ChevronRight class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <!-- 复制邀请的链接 -->
              <div class="bg-gradient-to-br from-orange-50 to-red-50/50 rounded-2xl p-8 border border-orange-100/50">
                <h2 class="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span class="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                  推广文本
                </h2>
                <p class="text-sm text-gray-500 mb-4">
                  以下为您在本站专属的注册推荐地址，您可以通过微信、QQ、MSN等发给您的好友！
                </p>
                <textarea
                  id="textarea2"
                  class="w-full h-32 p-4 bg-white/80 border-2 border-orange-100 rounded-xl text-sm text-gray-600 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all resize-none mb-6 shadow-inner"
                  readonly
                  :value="referralText"
                ></textarea>
                <button
                  class="w-full h-14 bg-gradient-to-r from-[#ff4757] to-[#ee5a6f] text-white font-bold text-lg rounded-xl shadow-lg shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group"
                  @click="copyUrl"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  复制推广链接
                </button>
              </div>
            </div>
          </div>

          <!-- 我推广的会员 -->
          <div class="mt-20 pt-12 border-t border-gray-100">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div class="space-y-1">
                <h2 class="text-2xl font-extrabold text-gray-900">我的近期收益</h2>
                <div class="flex items-center text-[#ff4757] text-sm font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  今日奖励将在明天结算并开放领取！
                </div>
              </div>
              <div class="flex flex-wrap gap-3">
                <button
                  class="h-11 px-6 bg-white border-2 border-red-500 text-red-500 font-bold rounded-lg hover:bg-red-50 active:scale-95 transition-all text-sm shadow-sm"
                  @click="claimUpgradeBonus"
                >
                  一键领取升级奖励
                </button>
                <button
                  class="h-11 px-6 bg-gradient-to-r from-[#ff4757] to-[#ee5a6f] text-white font-bold rounded-lg hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm shadow-md"
                  @click="claimBetBonus"
                >
                  一键领取投注提成
                </button>
              </div>
            </div>

            <DataTable
              :columns="columns"
              :data="dataSource"
              :loading="loading"
              :pagination="pagination"
              @change="changePage"
              :hasMore="hasMore"
            >
              <template #column-experience="{ row }">
                <span class="text-gray-900 font-bold">{{ $n(row.experience) }}</span>
              </template>

              <template #column-tzpoints="{ row }">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                  {{ $n(row.tzpoints) }}
                  <img src="/ranking/coin.png" class="w-3 h-3" alt="coin" />
                </div>
              </template>

              <template #column-tgall="{ row }">
                <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-bold">
                  {{ $n(row.tgall) }}
                  <img src="/ranking/coin.png" class="w-3 h-3" alt="coin" />
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
