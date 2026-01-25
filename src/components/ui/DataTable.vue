<script setup lang="ts">
import {FolderOpen} from "lucide-vue-next";

interface Column {
  key: string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface Pagination {
  page: number
  size: number
}

interface Props {
  columns: Column[]
  data: any[]
  loading?: boolean
  hasMore?: boolean
  pagination: Pagination
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showPagination: true,
  hasMore: true,
  data: () => [],
  columns: () => []
})

const emit = defineEmits<{
  (e: 'change', page: number): void
  (e: 'update:size', size: number): void
}>()

// 上一页
const handlePagePrev = (page: number) => {
  if (page < 1) return
  emit('change', page)
}

// 下一页
const handlePageNext = (page: number) => {
  if (page < 1 || props.data.length < props.pagination.size) return
  emit('change', page)
}
</script>

<template>
  <div class="data-table-container">
    <div class="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table class="w-full border-collapse">
        <!-- 表头 -->
        <thead>
          <tr class="bg-gray-50/50 border-b border-gray-100">
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider',
                col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
              ]"
              :style="{ width: col.width }"
            >
              {{ col.title }}
            </th>
          </tr>
        </thead>

        <!-- 内容区域 -->
        <tbody class="divide-y divide-gray-100">
          <!-- Loading State -->
          <tr v-if="loading">
            <td :colspan="columns.length" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center justify-center gap-3">
                <div class="w-8 h-8 border-3 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
                <span class="text-sm text-gray-400">正在加载中...</span>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="!data.length">
            <td :colspan="columns.length" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center justify-center gap-3">
                <div class="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-2xl text-gray-300">
                  <FolderOpen />
                </div>
                <span class="text-sm text-gray-400">暂无数据</span>
              </div>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-else
            v-for="(row, index) in data"
            :key="index"
            class="group hover:bg-orange-50/30 transition-colors duration-200"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[
                'px-6 py-4 text-sm text-gray-600 whitespace-nowrap',
                col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
              ]"
            >
              <slot :name="`column-${col.key}`" :row="row" :index="index">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div
      class="flex items-center justify-between mt-4 px-2"
    >
      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          :disabled="pagination?.page === 1"
          @click="handlePagePrev(pagination?.page - 1)"
        >
          上一页
        </button>

        <span class="text-sm text-gray-600 px-2">
          {{ pagination?.page }}
        </span>

        <button
          class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 hover:bg-gray-50 hover:border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          :disabled="!hasMore"
          @click="handlePageNext(pagination?.page + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 滚动条美化 */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 3px;
}
.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background-color: #d1d5db;
}
</style>
