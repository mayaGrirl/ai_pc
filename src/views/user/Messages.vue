<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { systemMessage } from '@/api/home'

interface Message {
  id: number
  title: string
  from: string
  time: string
  selected: boolean
}

const messages = ref<Message[]>([])
const loading = ref(true)
const selectAll = ref(false)

// 加载消息
onMounted(async () => {
  try {
    const res = await systemMessage({ pagination: { page: 1, size: 20 } })
    if (res.code === 200 && res.data) {
      messages.value = res.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        from: item.from || '系统',
        time: item.created_at || item.time,
        selected: false
      }))
    }
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loading.value = false
  }
})

const toggleSelectAll = () => {
  messages.value.forEach(msg => {
    msg.selected = selectAll.value
  })
}

const deleteSelected = () => {
  messages.value = messages.value.filter(msg => !msg.selected)
  selectAll.value = false
}
</script>

<template>
  <UserLayout>
    <div class="messages-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">消息中心</span>
      </div>

      <!-- 操作栏 -->
      <div class="action-bar">
        <button class="btn-delete" @click="deleteSelected">删除</button>
      </div>

      <!-- 消息列表表格 -->
      <div class="message-table">
        <table>
          <thead>
            <tr>
              <th class="col-checkbox">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" />
              </th>
              <th class="col-title">标题</th>
              <th class="col-from">来自</th>
              <th class="col-time">时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="msg in messages" :key="msg.id">
              <td class="col-checkbox">
                <input type="checkbox" v-model="msg.selected" />
              </td>
              <td class="col-title">{{ msg.title }}</td>
              <td class="col-from">{{ msg.from }}</td>
              <td class="col-time">{{ msg.time }}</td>
            </tr>
            <tr v-if="messages.length === 0 && !loading">
              <td colspan="4" class="empty-cell">无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.messages-page {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.page-tabs {
  display: flex;
  border-bottom: 2px solid #ff6600;
  padding-bottom: 0;
}

.page-tabs .tab {
  font-size: 14px;
  color: #ff6600;
  padding: 10px 20px;
  background: #fff8f0;
  border: 1px solid #ff6600;
  border-bottom: none;
  margin-bottom: -1px;
}

.action-bar {
  display: flex;
  gap: 10px;
}

.btn-delete {
  padding: 6px 15px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  border-color: #ff6600;
  color: #ff6600;
}

.message-table {
  border: 1px solid #eee;
}

.message-table table {
  width: 100%;
  border-collapse: collapse;
}

.message-table th,
.message-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.message-table th {
  background: #fafafa;
  color: #666;
  font-weight: normal;
}

.message-table td {
  color: #333;
}

.message-table tr:hover td {
  background: #fafafa;
}

.col-checkbox {
  width: 40px;
  text-align: center;
}

.col-title {
  min-width: 200px;
}

.col-from {
  width: 100px;
}

.col-time {
  width: 150px;
  color: #999;
}

.empty-cell {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
