<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import UserLayout from '@/components/layout/UserLayout.vue'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const customer = computed(() => authStore.currentCustomer)

// 每日登录奖励
const dailyRewards = ref([
  { day: 1, points: 100, claimed: true },
  { day: 2, points: 150, claimed: true },
  { day: 3, points: 200, claimed: false },
  { day: 4, points: 250, claimed: false },
  { day: 5, points: 300, claimed: false },
  { day: 6, points: 400, claimed: false },
  { day: 7, points: 500, claimed: false }
])

// 每日可领奖励
const dailyTasks = ref([
  { name: '每日登录礼包最高1000奖励', available: true, claimed: false },
  { name: '有效投注达2倍存款额可领奖励50%', available: true, claimed: false },
  { name: '有效投注达3倍存款额可领奖励70%', available: false, claimed: false },
  { name: '有效投注达5倍存款额可领奖励100%', available: false, claimed: false }
])

// 每日亏损料
const dailyLossTasks = ref([
  { name: '有效投注达2万可领亏损额5%奖励', available: true, claimed: false },
  { name: '有效投注达4万可领亏损额7%奖励', available: false, claimed: false },
  { name: '有效投注达10万可领亏损额10%奖励', available: false, claimed: false }
])

// 新手任务
const newbieTasks = ref([
  { name: '绑定银行卡', completed: true, reward: 50 },
  { name: '完成手机认证', completed: true, reward: 100 },
  { name: '完成首次充值', completed: false, reward: 200 },
  { name: '完成首次投注', completed: false, reward: 150 }
])

// 今日邀请统计
const inviteStats = ref({
  today: 0,
  total: 0,
  pending: 0
})

onMounted(() => {
  // 加载用户数据
})
</script>

<template>
  <UserLayout>
    <div class="user-dashboard">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">我的账户</span>
      </div>

      <!-- 今日邀请统计 -->
      <div class="invite-stats">
        <div class="stat-box">
          <span class="stat-value">{{ inviteStats.today }}</span>
          <span class="stat-label">今日邀请</span>
        </div>
        <div class="stat-box">
          <span class="stat-value">{{ inviteStats.total }}</span>
          <span class="stat-label">累计邀请</span>
        </div>
        <div class="stat-box">
          <span class="stat-value">{{ inviteStats.pending }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>

      <!-- 今日注册信息 -->
      <div class="info-notice">
        <span class="notice-icon">💡</span>
        <span>今日注册: {{ customer?.mobile }} | 推荐链接: df.28.co/u/{{ customer?.id }} | 40天累计: 156人</span>
      </div>

      <!-- 每日登录奖励 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">每日登录奖励</span>
        </div>
        <div class="daily-rewards">
          <div
            v-for="reward in dailyRewards"
            :key="reward.day"
            :class="['reward-item', { claimed: reward.claimed }]"
          >
            <div class="reward-day">第{{ reward.day }}天</div>
            <div class="reward-points">+{{ reward.points }}</div>
            <div class="reward-status">{{ reward.claimed ? '已领取' : '待领取' }}</div>
          </div>
        </div>
      </div>

      <!-- 每日可领奖励 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">每日可领奖励</span>
          <span class="section-extra">去完成/领取</span>
        </div>
        <ul class="task-list">
          <li v-for="(task, index) in dailyTasks" :key="index" class="task-item">
            <span class="task-icon">{{ task.available ? '✅' : '⏳' }}</span>
            <span class="task-name">{{ task.name }}</span>
            <button
              :class="['btn-claim', { available: task.available && !task.claimed }]"
              :disabled="!task.available || task.claimed"
            >
              {{ task.claimed ? '已领取' : (task.available ? '立即领取' : '未达成') }}
            </button>
          </li>
        </ul>
      </div>

      <!-- 每日亏损料 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">每日亏损料</span>
          <span class="section-extra">去完成/领取</span>
        </div>
        <ul class="task-list">
          <li v-for="(task, index) in dailyLossTasks" :key="index" class="task-item">
            <span class="task-icon">{{ task.available ? '✅' : '⏳' }}</span>
            <span class="task-name">{{ task.name }}</span>
            <button
              :class="['btn-claim', { available: task.available && !task.claimed }]"
              :disabled="!task.available || task.claimed"
            >
              {{ task.claimed ? '已领取' : (task.available ? '立即领取' : '未达成') }}
            </button>
          </li>
        </ul>
      </div>

      <!-- 新手任务 -->
      <div class="section-card">
        <div class="section-header">
          <span class="section-title">新手任务</span>
        </div>
        <ul class="task-list newbie">
          <li v-for="(task, index) in newbieTasks" :key="index" class="task-item">
            <span :class="['task-checkbox', { checked: task.completed }]">
              {{ task.completed ? '✓' : '' }}
            </span>
            <span class="task-name">{{ task.name }}</span>
            <span class="task-reward">+{{ task.reward }}豆豆</span>
            <span :class="['task-status', { completed: task.completed }]">
              {{ task.completed ? '已完成' : '去完成' }}
            </span>
          </li>
        </ul>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.user-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-tabs {
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.page-tabs .tab {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  padding-bottom: 12px;
  border-bottom: 2px solid transparent;
  margin-bottom: -16px;
}

.page-tabs .tab.active {
  color: #ff6600;
  border-bottom-color: #ff6600;
}

/* 邀请统计 */
.invite-stats {
  display: flex;
  gap: 20px;
}

.stat-box {
  flex: 1;
  background: #fff8f0;
  border: 1px solid #ffe4cc;
  border-radius: 4px;
  padding: 15px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #ff6600;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

/* 信息通知 */
.info-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  padding: 10px 15px;
  font-size: 12px;
  color: #1890ff;
}

.notice-icon {
  font-size: 16px;
}

/* 区块卡片 */
.section-card {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.section-extra {
  font-size: 12px;
  color: #ff6600;
  cursor: pointer;
}

/* 每日奖励 */
.daily-rewards {
  display: flex;
  padding: 15px;
  gap: 10px;
}

.reward-item {
  flex: 1;
  text-align: center;
  padding: 12px 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  transition: all 0.3s;
}

.reward-item.claimed {
  background: #f0f0f0;
  opacity: 0.7;
}

.reward-day {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.reward-points {
  font-size: 16px;
  font-weight: bold;
  color: #ff6600;
  margin-bottom: 5px;
}

.reward-status {
  font-size: 11px;
  color: #999;
}

/* 任务列表 */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #f5f5f5;
}

.task-item:last-child {
  border-bottom: none;
}

.task-icon {
  margin-right: 10px;
  font-size: 14px;
}

.task-name {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.btn-claim {
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #fff;
  color: #999;
  cursor: not-allowed;
}

.btn-claim.available {
  background: #ff6600;
  border-color: #ff6600;
  color: #fff;
  cursor: pointer;
}

.btn-claim.available:hover {
  opacity: 0.9;
}

/* 新手任务 */
.task-list.newbie .task-item {
  gap: 10px;
}

.task-checkbox {
  width: 18px;
  height: 18px;
  border: 1px solid #ddd;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #fff;
}

.task-checkbox.checked {
  background: #52c41a;
  border-color: #52c41a;
}

.task-reward {
  font-size: 12px;
  color: #ff6600;
}

.task-status {
  font-size: 12px;
  color: #ff6600;
  cursor: pointer;
}

.task-status.completed {
  color: #52c41a;
  cursor: default;
}
</style>
