<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { rebateRecords } from '@/api/customer'

const activeTab = ref('deposit')
const tabs = [
  { key: 'deposit', name: '充值返利' },
  { key: 'loss', name: '亏损返利' },
  { key: 'group', name: '2.8群亏损返利' }
]

interface RebateRecord {
  id: number
  date: string
  validBet: number
  deposit: number
  rebate: number
  status: string
}

const records = ref<RebateRecord[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await rebateRecords({ type: activeTab.value })
    if (res.code === 200 && res.data) {
      records.value = res.data.map((item: any) => ({
        id: item.id,
        date: item.date || item.created_at,
        validBet: item.valid_bet || item.validBet || 0,
        deposit: item.deposit || item.recharge || 0,
        rebate: item.rebate || item.amount || 0,
        status: item.status_name || item.status || '未领取'
      }))
    }
  } catch (error) {
    console.error('Failed to load rebate records:', error)
    records.value = []
  } finally {
    loading.value = false
  }
}

const switchTab = (key: string) => {
  activeTab.value = key
  loadData()
}

const formatNumber = (num: number) => {
  return num?.toLocaleString() || '0'
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <UserLayout>
    <div class="rebate-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab', { active: activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          {{ tab.name }}
        </span>
      </div>

      <!-- 返利记录表格 -->
      <div class="rebate-table">
        <table>
          <thead>
            <tr>
              <th>日期</th>
              <th>有效流水</th>
              <th>充值</th>
              <th>返利</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ record.date }}</td>
              <td>{{ formatNumber(record.validBet) }}</td>
              <td>{{ formatNumber(record.deposit) }}</td>
              <td class="rebate-amount">{{ formatNumber(record.rebate) }}</td>
              <td>
                <span :class="['status', record.status === '已领取' ? 'done' : record.status === '可领取' ? 'active' : '']">
                  {{ record.status }}
                </span>
              </td>
            </tr>
            <tr v-if="records.length === 0 && !loading">
              <td colspan="5" class="empty-cell">无数据</td>
            </tr>
          </tbody>
        </table>
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
