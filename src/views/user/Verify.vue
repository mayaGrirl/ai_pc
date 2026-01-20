<script setup lang="ts">
import { ref, computed } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const customer = computed(() => authStore.currentCustomer)

// 手机号码(脱敏显示)
const maskedPhone = computed(() => {
  const phone = customer.value?.phone || '13700008069'
  if (phone.length >= 11) {
    return phone.substring(0, 3) + '****' + phone.substring(7)
  }
  return phone
})

const verifyCode = ref('')
const countdown = ref(0)
let timer: any = null

const sendCode = () => {
  if (countdown.value > 0) return
  // 模拟发送验证码
  alert('验证码已发送')
  countdown.value = 60
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const handleVerify = () => {
  if (!verifyCode.value.trim()) {
    alert('请输入验证码')
    return
  }
  // 模拟验证
  alert('验证成功！')
}
</script>

<template>
  <UserLayout>
    <div class="verify-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">验证手机</span>
      </div>

      <!-- 提示信息 -->
      <div class="verify-notice">
        请验证注册手机是否正常收到短信，如无法正常接收短信请联系客服更换!
      </div>

      <!-- 验证表单 -->
      <div class="verify-form">
        <div class="form-row">
          <label class="form-label">手机号码</label>
          <span class="phone-number">{{ maskedPhone }}</span>
        </div>
        <div class="form-row">
          <label class="form-label">验证码</label>
          <div class="code-input-group">
            <input type="text" v-model="verifyCode" class="form-input" placeholder="验证码" />
            <button class="btn-send" @click="sendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? countdown + 's' : '获取验证码' }}
            </button>
          </div>
        </div>
        <div class="form-row">
          <label class="form-label"></label>
          <button class="btn-submit" @click="handleVerify">立即验证</button>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.verify-page {
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

.verify-notice {
  background: #fff8f0;
  border: 1px solid #ffe0b3;
  border-radius: 4px;
  padding: 12px 15px;
  font-size: 13px;
  color: #ff6600;
}

.verify-form {
  padding: 20px 0;
  max-width: 500px;
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

.phone-number {
  font-size: 14px;
  color: #333;
}

.code-input-group {
  display: flex;
  gap: 10px;
}

.form-input {
  width: 150px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.form-input:focus {
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
</style>
