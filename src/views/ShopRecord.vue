<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import {useI18n} from "vue-i18n";
import {LOCALE_CURRENCY_MAP} from "@/i18n";
import {useTable} from "@/composables/useTable.ts";
import {CardRecordField} from "@/types/shop.type.ts";
import {depositRecords} from "@/api/customer.ts";
import dayjs from "dayjs";
import DataTable from "@/components/ui/DataTable.vue";
import {useRouter} from "vue-router";
import {ChevronLeft} from "lucide-vue-next";
import {onMounted} from "vue";

const {locale} = useI18n()
const router = useRouter()
// 币种符号
const currency = LOCALE_CURRENCY_MAP[locale.value] ?? 'USD';

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<CardRecordField>(depositRecords, {
  defaultSize: 10,
  initQuery: {type: 14}
})

// 列配置
const columns = [
  { key: 'created_at', title: '兑换时间', width: '20%', align: 'center' as const },
  { key: 'deposit', title: '扣除金豆', width: '15%', align: 'center' as const },
  { key: 'a_deposit', title: '银行余额', width: '15%', align: 'center' as const },
]

onMounted(() => {
  loadData();
})
</script>

<template>
  <MainLayout>
    <div class="min-h-[calc(100vh-120px)] px-5 py-10">
      <div class="max-w-[1400px] mx-auto  items-start max-[1200px]:grid-cols-1 max-[1200px]:max-w-[600px]">
        <div class="relative flex items-center mb-4 px-1">
          <div class="flex items-center gap-2">
            <button
              @click="router.push('/shop')"
              class="text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <ChevronLeft class='h-4 w-4' />
              返回
            </button>
          </div>

          <h3 class="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-gray-800">兑换记录</h3>
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

        </DataTable>
      </div>
    </div>
  </MainLayout>
</template>
