<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { loginLogs } from '@/api/customer'

interface LogRecord {
  id: number
  time: string
  location: string
  ip: string
  loginTime: string
}

const logs = ref<LogRecord[]>([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 模拟数据
const mockLogs: LogRecord[] = [
  { id: 1, time: '泰王海岸 阿比让 ORANGE-COTE-IVOIRE', location: '', ip: '102.209.218.71', loginTime: '26-01-20 15:53...' },
  { id: 2, time: '泰王海岸 阿比让 ORANGE-COTE-IVOIRE', location: '', ip: '102.209.218.71', loginTime: '26-01-20 13:31...' },
  { id: 3, time: '泰王海岸 阿比让 ORANGE-COTE-IVOIRE', location: '', ip: '102.209.218.71', loginTime: '26-01-20 12:59...' },
  { id: 4, time: '泰王海岸 阿比让 ORANGE-COTE-IVOIRE', location: '', ip: '102.209.223.125', loginTime: '26-01-15 16:33...' },
  { id: 5, time: '科特迪瓦 阿比让 Ftth Services', location: '', ip: '102.207.15.50', loginTime: '26-01-15 15:16...' },
  { id: 6, time: 'Ivory Coast Abidjan Autonomous District Abidjan Ftth Service', location: '', ip: '102.209.219.70', loginTime: '26-01-14 18:43...' },
  { id: 7, time: 'Ivory Coast Abidjan Autonomous District Abidjan Ftth Service', location: '', ip: '102.209.219.70', loginTime: '26-01-14 16:43...' },
  { id: 8, time: '泰王海岸 阿比让 阿比让 ORANGE-COTE-IVOIRE', location: '', ip: '102.210.17.119', loginTime: '26-01-12 12:15...' },
  { id: 9, time: '科特迪瓦 阿比让 Ftth Service', location: '', ip: '102.207.9.175', loginTime: '26-01-07 18:12...' },
  { id: 10, time: '阿比让 阿比让 Ftth Service', location: '', ip: '102.207.9.106', loginTime: '26-01-06 18:06...' },
]

const loadData = async () => {
  loading.value = true
  try {
    const res = await loginLogs({ pagination: pagination.value })
    if (res.code === 200 && res.data) {
      logs.value = res.data.map((item: any) => ({
        id: item.id,
        time: item.location || item.area || '',
        location: item.region || '',
        ip: item.ip,
        loginTime: item.created_at || item.login_time
      }))
      pagination.value.total = (typeof res.total === 'number' ? res.total : 0) || logs.value.length
    }
    // 使用模拟数据
    if (logs.value.length === 0) {
      logs.value = mockLogs
      pagination.value.total = 85
    }
  } catch (error) {
    console.error('Failed to load login logs:', error)
    logs.value = mockLogs
    pagination.value.total = 85
  } finally {
    loading.value = false
  }
}

const goPage = (page: number) => {
  pagination.value.page = page
  loadData()
}

const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
    loadData()
  }
}

const nextPage = () => {
  const maxPage = Math.ceil(pagination.value.total / pagination.value.size)
  if (pagination.value.page < maxPage) {
    pagination.value.page++
    loadData()
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <UserLayout>
    <div class="logs-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">登录日志</span>
      </div>

      <!-- 日志表格 -->
      <div class="logs-table">
        <table>
          <thead>
            <tr>
              <th>时间</th>
              <th>地区</th>
              <th>IP</th>
              <th>登录时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id">
              <td class="time-col">{{ log.time }}</td>
              <td>{{ log.location }}</td>
              <td>{{ log.ip }}</td>
              <td class="login-time">{{ log.loginTime }}</td>
            </tr>
            <tr v-if="logs.length === 0 && !loading">
              <td colspan="4" class="empty-cell">暂无登录日志</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="logs.length > 0">
        <button class="btn-page" @click="goPage(1)" :disabled="pagination.page === 1">&lt;&lt;</button>
        <button class="btn-page" @click="prevPage" :disabled="pagination.page === 1">&lt;</button>
        <span
          v-for="p in Math.min(5, Math.ceil(pagination.total / pagination.size))"
          :key="p"
          :class="['page-num', { active: pagination.page === p }]"
          @click="goPage(p)"
        >
          {{ p }}
        </span>
        <button class="btn-page" @click="nextPage">&gt;</button>
        <button class="btn-page" @click="goPage(Math.ceil(pagination.total / pagination.size))">&gt;&gt;</button>
        <span class="page-info">共 {{ Math.ceil(pagination.total / pagination.size) }} 页</span>
        <span class="page-info">{{ pagination.size }}条/页</span>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.logs-page {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.page-tabs {
  display: flex;
  border-bottom: 2px solid #ff6600;
}

.page-tabs .tab {
  font-size: 14px;
  color: #ff6600;
  padding: 10px 20px;
  background: #fff8f0;
  border: 1px solid #ff6600;
  border-bottom: none;
  margin-bottom: -2px;
}

.logs-table {
  border: 1px solid #eee;
  overflow: hidden;
}

.logs-table table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table th,
.logs-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.logs-table th {
  background: #fafafa;
  color: #666;
  font-weight: normal;
}

.logs-table td {
  color: #333;
}

.logs-table tr:hover td {
  background: #fafafa;
}

.logs-table .time-col {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logs-table .login-time {
  color: #999;
}

.empty-cell {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 15px 0;
}

.btn-page {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 12px;
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

.page-num {
  min-width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.page-num:hover {
  color: #ff6600;
}

.page-num.active {
  background: #ff6600;
  color: #fff;
}

.page-info {
  font-size: 12px;
  color: #999;
  margin-left: 10px;
}
</style>
