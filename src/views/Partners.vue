<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { getWebConfig } from '@/api/home'
import type { webConfig } from '@/types/index.type'

// System config
const sysConfig = ref<webConfig | null>(null)

onMounted(() => {
  getWebConfig().then(res => {
    if (res.code === 200 && res.data) {
      sysConfig.value = res.data
    }
  }).catch(err => {
    console.error('获取系统配置失败:', err)
  })
})

// 合作商列表数据
const partners = ref([
  { name: '鼎丰客服', qq: '228711', wechat: '24小时在线', style: 'n1' },
  { name: '百度点卡', qq: '3739349', wechat: '欲成大树 莫与草争', style: 'n4' },
  { name: '皇后点卡', qq: '3491198', wechat: 'wang099199', style: 'n4' },
  { name: '京东点卡', qq: '514723', wechat: '天天暴富', style: 'n2' },
  { name: '黑龙点卡', qq: '1895242', wechat: 'yy77595919', style: 'n2' },
  { name: '米兰点卡', qq: '621395', wechat: 'aqw0732', style: 'n4' },
  { name: '八零后点卡', qq: '5070014', wechat: '24小时在线  支持USDT上分', style: 'n2' },
  { name: '欧妮点卡', qq: '1579610', wechat: '支持USDT  大额无忧', style: 'n4' },
  { name: '幸运点卡', qq: '3623676', wechat: '各种收付通道 秒存秒取', style: 'n2' },
  { name: '樱桃点卡', qq: '1940917', wechat: '支持微 usdt 上分', style: 'n2' },
  { name: '鸿运点卡', qq: '4269693', wechat: '诚信第一', style: 'n3' },
  { name: '吉祥点卡', qq: '514723', wechat: '微  抖  支 暴富', style: 'n4' },
  { name: '老表点卡', qq: '1373558', wechat: '美女代理  福利多多', style: 'n3' },
  { name: '钱多多点卡', qq: '392138', wechat: 'QC19181888', style: 'n4' },
  { name: '青衣点卡', qq: '787266', wechat: '支持微 宝U 上分 大额秒下', style: 'n2' },
  { name: '168点卡', qq: '8054000', wechat: '24小时在线', style: 'n4' },
  { name: '福鑫商铺', qq: '3333098', wechat: '博出末来', style: 'n2' },
  { name: '萌萌点卡', qq: '78157986', wechat: '24小时在线  支持微宝U大额秒下', style: 'n3' },
  { name: '昧昧点卡', qq: '3739349', wechat: '生活应该大大方方 而不是大小单双', style: 'n4' },
  { name: '柒柒点卡', qq: '883073', wechat: '24小时在线可USDT上分', style: 'n4' }
])

const openQQ = (qq: string) => {
  window.open(`https://wpa.qq.com/msgrd?v=3&uin=${qq}&site=qq&menu=yes`, '_blank')
}
</script>

<template>
  <MainLayout>
    <div class="container">
      <div class="ylc_merchants">
        <div class="ylc_merchants_1200">
          <div class="layui-card">
            <div class="layui-card-header">代理列表</div>
            <div class="layui-card-body">
              <div class="layui-collapse">
                <!-- 客服区域 -->
                <div class="layui-colla-item">
                  <h2 class="layui-colla-title">
                    鼎丰28客服<i class="icon-smile">☺</i>
                    <a :href="`https://wpa.qq.com/msgrd?v=3&uin=${sysConfig?.connet_qq || '228711'}&site=qq&menu=yes`"
                       class="layui-btn layui-btn-sm layui-btn-primary"
                       title="认准官方QQ"
                       target="_blank">
                      <i class="icon-qq">Q</i>{{ sysConfig?.connet_qq || '228711' }}
                    </a>
                    <a href="javascript:;" class="layui-btn layui-btn-sm layui-btn-disabled" title="认准官方微信">
                      <i class="icon-wechat">微</i>微信维护中
                    </a>
                  </h2>
                  <div class="layui-colla-content layui-kefu layui-show">
                    <div class="kefu"></div>
                  </div>
                </div>

                <!-- 合作商列表 -->
                <div class="layui-colla-item">
                  <h2 class="layui-colla-title">
                    鼎丰合作商务列表<span style="color:red;">(如联系qq无回复,请联系代理在线功能!)</span>
                  </h2>
                  <div class="layui-colla-content layui-show">
                    <div class="Content">
                      <div class="al">
                        <ul v-for="(partner, index) in partners" :key="index">
                          <a href="javascript:;" @click="openQQ(partner.qq)">
                            <li :class="partner.style">
                              <div class="n">{{ partner.name }}</div>
                              <div class="q"><i class="icon-qq">Q</i>{{ partner.qq }}</div>
                              <div class="w"><i class="icon-wechat">微</i>{{ partner.wechat }}</div>
                              <div class="s"><div></div></div>
                            </li>
                          </a>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.container {
  background: #f5f5f5;
  min-height: 600px;
}

.ylc_merchants {
  min-width: 1200px;
  margin: 20px 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
}

.ylc_merchants_1200 {
  width: 1200px;
}

/* Card 样式 */
.layui-card {
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.layui-card-header {
  color: white;
  background-color: #f44337;
  font-size: 16px;
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.layui-card-body {
  padding: 15px;
}

/* Collapse 样式 */
.layui-collapse {
  border: 1px solid #e6e6e6;
  border-radius: 2px;
}

.layui-colla-item {
  border-bottom: 1px solid #e6e6e6;
}

.layui-colla-item:last-child {
  border-bottom: none;
}

.layui-colla-title {
  padding: 10px 15px;
  background: #f8f8f8;
  font-size: 14px;
  font-weight: normal;
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.layui-colla-content {
  padding: 15px;
  display: none;
}

.layui-colla-content.layui-show {
  display: block;
}

/* 客服区域 */
.layui-kefu {
  padding: 0 !important;
}

.kefu {
  width: 100%;
  height: 146px;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-evenly;
  align-items: center;
  background-image: url('/skin/pc/wm/images/nyhu.png');
  background-size: 100% 100%;
}

/* 图标样式 */
.icon-smile,
.icon-qq,
.icon-wechat {
  font-style: normal;
  margin-right: 3px;
  display: inline-block;
}

.icon-qq {
  background: #12b7f5;
  color: #fff;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-radius: 2px;
  font-size: 12px;
}

.icon-wechat {
  background: #07c160;
  color: #fff;
  width: 16px;
  height: 16px;
  line-height: 16px;
  text-align: center;
  border-radius: 2px;
  font-size: 12px;
}

/* 按钮样式 */
.layui-btn {
  display: inline-block;
  padding: 0 10px;
  height: 26px;
  line-height: 26px;
  border-radius: 2px;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
}

.layui-btn-sm {
  height: 22px;
  line-height: 22px;
  padding: 0 8px;
  font-size: 12px;
}

.layui-btn-primary {
  background: #fff;
  border: 1px solid #c9c9c9;
  color: #555;
}

.layui-btn-primary:hover {
  border-color: #f03736;
  color: #f03736;
}

.layui-btn-disabled {
  background: #fbfbfb;
  border: 1px solid #e6e6e6;
  color: #c9c9c9;
  cursor: not-allowed;
}

/* 内容区域 */
.Content {
  width: 100%;
  padding-top: 15px;
  overflow: hidden;
  box-sizing: border-box;
}

/* 代理列表 */
.al {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
  box-sizing: border-box;
}

.al ul {
  width: 250px;
  height: 170px;
  margin: 0 20px 20px 10px;
  list-style: none;
  padding: 0;
}

.al li {
  display: block;
  width: 250px;
  height: 170px;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.2s;
}

.al li:hover {
  transform: scale(1.02);
}

/* 不同背景样式 */
.al .n1 {
  background: url('/skin/pc/wm/images/a1.png') no-repeat;
}

.al .n2 {
  background: url('/skin/pc/wm/images/a2.png') no-repeat;
}

.al .n3 {
  background: url('/skin/pc/wm/images/a3.png') no-repeat;
}

.al .n4 {
  background: url('/skin/pc/wm/images/a4.png') no-repeat;
}

/* 文字样式 */
.al .n {
  padding: 10px;
  font-size: 28px;
  text-align: center;
  clear: both;
  vertical-align: middle;
  color: #FFF;
}

.al .q {
  padding: 5px;
  text-align: center;
  clear: both;
  font-size: 18px;
  color: #FFF;
}

.al .q .icon-qq {
  background: transparent;
  margin-right: 5px;
}

.al .w {
  padding: 5px;
  text-align: center;
  clear: both;
  font-size: 16px;
  color: #FFF;
}

.al .w .icon-wechat {
  background: transparent;
  margin-right: 5px;
}

.al .m {
  padding: 5px;
  text-align: center;
  clear: both;
  font-size: 16px;
  color: #FFF;
}

.al .s {
  text-align: center;
  clear: both;
  font-size: 16px;
  color: #fff;
}

.al .n1 .s {
  color: #5f532d;
}

.al .n3 .s {
  color: #427a02;
}

.al .tj {
  text-align: center;
  font-size: 18px;
  font-weight: bolder;
  background-color: #fff0f0;
  color: red;
  border-radius: 50px;
}

.al a {
  text-decoration: none;
}
</style>
