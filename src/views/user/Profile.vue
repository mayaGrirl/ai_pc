<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import {useAuthStore} from '@/stores/auth'
import {getMemberField, updateProfile, updateNickname, bindEmail} from '@/api/customer'
import {MemberField} from "@/types/customer.type.ts";
import {useField, useForm} from "vee-validate";
import {z} from "zod";
import {toTypedSchema} from "@vee-validate/zod";
import {useToast} from "@/composables/useToast.ts";
import {isEmpty, maskString} from "@/utils/utils.ts";
import Decimal from "decimal.js";

const toast = useToast();
const authStore = useAuthStore();
const customer = computed(() => authStore.currentCustomer)

const isEditingNickname = ref(false);
const nicknameInput = ref('');

// 修改昵称
const startEditNickname = () => {
  nicknameInput.value = profile.value?.nickname || '';
  isEditingNickname.value = true;
}
const saveNickname = async () => {
  if (!nicknameInput.value) {
    toast.error('昵称不能为空');
    return;
  }
  try {
    const {code, message} = await updateNickname({nickname: nicknameInput.value})
    if (code === 200) {
      if (profile.value) {
        profile.value.nickname = nicknameInput.value;
      }
      isEditingNickname.value = false;
      toast.success('昵称修改成功');

      let points = customer.value?.points;
      if (customer.value?.points) {
        points = new Decimal(customer.value?.points).sub(200).toNumber();
      }
      authStore.setCurrentCustomer({
        nickname: nicknameInput.value,
        points: points,
      })
    } else {
      toast.error(message || '修改失败');
    }
  } catch (error: any) {
    toast.error(error.message || '修改失败');
  }
}

// 绑定邮箱
const isEditingEmail = ref(false);
const emailInput = ref('');
const isBindEmail = ref<boolean>(false);
const startEditEmail = () => {
  emailInput.value = profile.value?.email || '';
  isEditingEmail.value = true;
}
const saveEmail = async () => {
  if (!emailInput.value) {
    toast.error('邮箱不能为空');
    return;
  }
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailInput.value)) {
    toast.error('请输入有效的邮箱地址');
    return;
  }

  try {
    const {code, message} = await bindEmail({email: emailInput.value})
    if (code === 200) {
      if (profile.value) {
        profile.value.email = emailInput.value;
      }
      isEditingEmail.value = false;
      isBindEmail.value = false;
      toast.success('邮箱绑定成功');
    } else {
      toast.error(message || '绑定失败');
    }
  } catch (error: any) {
    toast.error(error.message || '绑定失败');
  }
}

const formKey = ref<number>(1);
// 表单验证
const schema = z.object({
  realname: z.string().trim().refine(
    (v) => v === "" || v.length <= 50,
    {message: '真实姓名不能超过50字符'}
  ),
  qq: z.string().trim().refine(
    (v) => v === "" || /^\d{5,12}$/.test(v),
    {message: 'QQ号格式不正确'}
  ),
  alipay: z.string().trim().refine(
    (v) => v === "" || v.length <= 50,
    {message: '支付宝账号不能超过50字符'}
  ),
  wchat: z.string().trim().refine(
    (v) => v === "" || v.length <= 50,
    {message: '微信账号不能超过50字符'}
  ),
  address: z.string().trim().refine(
    (v) => v === "" || v.length <= 150,
    {message: '地址不能超过150字符'}
  ),
  signature: z.string().trim().refine(
    (v) => v === "" || v.length <= 200,
    {message: '签名不能超过200字符'}
  ),
});
type FormValues = z.infer<typeof schema>;
const validationSchema = toTypedSchema(schema);
const {
  handleSubmit,
  isSubmitting,
  resetForm,
} = useForm<FormValues>({
  validationSchema: validationSchema,
})
const {value: realname} = useField<string>('realname')
const {value: qq} = useField<string>('qq')
const {value: alipay} = useField<string>('alipay')
const {value: wchat} = useField<string>('wchat')
const {value: address} = useField<string>('address')
const {value: signature} = useField<string>('signature')
// 提交表单
const submitExchange = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    const {code, message, data} = await updateProfile({
      qq: values.qq,
      wchat: values.wchat,
      alipay: values.alipay,
      realname: values.realname,
      address: values.address,
      signature: values.signature,
    })

    if (code !== 200) {
      toast.error(message);
    } else {
      toast.success('充值成功');
      resetForm();
      void fetchData();
    }
  } catch (error: any) {
    toast.error(error.message || '提交失败')
  } finally {
    isSubmitting.value = false
  }
})

const loading = ref<boolean>(false)
const profile = ref<MemberField>();
const fetchData = async () => {
  loading.value = true
  try {
    const {data, code} = await getMemberField()
    if (code === 200) {
      profile.value = data
      // 回填表单
      realname.value = data.realname || ''
      qq.value = data.qq || ''
      alipay.value = data.alipay || ''
      wchat.value = data.wchat || ''
      address.value = data.address || ''
      signature.value = data.signature || ''
      if (isEmpty(data.email)) {
        isBindEmail.value = true;
      }
    }
  } catch (error) {
    console.error('Get member field error:', error)
  } finally {
    loading.value = false
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
        <span class="text-sm cursor-pointer pb-3 border-b-2 border-transparent -mb-4 text-[#ff6600] border-b-[#ff6600]">修改资料</span>
      </div>

      <div class="flex gap-6 items-start">
        <!-- Left Column: Profile Form -->
        <div class="flex-1 bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div class="mb-6 pb-4 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800">基本资料</h3>
            <p class="text-sm text-gray-500 mt-1">完善您的个人信息，以便更好地为您服务</p>
          </div>

          <!-- Contact Info (Phone/Email) -->
          <div class="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div class="flex flex-col gap-1">
              <span class="text-xs text-gray-500">手机号码</span>
              <span class="text-sm font-bold text-gray-800 font-mono">{{
                  maskString(profile?.mobile || '', 3, 4)
                }}</span>
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-gray-500">邮箱地址</span>
              <span class="text-sm font-bold text-gray-800">{{ profile?.email || '未绑定' }}</span>
            </div>
          </div>

          <form @submit.prevent="submitExchange" class="flex flex-col gap-5" :key="formKey">
            <div class="grid grid-cols-1 gap-5">
              <!-- QQ -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700" for="qq">QQ号码</label>
                <div class="relative">
                  <input
                    v-if="!profile?.qq"
                    id="qq" type="text" v-model="qq"
                    placeholder="请输入QQ号码"
                    class="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#ff6600]/20 focus:border-[#ff6600] outline-none transition-all placeholder-gray-400"
                  />
                  <div v-else
                       class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
                    {{ profile.qq }}
                  </div>
                </div>
              </div>

              <!-- WeChat -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700" for="wechat">微信号</label>
                <div class="relative">
                  <input
                    v-if="!profile?.wchat"
                    id="wechat" type="text" v-model="wchat"
                    placeholder="请输入微信号码"
                    class="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#ff6600]/20 focus:border-[#ff6600] outline-none transition-all placeholder-gray-400"
                  />
                  <div v-else
                       class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
                    {{ profile.wchat }}
                  </div>
                </div>
              </div>

              <!-- Alipay -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700" for="alipay">支付宝账号</label>
                <div class="relative">
                  <input
                    v-if="!profile?.alipay"
                    id="alipay" type="text" v-model="alipay"
                    placeholder="请输入支付宝账号"
                    class="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#ff6600]/20 focus:border-[#ff6600] outline-none transition-all placeholder-gray-400"
                  />
                  <div v-else
                       class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
                    {{ profile.alipay }}
                  </div>
                </div>
              </div>

              <!-- Real Name -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700" for="realName">真实姓名</label>
                <div class="relative">
                  <input
                    v-if="!profile?.realname"
                    id="realName" type="text" v-model="realname"
                    placeholder="请输入真实姓名"
                    class="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#ff6600]/20 focus:border-[#ff6600] outline-none transition-all placeholder-gray-400"
                  />
                  <div v-else
                       class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
                    {{ profile.realname }}
                    <span
                      class="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">已实名</span>
                  </div>
                </div>
              </div>

              <!-- Address -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700" for="address">收货地址</label>
                <div class="relative">
                  <input
                    v-if="!profile?.address"
                    id="address" type="text" v-model="address"
                    placeholder="请填写真实收货地址"
                    class="w-full pl-3 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#ff6600]/20 focus:border-[#ff6600] outline-none transition-all placeholder-gray-400"
                  />
                  <div v-else
                       class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none truncate"
                       :title="profile.address">
                    {{ profile.address }}
                  </div>
                </div>
              </div>

              <!-- Signature -->
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-gray-700" for="signature">个人签名</label>
                <textarea
                  id="signature"
                  v-model="signature"
                  rows="3"
                  placeholder="写一句话介绍自己..."
                  class="w-full p-3 border border-gray-300 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-[#ff6600]/20 focus:border-[#ff6600] outline-none transition-all placeholder-gray-400 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Notice -->
            <div class="flex items-start gap-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="#ff6600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span
                class="text-xs text-orange-700 leading-tight">温馨提示：部分资料保存后不可再次修改，请务必填写真实有效的信息。如有填写错误，请联系在线客服处理。</span>
            </div>

            <button type="submit"
                    :disabled="isSubmitting"
                    class="w-full py-3 bg-gradient-to-r from-[#ff6b6b] to-[#ee5a6f] text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200">
              {{ isSubmitting ? '保存中...' : '保存资料' }}
            </button>
          </form>
        </div>

        <!-- Right Column: Nickname & Avatar Card -->
        <div class="w-[320px] shrink-0">
          <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm sticky top-5">
            <div class="flex flex-col items-center text-center">
              <h3 class="text-lg font-bold text-gray-800 mb-1">{{ profile?.nickname || '未设置昵称' }}</h3>
              <p class="text-xs text-gray-400 mb-6 font-mono">ID: {{ profile?.aid || '-' }}</p>

              <!-- Nickname Edit Area -->
              <div class="w-full bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div class="text-xs font-bold text-gray-500 mb-3 text-left uppercase tracking-wider">修改昵称</div>

                <div v-if="!isEditingNickname" class="flex flex-col gap-3">
                  <button
                    @click="startEditNickname"
                    class="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm hover:border-[#ff6600] hover:text-[#ff6600] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    点击修改
                  </button>
                </div>

                <div v-else class="flex flex-col gap-3">
                  <input
                    v-model="nicknameInput"
                    type="text"
                    placeholder="请输入新昵称"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#ff6600]"
                    maxlength="12"
                  />
                  <span class="text-xs text-orange-700 leading-tight text-left">
                    修改昵称需要花费 200
                    <img alt="coin" class="inline-block w-[13px] h-[13px]" src="/ranking/coin.png"/>
                  </span>
                  <div class="flex gap-2">
                    <button
                      @click="isEditingNickname = false"
                      class="flex-1 py-1.5 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      @click="saveNickname"
                      class="flex-1 py-1.5 bg-[#ff6b6b] text-white rounded text-xs hover:bg-[#ff6b6b] transition-colors"
                    >
                      确认
                    </button>
                  </div>
                </div>
              </div>

              <div class="w-full bg-gray-50 rounded-lg p-4 border border-gray-100 mt-4" v-if="isBindEmail">
                <div class="text-xs font-bold text-gray-500 mb-3 text-left uppercase tracking-wider">绑定邮箱</div>

                <div v-if="!isEditingEmail" class="flex flex-col gap-3">
                  <button
                    @click="startEditEmail"
                    class="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    {{ profile?.email ? '修改邮箱' : '点击绑定' }}
                  </button>
                </div>

                <div v-else class="flex flex-col gap-3">
                  <input
                    v-model="emailInput"
                    type="email"
                    placeholder="请输入您的邮箱"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#ff6600]"
                  />
                  <div class="flex gap-2">
                    <button
                      @click="isEditingEmail = false"
                      class="flex-1 py-1.5 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      @click="saveEmail"
                      class="flex-1 py-1.5 from-[#ff6b6b] to-[#ee5a6f] text-white rounded text-xs hover:bg-[#ff6b6b] transition-colors"
                    >
                      确认
                    </button>
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
