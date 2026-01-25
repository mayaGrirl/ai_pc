<script setup lang="ts">
import { ref } from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import {ErrorMessage, useField, useForm} from "vee-validate";
import {toTypedSchema} from "@vee-validate/zod";
import {packExchange} from "@/api/customer.ts";
import {z} from "zod";
import {useToast} from "@/composables/useToast.ts";

const toast = useToast()

const formKey = ref<number>(1);
const schema = z.object({
  code: z.string().min(1, '请输入红包码')
    .max(20, '最大只能输入20位')
    .regex(/^[a-zA-Z0-9]+$/, '无效的红包码, 只能输入数字+字母'),
});
type FormValues = z.infer<typeof schema>;
const validationSchema = toTypedSchema(schema);
const {
  handleSubmit,
  isSubmitting,
} = useForm<FormValues>({
  validationSchema: validationSchema,
})
const {value: code} = useField<string>('code')
// 提交表单
const submitExchange = handleSubmit(async (values, {setErrors}) => {
  isSubmitting.value = true

  try {
    const {code, message} = await packExchange({
      code: values?.code,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('提交成功');
    }
  } catch (error: any) {
    toast.error(error.message || '提交失败')
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">我的红包</span>
      </div>


      <!-- 验证-->
      <form @submit.prevent="submitExchange" class="flex flex-col gap-6" :key="formKey">

        <!-- 密保 -->
        <div class="flex gap-[1px] flex-col">
          <label class="text-[15px] font-medium text-[#333333]" for="code">输入红包码</label>
          <div class="relative flex items-center gap-1">
            <input
              id="code"
              type="text"
              v-model="code"
              placeholder="请输入红包码"
              class="px-4 py-[14px] border-2 border-gray-200 rounded-lg text-[15px] transition-all
                    duration-300 outline-none focus:border-[#667eea] focus:shadow-[0_0_0_3px_rgba(102,126,234,0.1)]
                    flex-1 min-w-0 text-gray-600 placeholder-gray-400 focus:outline-none"
              autocomplete="off"
              spellcheck="false"/>
          </div>
          <ErrorMessage name="code" class="text-[#ff4d4f] text-sm"/>
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
