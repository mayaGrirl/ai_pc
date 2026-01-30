<script setup lang="ts">
import { ref, onMounted } from "vue";
import { X, ChevronRight } from "lucide-vue-next";
import { getReliefData, receiveRelief } from "@/api/customer";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import type { ReliefResponse } from "@/types/customer.type";

const emit = defineEmits(['close']);
const authStore = useAuthStore();
const toast = useToast();

const loading = ref(false);
const reliefInfo = ref<ReliefResponse | null>(null);

const fetchReliefData = async () => {
  try {
    const { data } = await getReliefData();
    reliefInfo.value = data;
  } catch (error) {
    console.error('Failed to fetch relief data:', error);
  }
};

// 领取
const handleClaim = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const {code, message} = await receiveRelief();
    if (code === 200) {
      toast.success('领取成功');
      await authStore.fetchCurrentCustomer(); // Refresh balance
      await fetchReliefData(); // Refresh remaining counts
    } else {
      toast.error(message);
    }
  } catch (error: any) {
    toast.error(error.message || '领取失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchReliefData();
});
</script>

<template>
  <div class="fixed inset-0 z-[2000] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="emit('close')"></div>
    <div class="relative w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <!-- Modal Close  -->
      <div @click="emit('close')" class="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors group cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </div>

      <!-- Modal Body -->
      <div class="p-8 md:p-12">
        <div class="mb-2 text-center">
          <h3 class="text-3xl font-black text-gray-900 tracking-tight mb-2">免费领救济</h3>
          <p class="text-gray-500 font-medium">满足条件即可每天多次领取免费豆豆</p>
          <div v-if="reliefInfo" class="mt-2 text-sm text-[#ff4757] font-bold">
            今日已领: {{ reliefInfo.receive_count }} / {{ reliefInfo.limit }} 次
          </div>
        </div>

        <div class="overflow-hidden rounded-2xl border border-gray-100 shadow-sm mb-5">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50/50 text-gray-500 font-bold uppercase tracking-wider">
            <tr>
              <th class="py-2 px-3 text-center">等级</th>
              <th class="py-2 px-3 text-center">可领金币</th>
              <th class="py-2 px-3 text-center">领取条件</th>
            </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
            <tr v-for="item in reliefInfo?.options" :key="item.level" class="hover:bg-gray-50/50 transition-colors group">
              <td class="py-2 px-3 flex justify-center">
                <img :src="`/skin/pc/wm/images/level/${item.level}.png`" class="w-7 h-7 object-contain group-hover:scale-110 transition-transform" />
              </td>
              <td class="py-2 px-3 text-center">
                <div class="inline-flex items-center gap-1.5 text-[#ff4757] font-black text-lg">
                  {{ $n(item.day_jiuji_point || 0) }}
                  <img src="/ranking/coin.png" class="w-4 h-4" />
                </div>
              </td>
              <td class="py-2 px-3 text-center text-gray-600 font-medium text-xs">
                余额少于 {{ $n(item.day_jiuji_point || 0) }}，每日可领 {{ reliefInfo?.limit }} 次
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Action -->
        <div class="flex flex-col md:flex-row items-center justify-center gap-6 border-t border-gray-50">
          <button
            @click="handleClaim"
            :disabled="loading"
            class="h-14 px-12 bg-gradient-to-r from-[#ff4757] to-[#ee5a6f] text-white font-black rounded-2xl shadow-xl shadow-red-200 hover:shadow-red-300 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {{ loading ? '领取中...' : '立即领取救济金' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
