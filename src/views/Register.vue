<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { registration, sendSmsToMobile } from '@/api/auth'
import { httpConfigRKey } from '@/api/common'
import SodiumEncryptor from '@/utils/sodium'
import MainLayout from '@/components/layout/MainLayout.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const errorMsg = ref('')
const publicKey = ref('')

// 推荐人key (从URL读取)
const recommend = computed(() => (route.query.t as string) || '')

const form = reactive({
  mobile: '',
  verify_code: '',
  password: '',
  confirm_password: ''
})

// 获取公钥
onMounted(async () => {
  try {
    const res = await httpConfigRKey()
    if (res.code === 200 && res.data) {
      publicKey.value = res.data.key
    }
  } catch (error) {
    console.error('Failed to get public key:', error)
  }
})

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 6) strength++
  if (pwd.length >= 8) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[^A-Za-z0-9]/.test(pwd)) strength++
  return Math.min(strength, 4)
})

const strengthText = computed(() => {
  const texts = ['', '弱', '中', '强', '很强']
  return texts[passwordStrength.value]
})

const handleSendCode = async () => {
  if (!form.mobile || form.mobile.length !== 11) {
    errorMsg.value = t('login.mobileError')
    return
  }

  sendingCode.value = true
  try {
    const res = await sendSmsToMobile(form.mobile)
    if (res.code === 200) {
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      errorMsg.value = res.message || 'Failed to send code'
    }
  } catch (error) {
    console.error('Send code error:', error)
  } finally {
    sendingCode.value = false
  }
}

const handleRegister = async () => {
  errorMsg.value = ''

  if (!form.mobile || form.mobile.length !== 11) {
    errorMsg.value = t('login.mobileError')
    return
  }
  if (!form.verify_code) {
    errorMsg.value = t('register.verifyCode')
    return
  }
  if (!form.password || form.password.length < 6) {
    errorMsg.value = t('login.passwordError')
    return
  }
  if (form.password !== form.confirm_password) {
    errorMsg.value = t('register.confirmPassword')
    return
  }

  loading.value = true

  try {
    // 加密密码
    let encryptedPassword = form.password
    let encryptedConfirmPassword = form.confirm_password
    if (publicKey.value) {
      encryptedPassword = await SodiumEncryptor.encrypt(form.password, publicKey.value)
      encryptedConfirmPassword = await SodiumEncryptor.encrypt(form.confirm_password, publicKey.value)
    }

    const res = await registration({
      mobile: form.mobile,
      verify_code: form.verify_code,
      password: encryptedPassword,
      confirm_password: encryptedConfirmPassword,
      recommend: recommend.value || undefined
    })

    if (res.code === 200 && res.data) {
      authStore.setToken(
        res.data.access_token,
        res.data.token_type,
        res.data.expires_at
      )
      await authStore.fetchCurrentCustomer()
      router.push('/')
    } else {
      errorMsg.value = res.message || t('register.registerFailed')
    }
  } catch (error) {
    console.error('Register error:', error)
    errorMsg.value = t('register.registerFailed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="register-page">
      <div class="register-container">
        <!-- 页面标题 -->
        <h1 class="page-title">
          <span class="highlight">免费注册</span>鼎丰28-幸运28领头羊,打造28行业信誉平台.
        </h1>

        <!-- 注册表单 -->
        <div class="register-form">
          <!-- 错误提示 -->
          <div v-if="errorMsg" class="error-message">
            {{ errorMsg }}
          </div>

          <!-- 手机号 -->
          <div class="form-row">
            <label class="form-label">手机号码</label>
            <div class="form-control">
              <input
                v-model="form.mobile"
                type="text"
                :placeholder="t('login.inputMobile')"
                maxlength="11"
              />
            </div>
          </div>

          <!-- 验证码 -->
          <div class="form-row">
            <label class="form-label"></label>
            <div class="form-control with-btn">
              <input
                v-model="form.verify_code"
                type="text"
                placeholder="验证码"
                maxlength="6"
              />
              <button
                type="button"
                class="btn-code"
                :disabled="countdown > 0 || sendingCode"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </button>
            </div>
          </div>

          <!-- 登录密码 -->
          <div class="form-row">
            <label class="form-label">登录密码</label>
            <div class="form-control">
              <input
                v-model="form.password"
                type="password"
                :placeholder="t('login.inputPassword')"
              />
            </div>
          </div>

          <!-- 密码强度 -->
          <div class="form-row" v-if="form.password">
            <label class="form-label"></label>
            <div class="form-control">
              <div class="password-strength">
                <span class="strength-label">密码强度</span>
                <div class="strength-bars">
                  <span :class="['bar', { active: passwordStrength >= 1 }]"></span>
                  <span :class="['bar', { active: passwordStrength >= 2 }]"></span>
                  <span :class="['bar', { active: passwordStrength >= 3 }]"></span>
                  <span :class="['bar', { active: passwordStrength >= 4 }]"></span>
                </div>
                <span class="strength-text">{{ strengthText }}</span>
              </div>
            </div>
          </div>

          <!-- 确认密码 -->
          <div class="form-row">
            <label class="form-label">确认密码</label>
            <div class="form-control">
              <input
                v-model="form.confirm_password"
                type="password"
                :placeholder="t('register.confirmPassword')"
              />
            </div>
          </div>

          <!-- 注册按钮 -->
          <div class="form-row">
            <label class="form-label"></label>
            <div class="form-control">
              <button type="button" class="btn-submit" :disabled="loading" @click="handleRegister">
                <span v-if="loading" class="loading-spinner"></span>
                <span v-else>注册</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.register-page {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.register-container {
  width: 100%;
  max-width: 700px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 40px 50px;
}

.page-title {
  text-align: center;
  font-size: 20px;
  font-weight: normal;
  color: #333;
  margin-bottom: 40px;
}

.page-title .highlight {
  color: #ff6600;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-message {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 13px;
  text-align: center;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.form-label {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #333;
  flex-shrink: 0;
}

.form-control {
  flex: 1;
  max-width: 350px;
}

.form-control input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.form-control input:focus {
  border-color: #ff6600;
}

.form-control input::placeholder {
  color: #bbb;
}

.form-control.with-btn {
  display: flex;
  gap: 10px;
}

.form-control.with-btn input {
  flex: 1;
}

.btn-code {
  padding: 10px 15px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
}

.btn-code:hover:not(:disabled) {
  border-color: #ff6600;
  color: #ff6600;
}

.btn-code:disabled {
  color: #999;
  cursor: not-allowed;
}

/* 密码强度 */
.password-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-label {
  font-size: 12px;
  color: #999;
}

.strength-bars {
  display: flex;
  gap: 4px;
}

.strength-bars .bar {
  width: 40px;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  transition: background 0.3s;
}

.strength-bars .bar.active:nth-child(1) {
  background: #ff4d4f;
}

.strength-bars .bar.active:nth-child(2) {
  background: #faad14;
}

.strength-bars .bar.active:nth-child(3) {
  background: #52c41a;
}

.strength-bars .bar.active:nth-child(4) {
  background: #1890ff;
}

.strength-text {
  font-size: 12px;
  color: #666;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit:hover {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
