<script setup lang="ts">
import { ref, computed } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'

// Betting panel state
const showBettingPanel = ref(false)
const currentBettingPeriod = ref('')
const countdown = ref({ stop: 82, draw: 132 })

// Custom modes
const customModes = ref([
  { id: 1, name: '测试2' },
  { id: 2, name: 'cehis1' }
])
const activeMode = ref(1)

// Betting options - row 1
const bettingOptions1 = [
  '单', '大单', '小单', '单边', '双', '大双', '小双', '双边', '大', '小', '中', '边', '大边', '小边', '0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾'
]

// Betting options - row 2
const bettingOptions2 = [
  '8尾', '9尾', '小尾', '大尾', '3余0', '3余1', '3余2', '4余0', '4余1', '4余2', '4余3', '5余0', '5余1', '5余2', '5余3', '5余4'
]

// Multiplier options
const multiplierOptions = [
  '0.1倍', '0.5倍', '0.8倍', '1.2倍', '1.5倍', '2倍', '10倍', '30倍', '50倍', '100倍', '200倍'
]

// Action buttons
const actionButtons = ['上期', '全包', '反选', '清空', '梭哈']

// Selected betting options
const selectedOptions = ref<string[]>([])

// Betting input amount
const suohaAmount = ref('')

// Quick bet amounts
const quickBetAmounts = [10, 100, 500, 1000, 5000]

// Odds data for numbers 00-27
const oddsData = ref([
  { num: '00', odds: 978.4924, myBet: '-', betAmount: '' },
  { num: '01', odds: 325.8415, myBet: '-', betAmount: '' },
  { num: '02', odds: 163.1848, myBet: '-', betAmount: '' },
  { num: '03', odds: 97.9571, myBet: '-', betAmount: '' },
  { num: '04', odds: 65.2978, myBet: '-', betAmount: '' },
  { num: '05', odds: 46.6479, myBet: '-', betAmount: '' },
  { num: '06', odds: 34.9954, myBet: '-', betAmount: '' },
  { num: '07', odds: 27.2196, myBet: '-', betAmount: '' },
  { num: '08', odds: 21.7811, myBet: '-', betAmount: '' },
  { num: '09', odds: 17.8200, myBet: '-', betAmount: '' },
  { num: '10', odds: 15.5562, myBet: '-', betAmount: '' },
  { num: '11', odds: 14.2054, myBet: '-', betAmount: '' },
  { num: '12', odds: 13.4262, myBet: '-', betAmount: '' },
  { num: '13', odds: 13.0679, myBet: '-', betAmount: '' },
  { num: '14', odds: 13.0683, myBet: '-', betAmount: '' },
  { num: '15', odds: 13.4260, myBet: '-', betAmount: '' },
  { num: '16', odds: 14.2054, myBet: '-', betAmount: '' },
  { num: '17', odds: 15.5581, myBet: '-', betAmount: '' },
  { num: '18', odds: 17.8185, myBet: '-', betAmount: '' },
  { num: '19', odds: 21.7770, myBet: '-', betAmount: '' },
  { num: '20', odds: 27.2249, myBet: '-', betAmount: '' },
  { num: '21', odds: 34.9908, myBet: '-', betAmount: '' },
  { num: '22', odds: 46.6517, myBet: '-', betAmount: '' },
  { num: '23', odds: 65.3045, myBet: '-', betAmount: '' },
  { num: '24', odds: 97.9183, myBet: '-', betAmount: '' },
  { num: '25', odds: 163.2087, myBet: '-', betAmount: '' },
  { num: '26', odds: 325.9716, myBet: '-', betAmount: '' },
  { num: '27', odds: 979.0826, myBet: '-', betAmount: '' }
])

// Left column (00-13), right column (14-27)
const leftOdds = computed(() => oddsData.value.slice(0, 14))
const rightOdds = computed(() => oddsData.value.slice(14, 28))

// Total bet amount
const totalBetAmount = ref(0)
const periodBetAmount = ref(0)

// My bet history data
const myBetHistory = ref([
  { no: '3384738', drawTime: '01-15 17:27:26', result: 21, betAmount: '1,000', winAmount: '0', profit: -1000, betTime: '01-15 17:17:13' }
])

// Toggle betting option
const toggleOption = (option: string) => {
  const index = selectedOptions.value.indexOf(option)
  if (index === -1) {
    selectedOptions.value.push(option)
  } else {
    selectedOptions.value.splice(index, 1)
  }
}

// Open betting panel
const openBettingPanel = (periodNo: string) => {
  console.log('openBettingPanel called with:', periodNo)
  currentBettingPeriod.value = periodNo
  showBettingPanel.value = true
  console.log('showBettingPanel is now:', showBettingPanel.value)
}

// Close betting panel
const closeBettingPanel = () => {
  showBettingPanel.value = false
}

// Multiply bet amount
const multiplyBet = (index: number, multiplier: number) => {
  const item = oddsData.value[index]
  const current = parseFloat(item.betAmount) || 0
  item.betAmount = String(Math.floor(current * multiplier))
}

// Submit bet
const submitBet = () => {
  alert('投注功能开发中')
}

// Get number color class
const getNumColorClass = (num: string) => {
  const n = parseInt(num)
  if (n >= 0 && n <= 5) return 'num-green'
  if (n >= 6 && n <= 9) return 'num-blue'
  if (n >= 10 && n <= 13) return 'num-red'
  if (n >= 14 && n <= 17) return 'num-red'
  if (n >= 18 && n <= 21) return 'num-blue'
  if (n >= 22 && n <= 27) return 'num-green'
  return 'num-gray'
}

// Game types
const gameTypes = ref([
  { key: 'system', name: '幸运系列' },
  { key: 'bg', name: '宾果系列' },
  { key: 'btc', name: '比特币系列' },
  { key: 'jnd', name: '加拿大系列' },
  { key: 'hanguo', name: '韩国系列' },
  { key: 'qlq', name: '蛋蛋系列' },
  { key: 'feit', name: '美国系列' },
  { key: 'shasec', name: '秒开系列' }
])

// Games for each type
const gameItems = ref({
  system: [
    { id: 1, name: '幸运28' },
    { id: 2, name: '幸运16' },
    { id: 3, name: '幸运36' },
    { id: 4, name: '幸运11' },
    { id: 5, name: '幸运10' },
    { id: 6, name: '幸运冠亚军' },
    { id: 7, name: '幸运22' }
  ],
  bg: [
    { id: 8, name: '宾果28' },
    { id: 13, name: '宾果10' },
    { id: 17, name: '宾果11' },
    { id: 9, name: '宾果16' },
    { id: 10, name: '宾果36' },
    { id: 11, name: '宾果2.1' },
    { id: 40, name: '宾果2.8' },
    { id: 34, name: '宾果固定' }
  ],
  btc: [],
  jnd: [
    { id: 21, name: '加拿大28' },
    { id: 32, name: '加拿大10' },
    { id: 22, name: '加拿大11' },
    { id: 23, name: '加拿大16' },
    { id: 24, name: '加拿大36' },
    { id: 25, name: '加拿大2.1' },
    { id: 38, name: '加拿大2.8' },
    { id: 36, name: '加拿大固定' }
  ],
  hanguo: [
    { id: 16, name: '韩国28' },
    { id: 19, name: '韩国36' },
    { id: 20, name: '韩国2.1' },
    { id: 41, name: '韩国2.8' },
    { id: 35, name: '韩国固定' }
  ],
  qlq: [
    { id: 12, name: '蛋蛋28' },
    { id: 14, name: '蛋蛋36' },
    { id: 15, name: '蛋蛋2.1' },
    { id: 39, name: '蛋蛋2.8' },
    { id: 33, name: '蛋蛋固定' }
  ],
  feit: [
    { id: 49, name: '美国28' },
    { id: 50, name: '美国16' },
    { id: 51, name: '美国11' },
    { id: 52, name: '美国36' },
    { id: 53, name: '美国固定28' }
  ],
  shasec: []
})

const activeType = ref('bg')
const activeGame = ref(8)
const activePanel = ref('drawtb')

const gameInfo = ref({
  period: '115004061',
  gameName: '滨果28'
})

// status: 'pending' = 待开奖可参与, 'drawing' = 开奖中, 'ended' = 已结束
const drawHistory = ref([
  { no: '3386786', date: '01-21 03:40:00', nums: null, result: null, pool: '0', joinNum: '0/0', myWin: 0, myBet: 0, status: 'pending' },
  { no: '3386785', date: '01-21 03:36:30', nums: null, result: null, pool: '0', joinNum: '0/0', myWin: 0, myBet: 0, status: 'pending' },
  { no: '3386784', date: '01-21 03:33:00', nums: null, result: null, pool: '0', joinNum: '0/0', myWin: 0, myBet: 0, status: 'pending' },
  { no: '3386783', date: '01-21 03:29:30', nums: null, result: null, pool: '5,000,540,215', joinNum: '0/110', myWin: 0, myBet: 0, status: 'drawing' },
  { no: '3386782', date: '01-21 03:26:00', nums: [6, 1, 5], result: 12, pool: '6,111,024,886', joinNum: '115/128', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386781', date: '01-21 03:22:30', nums: [5, 8, 5], result: 18, pool: '5,385,112,777', joinNum: '109/123', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386780', date: '01-21 03:19:00', nums: [6, 5, 2], result: 13, pool: '5,385,058,430', joinNum: '106/113', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386779', date: '01-21 03:15:30', nums: [3, 6, 4], result: 13, pool: '5,385,046,402', joinNum: '106/111', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386778', date: '01-21 03:12:00', nums: [4, 7, 0], result: 11, pool: '5,385,069,758', joinNum: '106/115', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386777', date: '01-21 03:08:30', nums: [8, 7, 0], result: 15, pool: '5,385,100,749', joinNum: '109/121', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386776', date: '01-21 03:05:00', nums: [7, 1, 0], result: 8, pool: '5,385,094,735', joinNum: '109/120', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386775', date: '01-21 03:01:30', nums: [2, 0, 0], result: 2, pool: '5,385,128,719', joinNum: '112/126', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386774', date: '01-21 02:58:00', nums: [0, 4, 9], result: 13, pool: '5,385,089,952', joinNum: '108/119', myWin: 0, myBet: 0, status: 'ended' },
  { no: '3386773', date: '01-21 02:54:30', nums: [8, 1, 7], result: 16, pool: '5,385,016,111', joinNum: '103/105', myWin: 0, myBet: 0, status: 'ended' }
])

const selectType = (type: string) => {
  activeType.value = type
  const games = gameItems.value[type as keyof typeof gameItems.value]
  if (games && games.length > 0) {
    activeGame.value = games[0].id
  }
}

const selectGame = (gameId: number) => {
  activeGame.value = gameId
}

const setActivePanel = (panel: string) => {
  activePanel.value = panel
}
</script>

<template>
  <MainLayout>
    <div class="game-container">
      <div class="game-body">
        <!-- Game Tab -->
        <div class="gametab">
          <div class="type-row">
            <ul class="type-list">
              <li
                v-for="(type, index) in gameTypes"
                :key="type.key"
                :class="['type-item', type.key, { active: activeType === type.key }]"
                :style="index === 0 ? 'margin-left:100px' : ''"
                @click="selectType(type.key)"
              >
                <a href="javascript:;">{{ type.name }}</a>
              </li>
              <li class="type-item gametop">
                <a href="/game/top"><img src="/skin/pc/wm/images/icon_top.png" width="25"> 游戏排行榜</a>
              </li>
            </ul>
          </div>

          <!-- Game Items -->
          <div
            v-for="type in gameTypes"
            :key="'item-' + type.key"
            class="item-row"
            :class="type.key"
            v-show="activeType === type.key"
          >
            <ul class="item-list" :style="gameItems[type.key as keyof typeof gameItems]?.length === 0 ? 'height: 32px' : ''">
              <li
                v-for="game in gameItems[type.key as keyof typeof gameItems]"
                :key="game.id"
                :class="['item-btn', { active: activeGame === game.id }]"
                @click="selectGame(game.id)"
              >
                <a href="javascript:;">{{ game.name }}</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Game Content -->
        <div class="gamecontent">
          <!-- Top Info Bar -->
          <div class="top-info-bar">
            <div class="game-badge">
              <div class="badge-img bingo"></div>
              <div class="badge-text">{{ gameInfo.gameName }}</div>
            </div>
            <div class="game-info">
              <ul class="info-list">
                <li class="info-item order-item">
                  <div>您的今日排名</div>
                  <div class="order-num"><span style="font-size:12px;color:#FEE2C3;">载入中...</span></div>
                </li>
                <li class="info-item clock-item">
                  <span class="clock-text">第<span class="clock-num">{{ gameInfo.period }}</span>期开奖中 <img src="/skin/pc/wm/images/loading.gif"></span>
                </li>
                <li class="info-item">参与<br><span>0</span> 期</li>
                <li class="info-item">胜率<br><span>0%</span></li>
                <li class="info-item">盈亏<br><span class="coin">0</span></li>
                <li class="info-item last">有效流水<br><span class="coin">0</span></li>
              </ul>

              <!-- Sub Navigation -->
              <div class="sub-nav">
                <div class="nav-left">
                  <a href="javascript:;"><span class="nav-icon sound-on"></span></a>
                  <a href="javascript:;"><span class="nav-icon auto-on"></span></a>
                </div>
                <div class="nav-right">
                  <a href="javascript:;" :class="{ active: activePanel === 'drawtb' }" @click="setActivePanel('drawtb')">游戏列表</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'mybet' }" @click="setActivePanel('mybet')">我的投注</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'mymodes' }" @click="setActivePanel('mymodes')">投注模式</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'myauto' }" @click="setActivePanel('myauto')">自动投注</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'gamerule' }" @click="setActivePanel('gamerule')">游戏规则</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'weekgain' }" @click="setActivePanel('weekgain')">一周盈亏</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'weekliushui' }" @click="setActivePanel('weekliushui')">一周流水</a><span class="sep">|</span>
                  <a href="/game/map?id=8" target="_blank">走势图</a>
                </div>
              </div>
            </div>
          </div>

          <!-- Game Main Panels -->
          <div class="game-main">
            <!-- Draw Table Panel -->
            <div class="panel drawtb-panel" v-show="activePanel === 'drawtb' && !showBettingPanel">
              <table class="draw-table">
                <thead>
                  <tr>
                    <th class="col-no">期号</th>
                    <th class="col-date">游戏时间</th>
                    <th class="col-result">结果</th>
                    <th class="col-pool">奖池</th>
                    <th class="col-join">中奖/参与数</th>
                    <th class="col-mybet">我的中奖/投注额</th>
                    <th class="col-btn">参与</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in drawHistory" :key="item.no">
                    <td class="col-no">{{ item.no }}</td>
                    <td class="col-date">{{ item.date }}</td>
                    <td class="col-result">
                      <!-- 已结束：显示开奖结果 -->
                      <template v-if="item.status === 'ended' && item.nums">
                        <span class="result-nums">
                          <span class="num">{{ item.nums?.[0] }}</span> +
                          <span class="num">{{ item.nums?.[1] }}</span> +
                          <span class="num">{{ item.nums?.[2] }}</span> =
                        </span>
                        <img class="result-img" :src="`/skin/pc/wm/images/1/number_${item.result}.gif`">
                        <button type="button" class="verify-btn">验证</button>
                      </template>
                      <!-- 待开奖/开奖中：不显示结果 -->
                    </td>
                    <td class="col-pool"><span class="coin">{{ item.pool }}</span></td>
                    <td class="col-join">{{ item.joinNum }}</td>
                    <td class="col-mybet">
                      <div class="mybet-info">
                        <span>{{ item.myWin }}</span><br><span>{{ item.myBet }}</span>
                      </div>
                    </td>
                    <td class="col-btn">
                      <!-- 待开奖：橙色参与按钮 -->
                      <button type="button" v-if="item.status === 'pending'" class="join-btn" @click.stop="openBettingPanel(item.no)">参与</button>
                      <!-- 开奖中 -->
                      <button v-else-if="item.status === 'drawing'" class="drawing-btn">开奖中</button>
                      <!-- 已结束 -->
                      <button v-else class="end-btn">已结束</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="pager">
                <a href="javascript:;" class="disabled">&lt;</a>
                <span class="current"><em>1</em></span>
                <a href="javascript:;">2</a>
                <a href="javascript:;">3</a>
                <a href="javascript:;">4</a>
                <a href="javascript:;">5</a>
                <span class="dots">…</span>
                <a href="javascript:;">72</a>
                <a href="javascript:;">&gt;</a>
              </div>
            </div>

            <!-- My Bet Panel -->
            <div class="panel mybet-panel" v-show="activePanel === 'mybet'">
              <table class="draw-table mybet-table">
                <thead>
                  <tr>
                    <th>期号</th>
                    <th>开奖时间</th>
                    <th>开奖结果</th>
                    <th>投注金币</th>
                    <th>中奖金币</th>
                    <th>盈亏</th>
                    <th>投注时间</th>
                    <th>详情</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bet in myBetHistory" :key="bet.no">
                    <td>{{ bet.no }}</td>
                    <td>{{ bet.drawTime }}</td>
                    <td>
                      <span :class="['num-circle', getNumColorClass(String(bet.result).padStart(2, '0'))]">{{ bet.result }}</span>
                    </td>
                    <td><span class="coin">{{ bet.betAmount }}</span><span class="coin-icon">🪙</span></td>
                    <td><span class="coin">{{ bet.winAmount }}</span><span class="coin-icon">🪙</span></td>
                    <td>
                      <span :class="bet.profit < 0 ? 'loss' : 'profit'">{{ bet.profit < 0 ? bet.profit : '+' + bet.profit }}</span><span class="coin-icon">🪙</span>
                    </td>
                    <td>{{ bet.betTime }}</td>
                    <td>
                      <a href="javascript:;" class="detail-link">详情</a>
                      <a href="javascript:;" class="save-link">保存</a>
                    </td>
                  </tr>
                  <tr v-if="myBetHistory.length === 0">
                    <td colspan="8" style="text-align:center;color:#999;padding:20px;">暂无投注记录</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- My Modes Panel -->
            <div class="panel mymodes-panel" v-show="activePanel === 'mymodes'">
              <div class="quote-box">您可以保存100个自定义模式，使用它们进行投注、托管、对号投注，方便您进行多样化的操作！</div>
              <table class="draw-table"></table>
            </div>

            <!-- Auto Bet Panel -->
            <div class="panel myauto-panel" v-show="activePanel === 'myauto'">
              <div class="quote-box">
                <h2>自动投注设置</h2>
                1、设置自动投注期数、账户金上限和下限、起始自动投注模式<br>
                2、确认并开始自动投注后，系统将会在你指定的期数内帮您自动投注，不论你的离线或在线都会持续运行直到期数终止或您关闭为止。<br>
                3、开启后对号投注将自动关闭
              </div>
              <div class="add-mode-wrap"><a class="add-mode-btn">添加模式</a></div>
            </div>

            <!-- Week Gain Panel -->
            <div class="panel weekgain-panel" v-show="activePanel === 'weekgain'">
              <table class="draw-table"></table>
            </div>

            <!-- Week Liushui Panel -->
            <div class="panel weekliushui-panel" v-show="activePanel === 'weekliushui'">
              <table class="draw-table"></table>
            </div>

            <!-- Game Rule Panel -->
            <div class="panel gamerule-panel" v-show="activePanel === 'gamerule'">
              <iframe class="rule-frame" src="/gamerule/8.html?v=2"></iframe>
            </div>

            <!-- Betting Panel -->
            <div class="panel betting-panel" v-show="showBettingPanel">
              <!-- Custom Modes Section -->
              <fieldset class="layui-elem-field">
                <legend>我的自定义模式</legend>
                <div class="layui-field-box mymodswrap">
                  <button
                    v-for="mode in customModes"
                    :key="mode.id"
                    :class="['layui-btn', 'layui-btn-sm', 'layui-btn-primary', 'mymodesbtn', { active: activeMode === mode.id }]"
                    type="button"
                    @click="activeMode = mode.id"
                  >{{ mode.name }}</button>
                </div>
              </fieldset>

              <!-- Betting Options -->
              <div class="betting-options">
                <!-- Row 1 -->
                <div class="options-row">
                  <span
                    v-for="opt in bettingOptions1"
                    :key="opt"
                    :class="['opt-btn', { active: selectedOptions.includes(opt) }]"
                    @click="toggleOption(opt)"
                  >{{ opt }}</span>
                </div>
                <!-- Row 2 -->
                <div class="options-row">
                  <span
                    v-for="opt in bettingOptions2"
                    :key="opt"
                    :class="['opt-btn', { active: selectedOptions.includes(opt) }]"
                    @click="toggleOption(opt)"
                  >{{ opt }}</span>
                </div>
                <!-- Row 3 - Multipliers and Actions -->
                <div class="options-row">
                  <span
                    v-for="opt in multiplierOptions"
                    :key="opt"
                    :class="['opt-btn mult-btn', { active: selectedOptions.includes(opt) }]"
                    @click="toggleOption(opt)"
                  >{{ opt }}</span>
                  <span
                    v-for="act in actionButtons"
                    :key="act"
                    :class="['opt-btn action-btn']"
                    @click="toggleOption(act)"
                  >{{ act }}</span>
                  <input type="text" class="suoha-input" v-model="suohaAmount" placeholder="输入梭哈金额">
                  <span class="opt-btn action-btn suoha-btn">定额梭哈</span>
                </div>
              </div>

              <!-- Period Info Bar -->
              <div class="period-info-bar">
                <div class="period-countdown">
                  第<span class="period-num">{{ currentBettingPeriod }}</span>期距<span class="time-red">{{ countdown.stop }}</span>秒停止竞猜，<span class="time-red">{{ countdown.draw }}</span>秒开奖
                </div>
                <div class="bet-status">
                  <span class="next-period">3386788</span> 期已投注:<span class="coin">{{ periodBetAmount }}</span> <span class="coin-icon">🪙</span>
                  此次总投注: <span class="coin">{{ totalBetAmount }}</span> <span class="coin-icon">🪙</span>
                </div>
                <div class="quick-bet-area">
                  <span
                    v-for="amount in quickBetAmounts"
                    :key="amount"
                    class="quick-bet-chip"
                    :class="'chip-' + amount"
                  >{{ amount >= 1000 ? (amount / 1000) + 'K' : amount }}</span>
                  <button class="submit-bet-btn" @click="submitBet">
                    <span class="bet-icon">✏</span> 投注
                  </button>
                </div>
              </div>

              <!-- Odds Table -->
              <div class="odds-table-wrap">
                <table class="odds-table">
                  <thead>
                    <tr>
                      <th class="col-num">号码</th>
                      <th class="col-odds">当前赔率</th>
                      <th class="col-mybet">我的投注</th>
                      <th class="col-bet">投注</th>
                      <th class="col-num">号码</th>
                      <th class="col-odds">当前赔率</th>
                      <th class="col-mybet">我的投注</th>
                      <th class="col-bet">投注</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(left, index) in leftOdds" :key="index">
                      <!-- Left column -->
                      <td class="col-num">
                        <span :class="['num-circle', getNumColorClass(left.num)]">{{ left.num }}</span>
                      </td>
                      <td class="col-odds">{{ left.odds.toFixed(4) }}</td>
                      <td class="col-mybet">{{ left.myBet }}</td>
                      <td class="col-bet">
                        <input type="text" class="bet-input" v-model="left.betAmount">
                        <span class="mult-x" @click="multiplyBet(index, 0.5)">×0.5</span>
                        <span class="mult-x" @click="multiplyBet(index, 2)">×2</span>
                        <span class="mult-x" @click="multiplyBet(index, 10)">×10</span>
                      </td>
                      <!-- Right column -->
                      <td class="col-num">
                        <span :class="['num-circle', getNumColorClass(rightOdds[index].num)]">{{ rightOdds[index].num }}</span>
                      </td>
                      <td class="col-odds">{{ rightOdds[index].odds.toFixed(4) }}</td>
                      <td class="col-mybet">{{ rightOdds[index].myBet }}</td>
                      <td class="col-bet">
                        <input type="text" class="bet-input" v-model="rightOdds[index].betAmount">
                        <span class="mult-x" @click="multiplyBet(index + 14, 0.5)">×0.5</span>
                        <span class="mult-x" @click="multiplyBet(index + 14, 2)">×2</span>
                        <span class="mult-x" @click="multiplyBet(index + 14, 10)">×10</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Back button -->
              <div class="back-btn-wrap">
                <button class="back-btn" @click="closeBettingPanel">返回游戏列表</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.game-container {
  width: 1200px;
  margin: 0 auto;
  padding: 15px 0;
}

.game-body {
  width: 100%;
}

/* ==================== GAME TAB ==================== */
.gametab {
  background: rgba(255,255,255,0.8);
  padding: 8px;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
}

.type-row {
  overflow: hidden;
}

.type-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.type-item {
  float: left;
  width: 95.8px;
  height: 35px;
  line-height: 35px;
  text-align: center;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid #6a6a6a;
  background: #f5f5f5;
  cursor: pointer;
}

.type-item:hover {
  opacity: 0.8;
}

.type-item a {
  display: block;
  color: #FFF;
  font-size: 14px;
  text-decoration: none;
  position: relative;
}

.type-item.active a::before,
.type-item:hover a::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 24px;
  height: 33px;
  background: url('/skin/pc/wm/images/hover.png');
}

/* Game type colors */
.type-item.system { background: #09F; border-color: #0770cc; }
.type-item.bg { background: #ff9600; border-color: #cc6307; }
.type-item.btc { background: #f24a00; border-color: #cc2c07; }
.type-item.jnd { background: #af48b7; border-color: #8507cc; }
.type-item.hanguo { background: #6441F1; border-color: #472ABD; }
.type-item.qlq { background: #077994; border-color: #085668; }
.type-item.feit { background: #e60e83; border-color: #990a57; }
.type-item.shasec { background: #093; border-color: #056a27; }

.type-item.gametop {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none !important;
  border: 0 !important;
  width: auto !important;
  height: auto !important;
  line-height: 35px !important;
  float: none;
}

.type-item.gametop a {
  color: red;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.type-item.gametop a img {
  margin-right: 5px;
}

.type-item.gametop a::before,
.type-item.gametop:hover a::before {
  display: none !important;
  background: none !important;
  content: none !important;
}

.type-item img {
  vertical-align: middle;
  margin-top: -2px;
}

/* ==================== GAME ITEMS ROW ==================== */
.item-row {
  margin-top: 5px;
  overflow: hidden;
}

.item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.item-btn {
  float: left;
  width: 95.8px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  margin-right: 10px;
  border-radius: 5px;
  border: 1px solid #f19191;
  background: #FFF;
  cursor: pointer;
}

.item-btn:hover {
  opacity: 0.8;
}

.item-btn.active {
  background: #df3636;
  border-color: #dc1d1d;
}

.item-btn a {
  display: block;
  color: red;
  font-size: 14px;
  text-decoration: none;
}

.item-btn.active a {
  color: #FFF;
}

/* ==================== GAME CONTENT ==================== */
.gamecontent {
  background: rgba(255,255,255,0.8);
  padding: 8px;
}

/* ==================== TOP INFO BAR ==================== */
.top-info-bar {
  background: #ffbf4b;
  padding: 10px;
  padding-bottom: 3px;
  border-radius: 10px 10px 0 0;
  overflow: hidden;
}

.game-badge {
  float: left;
  width: 80px;
  margin-left: 6px;
}

.badge-img {
  width: 80px;
  height: 80px;
  background-size: cover;
}

.badge-img.bingo {
  background-image: url('/skin/pc/wm/images/bingo.png');
}

.badge-text {
  text-align: center;
  font-size: 18px;
  color: #FFF;
}

.game-info {
  float: right;
  width: 1050px;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.info-item {
  float: left;
  width: 130px;
  height: 70px;
  line-height: 30px;
  background: rgba(255,255,255,0.15);
  font-size: 13px;
  text-align: center;
  border-right: 1px solid #ffd88e;
  color: #FFF;
}

.info-item span {
  font-weight: 700;
  font-size: 14px;
}

.info-item.order-item {
  width: 150px;
}

.info-item.clock-item {
  width: 370px;
}

.info-item.clock-item .clock-text {
  line-height: 70px;
  font-weight: normal;
}

.info-item.last {
  width: 140px;
  border-right: 0;
}

.order-num {
  color: #ff3000;
  font-size: 28px;
  font-weight: 700;
}

.clock-num {
  color: #FF0000;
  font-size: 13px;
  font-weight: bold;
  font-family: Verdana, Arial, Helvetica, sans-serif;
}

/* ==================== SUB NAVIGATION ==================== */
.sub-nav {
  height: 35px;
  line-height: 35px;
  padding: 0 10px;
  background: rgba(255,255,255,0.45);
  overflow: hidden;
}

.nav-left {
  float: left;
}

.nav-left a {
  margin-right: 10px;
}

.nav-icon {
  display: inline-block;
  width: 60px;
  height: 24px;
  background: url('/skin/pc/wm/images/set.png') no-repeat;
  vertical-align: middle;
}

.nav-icon.sound-on {
  background-position: 0 -72px;
}

.nav-icon.auto-on {
  background-position: 0 -24px;
}

.nav-right {
  float: right;
}

.nav-right a {
  color: #814708;
  text-decoration: none;
  position: relative;
}

.nav-right a.active::after {
  content: '';
  position: absolute;
  bottom: -7px;
  left: 50%;
  margin-left: -3px;
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background: #814708;
}

.nav-right .sep {
  color: #EFB964;
  margin: 0 6px;
}

/* ==================== GAME MAIN ==================== */
.game-main {
  min-height: 400px;
}

.panel {
  display: block;
}

/* ==================== QUOTE BOX ==================== */
.quote-box {
  background: url('/skin/pc/wm/images/ps.gif') 15px 8px no-repeat #D4ECF7;
  color: #1d6f9f;
  padding: 10px 10px 10px 45px;
  font-size: 13px;
}

.quote-box h2 {
  font-size: 16px;
  margin: 0 0 5px 0;
}

/* ==================== DRAW TABLE ==================== */
.draw-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  margin-top: 5px;
  table-layout: auto;
}

.draw-table th {
  background: #ffbf4c;
  color: #FFF;
  font-weight: normal;
  padding: 6px 5px;
  font-size: 13px;
  text-align: center;
  border: 1px solid #ffbf4c;
}

.draw-table th.col-btn {
  text-align: right;
}

.draw-table td {
  padding: 5px;
  font-size: 13px;
  text-align: center;
  border: 1px solid #e6e6e6;
  line-height: 16px;
}

.draw-table td.col-btn {
  text-align: right;
}

.draw-table .col-no { width: 95px; }
.draw-table .col-date { width: 115px; white-space: nowrap; }
.draw-table .col-result { min-width: 280px; }
.draw-table .col-pool { width: 120px; }
.draw-table .col-join { width: 95px; }
.draw-table .col-mybet { width: 110px; }
.draw-table .col-btn { width: 75px; }

.draw-table td.col-result {
  white-space: nowrap;
  text-align: center;
}

.result-nums {
  color: #BBB;
  font-size: 16px;
  font-family: Verdana, Geneva, sans-serif;
  vertical-align: middle;
  display: inline;
  white-space: nowrap;
}

.result-nums .num {
  color: #f03736;
  display: inline;
}

.result-img {
  vertical-align: middle;
  margin: 0 8px;
  display: inline;
}

.verify-btn {
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1.5;
  border-radius: 3px;
  background: #f46109;
  border: 1px solid #383838;
  color: #fff;
  cursor: pointer;
  margin-left: 10px;
  vertical-align: middle;
  display: inline;
}

.join-btn {
  padding: 0 8px;
  height: 25px;
  line-height: 25px;
  font-size: 12px;
  border: 1px solid #f5a15d;
  background: #FFB800;
  color: #fff;
  border-radius: 2px;
  cursor: pointer;
}

.join-btn:hover {
  background: #f5a15d;
}

.drawing-btn {
  padding: 0 8px;
  height: 25px;
  line-height: 25px;
  font-size: 12px;
  border: 1px solid #C9C9C9;
  background: #fff;
  color: #555;
  border-radius: 2px;
  cursor: default;
}

.end-btn {
  padding: 0 8px;
  height: 25px;
  line-height: 25px;
  font-size: 12px;
  border: 1px solid #C9C9C9;
  background: #fff;
  color: #555;
  border-radius: 2px;
  cursor: pointer;
}

.mybet-info {
  color: #bfbfbf;
}

.coin {
  color: #f03736;
}

/* ==================== PAGER ==================== */
.pager {
  margin-top: 15px;
  font-size: 0;
}

.pager a,
.pager span {
  display: inline-block;
  padding: 0 12px;
  height: 28px;
  line-height: 28px;
  margin-right: 5px;
  background: #fff;
  color: #333;
  font-size: 12px;
  text-decoration: none;
  border: 1px solid #e2e2e2;
}

.pager a:hover {
  color: #009688;
}

.pager .current {
  background: #009688;
  border-color: #009688;
  color: #fff;
}

.pager .current em {
  font-style: normal;
}

.pager .disabled {
  color: #d2d2d2;
  cursor: not-allowed;
}

.pager .dots {
  border: none;
  background: none;
}

/* ==================== ADD MODE ==================== */
.add-mode-wrap {
  text-align: center;
  padding: 50px;
}

.add-mode-btn {
  display: inline-block;
  padding: 10px 30px;
  background: #1E9FFF;
  color: #fff;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
}

/* ==================== RULE FRAME ==================== */
.rule-frame {
  border: 0;
  width: 100%;
  min-height: 600px;
}

/* ==================== BETTING PANEL ==================== */
.betting-panel {
  background: #fff;
}

/* Custom Modes Section - Layui Fieldset Style */
.layui-elem-field {
  margin: 10px 0;
  padding: 0;
  border: 1px solid #e6e6e6;
  border-radius: 2px;
}

.layui-elem-field legend {
  margin-left: 20px;
  padding: 0 10px;
  font-size: 14px;
  font-weight: 400;
  color: #fff;
  background: #FFB800;
  border-radius: 2px;
}

.layui-field-box {
  padding: 15px;
}

.mymodswrap {
  overflow: hidden;
}

.mymodesbtn {
  margin-right: 10px;
  margin-bottom: 5px;
}

.layui-btn {
  display: inline-block;
  vertical-align: middle;
  height: 38px;
  line-height: 38px;
  padding: 0 18px;
  background-color: #009688;
  color: #fff;
  white-space: nowrap;
  text-align: center;
  font-size: 14px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}

.layui-btn-sm {
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  font-size: 12px;
}

.layui-btn-primary {
  background-color: #fff;
  border: 1px solid #c9c9c9;
  color: #555;
}

.layui-btn-primary:hover {
  border-color: #009688;
  color: #009688;
}

.mymodesbtn.active {
  border-color: #FFB800;
  color: #FFB800;
}

/* Betting Options */
.betting-options {
  padding: 10px;
  background: #f9f9f9;
  border-bottom: 1px solid #e6e6e6;
}

.options-row {
  margin-bottom: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.options-row:last-child {
  margin-bottom: 0;
}

.opt-btn {
  display: inline-block;
  padding: 6px 12px;
  background: #FFB800;
  color: #fff;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
  min-width: 40px;
  text-align: center;
}

.opt-btn:hover {
  opacity: 0.9;
}

.opt-btn.active {
  background: #f03736;
}

.opt-btn.mult-btn {
  background: #87CEEB;
}

.opt-btn.mult-btn.active {
  background: #4682B4;
}

.opt-btn.action-btn {
  background: #87CEEB;
}

.suoha-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 120px;
  font-size: 13px;
}

.suoha-btn {
  background: #f03736 !important;
}

/* Period Info Bar */
.period-info-bar {
  background: #fff;
  padding: 10px 15px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.period-countdown {
  font-size: 13px;
  color: #333;
}

.period-num {
  color: #f03736;
  font-weight: bold;
}

.time-red {
  color: #f03736;
  font-weight: bold;
}

.bet-status {
  font-size: 13px;
  color: #333;
}

.next-period {
  color: #FFB800;
  font-weight: bold;
}

.coin-icon {
  font-size: 14px;
}

.quick-bet-area {
  display: flex;
  align-items: center;
  gap: 5px;
}

.quick-bet-chip {
  display: inline-block;
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border-radius: 50%;
  font-size: 11px;
  font-weight: bold;
  color: #fff;
  cursor: pointer;
}

.chip-10 { background: linear-gradient(135deg, #87CEEB, #4682B4); }
.chip-100 { background: linear-gradient(135deg, #DDA0DD, #9370DB); }
.chip-500 { background: linear-gradient(135deg, #FFB800, #FF8C00); }
.chip-1000 { background: linear-gradient(135deg, #98FB98, #32CD32); }
.chip-5000 { background: linear-gradient(135deg, #FFB6C1, #FF69B4); }

.submit-bet-btn {
  background: #FFB800;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.submit-bet-btn:hover {
  background: #e6a600;
}

.bet-icon {
  font-size: 14px;
}

/* Odds Table */
.odds-table-wrap {
  padding: 10px;
}

.odds-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.odds-table th {
  background: #f5f5f5;
  padding: 8px 5px;
  text-align: center;
  border: 1px solid #e6e6e6;
  font-weight: normal;
  color: #666;
}

.odds-table td {
  padding: 6px 5px;
  text-align: center;
  border: 1px solid #e6e6e6;
}

.odds-table .col-num { width: 60px; }
.odds-table .col-odds { width: 80px; }
.odds-table .col-mybet { width: 70px; color: #999; }
.odds-table .col-bet { width: 160px; }

.num-circle {
  display: inline-block;
  width: 28px;
  height: 28px;
  line-height: 28px;
  border-radius: 50%;
  color: #fff;
  font-weight: bold;
  font-size: 12px;
}

.num-green { background: #4CAF50; }
.num-blue { background: #2196F3; }
.num-red { background: #f44336; }
.num-gray { background: #9e9e9e; }

.bet-input {
  width: 50px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  text-align: center;
  font-size: 12px;
}

.mult-x {
  display: inline-block;
  padding: 3px 6px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 2px;
  margin-left: 3px;
  cursor: pointer;
  font-size: 11px;
  color: #666;
}

.mult-x:hover {
  background: #e6e6e6;
}

/* My Bet Table */
.mybet-table td {
  vertical-align: middle;
}

.mybet-table .coin-icon {
  font-size: 12px;
  margin-left: 2px;
}

.mybet-table .loss {
  color: #f03736;
}

.mybet-table .profit {
  color: #4CAF50;
}

.detail-link,
.save-link {
  display: inline-block;
  padding: 2px 10px;
  margin: 0 3px;
  border: 1px solid #c9c9c9;
  border-radius: 2px;
  color: #555;
  text-decoration: none;
  font-size: 12px;
  background: #fff;
}

.detail-link:hover,
.save-link:hover {
  border-color: #009688;
  color: #009688;
}

/* Back Button */
.back-btn-wrap {
  padding: 15px;
  text-align: center;
}

.back-btn {
  padding: 8px 30px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.back-btn:hover {
  background: #e6e6e6;
}
</style>
