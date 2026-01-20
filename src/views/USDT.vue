<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
</script>

<template>
  <MainLayout>
    <div class="usdt-page">
      <div class="page-card">
        <div class="page-header">
          <h1 class="page-title">USDT备用金</h1>
        </div>
        <div class="page-content">
          <div class="info-section">
            <h2>什么是USDT备用金？</h2>
            <p>USDT备用金是一种安全、便捷的数字货币充值方式。您可以使用USDT进行充值，享受更快的到账速度和更低的手续费。</p>
          </div>

          <div class="feature-list">
            <div class="feature-item">
              <span class="feature-icon">⚡</span>
              <div class="feature-info">
                <span class="feature-title">极速到账</span>
                <span class="feature-desc">区块链确认后即时到账</span>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">💰</span>
              <div class="feature-info">
                <span class="feature-title">手续费低</span>
                <span class="feature-desc">相比传统方式手续费更低</span>
              </div>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🔒</span>
              <div class="feature-info">
                <span class="feature-title">安全可靠</span>
                <span class="feature-desc">区块链技术保障资金安全</span>
              </div>
            </div>
          </div>

          <div class="action-section">
            <button class="btn-primary">立即充值</button>
            <button class="btn-secondary">查看教程</button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.usdt-page {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.page-card {
  width: 100%;
  max-width: 800px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.page-header {
  background: linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%);
  padding: 30px;
  text-align: center;
}

.page-title {
  color: #fff;
  font-size: 28px;
  margin: 0;
}

.page-content {
  padding: 40px;
}

.info-section {
  margin-bottom: 40px;
}

.info-section h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 15px;
}

.info-section p {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.feature-list {
  display: flex;
  gap: 20px;
  margin-bottom: 40px;
}

.feature-item {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #fff8f0;
  border-radius: 8px;
}

.feature-icon {
  font-size: 32px;
}

.feature-info {
  display: flex;
  flex-direction: column;
}

.feature-title {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.feature-desc {
  font-size: 12px;
  color: #999;
}

.action-section {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-primary {
  padding: 12px 40px;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
}

.btn-secondary {
  padding: 12px 40px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 16px;
  cursor: pointer;
}
</style>
