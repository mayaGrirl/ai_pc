<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = computed(() => authStore.isLogin)
const customer = computed(() => authStore.currentCustomer)

// Game count digits - start from 0, animate to target
const gameCountDigits = ref(['0', '0', '0', '0', '0', '0'])
const targetNumber = 324816

// 领救济弹窗
const showWelfareModal = ref(false)
const verifyCode = ref('')

// 救济金数据
const welfareList = ref([
  { level: 0, coins: 50, condition: '余额少于50，每日可领取10次', remaining: '-' },
  { level: 1, coins: 60, condition: '余额少于60，每日可领取10次', remaining: '-' },
  { level: 2, coins: 70, condition: '余额少于70，每日可领取10次', remaining: '10次' },
  { level: 3, coins: 100, condition: '余额少于100，每日可领取10次', remaining: '-' },
  { level: 4, coins: 120, condition: '余额少于120，每日可领取10次', remaining: '-' },
  { level: 5, coins: 150, condition: '余额少于150，每日可领取10次', remaining: '-' },
  { level: 6, coins: 200, condition: '余额少于200，每日可领取10次', remaining: '-' },
  { level: 7, coins: 300, condition: '余额少于300，每日可领取10次', remaining: '-' },
  { level: 8, coins: 500, condition: '余额少于500，每日可领取10次', remaining: '-' },
  { level: 9, coins: 500, condition: '余额少于500，每日可领取10次', remaining: '-' },
  { level: 10, coins: 500, condition: '余额少于500，每日可领取10次', remaining: '-' }
])

const openWelfareModal = () => {
  showWelfareModal.value = true
}

const closeWelfareModal = () => {
  showWelfareModal.value = false
}

const refreshVerifyCode = () => {
  // 刷新验证码
  alert('刷新验证码')
}

const claimWelfare = () => {
  if (!verifyCode.value) {
    alert('请输入验证码')
    return
  }
  alert('领取救济金功能开发中')
}

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
  <div class="jt">
    <!-- Top Bar -->
    <div class="jt_top">
      <div class="jt_top_nei">
        <div class="left">
          <template v-if="isLogin">
            <p>{{ customer?.nickname || '_sg' + customer?.id }} ID：<router-link to="/user"><span style="color:#ff3a3a;">{{ customer?.id }}</span></router-link></p>
            <dd><a href="javascript:void(0)" @click="handleLogout" style="color: #aeaeae;">[退出]</a></dd>
            <dd>|</dd>
            <dd><router-link style="color:#333;" to="/user/detail">余额：<b>{{ formatNumber(customer?.points || 0) }}</b></router-link></dd>
            <dd>|</dd>
            <dd><a href="javascript:void(0)" @click="authStore.fetchCurrentCustomer()">[刷新]</a></dd>
          </template>
          <template v-else>
            <p>您好，欢迎来鼎丰!</p>
            <dd><router-link to="/login">登录</router-link></dd>
            <dd>|</dd>
            <dd><router-link to="/register">注册</router-link></dd>
          </template>
        </div>
        <div class="right">
          <ul>
            <li class="phone">
              <a href="javascript:void(0)"><img src="/phone.png" class="phone-icon"> 手机版</a>
            </li>
            <li>|</li>
            <li><a href="/network">网络检测</a></li>
            <li>|</li>
            <li><a href="javascript:void(0)" @click="openWelfareModal">领救济</a></li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 领救济弹窗 -->
    <div v-if="showWelfareModal" class="welfare-modal-overlay" @click.self="closeWelfareModal">
      <div class="welfare-modal">
        <div class="welfare-modal-close" @click="closeWelfareModal">×</div>
        <div class="welfare-modal-content">
          <table class="welfare-table">
            <thead>
              <tr>
                <th>等级</th>
                <th>可领取金币</th>
                <th>条件</th>
                <th>剩余次数</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in welfareList" :key="item.level">
                <td><img :src="`/skin/pc/wm/images/level/${item.level}.png`" width="25" /></td>
                <td class="coins">{{ item.coins }} <img src="/skin/pc/wm/images/coin.png" width="16" class="coin-img" /></td>
                <td class="condition">{{ item.condition }}</td>
                <td>{{ item.remaining }}</td>
              </tr>
            </tbody>
          </table>
          <div class="welfare-form">
            <div class="verify-input">
              <span>验证码</span>
              <input type="text" v-model="verifyCode" placeholder="" />
              <a href="javascript:void(0)" @click="refreshVerifyCode" class="refresh-code">换一张</a>
            </div>
            <button class="claim-btn" @click="claimWelfare">立即领取</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation -->
    <div class="jt_end jt_end_box">
      <router-link class="logos" to="/">
        <img src="/n_logo.png" height="63" alt="Logo">
      </router-link>

      <!-- Game Counter -->
      <div class="pcdd_number">
        <div class="header_xnkl">
          <b>累计游戏人次</b>
        </div>
        <ul id="ulTotalBuy">
          <li class="pcdd_num">{{ gameCountDigits[0] }}</li>
          <li class="pcdd_nobor">,</li>
          <li class="pcdd_num">{{ gameCountDigits[1] }}</li>
          <li class="pcdd_num">{{ gameCountDigits[2] }}</li>
          <li class="pcdd_num">{{ gameCountDigits[3] }}</li>
          <li class="pcdd_nobor">,</li>
          <li class="pcdd_num">{{ gameCountDigits[4] }}</li>
          <li class="pcdd_num">{{ gameCountDigits[5] }}</li>
          <li class="pcdd_num">0</li>
        </ul>
      </div>

      <!-- Navigation Menu -->
      <ul class="jt_nav">
        <li v-for="item in navItems" :key="item.path">
          <template v-if="item.external">
            <a :href="item.path" target="_blank">{{ item.name }}</a>
          </template>
          <template v-else>
            <router-link :to="item.path" :class="{ list: isActive(item.path) }">{{ item.name }}</router-link>
          </template>
          <w v-if="item.badge" class="ico-num">{{ item.badge }}<em></em></w>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
/* Reset */
body, div, ul, ol, li, form, input, textarea, p {
  margin: 0;
  padding: 0;
}

dl, dt, dd, ul, li, p, h1, img, form {
  list-style: none;
  border: none;
}

ul {
  list-style-type: none;
}

a {
  color: #666;
  text-decoration: none;
}

/* Header Container */
.jt {
  width: 100%;
  height: auto;
  border-bottom: 3px solid #dfdfdf;
  background-color: #ffffff;
}

/* Top Bar */
.jt .jt_top {
  width: 100%;
  height: 31px;
  border-bottom: 1px solid #f2f1f1;
  font-size: 12px;
  background: #fafafa;
}

.jt .jt_top .jt_top_nei {
  width: 1200px;
  height: 31px;
  line-height: 31px;
  margin: 0 auto;
}

.jt .jt_top .jt_top_nei .left {
  float: right;
  display: inline-block;
}

.jt .jt_top .jt_top_nei .left p,
.jt .jt_top .jt_top_nei .left dd {
  float: left;
  display: inline-block;
}

.jt .jt_top .jt_top_nei .left p {
  margin-right: 10px;
  color: #666;
}

.jt .jt_top .jt_top_nei .left dd {
  margin: auto 2px;
  color: #d3ccd3;
}

.jt .jt_top .jt_top_nei .left dd a:hover {
  color: #f03736;
}

.jt .jt_top .jt_top_nei .left dd b {
  color: #f03736;
}

.jt .jt_top .jt_top_nei .right {
  float: left;
}

.jt .jt_top .jt_top_nei .right ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.jt .jt_top .jt_top_nei .right ul li {
  float: left;
  color: #d2ccd2;
  margin: 0 3px;
  line-height: 31px;
}

.jt .jt_top .jt_top_nei .right ul li a {
  color: #666;
  line-height: 31px;
}

.jt .jt_top .jt_top_nei .right ul li a:hover,
.jt .jt_top .jt_top_nei .right ul li a.list {
  color: #f03736;
}

.jt .jt_top .jt_top_nei .right ul li.phone a {
  display: flex;
  align-items: center;
  gap: 3px;
}

.jt .jt_top .jt_top_nei .right ul li.phone .phone-icon {
  width: 14px;
  height: 14px;
  vertical-align: middle;
}

/* Main Navigation Bar */
.jt .jt_end_box {
  width: 1200px;
  height: 80px;
  overflow: hidden;
  margin: 0 auto;
}

.jt .jt_end_box .logos {
  float: left;
  width: 152px;
  height: 72px;
  margin-top: 9px;
}

.jt .jt_end_box .logos img {
  height: 63px;
  width: auto;
}

/* Game Counter */
.jt .jt_end_box .pcdd_number {
  font-size: 20px;
  width: 270px;
  height: 54px;
  line-height: 1;
  padding-top: 6px;
  padding-left: 5px;
  float: left;
}

.jt .jt_end_box .pcdd_number .header_xnkl {
  padding-bottom: 5px;
  display: inline-block;
  float: left;
  margin: 1px 61px 0 0;
  width: 100%;
}

.jt .jt_end_box .pcdd_number .header_xnkl b {
  font-size: 14px;
  color: #808080;
  font-weight: bold;
  line-height: 30px !important;
  float: left;
  margin-right: 15px;
}

.jt .jt_end_box .pcdd_number ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.jt .jt_end_box .pcdd_number li {
  float: left;
  width: 21px;
  height: 27px;
  text-align: center;
  line-height: 27px;
  color: #f03736;
  display: block;
  overflow: hidden;
  position: relative;
  border: 1px solid #dddddd;
  margin: 0 2px;
}

.jt .jt_end_box .pcdd_number li.pcdd_num {
  background: url('/number_line.png') repeat-x;
}

.jt .jt_end_box .pcdd_number .pcdd_nobor {
  background: none;
  border: 0;
}

/* Navigation Menu */
.jt .jt_end_box ul.jt_nav {
  float: right;
  height: 73px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.jt .jt_end_box ul.jt_nav li {
  float: left;
  font-size: 16px;
  height: 73px;
  position: relative;
}

.jt .jt_end_box ul.jt_nav li a {
  color: #6b6b6b;
  display: inline-block;
  line-height: 69px;
  font-size: 16px;
  font-weight: 600;
  margin: 8px 0 0 0;
  padding: 0 16px;
  font-family: Microsoft YaHei, "\5b8b\4f53", Tahoma, Helvetica, Arial, sans-serif;
}

.jt .jt_end_box ul.jt_nav li a.list {
  color: #fa4c4b;
  border-bottom: 3px solid #fa4c4b;
}

.jt .jt_end_box ul.jt_nav li a:hover {
  color: #fa4c4b;
}

/* Badge */
.jt .jt_end_box ul.jt_nav li .ico-num {
  width: auto;
  height: 14px;
  padding: 0 3px;
  line-height: 14px;
  border-radius: 2px;
  font-size: 11px;
  color: #FFF;
  background: #ff413d;
  position: absolute;
  top: 15px;
  right: 0;
  z-index: 2;
  display: block;
  white-space: nowrap;
  animation: updown .8s infinite ease-in-out;
}

.jt .jt_end_box ul.jt_nav li .ico-num em {
  position: absolute;
  bottom: -4px;
  left: 4px;
  overflow: hidden;
  font-size: 0;
  line-height: 0;
  border: 3px solid #ff413d;
  border-color: #ff413d transparent transparent #ff413d;
}

@keyframes updown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(4px);
  }
}

/* 领救济弹窗样式 */
.welfare-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welfare-modal {
  background: #fff;
  border-radius: 5px;
  width: 850px;
  max-height: 80vh;
  position: relative;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.welfare-modal-close {
  position: absolute;
  top: -15px;
  right: -15px;
  width: 30px;
  height: 30px;
  background: #999;
  border-radius: 50%;
  color: #fff;
  font-size: 20px;
  line-height: 28px;
  text-align: center;
  cursor: pointer;
  z-index: 10;
}

.welfare-modal-close:hover {
  background: #666;
}

.welfare-modal-content {
  padding: 20px;
  max-height: calc(80vh - 40px);
  overflow-y: auto;
}

.welfare-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.welfare-table th,
.welfare-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.welfare-table th {
  color: #666;
  font-weight: normal;
  background: #fafafa;
}

.welfare-table td {
  color: #333;
}

.welfare-table td.coins {
  color: #f03736;
  font-weight: bold;
  white-space: nowrap;
}

.welfare-table td.coins .coin-img {
  display: inline-block;
  vertical-align: middle;
  margin-left: 3px;
}

.welfare-table td.condition {
  color: #666;
}

.welfare-table td img {
  vertical-align: middle;
}

.welfare-form {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px 0 10px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.verify-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verify-input span {
  color: #666;
  font-size: 14px;
}

.verify-input input {
  width: 100px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0 10px;
  font-size: 14px;
}

.verify-input .refresh-code {
  color: #1890ff;
  font-size: 14px;
  text-decoration: none;
}

.verify-input .refresh-code:hover {
  text-decoration: underline;
}

.claim-btn {
  background: #f03736;
  color: #fff;
  border: none;
  padding: 10px 30px;
  font-size: 14px;
  border-radius: 3px;
  cursor: pointer;
}

.claim-btn:hover {
  background: #d32f2f;
}
</style>
