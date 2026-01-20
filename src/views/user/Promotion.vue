<script setup lang="ts">
import UserLayout from '@/components/layout/UserLayout.vue'
</script>
<template>
  <UserLayout>
    <div class="promotion-page">
      <div class="page-tabs"><span class="tab active">推广赚币</span></div>
      <div class="promo-content">
        <div class="promo-link">
          <span class="label">您的推广链接:</span>
          <input type="text" value="https://df28.co/u/12345" readonly />
          <button class="btn-copy">复制</button>
        </div>
        <div class="promo-stats">
          <div class="stat-item"><span class="value">0</span><span class="label">今日邀请</span></div>
          <div class="stat-item"><span class="value">0</span><span class="label">累计邀请</span></div>
          <div class="stat-item"><span class="value">0</span><span class="label">累计收益</span></div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>
<style scoped>
.promotion-page { display: flex; flex-direction: column; gap: 20px; }
.page-tabs { display: flex; border-bottom: 1px solid #eee; padding-bottom: 15px; }
.page-tabs .tab { font-size: 14px; color: #ff6600; border-bottom: 2px solid #ff6600; padding-bottom: 12px; margin-bottom: -16px; }
.promo-content { padding: 20px 0; }
.promo-link { display: flex; align-items: center; gap: 10px; margin-bottom: 30px; }
.promo-link .label { font-size: 14px; color: #333; }
.promo-link input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
.btn-copy { padding: 10px 20px; background: #ff6600; border: none; color: #fff; border-radius: 4px; cursor: pointer; }
.promo-stats { display: flex; gap: 30px; }
.stat-item { text-align: center; padding: 20px 40px; background: #fff8f0; border-radius: 4px; }
.stat-item .value { display: block; font-size: 24px; font-weight: bold; color: #ff6600; }
.stat-item .label { display: block; font-size: 12px; color: #999; margin-top: 5px; }
</style>
