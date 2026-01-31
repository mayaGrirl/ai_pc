<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {rankToday, rankYesterday} from "@/api/rank.ts";
import {TodayField, YesterdayField} from "@/types/rank.type.ts";

const todayRankings = ref<TodayField[]>([])
const yesterdayRankings = ref<YesterdayField[]>([])
const activeRankingTab = ref<string>('today')

// 今日排行榜
const fetchToadyRank = async () => {
  const {code, data} = await rankToday();
  if (code === 200 && data) {
    todayRankings.value = data
  }
}
// 昨日排行榜
const fetchYesterdayRank = async () => {
  if (yesterdayRankings.value.length > 0) return;
  const {code, data} = await rankYesterday();
  if (code === 200 && data) {
    yesterdayRankings.value = data
  }
}

// 当前显示的排行榜数据
const currentRankings = computed(() => {
  return activeRankingTab.value === 'today' ? todayRankings.value : yesterdayRankings.value
})

// 切换排行榜Tab
const switchRankingTab = (tab: 'today' | 'yesterday') => {
  activeRankingTab.value = tab
  if (tab === 'today') {
  }
  if (tab === 'yesterday') {
    fetchYesterdayRank();
  }
}

onMounted(async () => {
  // 获取排行榜数据
  await fetchToadyRank();
})

</script>
<template>
  <div class="w-[320px] overflow-hidden mt-5 bg-white float-right h-[465px]">
    <ul class="border-b border-[#ececec] h-auto overflow-hidden list-none p-0 m-0">
      <li
        class="inline-block w-[160px] h-[53px] leading-[53px] text-center mx-auto float-left text-[16px] text-[#4c4c4c] cursor-pointer font-bold"
        :class="{ 'border-b-2 border-[#f03736] text-[#f03736]': activeRankingTab === 'today' }"
        @click="switchRankingTab('today')"
      >
        <a href="javascript:void(0)" class="text-inherit no-underline">今日排行榜</a>
      </li>
      <li
        class="inline-block w-[160px] h-[53px] leading-[53px] text-center mx-auto float-left text-[16px] text-[#4c4c4c] cursor-pointer font-bold"
        :class="{ 'border-b-2 border-[#f03736] text-[#f03736]': activeRankingTab === 'yesterday' }"
        @click="switchRankingTab('yesterday')"
      >
        <a href="javascript:void(0)" class="text-inherit no-underline">昨日排行榜</a>
      </li>
    </ul>
    <ul class="w-[300px] h-auto overflow-hidden mx-auto list-none p-0">
      <li
        class="bg-[#f9f9f9] text-[13px] text-[#666] h-[40px] leading-[40px] border-b border-[#eee] flex items-center p-0 w-[300px]">
        <div class="w-[60px] text-center flex items-center justify-center">排名</div>
        <div class="w-[100px] text-left pl-[5px]">昵称</div>
        <div class="flex-1 text-right pr-[10px] text-[#f03736] font-bold">金豆</div>
      </li>
      <div
        class="h-[480px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#ccc] [&::-webkit-scrollbar-thumb]:rounded-[2px] [&::-webkit-scrollbar-track]:bg-transparent">
        <li v-for="(item, index) in currentRankings" :key="`rank-${activeRankingTab}-${item.id}`"
            class="w-[300px] h-[50px] border-b border-[#f0f0f0] mx-auto text-[13px] flex items-center">
          <div class="w-[60px] text-center flex items-center justify-center">
            <span
              class="inline-flex items-center justify-center"
              :class="[index === 0 ? 'one' : index === 1 ? 'two' : index === 2 ? 'three' :
                'w-5 h-5 text-[#666] text-center leading-5 bg-[#f0f0f0] rounded-[2px] text-xs']"
            >{{ index > 2 ? index + 1 : '' }}</span>
          </div>
          <div class="w-[100px] text-left pl-[5px]"><a href="javascript:void(0)"
                                                       class="text-[#333] hover:text-[#f03736]">{{ item.nickname }}</a>
          </div>
          <div class="flex-1 text-right pr-[10px] text-[#f03736] font-bold">{{ $n(item.profit) }}</div>
        </li>
      </div>
    </ul>
  </div>
</template>
<style scoped>
.one {
  width: 24px;
  height: 30px;
  background: url("/yxsw_games_list.png") 0 0 no-repeat;
  background-size: 72px 30px;
}
.two {
  width: 24px;
  height: 30px;
  background: url("/yxsw_games_list.png") -24px 0 no-repeat;
  background-size: 72px 30px;
}
.three {
  width: 24px;
  height: 30px;
  background: url("/yxsw_games_list.png") -48px 0 no-repeat;
  background-size: 72px 30px;
}
</style>
