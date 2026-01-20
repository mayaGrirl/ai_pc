<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import UserLayout from '@/components/layout/UserLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const customer = computed(() => authStore.currentCustomer)

// User info
const userInfo = ref({
  todayRank: '500以外',
  memberCard: '普通会员',
  weekSalary: 0,
  signedCount: 1200,
  lastLoginAddress: '浙江省杭州市',
  lastLoginTime: '2024年01月15日 14点30分25秒'
})

// Daily first deposit rebate
const firstDepositRebate = ref({
  todayDeposit: 0,
  effectiveFlow: 0,
  levels: [
    { multiple: 8, percent: 3, remaining: 0 },
    { multiple: 15, percent: 6, remaining: 0 },
    { multiple: 23, percent: 10, remaining: 0 }
  ]
})

// Daily loss rebate
const lossRebate = ref({
  yesterdayLoss: 0,
  levels: [
    { multiple: 4, percent: 2, remaining: 0 },
    { multiple: 8, percent: 3, remaining: 0 },
    { multiple: 15, percent: 4, remaining: 0 },
    { multiple: 20, percent: 5, remaining: 0 }
  ]
})

// Beginner tasks
const beginnerTasks = ref([
  { name: '绑定邮箱', desc: '邮箱用于找回密码、领取救济金等，应尽快设置', completed: false, action: '马上绑定', path: '/user/profile' },
  { name: '密码保护', desc: '用于验证你的身份，保护账户安全', completed: false, action: '马上设置', path: '/user/security' },
  { name: '手机认证', desc: '用于验证你的身份，保护账户安全', completed: true, action: '已认证', path: '/user/verify' },
  { name: '完善支付宝账号', desc: '更好的核实身份，保护账户安全', completed: false, action: '马上设置', path: '/user/profile' },
  { name: '完善QQ号', desc: '更好的核实身份，保护账户安全', completed: false, action: '马上设置', path: '/user/profile' },
  { name: '二级密码', desc: '设置二级密码，为了保障您的资金安全，建议定期修改二级密码！', completed: false, action: '设置', path: '/user/security' }
])

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const navigateTo = (path: string) => {
  router.push(path)
}

const calculateProgress = (current: number, target: number) => {
  if (target <= 0) return 0
  const percent = (current / target) * 100
  return percent > 100 ? 100 : percent
}
</script>

<template>
  <UserLayout>
    <!-- User Other Info -->
    <div class="common userdata otherinfo-box">
      <ul class="otherinfo">
        <li>
          <div>今日排名：<span>{{ userInfo.todayRank }}</span></div>
        </li>
        <li>
          <div>会员卡：<span>{{ userInfo.memberCard }}</span></div>
        </li>
        <li>
          <div>本周工资：<span class="coin">{{ formatNumber(userInfo.weekSalary) }}</span>
            <a href="javascript:void(0)" @click="navigateTo('/user/salary')">查看明细</a>
            <a href="javascript:void(0)" @click="navigateTo('/user/salary')">领取工资</a>
          </div>
        </li>
        <li>
          <div class="signwrap">今日已签到 <span class="num">{{ userInfo.signedCount }}</span> 人
            <a href="javascript:void(0)" @click="navigateTo('/user/checkin')" class="signbtn">立即签到</a>
          </div>
        </li>
        <li>
          <div class="logs">
            <span>上次登录地：{{ userInfo.lastLoginAddress }}</span>
            <span>{{ userInfo.lastLoginTime }}</span>
          </div>
        </li>
      </ul>
    </div>

    <!-- First Deposit Rebate -->
    <div class="layui-card common inpourfanliwrap">
      <div class="layui-card-header">
        <div class="floatright">今日首充 <span class="coin">{{ formatNumber(firstDepositRebate.todayDeposit) }}</span> &nbsp;&nbsp;
          <a href="javascript:void(0)" @click="navigateTo('/user/rebate')" class="btn danger">查看返利</a>
        </div>
        每日首充返利
      </div>
      <div class="layui-card-body">
        <table class="tasklist">
          <tr v-for="(level, index) in firstDepositRebate.levels" :key="index">
            <th class="black">有效流水达到今日首充的<strong><span>{{ level.multiple }}</span>倍</strong>，可领取首充的<strong><span>{{ level.percent }}</span>%</strong></th>
            <td width="160">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: calculateProgress(firstDepositRebate.effectiveFlow, firstDepositRebate.todayDeposit * level.multiple) + '%' }"></div>
              </div>
            </td>
            <td width="120" align="right">
              <div>还差 <span class="coin">{{ formatNumber(level.remaining) }}</span></div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Daily Loss Rebate -->
    <div class="layui-card common daylosefanliwrap">
      <div class="layui-card-header">
        <div class="floatright">
          昨日亏损 <span class="coin">{{ formatNumber(lossRebate.yesterdayLoss) }}</span>
        </div>
        每日亏损返利
      </div>
      <div class="layui-card-body">
        <table class="tasklist">
          <tr v-for="(level, index) in lossRebate.levels" :key="index">
            <th class="black">有效流水达到今日亏损的<strong><span>{{ level.multiple }}</span>倍</strong>，可领取日亏损额的<strong><span>{{ level.percent }}</span>%</strong></th>
            <td width="160">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: '0%' }"></div>
              </div>
            </td>
            <td width="120" align="right">
              <div>还差 <span class="coin">{{ formatNumber(level.remaining) }}</span></div>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <!-- Beginner Tasks -->
    <div class="layui-card common beginner-tasks">
      <div class="layui-card-header">新手任务</div>
      <div class="layui-card-body">
        <table class="tasklist">
          <tr v-for="(task, index) in beginnerTasks" :key="index">
            <th :class="{ pass: task.completed }">
              <span :class="task.completed ? 'icon-pass' : 'icon-wrong'">{{ task.completed ? '✓' : '✗' }}</span>
              {{ task.name }}
            </th>
            <td>{{ task.desc }}</td>
            <td width="70">
              <a v-if="!task.completed" href="javascript:void(0)" @click="navigateTo(task.path)">{{ task.action }}</a>
              <span v-else>{{ task.action }}</span>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
/* Other Info Box */
.otherinfo-box {
  border: 1px solid #d4d2d5;
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.otherinfo {
  list-style: none;
  padding: 0;
  margin: 0;
}

.otherinfo li {
  padding: 8px 0;
  border-bottom: 1px dashed #e8e8e8;
  font-size: 13px;
  color: #666;
}

.otherinfo li:last-child {
  border-bottom: none;
}

.otherinfo li span {
  color: #333;
}

.otherinfo li .coin {
  color: #f03736;
  font-weight: bold;
}

.otherinfo li a {
  color: #f03736;
  margin-left: 10px;
  text-decoration: none;
}

.otherinfo li a:hover {
  text-decoration: underline;
}

.otherinfo .num {
  color: #f03736;
  font-weight: bold;
}

.otherinfo .signbtn {
  display: inline-block;
  padding: 2px 10px;
  background: #f03736;
  color: #fff;
  border-radius: 3px;
  margin-left: 10px;
  font-size: 12px;
}

.otherinfo .logs span {
  display: inline-block;
  margin-right: 20px;
  color: #999;
}

/* Card Styles */
.layui-card {
  border: 1px solid #d4d2d5;
  background: #fff;
  margin-bottom: 10px;
}

.layui-card-header {
  padding: 12px 15px;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
  font-weight: bold;
  color: #333;
  background: #fafafa;
}

.layui-card-header .floatright {
  float: right;
  font-size: 13px;
  font-weight: normal;
}

.layui-card-header .floatright .coin {
  color: #f03736;
  font-weight: bold;
}

.layui-card-header .floatright .btn.danger {
  display: inline-block;
  padding: 2px 10px;
  background: #f03736;
  color: #fff;
  border-radius: 3px;
  font-size: 12px;
  text-decoration: none;
}

.layui-card-body {
  padding: 15px;
}

/* Task Table */
.tasklist {
  width: 100%;
  border-collapse: collapse;
}

.tasklist tr {
  border-bottom: 1px solid #f0f0f0;
}

.tasklist tr:last-child {
  border-bottom: none;
}

.tasklist th {
  text-align: left;
  padding: 12px 0;
  font-weight: normal;
  color: #666;
  font-size: 13px;
}

.tasklist th.black {
  color: #333;
}

.tasklist th.pass {
  color: #52c41a;
}

.tasklist th strong span {
  color: #f03736;
}

.tasklist th .icon-pass {
  color: #52c41a;
  margin-right: 8px;
}

.tasklist th .icon-wrong {
  color: #ff4d4f;
  margin-right: 8px;
}

.tasklist td {
  padding: 12px 0;
  font-size: 13px;
  color: #999;
}

.tasklist td a {
  color: #f03736;
  text-decoration: none;
}

.tasklist td a:hover {
  text-decoration: underline;
}

.tasklist td .coin {
  color: #f03736;
  font-weight: bold;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffb347 0%, #ff6600 100%);
  border-radius: 4px;
  transition: width 0.3s;
}
</style>
