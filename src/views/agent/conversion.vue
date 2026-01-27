<script setup lang="ts">
import UserLayout from "@/components/layout/UserLayout.vue";
import {ErrorMessage, useField, useForm} from "vee-validate";
import {onMounted, ref} from "vue";
import {toTypedSchema} from "@vee-validate/zod";
import {z} from "zod";
import {useToast} from "@/composables/useToast.ts";
import {agentOptions, agentProfile, agentTransfer} from "@/api/agent.ts";
import {AgentField} from "@/types/agent.type.ts";
import {HttpRes} from "@/types/http.type.ts";
import {useAuthStore} from "@/stores";

const toast = useToast()
const authStore = useAuthStore()

const loading = ref<boolean>(false)
const profile = ref<AgentField>();
// 转换代理选项
const options = ref<AgentField[]>([])
// 查询需要的信息
const fetchData = async () => {
  // 查询兑换需要的明细数据
  loading.value = true;
  const {code, data} = await agentProfile();
  if (code === 200) {
    profile.value = data;
  }

  const res: HttpRes<AgentField[]> = await agentOptions();
  if (res.code === 200) {
    options.value = res.data;
  }
  loading.value = false;
}

const formKey = ref<number>(1);
// 表单验证
const schema = z.object({
  uid: z.number({message: '请选择转换代理'}),
  amount: z.number({message: '请输入转换金额'})
}).superRefine((data, ctx) => {
  // 银行余额
  const max = profile.value?.bankpoints || 0;
  const ca = data.amount * 1000;
  if (max !== undefined && ca > max) {
    ctx.addIssue({
      path: ["amount"],
      message: '金额不足，不能转换',
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
} = useForm<FormValues>({
  validationSchema: validationSchema,
  initialValues: {
    uid: 0,
  }
})
const {value: uid} = useField<string>('uid')
const {value: amount} = useField<string>('amount')
// 提交表单
const submitExchange = handleSubmit(async (values, {setErrors}) => {
  const bankPoints = profile.value?.bankpoints || 0;
  if (bankPoints < 1) {
    toast.info('金额不足，不能转换')
    return;
  }

  isSubmitting.value = true

  try {
    const {code, message, data} = await agentTransfer({
      amount: values.amount,
      uid: values.uid,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('转换成功');

      authStore.setCurrentCustomer({
        bankpoints: data.bankpoints,
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
  void fetchData();
})
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">额度转换</span>
      </div>

      <!-- 验证-->
      <form @submit.prevent="submitExchange" class="flex flex-col gap-6" :key="formKey">
        <!-- 密保 -->
        <div>
          <div class="flex gap-[1px] flex-col">
            <label class="text-[15px] font-medium text-[#333333]" for="amount">转换金额</label>
            <div class="relative flex items-center gap-1">
              <input
                type="number"
                id="amount"
                inputmode="numeric"
                pattern="[0-9]*"
                v-model.number="amount"
                placeholder="请输入转换金额"
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
          <div class="flex gap-[1px] flex-col">
            <label class="text-[15px] font-medium text-[#333333]" for="uid">转换代理</label>
            <div class="relative flex items-center gap-1">
              <select id="uid"
                      v-model="uid"
                      class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none">
                <option key="option-default" value=0>请选择代理</option>
                <option v-for="item in options" :key="`option-${item.uid}`"
                        :value="item.uid">
                  {{ item.name }}
                </option>
              </select>
            </div>
            <ErrorMessage name="uid" class="text-[#ff4d4f] text-sm"/>
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
    </div>
  </UserLayout>
</template>
