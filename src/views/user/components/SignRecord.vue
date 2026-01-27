<script setup lang="ts">
import { CardRecordField } from "@/types/shop.type.ts";
import DataTable from '@/components/ui/DataTable.vue'
import { useTable } from '@/composables/useTable.ts'
import {getSecureToken} from "@/utils/verify-key.ts";
import {signRecords} from "@/api/customer.ts";

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<CardRecordField>(signRecords, {
  defaultSize: 10,
  initQuery: {t: getSecureToken()}
})

// 列配置
const columns = [
  {key: 'reward_points', title: '金豆', width: '25%', align: 'center' as const},
  {key: 'reward_base_coin', title: '积分', width: '25%', align: 'center' as const},
  {key: 'sign_date', title: '签到日期', width: '25%', align: 'center' as const},
]

// 初始加载
loadData()
</script>

<template>
  <!-- 表格 -->
  <DataTable
    :columns="columns"
    :data="dataSource"
    :loading="loading"
    :pagination="pagination"
    @change="changePage"
    :hasMore="hasMore"
  >
    // 自定义列
  </DataTable>
</template>
