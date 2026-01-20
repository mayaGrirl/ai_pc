<script setup lang="ts">
import { ref } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'

// 当前标签
const activeTab = ref('overview')

const tabs = [
  { key: 'overview', name: '工资概况' },
  { key: 'basket', name: '菜篮子工资' },
  { key: 'daily', name: '每日工资详情' }
]

// 工资说明
const salaryInfo = ref({
  description: '未满足领工资条件: 不能领取游戏工资,用户必须有效邀请 产生佣金后 , 邀请用户投注奖励 , 工资领取比例100%,低于30积分的用户只能领取10%。',
  tips: '温馨提醒：获取工资后必须完成投注才能领取,请在有效期内领取,过期作废,成功领取100元后,佣金自动减少100元,领取多少减少多少。'
})

// 模拟工资数据
const salaryRecords = ref([])
</script>

<template>
  <UserLayout>
    <div class="salary-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          {{ tab.name }}
        </span>
      </div>

      <!-- 工资概况 -->
      <div v-if="activeTab === 'overview'" class="salary-content">
        <!-- 工资说明 -->
        <div class="info-box warning">
          <p>{{ salaryInfo.description }}</p>
        </div>

        <div class="info-box tips">
          <p>{{ salaryInfo.tips }}</p>
        </div>

        <!-- 无数据 -->
        <div class="empty-data">
          <p>暂无工资记录</p>
        </div>
      </div>

      <!-- 游戏工资 -->
      <div v-else-if="activeTab === 'game'" class="salary-content">
        <div class="empty-data">
          <p>暂无游戏工资记录</p>
        </div>
      </div>

      <!-- 每日工资 -->
      <div v-else-if="activeTab === 'daily'" class="salary-content">
        <div class="empty-data">
          <p>暂无每日工资记录</p>
        </div>
      </div>

      <!-- 追号工资 -->
      <div v-else-if="activeTab === 'chase'" class="salary-content">
        <div class="empty-data">
          <p>暂无追号工资记录</p>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.salary-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #eee;
}

.page-tabs .tab {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  padding: 12px 20px;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: all 0.3s;
}

.page-tabs .tab:hover {
  color: #ff6600;
}

.page-tabs .tab.active {
  color: #ff6600;
  border-bottom-color: #ff6600;
  background: #fff8f0;
}

.salary-content {
  padding-top: 10px;
}

.info-box {
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 13px;
  line-height: 1.6;
}

.info-box.warning {
  background: #fff7e6;
  border: 1px solid #ffd591;
  color: #d48806;
}

.info-box.tips {
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.info-box p {
  margin: 0;
}

.empty-data {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.empty-data p {
  margin: 0;
}
</style>
