<script setup lang="ts">
import DataTable from '@/components/ui/DataTable.vue';
import {useTable} from '@/composables/useTable.ts';
import TextSkeleton from "@/components/ui/TextSkeleton.vue";
import {getBlockByIdentifier, getCustomerLevelOptions} from "@/api/common.ts";
import {CustomerLevelField} from "@/types/common.type.ts";
import {onMounted, ref} from "vue";

// 签到说明
const tipContent = ref<string>('')

const fetchData = async () => {
  // 查询兑换需要的明细数据
  loading.value = true;
  const {data, code} = await getBlockByIdentifier('customer_sign_in_tips');
  if (code == 200) {
    // 设置温馨提示
    tipContent.value = (data?.content || '');
  }
  loading.value = false;
}

// 初始化表格
const {
  loading,
  dataSource,
  hasMore,
  pagination,
  loadData,
  changePage,
} = useTable<CustomerLevelField>(getCustomerLevelOptions)

// 列配置
const columns = [
  {key: 'level', title: '生态值等级', width: '20%', align: 'center' as const},
  {key: 'remark', title: '签到奖励', width: '25%', align: 'center' as const},
]

onMounted(() => {
  fetchData()
  // 初始加载
  loadData()
})
</script>

<template>
  <div class="bg-white  p-1">
    <TextSkeleton v-if="loading" :lines="5" height="14px" animation="wave"/>
    <div v-else class="list-none p-0 m-0" v-html="tipContent"/>
  </div>

  <!-- 表格 -->
    <DataTable
      :columns="columns"
      :data="dataSource"
      :loading="loading"
      :pagination="pagination"
      @change="changePage"
      :showPagination="false"
      :hasMore="hasMore"
    >
      <template #column-level="{ row }">
        <div class="flex justify-center items-center gap-1">
          <img
            alt="coin"
            class="inline-block w-[20px] h-[20px]"
            :src="`/level/${row.level}.png`"
          />
        </div>
      </template>

      <template #column-remark="{ row }">
        <div>签到可获得。开箱积分: {{ row.sign_in_blessing }} * 连续签到天数。金豆: {{ row.sign_in_points }} * 连续签到天数</div>
      </template>
    </DataTable>
</template>
