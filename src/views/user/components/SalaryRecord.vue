<script setup lang="ts">
import DataTable from '@/components/ui/DataTable.vue'
import { useTable } from '@/composables/useTable.ts'
import {salaryRecords} from "@/api/customer.ts";
import type {SalaryRecordField} from "@/types/customer.type.ts";
import dayjs from "dayjs";

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<SalaryRecordField>(salaryRecords, {
  defaultSize: 10
})

// 列配置
const columns = [
  {key: 'typestr', title: '类型', width: '25%', align: 'center' as const},
  {key: 'basecoin', title: '统计金额', width: '25%', align: 'center' as const},
  {key: 'coin', title: '获得工资', width: '25%', align: 'center' as const},
  {key: 'addtime', title: '记录日期', width: '25%', align: 'center' as const},
]

// 初始加载
loadData()
</script>

<template>
  <DataTable
    :columns="columns"
    :data="dataSource"
    :loading="loading"
    :pagination="pagination"
    @change="changePage"
    :hasMore="hasMore"
  >
    <template #column-coin="{ row }">
      <div class="text-orange-600 font-bold">
        {{ $n(row.coin) }}
        <img
          alt="coin"
          class="inline-block w-[13px] h-[13px]"
          src="/ranking/coin.png"
        />
      </div>
    </template>

    <!-- 时间列自定义 -->
    <template #column-addtime="{ row }">
      <span class="text-gray-400 text-xs">{{ dayjs.unix(row.addtime || 0).format("YYYY-MM-DD") }}</span>
    </template>
  </DataTable>
</template>
