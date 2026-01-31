<script setup lang="ts">
import MainLayout from '@/components/layout/MainLayout.vue'
import { CircleHelp, Info } from 'lucide-vue-next'

const scrollToId = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <MainLayout>
    <div class="max-w-[1200px] mx-auto mt-5 px-4 mb-10">
      <div class="flex gap-5">
        <!-- Sidebar -->
        <div class="w-1/4">
          <div class="bg-white shadow rounded-md overflow-hidden sticky top-[140px]">
            <div class="bg-gray-100 px-4 py-3 border-b border-gray-200 font-medium text-gray-700">
              帮助主题
            </div>
            <div class="p-2">
              <ul class="space-y-1">
                <li>
                  <a @click.prevent="scrollToId('item84')" href="#item84" class="block px-3 py-2 hover:bg-gray-50 text-gray-700 rounded transition cursor-pointer text-sm">
                    鼎丰28是什么？
                  </a>
                </li>
                <li>
                  <a @click.prevent="scrollToId('item85')" href="#item85" class="block px-3 py-2 hover:bg-gray-50 text-gray-700 rounded transition cursor-pointer text-sm">
                    金豆的用途
                  </a>
                </li>
                <li>
                  <a @click.prevent="scrollToId('item86')" href="#item86" class="block px-3 py-2 hover:bg-gray-50 text-gray-700 rounded transition cursor-pointer text-sm">
                    金豆的获取途径
                  </a>
                </li>
                <li>
                  <a @click.prevent="scrollToId('item137')" href="#item137" class="block px-3 py-2 hover:bg-gray-50 text-gray-700 rounded transition cursor-pointer text-sm">
                    积分怎么获得？
                  </a>
                </li>
                <li>
                  <a @click.prevent="scrollToId('item87')" href="#item87" class="block px-3 py-2 hover:bg-gray-50 text-gray-700 rounded transition cursor-pointer text-sm">
                    经验值(等级)的用途
                  </a>
                </li>
                <li>
                  <a @click.prevent="scrollToId('item88')" href="#item88" class="block px-3 py-2 hover:bg-gray-50 text-gray-700 rounded transition cursor-pointer text-sm">
                    经验值(等级)的获取途径
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="w-3/4">
          <div class="bg-white shadow rounded-md p-4 min-h-[600px]">
            <ul class="space-y-10">
              <!-- Item 84 -->
              <li id="item84" class="scroll-mt-24">
                <div class="help-item">
                  <h4 class="text-lg font-bold mb-4 flex items-center text-gray-800 gap-2 border-b pb-2">
                    <CircleHelp class="w-5 h-5 text-blue-500" />
                    鼎丰28是什么？
                  </h4>
                  <div class="text-gray-600 leading-relaxed text-sm">
                    <p>鼎丰28是一个集合广告体验、点击广告、积分兑换、购物返点、游戏的一体的媒体平台。鼎丰28倡导：“免费注册、体验广告、点击广告、积分兑换、拿大奖”的理念。只要您有空余的时间，即可免费注册进入鼎丰28， 通过各种方式赚取金豆，同时在游戏娱乐的过程中以小博大，赢取丰厚的奖品。鼎丰28大致可以分为三个大区：赚金豆、休闲游戏区、礼品商城，您免费注册后，可以在赚金豆区通过体验各种广告、点击广告、积分兑换来赚取金豆，在积累了足够的金豆后，您可以进入休闲游戏区，其中设置了各种游戏，您可以玩游戏，在娱乐中赚得更多的金豆，最后您可以到兑奖中心将金豆兑换成您喜欢的礼品。所有一切都可以是完全免费的！</p>
                  </div>
                </div>
              </li>

              <!-- Item 85 -->
              <li id="item85" class="scroll-mt-24">
                <div class="help-item">
                  <h4 class="text-lg font-bold mb-4 flex items-center text-gray-800 gap-2 border-b pb-2">
                    <Info class="w-5 h-5 text-blue-500" />
                    金豆的用途
                  </h4>
                  <div class="text-gray-600 leading-relaxed text-sm space-y-2">
                    <p>1. 悠闲游戏区内玩游戏，包括幸运28、开心16、快乐28、北京16 北京28 、北京36 、北京10等游戏。</p>
                    <p>2. (兑换商城)兑换礼品。注：兑换时已含物流邮寄等费用，玩家不需要支付除金豆外任何费用。</p>
                    <p>3. 自助广告：购买10秒点击广告。</p>
                  </div>
                </div>
              </li>

              <!-- Item 86 -->
              <li id="item86" class="scroll-mt-24">
                <div class="help-item">
                  <h4 class="text-lg font-bold mb-4 flex items-center text-gray-800 gap-2 border-b pb-2">
                    <Info class="w-5 h-5 text-blue-500" />
                    金豆的获取途径
                  </h4>
                  <div class="text-gray-600 leading-relaxed text-sm space-y-2">
                    <p>1. 每天可点击广告得金豆，还能免费领取金豆。</p>
                    <p>2. 消费返点送金豆，不同的商家有不同的返点比例。</p>
                    <p>3. 体验广告，获取丰厚奖励。</p>
                    <p>4. 使用广告体验卡充值兑换。</p>
                  </div>
                </div>
              </li>

              <!-- Item 137 -->
              <li id="item137" class="scroll-mt-24">
                <div class="help-item">
                  <h4 class="text-lg font-bold mb-4 flex items-center text-gray-800 gap-2 border-b pb-2">
                    <Info class="w-5 h-5 text-blue-500" />
                    积分怎么获得？
                  </h4>
                  <div class="text-gray-600 leading-relaxed text-sm">
                    <p class="mb-4">
                      <strong>每日签到可获得积分</strong><br>
                      详情请见“用户中心”>>"签到"页面
                    </p>

                    <p class="mb-2"><strong>参与游戏可获得积分</strong></p>
                    <p class="mb-3">当您参与每期游戏盈利时，可获得积分奖励，如下表所示：</p>

                    <table class="w-full border-collapse border border-gray-200 mb-6 text-sm">
                      <thead>
                        <tr class="bg-gray-50">
                          <th class="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">盈利额</th>
                          <th class="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">奖励积分</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">1000~5000</td>
                          <td class="border border-gray-200 px-4 py-2">1</td>
                        </tr>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">5000~20000</td>
                          <td class="border border-gray-200 px-4 py-2">2</td>
                        </tr>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">20000~80000</td>
                          <td class="border border-gray-200 px-4 py-2">3</td>
                        </tr>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">80000~200000</td>
                          <td class="border border-gray-200 px-4 py-2">5</td>
                        </tr>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">200000以上</td>
                          <td class="border border-gray-200 px-4 py-2">10</td>
                        </tr>
                      </tbody>
                    </table>

                    <p class="mb-3">并根据您的投注额翻倍：</p>
                    <table class="w-full border-collapse border border-gray-200 mb-4 text-sm">
                      <thead>
                        <tr class="bg-gray-50">
                          <th class="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">投注额</th>
                          <th class="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">倍数</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">50000~200000</td>
                          <td class="border border-gray-200 px-4 py-2">2</td>
                        </tr>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">200000~500000</td>
                          <td class="border border-gray-200 px-4 py-2">5</td>
                        </tr>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">500000~1000000</td>
                          <td class="border border-gray-200 px-4 py-2">10</td>
                        </tr>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">1000000~1800000</td>
                          <td class="border border-gray-200 px-4 py-2">20</td>
                        </tr>
                        <tr>
                          <td class="border border-gray-200 px-4 py-2">1800000以上</td>
                          <td class="border border-gray-200 px-4 py-2">30</td>
                        </tr>
                      </tbody>
                    </table>

                    <p class="text-gray-500 italic">例如：第1000期游戏，您盈利5000金豆，该期您总共投注额是200000金豆，那么开奖后您可以获得2*5=10个积分奖励。</p>
                  </div>
                </div>
              </li>

              <!-- Item 87 -->
              <li id="item87" class="scroll-mt-24">
                <div class="help-item">
                  <h4 class="text-lg font-bold mb-4 flex items-center text-gray-800 gap-2 border-b pb-2">
                    <Info class="w-5 h-5 text-blue-500" />
                    经验值(等级)的用途
                  </h4>
                  <div class="text-gray-600 leading-relaxed text-sm space-y-2">
                    <p>1. 等级达到不同值时，可升级，目前系统设置的等级为VIP0到VIP8。</p>
                    <p>2. 如果您有推荐人，那么您的推荐人将按您达到不同等级而获得乐点奖励，最高可得1,500,000金豆奖励/每人次。</p>
                    <p>3. 兑换奖品时，等级越高，享有的兑换折扣越高。</p>
                    <p>4. 不同级别VIP用户每日可参与免费抽奖，抽奖次数与您的VIP等级相关。</p>
                  </div>
                </div>
              </li>

              <!-- Item 88 -->
              <li id="item88" class="scroll-mt-24">
                <div class="help-item">
                  <h4 class="text-lg font-bold mb-4 flex items-center text-gray-800 gap-2 border-b pb-2">
                    <Info class="w-5 h-5 text-blue-500" />
                    经验值(等级)的获取途径
                  </h4>
                  <div class="text-gray-600 leading-relaxed text-sm">
                    <p>1. 游戏大厅内玩游戏，幸运28、开心16、快乐28、北京16 北京28 、北京36 、北京10等游戏。 注：每单笔纯臝利1,000金豆以上加1经验值，纯臝利10,000金豆以上加2经验值，纯臝利50,000则加3经验值，托管下注不加经验值。</p>
                    <p class="mt-2">2. 使用广告体验卡充值每兑换2,000金豆获得1点的经验值。</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
