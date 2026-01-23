<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { rankToday, rankYesterday, rankWeek } from '@/api/rank'
import {LastWeekField, TodayField, YesterdayField} from '@/types/rank.type'
import type { HttpRes } from '@/types/http.type'
import {useRouter} from "vue-router";

const router = useRouter()
// Loading state
const isLoading = ref(false)

// Ranking data
const rankDataToday = ref<TodayField[]>([])
const rankDataYesterday = ref<YesterdayField[]>([])
const rankDataWeek = ref<LastWeekField[]>([])

// Fetch ranking data
const fetchRankData = async () => {
  isLoading.value = true

  const fetchWithFallback = async <T>(fetchFn: () => Promise<HttpRes<T[]>>): Promise<T[]> => {
    try {
      const res = await fetchFn()
      if (res.code === 200 && res.data) {
        return res.data
      }
    } catch (error) {
      console.error('获取排行数据失败:', error)
    }
    return []
  }

  try {
    const [todayData, yesterdayData, weekData] = await Promise.all([
      fetchWithFallback(rankToday),
      fetchWithFallback(rankYesterday),
      fetchWithFallback(rankWeek)
    ])
    rankDataToday.value = todayData as TodayField[]
    rankDataYesterday.value = yesterdayData as YesterdayField[]
    rankDataWeek.value = weekData as LastWeekField[]
  } finally {
    isLoading.value = false
  }
}

// Get medal class
const getMedalClass = (rank: number) => {
  switch (rank) {
    case 1: return 'medal-gold'
    case 2: return 'medal-silver'
    case 3: return 'medal-bronze'
    default: return 'medal-normal'
  }
}

onMounted(() => {
  fetchRankData()
})
</script>

<template>
  <MainLayout>
    <div class="game-top-page">
      <!-- Top Buttons -->
      <div class="top-buttons">
        <button class="btn-primary active">游戏盈利榜</button>
<!--        <button class="btn-outline">推广收益榜</button>-->
        <button class="btn-outline" @click="router.push('/games')">返回游戏中心</button>
      </div>

      <!-- Three Column Ranking -->
      <div class="ranking-wrapper">
        <div class="ranking-columns">
          <!-- 今日盈利榜 -->
          <div class="ranking-column">
            <div class="ranking-header">今日盈利榜</div>
            <div v-if="isLoading" class="ranking-loading">
              <div v-for="i in 10" :key="`today-skeleton-${i}`" class="rank-skeleton">
                <div class="skeleton-medal"></div>
                <div class="skeleton-info">
                  <div class="skeleton-name"></div>
                  <div class="skeleton-bet"></div>
                </div>
                <div class="skeleton-score"></div>
              </div>
            </div>
            <div v-else-if="rankDataToday.length === 0" class="ranking-empty">暂无数据</div>
            <div v-else class="ranking-list">
              <div v-for="(item, index) in rankDataToday" :key="`today-${item.id}`" class="rank-item">
                <span :class="['rank-medal', getMedalClass(index + 1)]">{{ index + 1 }}</span>
                <div class="rank-info">
                  <div class="rank-name-row">
                    <img
                      :src="`/ranking/vip/${item.level || 1}.png`"
                      alt="VIP"
                      class="rank-vip"
                      @error="($event.target as HTMLImageElement).style.display = 'none'"
                    />
                    <span class="rank-name">{{ item.nickname || '玩家' + item.id }}</span>
                  </div>
<!--                  <div class="rank-bet">-->
<!--                    <img src="/ranking/coin.png" alt="金豆" class="bet-icon" />-->
<!--                    <span>或 {{ item.bet_gold?.toLocaleString() || 0 }}</span>-->
<!--                  </div>-->
                </div>
                <div class="rank-score">
                  <span class="score-value">{{ item.profit?.toLocaleString() || 0 }}</span>
                  <img src="/ranking/coin.png" alt="金豆" class="score-icon" />
                </div>
              </div>
            </div>
          </div>

          <!-- 昨日盈利榜 -->
          <div class="ranking-column">
            <div class="ranking-header">昨日盈利榜</div>
            <div v-if="isLoading" class="ranking-loading">
              <div v-for="i in 10" :key="`yesterday-skeleton-${i}`" class="rank-skeleton">
                <div class="skeleton-medal"></div>
                <div class="skeleton-info">
                  <div class="skeleton-name"></div>
                  <div class="skeleton-bet"></div>
                </div>
                <div class="skeleton-score"></div>
              </div>
            </div>
            <div v-else-if="rankDataYesterday.length === 0" class="ranking-empty">暂无数据</div>
            <div v-else class="ranking-list">
              <div v-for="(item, index) in rankDataYesterday" :key="`yesterday-${item.id}`" class="rank-item">
                <span :class="['rank-medal', getMedalClass(index + 1)]">{{ index + 1 }}</span>
                <div class="rank-info">
                  <div class="rank-name-row">
                    <img
                      :src="`/ranking/vip/${item.level || 1}.png`"
                      alt="VIP"
                      class="rank-vip"
                      @error="($event.target as HTMLImageElement).style.display = 'none'"
                    />
                    <span class="rank-name">{{ item.nickname || '玩家' + item.id }}</span>
                  </div>
<!--                  <div class="rank-bet">-->
<!--                    <img src="/ranking/coin.png" alt="金豆" class="bet-icon" />-->
<!--                    <span>或 {{ item.bet_gold?.toLocaleString() || 0 }}</span>-->
<!--                  </div>-->
                </div>
                <div class="rank-score">
                  <span class="score-value">{{ item.profit?.toLocaleString() || 0 }}</span>
                  <img src="/ranking/coin.png" alt="金豆" class="score-icon" />
                </div>
              </div>
            </div>
          </div>

          <!-- 上周盈利榜 -->
          <div class="ranking-column">
            <div class="ranking-header">上周盈利榜</div>
            <div v-if="isLoading" class="ranking-loading">
              <div v-for="i in 10" :key="`week-skeleton-${i}`" class="rank-skeleton">
                <div class="skeleton-medal"></div>
                <div class="skeleton-info">
                  <div class="skeleton-name"></div>
                </div>
                <div class="skeleton-score"></div>
              </div>
            </div>
            <div v-else-if="rankDataWeek.length === 0" class="ranking-empty">暂无数据</div>
            <div v-else class="ranking-list">
              <div v-for="(item, index) in rankDataWeek" :key="`week-${index+1}`" class="rank-item">
                <span :class="['rank-medal', getMedalClass(index+1)]">{{ index+1 }}</span>
                <div class="rank-info">
                  <div class="rank-name-row">
                    <img
                      :src="`/ranking/vip/${item.level}.png`"
                      alt="VIP"
                      class="rank-vip"
                      @error="($event.target as HTMLImageElement).style.display = 'none'"
                    />
                    <span class="rank-name">{{ item.nickname }}</span>
                  </div>
                </div>
                <div class="rank-score">
                  <span class="score-value">{{ item.profit?.toLocaleString() || 0 }}</span>
                  <img src="/ranking/coin.png" alt="金豆" class="score-icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.game-top-page {
  padding: 20px 0;
  min-height: calc(100vh - 200px);
}

/* Top Buttons */
.top-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
}

.btn-primary,
.btn-outline {
  padding: 10px 30px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #e74c3c;
  color: #fff;
  border: 1px solid #e74c3c;
}

.btn-primary:hover,
.btn-primary.active {
  background: #c0392b;
  border-color: #c0392b;
}

.btn-outline {
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.btn-outline:hover {
  color: #e74c3c;
  border-color: #e74c3c;
}

/* Ranking Wrapper */
.ranking-wrapper {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 4px;
}

.ranking-columns {
  display: flex;
  gap: 15px;
}

.ranking-column {
  flex: 1;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.ranking-header {
  background: #fff;
  color: #e65c00;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 12px 15px;
  border-bottom: 1px solid #e8e8e8;
}

.ranking-list {
  max-height: 600px;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-medal {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 2px;
}

.medal-gold {
  background: linear-gradient(180deg, #ff8a4c 0%, #ff5722 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(255, 87, 34, 0.3);
}

.medal-silver {
  background: linear-gradient(180deg, #64b5f6 0%, #1976d2 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.medal-bronze {
  background: linear-gradient(180deg, #81c784 0%, #388e3c 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(56, 142, 60, 0.3);
}

.medal-normal {
  background: #e8e8e8;
  color: #ff6600;
  font-weight: bold;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-vip {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.rank-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-bet {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #e65c00;
  margin-top: 3px;
}

.bet-icon {
  width: 14px;
  height: 14px;
}

.rank-score {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  margin-top: 2px;
}

.score-value {
  font-size: 14px;
  font-weight: bold;
  color: #e65c00;
}

.score-icon {
  width: 16px;
  height: 16px;
}

/* Loading */
.ranking-loading {
  padding: 10px;
}

.rank-skeleton {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.skeleton-medal {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f0f0f0;
  margin-right: 8px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-name {
  width: 80px;
  height: 14px;
  background: #f0f0f0;
  border-radius: 2px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-bet {
  width: 60px;
  height: 12px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-top: 6px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-score {
  width: 70px;
  height: 14px;
  background: #f0f0f0;
  border-radius: 2px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.ranking-empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}
</style>
