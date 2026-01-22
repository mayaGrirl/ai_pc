<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { login } from '@/api/auth'
import { httpConfigRKey } from '@/api/common'
import SodiumEncryptor from '@/utils/sodium'
import MainLayout from '@/components/layout/MainLayout.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const errorMsg = ref('')
const publicKey = ref('')

const form = reactive({
  mobile: '',
  password: '',
  rememberMe: false
})

// 获取公钥
onMounted(() => {
  httpConfigRKey().then(({ data, code }) => {
    if (code === 200 && data) {
      publicKey.value = data.key
      console.log('Public key loaded:', data.key)
    }
  }).catch(error => {
    console.error('Failed to get public key:', error)
  })
})

const handleLogin = async () => {
  errorMsg.value = ''

  if (!form.mobile) {
    errorMsg.value = t('login.inputMobile')
    return
  }
  if (!form.password) {
    errorMsg.value = t('login.inputPassword')
    return
  }
  if (form.password.length < 6) {
    errorMsg.value = t('login.passwordError')
    return
  }

  // 检查公钥是否已获取
  if (!publicKey.value) {
    errorMsg.value = '系统初始化中，请稍后重试'
    return
  }

  loading.value = true

  try {
    // 加密密码
    const encryptedPassword = await SodiumEncryptor.encrypt(form.password, publicKey.value)
    console.log('Encrypted password:', encryptedPassword)

    const res = await login({
      mobile: form.mobile,
      password: encryptedPassword,
      type: 1
    })

    if (res.code === 200 && res.data) {
      authStore.setToken(
        res.data.access_token,
        res.data.token_type,
        res.data.expires_at
      )
      await authStore.fetchCurrentCustomer()
      const redirect = route.query.redirect as string || '/'
      router.push(redirect)
    } else {
      errorMsg.value = res.message || t('login.loginFailed')
    }
  } catch (error: unknown) {
    console.error('Login error:', error)
    errorMsg.value = t('login.loginFailed')
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <MainLayout>
    <div class="login-page">
      <div class="login-container">
        <!-- 页面标题 -->
        <h1 class="page-title">登 录</h1>

        <!-- 登录表单 -->
        <div class="login-form">
          <!-- 错误提示 -->
          <div v-if="errorMsg" class="error-message">
            {{ errorMsg }}
          </div>

          <!-- 手机号 -->
          <div class="form-group">
            <div class="input-wrapper">
              <span class="input-icon">📱</span>
              <input
                v-model="form.mobile"
                type="text"
                :placeholder="t('login.mobile')"
                maxlength="11"
              />
            </div>
          </div>

          <!-- 密码 -->
          <div class="form-group">
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                v-model="form.password"
                type="password"
                :placeholder="t('login.password')"
              />
            </div>
          </div>

          <!-- 记住我 & 忘记密码 -->
          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="form.rememberMe" type="checkbox" />
              <span>{{ t('login.rememberMe') }}（不是自己的电脑不要勾选）</span>
            </label>
            <router-link to="/forgot-password" class="forgot-link">
              {{ t('login.forgotPassword') }}?
            </router-link>
          </div>

          <!-- 按钮组 -->
          <div class="button-group">
            <button type="button" class="btn-submit" :disabled="loading" @click="handleLogin">
              <span v-if="loading" class="loading-spinner"></span>
              <span v-else>{{ t('common.login') }}</span>
            </button>
            <button type="button" class="btn-register" @click="goToRegister">
              {{ t('common.register') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.login-page {
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.login-container {
  width: 100%;
  max-width: 450px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 40px 50px;
}

.page-title {
  text-align: center;
  font-size: 28px;
  font-weight: normal;
  color: #333;
  margin-bottom: 40px;
  letter-spacing: 10px;
}

.login-form {
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

.form-group {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.input-wrapper:focus-within {
  border-color: #40a9ff;
}

.input-icon {
  padding: 12px 15px;
  background: #fafafa;
  border-right: 1px solid #ddd;
  font-size: 16px;
}

.input-wrapper input {
  flex: 1;
  padding: 12px 15px;
  border: none;
  font-size: 14px;
  outline: none;
}

.input-wrapper input::placeholder {
  color: #bbb;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  cursor: pointer;
}

.checkbox-label input {
  width: 14px;
  height: 14px;
}

.forgot-link {
  color: #999;
  text-decoration: none;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: #40a9ff;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.btn-submit,
.btn-register {
  flex: 1;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-submit {
  background: #40a9ff;
  border: 1px solid #40a9ff;
  color: #fff;
}

.btn-submit:hover {
  background: #1890ff;
  border-color: #1890ff;
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-register {
  background: #fff;
  border: 1px solid #ddd;
  color: #666;
}

.btn-register:hover {
  border-color: #40a9ff;
  color: #40a9ff;
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
