<script setup lang="ts">
import { onMounted } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { loginLogs } from '@/api/customer'
import dayjs from "dayjs";
import DataTable from "@/components/ui/DataTable.vue";
import {useTable} from "@/composables/useTable.ts";
import {getSecureToken} from "@/utils/verify-key.ts";
import {LoginLogField} from "@/types/customer.type.ts";

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<LoginLogField>(loginLogs, {
  defaultSize: 10,
  initQuery: {t: getSecureToken()}
})

// 列配置
const columns = [
  { key: 'address', title: '地区', width: '80%', align: 'center' as const },
  { key: 'ip', title: 'ip', width: '10%', align: 'center' as const },
  { key: 'addtime', title: '获得时间', width: '10%', align: 'center' as const },
]

onMounted(() => {
  loadData()
})
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">登录日志</span>
      </div>

      <!-- 日志表格 -->
      <DataTable
        :columns="columns"
        :data="dataSource"
        :loading="loading"
        :pagination="pagination"
        @change="changePage"
        :hasMore="hasMore"
      >
        <!-- 时间列自定义 -->
        <template #column-addtime="{ row }">
          <span class="text-gray-400 text-xs">{{ dayjs.unix(row.addtime || 0).format("YYYY-MM-DD HH:mm") }}</span>
        </template>
      </DataTable>
    </div>
  </UserLayout>
</template>
