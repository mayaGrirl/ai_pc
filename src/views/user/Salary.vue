<script setup lang="ts">

import {ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import UserLayout from '@/components/layout/UserLayout.vue'
import SalaryIntro from './components/SalaryIntro.vue'
import SalaryRecord from './components/SalaryRecord.vue'
import SalaryReceive from './components/SalaryReceive.vue'

const route = useRoute()
const router = useRouter()

// 当前标签
const activeTab = ref(route.query.tab as string || 'intro')
const tabs = [
  {key: 'intro', name: '工资概况'},
  {key: 'receive', name: '领取工资'},
  {key: 'record', name: '工资日记录'}
]
const switchTab = (key: string) => {
  activeTab.value = key
  router.push({query: {...route.query, tab: key}})
}
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          :class="['w-20 text-center text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 ', { 'text-[#ff6600] border-b-[#ff6600]': activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          {{ tab.name }}
        </span>
      </div>

      <!-- 工资概况 -->
      <div v-if="activeTab === 'intro'">
        <SalaryIntro />
      </div>

      <!-- 领取工资 -->
      <div v-if="activeTab === 'receive'">
        <SalaryReceive />
      </div>

      <!-- 每日工资 -->
      <div v-if="activeTab === 'record'">
        <SalaryRecord />
      </div>
    </div>
  </UserLayout>
</template>
