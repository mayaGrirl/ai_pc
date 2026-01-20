<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UserLayout from '@/components/layout/UserLayout.vue'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()

const customer = computed(() => authStore.currentCustomer)

// 当前操作类型
const activeTab = ref<'deposit' | 'withdraw'>('deposit')

// 表单数据
const form = ref({
  amount: ''
})

// 余额信息
const balanceInfo = computed(() => ({
  available: customer.value?.points || 0,
  bank: customer.value?.bank_balance || 288700
}))

const handleSubmit = () => {
  if (!form.value.amount) {
    alert('请输入金币数')
    return
  }
  // 处理存款/取款
  console.log(activeTab.value, form.value.amount)
}
</script>

<template>
  <UserLayout>
    <div class="bank-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">银行服务</span>
      </div>

      <!-- 余额信息 -->
      <div class="balance-info">
        <div class="balance-item">
          <span class="balance-label">流动资金:</span>
          <span class="balance-value highlight">{{ balanceInfo.available.toLocaleString() }}</span>
        </div>
        <div class="balance-item">
          <span class="balance-label">银行存款:</span>
          <span class="balance-value highlight">{{ balanceInfo.bank.toLocaleString() }}</span>
        </div>
      </div>

      <!-- 操作选项 -->
      <div class="operation-tabs">
        <label class="radio-item">
          <input type="radio" v-model="activeTab" value="deposit" />
          <span>存款</span>
        </label>
        <label class="radio-item">
          <input type="radio" v-model="activeTab" value="withdraw" />
          <span>取款</span>
        </label>
      </div>

      <!-- 操作表单 -->
      <div class="operation-form">
        <div class="form-row">
          <label class="form-label">金币数</label>
          <div class="form-control">
            <input
              v-model="form.amount"
              type="number"
              placeholder="请输入金币数"
            />
          </div>
        </div>
        <div class="form-row">
          <label class="form-label"></label>
          <div class="form-control">
            <button class="btn-submit" @click="handleSubmit">
              提交
            </button>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.bank-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-tabs {
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.page-tabs .tab {
  font-size: 14px;
  color: #666;
  cursor: pointer;
  padding-bottom: 12px;
  border-bottom: 2px solid transparent;
  margin-bottom: -16px;
}

.page-tabs .tab.active {
  color: #ff6600;
  border-bottom-color: #ff6600;
}

/* 余额信息 */
.balance-info {
  display: flex;
  gap: 30px;
  padding: 15px 0;
}

.balance-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.balance-label {
  font-size: 14px;
  color: #666;
}

.balance-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.balance-value.highlight {
  color: #ff6600;
}

/* 操作选项 */
.operation-tabs {
  display: flex;
  gap: 30px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.radio-item input {
  accent-color: #ff6600;
}

/* 操作表单 */
.operation-form {
  padding-top: 20px;
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

.form-control {
  width: 250px;
}

.form-control input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.form-control input:focus {
  border-color: #40a9ff;
}

.btn-submit {
  width: 100%;
  padding: 10px 20px;
  background: #40a9ff;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit:hover {
  background: #1890ff;
}
</style>
