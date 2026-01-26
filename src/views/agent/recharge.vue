<script setup lang="ts">
import UserLayout from "@/components/layout/UserLayout.vue";
import {ErrorMessage, useField, useForm} from "vee-validate";
import {onMounted, ref, watch} from "vue";
import {toTypedSchema} from "@vee-validate/zod";
import {agentLogRecord, agentProfile, agentRecharge, checkUid} from "@/api/agent.ts";
import {z} from "zod";
import {AgentField, AgentLogField} from "@/types/agent.type.ts";
import {useToast} from "@/composables/useToast.ts";
import {useAuthStore} from "@/stores";
import {useI18n} from "vue-i18n";
import {LOCALE_CURRENCY_MAP} from "@/i18n";
import DataTable from "@/components/ui/DataTable.vue";
import {useTable} from "@/composables/useTable.ts";
import dayjs from "dayjs";

const fastAmount = [100, 500, 1000, 5000];

const toast = useToast()
const authStore = useAuthStore()
const {locale} = useI18n()
// 币种符号
const currency = LOCALE_CURRENCY_MAP[locale.value] ?? 'USD';

const loading = ref<boolean>(false)
const profile = ref<AgentField>();
// 查询需要的信息
const fetchData = async () => {
  // 查询兑换需要的明细数据
  loading.value = true;
  const {code, data} = await agentProfile();
  if (code === 200) {
    profile.value = data;
  }

  loading.value = false;
}

const formKey = ref<number>(1);
// 表单验证
const schema = z.object({
  uid: z.number({message: '请输入用户ID'}),
  amount: z.number({message: '请输入充值金额'})
}).superRefine((data, ctx) => {
  // 银行余额
  const max = profile.value?.bankpoints || 0;
  const ca = data.amount * 1000;
  if (max !== undefined && ca > max) {
    ctx.addIssue({
      path: ["amount"],
      message: '余额不足，无法充值',
      code: "custom",
    });
  }
});
type FormValues = z.infer<typeof schema>;
const validationSchema = toTypedSchema(schema);
const {
  handleSubmit,
  isSubmitting,
  resetForm,
  setFieldValue,
  setFieldError,
} = useForm<FormValues>({
  validationSchema: validationSchema,
})
const {value: uid} = useField<number>('uid')
const {value: amount} = useField<number>('amount')
// 提交表单
const submitExchange = handleSubmit(async (values) => {
  const bankPoints = profile.value?.bankpoints || 0;
  if (bankPoints < 1) {
    toast.info('余额不足，无法充值')
    return;
  }

  isSubmitting.value = true

  try {
    const {code, message, data} = await agentRecharge({
      amount: values.amount,
      uid: values.uid,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('充值成功');

      authStore.setCurrentCustomer({
        bankpoints: data.bankpoints,
      })
      resetForm();
      checkData.value = undefined;
      void fetchData();
    }
  } catch (error: any) {
    toast.error(error.message || '提交失败')
  } finally {
    isSubmitting.value = false
  }
})

// 检测用户ID是否存在
const checkData = ref<string>();
const isSending = ref<boolean>(false)
const checkCustomer = async () => {
  if (isSending.value) return;

  if (!/^\d+$/.test(String(uid.value))) {
    setFieldError("uid", '请输入用户ID');
    return;
  }

  // 立刻锁定， 防止重复点击
  isSending.value = true;
  try {
    const {code, data, message} = await checkUid(uid.value);
    if (code !== 200) {
      toast.error(message);
    } else {
      checkData.value = `ID: ${data.aid}, 昵称: ${data.nickname || '-'}, 收款人: ${data.realname || '-'}`;

      toast.success("检测成功");
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : '检测失败，刷新页面请重试';
    toast.error(msg);
  } finally {
    isSending.value = false;
  }
};

// 快速设置金额
const fastAmountClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement

  // 防止点到空白区域
  const span = target.closest('span[data-val]') as HTMLElement | null
  if (!span) return

  // 金额
  const val = span.dataset.val
  if (!val) return

  // 设置金额
  setFieldValue('amount', Number(val), true )
}

// 充值记录
const rechargeTable = useTable<AgentLogField>(agentLogRecord, {
  defaultSize: 10,
  initQuery: {type: 3}
})
// 列配置
const rechargeColumns = [
  { key: 'addtime', title: '变动时间', width: '15%', align: 'center' as const },
  { key: 'points', title: '金豆', width: '15%', align: 'center' as const },
  { key: 'content', title: '操作内容', width: '20%', align: 'center' as const },
]

const activeTab = ref('recharge')
const tabs = [
  { key: 'recharge', name: '代理充值' },
  { key: 'record', name: '充值记录' }
]

const switchTab = (key: string) => {
  activeTab.value = key
  if (key === 'record') {
    rechargeTable.loadData(true);
  }

  if (key === 'recharge') {
    resetForm();
  }
}

// 监听uid变化清除检测数据
watch(uid, () => {
 checkData.value = undefined
})

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

      <div v-if="activeTab === 'recharge'">
        <!-- 余额信息 -->
        <div class="flex gap-[30px] py-[15px]">
          <div class="flex items-center gap-2.5">
            <span class="text-[15px] font-medium text-[#333333]">银行余额:</span>
            <span class="text-base font-bold text-[#ff6600]">
            {{ $n(profile?.bankpoints || 0) }}
            <img
              alt="coin"
              class="inline-block w-[13px] h-[13px]"
              src="/ranking/coin.png"
            />
          </span>

            <div class="text-xs">({{$n((profile?.bankpoints || 0) / 1000, {
              style: 'currency',
              currency: currency
            })}})</div>
          </div>
          <div class="flex items-center gap-2.5">
            <span class="text-[15px] font-medium text-[#333333]">折扣:</span>
            <span class="text-base font-bold text-[#ff6600]">
            {{ $n((profile?.buycard_rate || 0) * 10) }}
          </span>
            折
          </div>
        </div>
        <form @submit.prevent="submitExchange" class="flex flex-col gap-6" :key="formKey">
          <!-- 充值用户 -->
          <div class="flex gap-[1px] flex-col">
            <label class="text-[15px] font-medium text-[#333333]" for="uid">
              用户ID
              <span class="text-red-600">{{checkData}}</span>
            </label>
            <div class="relative flex items-center gap-1">
              <input
                id="uid"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                placeholder="请输入用户ID"
                v-model.number="uid"
                class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
              duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
              flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none"
              />

              <!-- 按钮 -->
              <button
                type="button"
                @click="checkCustomer"
                :class="[
                'shrink-0 h-8 px-3 rounded text-xs whitespace-nowrap transition',
                isSending
                  ? 'bg-gray-600 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white active:scale-95 cursor-pointer'
              ]"
              >
                {{ isSending ? '检测中...' : '检测账号' }}
              </button>
            </div>
            <ErrorMessage name="uid" class="text-[#ff4d4f] text-sm"/>
          </div>
          <!-- 充值金额 -->
          <div class="flex gap-[1px] flex-col">
            <label class="text-[15px] font-medium text-[#333333] flex" for="amount">
              <span>充值金额</span>
              <div class="flex flex-wrap gap-2 justify-start w-5/7 ml-2" @click="fastAmountClick">
              <span v-for="v in fastAmount" :key="`span-key-${v}`"
                    :data-val="v"
                    class="shrink-0 h-8 px-3 py-1 rounded whitespace-nowrap transition bg-blue-600
                                text-white active:scale-95 cursor-pointer">
                {{ $n(v) }}
              </span>
              </div>
            </label>

            <div class="relative flex items-center">
              <input
                type="number"
                id="amount"
                inputmode="numeric"
                pattern="[0-9]*"
                step="100"
                min="0"
                v-model.number="amount"
                placeholder="请输入充值金额"
                class="px-4 py-[14px] pr-20 border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none"
                autocomplete="off"
                spellcheck="false"
              />
              <span class="absolute right-4 text-[#666] text-[15px]">元</span>
            </div>
            <ErrorMessage name="amount" class="text-[#ff4d4f] text-sm"/>
          </div>

          <!-- 提交按钮 -->
          <button type="submit"
                  :disabled="isSubmitting"
                  class="mt-4 p-4 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] text-white
                      rounded-xl text-[18px] font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(255,107,107,0.3)]
                      hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(255,107,107,0.4)] active:translate-y-0 disabled:opacity-60
                      disabled:cursor-not-allowed">
            {{ isSubmitting ? '提交中...' : '提交' }}
          </button>
        </form>
      </div>

      <!-- 充值记录 -->
      <div class="min-h-[calc(100vh-120px)] pb-10" v-if="activeTab === 'record'">
        <div class="max-w-[1400px] mx-auto  items-start max-[1200px]:grid-cols-1 max-[1200px]:max-w-[600px]">
          <!-- 表格 -->
          <DataTable
            :columns="rechargeColumns"
            :data="rechargeTable.dataSource.value"
            :loading="rechargeTable.loading.value"
            :pagination="rechargeTable.pagination.value"
            @change="rechargeTable.changePage"
            :hasMore="rechargeTable.hasMore.value"
          >
            <template #column-addtime="{ row }">
              <span class="text-gray-400 text-xs">{{ dayjs.unix(row.addtime || 0).format("YYYY-MM-DD HH:mm") }}</span>
            </template>

            <template #column-points="{ row }">
              <div class="text-orange-600 font-bold">
                {{ $n(row.points) }}
                <img alt="coin" class="inline-block w-[13px] h-[13px]" src="/ranking/coin.png" />
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
