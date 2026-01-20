<script setup lang="ts">
import { ref } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'

// 救济领取规则
const welfareRules = [
  { amount: 50, rule: '余额少于50，每日可领取10次', times: 10 },
  { amount: 60, rule: '余额少于60，每日可领取10次', times: 10 },
  { amount: 70, rule: '余额少于70，每日可领取10次', times: 10 },
  { amount: 80, rule: '余额少于80，每日可领取10次', times: 10 },
  { amount: 100, rule: '余额少于100，每日可领取10次', times: 10 },
  { amount: 120, rule: '余额少于120，每日可领取10次', times: 10 },
  { amount: 150, rule: '余额少于150，每日可领取10次', times: 10 },
  { amount: 200, rule: '余额少于200，每日可领取10次', times: 10 },
  { amount: 300, rule: '余额少于300，每日可领取10次', times: 10 },
  { amount: 500, rule: '余额少于500，每日可领取10次', times: 10 },
]

const verifyCode = ref('')
const countdown = ref(0)
let timer: any = null

const sendCode = () => {
  if (countdown.value > 0) return
  alert('验证码已发送')
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleClaim = () => {
  if (!verifyCode.value.trim()) {
    alert('请输入验证码')
    return
  }
  alert('领取成功！')
  verifyCode.value = ''
}
</script>

<template>
  <UserLayout>
    <div class="welfare-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">领救济</span>
      </div>

      <!-- 救济规则弹窗样式 -->
      <div class="welfare-modal">
        <div class="modal-header">
          <div class="header-icons">
            <span v-for="rule in welfareRules" :key="rule.amount" class="amount-icon">
              <span class="icon-bag">🎁</span>
              <span class="icon-amount">{{ rule.amount }}</span>
            </span>
          </div>
        </div>

        <div class="modal-body">
          <div class="rule-list">
            <div v-for="rule in welfareRules" :key="rule.amount" class="rule-item">
              <span class="rule-icon">🎁</span>
              <span class="rule-amount">{{ rule.amount }}</span>
              <span class="rule-text">{{ rule.rule }}</span>
            </div>
          </div>

          <div class="verify-section">
            <div class="verify-row">
              <input type="text" v-model="verifyCode" class="verify-input" placeholder="验证码" />
              <button class="btn-send" @click="sendCode" :disabled="countdown > 0">
                {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
              </button>
            </div>
            <button class="btn-claim" @click="handleClaim">立即领取</button>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.welfare-page {
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

/* 救济弹窗 */
.welfare-modal {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  max-width: 600px;
}

.modal-header {
  background: linear-gradient(135deg, #ff6600, #ff8533);
  padding: 15px 20px;
}

.header-icons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.amount-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.icon-bag {
  font-size: 24px;
}

.icon-amount {
  font-size: 12px;
  color: #fff;
  font-weight: bold;
}

.modal-body {
  padding: 20px;
}

.rule-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.rule-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-icon {
  font-size: 18px;
}

.rule-amount {
  font-size: 14px;
  font-weight: bold;
  color: #ff6600;
  min-width: 40px;
}

.rule-text {
  font-size: 13px;
  color: #666;
}

.verify-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.verify-row {
  display: flex;
  gap: 10px;
}

.verify-input {
  width: 150px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.verify-input:focus {
  outline: none;
  border-color: #ff6600;
}

.btn-send {
  padding: 0 15px;
  height: 38px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-send:hover:not(:disabled) {
  border-color: #ff6600;
  color: #ff6600;
}

.btn-send:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.btn-claim {
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

.btn-claim:hover {
  opacity: 0.9;
}
</style>
