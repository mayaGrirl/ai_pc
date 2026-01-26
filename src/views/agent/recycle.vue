<script setup lang="ts">
import UserLayout from "@/components/layout/UserLayout.vue";
import {computed, onMounted, ref} from "vue";
import {useTable} from "@/composables/useTable.ts";
import {AgentField, AgentLogField} from "@/types/agent.type.ts";
import {agentLogRecord, agentProfile, agentRecharge, agentRecycle} from "@/api/agent.ts";
import dayjs from "dayjs";
import DataTable from "@/components/ui/DataTable.vue";
import {useToast} from "@/composables/useToast.ts";
import {useAuthStore} from "@/stores";
import {useI18n} from "vue-i18n";
import {LOCALE_CURRENCY_MAP} from "@/i18n";
import {ErrorMessage, useField, useForm} from "vee-validate";
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {CardRecordField} from "@/types/shop.type.ts";

const toast = useToast()
const authStore = useAuthStore()
const {locale} = useI18n()
// 币种符号
const currency = LOCALE_CURRENCY_MAP[locale.value] ?? 'USD';

const loading = ref<boolean>(false)
const profile = ref<AgentField>();
// 查询需要的信息
const fetchData = async (isSetAuth: boolean = false) => {
  // 查询兑换需要的明细数据
  loading.value = true;
  const {code, data} = await agentProfile();
  if (code === 200) {
    profile.value = data;
    if (isSetAuth) {
      authStore.setCurrentCustomer({
        bankpoints: data.bankpoints,
      })
    }
  }

  loading.value = false;
}

const formKey = ref<number>(1);
// 表单验证
const schema = z.object({
  cards: z.string().min(1, '请输入卡密'),
});
type FormValues = z.infer<typeof schema>;
const validationSchema = toTypedSchema(schema);
const {
  handleSubmit,
  isSubmitting,
  resetForm,
} = useForm<FormValues>({
  validationSchema: validationSchema,
  initialValues: {
    cards: '',
  }
})
const {value: cards} = useField<string>('cards')
// 检测卡密
const currentStep = ref(1)
const checkResult = ref<CardRecordField[]>([])

// 有效的卡密
const validCards = computed(() => checkResult.value.filter((item: any) => item.state === 0))
// 预计获得金豆数量
const totalPoints = computed(() => validCards.value.reduce((sum: number, item: any) => sum + (item.points || 0), 0))

// 检测卡密
const checkCard = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    const {code, message, data} = await agentRecycle({
      type: 'check',
      cards: values.cards,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      checkResult.value = data
      currentStep.value = 2
    }
  } catch (error: any) {
    toast.error(error.message || '提交失败')
  } finally {
    isSubmitting.value = false
  }
})

// 确认回收
const confirmRecycle = async () => {
  if (validCards.value.length === 0) return

  isSubmitting.value = true
  try {
    const {code, message} = await agentRecycle({
      type: 'submit',
      cards: cards.value,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('回收成功');
      // 重置状态
      currentStep.value = 1;
      checkResult.value = [];
      resetForm();
      void fetchData(true);
    }
  } catch (error: any) {
    toast.error(error.message || '提交失败')
  } finally {
    isSubmitting.value = false
  }
}

// 回收记录
const recycleTable = useTable<AgentLogField>(agentLogRecord, {
  defaultSize: 10,
  initQuery: {type: 2}
})
// 列配置
const recycleColumns = [
  {key: 'addtime', title: '变动时间', width: '15%', align: 'center' as const},
  {key: 'points', title: '金豆', width: '15%', align: 'center' as const},
  {key: 'content', title: '操作内容', width: '20%', align: 'center' as const},
]

const activeTab = ref('recycle')
const tabs = [
  {key: 'recycle', name: '回收体验卡'},
  {key: 'record', name: '回收记录'}
]
const switchTab = (key: string) => {
  activeTab.value = key
  if (key === 'record') {
    recycleTable.loadData(true);
  }

  if (key === 'recycle') {
    // 重置状态
    currentStep.value = 1;
    checkResult.value = [];
    resetForm();
  }
}

onMounted(() => {
  void fetchData();
})
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          :class="['w-20 text-center text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 ', { 'text-[#ff6600] border-b-[#ff6600]': activeTab === tab.key }]"
          @click="switchTab(tab.key)"
        >
          {{ tab.name }}
        </span>
      </div>

      <div v-if="activeTab === 'recycle'">
        <!-- 进度条 -->
        <div class="flex items-center justify-center py-8">
          <div class="flex items-center w-full max-w-lg">
            <div class="relative flex flex-col items-center">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500']">1
              </div>
              <span :class="[
                'absolute top-10 w-24 text-center text-xs font-medium',
                currentStep >= 1 ? 'text-blue-600' : 'text-gray-500']">检测卡密</span>
            </div>
            <div :class="['flex-1 h-[1px] mx-4', currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200']"></div>
            <div class="relative flex flex-col items-center">
              <div :class="[
                'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors',
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500']">2
              </div>
              <span :class="[
                'absolute top-10 w-24 text-center text-xs font-medium',
                currentStep >= 2 ? 'text-blue-600' : 'text-gray-500']">确认回收</span>
            </div>
          </div>
        </div>

        <!-- 折扣 -->
        <div class="flex gap-[30px] py-[15px]">
          <div class="flex items-center gap-2.5">
            <span class="text-[15px] font-medium text-[#333333]">收卡折扣:</span>
            <span class="text-base font-bold text-[#ff6600]">
              {{ $n((profile?.reccard_rate || 0) * 10) }}
            </span>
            <span>折</span>
          </div>
        </div>

        <!-- Step 1: 检测 -->
        <form v-if="currentStep === 1" @submit.prevent="checkCard" class="flex flex-col gap-6" :key="formKey">
          <!-- 卡密 -->
          <div class="flex gap-[1px] flex-col">
            <label class="text-[15px] font-medium text-[#333333] flex" for="cards">卡密</label>
            <div class="relative flex items-center">
              <textarea
                id="cards"
                v-model="cards"
                placeholder="请输入卡密"
                class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none min-h-[120px]"
                autocomplete="off"
                spellcheck="false"
              />
            </div>
            <ErrorMessage name="cards" class="text-[#ff4d4f] text-sm"/>
          </div>
          <!-- 提交按钮 -->
          <button type="submit"
                  :disabled="isSubmitting"
                  class="mt-4 p-4 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] text-white
                      rounded-xl text-[18px] font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(255,107,107,0.3)]
                      hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(255,107,107,0.4)] active:translate-y-0 disabled:opacity-60
                      disabled:cursor-not-allowed">
            {{ isSubmitting ? '检测中...' : '检测卡密' }}
          </button>
        </form>

        <!-- Step 2: 确认回收 -->
        <div v-if="currentStep === 2" class="flex flex-col gap-6">
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 class="font-bold text-gray-800 mb-4">卡密检测结果</h3>

            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>总提交数量:</span>
                <span class="font-bold">{{ checkResult.length }} 张</span>
              </div>
              <div class="flex justify-between text-green-600">
                <span>有效卡密:</span>
                <span class="font-bold">{{ validCards.length }} 张</span>
              </div>
              <div class="flex justify-between text-red-600">
                <span>无效/重复:</span>
                <span class="font-bold">{{ checkResult.length - validCards.length }} 张</span>
              </div>
              <div class="border-t border-gray-200 my-2 pt-2 flex justify-between items-center">
                <span class="text-base font-medium text-gray-800">预计获得金豆:</span>
                <span class="text-xl font-bold text-orange-600">{{ $n(totalPoints) }}</span>
              </div>
            </div>
          </div>

          <!-- Detail Table -->
          <div class="border rounded-lg overflow-hidden">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-100 text-gray-600">
              <tr>
                <th class="px-4 py-2">卡号</th>
                <th class="px-4 py-2">金豆</th>
                <th class="px-4 py-2">状态</th>
                <th class="px-4 py-2 text-right">备注</th>
              </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
              <tr v-for="(card, idx) in checkResult" :key="idx">
                <td class="px-4 py-2">{{ card.no }}</td>
                <td class="px-4 py-2">{{ card.points }}</td>
                <td class="px-4 py-2">
                    <span :class="card.state === 0 ? 'text-green-600' : 'text-red-500'">
                      {{ card.state === 0 ? '有效' : '已领取' }}
                    </span>
                </td>
                <td class="px-4 py-2 text-right font-medium">
                  <div>{{ card.nickname }}</div>
                  <div>({{ card.uid }})</div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>

          <div class="flex gap-4">
            <button
              @click="currentStep = 1"
              :disabled="isSubmitting"
              class="flex-1 p-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
            >
              返回修改
            </button>
            <button
              @click="confirmRecycle"
              :disabled="validCards.length === 0 || isSubmitting"
              class="flex-1 p-3 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] text-white rounded-xl font-bold
              hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {{ isSubmitting ? '提交中...' : '确认回收' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 回收记录 -->
      <div class="min-h-[calc(100vh-120px)] pb-10" v-if="activeTab === 'record'">
        <div class="max-w-[1400px] mx-auto  items-start max-[1200px]:grid-cols-1 max-[1200px]:max-w-[600px]">
          <!-- 表格 -->
          <DataTable
            :columns="recycleColumns"
            :data="recycleTable.dataSource.value"
            :loading="recycleTable.loading.value"
            :pagination="recycleTable.pagination.value"
            @change="recycleTable.changePage"
            :hasMore="recycleTable.hasMore.value"
          >
            <template #column-addtime="{ row }">
              <span class="text-gray-400 text-xs">{{ dayjs.unix(row.addtime || 0).format("YYYY-MM-DD HH:mm") }}</span>
            </template>

            <template #column-points="{ row }">
              <div class="text-orange-600 font-bold">
                {{ $n(row.points) }}
                <img alt="coin" class="inline-block w-[13px] h-[13px]" src="/ranking/coin.png"/>
              </div>
              {{
                $n((row?.points || 0) / 1000, {
                  style: 'currency',
                  currency: currency
                })
              }}
            </template>
          </DataTable>
        </div>
      </div>
    </div>
  </UserLayout>
</template>
