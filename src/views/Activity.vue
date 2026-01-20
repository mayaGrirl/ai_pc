<script setup lang="ts">
import { ref, computed } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'

const activeTab = ref('ongoing') // ongoing, ended, preview

// Activity data matching the screenshot
const allActivities = ref([
  {
    id: 1,
    title: '2.8外围亏损返利',
    image: '/uploads/2022/12/activity1.jpg',
    time: '2021-01-01至长期',
    intro: '2.8外围群玩法亏损属于独立计算，不予其它任何系列游戏输赢累加。',
    details: [
      '单注下注大，小，单，双亏损返利5%',
      '单注组合下注小双，大单，小单，大双亏损返利10%'
    ],
    status: 'ongoing'
  },
  {
    id: 2,
    title: '投注返利',
    image: '/uploads/2022/12/activity2.jpg',
    time: '2021-01-01至长期',
    intro: '每日有效流水投注总额20,000以上可获得当日总投注总额的0.005%（封顶最高2000元）',
    details: [
      '1.投注额返利活动每周领取一次，当天的投注额返利24点以后结算；'
    ],
    status: 'ongoing'
  },
  {
    id: 3,
    title: '每日排行榜奖励',
    image: '/uploads/2022/12/activity3.jpg',
    time: '2021-01-01至长期',
    intro: '每日1至50名上榜就有奖',
    details: [
      '每日游戏排行榜1-50名均可获奖，奖励在次日自动发放。'
    ],
    status: 'ongoing'
  },
  {
    id: 4,
    title: '首充返利',
    image: '/uploads/2022/12/activity4.jpg',
    time: '2021-01-01至长期',
    intro: '首充返利天天有',
    details: [
      '有效流水达到当日首充的8倍，次日可获得首充金额的3%返利'
    ],
    status: 'ongoing'
  },
  {
    id: 5,
    title: '登录奖 - 亿万豆豆免费送',
    image: '/uploads/2022/12/activity5.jpg',
    time: '2021-01-01至长期',
    intro: '登录奖 - 亿万豆豆免费送',
    details: [],
    status: 'ongoing'
  }
])

const expandedItems = ref<Set<number>>(new Set())

const filteredActivities = computed(() => {
  if (activeTab.value === 'ongoing') {
    return allActivities.value.filter(a => a.status === 'ongoing')
  } else if (activeTab.value === 'ended') {
    return allActivities.value.filter(a => a.status === 'ended')
  } else {
    return allActivities.value.filter(a => a.status === 'preview')
  }
})

const toggleExpand = (id: number) => {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id)
  } else {
    expandedItems.value.add(id)
  }
}

const isExpanded = (id: number) => expandedItems.value.has(id)
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
        <div
          v-for="activity in filteredActivities"
          :key="activity.id"
          class="activity-item"
        >
          <!-- Left: Image -->
          <div class="activity-image">
            <img :src="activity.image" :alt="activity.title">
          </div>

          <!-- Middle: Content -->
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-time"><span class="label">活动时间：</span>{{ activity.time }}</p>
            <p class="activity-intro"><span class="label">活动简介：</span>{{ activity.intro }}</p>
            <template v-if="isExpanded(activity.id)">
              <p v-for="(detail, idx) in activity.details" :key="idx" class="activity-detail">
                {{ detail }}
              </p>
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
            <div class="stamp ongoing">进行中</div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredActivities.length === 0" class="empty-state">
          <p>暂无活动</p>
        </div>
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
</style>
