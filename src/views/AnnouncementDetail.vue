<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import { getIndexDetail } from '@/api/home'
import type { IndexDataItem } from '@/types/index.type'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const announcement = ref<IndexDataItem | null>(null)

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取公告详情
const fetchDetail = async () => {
  const id = Number(route.params.id)
  if (!id) {
    router.push('/')
    return
  }

  loading.value = true
  try {
    const res = await getIndexDetail(id)
    if (res.code === 200 && res.data) {
      announcement.value = res.data
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('获取公告详情失败:', error)
    router.push('/')
  } finally {
    loading.value = false
  }
}

// 返回公告列表（首页）
const goBack = () => {
  router.push('/')
}

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <MainLayout>
    <div class="announcement-detail-page">
      <div class="announcement-container">
        <!-- Loading -->
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- Content -->
        <template v-else-if="announcement">
          <!-- Title -->
          <h1 class="announcement-title">{{ announcement.title }}</h1>

          <!-- Meta -->
          <div class="announcement-meta">
            <span class="date">{{ formatDate(announcement.created_at) }}</span>
            <a href="javascript:void(0)" class="back-link" @click="goBack">返回公告列表</a>
          </div>

          <!-- Divider -->
          <div class="divider"></div>

          <!-- Content -->
          <div class="announcement-content" v-html="announcement.content"></div>

          <!-- Signature -->
          <div class="announcement-signature">
            鼎丰28运营部
          </div>
        </template>

        <!-- Not Found -->
        <div v-else class="not-found">
          <p>公告不存在或已删除</p>
          <a href="javascript:void(0)" @click="goBack">返回首页</a>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.announcement-detail-page {
  padding: 30px 0;
  min-height: calc(100vh - 300px);
  background: #f5f5f5;
}

.announcement-container {
  width: 1200px;
  margin: 0 auto;
  background: #fff;
  padding: 40px 60px;
  min-height: 400px;
}

/* Title */
.announcement-title {
  text-align: center;
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

/* Meta */
.announcement-meta {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-bottom: 20px;
}

.announcement-meta .date {
  margin-right: 20px;
}

.announcement-meta .back-link {
  color: #e65c00;
  text-decoration: none;
}

.announcement-meta .back-link:hover {
  text-decoration: underline;
}

/* Divider */
.divider {
  height: 1px;
  background: #eee;
  margin: 20px 0 30px 0;
}

/* Content */
.announcement-content {
  font-size: 14px;
  line-height: 2;
  color: #666;
  min-height: 200px;
}

.announcement-content :deep(p) {
  margin: 0 0 10px 0;
}

.announcement-content :deep(span) {
  color: #e65c00;
}

.announcement-content :deep(a) {
  color: #1890ff;
}

/* Signature */
.announcement-signature {
  text-align: right;
  font-size: 14px;
  color: #333;
  margin-top: 60px;
  padding-top: 20px;
}

/* Loading */
.loading {
  text-align: center;
  padding: 100px 0;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f0f0f0;
  border-top-color: #e65c00;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 100px 0;
  color: #999;
}

.not-found a {
  color: #e65c00;
  text-decoration: none;
  margin-top: 15px;
  display: inline-block;
}

.not-found a:hover {
  text-decoration: underline;
}
</style>
