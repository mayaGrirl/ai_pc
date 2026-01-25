<script setup lang="ts">
import {useI18n} from "vue-i18n";
import {LOCALE_CURRENCY_MAP} from "@/i18n";
import {useTable} from "@/composables/useTable.ts";
import {CardRecordField} from "@/types/shop.type.ts";
import {depositRecords} from "@/api/customer.ts";
import dayjs from "dayjs";
import DataTable from "@/components/ui/DataTable.vue";
import {useRouter} from "vue-router";
import {ChevronLeft} from "lucide-vue-next";
import UserLayout from "@/components/layout/UserLayout.vue";

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

loadData();
</script>

<template>
  <UserLayout>
    <div class="exchange-page">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">兑奖记录</span>
      </div>

      <div class="min-h-[calc(100vh-120px)] px-5 pb-10">
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
    </div>
  </UserLayout>
</template>

<style scoped>
.exchange-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-tabs {
  display: flex;
  border-bottom: 2px solid #ff6600;
}

.page-tabs .tab {
  font-size: 14px;
  color: #ff6600;
  padding: 10px 20px;
  background: #fff8f0;
  border: 1px solid #ff6600;
  border-bottom: none;
  margin-bottom: -2px;
}

/* 安全验证 */
.security-verify {
  padding: 40px 0;
}

.verify-notice {
  text-align: center;
  color: #ff6600;
  font-size: 14px;
  margin-bottom: 30px;
}

.notice-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  text-align: center;
  border: 1px solid #ff6600;
  border-radius: 50%;
  margin-right: 8px;
  font-size: 12px;
}

.verify-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-label {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #333;
  margin-right: 15px;
}

.form-select,
.form-input {
  flex: 1;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #ff6600;
}

.btn-submit {
  width: 200px;
  height: 40px;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:hover {
  opacity: 0.9;
}

/* 兑奖记录表格 */
.exchange-table {
  border: 1px solid #eee;
}

.exchange-table table {
  width: 100%;
  border-collapse: collapse;
}

.exchange-table th,
.exchange-table td {
  padding: 12px 15px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.exchange-table th {
  background: #fafafa;
  color: #666;
  font-weight: normal;
}

.exchange-table td {
  color: #333;
}

.exchange-table tr:hover td {
  background: #fafafa;
}

.exchange-table .status.done {
  color: #52c41a;
}

.exchange-table .time {
  color: #999;
}

.empty-cell {
  text-align: center;
  color: #999;
  padding: 40px 0;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.exchange-table .coin {
  color: #f03736;
  font-weight: bold;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
