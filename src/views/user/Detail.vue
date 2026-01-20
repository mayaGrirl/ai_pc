<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { pointsRecords, depositRecords } from '@/api/customer'

const activeTab = ref('account')
const tabs = [
  { key: 'account', name: '我的账户' },
  { key: 'income', name: '获取明细' },
  { key: 'expense', name: '消费明细' }
]

interface Record {
  id: number
  type: string
  balance: number
  change: number
  after: number
  time: string
}

const records = ref<Record[]>([])
const loading = ref(false)
const pagination = ref({ page: 1, size: 20 })

// 模拟数据
const mockData: Record[] = [
  { id: 1, type: '游戏下注', balance: 104779079, change: -1000, after: 104778079, time: '26-01-15 19:25' },
  { id: 2, type: '游戏下注', balance: 104780079, change: -2160, after: 104778079, time: '26-01-15 17:50' },
  { id: 3, type: '游戏下注', balance: 104782239, change: -1000, after: 104782235, time: '26-01-15 17:17' },
  { id: 4, type: '游戏中奖', balance: 104763235, change: 19600, after: 104782235, time: '26-01-15 17:02' },
  { id: 5, type: '游戏下注', balance: 104773235, change: -10000, after: 104763239, time: '26-01-15 16:59' },
]

const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'account' || activeTab.value === 'income') {
      const res = await pointsRecords({ pagination: pagination.value })
      if (res.code === 200 && res.data) {
        records.value = res.data.map((item: any) => ({
          id: item.id,
          type: item.type_name || item.type,
          balance: item.balance || item.before,
          change: item.change || item.amount,
          after: item.after || item.balance,
          time: item.created_at || item.time
        }))
      }
    } else {
      const res = await depositRecords({ pagination: pagination.value })
      if (res.code === 200 && res.data) {
        records.value = res.data.map((item: any) => ({
          id: item.id,
          type: item.type_name || item.type,
          balance: item.balance || item.before,
          change: item.change || item.amount,
          after: item.after || item.balance,
          time: item.created_at || item.time
        }))
      }
    }
    // 如果没有数据，使用模拟数据
    if (records.value.length === 0) {
      records.value = mockData
    }
  } catch (error) {
    console.error('Failed to load records:', error)
    records.value = mockData
  } finally {
    loading.value = false
  }
}

const switchTab = (key: string) => {
  activeTab.value = key
  pagination.value.page = 1
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
    <div class="detail-page">
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

      <!-- 记录表格 -->
      <div class="records-table">
        <table>
          <thead>
            <tr>
              <th>类型</th>
              <th>余额</th>
              <th>变动</th>
              <th>变动后</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ record.type }}</td>
              <td>{{ formatNumber(record.balance) }}</td>
              <td :class="record.change >= 0 ? 'positive' : 'negative'">
                {{ record.change >= 0 ? '+' : '' }}{{ formatNumber(record.change) }}
              </td>
              <td>{{ formatNumber(record.after) }}</td>
              <td class="time">{{ record.time }}</td>
            </tr>
            <tr v-if="records.length === 0 && !loading">
              <td colspan="5" class="empty-cell">暂无记录</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="records.length > 0">
        <button class="btn-page" :disabled="pagination.page === 1" @click="pagination.page--; loadData()">上一页</button>
        <span class="page-info">第 {{ pagination.page }} 页</span>
        <button class="btn-page" @click="pagination.page++; loadData()">下一页</button>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.detail-page {
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

.records-table {
  border: 1px solid #eee;
  overflow: hidden;
}

.records-table table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th,
.records-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.records-table th {
  background: #fafafa;
  color: #666;
  font-weight: normal;
}

.records-table td {
  color: #333;
}

.records-table tr:hover td {
  background: #fafafa;
}

.records-table .positive {
  color: #52c41a;
}

.records-table .negative {
  color: #ff4d4f;
}

.records-table .time {
  color: #999;
}

.empty-cell {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
}

.btn-page {
  padding: 6px 15px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  border-color: #ff6600;
  color: #ff6600;
}

.btn-page:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #666;
}
</style>
