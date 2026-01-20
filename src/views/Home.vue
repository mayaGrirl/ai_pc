<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import MainLayout from '@/components/layout/MainLayout.vue'
import { getBanners, getAnnouncements, indexGameHotNew } from '@/api/home'
import type { IndexDataItem, gameItem } from '@/types/index.type'

const { t, locale } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const isLogin = computed(() => authStore.isLogin)
const customer = computed(() => authStore.currentCustomer)

// Data
const banners = ref<IndexDataItem[]>([])
const announcements = ref<IndexDataItem[]>([])
const hotGames = ref<gameItem[]>([])
const newGames = ref<gameItem[]>([])
const currentBanner = ref(0)
const loading = ref(true)
const gameCount = ref(611561927)

// Login form
const loginForm = ref({
  mobile: '',
  password: '',
  rememberMe: false
})
const loginLoading = ref(false)
const loginError = ref('')

// Withdrawal dynamics mock data
const withdrawRecords = ref([
  { user: '138****5678', amount: 1200 },
  { user: '159****3456', amount: 3500 },
  { user: '186****7890', amount: 800 },
  { user: '135****2345', amount: 5000 }
])

// Rankings mock data
const todayRankings = ref([
  { rank: 1, user: '开***刀', amount: 217585458 },
  { rank: 2, user: '黄***宇', amount: 141503409 },
  { rank: 3, user: '冰***璃', amount: 205871742 },
  { rank: 4, user: '夜***子', amount: 150764744 },
  { rank: 5, user: '王***明', amount: 102752714 },
  { rank: 6, user: '李***华', amount: 148399302 },
  { rank: 7, user: '张***飞', amount: 98765432 }
])

const yesterdayRankings = ref([
  { rank: 1, user: '星***辰', amount: 198765432 },
  { rank: 2, user: '月***华', amount: 156789012 },
  { rank: 3, user: '风***云', amount: 134567890 },
  { rank: 4, user: '雪***梅', amount: 123456789 },
  { rank: 5, user: '花***雨', amount: 112345678 },
  { rank: 6, user: '梦***蝶', amount: 101234567 },
  { rank: 7, user: '云***烟', amount: 90123456 }
])

const activeRankingTab = ref('today')

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

// Game images
const gameImages = ref([
  { id: 1, name: '加拿大28', img: '/index/01.png' },
  { id: 2, name: '宾果28', img: '/index/02.png' },
  { id: 3, name: '幸运28', img: '/index/03.png' },
  { id: 4, name: '美国28', img: '/index/04.png' },
  { id: 5, name: '宾果10', img: '/index/05.png' },
  { id: 6, name: '加拿大36', img: '/index/06.png' },
  { id: 7, name: '加拿大2.1', img: '/index/07.png' },
  { id: 8, name: '加拿大2.8', img: '/index/08.png' }
])

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
  currentBanner.value = (currentBanner.value + 1) % 5
}

// Login handler
const handleLogin = async () => {
  loginError.value = ''
  if (!loginForm.value.mobile) {
    loginError.value = t('login.inputMobile')
    return
  }
  if (!loginForm.value.password) {
    loginError.value = t('login.inputPassword')
    return
  }

  loginLoading.value = true
  try {
    const { login } = await import('@/api/auth')
    const res = await login({
      mobile: loginForm.value.mobile,
      password: loginForm.value.password,
      type: 1
    })

    if (res.code === 200 && res.data) {
      authStore.setToken(
        res.data.access_token,
        res.data.token_type,
        res.data.expires_at
      )
      await authStore.fetchCurrentCustomer()
    } else {
      loginError.value = res.message || t('login.loginFailed')
    }
  } catch {
    loginError.value = t('login.loginFailed')
  } finally {
    loginLoading.value = false
  }
}

// Load data
onMounted(async () => {
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

    // Auto-play banner
    setInterval(nextBanner, 5000)

    // Simulate game count growth
    setInterval(() => {
      gameCount.value += Math.floor(Math.random() * 100)
    }, 2000)
  } catch (error) {
    console.error('Failed to load home data:', error)
  } finally {
    loading.value = false
  }
})

const goToGame = (gameId: number) => {
  router.push(`/games/${gameId}`)
}

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const handleLogout = () => {
  authStore.logout()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <MainLayout>
    <!-- Banner Section -->
    <div class="bannerbox">
      <div class="hd">
        <ul>
          <li v-for="(_, index) in 5" :key="index" :class="{ on: currentBanner === index }" @click="currentBanner = index"></li>
        </ul>
      </div>
      <div class="bd">
        <ul>
          <li v-for="(_, index) in 5" :key="index" :style="{ display: currentBanner === index ? 'list-item' : 'none' }">
            <a href="#"><img :src="`/index/20230404${index + 1}.png`" width="1920" height="384"></a>
          </li>
        </ul>
      </div>
      <a class="prev" href="javascript:void(0)" @click="currentBanner = (currentBanner - 1 + 5) % 5"></a>
      <a class="next" href="javascript:void(0)" @click="currentBanner = (currentBanner + 1) % 5"></a>

      <!-- Login Box / User Info -->
      <div class="fucen_box">
        <!-- Not logged in: Show login form -->
        <template v-if="!isLogin">
          <div><b>用户登入</b></div>
          <form class="sign_box" @submit.prevent="handleLogin">
            <dd style="margin-top: 15px">
              <div v-if="loginError" class="error-msg">{{ loginError }}</div>
              <div class="frame">
                <b class="zh"></b>
                <input v-model="loginForm.mobile" type="text" placeholder="请输入手机号码" tabindex="1">
              </div>
            </dd>
            <dd>
              <div class="frame">
                <b class="mm"></b>
                <input v-model="loginForm.password" type="password" placeholder="请输入密码" tabindex="2">
              </div>
            </dd>
            <dd>
              <input type="submit" class="sign" :value="loginLoading ? '登录中...' : '登录'" :disabled="loginLoading">
            </dd>
          </form>
          <dd style="margin:10px auto;text-align: center">
            <p><router-link to="/forgot-password">忘记密码</router-link> | <router-link to="/register">立即注册</router-link></p>
          </dd>
        </template>

        <!-- Logged in: Show user info -->
        <template v-else>
          <div class="message_box">
            <div class="img">
              <router-link to="/user">
                <img :src="customer?.avatar || '/head/m-1.gif'" :alt="customer?.nickname || ''">
              </router-link>
            </div>
            <div class="text">
              <router-link to="/user">
                <h3>{{ customer?.nickname || '_sg' + customer?.id }} <span style="font-size: 12px; font-weight: initial;">ID:{{ customer?.id }}</span></h3>
              </router-link>
              <p>暂未开通会员 <a href="#" class="button" style="cursor: pointer; margin-left: 10px;">开通会员</a></p>
            </div>
            <div class="close_box" @click="handleLogout"><a href="javascript:void(0)"></a></div>
          </div>
          <div class="user-onwer-list">
            <router-link to="/user/detail"><p>余额：<span>{{ formatNumber(customer?.points || 0) }}</span></p></router-link>
            <router-link class="button" to="/store">商城</router-link>
            <router-link class="button" to="/user/bank">充值</router-link>
          </div>
          <div class="anniu_box">
            <router-link class="button" to="/user/checkin" style="cursor: pointer">每日签到</router-link>
          </div>
          <a href="http://wpa.qq.com/msgrd?v=3&uin=228711&site=qq&menu=yes" target="_blank" class="qq-banner">
            <img src="/index_qq.png" width="335" height="75">
          </a>
        </template>
      </div>
    </div>

    <!-- Main Content -->
    <div class="index_center">
      <div class="center_box">
        <!-- Step Bar -->
        <div class="step_box">
          <span><b>{{ formatNumber(gameCount) }}</b></span>
        </div>

        <!-- Latest Games -->
        <div class="index_box games_box">
          <div class="top">
            <h2>最新游戏</h2>
            <router-link class="more" to="/games">更多<img src="/index_more.png"></router-link>
          </div>
          <div class="list">
            <ul>
              <li v-for="game in gameImages.slice(0, 4)" :key="game.id" @click="goToGame(game.id)">
                <i class="game-type type"></i>
                <div class="img">
                  <img :src="game.img" :alt="game.name">
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
            <router-link class="more" to="/news">更多<img src="/index_more.png"></router-link>
          </div>
          <ul class="news_list">
            <li v-for="notice in announcements.slice(0, 5)" :key="notice.id">
              <a href="javascript:void(0)"><b></b>{{ getLocalizedTitle(notice) }}</a>
            </li>
            <li v-if="announcements.length === 0">
              <a href="javascript:void(0)"><b></b>暂无公告</a>
            </li>
          </ul>
        </div>

        <!-- Withdrawal Dynamics -->
        <div class="index_box cash_box">
          <div class="top">
            <h2>提现动态</h2>
          </div>
          <div class="cash_list">
            <div class="bd">
              <ul class="infoList">
                <li v-for="(record, index) in withdrawRecords" :key="index">
                  <p><b><a href="#">{{ record.user }}</a></b> 提现了</p>
                  <span>{{ formatNumber(record.amount) }}</span>
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
            <ul>
              <li v-for="game in gameImages.slice(4, 8)" :key="game.id" @click="goToGame(game.id)">
                <i class="game-type type"></i>
                <div class="img">
                  <img :src="game.img" :alt="game.name">
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
        <div class="index_box day_box">
          <ul class="menu">
            <li :class="{ list: activeRankingTab === 'today' }" @click="activeRankingTab = 'today'">
              <a href="javascript:void(0)">今日排行榜</a>
            </li>
            <li :class="{ list: activeRankingTab === 'yesterday' }" @click="activeRankingTab = 'yesterday'">
              <a href="javascript:void(0)">昨日排行榜</a>
            </li>
          </ul>
          <ul class="day_list">
            <li class="top">
              <dd style="width: 55px;">排名</dd>
              <dd style="width: 90px;">昵称</dd>
              <dd style="width: 155px;">乐豆</dd>
            </li>
            <li v-for="item in (activeRankingTab === 'today' ? todayRankings : yesterdayRankings)" :key="item.rank">
              <dd style="width: 55px;">
                <span :class="item.rank === 1 ? 'one' : item.rank === 2 ? 'two' : item.rank === 3 ? 'three' : 'end'">
                  {{ item.rank > 3 ? item.rank : '' }}
                </span>
              </dd>
              <dd style="width: 80px; margin-right: 10px;"><a href="#">{{ item.user }}</a></dd>
              <dd style="width: 155px; color: #f03736; font-weight: bold;">{{ formatNumber(item.amount) }}</dd>
            </li>
          </ul>
        </div>

        <!-- Game Shop -->
        <div class="index_box prize_box">
          <div class="top">
            <h2>游戏商城</h2>
            <a class="more" href="javascript:void(0)" @click="scrollToTop">更多<img src="/index_more.png"></a>
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
            <a class="more" href="javascript:void(0)" @click="scrollToTop">更多<img src="/index_more.png"></a>
          </div>
          <div class="work_list">
            <img src="/index_work.jpg" alt="合作商家">
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
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

.bannerbox .fucen_box form.sign_box {
  width: 289px;
  height: auto;
  overflow: hidden;
}

.bannerbox .fucen_box form.sign_box dd {
  margin: 0 auto;
  width: 289px;
  height: auto;
  overflow: hidden;
  font-size: 13px;
}

.bannerbox .fucen_box form.sign_box dd div.frame {
  width: 100%;
  height: auto;
  padding: 7px 0;
  border: 1px solid #eeeeef;
  background: #fff;
  overflow: hidden;
  margin-bottom: 8px;
  box-sizing: border-box;
}

.bannerbox .fucen_box form.sign_box dd div.frame b {
  width: 16px;
  height: 20px;
  display: inline-block;
  margin: auto 12px auto 17px;
  float: left;
}

.bannerbox .fucen_box form.sign_box dd div.frame b.zh {
  background: url("/index_ever.png") 0 0 no-repeat;
}

.bannerbox .fucen_box form.sign_box dd div.frame b.mm {
  background: url("/index_ever.png") -25px 0 no-repeat;
}

.bannerbox .fucen_box form.sign_box dd div.frame input {
  float: left;
  border: 0px;
  width: calc(100% - 50px);
  height: 20px;
  line-height: 20px;
  outline: none;
  color: #666;
  font-size: 13px;
}

.bannerbox .fucen_box form.sign_box dd .sign {
  width: 100%;
  height: 45px;
  line-height: 45px;
  display: block;
  background: #fa4c4b;
  border: 0px;
  font-size: 16px;
  color: #fff;
  text-align: center;
  border-radius: 100px;
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
}

.bannerbox .fucen_box form.sign_box dd .sign:hover {
  background: #f03736;
}

.bannerbox .fucen_box form.sign_box dd .sign:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  height: 80px;
  overflow: hidden;
  width: 335px;
  background: #ececec;
  display: inline-block;
  position: absolute;
  margin-left: -23px;
}

.bannerbox .fucen_box .qq-banner img {
  position: absolute;
  left: 0;
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
}

.index_center .center_box .index_box .top a.more img {
  vertical-align: middle;
  margin-left: 5px;
  margin-top: -2px;
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
  width: 302px;
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

/* Cash Box */
.index_center .center_box .cash_box .cash_list {
  width: 290px;
  overflow: hidden;
  position: relative;
  margin: 5px auto 15px auto;
}

.index_center .center_box .cash_box .cash_list .infoList {
  list-style: none;
  padding: 0;
  margin: 0;
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

/* Day Box - Rankings */
.index_center .center_box .day_box {
  width: 320px;
  height: 466px;
  overflow: hidden;
  margin-top: 20px;
}

.index_center .center_box .day_box ul.menu {
  border-bottom: 1px solid #ececec;
  width: 320px;
  height: auto;
  overflow: hidden;
  list-style: none;
  padding: 0;
  margin: 0;
}

.index_center .center_box .day_box ul.menu li {
  display: inline-block;
  width: 160px;
  height: 53px;
  line-height: 53px;
  text-align: center;
  margin: 0 auto;
  float: left;
  font-size: 16px;
  color: #4c4c4c;
  cursor: pointer;
  font-weight: bold;
}

.index_center .center_box .day_box ul.menu li.list {
  border-bottom: 2px solid #f03736;
  color: #f03736;
}

.index_center .center_box .day_box ul.menu li a {
  color: inherit;
  text-decoration: none;
}

.index_center .center_box .day_box ul.day_list {
  width: 320px;
  height: 357px;
  overflow: hidden;
  margin: 6px auto auto auto;
  list-style: none;
  padding: 0;
}

.index_center .center_box .day_box ul.day_list li {
  width: 300px;
  height: 45px;
  line-height: 45px;
  border-bottom: 1px dashed #ebebeb;
  margin: 0 auto;
  font-size: 13px;
  float: left;
}

.index_center .center_box .day_box ul.day_list li.top {
  background: #f0f0f0;
  font-size: 13px;
  color: #333;
  height: 34px;
  line-height: 34px;
  padding: 0 10px;
  width: 300px;
}

.index_center .center_box .day_box ul.day_list li dd {
  margin: 0 auto;
  display: inline-block;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  float: left;
}

.index_center .center_box .day_box ul.day_list li dd span.end {
  width: 16px;
  height: 16px;
  color: #fff;
  text-align: center;
  line-height: 16px;
  background: #bababa;
  display: inline-block;
  margin-top: 14px;
}

.index_center .center_box .day_box ul.day_list li dd span.one {
  width: 19px;
  height: 26px;
  background: url("/yxsw_games_list.png") 0 0 no-repeat;
  display: inline-block;
}

.index_center .center_box .day_box ul.day_list li dd span.two {
  width: 19px;
  height: 26px;
  background: url("/yxsw_games_list.png") -22px 0 no-repeat;
  display: inline-block;
}

.index_center .center_box .day_box ul.day_list li dd span.three {
  width: 19px;
  height: 26px;
  background: url("/yxsw_games_list.png") -44px 0 no-repeat;
  display: inline-block;
}

.index_center .center_box .day_box ul.day_list li dd a {
  color: #333;
}

.index_center .center_box .day_box ul.day_list li dd a:hover {
  text-decoration: underline;
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
</style>
