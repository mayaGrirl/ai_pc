<script setup lang="ts">
import {useTable} from "@/composables/useTable.ts";
import {CardRecordField} from "@/types/shop.type.ts";
import DataTable from "@/components/ui/DataTable.vue";
import UserLayout from "@/components/layout/UserLayout.vue";
import {systemMessage} from "@/api/home.ts";

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<CardRecordField>(systemMessage, {
  defaultSize: 10
})

// 列配置
const columns = [
  { key: 'title', title: '标题', width: '200px', align: 'center' as const },
  { key: 'content', title: '内容', width: '600px', align: 'center' as const },
]

loadData();
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">我的消息</span>
      </div>

      <div class="min-h-[calc(100vh-120px)]">
        <div class="max-w-[900px] mx-auto  items-start max-[1200px]:grid-cols-1 max-[1200px]:max-w-[600px]">
          <!-- 表格 -->
          <DataTable
            :columns="columns"
            :data="dataSource"
            :loading="loading"
            :pagination="pagination"
            @change="changePage"
            :hasMore="hasMore"
          >
            <template #column-content="{ row }">
              <span class="text-gray-400 text-xs w-[600px] block truncate" :title="row.content">{{ row.content }}</span>
            </template>

          </DataTable>
        </div>
      </div>
    </div>
  </UserLayout>
</template>
