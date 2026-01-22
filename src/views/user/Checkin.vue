<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { signStat, signIn, signRecords } from '@/api/customer'

// 签到统计
const stats = ref({
  todayCount: 184,
  totalAmount: 4118.85,
  consecutiveDays: 22,
  currentReward: 10
})

// 当前月份
const currentDate = ref(new Date())
const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth() + 1)

// 已签到的日期
const signedDates = ref<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19])
const todayDate = new Date().getDate()

// 近期签到用户
const recentUsers = ref([
  { user: 'sg48182', reward: 60, amount: 20, time: '8分钟前' },
  { user: 'sgdjhjdjhx', reward: 140, amount: 70, time: '7分钟前' },
  { user: 'sg48805', reward: 175, amount: 20, time: '12分钟前' },
  { user: 'sg45899', reward: 10, amount: 2, time: '12分钟前' },
  { user: 'sg45640', reward: 200, amount: 10, time: '13分钟前' },
  { user: 'syedjzei', reward: 150, amount: 5, time: '14分钟前' },
  { user: 'sg45596', reward: 700, amount: 35, time: '14分钟前' },
  { user: 'sq2888888', reward: 400, amount: 5, time: '16分钟前' },
  { user: 'sq48783', reward: 3, amount: 2, time: '17分钟前' },
  { user: 'sq48044', reward: 420, amount: 140, time: '18分钟前' },
])

// 获取当月天数
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate()
}

// 获取当月第一天是星期几
const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month - 1, 1).getDay()
}

// 生成日历数据
const calendarDays = computed(() => {
  const days: (number | null)[] = []
  const firstDay = getFirstDayOfMonth(currentYear.value, currentMonth.value)
  const totalDays = getDaysInMonth(currentYear.value, currentMonth.value)

  // 填充空白
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // 填充日期
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }

  return days
})

// 切换月份
const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 2, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value, 1)
}

// 签到
const handleSignIn = async () => {
  try {
    const res = await signIn()
    if (res.code === 200) {
      signedDates.value.push(todayDate)
      alert('签到成功！')
    } else {
      alert(res.message || '签到失败')
    }
  } catch (error) {
    console.error('Sign in error:', error)
    // 模拟签到成功
    if (!signedDates.value.includes(todayDate)) {
      signedDates.value.push(todayDate)
      alert('签到成功！')
    }
  }
}

// 是否已签到
const isSigned = (day: number | null) => {
  if (!day) return false
  return signedDates.value.includes(day)
}

const isToday = (day: number | null) => {
  if (!day) return false
  const now = new Date()
  return day === now.getDate() &&
         currentMonth.value === now.getMonth() + 1 &&
         currentYear.value === now.getFullYear()
}

onMounted(async () => {
  try {
    const res = await signStat()
    if (res.code === 200 && res.data) {
      stats.value = {
        todayCount: res.data.total_people || stats.value.todayCount,
        totalAmount: res.data.total_points || stats.value.totalAmount,
        consecutiveDays: res.data.continue_days || stats.value.consecutiveDays,
        currentReward: stats.value.currentReward
      }
    }
  } catch (error) {
    console.error('Failed to load sign stats:', error)
  }
})
</script>

<template>
  <UserLayout>
    <div class="checkin-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">签到</span>
      </div>

      <!-- 签到统计 -->
      <div class="checkin-stats">
        今日签到 <span class="highlight">{{ stats.todayCount }}</span> 人，
        累计送出 <span class="highlight">{{ stats.totalAmount }}</span> 元
        <span class="wait-text">等待返现</span>
      </div>

      <!-- 主内容区 -->
      <div class="checkin-content">
        <!-- 左侧日历 -->
        <div class="calendar-section">
          <div class="calendar-header">
            <button class="nav-btn" @click="prevMonth">&lt;</button>
            <span class="month-title">{{ currentYear }}年 {{ currentMonth }}月</span>
            <button class="nav-btn" @click="nextMonth">&gt;</button>
          </div>
          <div class="calendar-weekdays">
            <span>日</span>
            <span>一</span>
            <span>二</span>
            <span>三</span>
            <span>四</span>
            <span>五</span>
            <span>六</span>
          </div>
          <div class="calendar-days">
            <span
              v-for="(day, index) in calendarDays"
              :key="index"
              :class="['day', {
                empty: !day,
                signed: isSigned(day),
                today: isToday(day)
              }]"
            >
              {{ day || '' }}
            </span>
          </div>
          <div class="calendar-action">
            <button class="btn-signin" @click="handleSignIn">立即签到</button>
          </div>
          <div class="consecutive-info">
            连续签到 <span class="days">{{ stats.consecutiveDays }}</span> 天，累计签到 <span class="days">{{ stats.consecutiveDays }}</span> 天
          </div>
        </div>

        <!-- 右侧近期签到用户 -->
        <div class="recent-section">
          <div class="recent-header">近期签到用户</div>
          <div class="recent-table">
            <div class="table-header">
              <span>会员</span>
              <span>签到积分</span>
              <span>获得奖励</span>
            </div>
            <div class="table-body">
              <div v-for="user in recentUsers" :key="user.user" class="table-row">
                <span class="user">{{ user.user }}</span>
                <span class="reward">{{ user.reward }}</span>
                <span class="amount">{{ user.amount }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 签到说明 -->
      <div class="checkin-rules">
        <div class="rules-header">签到说明</div>
        <div class="rules-content">
          <p>签到13周起，签到积累达7天及以上且昨夜投注10元以上即可每日8元，签到积累多每日8元。</p>
          <div class="rules-progress">
            <div class="progress-item">
              <span class="icon">✓</span>
              <span>签到1次获用赠额的 0.5 %,连续签到天数</span>
            </div>
            <div class="progress-bar">
              <span class="bar active"></span>
              <span class="bar active"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </div>
            <div class="progress-label">10 *连续签到天数</div>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.checkin-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-tabs {
  display: flex;
  border-bottom: 2px solid #ff6600;
}

.page-tabs .tab {
  font-size: 14px;
  color: #ff6600;
  padding: 10px 20px;
  background: #fff8f0;
  border: 1px solid #ff6600;
  border-bottom: none;
  margin-bottom: -2px;
}

.checkin-stats {
  font-size: 14px;
  color: #666;
  padding: 10px 0;
}

.checkin-stats .highlight {
  color: #ff6600;
  font-weight: bold;
}

.checkin-stats .wait-text {
  color: #999;
  margin-left: 10px;
}

.checkin-content {
  display: flex;
  gap: 30px;
}

/* 日历 */
.calendar-section {
  flex: 1;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.nav-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 10px;
}

.nav-btn:hover {
  color: #ff6600;
}

.month-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 10px;
}

.calendar-weekdays span {
  padding: 8px;
  font-size: 13px;
  color: #999;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
}

.calendar-days .day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #333;
  border-radius: 4px;
  cursor: pointer;
}

.calendar-days .day.empty {
  cursor: default;
}

.calendar-days .day.signed {
  background: #ff6600;
  color: #fff;
}

.calendar-days .day.today {
  border: 2px solid #ff6600;
}

.calendar-action {
  text-align: center;
  margin: 20px 0;
}

.btn-signin {
  padding: 12px 50px;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.btn-signin:hover {
  opacity: 0.9;
}

.consecutive-info {
  text-align: center;
  font-size: 13px;
  color: #666;
}

.consecutive-info .days {
  color: #ff6600;
  font-weight: bold;
}

/* 近期签到用户 */
.recent-section {
  width: 300px;
}

.recent-header {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.recent-table {
  margin-top: 10px;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 8px 0;
  font-size: 12px;
  color: #999;
  border-bottom: 1px solid #f0f0f0;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 8px 0;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}

.table-row .user {
  color: #666;
}

.table-row .reward {
  color: #ff6600;
}

.table-row .amount {
  color: #52c41a;
}

/* 签到说明 */
.checkin-rules {
  background: #fff8f0;
  border-radius: 4px;
  overflow: hidden;
}

.rules-header {
  background: #ff6600;
  color: #fff;
  padding: 10px 15px;
  font-size: 14px;
}

.rules-content {
  padding: 15px;
}

.rules-content p {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin: 0 0 15px 0;
}

.rules-progress {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
}

.progress-item .icon {
  color: #52c41a;
}

.progress-bar {
  display: flex;
  gap: 3px;
}

.progress-bar .bar {
  width: 20px;
  height: 8px;
  background: #ddd;
  border-radius: 2px;
}

.progress-bar .bar.active {
  background: #ff6600;
}

.progress-label {
  font-size: 12px;
  color: #999;
}
</style>
