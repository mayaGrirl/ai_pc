<script setup lang="ts">
import { ref } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { 
  User, 
  CreditCard, 
  MapPin, 
  Clock, 
  Activity, 
  TrendingUp, 
  Wallet,
  Tag,
  Monitor
} from 'lucide-vue-next'

// Mock Data based on the screenshot
const agentInfo = ref({
  id: '48566',
  name: '顶峰代理2',
  importDiscount: '9.7 折',
  exportDiscount: '9.7 折',
  exportProfit: '0.97',
  credit: '10,000,000',
  status: '正常', // Normal
  lastLoginTime: '2026-01-25 22:56:04',
  lastLoginIp: '102.209.221.119',
  lastLoginLocation: '象牙海岸 阿比让 阿比让 ORANGE-COTE-IVOIRE'
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-5xl mx-auto">
        
        <!-- Main Card -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          <!-- Header -->
          <div class="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
              <User class="w-6 h-6" />
            </div>
            <h1 class="text-xl font-bold text-gray-900">Agent Profile</h1>
          </div>

          <!-- Content Grid -->
          <div class="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            
            <!-- Column 1: Identity & Basic Info -->
            <div class="space-y-8">
              <!-- Name -->
              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-1">代理名称</div>
                  <div class="text-lg font-bold text-gray-900">{{ agentInfo.name }}</div>
                </div>
              </div>

              <!-- ID -->
              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Tag class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-1">代理ID</div>
                  <div class="text-lg font-semibold text-gray-900 font-mono">{{ agentInfo.id }}</div>
                </div>
              </div>

              <!-- Status -->
              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Activity class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-2">状态</div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span class="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                    {{ agentInfo.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Column 2: Financials -->
            <div class="space-y-8">
              <!-- Discounts -->
              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <TrendingUp class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-1">进卡折扣</div>
                  <div class="text-lg font-semibold text-gray-900">{{ agentInfo.importDiscount }}</div>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <TrendingUp class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-1">收卡折扣</div>
                  <div class="text-lg font-semibold text-gray-900">{{ agentInfo.exportDiscount }}</div>
                </div>
              </div>

              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Wallet class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-1">收卡利润</div>
                  <div class="text-lg font-semibold text-gray-900">{{ agentInfo.exportProfit }}</div>
                </div>
              </div>
            
              <!-- Credit Highlight -->
              <div class="col-span-full pt-4">
                 <div class="flex gap-4 items-center">
                    <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                      <CreditCard class="w-6 h-6" />
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-500 mb-0.5">铺货分</div>
                      <div class="text-3xl font-bold text-blue-600 tracking-tight">{{ agentInfo.credit }}</div>
                    </div>
                 </div>
              </div>
            </div>

            <!-- Column 3: Activity Logs -->
            <div class="space-y-8">
              <!-- Last Login Time -->
              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Clock class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-1">最后登入时间</div>
                  <div class="text-base font-medium text-gray-900">{{ agentInfo.lastLoginTime }}</div>
                </div>
              </div>

              <!-- IP -->
              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <Monitor class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-1">最后登入IP</div>
                  <div class="text-base font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded inline-block">
                    {{ agentInfo.lastLoginIp }}
                  </div>
                </div>
              </div>

              <!-- Location -->
              <div class="flex gap-4">
                <div class="mt-1">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <MapPin class="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-500 mb-1">最后登入地点</div>
                  <div class="text-base font-medium text-gray-900 leading-relaxed">
                    {{ agentInfo.lastLoginLocation }}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </MainLayout>
</template>
