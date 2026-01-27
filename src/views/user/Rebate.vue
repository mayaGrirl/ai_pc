<script setup lang="ts">
import { ref } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import RebateRecharge from './components/RebateRecharge.vue'
import RebateLoss from './components/RebateLoss.vue'
import {useRoute, useRouter} from "vue-router";

const route = useRoute()
const router = useRouter()
const activeTab = ref(route.query.tab as string || 'recharge')
const tabs = [
  { key: 'recharge', name: '充值返利' },
  { key: 'loss', name: '亏损返利' },
]
const switchTab = (key: string) => {
  activeTab.value = key;
  router.push({query: {...route.query, tab: key}});
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

      <!-- 充值返利 -->
      <div v-if="activeTab == 'recharge'">
        <RebateRecharge />
      </div>

      <!-- 亏损返利 -->
      <div v-if="activeTab == 'loss'">
        <RebateLoss />
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.rebate-page {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.page-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #ff6600;
}

.page-tabs .tab {
  font-size: 14px;
  color: #666;
  padding: 10px 25px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  border-bottom: none;
  margin-bottom: -2px;
}

.page-tabs .tab:hover {
  color: #ff6600;
}

.page-tabs .tab.active {
  color: #ff6600;
  background: #fff8f0;
  border-color: #ff6600;
  border-bottom-color: #fff8f0;
}

.rebate-table {
  border: 1px solid #eee;
  overflow: hidden;
}

.rebate-table table {
  width: 100%;
  border-collapse: collapse;
}

.rebate-table th,
.rebate-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.rebate-table th {
  background: #fafafa;
  color: #666;
  font-weight: normal;
}

.rebate-table td {
  color: #333;
}

.rebate-table tr:hover td {
  background: #fafafa;
}

.rebate-table .rebate-amount {
  color: #ff6600;
  font-weight: bold;
}

.rebate-table .status {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  border-radius: 4px;
  background: #f5f5f5;
  color: #999;
}

.rebate-table .status.active {
  background: #fff0e6;
  color: #ff6600;
}

.rebate-table .status.done {
  background: #e6ffe6;
  color: #52c41a;
}

.empty-cell {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
