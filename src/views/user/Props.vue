<script setup lang="ts">
import { ref } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'

// 安全验证状态
const verified = ref(false)
const securityQuestion = ref('我父亲的姓名是什么?')
const answer = ref('')

// 安全问题列表
const securityQuestions = [
  '我父亲的姓名是什么?',
  '我母亲的姓名是什么?',
  '我的出生地是哪里?',
  '我的小学名称是什么?',
  '我最喜欢的颜色是什么?'
]

// 道具列表
interface Prop {
  id: number
  name: string
  type: string
  count: number
  expireTime: string
}

const props = ref<Prop[]>([])

const handleSubmit = () => {
  if (!answer.value.trim()) {
    alert('请输入答案')
    return
  }
  // 模拟验证成功
  verified.value = true
}
</script>

<template>
  <UserLayout>
    <div class="props-page">
      <!-- 页面标签 -->
      <div class="page-tabs">
        <span class="tab active">我的道具</span>
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
              <option v-for="q in securityQuestions" :key="q" :value="q">{{ q }}</option>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">答案</label>
            <input type="text" v-model="answer" class="form-input" placeholder="" />
          </div>
          <div class="form-row">
            <label class="form-label"></label>
            <button class="btn-submit" @click="handleSubmit">提交</button>
          </div>
        </div>
      </div>

      <!-- 验证后显示道具列表 -->
      <div v-else class="props-content">
        <div class="props-table">
          <table>
            <thead>
              <tr>
                <th>道具名称</th>
                <th>道具类型</th>
                <th>数量</th>
                <th>过期时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prop in props" :key="prop.id">
                <td>{{ prop.name }}</td>
                <td>{{ prop.type }}</td>
                <td>{{ prop.count }}</td>
                <td>{{ prop.expireTime }}</td>
                <td><button class="btn-use">使用</button></td>
              </tr>
              <tr v-if="props.length === 0">
                <td colspan="5" class="empty-cell">暂无道具</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.props-page {
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

/* 道具表格 */
.props-table {
  border: 1px solid #eee;
}

.props-table table {
  width: 100%;
  border-collapse: collapse;
}

.props-table th,
.props-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.props-table th {
  background: #fafafa;
  color: #666;
  font-weight: normal;
}

.props-table td {
  color: #333;
}

.props-table tr:hover td {
  background: #fafafa;
}

.btn-use {
  padding: 4px 12px;
  background: #ff6600;
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.btn-use:hover {
  opacity: 0.9;
}

.empty-cell {
  text-align: center;
  color: #999;
  padding: 40px 0;
}
</style>
