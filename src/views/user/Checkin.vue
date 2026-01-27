<script setup lang="ts">
import {ref, computed, onMounted, watch} from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import {signStat, signIn, signDates} from '@/api/customer'
import SignIntro from './components/SignIntro.vue'
import SignMember from './components/SignMember.vue'
import SignRecord from './components/SignRecord.vue'
import type {SignInStatisticsField} from "@/types/customer.type.ts";
import {useToast} from "@/composables/useToast.ts";

const toast = useToast()
// 签到统计
const stat = ref<SignInStatisticsField>()
// 当前天
const currentDate = ref(new Date())
// 当前月份
const currentMonth = computed(() => currentDate.value.getMonth() + 1)
// 当前年份
const currentYear = computed(() => currentDate.value.getFullYear())

// 已签到的日期
const signedDates = ref<number[]>([])

// 当天的日期
const todayDate = new Date().getDate()

// 生成日历数据
const calendarDays = computed(() => {
  const days: (number | null)[] = []
  // 获取当月第一天是星期几
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1).getDay()
  // 获取当月天数
  const totalDays = new Date(currentYear.value, currentMonth.value, 0).getDate()

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
// 切换年份
const prevYear = () => {
  const d = new Date(currentDate.value)
  d.setFullYear(d.getFullYear() - 1)
  currentDate.value = d
}
const nextYear = () => {
  const d = new Date(currentDate.value)
  d.setFullYear(d.getFullYear() + 1)
  currentDate.value = d
}

// 签到
const handleSignIn = async () => {
  try {
    const res = await signIn()
    if (res.code === 200) {
      signedDates.value.push(todayDate)
      toast.success('签到成功')
      // 刷新统计
      const {data, code} = await signStat()
      if (code === 200 && data) {
        stat.value = data
      }
    } else {
      toast.error(res.message)
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '签到失败';
    console.error('Sign in error:', error)
    toast.error(msg)
  }
}

// 指定天是否已签到
const isSigned = (day: number | null) => {
  if (!day) return false
  return signedDates.value.includes(day)
}

// 是否当前天
const isToday = (day: number | null) => {
  if (!day) return false
  const now = new Date()
  return day === now.getDate() &&
    currentMonth.value === now.getMonth() + 1 &&
    currentYear.value === now.getFullYear()
}

// 获取已签到日期
const fetchSignedDates = async () => {
  const y = currentYear.value;
  const m = currentMonth.value.toString().padStart(2, '0');
  try {
    const {code, data} = await signDates(`${y}-${m}`);
    if (code === 200 && data) {
      signedDates.value = data.map(item => new Date(item).getDate());
    } else {
      signedDates.value = [];
    }
  } catch (error) {
    console.error('Fetch signed dates error:', error);
    signedDates.value = [];
  }
}
// 监听月份变化
watch(currentDate, () => {
  void fetchSignedDates();
})

onMounted(async () => {
  try {
    const {data, code} = await signStat()
    if (code === 200 && data) {
      stat.value = data
    }
    await fetchSignedDates();
  } catch (error) {
    console.error('Failed to load sign stats:', error)
  }
})

const activeTab = ref('sign')
const tabs = [
  {key: 'sign', name: '签到'},
  {key: 'record', name: '签到记录'}
]
const switchTab = (key: string) => {
  activeTab.value = key
}
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          :class="['w-20 text-center text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 ', { 'text-[#ff6600] border-b-[#ff6600]': activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          {{ tab.name }}
        </span>
      </div>

      <div v-if="activeTab === 'sign'">
        <!-- 签到统计 -->
        <div class="flex justify-around items-center gap-[30px]">
          <div class="text-center text-[13px] text-[#666]">
            连续签到
            <span class="font-bold text-[#ff6600]">{{ stat?.continue_days || 0 }}</span>
            天，累计签到
            <span class="font-bold text-[#ff6600]">{{ stat?.total_days || 0 }}</span>
            天
          </div>

          <div class="flex">
            <div class="flex items-center gap-2.5">
              <span class="text-[15px] font-medium text-[#333333]">今日签到:</span>
              <span class="text-base font-bold text-[#ff6600]">{{stat?.total_people}}</span>
              人
            </div>
            <div class="flex items-center gap-2.5">
              <span class="text-[15px] font-medium text-[#333333]">累计送出:</span>
              <span class="text-base font-bold text-[#ff6600]">{{stat?.total_points}}</span>
              金豆
              <span class="text-base font-bold text-[#ff6600]">{{stat?.total_base_coin}}</span>
              积分
            </div>
          </div>
        </div>
        <!-- 主内容区 -->
        <div class="flex justify-between">
          <div class="w-5/12">
            <div class="mb-[15px] flex items-center justify-center gap-1">
              <button
                class="cursor-pointer bg-transparent px-1 py-2 text-[16px] text-[#666] hover:text-[#ff6600]"
                @click="prevYear"
              >&lt;&lt;</button>
              <button
                class="cursor-pointer bg-transparent px-1 py-2 text-[16px] text-[#666] hover:text-[#ff6600]"
                @click="prevMonth"
              >&lt;</button>

              <span class="text-[16px] font-bold text-[#333]">
              {{ currentYear }}年 {{ currentMonth }}月
            </span>

              <button
                class="cursor-pointer bg-transparent px-1 py-2 text-[16px] text-[#666] hover:text-[#ff6600]"
                @click="nextMonth"
              >&gt;</button>
              <button
                class="cursor-pointer bg-transparent px-1 py-2 text-[16px] text-[#666] hover:text-[#ff6600]"
                @click="nextYear"
              >&gt;&gt;</button>
            </div>
            <div class="mb-[10px] grid grid-cols-7 text-center">
              <span class="p-2 text-[13px] text-[#999]">日</span>
              <span class="p-2 text-[13px] text-[#999]">一</span>
              <span class="p-2 text-[13px] text-[#999]">二</span>
              <span class="p-2 text-[13px] text-[#999]">三</span>
              <span class="p-2 text-[13px] text-[#999]">四</span>
              <span class="p-2 text-[13px] text-[#999]">五</span>
              <span class="p-2 text-[13px] text-[#999]">六</span>
            </div>

            <!-- days -->
            <div class="grid grid-cols-7 gap-1">
            <span
              v-for="(day, index) in calendarDays"
              :key="index"
              class="aspect-square flex items-center justify-center rounded text-[14px] text-[#333]"
              :class="[
                !day ? 'cursor-default' : 'cursor-pointer',
                day && isSigned(day) ? 'bg-[#ff6600] text-white' : '',
                day && isToday(day) ? 'border-2 border-[#ff6600]' : ''
              ]"
            >
              {{ day || '' }}
            </span>
            </div>

            <!-- action -->
            <div class="my-5 text-center">
              <button
                :disabled="stat?.is_sign"
                class="cursor-pointer rounded bg-gradient-to-br  px-[50px] py-3 text-[16px] text-white hover:opacity-90"
                :class="[stat?.is_sign ? 'from-[#cccccc] to-[#cccccc]' : 'from-[#ff6600] to-[#ff8533]']"
                @click="handleSignIn"
              >
                {{stat?.is_sign ? '已签到' : '立即签到'}}
              </button>
            </div>
          </div>

          <!-- 近期签到用户 -->
          <div class="w-6/12">
            <div class="text-center text-[16px] font-bold text-[#333] mb-[15px] py-2">近期签到用户</div>
            <SignMember />
          </div>
        </div>
        <!-- 签到说明 -->
        <div class="bg-white">
          <SignIntro />
        </div>
      </div>

      <div v-if="activeTab === 'record'">
        <SignRecord />
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
