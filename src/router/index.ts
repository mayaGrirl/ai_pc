import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { accessToken } from '@/utils/storage'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/games',
    name: 'Games',
    component: () => import('@/views/Games.vue'),
    meta: { title: '玩游戏' }
  },
  {
    path: '/games/:id',
    name: 'GameDetail',
    component: () => import('@/views/GameDetail.vue'),
    meta: { title: '游戏', requiresAuth: true }
  },
  {
    path: '/activity',
    name: 'Activity',
    component: () => import('@/views/Activity.vue'),
    meta: { title: '活动中心' }
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('@/views/ActivityDetail.vue'),
    meta: { title: '活动详情' }
  },
  {
    path: '/announcement/:id',
    name: 'AnnouncementDetail',
    component: () => import('@/views/AnnouncementDetail.vue'),
    meta: { title: '公告详情' }
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('@/views/Shop.vue'),
    meta: { title: '兑换奖品' }
  },
  {
    path: '/shop/records',
    name: 'Shop Records',
    component: () => import('@/views/ShopRecord.vue'),
    meta: { title: '兑换记录' }
  },
  {
    path: '/promotion',
    name: 'Promotion',
    component: () => import('@/views/Promotion.vue'),
    meta: { title: '兼职推广' }
  },
  {
    path: '/partners',
    name: 'Partners',
    component: () => import('@/views/Partners.vue'),
    meta: { title: '合作商' }
  },
  {
    path: '/usdt',
    name: 'USDT',
    component: () => import('@/views/USDT.vue'),
    meta: { title: 'USDT备用金' }
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('@/views/Ranking.vue'),
    meta: { title: '排行榜' }
  },
  {
    path: '/game/top',
    name: 'GameTop',
    component: () => import('@/views/GameTop.vue'),
    meta: { title: '游戏排行榜' }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册' }
  },
  // 用户中心
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/user/Index.vue'),
    meta: { title: '用户中心', requiresAuth: true }
  },
  {
    path: '/user/messages',
    name: 'UserMessages',
    component: () => import('@/views/user/Messages.vue'),
    meta: { title: '我的消息', requiresAuth: true }
  },
  {
    path: '/user/salary',
    name: 'UserSalary',
    component: () => import('@/views/user/Salary.vue'),
    meta: { title: '我的工资', requiresAuth: true }
  },
  {
    path: '/user/bank',
    name: 'UserBank',
    component: () => import('@/views/user/Bank.vue'),
    meta: { title: '银行服务', requiresAuth: true }
  },
  {
    path: '/user/detail',
    name: 'UserDetail',
    component: () => import('@/views/user/Detail.vue'),
    meta: { title: '账户明细', requiresAuth: true }
  },
  {
    path: '/user/props',
    name: 'UserProps',
    component: () => import('@/views/user/Props.vue'),
    meta: { title: '我的道具', requiresAuth: true }
  },
  {
    path: '/user/exchange',
    name: 'UserExchange',
    component: () => import('@/views/user/Exchange.vue'),
    meta: { title: '兑奖记录', requiresAuth: true }
  },
  {
    path: '/user/checkin',
    name: 'UserCheckin',
    component: () => import('@/views/user/Checkin.vue'),
    meta: { title: '签到', requiresAuth: true }
  },
  {
    path: '/user/rebate',
    name: 'UserRebate',
    component: () => import('@/views/user/Rebate.vue'),
    meta: { title: '微返利', requiresAuth: true }
  },
  {
    path: '/user/redpacket',
    name: 'UserRedpacket',
    component: () => import('@/views/user/Redpacket.vue'),
    meta: { title: '我的红包', requiresAuth: true }
  },
  {
    path: '/user/promotion',
    name: 'UserPromotion',
    component: () => import('@/views/user/Promotion.vue'),
    meta: { title: '推广赚币', requiresAuth: true }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/Profile.vue'),
    meta: { title: '修改资料', requiresAuth: true }
  },
  {
    path: '/user/security',
    name: 'UserSecurity',
    component: () => import('@/views/user/Security.vue'),
    meta: { title: '安全中心', requiresAuth: true }
  },
  {
    path: '/user/logs',
    name: 'UserLogs',
    component: () => import('@/views/user/Logs.vue'),
    meta: { title: '登录日志', requiresAuth: true }
  },
  {
    path: '/user/welfare',
    name: 'UserWelfare',
    component: () => import('@/views/user/Welfare.vue'),
    meta: { title: '领救济', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  },

  {
    path: '/agent/recharge',
    name: 'AgentRecharge',
    component: () => import('@/views/agent/recharge.vue'),
    meta: { title: '代理充值', requiresAuth: true }
  },
  {
    path: '/agent/profile',
    name: 'AgentProfile',
    component: () => import('@/views/agent/profile.vue'),
    meta: { title: '代理资料', requiresAuth: true }
  },
  {
    path: '/agent/conversion',
    name: 'AgentConversion',
    component: () => import('@/views/agent/conversion.vue'),
    meta: { title: '额度转换', requiresAuth: true }
  },
  {
    path: '/agent/log',
    name: 'AgentLog',
    component: () => import('@/views/agent/log.vue'),
    meta: { title: '操作日志', requiresAuth: true }
  },
  {
    path: '/agent/recycle',
    name: 'AgentRecycle',
    component: () => import('@/views/agent/recycle.vue'),
    meta: { title: '回收体验卡', requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || 'DF28'} - 鼎丰28`

  // 检查登录状态
  const token = accessToken.getToken()
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
