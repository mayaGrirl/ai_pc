<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <div class="not-found-page">
    <div class="content">
      <h1 class="error-code">404</h1>
      <p class="error-message">Page Not Found</p>
      <button class="btn-home" @click="router.push('/')">
        {{ t('nav.home') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a14 0%, #1a1a2e 50%, #16213e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #e74c3c;
  margin: 0;
  line-height: 1;
}

.error-message {
  color: #888;
  font-size: 24px;
  margin: 20px 0 40px;
}

.btn-home {
  padding: 12px 40px;
  background: linear-gradient(135deg, #e74c3c, #c0392b);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(231, 76, 60, 0.3);
}
</style>
