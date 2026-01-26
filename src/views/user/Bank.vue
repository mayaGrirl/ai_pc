<script setup lang="ts">
import {ref, onMounted} from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import { useAuthStore } from '@/stores/auth'
import {getMemberCapital, memberCapitalTransfer} from "@/api/customer.ts";
import {MemberCapital} from "@/types/customer.type.ts";
import {ErrorMessage, useField, useForm} from "vee-validate";
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useToast} from "@/composables/useToast.ts";

const toast = useToast()

const authStore = useAuthStore()

const formKey = ref<number>(1);
const loading = ref<boolean>(false);
// 余额信息
const memberCapital = ref<MemberCapital>();
// 查询需要的信息
const fetchData = async (isTip: boolean) => {
  // 查询兑换需要的明细数据
  loading.value = true;
  const {data, code} = await getMemberCapital();
  if (code == 200) {
    // 设置明细数据
    memberCapital.value = data;
  }
  loading.value = false;
}

// 表单验证
const schema = z.object({
  type: z.string(),
  amount: z.number('请输入正整数')
    .int('必须是整数')
    .positive('金额必须大于 0'),
  pay_password: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === "out" && !data.pay_password) {
    ctx.addIssue({
      path: ["pay_password"],
      message: '取款时必须输入二级密码',
      code: 'custom',
    });
  }
}).superRefine((data, ctx) => {
  const max =
    data.type === "out" ? memberCapital.value?.bankpoints : memberCapital.value?.points;
  if (max !== undefined && data.amount > max) {
    ctx.addIssue({
      path: ["amount"],
      message: '金额超出限制',
      code: "custom",
    });
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
    type: "in",
  }
})
// 字段注册
const {value: type} = useField<string>('type')
const {value: amount} = useField<number>('amount')
const {value: pay_password} = useField<string>('pay_password')

// 提交表单
const submitExchange = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    const {code, message} = await memberCapitalTransfer({
      type: values.type,
      amount: values.amount,
      pay_password: values.pay_password,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('兑换成功');
      void await fetchData(false);

      authStore.setCurrentCustomer({
        points: memberCapital.value?.points,
        bankpoints: memberCapital.value?.bankpoints,
      })

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
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">银行服务</span>
      </div>

      <!-- 余额信息 -->
      <div class="flex gap-[30px] py-[15px]">
        <div class="flex items-center gap-2.5">
          <span class="text-sm text-[#666]">流动资金:</span>
          <span class="text-base font-bold text-[#ff6600]">
            {{ $n(memberCapital?.points || 0) }}
            <img
              alt="coin"
              class="inline-block w-[13px] h-[13px]"
              src="/ranking/coin.png"
            />
          </span>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="text-sm text-[#666]">银行存款:</span>
          <span class="text-base font-bold text-[#ff6600]">
            {{ $n(memberCapital?.bankpoints || 0) }}
            <img
              alt="coin"
              class="inline-block w-[13px] h-[13px]"
              src="/ranking/coin.png"
            />
          </span>
        </div>
      </div>

      <form @submit.prevent="submitExchange" class="flex flex-col gap-6" :key="formKey">
        <!-- 类型 -->
        <div class="flex gap-[1px] flex-col">
          <div class="flex gap-[30px] py-[15px]">
            <label class="flex items-center gap-[6px] cursor-pointer text-[14px] text-[#333]">
              <input type="radio" v-model="type" value="in" class="accent-[#ee5a6f]" />
              <span>存款</span>
            </label>
            <label class="flex items-center gap-[6px] cursor-pointer text-[14px] text-[#333]">
              <input type="radio" v-model="type" value="out" class="accent-[#ee5a6f]" />
              <span>取款</span>
            </label>
          </div>
        </div>

        <!-- 兑换金额 -->
        <div class="flex gap-[1px] flex-col">
          <label class="text-[15px] font-medium text-[#333333]" for="amount">金豆</label>
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
              class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none"
              autocomplete="off"
              spellcheck="false"
            />
          </div>
          <ErrorMessage name="amount" class="text-[#ff4d4f] text-sm"/>
        </div>

        <!-- 二级密码 -->
        <div class="flex gap-[1px] flex-col" v-if="type == 'out'">
          <label class="text-[15px] font-medium text-[#333333]" for="pay_password">二级密码</label>
          <div class="relative flex items-center gap-1">
            <input
              id="pay_password"
              type="text"
              v-model="pay_password"
              placeholder="请输入答案"
              class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none"
              autocomplete="off"
              spellcheck="false"/>
          </div>
          <ErrorMessage name="pay_password" class="text-[#ff4d4f] text-sm"/>
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
  </UserLayout>
</template>
