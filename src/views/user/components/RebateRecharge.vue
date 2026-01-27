<script setup lang="ts">
import DataTable from '@/components/ui/DataTable.vue'
import {useTable} from '@/composables/useTable.ts'
import {receiveWagesCz, wagesCzRecords} from "@/api/customer.ts";
import type {WagesCzRecordField} from "@/types/customer.type.ts";
import dayjs from "dayjs";
import {onMounted, ref} from "vue";
import {useToast} from "@/composables/useToast.ts";

const toast = useToast()

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<WagesCzRecordField>(wagesCzRecords, {
  defaultSize: 10
})

// 列配置
const columns = [
  {key: 'addtime', title: '日期', width: '20%', align: 'center' as const},
  {key: 'wpoints', title: '有效流水', width: '20%', align: 'center' as const},
  {key: 'cz', title: '充值', width: '20%', align: 'center' as const},
  {key: 'hdpoints', title: '返利', width: '20%', align: 'center' as const},
  {key: 'status', title: '状态', width: '20%', align: 'center' as const},
]

/**
 * 领取
 * @param t
 */
const receivingSet = ref<Set<number>>(new Set());
const handleReceive = async (t: number) => {
  // 已经在领取中，直接拦截
  if (receivingSet.value.has(t)) return;

  // 标记该行正在领取
  receivingSet.value = new Set(receivingSet.value).add(t)

  try {
    const {code, data, message} = await receiveWagesCz(t);
    if (code === 200) {
      toast.success('领取成功');
      // 局部更新行状态
      dataSource.value = dataSource.value.map(item => item.id === t ? data : item)
    } else {
      toast.error(message);
    }
  } catch (error) {
    console.error('rebate recharge in error:', error)
    const msg = error instanceof Error ? error.message : '领取失败，请稍后再试';
    toast.error(msg);
  } finally {
    // 移除 loading 标记
    const newSet = new Set(receivingSet.value)
    newSet.delete(t)
    receivingSet.value = newSet
  }
};

onMounted(() => {
  // 初始加载
  loadData()
})
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
    <template #column-addtime="{ row }">
      <span class="text-gray-400 text-xs">{{ dayjs.unix(row.addtime || 0).format("YYYY-MM-DD") }}</span>
    </template>
    <template #column-wpoints="{ row }">
      <span class="text-gray-400 text-xs">{{ $n(row.wpoints) }}</span>
    </template>
    <template #column-cz="{ row }">
      <span class="text-gray-400 text-xs">{{ $n(row.cz * 1000) }}</span>
    </template>
    <template #column-hdpoints="{ row }">
      <span class="text-gray-400 text-xs">{{ $n(row.hdpoints) }}</span>
    </template>

    <template #column-status="{ row }">
      <span class="text-gray-400 text-xs" v-if="row.state !== 0">{{row?.state_label}}</span>
      <span class="text-gray-400 text-xs" v-else>
        <button @click="handleReceive(row.id)"
          :class="['px-2 py-1 text-xs rounded', receivingSet.has(row.id || 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 text-white cursor-pointer']">
          {{receivingSet.has(row.id || 0) ? '领取中...' : '领取'}}
        </button>
      </span>
    </template>
  </DataTable>
</template>
