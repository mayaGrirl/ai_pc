<script setup lang="ts">
import { ref, computed } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const customer = computed(() => authStore.currentCustomer)

// 推广链接文本
const referralText = computed(() => {
  const userId = customer.value?.id || '12345'
  return `重磅推出工资系统，游戏就可以领取工资。另外每日幸运儿奖励千万豆豆作为奖励，幸运儿上线另外可以领取10%奖励！您还在等什么？赶快行动吧！您的推广地址：http://www.df28.co/reg.php?tj=${userId}`
})

// VIP等级奖励数据
const levelRewards = ref([
  { level: 0, experience: 0, reward: 0 },
  { level: 1, experience: 500, reward: 10000 },
  { level: 2, experience: 2000, reward: 30000 },
  { level: 3, experience: 10000, reward: 80000 },
  { level: 4, experience: 60000, reward: 160000 },
  { level: 5, experience: 420000, reward: 300000 },
  { level: 6, experience: 800000, reward: 500000 },
  { level: 7, experience: 2000000, reward: 600000 },
  { level: 8, experience: 8000000, reward: 700000 },
  { level: 9, experience: 15000000, reward: 800000 },
  { level: 10, experience: 30000000, reward: 900000 }
])

// 我推荐的用户列表
const referralList = ref<any[]>([])

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

const copyUrl = () => {
  const textarea = document.getElementById('textarea2') as HTMLTextAreaElement
  if (textarea) {
    textarea.select()
    document.execCommand('Copy')
    alert('已复制好，可贴粘。')
  }
}

const claimBetBonus = () => {
  alert('领取投注提成功能开发中')
}

const claimUpgradeBonus = () => {
  alert('领取升级奖励功能开发中')
}

// 生成近7天日期
const getRecentDates = () => {
  const dates = []
  for (let i = 3; i <= 6; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    dates.push(`${month}月${day}日`)
  }
  return dates
}

const recentDates = getRecentDates()
</script>

<template>
  <MainLayout>
    <div class="container spread-container">
      <div class="spread_head"></div>
      <div class="spread_head2"></div>
      <div class="layui-main body spread">
        <div class="spreadMain">
          <div class="content-row">
            <div class="content content-left">
              <h2>最佳赚币途径</h2>
              <p>
                推荐好友一起来玩，成功推荐一个好友除了可赚取<font color="red">0.2%</font>投注提成外，还将获得高达<font color="red">168万</font>豆豆的好友升级奖励！
                各等级奖励计划：<br>
              </p>
              <table class="layui-table">
                <thead>
                  <tr>
                    <th>好友等级</th>
                    <th>需要生态值</th>
                    <th>获得好友升级奖励</th>
                    <th>获得好友投注提成</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in levelRewards" :key="item.level">
                    <td><img :src="`/skin/pc/wm/images/level/${item.level}.png`" width="25" /></td>
                    <td>{{ item.experience }}</td>
                    <td><span class="coin">{{ formatNumber(item.reward) }}</span></td>
                    <td>0.2<span>%</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="content-right-wrap">
              <div class="content">
                <h2>生态值获取方式</h2>
                <div>
                  <a href="/news/help/?#m25">生态值(等级)的获取途径？</a>
                </div>
              </div>
              <div class="content">
                <h2>推广文本</h2>
                <p>以下为您在本站专属的注册推荐地址，您可以通过微信、QQ、MSN等发给您的好友！</p>
                <textarea
                  name="textarea2"
                  id="textarea2"
                  class="spreadTxt"
                  cols="80"
                  rows="3"
                  readonly
                  :value="referralText"
                ></textarea>
                <button class="layui-btn layui-btn-danger layui-btn-fluid" @click="copyUrl">复制推广链接</button>
              </div>
            </div>
          </div>
          <div class="myfrendwrap layui-clear">
            <div class="titlewrap">
              <h2 class="bigtitle pull-left">
                我的近期收益
                <span style="font-size:13px;font-weight:normal;padding-left:20px;color:red;">
                  <span class="layui-icon layui-icon-about"></span> 今日奖励将在明天结算并开放领取！
                </span>
              </h2>
              <form action="">
                <button class="layui-btn layui-btn-danger pull-right" type="button" @click="claimBetBonus">一键领取投注提成</button>
                <button class="layui-btn layui-btn-danger pull-right" type="button" style="margin-right:10px;" @click="claimUpgradeBonus">一键领取升级奖励</button>
              </form>
            </div>
            <table class="layui-table myfrendtable">
              <thead>
                <tr>
                  <th>我推荐的用户</th>
                  <th>生态值</th>
                  <th>加入时间</th>
                  <th>累计为我创收</th>
                  <th>今天</th>
                  <th>昨天</th>
                  <th>前天</th>
                  <th v-for="(date, index) in recentDates" :key="index">{{ date }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="referralList.length === 0">
                  <td colspan="11" style="text-align:center;color:#999;padding:20px;">暂无推荐用户</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
/* 页面背景 */
.spread-container {
  padding-top: 0;
  background: #fcf9f4;
  position: relative;
}

/* 头部背景图 - 使用100vw铺满整个视口宽度 */
.spread_head {
  width: 100vw;
  height: 404px;
  background: url('/tg-1.jpg') no-repeat center top;
  background-size: cover;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

.spread_head2 {
  width: 100vw;
  height: 403px;
  background: url('/tg-2.jpg') no-repeat center top;
  background-size: cover;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
}

/* 主体内容区 - 负边距叠加到背景上 */
.layui-main.body.spread {
  width: unset;
  margin-top: -420px;
}

/* 内容白色卡片 */
.spreadMain {
  width: 1300px;
  margin: auto;
  clear: both;
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  padding: 30px;
  border-radius: 5px;
}

/* 内容行 - 两列布局 */
.content-row {
  overflow: hidden;
}

.content-row::after {
  content: '';
  display: table;
  clear: both;
}

/* 左侧内容 - 表格区 */
.content-left {
  float: left;
  width: 620px;
  padding-right: 50px;
  box-sizing: border-box;
}

/* 右侧内容区 */
.content-right-wrap {
  float: right;
  width: 620px;
}

.content-right-wrap .content {
  margin-bottom: 30px;
}

/* 内容块通用样式 */
.content {
  text-align: left;
}

.content h2 {
  margin-bottom: 5px;
  font-size: 22px;
  font-weight: 500;
  color: #333;
}

.content p {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 10px;
}

.content a {
  color: #f03736;
  text-decoration: none;
}

.content a:hover {
  text-decoration: underline;
}

/* 推广文本框 */
.spreadTxt {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  color: #666;
  box-sizing: border-box;
  margin-bottom: 15px;
  height: 100px;
  border: 3px solid #ccc;
  background: #f5f5f5;
  resize: none;
}

/* 表格 */
.layui-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.layui-table th,
.layui-table td {
  padding: 2px 8px;
  border: 1px solid #e6e6e6;
  text-align: center;
  font-size: 14px;
}

.layui-table th {
  background: #fafafa;
  font-weight: normal;
  color: #666;
}

.layui-table td {
  color: #666;
}

.layui-table td .coin {
  color: #f03736;
  font-weight: bold;
}

/* 按钮 */
.content .layui-btn {
  height: 50px;
  line-height: 50px;
  font-size: 18px;
}

.layui-btn {
  background: #f03736;
  border: none;
  color: #fff;
  cursor: pointer;
  border-radius: 3px;
  padding: 0 20px;
}

.layui-btn:hover {
  background: #d32f2f;
}

.layui-btn-fluid {
  width: 100%;
  display: block;
}

/* 我的好友区域 */
.myfrendwrap {
  clear: both;
  padding-top: 20px;
  margin-top: 20px;
  border-top: 1px solid #eee;
}

.bigtitle {
  margin-bottom: 5px;
  font-size: 22px;
  font-weight: 500;
  color: #333;
}

.titlewrap {
  margin-bottom: 10px;
  clear: both;
  overflow: hidden;
}

.titlewrap .bigtitle {
  line-height: 38px;
}

.titlewrap form {
  float: right;
}

.titlewrap .layui-btn {
  height: 38px;
  line-height: 38px;
  font-size: 14px;
  padding: 0 15px;
}

.myfrendtable th,
.myfrendtable td {
  font-size: 12px;
  padding: 8px 10px !important;
}

/* 通用类 */
.pull-left {
  float: left;
}

.pull-right {
  float: right;
}

.layui-clear::after {
  content: '';
  display: table;
  clear: both;
}
</style>
