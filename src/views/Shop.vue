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
    <div class="exchange-container">
      <div class="exchange-content">
        <!-- 左侧：账户信息区域 -->
        <div class="left-section">
          <!-- 顶部导航按钮 -->
          <div class="top-actions">
            <button class="action-btn" @click="router.push('/exchange-history')">
              <span>兑换记录</span>
              <i class="arrow-icon">›</i>
            </button>
            <button class="action-btn" @click="router.push('/my-cards')">
              <span>我的卡密</span>
              <i class="arrow-icon">›</i>
            </button>
          </div>

          <!-- 账户统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">银行余额</div>
              <div class="stat-value-row">
                <span class="stat-value">{{ $n(detailData?.bank_points || 0) }}</span>
                <span class="coin-icon">
                  <img
                    alt="coin"
                    class="inline-block w-[13px] h-[13px]"
                    src="/ranking/coin.png"
                  />
                </span>
              </div>
              <a href="#" class="go-link">去存入 ›</a>
            </div>

            <div class="stat-card">
              <div class="stat-label">折合</div>
              <div class="stat-value highlight">
                {{
                  $n(detailData?.bank_points_convert || 0, {
                    style: 'currency',
                    currency: currency
                  })
                }}
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-label">我的金豆</div>
              <div class="stat-value-row">
                <span class="stat-value">{{ $n(detailData?.points || 0) }}</span>
                <span class="coin-icon">
                  <img
                    alt="coin"
                    class="inline-block w-[13px] h-[13px]"
                    src="/ranking/coin.png"
                  />
                </span>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-label">近7日流水</div>
              <div class="stat-value-row">
                <span class="stat-value">{{ $n(Number(detailData?.week_water || 0)) }}</span>
                <span class="coin-icon">
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
          <div class="tips-card">
            <div class="tips-title">温馨提示</div>
            <TextSkeleton v-if="loading" :lines="5" height="14px" animation="wave"/>
            <div v-else class="tips-list" v-html="tipContent"/>
          </div>
        </div>

        <!-- 右侧：兑换表单区域 -->
        <div class="right-section">
          <div class="form-card">
            <h2 class="form-title">金豆兑换</h2>

            <form @submit.prevent="submitExchange" class="exchange-form" :key="formKey">
              <!-- 兑换金额 -->
              <div class="flex gap-[1px] flex-col">
                <label class="text-[15px] font-medium text-[#333333]" for="amount">兑换金额</label>
                <div class="input-wrapper">
                  <input
                    type="number"
                    id="amount"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    v-model.number="amount"
                    placeholder="请输入100的整数倍"
                    class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none"
                    autocomplete="off"
                    spellcheck="false"
                  />
                  <span class="input-suffix">元</span>
                </div>
                <ErrorMessage name="amount" class="text-[#ff4d4f] text-sm"/>
              </div>

              <!-- 折合金豆 -->
              <div class="flex gap-[1px] flex-col">
                <label class="text-[15px] font-medium text-[#333333]">折合金豆</label>
                <div class="result-value">
                  <span class="value-number">{{ discountedBeans }}</span>
                  <span class="coin-icon">
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
                <div class="result-value">
                  <span class="value-number">{{ serviceFee }}</span>
                </div>
              </div>

              <!-- 验证码 -->
              <div class="flex gap-[1px] flex-col" v-if="detailData?.prize_verify_type == 'smsVerify'">
                <label class="text-[15px] font-medium text-[#333333]" for="verify_code">验证码</label>
                <div class="input-wrapper gap-1">
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
                  <div class="input-wrapper gap-1">
                    <select id="safe_ask"
                            v-model="safeAsk"
                            class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none">
                      <option key="option-default" value="">请选择问题</option>
                      <option v-for="item in SAFE_QUESTION_OPTIONS" :key="`option-${item.value}`" :value="String(item.value)">
                        {{ $t(item.i18nKey) }}
                      </option>
                    </select>
                  </div>
                  <ErrorMessage name="safe_ask" class="text-[#ff4d4f] text-sm"/>
                </div>
                <div class="flex gap-[1px] flex-col">
                  <label class="text-[15px] font-medium text-[#333333]" for="answer">答案</label>
                  <div class="input-wrapper gap-1">
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

<style scoped>
.exchange-container {
  min-height: calc(100vh - 120px);
  padding: 40px 20px;
}

.exchange-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 500px;
  gap: 30px;
  align-items: start;
}

/* 左侧区域 */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 顶部操作按钮 */
.top-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.action-btn {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 18px 24px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.arrow-icon {
  font-size: 24px;
  color: #667eea;
  font-style: normal;
}

/* 统计网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-value-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-value.highlight {
  color: #ff4757;
  font-size: 28px;
}

.coin-icon {
  font-size: 18px;
}

.go-link {
  font-size: 13px;
  color: #667eea;
  text-decoration: none;
  display: inline-block;
  margin-top: 4px;
}

.go-link:hover {
  text-decoration: underline;
}

/* 温馨提示 */
.tips-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tips-title {
  font-size: 16px;
  font-weight: bold;
  color: #ff4757;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #ff4757;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* 右侧表单区域 */
.right-section {
  position: sticky;
  top: 40px;
}

.form-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin: 0 0 32px 0;
  text-align: center;
}

.exchange-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 16px;
  color: #666;
  font-size: 15px;
}

.result-value {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.value-number {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.submit-btn {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 107, 0.4);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .exchange-content {
    grid-template-columns: 1fr;
    max-width: 600px;
  }

  .right-section {
    position: static;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .exchange-container {
    padding: 20px 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .top-actions {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 24px;
  }

  .form-title {
    font-size: 24px;
  }
}
</style>
