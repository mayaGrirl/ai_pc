<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'

const route = useRoute()
const router = useRouter()

// 根据URL参数确定当前tab
const activeTab = ref(route.query.v === 'sorce' ? 1 : 0)

const switchTab = (index: number) => {
  activeTab.value = index
  if (index === 1) {
    router.push('/shop?v=sorce')
  } else {
    router.push('/shop')
  }
}

// 兑换奖品数据
const prizeProducts = [
  { id: 1, name: '【免手续】50,000豆豆购物返利卡', price: 50000, image: '/uploads/2022/12/5.png' },
  { id: 2, name: '【免手续】100,000豆豆购物返利卡', price: 100000, image: '/uploads/2022/12/10.png' },
  { id: 3, name: '【免手续】200,000豆豆购物返利卡', price: 200000, image: '/uploads/2022/12/20.png' },
  { id: 4, name: '【免手续】500,000豆豆购物返利卡', price: 500000, image: '/uploads/2022/12/50.png' },
  { id: 5, name: '【免手续】1,000,000豆豆购物返利卡', price: 1000000, image: '/uploads/2022/12/100.png' },
  { id: 6, name: '【免手续】2,000,000豆豆购物返利卡', price: 2000000, image: '/uploads/2022/12/200.png' },
  { id: 7, name: '【免手续】5,000,000豆豆购物返利卡', price: 5000000, image: '/uploads/2022/12/500.png' },
  { id: 8, name: '【免手续】10,000,000豆豆购物返利卡', price: 10000000, image: '/uploads/2022/12/1000.png' }
]

// 兑换会员卡数据
const memberProducts = [
  { id: 101, name: '月度VIP会员卡', price: 30000, image: '/uploads/2022/12/vip1.png' },
  { id: 102, name: '季度VIP会员卡', price: 80000, image: '/uploads/2022/12/vip3.png' },
  { id: 103, name: '年度VIP会员卡', price: 280000, image: '/uploads/2022/12/vip12.png' }
]

const currentProducts = ref(prizeProducts)

const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// 监听tab切换
const getProducts = () => {
  return activeTab.value === 0 ? prizeProducts : memberProducts
}
</script>

<template>
  <MainLayout>
    <div class="layui-main body">
      <div class="xuni28_nav commontitle">
        <ul>
          <li :class="{ active: activeTab === 0 }">
            <a href="javascript:void(0)" @click="switchTab(0)">兑换奖品</a>
          </li>
          <li :class="{ active: activeTab === 1 }">
            <a href="javascript:void(0)" @click="switchTab(1)">兑换会员卡</a>
          </li>
        </ul>
      </div>
      <div class="layui-card common">
        <div class="layui-card-body">
          <ul class="prizelist">
            <li v-for="item in getProducts()" :key="item.id">
              <div class="img thumbnail">
                <router-link :to="`/shop/item/${item.id}`">
                  <img :src="item.image" :alt="item.name">
                </router-link>
              </div>
              <div class="text">
                <router-link :to="`/shop/item/${item.id}`">{{ item.name }}</router-link>
              </div>
              <div class="price">
                <span class="coin">{{ formatNumber(item.price) }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.layui-main.body {
  width: 1200px;
  margin: 0 auto;
  min-height: 680px;
  padding: 15px 0;
}

/* 导航标签 */
.xuni28_nav.commontitle {
  background: #fff;
  border-bottom: 2px solid #f03736;
  margin-bottom: 15px;
}

.xuni28_nav.commontitle ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.xuni28_nav.commontitle ul li {
  margin: 0;
}

.xuni28_nav.commontitle ul li a {
  display: block;
  padding: 12px 25px;
  font-size: 14px;
  color: #666;
  text-decoration: none;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-bottom: none;
  margin-right: -1px;
}

.xuni28_nav.commontitle ul li.active a {
  background: #f03736;
  color: #fff;
  border-color: #f03736;
}

.xuni28_nav.commontitle ul li a:hover {
  color: #f03736;
}

.xuni28_nav.commontitle ul li.active a:hover {
  color: #fff;
}

/* 卡片容器 */
.layui-card.common {
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.layui-card-body {
  padding: 20px;
}

/* 奖品列表 */
.prizelist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
}

.prizelist li {
  width: 25%;
  padding: 10px;
  box-sizing: border-box;
  text-align: center;
}

.prizelist li .img.thumbnail {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.prizelist li .img.thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.prizelist li .img.thumbnail:hover img {
  transform: scale(1.05);
}

.prizelist li .text {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.5;
  height: 42px;
  overflow: hidden;
}

.prizelist li .text a {
  color: #333;
  text-decoration: none;
}

.prizelist li .text a:hover {
  color: #f03736;
}

.prizelist li .price {
  margin-top: 8px;
}

.prizelist li .price .coin {
  font-size: 18px;
  font-weight: bold;
  color: #f03736;
}
</style>
