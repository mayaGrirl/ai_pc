<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import TextSkeleton from '@/components/ui/TextSkeleton.vue'
import ReceiveSmsInput from '@/components/receive-sms.vue'
import {cardDetail, cardExchange} from "@/api/shop.ts";
import type {CardDetailResponse} from "@/types/shop.type.ts";
import {LOCALE_CURRENCY_MAP} from "@/i18n";
import {useI18n} from "vue-i18n";
import {z} from "zod";
import {ErrorMessage, useField, useForm} from "vee-validate";
import {toTypedSchema} from "@vee-validate/zod";
import {useToast} from "@/composables/useToast.ts";
import Decimal from "decimal.js";
import {SAFE_QUESTION_OPTIONS} from "@/constants/constants.ts";
import {ChevronRight} from "lucide-vue-next";

const toast = useToast()
const {locale} = useI18n()
const router = useRouter()
// 币种符号
const currency = LOCALE_CURRENCY_MAP[locale.value] ?? 'USD';

const formKey = ref<number>(1);
const loading = ref<boolean>(false);
// 银行余额是否可以提交表单
const isSubmit = ref<boolean>(false);
// 免手续费额度
const exemptCommissionBankPoints = ref<number>(0);
// 账户数据
const detailData = ref<CardDetailResponse>();
// 温馨提示
const tipContent = ref<string>('')

// 查询兑换需要的信息
const fetchData = async (isTip: boolean) => {
  // 查询兑换需要的明细数据
  loading.value = true;
  const {data, code} = await cardDetail();
  if (code == 200) {
    // 设置温馨提示
    if (isTip) tipContent.value = (data?.block_content || '');
    // 设置明细数据
    detailData.value = data;
    // 免除手续费的可领取金豆
    exemptCommissionBankPoints.value = (data.exempt_commission_bank_points || 0)

    // 银行存款
    const bankPoints = data.bank_points || 0;

    /**
     * 会员所在的分组是否允许兑换
     * 银行存款必须大于100
     */
    if (data.is_allowed_exchange && bankPoints >= 100) {
      isSubmit.value = false;
    }
  }
  loading.value = false;
}

// 表单提交
const schema = z.object({
  amount: z.number({message: "请输入金额"})
    .int('必须是整数')
    .positive('金额必须大于 0')
    .refine((v) => v % 100 === 0, {
      message: '请输入100的整数倍',
    }),
  commission: z.number().optional(),
  safe_ask: z.string().optional(),
  answer: z.string().optional(),
  verify_code: z.string().optional(),
}).superRefine((data, ctx) => {
  const max = detailData.value?.bank_points;
  if (max !== undefined && data.amount > max) {
    ctx.addIssue({
      path: ["amount"],
      message: '兑换金额不能超过银行余额',
      code: "custom",
    });
  }
  // 密保问题
  if (detailData.value?.prize_verify_type == 'safeQuestion') {
    if (!data.safe_ask || data.safe_ask.length < 1) {
      ctx.addIssue({
        path: ["safe_ask"],
        message: '请选择密保问题',
        code: "custom",
      });
    }
    if (!data.answer || data.answer.length < 1) {
      ctx.addIssue({
        path: ["answer"],
        message: '请输入答案',
        code: "custom",
      });
    }
    if (data.answer && data.answer.length > 50) {
      ctx.addIssue({
        path: ["answer"],
        message: '答案不能超过50字符',
        code: "custom",
      });
    }
  }
  // 验证码
  if (detailData.value?.prize_verify_type == 'smsVerify') {
    if (!data.verify_code || data.verify_code.length < 1) {
      ctx.addIssue({
        path: ["verify_code"],
        message: '请输入验证码',
        code: 'custom',
      })
    }
  }
});
type FormValues = z.infer<typeof schema>
const validationSchema = toTypedSchema(schema);
const {
  handleSubmit,
  isSubmitting,
  resetForm,
} = useForm<FormValues>({
  validationSchema: validationSchema,
  initialValues: {
    safe_ask: "",
  }
})
// 字段注册
const {value: amount} = useField<number>('amount')
const {value: safeAsk} = useField<string>('safe_ask')
const {value: answer} = useField<string>('answer')
const {value: verifyCode} = useField<string>('verify_code')

// 计算折合金豆,1元 = 1000金豆
const exchangeRate = 1000
// 实时计算折合金豆
const discountedBeans = computed(() => {
  return Math.floor((amount.value || 0) * exchangeRate)
})
// 实时计算手续费
// 公式：会员输入的金额 - 可抵消手续费的金豆 * 手续费比例 / 1000(转换成金额)
const serviceFee = computed(() => {
  if (amount.value > 0) {
    const _p = amount.value * exchangeRate
    return new Decimal(_p).sub(exemptCommissionBankPoints.value).mul(0.02).div(1000).ceil().toNumber()
  }
  return 0
})
// 提交表单
const submitExchange = handleSubmit(async (values, {setErrors}) => {
  isSubmitting.value = true

  try {
    const {code, message} = await cardExchange({
      amount: discountedBeans.value,
      commission: 0,
      safe_ask: values.safe_ask,
      answer: values.answer,
      verify_code: values.verify_code,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('兑换成功');
      void await fetchData(false);
      resetForm();
    }

  } catch (error: any) {
    toast.error(error.message || '提交失败')
  } finally {
    isSubmitting.value = false
  }
})

onMounted(() => {
  fetchData(true)
})
</script>

<template>
  <MainLayout>
    <div class="min-h-[calc(100vh-120px)] px-5 py-10">
      <div
        class="max-w-[1400px] mx-auto grid grid-cols-[1fr_500px] gap-[30px] items-start max-[1200px]:grid-cols-1 max-[1200px]:max-w-[600px]">
        <!-- 左侧：账户信息区域 -->
        <div class="flex flex-col gap-6">
          <!-- 顶部导航按钮 -->
          <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <button class="bg-white rounded-xl px-6 py-[18px] flex justify-between items-center text-base font-medium
            text-[#333] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                    @click="router.push('/exchange-history')">
              <span>兑换记录</span>
              <i class="text-[24px] text-[#667eea] not-italic"><ChevronRight class='h-4 w-4' /></i>
            </button>
            <button class="bg-white rounded-xl px-6 py-[18px] flex justify-between items-center text-base font-medium
            text-[#333] transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                    @click="router.push('/my-cards')">
              <span>我的卡密</span>
              <i class="text-[24px] text-[#667eea] not-italic"><ChevronRight class='h-4 w-4' /></i>
            </button>
          </div>

          <!-- 账户统计卡片 -->
          <div class="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div class="bg-white rounded-xl p-5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]
             hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <div class="text-sm text-gray-600 mb-2">银行余额</div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-2xl text-[28px] font-bold text-[#ff4757]">{{
                    $n(detailData?.bank_points || 0)
                  }}</span>
                <span class="text-lg">
                  <img
                    alt="coin"
                    class="inline-block w-[13px] h-[13px]"
                    src="/ranking/coin.png"
                  />
                </span>
              </div>
              <a href="#" class="mt-1 text-[13px] text-[#667eea] no-underline hover:underline flex items-center">
                去存入 <ChevronRight class='h-4 w-4' />
              </a>
            </div>

            <div class="bg-white rounded-xl p-5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]
             hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <div class="text-sm text-gray-600 mb-2">折合</div>
              <div class="text-2xl text-[28px] font-bold text-[#ff4757]">
                {{
                  $n(detailData?.bank_points_convert || 0, {
                    style: 'currency',
                    currency: currency
                  })
                }}
              </div>
            </div>

            <div class="bg-white rounded-xl p-5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]
             hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <div class="text-sm text-gray-600 mb-2">我的金豆</div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-2xl text-[28px] font-bold text-[#ff4757]">{{ $n(detailData?.points || 0) }}</span>
                <span class="text-lg">
                  <img
                    alt="coin"
                    class="inline-block w-[13px] h-[13px]"
                    src="/ranking/coin.png"
                  />
                </span>
              </div>
            </div>

            <div class="bg-white rounded-xl p-5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:-translate-y-[2px]
             hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
              <div class="text-sm text-gray-600 mb-2">近7日流水</div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-2xl text-[28px] font-bold text-[#ff4757]">{{
                    $n(Number(detailData?.week_water || 0))
                  }}</span>
                <span class="text-lg">
                  <img
                    alt="coin"
                    class="inline-block w-[13px] h-[13px]"
                    src="/ranking/coin.png"
                  />
                </span>
              </div>
            </div>
          </div>

          <!-- 温馨提示 -->
          <div class="bg-white rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
            <div class="text-base font-bold text-[#ff4757] mb-4 pl-3 border-l-4 border-[#ff4757]">温馨提示</div>
            <TextSkeleton v-if="loading" :lines="5" height="14px" animation="wave"/>
            <div v-else class="list-none p-0 m-0" v-html="tipContent"/>
          </div>
        </div>

        <!-- 右侧：兑换表单区域 -->
        <div class="sticky top-10 max-[1200px]:static">
          <div class="bg-white rounded-2xl p-10 shadow-[0_8px_24px_rgba(0,0,0,0.12)] max-md:p-6">
            <h2 class="text-[28px] font-bold text-[#333] mb-8 text-center max-md:text-2xl">金豆兑换</h2>

            <form @submit.prevent="submitExchange" class="flex flex-col gap-6" :key="formKey">
              <!-- 兑换金额 -->
              <div class="flex gap-[1px] flex-col">
                <label class="text-[15px] font-medium text-[#333333]" for="amount">兑换金额</label>
                <div class="relative flex items-center">
                  <input
                    type="number"
                    id="amount"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    step="100"
                    min="0"
                    v-model.number="amount"
                    placeholder="请输入100的整数倍"
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

              <!-- 折合金豆 -->
              <div class="flex gap-[1px] flex-col">
                <label class="text-[15px] font-medium text-[#333333]">折合金豆</label>
                <div class="flex items-center gap-2 px-4 py-[14px] bg-gray-50 rounded-lg border-2 border-gray-200">
                  <span class="text-lg font-bold text-[#333]">{{ discountedBeans }}</span>
                  <span class="text-lg">
                    <img
                      alt="coin"
                      class="inline-block w-[13px] h-[13px]"
                      src="/ranking/coin.png"
                    />
                  </span>
                </div>
              </div>

              <!-- 手续费 -->
              <div class="flex gap-[1px] flex-col">
                <label class="text-[15px] font-medium text-[#333333]">手续费</label>
                <div class="flex items-center gap-2 px-4 py-[14px] bg-gray-50 rounded-lg border-2 border-gray-200">
                  <span class="text-lg font-bold text-[#333]">{{ serviceFee }}</span>
                </div>
              </div>

              <!-- 验证码 -->
              <div class="flex gap-[1px] flex-col" v-if="detailData?.prize_verify_type == 'smsVerify'">
                <label class="text-[15px] font-medium text-[#333333]" for="verify_code">验证码</label>
                <div class="relative flex items-center gap-1">
                  <ReceiveSmsInput
                    scene="exchange_card"
                    v-model="verifyCode"
                  />
                </div>
                <ErrorMessage name="verify_code" class="text-[#ff4d4f] text-sm"/>
              </div>

              <!-- 密保 -->
              <div v-if="detailData?.prize_verify_type == 'safeQuestion'">
                <div class="flex gap-[1px] flex-col">
                  <label class="text-[15px] font-medium text-[#333333]" for="safe_ask">验证码</label>
                  <div class="relative flex items-center gap-1">
                    <select id="safe_ask"
                            v-model="safeAsk"
                            class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none">
                      <option key="option-default" value="">请选择问题</option>
                      <option v-for="item in SAFE_QUESTION_OPTIONS" :key="`option-${item.value}`"
                              :value="String(item.value)">
                        {{ $t(item.i18nKey) }}
                      </option>
                    </select>
                  </div>
                  <ErrorMessage name="safe_ask" class="text-[#ff4d4f] text-sm"/>
                </div>
                <div class="flex gap-[1px] flex-col">
                  <label class="text-[15px] font-medium text-[#333333]" for="answer">答案</label>
                  <div class="relative flex items-center gap-1">
                    <input
                      id="answer"
                      type="text"
                      v-model="answer"
                      placeholder="请输入答案"
                      class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none"
                      autocomplete="off"
                      spellcheck="false"/>
                  </div>
                  <ErrorMessage name="answer" class="text-[#ff4d4f] text-sm"/>
                </div>
              </div>

              <!-- 提交按钮 -->
              <button type="submit"
                      :disabled="isSubmitting || isSubmit"
                      class="mt-4 p-4 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] text-white
                      rounded-xl text-[18px] font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(255,107,107,0.3)]
                      hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(255,107,107,0.4)] active:translate-y-0 disabled:opacity-60
                      disabled:cursor-not-allowed">
                {{ isSubmitting ? '提交中...' : '提交' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
