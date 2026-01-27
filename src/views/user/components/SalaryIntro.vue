<script setup lang="ts">
import TextSkeleton from "@/components/ui/TextSkeleton.vue";
import {getBlockByIdentifier} from "@/api/common.ts";
import {onMounted, ref} from "vue";
import {salaryWeeklyTotal} from "@/api/customer.ts";

// 说明
const tipContent = ref<string>('');
// 累计工资
const weeklyTotal = ref<number>(0);
const loading = ref<boolean>(false);

const fetchData = async () => {
  loading.value = true;
  const {data, code} = await getBlockByIdentifier('customer_salary_intro_tips');
  if (code == 200) {
    tipContent.value = (data?.content || '');
  }

  const res = await salaryWeeklyTotal();
  if (res.code == 200) {
    weeklyTotal.value = res.data.coin;
  }
  loading.value = false;
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="flex items-center mb-2 p-1">
    本周累计工资
    <span class="text-red-500 font-semibold mx-1">{{weeklyTotal}}</span>
    <img
      class="inline-block w-[13px] h-[13px]"
      src="/ranking/coin.png"
      alt="gold"
    />
  </div>
  <div class="bg-white  p-1">
    <TextSkeleton v-if="loading" :lines="5" height="14px" animation="wave"/>
    <div v-else class="list-none p-0 m-0" v-html="tipContent"/>
  </div>
</template>
