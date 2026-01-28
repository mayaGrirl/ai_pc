<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {ChevronRight, Lock, ShieldCheck, HelpCircle, Gift, Eye} from "lucide-vue-next";
import UserLayout from '@/components/layout/UserLayout.vue'
import {useToast} from "@/composables/useToast";
import {
  updateLoginPassword,
  updatePayPassword,
  setSecurityPass,
  settingRedeemGiftVerifyType,
  settingViewCardVerifyType,
} from '@/api/customer';
import {useAuthStore} from "@/stores";
import {SAFE_QUESTION_OPTIONS} from "@/constants/constants.ts";
import {isEmpty} from "@/utils/utils.ts";
import {z} from "zod";
import {toTypedSchema} from "@vee-validate/zod";
import {ErrorMessage, useField, useForm} from "vee-validate";
import SodiumEncryptor from "@/utils/sodium.ts";
import {httpConfigRKey} from "@/api/common.ts";
import ReceiveSmsInput from "@/components/receive-sms.vue";
import {useRouter} from "vue-router";

const router = useRouter()
const toast = useToast();
const authStore = useAuthStore()
const customer = computed(() => authStore.currentCustomer)

type TabKey = 'LOGIN_PWD' | 'PAY_PWD' | 'SECURITY_QUEST' | 'GIFT_VERIFY' | 'CARD_VERIFY';
const activeTab = ref<TabKey>('LOGIN_PWD');

// 表单提交loading
const formLoading = ref<boolean>(false);
// 是否设置过密保
const isShowSecurityPass = computed(() => {
  if (!customer.value) return false;
  return isEmpty(customer.value.securitypass);
})

// Form States
const securityQuestForm = ref({question: '', answer: ''});
// 设置密保
const handleSetSecurityQuest = async () => {
  if (formLoading.value) return;
  if (!securityQuestForm.value.question || !securityQuestForm.value.answer) {
    toast.error('请填写完整密保信息');
    return;
  }
  formLoading.value = true;
  try {
    const {code, message} = await setSecurityPass({
      safe_ask: securityQuestForm.value.question,
      answer: securityQuestForm.value.answer
    });
    if (code === 200) {
      toast.success('密保设置成功');
      securityQuestForm.value = {question: '', answer: ''};
      // 切换到登录密码标签
      activeTab.value = 'LOGIN_PWD';
      // 更新store，标记密保已设置
      authStore.setCurrentCustomer({
        securitypass: '1'
      });
    } else {
      toast.error(message);
    }
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : '保存失败，刷新页面请重试';
    toast.error(msg);
  } finally {
    formLoading.value = false;
  }
};

// 兑换卡密
const handleUpdateRedeemVerify = async (val: string) => {
  if (formLoading.value) return;
  formLoading.value = true;
  try {
    const {code, message} = await settingRedeemGiftVerifyType({prize_verify_type: val});
    if (code === 200) {
      toast.success('兑奖验证方式已更新');
      authStore.setCurrentCustomer({
        prizeVerifyType: val
      });
    } else {
      toast.error(message || '更新失败');
    }
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : '保存失败，刷新页面请重试';
    toast.error(msg);
  } finally {
    formLoading.value = false;
  }
};

// 查看卡密
const handleUpdateViewCardVerify = async (val: string) => {
  if (formLoading.value) return;

  formLoading.value = true;
  try {
    const {code, message} = await settingViewCardVerifyType({select_card_verify_type: val});
    if (code === 200) {
      toast.success('查看卡密验证方式已更新');
      authStore.setCurrentCustomer({
        selectcardVerifyType: val
      });
    } else {
      toast.error(message || '更新失败');
    }
  } catch (e: any) {
    const msg = e instanceof Error ? e.message : '保存失败，刷新页面请重试';
    toast.error(msg);
  } finally {
    formLoading.value = false;
  }
};

// 更新登录密码 + 二级密码
const publicKey = ref<string>('');
// 表单验证
const schema = z.object({
  verify_code: z.string().min(1, '请输入验证码'),
  password: z.string().min(8, '请输入密码'),
  confirm_password: z.string(),
}).refine(
  (data) => data.password === data.confirm_password,
  {
    path: ["confirm_password"],
    message: '两次输入的密码不一致',
  }
);
type FormValues = z.infer<typeof schema>
const validationSchema = toTypedSchema(schema);
const {
  handleSubmit,
  isSubmitting,
  resetForm,
} = useForm<FormValues>({
  validationSchema: validationSchema,
  initialValues: {
    password: '',
    confirm_password: '',
    verify_code: '',
  }
})
// 字段注册
const {value: password} = useField<string>('password')
const {value: confirm_password} = useField<string>('confirm_password')
const {value: verify_code} = useField<string>('verify_code')
// 提交表单
const submitExchange = handleSubmit(async (values) => {
  console.log('submitExchange', values);
  isSubmitting.value = true;
  // 加密
  const newPassword = await SodiumEncryptor.encrypt(
    values.password,
    publicKey.value,
  );
  const newConfirmPassword = await SodiumEncryptor.encrypt(
    values.confirm_password,
    publicKey.value,
  );
  try {
    if (activeTab.value === 'LOGIN_PWD') {
      const {code, message} = await updateLoginPassword({
        verify_code: values.verify_code,
        password: newPassword,
        confirm_password: newConfirmPassword,
      });
      if (code !== 200) {
        toast.error(message);
      } else {
        toast.success('更新成功');
        resetForm();
        authStore.logout();
        await router.push('/login')
      }
    } else {
      const {code, message} = await updatePayPassword({
        verify_code: values.verify_code,
        password: newPassword,
        confirm_password: newConfirmPassword,
      });
      if (code !== 200) {
        toast.error(message);
      } else {
        toast.success('更新成功');
      }
    }
  } catch (error: any) {
    toast.error(error.message || '提交失败');
  } finally {
    isSubmitting.value = false;
  }
})

// 监听tab变化
watch(activeTab, (tab) => {
  if (tab === 'LOGIN_PWD' || tab === 'PAY_PWD') {
    resetForm();
  }
})

onMounted(() => {
  httpConfigRKey().then(({data, code}) => {
    if (code == 200) publicKey.value = data.key;
  });
})
</script>

<template>
  <UserLayout>
    <div class="flex flex-col gap-5">
      <!-- 页面标签 -->
      <div class="flex gap-5 border-b border-[#eee] pb-[15px]">
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">安全中心</span>
      </div>

      <div class="flex gap-6 items-start">
        <!-- Left Side: Menus -->
        <div class="flex-1 bg-white rounded-xl border border-gray-100 p-6 shadow-sm min-h-[600px]">
          <div class="mb-6 pb-4 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800">安全设置</h3>
            <p class="text-sm text-gray-500 mt-1">定期更新您的设置，以便保护账号安全</p>
          </div>

          <section class="mb-6">
            <div class="flex items-center text-sm text-gray-600 mb-4 font-bold border-l-4 border-[#ff6600] pl-3">
              账户安全
            </div>
            <div class="space-y-3">
              <div
                @click="activeTab = 'LOGIN_PWD'"
                class="flex items-center justify-between rounded-xl px-4 py-4 transition-all cursor-pointer border group"
                :class="activeTab === 'LOGIN_PWD' ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <Lock class="w-4 h-4 text-orange-500"/>
                  </div>
                  <div>
                    <div class="text-gray-800 text-sm font-medium">登录密码</div>
                    <div class="text-[11px] text-gray-400">用于登录账户，建议定期更换</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1"
                              :class="activeTab === 'LOGIN_PWD' ? 'text-orange-500' : 'text-gray-300'"/>
              </div>
            </div>
          </section>

          <section class="mb-6">
            <div class="flex items-center text-sm text-gray-600 mb-4 font-bold border-l-4 border-blue-500 pl-3">
              支付安全
            </div>
            <div class="space-y-3">
              <div
                @click="activeTab = 'PAY_PWD'"
                class="flex items-center justify-between rounded-xl px-4 py-4 transition-all cursor-pointer border group"
                :class="activeTab === 'PAY_PWD' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <ShieldCheck class="w-4 h-4 text-blue-500"/>
                  </div>
                  <div>
                    <div class="text-gray-800 text-sm font-medium">二级密码</div>
                    <div class="text-[11px] text-gray-400">用于资金变动、兑换等高危操作验证</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1"
                              :class="activeTab === 'PAY_PWD' ? 'text-blue-500' : 'text-gray-300'"/>
              </div>
              <div v-if="isShowSecurityPass"
                @click="activeTab = 'SECURITY_QUEST'"
                class="flex items-center justify-between rounded-xl px-4 py-4 transition-all cursor-pointer border group"
                :class="activeTab === 'SECURITY_QUEST' ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <HelpCircle class="w-4 h-4 text-blue-500"/>
                  </div>
                  <div>
                    <div class="text-gray-800 text-sm font-medium">密保设置</div>
                    <div class="text-[11px] text-gray-400">找回密码、修改重要信息的最后一道防线</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1"
                              :class="activeTab === 'SECURITY_QUEST' ? 'text-blue-500' : 'text-gray-300'"/>
              </div>
            </div>
          </section>

          <section class="mb-6">
            <div class="flex items-center text-sm text-gray-600 mb-4 font-bold border-l-4 border-purple-500 pl-3">
              其他权限验证
            </div>
            <div class="space-y-3">
              <div
                @click="activeTab = 'GIFT_VERIFY'"
                class="flex items-center justify-between rounded-xl px-4 py-4 transition-all cursor-pointer border group"
                :class="activeTab === 'GIFT_VERIFY' ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <Gift class="w-4 h-4 text-purple-500"/>
                  </div>
                  <div>
                    <div class="text-gray-800 text-sm font-medium">兑奖验证方式</div>
                    <div class="text-[11px] text-gray-400">设置兑换红包或奖品时的二次验证</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1"
                              :class="activeTab === 'GIFT_VERIFY' ? 'text-purple-500' : 'text-gray-300'"/>
              </div>
              <div
                @click="activeTab = 'CARD_VERIFY'"
                class="flex items-center justify-between rounded-xl px-4 py-4 transition-all cursor-pointer border group"
                :class="activeTab === 'CARD_VERIFY' ? 'bg-purple-50 border-purple-200 shadow-sm' : 'bg-gray-50 border-transparent hover:bg-gray-100'"
              >
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform">
                    <Eye class="w-4 h-4 text-purple-500"/>
                  </div>
                  <div>
                    <div class="text-gray-800 text-sm font-medium">查看卡密验证方式</div>
                    <div class="text-[11px] text-gray-400">设置查看已购卡密时的验证方式</div>
                  </div>
                </div>
                <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1"
                              :class="activeTab === 'CARD_VERIFY' ? 'text-purple-500' : 'text-gray-300'"/>
              </div>
            </div>
          </section>
        </div>

        <!-- Right Side: Forms -->
        <div class="w-[420px] shrink-0">
          <div class="bg-white rounded-xl border border-gray-100 p-8 shadow-md sticky top-5 min-h-[400px]">
            <!-- 登录密码表单 / 二级密码表单 -->
            <form @submit.prevent="submitExchange" key="login-password" v-if="activeTab === 'LOGIN_PWD' || activeTab === 'PAY_PWD'" class="space-y-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Lock class="w-5 h-5 text-orange-500" v-if="activeTab === 'LOGIN_PWD'"/>
                  <ShieldCheck class="w-4 h-4 text-blue-500" v-else-if="activeTab === 'PAY_PWD'"/>
                </div>
                <h4 class="text-base font-bold text-gray-800">{{activeTab === 'LOGIN_PWD' ? '修改登录密码' : '修改二级密码'}}</h4>
              </div>
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 ml-1 uppercase" for="password">新密码</label>
                  <input id="password" v-model="password" type="password" placeholder="请输入新密码"
                         class="security-input"
                         autocomplete="off"
                         spellcheck="false"/>
                </div>
                <ErrorMessage name="password" class="text-[#ff4d4f] text-sm"/>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 ml-1 uppercase" for="confirm_password">确认新密码</label>
                  <input id="confirm_password" v-model="confirm_password" type="password" placeholder="请再次输入新密码"
                         autocomplete="off"
                         spellcheck="false"
                         class="security-input"/>
                </div>
                <ErrorMessage name="confirm_password" class="text-[#ff4d4f] text-sm"/>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 ml-1 uppercase" for="verify_code">验证码</label>
                  <div class="flex items-center gap-2">
                    <ReceiveSmsInput
                      :scene="activeTab === 'LOGIN_PWD' ? 'update_password' : 'update_pay_password'"
                      v-model="verify_code"
                    />
                  </div>
                </div>
                <ErrorMessage name="confirm_password" class="text-[#ff4d4f] text-sm"/>

              </div>
              <button type="submit" :disabled="isSubmitting" class="security-btn bg-[#ff6600]">
                {{ isSubmitting ? '提交中...' : '提交修改' }}
              </button>
            </form>

            <!-- 密保设置表单 -->
            <div v-else-if="activeTab === 'SECURITY_QUEST' && isShowSecurityPass" class="space-y-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HelpCircle class="w-5 h-5 text-blue-500"/>
                </div>
                <h4 class="text-base font-bold text-gray-800">设置密保问题</h4>
              </div>
              <div class="space-y-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 ml-1 uppercase">密保问题</label>
                  <select v-model="securityQuestForm.question" class="security-input appearance-none">
                    <option value="" disabled>选择您的密保问题</option>
                    <option v-for="item in SAFE_QUESTION_OPTIONS" :key="`option-${item.value}`"
                            :value="String(item.value)">
                      {{ $t(item.i18nKey) }}
                    </option>
                  </select>
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-gray-500 ml-1 uppercase">密保答案</label>
                  <input v-model="securityQuestForm.answer" type="text" placeholder="请输入答案"
                         class="security-input"/>
                </div>
                <button @click="handleSetSecurityQuest" :disabled="formLoading" class="security-btn bg-blue-500">
                  {{ formLoading ? '提交中...' : '提交设置' }}
                </button>
              </div>
            </div>

            <!-- 兑换卡密表单 -->
            <div v-else-if="activeTab === 'GIFT_VERIFY'" class="space-y-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Gift class="w-5 h-5 text-purple-500"/>
                </div>
                <h4 class="text-base font-bold text-gray-800">兑奖验证方式</h4>
              </div>
              <div class="space-y-3 pt-2">
                <div v-for="(label, val) in { 'smsVerify': '短信验证', 'safeQuestion': '密保验证' }" :key="val"
                     @click="handleUpdateRedeemVerify(val)"
                     class="flex items-center justify-between p-4 rounded-lg bg-gray-50 transition-all cursor-pointer group border-2"
                     :class="customer?.prizeVerifyType === val ? 'bg-white border-purple-500 shadow-md' : 'border-transparent hover:bg-white hover:shadow-md hover:border-purple-200'"
                >
                  <span class="text-sm text-gray-700 font-medium">{{ label }}</span>
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                    :class="customer?.prizeVerifyType === val ? 'border-purple-500' : 'border-gray-200 group-hover:border-purple-500'"
                  >
                    <div
                      class="w-2.5 h-2.5 rounded-full bg-purple-500 transition-transform"
                      :class="customer?.prizeVerifyType === val ? 'scale-100' : 'scale-0 group-hover:scale-100'"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 查看卡密表单 -->
            <div v-else-if="activeTab === 'CARD_VERIFY'" class="space-y-6">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Eye class="w-5 h-5 text-purple-500"/>
                </div>
                <h4 class="text-base font-bold text-gray-800">查看卡密验证方式</h4>
              </div>
              <div class="space-y-3 pt-2">
                <div v-for="(label, val) in { 'smsVerify': '短信验证', 'safeQuestion': '密保验证' }"
                     :key="val"
                     @click="handleUpdateViewCardVerify(val)"
                     class="flex items-center justify-between p-4 rounded-lg bg-gray-50 transition-all cursor-pointer group border-2"
                     :class="customer?.selectcardVerifyType === val ? 'bg-white border-purple-500 shadow-md' : 'border-transparent hover:bg-white hover:shadow-md hover:border-purple-200'"
                >
                  <span class="text-sm text-gray-700 font-medium">{{ label }}</span>
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors"
                    :class="customer?.selectcardVerifyType === val ? 'border-purple-500' : 'border-gray-200 group-hover:border-purple-500'"
                  >
                    <div
                      class="w-2.5 h-2.5 rounded-full bg-purple-500 transition-transform"
                      :class="customer?.selectcardVerifyType === val ? 'scale-100' : 'scale-0 group-hover:scale-100'"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UserLayout>
</template>

<style scoped>
.security-input {
  @apply w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2
  focus:ring-opacity-20 focus:border-current transition-all;
}

.security-btn {
  @apply w-full py-3.5 text-white rounded-xl text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5
  active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed mt-4;
}

select.security-input {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 1rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
}
</style>
