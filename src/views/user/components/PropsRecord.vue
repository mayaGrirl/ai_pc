<script setup lang="ts">
import { useToast } from "@/composables/useToast.ts";
import { CardRecordField } from "@/types/shop.type.ts";
import DataTable from '@/components/ui/DataTable.vue'
import { useTable } from '@/composables/useTable.ts'
import { cardRecords } from "@/api/shop.ts";
import { useClipboard } from '@vueuse/core'
import {getSecureToken} from "@/utils/verify-key.ts";
import {LOCALE_CURRENCY_MAP} from "@/i18n";
import dayjs from "dayjs";
import {useI18n} from "vue-i18n";

const {locale} = useI18n()
// 币种符号
const currency = LOCALE_CURRENCY_MAP[locale.value] ?? 'USD';
const toast = useToast()
const { copy, isSupported } = useClipboard()

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
  query,
  reload
} = useTable<CardRecordField>(cardRecords, {
  defaultSize: 10,
  initQuery: {t: getSecureToken()}
})

// 列配置
const columns = [
  { key: 'no', title: '卡号', width: '20%', align: 'center' as const },
  { key: 'pwd', title: '卡密', width: '25%', align: 'center' as const },
  { key: 'points', title: '金豆', width: '15%', align: 'center' as const },
  { key: 'addtime', title: '获得时间', width: '20%', align: 'center' as const },
  { key: 'operation', title: '操作', width: '15%', align: 'center' as const },
]

// 复制所有
const handleCopyAll = async () => {
  if (!dataSource.value.length) {
    toast.warning('暂无数据可复制');
    return;
  }
  const text = dataSource.value
    .filter(item => item.state === 0)
    .map(item => `${item.no} ${item.pwd}`).join("\n");
  if (!text) {
    toast.warning('没有待使用的卡密可复制');
    return;
  }

  if (isSupported.value) {
    await copy(text);
    toast.success('已复制所有可用卡密');
  } else {
    toast.error('您的浏览器不支持自动复制');
  }
};

// 单个复制
const handleCopy = async (n: string, p: string) => {
  const text = `${n} ${p}`;
  if (isSupported.value) {
    await copy(text);
    toast.success('已复制');
  } else {
    toast.error('您的浏览器不支持自动复制');
  }
};

// 初始加载
loadData()
</script>

<template>
  <div class="flex justify-between items-center mb-4 px-1">
    <h3 class="text-lg font-bold text-gray-800">兑换记录</h3>
    <div class="flex items-center gap-2">
<!--      <div class="relative">-->
<!--        <input-->
<!--          v-model="query.keyword"-->
<!--          @input="reload"-->
<!--          type="text"-->
<!--          placeholder="搜索卡号/卡密"-->
<!--          class="pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors w-48"-->
<!--        />-->
<!--        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">-->
<!--          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />-->
<!--        </svg>-->
<!--      </div>-->
      <button
        @click="handleCopyAll"
        class="text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
        复制可用卡密
      </button>
    </div>
  </div>

  <!-- 表格 -->
  <DataTable
    :columns="columns"
    :data="dataSource"
    :loading="loading"
    :pagination="pagination"
    @change="changePage"
    :hasMore="hasMore"
  >
    <!-- 金豆列自定义 -->
    <template #column-points="{ row }">
      <div class="text-orange-600 font-bold">
        {{ $n(row.points) }}
        <img
          alt="coin"
          class="inline-block w-[13px] h-[13px]"
          src="/ranking/coin.png"
        />
      </div>
      <div class="text-xs">{{$n((row.points || 0) / 1000, {
        style: 'currency',
        currency: currency
      })}}</div>
    </template>

    <!-- 时间列自定义 -->
    <template #column-addtime="{ row }">
      <span class="text-gray-400 text-xs">{{ dayjs.unix(row.addtime || 0).format("YYYY-MM-DD HH:mm") }}</span>
    </template>

    <!-- 手续费列 -->
    <template #column-operation="{ row }">
      <span class="cursor-pointer text-orange-600 hover:text-orange-700 hover:bg-orange-50" @click="handleCopy(row.no, row.pwd)">复制</span>
    </template>
  </DataTable>
</template>
