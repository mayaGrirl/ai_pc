<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { getActivitiesByStatus } from '@/api/home'
import type { IndexDataItem } from '@/types/index.type'

const activeTab = ref('ongoing') // ongoing, ended, preview
const activities = ref<IndexDataItem[]>([])
const loading = ref(false)
const expandedItems = ref<Set<number>>(new Set())

// 根据tab获取对应的is_expired值
const getExpiredValue = (tab: string): '-1' | '0' | '1' => {
  switch (tab) {
    case 'ongoing': return '0'   // 进行中
    case 'ended': return '1'     // 已结束
    case 'preview': return '-1'  // 活动预告
    default: return '0'
  }
}

// 获取活动数据
const fetchActivities = async () => {
  loading.value = true
  try {
    const is_expired = getExpiredValue(activeTab.value)
    const res = await getActivitiesByStatus(is_expired)
    if (res.code === 200 && res.data) {
      activities.value = res.data
    } else {
      activities.value = []
    }
  } catch (error) {
    console.error('获取活动列表失败:', error)
    activities.value = []
  } finally {
    loading.value = false
  }
}

// 格式化活动时间
const formatTime = (item: IndexDataItem) => {
  const start = item.start_at || ''
  const end = item.end_at || '长期'
  if (start && end) {
    return `${start.split(' ')[0]}至${end === '长期' ? end : end.split(' ')[0]}`
  }
  return '长期有效'
}

// 获取状态文本
const getStatusText = () => {
  switch (activeTab.value) {
    case 'ongoing': return '进行中'
    case 'ended': return '已结束'
    case 'preview': return '未开始'
    default: return '进行中'
  }
}

const toggleExpand = (id: number) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

const isExpanded = (id: number) => expandedItems.value.has(id)

// 监听tab变化
watch(activeTab, () => {
  fetchActivities()
})

// 初始化加载
onMounted(() => {
  fetchActivities()
})
</script>

<template>
  <MainLayout>
    <div class="activity-container">
      <!-- Navigation Tabs -->
      <div class="activity-tabs">
        <span
          :class="['tab-item', { active: activeTab === 'ongoing' }]"
          @click="activeTab = 'ongoing'"
        >进行中的活动</span>
        <span
          :class="['tab-item', { active: activeTab === 'ended' }]"
          @click="activeTab = 'ended'"
        >已结束的活动</span>
        <span
          :class="['tab-item', { active: activeTab === 'preview' }]"
          @click="activeTab = 'preview'"
        >活动预告</span>
      </div>

      <!-- Activity List -->
      <div class="activity-list">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <p>加载中...</p>
        </div>

        <template v-else>
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="activity-item"
          >
            <!-- Left: Image -->
            <div class="activity-image">
              <img :src="activity.pc_pic || activity.pic" :alt="activity.title">
            </div>

            <!-- Middle: Content -->
            <div class="activity-content">
              <h3 class="activity-title">{{ activity.title }}</h3>
              <p class="activity-time"><span class="label">活动时间：</span>{{ formatTime(activity) }}</p>
              <p class="activity-intro"><span class="label">活动简介：</span>{{ activity.content?.replace(/<[^>]+>/g, '').substring(0, 100) }}...</p>
              <template v-if="isExpanded(activity.id)">
                <div class="activity-detail" v-html="activity.content"></div>
              </template>
              <button
                type="button"
                class="expand-btn"
                @click="toggleExpand(activity.id)"
              >
                <span v-if="!isExpanded(activity.id)">&#10095; 展开更多</span>
                <span v-else>&#10094; 收起</span>
              </button>
            </div>

            <!-- Right: Status Stamp -->
            <div class="activity-stamp">
              <div :class="['stamp', activeTab]">{{ getStatusText() }}</div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="activities.length === 0" class="empty-state">
            <p>暂无活动</p>
          </div>
        </template>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.activity-container {
  width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
  background: #f5f5f5;
  min-height: 600px;
}

/* Navigation Tabs */
.activity-tabs {
  background: #fff;
  padding: 0;
  margin-bottom: 0;
  border-bottom: 1px solid #e8e8e8;
}

.tab-item {
  display: inline-block;
  padding: 15px 30px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-item:hover {
  color: #f03736;
}

.tab-item.active {
  color: #333;
  border-bottom-color: #f03736;
}

/* Activity List */
.activity-list {
  background: #fff;
  padding: 20px;
}

.activity-item {
  display: flex;
  padding: 20px 0;
  border-bottom: 1px solid #e8e8e8;
  position: relative;
}

.activity-item:last-child {
  border-bottom: none;
}

/* Activity Image */
.activity-image {
  width: 280px;
  height: 160px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 4px;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Activity Content */
.activity-content {
  flex: 1;
  padding: 0 20px;
  padding-right: 120px;
}

.activity-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
  margin: 0 0 10px 0;
}

.activity-time,
.activity-intro,
.activity-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 5px 0;
}

.activity-time .label,
.activity-intro .label {
  color: #999;
}

.activity-intro {
  color: #f60;
}

.activity-detail {
  color: #666;
}

.expand-btn {
  display: inline-block;
  margin-top: 10px;
  padding: 6px 15px;
  background: #1E9FFF;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.expand-btn:hover {
  background: #1890ff;
}

/* Activity Stamp */
.activity-stamp {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 80px;
  height: 80px;
}

.stamp {
  width: 80px;
  height: 80px;
  border: 3px solid #f03736;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #f03736;
  transform: rotate(-15deg);
  opacity: 0.9;
}

.stamp.ongoing {
  border-color: #f03736;
  color: #f03736;
}

.stamp.ended {
  border-color: #999;
  color: #999;
}

.stamp.preview {
  border-color: #1E9FFF;
  color: #1E9FFF;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 14px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
  font-size: 14px;
}

/* Activity Detail HTML Content */
.activity-detail {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  margin: 10px 0;
}

.activity-detail :deep(img) {
  max-width: 100%;
  height: auto;
}

.activity-detail :deep(p) {
  margin: 5px 0;
}
</style>
