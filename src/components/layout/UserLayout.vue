<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import MainLayout from './MainLayout.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const customer = computed(() => authStore.currentCustomer)

// Menu items based on original template
const accountMenuItems = [
  { name: '我的消息', path: '/user/messages', key: 'mymessage' },
  { name: '我的工资', path: '/user/salary', key: 'salary' },
  { name: '银行服务', path: '/user/bank', key: 'mybank' },
  { name: '账户明细', path: '/user/detail', key: 'scoredetail', separator: true },
  { name: '我的道具', path: '/user/props', key: 'mycards' },
  { name: '兑奖记录', path: '/user/exchange', key: 'cash' }
]

const entertainmentMenuItems = [
  { name: '签到', path: '/user/checkin', key: 'signin' },
  { name: '领返利', path: '/user/rebate', key: 'wages' },
  { name: '我的红包', path: '/user/redpacket', key: 'mypack' },
  { name: '推广赚币', path: '/promotion', key: 'spread', highlight: true, external: true }
]

const personalMenuItems = [
  { name: '手机认证', path: '/user/verify', key: 'checkmobile' },
  { name: '修改资料', path: '/user/profile', key: 'mydetail' },
  { name: '安全中心', path: '/user/security', key: 'security' },
  { name: '登录日志', path: '/user/logs', key: 'actionlog' }
]

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const navigateTo = (path: string, external?: boolean) => {
  if (external) {
    router.push(path)
  } else {
    router.push(path)
  }
}

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const handleRefresh = () => {
  authStore.fetchCurrentCustomer()
}
</script>

<template>
  <MainLayout>
    <div class="doc">
      <div class="myaccount">
        <!-- Left Sidebar -->
        <div class="account_leftt">
          <!-- User Profile Top -->
          <div class="account_left_gktop">
            <ul>
              <li class="left_gktop_l">
                <div class="left_gktop_lk">
                  <div class="hoverlay">修改头像</div>
                  <img :src="customer?.avatar || '/head/m-1.gif'" width="70" height="70">
                </div>
              </li>
              <li class="left_gktop_r">
                <div class="left_gktop_fk">
                  <p class="leftnc_bt">{{ customer?.nickname || '_sg' + customer?.id }}</p>
                  <p>ID：<span>{{ customer?.id }}</span></p>
                  <p><a href="javascript:void(0)" @click="handleRefresh">[刷新]</a></p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Menu Section -->
          <div class="account_left">
            <!-- Account Section -->
            <div class="account_left_top">
              <ul class="accout">
                <li class="accout_messeage">
                  <img src="/account.gif" width="238" height="45">
                  <ul class="accout_messeageW">
                    <template v-for="item in accountMenuItems" :key="item.key">
                      <li v-if="item.separator" class="account_left_zhline"></li>
                      <li :id="'menu_' + item.key">
                        <a href="javascript:void(0)" @click="navigateTo(item.path)" :class="{ active: isActive(item.path) }">
                          <span>{{ item.name }}</span>
                        </a>
                      </li>
                    </template>
                  </ul>
                </li>
              </ul>
            </div>

            <!-- Entertainment Section -->
            <div class="account_left_top">
              <ul class="accout">
                <li class="accout_messeage">
                  <img src="/yule.gif" width="238" height="45">
                  <ul class="accout_messeageW">
                    <li v-for="item in entertainmentMenuItems" :key="item.key" :id="'menu_' + item.key">
                      <a href="javascript:void(0)" @click="navigateTo(item.path, item.external)" :class="{ active: isActive(item.path) }">
                        <span :style="item.highlight ? 'color:red' : ''">{{ item.name }}</span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <!-- Personal Section -->
            <div class="account_left_top">
              <ul class="accout">
                <li class="accout_messeage">
                  <img src="/geren.gif" width="238" height="45">
                  <ul class="accout_messeageW">
                    <li v-for="item in personalMenuItems" :key="item.key" :id="'menu_' + item.key">
                      <a href="javascript:void(0)" @click="navigateTo(item.path)" :class="{ active: isActive(item.path) }">
                        <span>{{ item.name }}</span>
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>

            <div class="account_left_bottom">
              <img src="/left-bottom.gif">
            </div>
          </div>
        </div>

        <!-- Right Content Area -->
        <div class="account_right" id="divContent">
          <!-- Stats Bar -->
          <div class="common userdata account_right_jinbi">
            <div class="layui-card-body">
              <ul class="indexinfo">
                <li>
                  <div>豆豆</div>
                  <div><span class="coin">{{ formatNumber(customer?.points || 0) }}</span></div>
                </li>
                <li>
                  <div>存款</div>
                  <div><span class="coin">{{ formatNumber(customer?.bankpoints || 0) }}</span></div>
                </li>
                <li>
                  <div>冻结</div>
                  <div><span class="coin">{{ formatNumber(customer?.frozen || 0) }}</span></div>
                </li>
                <li>
                  <div>生态值</div>
                  <div><span class="other">{{ customer?.experience || 0 }}</span></div>
                </li>
                <li>
                  <div>积分</div>
                  <div><span class="other">{{ customer?.blessing || 0 }}</span></div>
                </li>
              </ul>
            </div>
          </div>

          <!-- Content Slot -->
          <div class="content-wrapper">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
/* Document Container */
.doc {
  width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

.myaccount {
  width: 100%;
  display: flex;
  overflow: hidden;
}

/* Left Sidebar */
.account_leftt {
  width: 238px;
  float: left;
}

/* User Profile Top */
.account_left_gktop {
  width: 238px;
  background: #fff;
  border: 1px solid #e8e8e8;
  padding: 15px 0;
  margin-bottom: 10px;
}

.account_left_gktop ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.account_left_gktop .left_gktop_l {
  margin-right: 15px;
}

.account_left_gktop .left_gktop_lk {
  position: relative;
  width: 70px;
  height: 70px;
  cursor: pointer;
}

.account_left_gktop .left_gktop_lk img {
  border-radius: 50%;
  border: 2px solid #e9e9e9;
}

.account_left_gktop .left_gktop_lk .hoverlay {
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 12px;
  text-align: center;
  line-height: 70px;
  top: 0;
  left: 0;
  display: none;
}

.account_left_gktop .left_gktop_lk:hover .hoverlay {
  display: block;
}

.account_left_gktop .left_gktop_fk {
  color: #666;
}

.account_left_gktop .left_gktop_fk p {
  margin: 0;
  line-height: 24px;
  font-size: 13px;
}

.account_left_gktop .left_gktop_fk .leftnc_bt {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  cursor: pointer;
}

.account_left_gktop .left_gktop_fk a {
  color: #999;
  font-size: 12px;
}

.account_left_gktop .left_gktop_fk a:hover {
  color: #f03736;
}

/* Menu Section */
.account_left {
  width: 238px;
  background: #fff;
  border: 1px solid #e8e8e8;
}

.account_left_top {
  border-bottom: 1px solid #f0f0f0;
}

.account_left_top:last-of-type {
  border-bottom: none;
}

.accout {
  list-style: none;
  padding: 0;
  margin: 0;
}

.accout_messeage {
  position: relative;
}

.accout_messeage > img {
  width: 238px;
  height: 45px;
  display: block;
}

.accout_messeageW {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #fff;
}

.accout_messeageW li {
  padding: 0;
}

.accout_messeageW li a {
  display: block;
  padding: 10px 20px;
  color: #666;
  text-decoration: none;
  font-size: 13px;
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.accout_messeageW li a:hover,
.accout_messeageW li a.active {
  background: #fff8f0;
  color: #f03736;
  border-left-color: #f03736;
}

.account_left_zhline {
  height: 1px;
  background: #f0f0f0;
  margin: 5px 0;
}

.account_left_bottom img {
  width: 238px;
  display: block;
}

/* Right Content Area */
.account_right {
  flex: 1;
  margin-left: 20px;
  min-height: 500px;
}

/* Stats Bar */
.common.userdata.account_right_jinbi {
  height: auto;
  margin-bottom: 10px;
}

.layui-card-body {
  border: 1px solid #d4d2d5;
  background: #fff;
  padding: 15px;
}

.indexinfo {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-around;
}

.indexinfo li {
  text-align: center;
  min-width: 100px;
}

.indexinfo li > div:first-child {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.indexinfo li .coin {
  font-size: 20px;
  font-weight: bold;
  color: #f03736;
}

.indexinfo li .other {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* Content Wrapper */
.content-wrapper {
  background: #fff;
  border: 1px solid #d4d2d5;
  padding: 20px;
  min-height: 400px;
}
</style>
