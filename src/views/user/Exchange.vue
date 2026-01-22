<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { cardRecords } from '@/api/shop'
import { checkSecurityPass } from '@/api/customer'
import type { CardRecordField } from '@/types/shop.type'

// 安全验证状态
const verified = ref(false)
const securityQuestion = ref('1')
const answer = ref('')
const verifying = ref(false)

// 安全问题列表
const securityQuestions = [
  { value: '1', label: '我父亲的姓名是什么?' },
  { value: '2', label: '我母亲的姓名是什么?' },
  { value: '3', label: '我的出生地是哪里?' },
  { value: '4', label: '我的小学名称是什么?' },
  { value: '5', label: '我最喜欢的颜色是什么?' }
]

// 兑奖记录
const records = ref<CardRecordField[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

// 验证密保问题
const handleSubmit = async () => {
  if (!answer.value.trim()) {
    alert('请输入答案')
    return
  }

  verifying.value = true
  try {
    const res = await checkSecurityPass({
      safe_ask: securityQuestion.value,
      answer: answer.value
    })
    if (res.code === 200) {
      verified.value = true
      loadRecords()
    } else {
      alert(res.message || '验证失败')
    }
  } catch (error) {
    alert('验证失败')
  } finally {
    verifying.value = false
  }
}

// 加载兑奖记录
const loadRecords = async () => {
  loading.value = true
  try {
    const res = await cardRecords({
      pagination: { page: currentPage.value, size: pageSize.value }
    })
    if (res.code === 200 && res.data) {
      records.value = res.data
    }
  } catch (error) {
    console.error('加载兑奖记录失败', error)
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timestamp: number | undefined) => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString('zh-CN')
}

// 格式化数字
const formatNumber = (num: number | undefined) => {
  if (num === undefined) return '0'
  return num.toLocaleString()
}

onMounted(() => {
  // 如果不需要密保验证可以直接加载
  // loadRecords()
})
</script>

<template>
  <UserLayout>
    <div class="exchange-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">兑奖记录</span>
      </div>

      <!-- 未验证时显示安全验证表单 -->
      <div v-if="!verified" class="security-verify">
        <div class="verify-notice">
          <span class="notice-icon">!</span>
          你需要通过密保验证后才能查看这个页面!
        </div>

        <div class="verify-form">
          <div class="form-row">
            <label class="form-label">安全问题</label>
            <select v-model="securityQuestion" class="form-select">
              <option v-for="q in securityQuestions" :key="q.value" :value="q.value">{{ q.label }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">答案</label>
            <input type="text" v-model="answer" class="form-input" placeholder="请输入答案" />
          </div>
          <div class="form-row">
            <label class="form-label"></label>
            <button class="btn-submit" @click="handleSubmit" :disabled="verifying">
              {{ verifying ? '验证中...' : '提交' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 验证后显示兑奖记录 -->
      <div v-else class="exchange-content">
        <div v-if="loading" class="loading-state">加载中...</div>
        <div v-else class="exchange-table">
          <table>
            <thead>
              <tr>
                <th>卡号</th>
                <th>卡密</th>
                <th>类型</th>
                <th>金豆</th>
                <th>手续费</th>
                <th>状态</th>
                <th>兑换时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in records" :key="record.id">
                <td>{{ record.no || '-' }}</td>
                <td>{{ record.pwd || '-' }}</td>
                <td>{{ record.type_label || '-' }}</td>
                <td class="coin">{{ formatNumber(record.points) }}</td>
                <td>{{ formatNumber(record.sxf) }}</td>
                <td :class="['status', record.state === 1 ? 'done' : '']">{{ record.state_label || '-' }}</td>
                <td class="time">{{ formatTime(record.addtime) }}</td>
              </tr>
              <tr v-if="records.length === 0">
                <td colspan="7" class="empty-cell">暂无兑奖记录</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.exchange-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

/* 安全验证 */
.security-verify {
  padding: 40px 0;
}

.verify-notice {
  text-align: center;
  color: #ff6600;
  font-size: 14px;
  margin-bottom: 30px;
}

.notice-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border: 1px solid #ff6600;
  border-radius: 50%;
  margin-right: 8px;
  font-size: 12px;
}

.verify-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-label {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #333;
  margin-right: 15px;
}

.form-select,
.form-input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #ff6600;
}

.btn-submit {
  width: 200px;
  height: 40px;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:hover {
  opacity: 0.9;
}

/* 兑奖记录表格 */
.exchange-table {
  border: 1px solid #eee;
}

.exchange-table table {
  width: 100%;
  border-collapse: collapse;
}

.exchange-table th,
.exchange-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.exchange-table th {
  background: #fafafa;
  color: #666;
  font-weight: normal;
}

.exchange-table td {
  color: #333;
}

.exchange-table tr:hover td {
  background: #fafafa;
}

.exchange-table .status.done {
  color: #52c41a;
}

.exchange-table .time {
  color: #999;
}

.empty-cell {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.exchange-table .coin {
  color: #f03736;
  font-weight: bold;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
