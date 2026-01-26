<script setup lang="ts">
import UserLayout from "@/components/layout/UserLayout.vue";
import {onMounted, ref} from "vue";
import {agentProfile} from "@/api/agent.ts";
import {AgentField} from "@/types/agent.type.ts";
import {useToast} from "@/composables/useToast.ts";

const toast = useToast()
const loading = ref<boolean>(false);
const profile = ref<AgentField>();
// 查询需要的信息
const fetchData = async (isTip: boolean) => {
  loading.value = true;
  const {data, code, message} = await agentProfile();
  if (code == 200) {
    // 设置数据
    profile.value = data;
  } else {
    toast.info(message)
  }
  loading.value = false;
}

onMounted(() => {
  fetchData(true)
})
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">代理资料</span>
      </div>


      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
          <div class="space-y-8">
            <div class="flex gap-4">
              <div>
                <div class="text-sm font-medium text-gray-500 mb-1">代理名称</div>
                <div class="text-lg font-bold text-gray-900">{{ profile?.name }}</div>
              </div>
            </div>

            <div class="flex gap-4">
              <div>
                <div class="text-sm font-medium text-gray-500 mb-1">进卡折扣</div>
                <div class="text-lg font-semibold text-gray-900">{{ profile?.buycard_rate }}</div>
              </div>
            </div>

            <div class="flex gap-4">
              <div>
                <div class="text-sm font-medium text-gray-500 mb-0.5">铺货分</div>
                <div class="text-3xl font-bold text-[#f03736] tracking-tight">{{ $n(profile?.distribute_money || 0) }}</div>
              </div>
            </div>
          </div>

          <div class="space-y-8">
            <div class="flex gap-4">
              <div>
                <div class="text-sm font-medium text-gray-500 mb-1">代理ID</div>
                <div class="text-lg font-semibold text-gray-900 font-mono">{{ profile?.uid }}</div>
              </div>
            </div>

            <div class="flex gap-4">
              <div>
                <div class="text-sm font-medium text-gray-500 mb-1">收卡折扣</div>
                <div class="text-lg font-semibold text-gray-900">{{ profile?.reccard_rate }}</div>
              </div>
            </div>
          </div>
          <div class="space-y-8">
            <div class="flex gap-4">
              <div>
                <div class="text-sm font-medium text-gray-500 mb-2">状态</div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="profile?.state === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    <span class="w-1.5 h-1.5 rounded-full mr-1.5"
                          :class="profile?.state === 1 ? 'bg-green-600' : 'bg-red-600'"></span>
                    {{ profile?.state_label }}
                  </span>
              </div>
            </div>

            <div class="flex gap-4">
              <div>
                <div class="text-sm font-medium text-gray-500 mb-1">收卡利润</div>
                <div class="text-lg font-semibold text-gray-900">{{ profile?.reccard_profit_rate }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>
