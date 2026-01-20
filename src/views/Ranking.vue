<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MainLayout from '@/components/layout/MainLayout.vue'

const { t } = useI18n()
</script>

<template>
  <MainLayout>
    <div class="ranking-page">
      <h1 class="page-title">{{ t('ranking.title') }}</h1>

      <div class="ranking-tabs">
        <div class="tab-group">
          <button class="tab-btn active">{{ t('ranking.today') }}</button>
          <button class="tab-btn">{{ t('ranking.yesterday') }}</button>
        </div>
        <div class="tab-group">
          <button class="tab-btn active">{{ t('ranking.profit') }}</button>
          <button class="tab-btn">{{ t('ranking.loss') }}</button>
        </div>
      </div>

      <div class="ranking-table">
        <div class="table-header">
          <span class="col-rank">{{ t('ranking.rank') }}</span>
          <span class="col-user">{{ t('ranking.user') }}</span>
          <span class="col-amount">{{ t('ranking.amount') }}</span>
        </div>
        <div class="table-body">
          <div class="no-data">{{ t('common.noData') }}</div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.ranking-page {
  padding: 20px 0;
}

.page-title {
  color: #fff;
  font-size: 28px;
  margin-bottom: 30px;
}

.ranking-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.tab-group {
  display: flex;
  gap: 5px;
  background: #16162a;
  padding: 5px;
  border-radius: 8px;
}

.tab-btn {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn:hover {
  color: #e74c3c;
}

.tab-btn.active {
  background: #e74c3c;
  color: #fff;
}

.ranking-table {
  background: #16162a;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  padding: 15px 20px;
  background: rgba(231, 76, 60, 0.2);
  color: #fff;
  font-weight: 500;
}

.col-rank {
  width: 100px;
}

.col-user {
  flex: 1;
}

.col-amount {
  width: 150px;
  text-align: right;
}

.table-body {
  min-height: 300px;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: #666;
}
</style>
