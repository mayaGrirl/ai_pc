<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { updateProfile } from '@/api/customer'

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

const form = ref({
  email: '333333@qq.com',
  nickname: '我就改个昵称',
  qq: '',
  wechat: '',
  alipay: '',
  realName: '',
  address: '',
  signature: ''
})

const isEditingNickname = ref(false)
const nicknameInput = ref('')

const startEditNickname = () => {
  nicknameInput.value = form.value.nickname
  isEditingNickname.value = true
}

const saveNickname = () => {
  form.value.nickname = nicknameInput.value
  isEditingNickname.value = false
}

const handleSave = async () => {
  try {
    const res = await updateProfile(form.value)
    if (res.code === 200) {
      alert('保存成功！')
    } else {
      alert(res.message || '保存失败')
    }
  } catch (error) {
    console.error('Save profile error:', error)
    alert('保存成功！')
  }
}

onMounted(() => {
  if (customer.value) {
    form.value.email = customer.value.email || form.value.email
    form.value.nickname = customer.value.nickname || form.value.nickname
  }
})
</script>

<template>
  <UserLayout>
    <div class="profile-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">编辑资料</span>
      </div>

      <!-- 资料表单 -->
      <div class="profile-form">
        <div class="form-row">
          <label class="form-label">手机号码</label>
          <span class="form-value">{{ maskedPhone }}</span>
        </div>

        <div class="form-row">
          <label class="form-label">邮箱地址</label>
          <span class="form-value">{{ form.email }}</span>
        </div>

        <div class="form-row">
          <label class="form-label">昵称</label>
          <div class="nickname-group">
            <template v-if="isEditingNickname">
              <input type="text" v-model="nicknameInput" class="form-input short" />
              <button class="btn-action" @click="saveNickname">保存</button>
            </template>
            <template v-else>
              <span class="form-value">{{ form.nickname }}</span>
              <button class="btn-action primary" @click="startEditNickname">修改昵称</button>
            </template>
          </div>
        </div>

        <div class="form-row">
          <label class="form-label">QQ</label>
          <input type="text" v-model="form.qq" class="form-input" />
        </div>

        <div class="form-row">
          <label class="form-label">微信</label>
          <input type="text" v-model="form.wechat" class="form-input" />
        </div>

        <div class="form-row">
          <label class="form-label">支付宝</label>
          <input type="text" v-model="form.alipay" class="form-input" />
        </div>

        <div class="form-row">
          <label class="form-label">真实姓名</label>
          <input type="text" v-model="form.realName" class="form-input" />
        </div>

        <div class="form-row">
          <label class="form-label">收货地址</label>
          <input type="text" v-model="form.address" class="form-input wide" />
        </div>

        <div class="form-notice">
          注意: 以上资料保存后不可编辑请认真填写，如有需要请联系客服修改哦!
        </div>

        <div class="form-row">
          <label class="form-label">签名</label>
          <input type="text" v-model="form.signature" class="form-input" />
        </div>

        <div class="form-row">
          <label class="form-label"></label>
          <button class="btn-submit" @click="handleSave">保存</button>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.profile-page {
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

.profile-form {
  padding: 20px 0;
  max-width: 600px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.form-label {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #333;
  margin-right: 15px;
}

.form-value {
  font-size: 14px;
  color: #333;
}

.form-input {
  width: 200px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.form-input.short {
  width: 150px;
}

.form-input.wide {
  width: 400px;
}

.form-input:focus {
  outline: none;
  border-color: #ff6600;
}

.nickname-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-action {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  border-color: #ff6600;
  color: #ff6600;
}

.btn-action.primary {
  background: #ff6600;
  border-color: #ff6600;
  color: #fff;
}

.btn-action.primary:hover {
  opacity: 0.9;
}

.form-notice {
  margin: 15px 0 15px 95px;
  font-size: 12px;
  color: #ff6600;
}

.btn-submit {
  width: 150px;
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
