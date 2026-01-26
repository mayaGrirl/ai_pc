<script setup lang="ts">
import { ref } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { pointsRecords, depositRecords } from '@/api/customer'
import DataTable from "@/components/ui/DataTable.vue";
import {useTable} from "@/composables/useTable.ts";
import type {DepositRecordField, PointsRecordField} from "@/types/customer.type.ts";

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<PointsRecordField>(pointsRecords, {
  defaultSize: 10
})
// 列配置
const columns = [
  { key: 'type_label', title: '来源', width: '20%', align: 'center' as const },
  { key: 'a_points', title: '变动前', width: '15%', align: 'center' as const },
  { key: 'points', title: '金豆', width: '15%', align: 'center' as const },
  { key: 'b_points', title: '变动后', width: '15%', align: 'center' as const },
  { key: 'created_at', title: '变动时间', width: '15%', align: 'center' as const },
]

// 存款
const bankTable = useTable<DepositRecordField>(depositRecords, {
  defaultSize: 10
})
// 列配置
const bankColumns = [
  { key: 'type_label', title: '来源', width: '20%', align: 'center' as const },
  { key: 'a_deposit', title: '变动前', width: '15%', align: 'center' as const },
  { key: 'deposit', title: '金豆', width: '15%', align: 'center' as const },
  { key: 'b_deposit', title: '变动后', width: '15%', align: 'center' as const },
  { key: 'created_at', title: '变动时间', width: '15%', align: 'center' as const },
]

const activeTab = ref('account')
const tabs = [
  { key: 'account', name: '金豆' },
  { key: 'income', name: '存款' }
]

const switchTab = (key: string) => {
  activeTab.value = key
  if (key === 'account') {
    loadData(true);
  }

  if (key === 'income' && !bankTable.dataSource.value.length) {
    bankTable.loadData(true)
  }
}
loadData()
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

      <!-- 金豆 -->
      <div class="min-h-[calc(100vh-120px)] px-5 pb-10" v-if="activeTab === 'account'">
        <div class="max-w-[1400px] mx-auto  items-start max-[1200px]:grid-cols-1 max-[1200px]:max-w-[600px]">
          <!-- 表格 -->
          <DataTable
            :columns="columns"
            :data="dataSource"
            :loading="loading"
            :pagination="pagination"
            @change="changePage"
            :hasMore="hasMore"
          >
            <template #column-a_points="{ row }">
              {{ $n(row.a_points) }}
            </template>
            <template #column-points="{ row }">
              <div class="text-orange-600 font-bold">
                {{ $n(row.points) }}
                <img
                  alt="coin"
                  class="inline-block w-[13px] h-[13px]"
                  src="/ranking/coin.png"
                />
              </div>
            </template>
            <template #column-b_points="{ row }">
              {{ $n(row.b_points) }}
            </template>
          </DataTable>
        </div>
      </div>

      <!-- 存款 -->
      <div class="min-h-[calc(100vh-120px)] px-5 pb-10" v-if="activeTab === 'income'">
        <div class="max-w-[1400px] mx-auto  items-start max-[1200px]:grid-cols-1 max-[1200px]:max-w-[600px]">
          <!-- 表格 -->
          <DataTable
            :columns="bankColumns"
            :data="bankTable.dataSource.value"
            :loading="bankTable.loading.value"
            :pagination="bankTable.pagination.value"
            @change="bankTable.changePage"
            :hasMore="bankTable.hasMore.value"
          >
            <template #column-a_deposit="{ row }">
              {{ $n(row.a_deposit) }}
            </template>
            <template #column-deposit="{ row }">
              <div class="text-orange-600 font-bold">
                {{ $n(row.deposit) }}
                <img
                  alt="coin"
                  class="inline-block w-[13px] h-[13px]"
                  src="/ranking/coin.png"
                />
              </div>
            </template>
            <template #column-b_deposit="{ row }">
              {{ $n(row.b_deposit) }}
            </template>
          </DataTable>
        </div>
      </div>

    </div>
  </UserLayout>
</template>
