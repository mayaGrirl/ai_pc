<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MainLayout from '@/components/layout/MainLayout.vue'
import { getIndexDetail } from '@/api/home'
import type { IndexDataItem } from '@/types/index.type'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const activity = ref<IndexDataItem | null>(null)
const loading = ref(true)

const getLocalizedTitle = computed(() => {
  if (!activity.value) return ''
  if (activity.value.lang_title && typeof activity.value.lang_title === 'object') {
    const langTitle = activity.value.lang_title as Record<string, string>
    return langTitle[locale.value] || activity.value.title
  }
  return activity.value.title
})

const getLocalizedContent = computed(() => {
  if (!activity.value) return ''
  if (activity.value.lang_content && typeof activity.value.lang_content === 'object') {
    const langContent = activity.value.lang_content as Record<string, string>
    return langContent[locale.value] || activity.value.content
  }
  return activity.value.content
})

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id) {
    router.push('/activity')
    return
  }

  try {
    const res = await getIndexDetail(id)
    if (res.code === 200 && res.data) {
      activity.value = res.data
    }
  } catch (error) {
    console.error('Failed to load activity detail:', error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="activity-detail-page">
      <div class="back-btn" @click="router.back()">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
        {{ t('common.cancel') }}
      </div>

      <div v-if="loading" class="loading">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="activity" class="detail-content">
        <div class="detail-header">
          <h1 class="detail-title">{{ getLocalizedTitle }}</h1>
          <p class="detail-date">
            {{ activity.start_at?.slice(0, 10) }} - {{ activity.end_at?.slice(0, 10) }}
          </p>
        </div>

        <div class="detail-image">
          <img :src="activity.pc_pic || activity.pic" :alt="activity.title" />
        </div>

        <div class="detail-body" v-html="getLocalizedContent"></div>
      </div>

      <div v-else class="no-data">
        {{ t('common.noData') }}
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.activity-detail-page {
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

.loading,
.no-data {
  text-align: center;
  color: #666;
  padding: 60px 0;
}

.detail-content {
  background: #16162a;
  border-radius: 12px;
  overflow: hidden;
}

.detail-header {
  padding: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-title {
  color: #fff;
  font-size: 24px;
  margin: 0 0 10px 0;
}

.detail-date {
  color: #888;
  font-size: 14px;
  margin: 0;
}

.detail-image {
  width: 100%;
}

.detail-image img {
  width: 100%;
  display: block;
}

.detail-body {
  padding: 30px;
  color: #ccc;
  line-height: 1.8;
}

.detail-body :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
