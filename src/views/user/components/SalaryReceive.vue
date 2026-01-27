<script setup lang="ts">
import DataTable from '@/components/ui/DataTable.vue'
import {useTable} from '@/composables/useTable.ts'
import {receiveSalaryZ, receiveSalaryZAll, salaryZRecords} from "@/api/customer.ts";
import type {SalaryZRecordField} from "@/types/customer.type.ts";
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
} = useTable<SalaryZRecordField>(salaryZRecords, {
  defaultSize: 10
})

// 列配置
const columns = [
  {key: 'ctdateA', title: '统计日期', width: '20%', align: 'center' as const},
  {key: 'coin', title: '工资', width: '20%', align: 'center' as const},
  {key: 'addtime', title: '结算时间', width: '20%', align: 'center' as const},
  {key: 'gettime', title: '领取时间', width: '20%', align: 'center' as const},
  {key: 'status', title: '状态', width: '20%', align: 'center' as const},
]

// 一键领取
const receivingAll = ref<boolean>(false);
const handleReceiveAll = async () => {
  receivingAll.value = true;
  try {
    const {code, message} = await receiveSalaryZAll()

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('领取成功');
    }
    receivingAll.value = false;
  } catch (error: any) {
    const msg = error instanceof Error ? error.message : '领取失败，刷新页面请重试';
    toast.error(msg);
    receivingAll.value = false;
  }
}

/**
 * 领取工资
 * @param t
 */
const receivingSet = ref<Set<number>>(new Set());
const handleReceive = async (t: number) => {
  // 已经在领取中，直接拦截
  if (receivingSet.value.has(t)) return;

  // 标记该行正在领取
  receivingSet.value = new Set(receivingSet.value).add(t)

  try {
    const {code, data, message} = await receiveSalaryZ(t);
    if (code === 200) {
      toast.success('领取成功');
      // 局部更新行状态
      dataSource.value = dataSource.value.map(item => item.id === t ? data : item)
      // setList(prev => prev.map(item => item.id === t ? data : item))
    } else {
      toast.error(message);
    }
  } catch (error) {
    console.error('recelve salary in error:', error)
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
  <div class="grid px-3">
    <button
      v-if="dataSource.length > 0"
      @click="handleReceiveAll()"
      :disabled="receivingAll"
      :class="['mb-1 h-9 w-full rounded-full bg-gradient-to-r from-[#ff6a3a] to-[#ff1020] text-white font-medium transition active:scale-95',
      receivingAll ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      ]"
    >
      {{ receivingAll ? '领取中...' : '一键领取' }}
    </button>
  </div>
  <DataTable
    :columns="columns"
    :data="dataSource"
    :loading="loading"
    :pagination="pagination"
    @change="changePage"
    :hasMore="hasMore"
  >
    <!-- 时间列自定义 -->
    <template #column-ctdateA="{ row }">
      <span class="text-gray-400 text-xs">
        {{ dayjs.unix(row.ctdateA || 0).format("YYYY-MM-DD") }}至{{ dayjs.unix(row.ctdateB || 0).format("YYYY-MM-DD") }}
      </span>
    </template>
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

    <template #column-addtime="{ row }">
      <span class="text-gray-400 text-xs">{{ dayjs.unix(row.addtime || 0).format("YYYY-MM-DD") }}</span>
    </template>
    <template #column-gettime="{ row }">
      <span class="text-gray-400 text-xs">
        {{ row.gettime > 0 ? dayjs.unix(row.gettime || 0).format("YYYY-MM-DD HH:mm") : '-' }}
      </span>
    </template>
    <template #column-status="{ row }">
      <span class="text-gray-400 text-xs" v-if="row.status !== 0">{{row?.status_label}}</span>
      <span class="text-gray-400 text-xs" v-else>
        <button @click="handleReceive(row.id)"
          :class="['px-2 py-1 text-xs rounded', receivingSet.has(row.id || 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 text-white cursor-pointer']">
          {{receivingSet.has(row.id || 0) ? '领取中...' : '领取'}}
        </button>
      </span>
    </template>
  </DataTable>
</template>
