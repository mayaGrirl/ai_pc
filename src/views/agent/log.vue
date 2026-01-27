<script setup lang="ts">
import UserLayout from "@/components/layout/UserLayout.vue";
import dayjs from "dayjs";
import DataTable from "@/components/ui/DataTable.vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {LOCALE_CURRENCY_MAP} from "@/i18n";
import {useTable} from "@/composables/useTable.ts";
import {CardRecordField} from "@/types/shop.type.ts";
import {depositRecords} from "@/api/customer.ts";
import {agentLogRecord} from "@/api/agent.ts";

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
} = useTable<CardRecordField>(agentLogRecord, {
  defaultSize: 10,
  initQuery: {type: 14}
})

// 列配置
const columns = [
  { key: 'type_label', title: '操作类型', width: '15%', align: 'center' as const },
  { key: 'points', title: '金豆', width: '15%', align: 'center' as const },
  { key: 'totalpoints', title: '金豆余额', width: '15%', align: 'center' as const },
  { key: 'addtime', title: '操作时间', width: '15%', align: 'center' as const },
  { key: 'content', title: '内容', width: '20%', align: 'center' as const },
]

loadData();
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">操作日志</span>
      </div>

      <div class="min-h-[calc(100vh-120px)]">
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
            <!-- 金豆列自定义 -->
            <template #column-points="{ row }">
              <div class="text-orange-600 font-bold">
                {{ $n(row.points) }}
                <img
                  alt="coin"
                  class="inline-block w-[10px] h-[10px]"
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
    </div>
  </UserLayout>
</template>
