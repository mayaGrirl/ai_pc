<script setup lang="ts">
import { ref } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'

const redpacketCode = ref('')

const handleSubmit = () => {
  if (!redpacketCode.value.trim()) {
    alert('请输入红包码')
    return
  }
  // 模拟提交
  alert('红包领取成功！')
  redpacketCode.value = ''
}
</script>

<template>
  <UserLayout>
    <div class="redpacket-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">我的红包</span>
      </div>

      <!-- 红包码输入表单 -->
      <div class="redpacket-form">
        <div class="form-row">
          <label class="form-label">输入红包码</label>
          <input type="text" v-model="redpacketCode" class="form-input" placeholder="" />
        </div>
        <div class="form-row">
          <label class="form-label"></label>
          <button class="btn-submit" @click="handleSubmit">提交</button>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.redpacket-page {
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

.redpacket-form {
  padding: 30px 0;
  max-width: 450px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-label {
  width: 100px;
  text-align: right;
  font-size: 14px;
  color: #333;
  margin-right: 15px;
}

.form-input {
  flex: 1;
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
