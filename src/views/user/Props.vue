<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import {useAuthStore} from "@/stores";
import {SAFE_QUESTION_OPTIONS} from "@/constants/constants.ts";
import {ErrorMessage, useField, useForm} from "vee-validate";
import ReceiveSmsInput from "@/components/receive-sms.vue";
import {z} from "zod";
import {toTypedSchema} from "@vee-validate/zod";
import {checkSecurityPass} from "@/api/customer.ts";
import {useToast} from "@/composables/useToast.ts";
import {getSecureToken, setSecureToken} from "@/utils/verify-key.ts";
import PropsRecord from "@/views/user/components/PropsRecord.vue";

const toast = useToast()
const authStore = useAuthStore()
const customer = computed(() => authStore.currentCustomer);

// 验证状态
const verified = ref<boolean>(false);

const formKey = ref<number>(1);
const schema = z.object({
  safe_ask: z.string().optional(),
  answer: z.string().optional(),
  verify_code: z.string().optional(),
}).superRefine((data, ctx) => {
  // 密保问题
  if (customer.value?.selectcardVerifyType == 'safeQuestion') {
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
  if (customer?.value?.selectcardVerifyType == 'smsVerify') {
    if (!data.verify_code || data.verify_code.length < 1) {
      ctx.addIssue({
        path: ["verify_code"],
        message: '请输入验证码',
        code: 'custom',
      })
    }
  }
});
type FormValues = z.infer<typeof schema>;
const validationSchema = toTypedSchema(schema);
const {
  handleSubmit,
  isSubmitting,
} = useForm<FormValues>({
  validationSchema: validationSchema,
  initialValues: {
    safe_ask: "",
  }
})
const {value: safeAsk} = useField<string>('safe_ask')
const {value: answer} = useField<string>('answer')
const {value: verifyCode} = useField<string>('verify_code')
// 提交表单
const submitExchange = handleSubmit(async (values, {setErrors}) => {
  isSubmitting.value = true

  try {
    const {code, message, data} = await checkSecurityPass({
      safe_ask: values?.safe_ask,
      answer: values?.answer,
      verify_code: values?.verify_code,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('验证成功');

      verified.value = true;
      setSecureToken(data.key, 480);
    }
  } catch (error: any) {
    toast.error(error.message || '提交失败')
  } finally {
    isSubmitting.value = false
  }
})

onMounted(() => {
  // 查看卡密列表保持
  const init = async () => {
    try {
      verified.value = !!getSecureToken();
    } catch {
      verified.value = false;
    }
  }
  void init();
})
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">我的道具</span>
      </div>

      <!-- 验证-->
      <form @submit.prevent="submitExchange" class="flex flex-col gap-6" :key="formKey" v-if="!verified">
        <!-- 验证码 -->
        <div class="flex gap-[1px] flex-col" v-if="customer?.selectcardVerifyType == 'smsVerify'">
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
        <div v-if="customer?.selectcardVerifyType == 'safeQuestion'">
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
                :disabled="isSubmitting"
                class="mt-4 p-4 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] text-white
                      rounded-xl text-[18px] font-bold cursor-pointer transition-all duration-300 shadow-[0_4px_12px_rgba(255,107,107,0.3)]
                      hover:-translate-y-[2px] hover:shadow-[0_6px_16px_rgba(255,107,107,0.4)] active:translate-y-0 disabled:opacity-60
                      disabled:cursor-not-allowed">
          {{ isSubmitting ? '提交中...' : '提交' }}
        </button>
      </form>

      <!-- 验证后显示列表 -->
      <div v-else><PropsRecord /></div>
    </div>
  </UserLayout>
</template>
