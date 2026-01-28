<script setup lang="ts">
import {ref, onMounted} from 'vue'
import UserLayout from '@/components/layout/UserLayout.vue'
import {useAuthStore} from '@/stores/auth'
import {getMemberField, updateProfile, updateNickname} from '@/api/customer'
import {MemberField} from "@/types/customer.type.ts";
import {useField, useForm} from "vee-validate";
import {z} from "zod";
import {toTypedSchema} from "@vee-validate/zod";
import {useToast} from "@/composables/useToast.ts";
import {maskString} from "@/utils/utils.ts";

const toast = useToast()
const authStore = useAuthStore()

const isEditingNickname = ref(false)
const nicknameInput = ref('')

const startEditNickname = () => {
  nicknameInput.value = profile.value?.nickname || ''
  isEditingNickname.value = true
}

const saveNickname = async () => {
  if (!nicknameInput.value) {
    toast.error('昵称不能为空')
    return
  }
  try {
    const {code, message} = await updateNickname({nickname: nicknameInput.value})
    if (code === 200) {
      if (profile.value) {
        profile.value.nickname = nicknameInput.value
      }
      isEditingNickname.value = false
      toast.success('昵称修改成功')
      authStore.setCurrentCustomer({
        nickname: nicknameInput.value,
      })
    } else {
      toast.error(message || '修改失败')
    }
  } catch (error: any) {
    toast.error(error.message || '修改失败')
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

      // authStore.setCurrentCustomer({
      //   bankpoints: data.bankpoints,
      // })
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
              <span class="text-sm font-bold text-gray-800 font-mono">{{ maskString(profile?.mobile || '', 3, 4) }}</span>
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
                  <div v-else class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
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
                  <div v-else class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
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
                  <div v-else class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
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
                  <div v-else class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none">
                     {{ profile.realname }}
                     <span class="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">已实名</span>
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
                   <div v-else class="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 cursor-not-allowed select-none truncate" :title="profile.address">
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
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
               <span class="text-xs text-orange-700 leading-tight">温馨提示：部分资料保存后不可再次修改，请务必填写真实有效的信息。如有填写错误，请联系在线客服处理。</span>
            </div>

            <button type="submit"
                    :disabled="isSubmitting"
                    class="w-full py-3 bg-gradient-to-r from-[#ff6600] to-[#ff8533] text-white rounded-lg text-sm font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200">
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
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
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
                       <div class="flex gap-2">
                          <button
                            @click="isEditingNickname = false"
                            class="flex-1 py-1.5 bg-gray-200 text-gray-600 rounded text-xs hover:bg-gray-300 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            @click="saveNickname"
                            class="flex-1 py-1.5 bg-[#ff6600] text-white rounded text-xs hover:bg-[#ff5500] transition-colors"
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

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-tabs {
  display: flex;
  border-bottom: 2px solid #ff6600;
}

.page-tabs .tab {
  font-size: 14px;
  color: #ff6600;
  padding: 10px 20px;
  background: #fff8f0;
  border: 1px solid #ff6600;
  border-bottom: none;
  margin-bottom: -2px;
}

.profile-form {
  padding: 20px 0;
  max-width: 600px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.form-label {
  width: 80px;
  text-align: right;
  font-size: 14px;
  color: #333;
  margin-right: 15px;
}

.form-value {
  font-size: 14px;
  color: #333;
}

.form-input {
  width: 200px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.form-input.short {
  width: 150px;
}

.form-input.wide {
  width: 400px;
}

.form-input:focus {
  outline: none;
  border-color: #ff6600;
}

.nickname-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-action {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  border-color: #ff6600;
  color: #ff6600;
}

.btn-action.primary {
  background: #ff6600;
  border-color: #ff6600;
  color: #fff;
}

.btn-action.primary:hover {
  opacity: 0.9;
}

.form-notice {
  margin: 15px 0 15px 95px;
  font-size: 12px;
  color: #ff6600;
}

.btn-submit {
  width: 150px;
  height: 40px;
  background: linear-gradient(135deg, #ff6600, #ff8533);
  border: none;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-submit:hover {
  opacity: 0.9;
}
</style>
