<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import LoginBox from '@/components/auth/LoginBox.vue'
</script>

<template>
  <MainLayout>
    <div class="min-h-[calc(100vh-160px)] flex items-center justify-center relative overflow-hidden bg-gray-50 py-12 px-4">
      <!-- Decorative Background Elements -->
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-red-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div class="relative z-10 w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-between gap-12">
        <!-- Brand/Marketing Section -->
        <div class="hidden lg:flex flex-col max-w-lg animate-in fade-in slide-in-from-left duration-700">
          <div class="mb-8">
            <h1 class="text-6xl font-black text-gray-900 leading-tight mb-4">
              欢迎回到 <br><span class="text-[#ff4757]">鼎丰</span> 娱乐
            </h1>
            <div class="h-1.5 w-24 bg-[#ff4757] rounded-full"></div>
          </div>

          <p class="text-xl text-gray-500 font-medium leading-relaxed mb-10">
            加入我们，体验最纯粹的游戏乐趣。数百万玩家的选择，安全可靠的娱乐平台。
          </p>

          <div class="grid grid-cols-2 gap-6">
            <div class="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div class="text-2xl font-black text-gray-900 mb-1">24/7</div>
              <div class="text-sm text-gray-400 font-bold uppercase tracking-wider">全天候服务</div>
            </div>
            <div class="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div class="text-2xl font-black text-gray-900 mb-1">100%</div>
              <div class="text-sm text-gray-400 font-bold uppercase tracking-wider">安全保障</div>
            </div>
          </div>
        </div>

        <!-- Login Box Component -->
        <div class="w-full flex justify-center lg:justify-end">
          <LoginBox />
        </div>
      </div>
    </div>
  </MainLayout>
</template>
