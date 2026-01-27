<script setup lang="ts">
import DataTable from '@/components/ui/DataTable.vue'
import {useTable} from '@/composables/useTable.ts'
import {onMounted, ref} from "vue";
import type {SignInRecord} from "@/types/customer.type.ts";
import {recentSignUsers} from "@/api/customer.ts";
import dayjs from "dayjs";

const timeAgo = (timeStr: string) => {
  const now = dayjs()
  const time = dayjs(timeStr)

  const diffSeconds = now.diff(time, 'second')
  if (diffSeconds < 60) {
    return '刚刚'
  }

  const diffMinutes = now.diff(time, 'minute')
  if (diffMinutes < 60) {
    return diffMinutes + '分钟前'
  }

  const diffHours = now.diff(time, 'hour')
  if (diffHours < 24) {
    return diffHours + '小时前'
  }

  const diffDays = now.diff(time, 'day')
  if (diffDays < 30) {
    return diffDays + '天前'
  }

  const diffMonths = now.diff(time, 'month')
  return diffMonths + '个月前'
}

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<SignInRecord>(recentSignUsers)

// 列配置
const columns = [
  {key: 'nickname', title: '用户', width: '25%', align: 'center' as const},
  {key: 'reward_points', title: '金豆', width: '25%', align: 'center' as const},
  {key: 'reward_base_coin', title: '积分', width: '25%', align: 'center' as const},
  {key: 'sign_date', title: '签到日期', width: '25%', align: 'center' as const},
]

onMounted(() => {
  // 初始加载
  loadData()
})
</script>

<template>
  <!-- 表格 -->
    <DataTable
      :columns="columns"
      :data="dataSource"
      :loading="loading"
      :pagination="pagination"
      @change="changePage"
      :showPagination="false"
      :hasMore="hasMore"
    >
      <template #column-nickname="{ row }">
        <div>{{ row?.member_field?.nickname || row?.member_id }}</div>
      </template>
      <template #column-sign_date="{ row }">
        <div>{{ timeAgo(row.created_at)}}</div>
      </template>
    </DataTable>
</template>
