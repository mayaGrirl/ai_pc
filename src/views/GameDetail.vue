<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/components/layout/MainLayout.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const gameId = route.params.id
</script>

<template>
  <MainLayout>
    <div class="game-detail-page">
      <div class="back-btn" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        {{ t('common.cancel') }}
      </div>

      <div class="game-container">
        <div class="game-placeholder">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
          </div>
          <h2>Game #{{ gameId }}</h2>
          <p>{{ t('common.noData') }}</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.game-detail-page {
  padding: 20px 0;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #888;
  cursor: pointer;
  margin-bottom: 20px;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #e74c3c;
}

.game-container {
  background: #16162a;
  border-radius: 12px;
  min-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-placeholder {
  text-align: center;
  color: #666;
}

.game-placeholder .icon {
  color: #333;
  margin-bottom: 20px;
}

.game-placeholder h2 {
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
}

.game-placeholder p {
  color: #666;
}
</style>
