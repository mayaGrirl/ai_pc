<script setup lang="ts">
import { ref } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'

const activeTab = ref('options')
const tabs = [
  { key: 'options', name: '安全选项' },
  { key: 'password', name: '修改密码' }
]

// 安全选项表单
const securityOptions = ref({
  loginLocation: '11',
  loginVerify: 'none', // none, every, remote
  verifyMethod: 'sms' // sms, sms_only, sms_card
})

// 修改密码表单
const passwordForm = ref({
  securityQuestion: '我父亲的姓名是什么?',
  securityAnswer: '',
  newPassword: '',
  confirmPassword: '',
  newSecondPassword: '',
  confirmSecondPassword: ''
})

// 安全问题列表
const securityQuestions = [
  '我父亲的姓名是什么?',
  '我母亲的姓名是什么?',
  '我的出生地是哪里?',
  '我的小学名称是什么?',
  '我最喜欢的颜色是什么?'
]

const switchTab = (key: string) => {
  activeTab.value = key
}

const saveLoginLocation = () => {
  alert('登录地限制设置已保存')
}

const saveLoginVerify = () => {
  alert('登录手机验证设置已保存')
}

const saveVerifyMethod = () => {
  alert('验证方式设置已保存')
}

const handleChangePassword = () => {
  if (!passwordForm.value.securityAnswer) {
    alert('请输入密保答案')
    return
  }
  alert('密码修改成功！')
}
</script>

<template>
  <UserLayout>
    <div class="security-page">
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

      <!-- 安全选项 -->
      <div v-if="activeTab === 'options'" class="options-content">
        <!-- 登录地限制 -->
        <div class="option-section">
          <div class="option-header">
            <span class="option-title">登录地限制</span>
          </div>
          <div class="option-body">
            <div class="option-row">
              <span class="option-label">天</span>
              <input type="text" v-model="securityOptions.loginLocation" class="option-input" />
            </div>
            <div class="option-desc">只允许登录地：</div>
            <button class="btn-save" @click="saveLoginLocation">保存设置</button>
          </div>
        </div>

        <!-- 登录手机验证 -->
        <div class="option-section">
          <div class="option-header">
            <span class="option-title">登录手机验证</span>
          </div>
          <div class="option-body">
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="securityOptions.loginVerify" value="none" />
                <span>无</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="securityOptions.loginVerify" value="every" />
                <span>每次登录短信验证</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="securityOptions.loginVerify" value="remote" />
                <span>异地登录短信验证</span>
              </label>
            </div>
            <button class="btn-save" @click="saveLoginVerify">保存设置</button>
          </div>
        </div>

        <!-- 验证方式 -->
        <div class="option-section">
          <div class="option-header">
            <span class="option-title">验证方式</span>
          </div>
          <div class="option-body">
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="securityOptions.verifyMethod" value="sms" />
                <span>短信密保验证</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="securityOptions.verifyMethod" value="sms_only" />
                <span>仅发用手机短信验证</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="securityOptions.verifyMethod" value="sms_card" />
                <span>首套卡使用手机短信验证</span>
              </label>
            </div>
            <button class="btn-save" @click="saveVerifyMethod">保存设置</button>
          </div>
        </div>
      </div>

      <!-- 修改密码 -->
      <div v-else class="password-content">
        <div class="password-form">
          <!-- 验证密保 -->
          <div class="form-section">
            <div class="section-title">验证密保</div>
            <div class="form-row">
              <select v-model="passwordForm.securityQuestion" class="form-select">
                <option v-for="q in securityQuestions" :key="q" :value="q">{{ q }}</option>
              </select>
            </div>
            <div class="form-row">
              <input type="text" v-model="passwordForm.securityAnswer" class="form-input" placeholder="输入当前密保答案" />
            </div>
          </div>

          <!-- 修改登录密码 -->
          <div class="form-section">
            <div class="section-title">修改登录密码</div>
            <div class="form-row">
              <input type="password" v-model="passwordForm.newPassword" class="form-input" placeholder="新登录密码" />
            </div>
            <div class="form-row">
              <input type="password" v-model="passwordForm.confirmPassword" class="form-input" placeholder="再输入一次新登录密码" />
            </div>
            <div class="form-hint">如果不修改登录密码请留空</div>
          </div>

          <!-- 修改二级密码 -->
          <div class="form-section">
            <div class="section-title">修改二级密码</div>
            <div class="form-row">
              <input type="password" v-model="passwordForm.newSecondPassword" class="form-input" placeholder="新二级密码" />
            </div>
            <div class="form-row">
              <input type="password" v-model="passwordForm.confirmSecondPassword" class="form-input" placeholder="再输入一次新二级密码" />
            </div>
            <div class="form-hint">如果不修改二级密码请留空</div>
          </div>

          <div class="form-action">
            <button class="btn-submit" @click="handleChangePassword">确定修改</button>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.security-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

/* 安全选项 */
.options-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.option-section {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.option-header {
  padding: 12px 15px;
  background: #fafafa;
  border-bottom: 1px solid #eee;
}

.option-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.option-body {
  padding: 20px 15px;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.option-label {
  font-size: 14px;
  color: #333;
}

.option-input {
  width: 60px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.option-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 15px;
}

.radio-group {
  display: flex;
  gap: 25px;
  margin-bottom: 15px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
}

.radio-item input {
  accent-color: #ff6600;
}

.btn-save {
  padding: 8px 20px;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-save:hover {
  opacity: 0.9;
}

/* 修改密码 */
.password-content {
  padding: 20px 0;
}

.password-form {
  max-width: 450px;
}

.form-section {
  margin-bottom: 25px;
}

.section-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.form-row {
  margin-bottom: 12px;
}

.form-select,
.form-input {
  width: 100%;
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

.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.form-action {
  margin-top: 30px;
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
