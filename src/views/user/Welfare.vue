<script setup lang="ts">
import { ref, onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { getReliefData, receiveRelief } from '@/api/customer'
import type { MemberLevel } from '@/types/customer.type'

// 救济等级列表
const levelList = ref<MemberLevel[]>([])
const loading = ref(true)
const remainingReceiveCount = ref(0)
const limit = ref(10)
const isSubmitting = ref(false)

// 加载救济数据
const loadReliefData = async () => {
  loading.value = true
  try {
    const res = await getReliefData()
    if (res.code === 200 && res.data) {
      levelList.value = res.data.options || []
      limit.value = res.data.limit || 10

      let remaining = 0
      if (res.data.limit > res.data.receive_count) {
        remaining = res.data.limit - res.data.receive_count
      }
      remainingReceiveCount.value = remaining
    }
  } catch (error) {
    console.error('加载救济数据失败', error)
  } finally {
    loading.value = false
  }
}

// 领取救济
const handleClaim = async () => {
  if (remainingReceiveCount.value < 1) {
    alert('今日领取次数已用完')
    return
  }

  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const res = await receiveRelief()
    if (res.code === 200) {
      alert(res.message || '领取成功')
      remainingReceiveCount.value = remainingReceiveCount.value - 1
    } else {
      alert(res.message || '领取失败')
    }
  } catch (error) {
    alert('领取失败')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadReliefData()
})
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
            <span v-for="item in levelList" :key="item.level" class="amount-icon">
              <span class="icon-bag">🎁</span>
              <span class="icon-amount">{{ item.day_jiuji_point }}</span>
            </span>
          </div>
        </div>

        <div class="modal-body">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">加载中...</div>

          <!-- 规则列表 -->
          <div v-else class="rule-list">
            <div class="rule-header">
              <span class="col-level">等级</span>
              <span class="col-amount">救济金</span>
              <span class="col-rule">领取条件</span>
            </div>
            <div v-for="item in levelList" :key="item.level" class="rule-item">
              <span class="col-level">
                <img :src="`/skin/pc/wm/images/level/${item.level}.png`" width="20" />
              </span>
              <span class="col-amount coin">{{ item.day_jiuji_point }}</span>
              <span class="col-rule">金豆≤{{ item.day_jiuji_point }}时可领取，每日{{ limit }}次</span>
            </div>
          </div>

          <div class="verify-section">
            <button
              class="btn-claim"
              @click="handleClaim"
              :disabled="isSubmitting || remainingReceiveCount < 1"
            >
              {{ isSubmitting ? '领取中...' : `立即领取（剩余${remainingReceiveCount}次）` }}
            </button>
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

.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.rule-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.rule-header {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 2px solid #ff6600;
  font-weight: bold;
  color: #333;
  background: #fff8f0;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.rule-item:last-child {
  border-bottom: none;
}

.col-level {
  width: 80px;
  text-align: center;
}

.col-amount {
  width: 100px;
  text-align: center;
}

.col-amount.coin {
  color: #ff6600;
  font-weight: bold;
}

.col-rule {
  flex: 1;
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
