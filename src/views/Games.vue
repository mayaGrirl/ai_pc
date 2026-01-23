<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import {
  gameAll,
  playAll,
  fetchExpectInfo,
  lotteryRecord,
  betRecords,
  betGame,
  modeList,
  setMode,
  profitLoss,
  autoOne,
  setAuto
} from '@/api/game'
import { rankToday, rankYesterday, rankWeek } from '@/api/rank'
import type {
  GameTypeMapItem,
  Game,
  GamePlayMapItem,
  GamePlay,
  LotteryResultItem,
  BetRecordItem,
  ModeItem,
  ExpectInfo,
  ProfitLossItem,
  BetNoItem,
  AutoItem
} from '@/types/game.type'
import type { RankTodayField, RankWeekField } from '@/types/rank.type'
import type { HttpRes } from '@/types/http.type'

const route = useRoute()

// Loading states
const isLoadingGames = ref(true)
const isLoadingPlays = ref(false)
const isLoadingRecords = ref(false)
const isLoadingBetRecords = ref(false)
const isLoadingModes = ref(false)
const isLoadingProfitLoss = ref(false)
const isLoadingRank = ref(false)
const isSubmitting = ref(false)

// Ranking state - 三列同时显示
const rankDataToday = ref<RankTodayField[]>([])
const rankDataYesterday = ref<RankTodayField[]>([])
const rankDataWeek = ref<RankWeekField[]>([])

// Betting panel state
const showBettingPanel = ref(false)
const currentBettingPeriod = ref('')
const countdown = ref({ stop: 82, draw: 132 })

// Custom modes from API
const customModes = ref<ModeItem[]>([])
const selectedMode = ref<ModeItem | null>(null)

// Play method interface
interface PlayItem {
  id: number
  name: string
  lang_name?: Record<string, string> | null
  odds: number
  minBetGold: number
}

interface PlayGroup {
  id: number
  name: string
  lang_name?: Record<string, string> | string | null
  plays: PlayItem[]
  betMultiplier?: string
  startNum?: number
}

// Active play group with plays
const activePlayGroup = ref<PlayGroup | null>(null)

// Selected plays and amounts
const selectedPlays = ref<string[]>([])
const playAmounts = ref<Record<string, string>>({})

// My current period bet amounts
const myBetAmounts = ref<Record<string, number>>({})

// Active quick select button
const activeQuick = ref<string | null>(null)

// Quick select support for specific group IDs
const quickSelectGroupIds = [1, 3, 10, 14, 18, 22, 4, 26, 5, 16, 23, 6, 15, 24]

// Quick buttons - row 1
const quickButtons1 = [
  { value: '全包', label: '全包' },
  { value: '单', label: '单' },
  { value: '大单', label: '大单' },
  { value: '小单', label: '小单' },
  { value: '单边', label: '单边' },
  { value: '双', label: '双' }
]

// Quick buttons - row 2
const quickButtons2 = [
  { value: '大双', label: '大双' },
  { value: '小双', label: '小双' },
  { value: '双边', label: '双边' },
  { value: '大', label: '大' },
  { value: '小', label: '小' },
  { value: '中', label: '中' }
]

// Quick buttons - row 3
const quickButtons3 = [
  { value: '边', label: '边' },
  { value: '大边', label: '大边' },
  { value: '小边', label: '小边' }
]

// Special buttons
const specialButtons = [
  { value: '上期', label: '上期' },
  { value: '反选', label: '反选' },
  { value: '清空', label: '清空' }
]

// Generic buttons (for non-quick-select groups)
const genericButtons = [
  { value: '全包', label: '全包' },
  { value: '上期', label: '上期' },
  { value: '反选', label: '反选' },
  { value: '清空', label: '清空' }
]

// Tail buttons
const tailButtons = [
  { value: '0尾', label: '0尾' },
  { value: '1尾', label: '1尾' },
  { value: '2尾', label: '2尾' },
  { value: '3尾', label: '3尾' },
  { value: '4尾', label: '4尾' },
  { value: '5尾', label: '5尾' },
  { value: '6尾', label: '6尾' },
  { value: '7尾', label: '7尾' },
  { value: '8尾', label: '8尾' },
  { value: '9尾', label: '9尾' },
  { value: '小尾', label: '小尾' },
  { value: '大尾', label: '大尾' }
]

// Mod buttons
const mod3Buttons = [
  { value: '3余0', label: '3余0' },
  { value: '3余1', label: '3余1' },
  { value: '3余2', label: '3余2' }
]

const mod4Buttons = [
  { value: '4余0', label: '4余0' },
  { value: '4余1', label: '4余1' },
  { value: '4余2', label: '4余2' },
  { value: '4余3', label: '4余3' }
]

const mod5Buttons = [
  { value: '5余0', label: '5余0' },
  { value: '5余1', label: '5余1' },
  { value: '5余2', label: '5余2' },
  { value: '5余3', label: '5余3' },
  { value: '5余4', label: '5余4' }
]

// Multiplier buttons
const multiplierButtons1 = [0.1, 0.5, 0.8, 1.2, 1.5, 2]
const multiplierButtons2 = [5, 10, 20, 30, 50, 100]

// Selected multiplier
const selectedMultiplier = ref<number | null>(null)

// Chip config
const chipConfig = [
  { display: '10', value: 10000, img: '/chips/10.png' },
  { display: '100', value: 100000, img: '/chips/100.png' },
  { display: '500', value: 500000, img: '/chips/500.png' },
  { display: '1K', value: 1000000, img: '/chips/1000.png' },
  { display: '5K', value: 5000000, img: '/chips/5000.png' }
]

// Check if current group supports full quick select buttons
const showFullQuickSelect = computed(() => {
  // Use activeGroupId for immediate reactivity when switching groups
  const groupId = activeGroupId.value
  return groupId ? quickSelectGroupIds.includes(groupId) : false
})

// Original PC layout betting options - row 1 (dynamic based on group)
const bettingOptions1 = computed(() => {
  if (showFullQuickSelect.value) {
    return ['单', '大单', '小单', '单边', '双', '大双', '小双', '双边', '大', '小', '中', '边', '大边', '小边', '0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾']
  }
  // For non-supported groups, row 1 is empty (all buttons are in row 3)
  return []
})

// Original PC layout betting options - row 2 (dynamic based on group)
const bettingOptions2 = computed(() => {
  if (showFullQuickSelect.value) {
    return ['8尾', '9尾', '小尾', '大尾', '3余0', '3余1', '3余2', '4余0', '4余1', '4余2', '4余3', '5余0', '5余1', '5余2', '5余3', '5余4']
  }
  // For non-supported groups, row 2 is empty
  return []
})

// Original PC layout multiplier options
const multiplierOptions = [
  0.1, 0.5, 0.8, 1.2, 1.5, 2, 10, 30, 50, 100, 200
]

// Original PC layout action buttons (always show all action buttons)
const actionButtons = ['上期', '全包', '反选', '清空', '梭哈']

// Original PC layout quick bet amounts
const quickBetAmounts = [10, 100, 500, 1000, 5000]

// Quick amount for fixed all-in
const quickAmount = ref<string>('')

// Is expanded (show tail/mod/multiplier)
const isExpanded = ref(false)

// Calculate total bet amount
const totalBetAmount = computed(() => {
  return selectedPlays.value.reduce((sum, p) => sum + (parseInt(playAmounts.value[p] || '0', 10) || 0), 0)
})

// Total my bet this period
const periodBetAmount = computed(() => {
  return Object.values(myBetAmounts.value).reduce((sum, amt) => sum + amt, 0)
})

// Bet detail modal
const showBetDetailModal = ref(false)
const currentBetDetail = ref<any>(null)

// Open bet detail modal
const openBetDetailModal = (bet: any) => {
  currentBetDetail.value = bet
  showBetDetailModal.value = true
}

// Close bet detail modal
const closeBetDetailModal = () => {
  showBetDetailModal.value = false
  currentBetDetail.value = null
}

// Verify modal - 验证弹框
const showVerifyModal = ref(false)
const currentVerifyData = ref<{
  no: string
  actionNo: string      // 原始开奖号码，用于显示
  actionNoSort: string  // 排序后的号码，用于计算
  result: number | null
  gameName: string
  lotteryId: number     // 当前选中的游戏ID
  groupId: number
  groupName: string
  groupInfo: string
  rewardNum: number
  startNum: number
  gameType: number
  finalResRecord: string
} | null>(null)

// 判断是否是特殊玩法分组（号码形态、龙虎豹、大小单双等）- 这些分组直接显示finalResRecord结果
const isSpecialPlayGroup = (groupName: string) => {
  const specialGroups = ['号码形态', '形态', '龙虎豹', '龙虎', '大小单双', '大小', '单双']
  return specialGroups.some(name => groupName.includes(name))
}

// 从finalResRecord中提取结果（取第一个 | 后面的内容，如果没有 | 就显示整个值）
const extractResultFromFinalRes = (finalResRecord: string) => {
  if (!finalResRecord) return ''
  const pipeIndex = finalResRecord.indexOf('|')
  if (pipeIndex !== -1) {
    return finalResRecord.substring(pipeIndex + 1).trim()
  }
  return finalResRecord.trim()
}

// 获取游戏规则 - 根据玩法分组ID和游戏ID获取计算规则
// 规则映射来自admin模板：open_recode_28.html, open_recode_16.html, open_recode_11.html, open_recode_36.html
// lotteryId: 当前选中的游戏ID，用于识别同一游戏下的所有玩法分组
// gameName: 游戏名称，用于识别游戏类型
const getGameRuleByGroupId = (groupId: number, groupInfo: string, rewardNum: number, gameType: number, gameName: string = '', lotteryId: number = 0) => {
  // ========== 完全基于 lotteryId 和 groupId 判断区位规则 ==========

  // ========== 幸运28 (lotteryId=1) ==========
  // group_id=1, 2: 无区位计算，直接使用3个号码
  if (lotteryId === 1 || [1, 2].includes(groupId)) {
    return {
      type: 'lucky', zoneCount: 3, calcMethod: 'direct',
      zone1: [0], zone2: [1], zone3: [2],
      zone1Desc: '第1位', zone2Desc: '第2位', zone3Desc: '第3位'
    }
  }

  // ========== 加拿大28 (lotteryId=2) ==========
  // group_id=4: 前七取尾
  if (groupId === 4) {
    return {
      type: '10', zoneCount: 1, calcMethod: 'lastDigitPlus1',
      zone1: [0, 1, 2, 3, 4, 5, 6], zone2: [], zone3: [],
      zone1Desc: '前7位', zone2Desc: '', zone3Desc: ''
    }
  }
  // group_id=5: 加拿大二取余
  if (groupId === 5) {
    return {
      type: '11', zoneCount: 2, calcMethod: 'mod6Plus1',
      zone1: [0, 3, 6, 9, 12, 15], zone2: [2, 5, 8, 11, 14, 17], zone3: [],
      zone1Desc: '第1,4,7,10,13,16位', zone2Desc: '第3,6,9,12,15,18位', zone3Desc: ''
    }
  }
  // group_id=6: 加拿大三取余
  if (groupId === 6) {
    return {
      type: '16', zoneCount: 3, calcMethod: 'mod6Plus1',
      zone1: [0, 3, 6, 9, 12, 15], zone2: [1, 4, 7, 10, 13, 16], zone3: [2, 5, 8, 11, 14, 17],
      zone1Desc: '第1,4,7,10,13,16位', zone2Desc: '第2,5,8,11,14,17位', zone3Desc: '第3,6,9,12,15,18位'
    }
  }
  // group_id=3, 7, 8, 9: 加拿大标准28点 (和值, 号码形态, 龙虎豹, 大小单双)
  if (lotteryId === 2 || [3, 7, 8, 9].includes(groupId)) {
    return {
      type: '28', zoneCount: 3, calcMethod: 'lastDigit',
      zone1: [1, 4, 7, 10, 13, 16], zone2: [2, 5, 8, 11, 14, 17], zone3: [3, 6, 9, 12, 15, 18],
      zone1Desc: '第2,5,8,11,14,17位', zone2Desc: '第3,6,9,12,15,18位', zone3Desc: '第4,7,10,13,16,19位'
    }
  }

  // ========== 韩国28 (lotteryId=3) ==========
  // group_id=10, 11, 12, 13: 与加拿大标准28点相同
  if (lotteryId === 3 || [10, 11, 12, 13].includes(groupId)) {
    return {
      type: '28', zoneCount: 3, calcMethod: 'lastDigit',
      zone1: [1, 4, 7, 10, 13, 16], zone2: [2, 5, 8, 11, 14, 17], zone3: [3, 6, 9, 12, 15, 18],
      zone1Desc: '第2,5,8,11,14,17位', zone2Desc: '第3,6,9,12,15,18位', zone3Desc: '第4,7,10,13,16,19位'
    }
  }

  // ========== 美国28 (lotteryId=4) ==========
  // group_id=15: 美国三取余
  if (groupId === 15) {
    return {
      type: '16', zoneCount: 3, calcMethod: 'mod6Plus1',
      zone1: [1, 4], zone2: [2, 5], zone3: [3, 5],
      zone1Desc: '第2,5位', zone2Desc: '第3,6位', zone3Desc: '第4,6位'
    }
  }
  // group_id=16: 美国二取余
  if (groupId === 16) {
    return {
      type: '11', zoneCount: 2, calcMethod: 'mod6Plus1',
      zone1: [1, 4], zone2: [3, 5], zone3: [],
      zone1Desc: '第2,5位', zone2Desc: '第4,6位', zone3Desc: ''
    }
  }
  // group_id=14, 17: 美国标准28点 (和值, 号码形态)
  if (lotteryId === 4 || [14, 17].includes(groupId)) {
    return {
      type: '28', zoneCount: 3, calcMethod: 'lastDigit',
      zone1: [0, 5], zone2: [1, 3], zone3: [2, 4],
      zone1Desc: '第1,6位', zone2Desc: '第2,4位', zone3Desc: '第3,5位'
    }
  }

  // ========== 蛋蛋28 (lotteryId=5) ==========
  // group_id=18, 19, 20, 21: 蛋蛋标准28点
  if (lotteryId === 5 || [18, 19, 20, 21].includes(groupId)) {
    return {
      type: '28', zoneCount: 3, calcMethod: 'lastDigit',
      zone1: [0, 1, 2, 3, 4, 5], zone2: [6, 7, 8, 9, 10, 11], zone3: [12, 13, 14, 15, 16, 17],
      zone1Desc: '第1,2,3,4,5,6位', zone2Desc: '第7,8,9,10,11,12位', zone3Desc: '第13,14,15,16,17,18位'
    }
  }

  // ========== 宾果28 (lotteryId=6) ==========
  // group_id=26: 宾果前七取尾
  if (groupId === 26) {
    return {
      type: '10', zoneCount: 1, calcMethod: 'lastDigitPlus1',
      zone1: [0, 1, 2, 3, 4, 5, 6], zone2: [], zone3: [],
      zone1Desc: '前7位', zone2Desc: '', zone3Desc: ''
    }
  }
  // group_id=23: 宾果二取余
  if (groupId === 23) {
    return {
      type: '11', zoneCount: 2, calcMethod: 'mod6Plus1',
      zone1: [0, 3, 6, 9, 12, 15], zone2: [2, 5, 8, 11, 14, 17], zone3: [],
      zone1Desc: '第1,4,7,10,13,16位', zone2Desc: '第3,6,9,12,15,18位', zone3Desc: ''
    }
  }
  // group_id=24: 宾果三取余
  if (groupId === 24) {
    return {
      type: '16', zoneCount: 3, calcMethod: 'mod6Plus1',
      zone1: [1, 4, 7, 10, 13, 16], zone2: [2, 5, 8, 11, 14, 17], zone3: [3, 6, 9, 12, 15, 18],
      zone1Desc: '第2,5,8,11,14,17位', zone2Desc: '第3,6,9,12,15,18位', zone3Desc: '第4,7,10,13,16,19位'
    }
  }
  // group_id=22, 25, 27, 28: 宾果标准28点 (和值, 号码形态, 龙虎豹, 大小单双)
  if (lotteryId === 6 || [22, 25, 27, 28].includes(groupId)) {
    return {
      type: '28', zoneCount: 3, calcMethod: 'lastDigit',
      zone1: [1, 4, 7, 10, 13, 16], zone2: [2, 5, 8, 11, 14, 17], zone3: [3, 6, 9, 12, 15, 18],
      zone1Desc: '第2,5,8,11,14,17位', zone2Desc: '第3,6,9,12,15,18位', zone3Desc: '第4,7,10,13,16,19位'
    }
  }

  // ========== 默认规则 (其他未知游戏) ==========
  // 默认使用加拿大/韩国/宾果的标准28点规则
  return {
    type: '28', zoneCount: 3, calcMethod: 'lastDigit',
    zone1: [1, 4, 7, 10, 13, 16], zone2: [2, 5, 8, 11, 14, 17], zone3: [3, 6, 9, 12, 15, 18],
    zone1Desc: '第2,5,8,11,14,17位', zone2Desc: '第3,6,9,12,15,18位', zone3Desc: '第4,7,10,13,16,19位'
  }
}

// 计算验证数据 - 根据action_no和游戏规则计算各区和值
const calculateVerifyFromActionNo = (actionNo: string, groupId: number, groupInfo: string, rewardNum: number, gameType: number, gameName: string = '', lotteryId: number = 0) => {
  if (!actionNo) return null

  // 解析action_no，支持逗号分隔或其他分隔符
  let nums = actionNo.split(/[,|]/).map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n))
  if (nums.length < 6) return null

  // 检查是否是美国游戏（qlq系列）- 美国游戏需要先排序号码再计算
  const isQlqGame = gameName.includes('美国') || gameName.toLowerCase().includes('qlq') || lotteryId === 4
  if (isQlqGame) {
    // 美国游戏：先排序号码再按区位计算
    nums = [...nums].sort((a, b) => a - b)
  }

  const rule = getGameRuleByGroupId(groupId, groupInfo, rewardNum, gameType, gameName, lotteryId)

  // 计算各区和值
  const zone1Sum = rule.zone1.reduce((sum, idx) => sum + (nums[idx] || 0), 0)
  const zone2Sum = rule.zone2.length > 0 ? rule.zone2.reduce((sum, idx) => sum + (nums[idx] || 0), 0) : 0
  const zone3Sum = rule.zone3.length > 0 ? rule.zone3.reduce((sum, idx) => sum + (nums[idx] || 0), 0) : 0

  // 根据计算方法得出各区数字
  let n1 = 0, n2 = 0, n3 = 0, total = 0

  switch (rule.calcMethod) {
    case 'lastDigit': // 取尾数
      n1 = zone1Sum % 10
      n2 = zone2Sum % 10
      n3 = zone3Sum % 10
      total = n1 + n2 + n3
      break
    case 'mod6Plus1': // 余6加1
      n1 = (zone1Sum % 6) + 1
      n2 = (zone2Sum % 6) + 1
      n3 = rule.zoneCount === 3 ? (zone3Sum % 6) + 1 : 0
      total = rule.zoneCount === 3 ? n1 + n2 + n3 : n1 + n2
      break
    case 'lastDigitPlus1': // 取尾数加1
      const sumAll = zone1Sum
      n1 = (sumAll % 10) + 1
      total = n1
      break
  }

  return {
    zone1Sum,
    zone2Sum,
    zone3Sum,
    zone1Desc: rule.zone1Desc,
    zone2Desc: rule.zone2Desc,
    zone3Desc: rule.zone3Desc,
    n1,
    n2,
    n3,
    total,
    zoneCount: rule.zoneCount,
    calcMethod: rule.calcMethod,
    gameType: rule.type
  }
}

// Open verify modal - 打开验证弹框
const openVerifyModal = (item: any) => {
  // 从 lotteryRecords 中找到对应的原始记录
  const record = lotteryRecords.value.find(r => r.expect_no === item.no)

  // 获取当前游戏名称
  const currentGame = allGames.value.find(g => g.id === activeGame.value)

  // 获取当前玩法分组
  const group = playGroups.value.find(g => g.id === activeGroupId.value)

  // 获取action_no（原开奖号码，用于显示）
  let actionNo = ''
  if (record?.action_no) {
    actionNo = record.action_no
  } else if (record?.action_no_num) {
    if (Array.isArray(record.action_no_num)) {
      actionNo = record.action_no_num.join(',')
    } else if (typeof record.action_no_num === 'object') {
      actionNo = Object.values(record.action_no_num).join(',')
    } else {
      actionNo = String(record.action_no_num)
    }
  }

  // 获取action_no_sort（排序后的号码，用于计算）
  let actionNoSort =   ''
  if (record?.action_no_sort) {
    actionNoSort = record.action_no_sort
  } else {
    // 如果没有action_no_sort，使用actionNo作为后备
    actionNoSort = actionNo
  }

  currentVerifyData.value = {
    no: item.no,
    actionNo,
    actionNoSort,
    result: item.result,
    gameName: currentGame?.name || '',
    lotteryId: activeGame.value,
    groupId: group?.id || 0,
    groupName: group?.name || '',
    groupInfo: group?.info || '',
    rewardNum: group?.reward_num || 28,
    startNum: group?.start_num || 0,
    gameType: group?.game_type || 0,
    finalResRecord: item.finalResRecord || ''
  }
  showVerifyModal.value = true
}

// Close verify modal - 关闭验证弹框
const closeVerifyModal = () => {
  showVerifyModal.value = false
  currentVerifyData.value = null
}

// 验证计算结果 - 使用排序后的号码(actionNoSort)进行计算
const verifyCalcData = computed(() => {
  if (!currentVerifyData.value?.actionNoSort) return null
  return calculateVerifyFromActionNo(
    currentVerifyData.value.actionNoSort,
    currentVerifyData.value.groupId,
    currentVerifyData.value.groupInfo,
    currentVerifyData.value.rewardNum,
    currentVerifyData.value.gameType,
    currentVerifyData.value.gameName,
    currentVerifyData.value.lotteryId
  )
})

// 根据属性获取CSS类名（用于列表显示的属性标签）
const getAttrClass = (attr: string): string => {
  if (attr === '大' || attr === '龙') return 'attr-big'
  if (attr === '小' || attr === '虎') return 'attr-small'
  if (attr === '单') return 'attr-odd'
  if (attr === '双') return 'attr-even'
  if (attr === '豹') return 'attr-leopard'
  // 形态相关
  if (attr === '顺' || attr === '半' || attr === '杂') return 'attr-shape'
  return 'attr-default'
}

// 根据特殊分组结果获取CSS类名
const getSpecialResultClass = (resultText: string): string => {
  if (!resultText) return 'special-default'
  // 号码形态
  if (resultText.includes('顺子') || resultText === '顺') return 'special-shunzi'
  if (resultText.includes('半顺') || resultText === '半顺') return 'special-banshun'
  if (resultText.includes('杂六') || resultText === '杂六') return 'special-zaliu'
  if (resultText.includes('对子') || resultText === '对子') return 'special-duizi'
  if (resultText.includes('豹子') || resultText === '豹子') return 'special-baozi'
  // 龙虎豹
  if (resultText === '龙') return 'special-long'
  if (resultText === '虎') return 'special-hu'
  if (resultText === '豹') return 'special-bao'
  // 大小单双
  if (resultText.includes('大') && resultText.includes('单')) return 'special-dadan'
  if (resultText.includes('大') && resultText.includes('双')) return 'special-dashuang'
  if (resultText.includes('小') && resultText.includes('单')) return 'special-xiaodan'
  if (resultText.includes('小') && resultText.includes('双')) return 'special-xiaoshuang'
  if (resultText === '大') return 'special-da'
  if (resultText === '小') return 'special-xiao'
  if (resultText === '单') return 'special-dan'
  if (resultText === '双') return 'special-shuang'
  return 'special-default'
}

// 根据数字结果获取属性描述（大小单双、形态、龙虎豹等）
const getResultAttributes = (total: number, n1: number, n2: number, n3: number, rewardNum: number) => {
  const attrs: string[] = []

  // 28类游戏属性 (0-27)
  if (rewardNum === 28) {
    // 大小: 0-13小, 14-27大
    attrs.push(total >= 14 ? '大' : '小')
    // 单双
    attrs.push(total % 2 === 0 ? '双' : '单')
    // 龙虎豹: 三个区数字相同为豹，n1>n3为龙，n1<n3为虎
    if (n1 === n2 && n2 === n3) {
      attrs.push('豹')
    } else if (n1 > n3) {
      attrs.push('龙')
    } else if (n1 < n3) {
      attrs.push('虎')
    }
    // 形态: 三个数字的形态
    const sorted = [n1, n2, n3].sort((a, b) => a - b)
    if (sorted[2] - sorted[0] === 2 && sorted[1] - sorted[0] === 1) {
      attrs.push('顺子')
    } else if (sorted[1] - sorted[0] === 1 || sorted[2] - sorted[1] === 1) {
      attrs.push('半顺')
    } else {
      attrs.push('杂六')
    }
  }
  // 16类游戏属性 (3-18)
  else if (rewardNum === 16) {
    // 大小: 3-10小, 11-18大
    attrs.push(total >= 11 ? '大' : '小')
    // 单双
    attrs.push(total % 2 === 0 ? '双' : '单')
  }
  // 11类游戏属性 (2-11)
  else if (rewardNum === 11) {
    // 大小: 2-6小, 7-11大
    attrs.push(total >= 7 ? '大' : '小')
    // 单双
    attrs.push(total % 2 === 0 ? '双' : '单')
  }
  // 10类游戏属性 (1-10)
  else if (rewardNum === 10) {
    // 大小: 1-5小, 6-10大
    attrs.push(total >= 6 ? '大' : '小')
    // 单双
    attrs.push(total % 2 === 0 ? '双' : '单')
  }
  // 36类游戏属性 (0-35)
  else if (rewardNum === 36) {
    // 大小: 0-17小, 18-35大
    attrs.push(total >= 18 ? '大' : '小')
    // 单双
    attrs.push(total % 2 === 0 ? '双' : '单')
  }

  return attrs.join(' ')
}

// 获取验证结果的属性描述
const verifyResultAttrs = computed(() => {
  if (!verifyCalcData.value || !currentVerifyData.value) return ''
  return getResultAttributes(
    verifyCalcData.value.total,
    verifyCalcData.value.n1,
    verifyCalcData.value.n2,
    verifyCalcData.value.n3,
    currentVerifyData.value.rewardNum
  )
})

// 判断当前是否是特殊玩法分组（用于验证弹框）
const isCurrentSpecialGroup = computed(() => {
  if (!currentVerifyData.value) return false
  return isSpecialPlayGroup(currentVerifyData.value.groupName)
})

// 判断当前选中的玩法分组是否是特殊分组（用于列表显示）
const isActiveGroupSpecial = computed(() => {
  const group = playGroups.value.find(g => g.id === activeGroupId.value)
  if (!group) return false
  return isSpecialPlayGroup(group.name)
})

// 判断当前游戏是否是幸运彩类型（不需要验证按钮）
const isLuckyLottery = computed(() => {
  const game = allGames.value.find(g => g.id === activeGame.value)
  return game?.colorClass === 'system'
})

// 获取特殊玩法分组的结果文本
const specialGroupResult = computed(() => {
  if (!currentVerifyData.value) return ''
  return extractResultFromFinalRes(currentVerifyData.value.finalResRecord)
})

// My bet history computed from API
const myBetHistory = computed(() => {
  return myBetRecords.value.map(record => {
    const betGold = record.bet_gold || 0
    const winGold = record.win_gold || 0
    const profit = record.win_loss || (winGold - betGold)
    const status = typeof record.status === 'number' ? record.status : (typeof record.status === 'string' ? parseInt(record.status, 10) : 0)
    return {
      id: record.id || 0,
      no: record.expect_no || '',
      drawTime: record.created_at || '',
      result: 0,
      betAmount: betGold.toLocaleString(),
      winAmount: winGold.toLocaleString(),
      profit,
      betTime: record.bet_time || record.created_at || '',
      betNo: record.bet_no || [],
      status: status,
      isOpened: record.is_opened === 1
    }
  })
})

// Get bet status text
const getBetStatusText = (status: number) => {
  switch (status) {
    case 0: return '未结算'
    case 1: return '已结算'
    case 2: return '已回滚'
    case 3: return '已删除'
    default: return '未知'
  }
}

// Get bet status class
const getBetStatusClass = (status: number) => {
  switch (status) {
    case 0: return 'status-pending'
    case 1: return 'status-settled'
    case 2: return 'status-rollback'
    case 3: return 'status-deleted'
    default: return ''
  }
}

// Current play group for rules
const currentPlayGroup = computed(() => {
  return playGroups.value.find(g => g.id === activeGroupId.value)
})

// Game rule content from play group info
const ruleContent = computed(() => {
  if (!currentPlayGroup.value) return ''
  return currentPlayGroup.value.info || ''
})

// Check if rule content has HTML tags
const ruleIsHtml = computed(() => {
  if (!ruleContent.value) return false
  return /<\/?[a-z][\s\S]*>/i.test(ruleContent.value)
})

// Current play group name
const currentGroupName = computed(() => {
  if (!currentPlayGroup.value) return ''
  return currentPlayGroup.value.name || ''
})

// Get weights array from betMultiplier string
const getWeightsArray = (betMultiplier: string | undefined): number[] => {
  if (!betMultiplier) return []
  return betMultiplier.split(',').map((s) => parseInt(s.trim(), 10) || 1)
}

// Get play weight for weighted all-in
const getPlayWeight = (playName: string, weightsArray: number[], startNum: number, plays: PlayItem[]): number => {
  if (weightsArray.length === 0) return 1
  const playNum = parseInt(playName, 10)
  if (!isNaN(playNum)) {
    const index = playNum - startNum
    if (index >= 0 && index < weightsArray.length) {
      return weightsArray[index]
    }
  }
  const positionIndex = plays.findIndex((p) => p.name === playName)
  if (positionIndex >= 0 && positionIndex < weightsArray.length) {
    return weightsArray[positionIndex]
  }
  return 1
}

// Toggle play selection
const togglePlay = (playItem: PlayItem) => {
  const playName = playItem.name
  if (selectedPlays.value.includes(playName)) {
    selectedPlays.value = selectedPlays.value.filter((p) => p !== playName)
    const newAmounts = { ...playAmounts.value }
    delete newAmounts[playName]
    playAmounts.value = newAmounts
  } else {
    const defaultAmount = playItem.minBetGold || 0
    if (defaultAmount > 0) {
      playAmounts.value = { ...playAmounts.value, [playName]: String(defaultAmount) }
    }
    selectedPlays.value = [...selectedPlays.value, playName]
  }
}

// Update play amount
const updatePlayAmount = (play: string, value: string) => {
  playAmounts.value = { ...playAmounts.value, [play]: value }
  // Auto-select if not selected
  if (!selectedPlays.value.includes(play) && value && parseInt(value, 10) > 0) {
    selectedPlays.value = [...selectedPlays.value, play]
  }
}

// Quick select handler
const handleQuickSelect = (type: string) => {
  if (!activePlayGroup.value) return

  const groupId = activePlayGroup.value.id
  const numericPlays = activePlayGroup.value.plays
    .filter((p) => !isNaN(parseInt(p.name, 10)))
    .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10))

  const exclusiveButtons = [
    '全包', '单', '双', '大单', '小单', '大双', '小双', '单边', '双边',
    '大', '小', '中', '边', '大边', '小边',
    '0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾', '小尾', '大尾',
    '3余0', '3余1', '3余2', '4余0', '4余1', '4余2', '4余3', '5余0', '5余1', '5余2', '5余3', '5余4'
  ]

  // Toggle off if same button clicked
  if (exclusiveButtons.includes(type) && activeQuick.value === type) {
    selectedPlays.value = []
    playAmounts.value = {}
    activeQuick.value = null
    return
  }

  // Get group config based on group ID
  const getGroupConfig = (gId: number) => {
    if ([1, 2, 3, 10, 14, 18, 22].includes(gId)) {
      return { min: 0, max: 27, bigStart: 14, smallEnd: 13, midStart: 10, midEnd: 17, bigEdgeStart: 18, smallEdgeEnd: 9 }
    } else if ([6, 15, 24].includes(gId)) {
      return { min: 3, max: 18, bigStart: 11, smallEnd: 10, midStart: 8, midEnd: 13, bigEdgeStart: 14, smallEdgeEnd: 7 }
    } else if ([5, 16, 23].includes(gId)) {
      return { min: 2, max: 12, bigStart: 7, smallEnd: 6, midStart: 5, midEnd: 9, bigEdgeStart: 10, smallEdgeEnd: 4 }
    } else if ([4, 26].includes(gId)) {
      return { min: 1, max: 10, bigStart: 6, smallEnd: 5, midStart: 4, midEnd: 7, bigEdgeStart: 8, smallEdgeEnd: 3 }
    }
    return null
  }

  const config = getGroupConfig(groupId)
  let newSelected: string[] = []
  let newActiveQuick: string | null = type

  switch (type) {
    case '清空':
      selectedPlays.value = []
      playAmounts.value = {}
      activeQuick.value = null
      return

    case '反选':
      newSelected = activePlayGroup.value.plays.filter((p) => !selectedPlays.value.includes(p.name)).map((p) => p.name)
      newActiveQuick = null
      break

    case '上期':
      fetchPreviousPeriodBets()
      activeQuick.value = null
      return

    case '全包':
      newSelected = activePlayGroup.value.plays.map((p) => p.name)
      break

    case '单':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.max && num % 2 === 1
          })
          .map((p) => p.name)
      }
      break

    case '双':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.max && num % 2 === 0
          })
          .map((p) => p.name)
      }
      break

    case '大单':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.bigStart && num <= config.max && num % 2 === 1
          })
          .map((p) => p.name)
      }
      break

    case '小单':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.smallEnd && num % 2 === 1
          })
          .map((p) => p.name)
      }
      break

    case '大双':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.bigStart && num <= config.max && num % 2 === 0
          })
          .map((p) => p.name)
      }
      break

    case '小双':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.smallEnd && num % 2 === 0
          })
          .map((p) => p.name)
      }
      break

    case '单边':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.max && (num < config.midStart || num > config.midEnd) && num % 2 === 1
          })
          .map((p) => p.name)
      }
      break

    case '双边':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.max && (num < config.midStart || num > config.midEnd) && num % 2 === 0
          })
          .map((p) => p.name)
      }
      break

    case '大':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.bigStart && num <= config.max
          })
          .map((p) => p.name)
      }
      break

    case '小':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.smallEnd
          })
          .map((p) => p.name)
      }
      break

    case '中':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.midStart && num <= config.midEnd
          })
          .map((p) => p.name)
      }
      break

    case '边':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.max && (num < config.midStart || num > config.midEnd)
          })
          .map((p) => p.name)
      }
      break

    case '大边':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.bigEdgeStart && num <= config.max
          })
          .map((p) => p.name)
      }
      break

    case '小边':
      if (config) {
        newSelected = numericPlays
          .filter((p) => {
            const num = parseInt(p.name, 10)
            return num >= config.min && num <= config.smallEdgeEnd
          })
          .map((p) => p.name)
      }
      break

    // Tail selection (0-9)
    case '0尾':
    case '1尾':
    case '2尾':
    case '3尾':
    case '4尾':
    case '5尾':
    case '6尾':
    case '7尾':
    case '8尾':
    case '9尾': {
      const tailNum = parseInt(type.replace('尾', ''), 10)
      newSelected = numericPlays.filter((p) => parseInt(p.name, 10) % 10 === tailNum).map((p) => p.name)
      break
    }

    case '小尾':
      newSelected = numericPlays.filter((p) => parseInt(p.name, 10) % 10 <= 4).map((p) => p.name)
      break

    case '大尾':
      newSelected = numericPlays.filter((p) => parseInt(p.name, 10) % 10 >= 5).map((p) => p.name)
      break

    // Mod selection
    case '3余0':
    case '3余1':
    case '3余2': {
      const mod3Val = parseInt(type.replace('3余', ''), 10)
      newSelected = numericPlays.filter((p) => parseInt(p.name, 10) % 3 === mod3Val).map((p) => p.name)
      break
    }

    case '4余0':
    case '4余1':
    case '4余2':
    case '4余3': {
      const mod4Val = parseInt(type.replace('4余', ''), 10)
      newSelected = numericPlays.filter((p) => parseInt(p.name, 10) % 4 === mod4Val).map((p) => p.name)
      break
    }

    case '5余0':
    case '5余1':
    case '5余2':
    case '5余3':
    case '5余4': {
      const mod5Val = parseInt(type.replace('5余', ''), 10)
      newSelected = numericPlays.filter((p) => parseInt(p.name, 10) % 5 === mod5Val).map((p) => p.name)
      break
    }

    case '梭哈':
      // Call fixed all-in function
      handleFixedAllIn()
      return
  }

  // Set default amounts for new selected plays
  const newAmounts: Record<string, string> = {}
  newSelected.forEach((name) => {
    const playItem = activePlayGroup.value!.plays.find((p) => p.name === name)
    if (playItem && playItem.minBetGold > 0) {
      newAmounts[name] = String(playItem.minBetGold)
    }
  })

  playAmounts.value = newAmounts
  selectedPlays.value = newSelected
  activeQuick.value = newActiveQuick
}

// Handle multiplier select
const handleMultiplierSelect = (multiplier: number) => {
  selectedMultiplier.value = multiplier
  if (selectedPlays.value.length > 0) {
    const newAmounts = { ...playAmounts.value }
    selectedPlays.value.forEach((play) => {
      const currentAmount = parseInt(newAmounts[play] || '0', 10)
      if (currentAmount > 0) {
        newAmounts[play] = String(Math.floor(currentAmount * multiplier))
      }
    })
    playAmounts.value = newAmounts
  }
}

// Handle chip select
const handleChipSelect = (value: number) => {
  quickAmount.value = String(value)
}

// Fixed all-in (定额梭哈)
const handleFixedAllIn = () => {
  if (!quickAmount.value || selectedPlays.value.length === 0 || !activePlayGroup.value) return
  const totalAmount = parseInt(quickAmount.value, 10)
  if (isNaN(totalAmount) || totalAmount <= 0) return

  const weightsArray = getWeightsArray(activePlayGroup.value.betMultiplier)
  const startNum = activePlayGroup.value.startNum || 0
  const plays = activePlayGroup.value.plays || []

  let totalWeight = 0
  const playWeights: Record<string, number> = {}
  selectedPlays.value.forEach((play) => {
    const weight = getPlayWeight(play, weightsArray, startNum, plays)
    playWeights[play] = weight
    totalWeight += weight
  })

  const newAmounts: Record<string, string> = {}
  let allocatedSum = 0
  selectedPlays.value.forEach((play) => {
    const weight = playWeights[play]
    const existingAmount = parseInt(playAmounts.value[play] || '0', 10) || 0
    const allocatedAmount = Math.floor((weight / totalWeight) * totalAmount)
    allocatedSum += allocatedAmount
    newAmounts[play] = String(allocatedAmount + existingAmount)
  })

  // Add remainder to last play
  const remainder = totalAmount - allocatedSum
  if (remainder > 0 && selectedPlays.value.length > 0) {
    const lastPlay = selectedPlays.value[selectedPlays.value.length - 1]
    const currentAmount = parseInt(newAmounts[lastPlay], 10)
    newAmounts[lastPlay] = String(currentAmount + remainder)
  }

  playAmounts.value = newAmounts
}

// Apply custom mode
const handleApplyMode = (mode: ModeItem) => {
  if (!activePlayGroup.value) return

  const betNos = mode.bet_no
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s)
  const betGolds = mode.bet_no_gold
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s)

  const newSelectedPlays: string[] = []
  const newPlayAmounts: Record<string, string> = {}

  betNos.forEach((betNo, index) => {
    const playExists = activePlayGroup.value!.plays.some((p) => p.name === betNo)
    if (playExists) {
      newSelectedPlays.push(betNo)
      if (betGolds[index]) {
        newPlayAmounts[betNo] = betGolds[index]
      }
    }
  })

  selectedPlays.value = newSelectedPlays
  playAmounts.value = newPlayAmounts
  selectedMode.value = mode
}

// Delete custom mode
const handleDeleteMode = async (mode: ModeItem) => {
  if (!confirm(`确定要删除模式 "${mode.mode_name}" 吗？`)) return

  try {
    const res = await setMode({
      id: mode.id,
      status: 0  // 0 = delete
    })
    if (res.code === 200) {
      // Refresh mode list
      await fetchModes()
      // Clear selected mode if it was deleted
      if (selectedMode.value?.id === mode.id) {
        selectedMode.value = null
      }
    } else {
      alert(res.msg || '删除失败')
    }
  } catch (error) {
    console.error('Delete mode error:', error)
    alert('删除模式失败')
  }
}

// Mode edit modal state
const showModeEditModal = ref(false)
const editingMode = ref<ModeItem | null>(null)
const modeFormName = ref('')
const modeEditGroupId = ref(0)
const modeEditPlays = ref<{ id: number; name: string; odds: number; minBetGold: number }[]>([])
const modeSelectedPlays = ref<string[]>([])
const modePlayAmounts = ref<Record<string, string>>({})
const isSavingMode = ref(false)
const isLoadingModePlays = ref(false)
const modeQuickAmount = ref<string>('')

// Auto bet state
const autoTotalExpectNums = ref<string>('1')
const autoMinGold = ref<string>('')
const autoMaxGold = ref<string>('')
const autoSelectedMode = ref<ModeItem | null>(null)
const autoStatus = ref<number>(0)
const existingAuto = ref<AutoItem | null>(null)
const isLoadingAuto = ref(false)
const isSubmittingAuto = ref(false)
const showAutoModeSelector = ref(false)

// Computed total for mode edit
const modeEditTotalAmount = computed(() => {
  return modeSelectedPlays.value.reduce((sum, playName) => {
    return sum + (parseInt(modePlayAmounts.value[playName] || '0', 10) || 0)
  }, 0)
})

// Quick select group IDs for mode edit (same as betting)
const modeQuickSelectGroupIds = [1, 3, 10, 14, 18, 22, 4, 26, 5, 16, 23, 6, 15, 24]

// Check if current mode edit group supports full quick select
const modeShowFullQuickSelect = computed(() => {
  return modeQuickSelectGroupIds.includes(modeEditGroupId.value)
})

// Mode edit betting options (same as betting page)
const modeBettingOptions1 = computed(() => {
  if (modeShowFullQuickSelect.value) {
    return ['单', '大单', '小单', '单边', '双', '大双', '小双', '双边', '大', '小', '中', '边', '大边', '小边', '0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾']
  }
  return []
})

const modeBettingOptions2 = computed(() => {
  if (modeShowFullQuickSelect.value) {
    return ['8尾', '9尾', '小尾', '大尾', '3余0', '3余1', '3余2', '4余0', '4余1', '4余2', '4余3', '5余0', '5余1', '5余2', '5余3', '5余4']
  }
  return []
})

const modeMultiplierOptions = [0.1, 0.5, 0.8, 1.2, 1.5, 2, 10, 30, 50, 100, 200]
const modeActionButtons = ['全包', '反选', '清空']

const modeActiveQuick = ref<string | null>(null)
const modeSelectedMultiplier = ref<number | null>(null)

// Load plays for mode edit based on group id
const loadModeEditPlays = async (groupId: number) => {
  if (!activeGame.value || !groupId) return

  isLoadingModePlays.value = true
  try {
    const res = await playAll({ lottery_id: activeGame.value })
    if (res.code === 200 && res.data?.gamePlayMap) {
      const group = res.data.gamePlayMap.find(g => g.id === groupId)
      if (group && group.children) {
        modeEditPlays.value = group.children.map(p => ({
          id: p.id,
          name: p.name,
          odds: p.multiple || 0,
          minBetGold: p.min_bet_gold || 100
        }))
      } else {
        modeEditPlays.value = []
      }
    }
  } catch (error) {
    console.error('Load mode edit plays error:', error)
    modeEditPlays.value = []
  } finally {
    isLoadingModePlays.value = false
  }
}

// Open mode edit modal
const openModeEditModal = async (mode: ModeItem | null) => {
  editingMode.value = mode

  if (mode) {
    // Editing existing mode
    modeFormName.value = mode.mode_name
    modeEditGroupId.value = mode.game_group_id

    // Load plays for this group
    await loadModeEditPlays(mode.game_group_id)

    // Parse existing bet data and pre-fill
    const betNos = mode.bet_no.split(',').filter(s => s.trim())
    const betGolds = mode.bet_no_gold.split(',').filter(s => s.trim())

    modeSelectedPlays.value = [...betNos]
    const amounts: Record<string, string> = {}
    betNos.forEach((no, idx) => {
      amounts[no] = betGolds[idx] || '0'
    })
    modePlayAmounts.value = amounts
  } else {
    // Creating new mode - use current group
    modeFormName.value = ''
    modeEditGroupId.value = activeGroupId.value || (playGroups.value[0]?.id || 0)
    modeSelectedPlays.value = []
    modePlayAmounts.value = {}

    // Load plays for current group
    if (modeEditGroupId.value) {
      await loadModeEditPlays(modeEditGroupId.value)
    }
  }

  // Reset quick select state
  modeQuickAmount.value = ''
  modeActiveQuick.value = null
  modeSelectedMultiplier.value = null

  showModeEditModal.value = true
}

// Close mode edit modal
const closeModeEditModal = () => {
  showModeEditModal.value = false
  editingMode.value = null
  modeFormName.value = ''
  modeEditGroupId.value = 0
  modeEditPlays.value = []
  modeSelectedPlays.value = []
  modePlayAmounts.value = {}
  modeQuickAmount.value = ''
  modeActiveQuick.value = null
  modeSelectedMultiplier.value = null
}

// Toggle play selection in mode edit
const toggleModePlay = (play: { id: number; name: string; minBetGold: number }) => {
  const playName = play.name
  if (modeSelectedPlays.value.includes(playName)) {
    modeSelectedPlays.value = modeSelectedPlays.value.filter(p => p !== playName)
    const newAmounts = { ...modePlayAmounts.value }
    delete newAmounts[playName]
    modePlayAmounts.value = newAmounts
  } else {
    modeSelectedPlays.value = [...modeSelectedPlays.value, playName]
    modePlayAmounts.value = { ...modePlayAmounts.value, [playName]: String(play.minBetGold || 100) }
  }
}

// Update play amount in mode edit
const updateModePlayAmount = (playName: string, value: string) => {
  modePlayAmounts.value = { ...modePlayAmounts.value, [playName]: value }
}

// Mode edit quick select handler (same logic as betting page)
const handleModeQuickSelect = (type: string) => {
  const groupId = modeEditGroupId.value
  const numericPlays = modeEditPlays.value
    .filter(p => !isNaN(parseInt(p.name, 10)))
    .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10))

  const getGroupConfig = (gId: number) => {
    if ([1, 2, 3, 10, 14, 18, 22].includes(gId)) {
      return { min: 0, max: 27, bigStart: 14, smallEnd: 13, midStart: 10, midEnd: 17, bigEdgeStart: 18, smallEdgeEnd: 9 }
    } else if ([6, 15, 24].includes(gId)) {
      return { min: 3, max: 18, bigStart: 11, smallEnd: 10, midStart: 8, midEnd: 13, bigEdgeStart: 14, smallEdgeEnd: 7 }
    } else if ([5, 16, 23].includes(gId)) {
      return { min: 2, max: 12, bigStart: 7, smallEnd: 6, midStart: 5, midEnd: 9, bigEdgeStart: 10, smallEdgeEnd: 4 }
    } else if ([4, 26].includes(gId)) {
      return { min: 1, max: 10, bigStart: 6, smallEnd: 5, midStart: 4, midEnd: 7, bigEdgeStart: 8, smallEdgeEnd: 3 }
    }
    return null
  }

  const config = getGroupConfig(groupId)
  let newSelected: string[] = []
  let newActiveQuick: string | null = type

  // Handle toggle off
  const exclusiveButtons = ['全包', '单', '双', '大单', '小单', '大双', '小双', '单边', '双边', '大', '小', '中', '边', '大边', '小边',
    '0尾', '1尾', '2尾', '3尾', '4尾', '5尾', '6尾', '7尾', '8尾', '9尾', '小尾', '大尾',
    '3余0', '3余1', '3余2', '4余0', '4余1', '4余2', '4余3', '5余0', '5余1', '5余2', '5余3', '5余4']
  if (exclusiveButtons.includes(type) && modeActiveQuick.value === type) {
    modeSelectedPlays.value = []
    modePlayAmounts.value = {}
    modeActiveQuick.value = null
    return
  }

  switch (type) {
    case '清空':
      modeSelectedPlays.value = []
      modePlayAmounts.value = {}
      modeActiveQuick.value = null
      return
    case '反选':
      newSelected = modeEditPlays.value
        .filter(p => !modeSelectedPlays.value.includes(p.name))
        .map(p => p.name)
      newActiveQuick = null
      break
    case '全包':
      newSelected = modeEditPlays.value.map(p => p.name)
      break
    case '单':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.max && num % 2 === 1
        }).map(p => p.name)
      }
      break
    case '双':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.max && num % 2 === 0
        }).map(p => p.name)
      }
      break
    case '大单':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.bigStart && num <= config.max && num % 2 === 1
        }).map(p => p.name)
      }
      break
    case '小单':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.smallEnd && num % 2 === 1
        }).map(p => p.name)
      }
      break
    case '大双':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.bigStart && num <= config.max && num % 2 === 0
        }).map(p => p.name)
      }
      break
    case '小双':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.smallEnd && num % 2 === 0
        }).map(p => p.name)
      }
      break
    case '单边':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.max && (num < config.midStart || num > config.midEnd) && num % 2 === 1
        }).map(p => p.name)
      }
      break
    case '双边':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.max && (num < config.midStart || num > config.midEnd) && num % 2 === 0
        }).map(p => p.name)
      }
      break
    case '大':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.bigStart && num <= config.max
        }).map(p => p.name)
      }
      break
    case '小':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.smallEnd
        }).map(p => p.name)
      }
      break
    case '中':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.midStart && num <= config.midEnd
        }).map(p => p.name)
      }
      break
    case '边':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.max && (num < config.midStart || num > config.midEnd)
        }).map(p => p.name)
      }
      break
    case '大边':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.bigEdgeStart && num <= config.max
        }).map(p => p.name)
      }
      break
    case '小边':
      if (config) {
        newSelected = numericPlays.filter(p => {
          const num = parseInt(p.name, 10)
          return num >= config.min && num <= config.smallEdgeEnd
        }).map(p => p.name)
      }
      break
    // Tail selection
    case '0尾': case '1尾': case '2尾': case '3尾': case '4尾':
    case '5尾': case '6尾': case '7尾': case '8尾': case '9尾': {
      const tailNum = parseInt(type.replace('尾', ''), 10)
      newSelected = numericPlays.filter(p => parseInt(p.name, 10) % 10 === tailNum).map(p => p.name)
      break
    }
    case '小尾':
      newSelected = numericPlays.filter(p => parseInt(p.name, 10) % 10 <= 4).map(p => p.name)
      break
    case '大尾':
      newSelected = numericPlays.filter(p => parseInt(p.name, 10) % 10 >= 5).map(p => p.name)
      break
    // Mod selection
    case '3余0': case '3余1': case '3余2': {
      const mod3Val = parseInt(type.replace('3余', ''), 10)
      newSelected = numericPlays.filter(p => parseInt(p.name, 10) % 3 === mod3Val).map(p => p.name)
      break
    }
    case '4余0': case '4余1': case '4余2': case '4余3': {
      const mod4Val = parseInt(type.replace('4余', ''), 10)
      newSelected = numericPlays.filter(p => parseInt(p.name, 10) % 4 === mod4Val).map(p => p.name)
      break
    }
    case '5余0': case '5余1': case '5余2': case '5余3': case '5余4': {
      const mod5Val = parseInt(type.replace('5余', ''), 10)
      newSelected = numericPlays.filter(p => parseInt(p.name, 10) % 5 === mod5Val).map(p => p.name)
      break
    }
    default:
      return
  }

  // Set amounts for newly selected plays
  const newAmounts: Record<string, string> = {}
  newSelected.forEach(name => {
    const playItem = modeEditPlays.value.find(p => p.name === name)
    newAmounts[name] = modePlayAmounts.value[name] || String(playItem?.minBetGold || 100)
  })

  modePlayAmounts.value = newAmounts
  modeSelectedPlays.value = newSelected
  modeActiveQuick.value = newActiveQuick
}

// Mode edit multiplier select handler
const handleModeMultiplierSelect = (multiplier: number) => {
  modeSelectedMultiplier.value = multiplier
  if (modeSelectedPlays.value.length > 0) {
    const newAmounts = { ...modePlayAmounts.value }
    modeSelectedPlays.value.forEach(play => {
      const currentAmount = parseInt(newAmounts[play] || '0', 10)
      if (currentAmount > 0) {
        newAmounts[play] = String(Math.floor(currentAmount * multiplier))
      }
    })
    modePlayAmounts.value = newAmounts
  }
}

// Mode edit chip select handler
const handleModeChipSelect = (value: number) => {
  modeQuickAmount.value = String(value)
}

// Mode edit fixed all-in (定额梭哈) - same logic as betting page
const handleModeFixedAllIn = () => {
  if (!modeQuickAmount.value || modeSelectedPlays.value.length === 0) return
  const totalAmount = parseInt(modeQuickAmount.value, 10)
  if (isNaN(totalAmount) || totalAmount <= 0) return

  // Get play group config for weighted calculation
  const groupId = modeEditGroupId.value
  const config = groupConfigMap.value[groupId] || { betMultiplier: '', startNum: 0 }
  const weightsArray = getWeightsArray(config.betMultiplier)
  const startNum = config.startNum

  // Build plays array for getPlayWeight
  const plays = modeEditPlays.value.map(p => ({ id: p.id, name: p.name, odds: p.odds, minBetGold: p.minBetGold }))

  // Calculate weights for selected plays
  let totalWeight = 0
  const playWeights: Record<string, number> = {}
  modeSelectedPlays.value.forEach((playName) => {
    const weight = getPlayWeight(playName, weightsArray, startNum, plays)
    playWeights[playName] = weight
    totalWeight += weight
  })

  // Allocate amounts based on weight (same as betting page)
  const newAmounts: Record<string, string> = {}
  let allocatedSum = 0
  modeSelectedPlays.value.forEach((playName) => {
    const weight = playWeights[playName]
    const existingAmount = parseInt(modePlayAmounts.value[playName] || '0', 10) || 0
    const allocatedAmount = Math.floor((weight / totalWeight) * totalAmount)
    allocatedSum += allocatedAmount
    newAmounts[playName] = String(allocatedAmount + existingAmount)
  })

  // Add remainder to last play
  const remainder = totalAmount - allocatedSum
  if (remainder > 0 && modeSelectedPlays.value.length > 0) {
    const lastPlay = modeSelectedPlays.value[modeSelectedPlays.value.length - 1]
    const currentAmount = parseInt(newAmounts[lastPlay], 10)
    newAmounts[lastPlay] = String(currentAmount + remainder)
  }

  modePlayAmounts.value = newAmounts
}

// Save mode (create or update)
const handleSaveMode = async () => {
  if (!modeFormName.value.trim()) {
    alert('请输入模式名称')
    return
  }

  if (modeSelectedPlays.value.length === 0) {
    alert('请选择至少一个玩法')
    return
  }

  if (modeEditTotalAmount.value <= 0) {
    alert('总金额必须大于0')
    return
  }

  const bet_no = modeSelectedPlays.value.join(',')
  const bet_gold = modeSelectedPlays.value.map(p => modePlayAmounts.value[p] || '0').join(',')
  const lottery_played_id = modeSelectedPlays.value.map(playName => {
    const play = modeEditPlays.value.find(p => p.name === playName)
    return play ? play.id : ''
  }).filter(id => id !== '').join(',')

  const payload = {
    lottery_id: activeGame.value,
    game_group_id: modeEditGroupId.value,
    lottery_played_id,
    bet_no,
    bet_gold,
    total_gold: modeEditTotalAmount.value,
    mode_name: modeFormName.value.trim(),
    mode_id: editingMode.value ? editingMode.value.id : 0,
    status: 1
  }

  try {
    isSavingMode.value = true
    const res = await setMode(payload)
    if (res.code === 200) {
      alert(editingMode.value ? '模式更新成功' : '模式创建成功')
      closeModeEditModal()
      await fetchModes()
    } else {
      alert(res.msg || '保存失败')
    }
  } catch (error) {
    console.error('Save mode error:', error)
    alert('保存模式失败')
  } finally {
    isSavingMode.value = false
  }
}

// ====================== Auto Bet Functions ======================

// Fetch auto config
const fetchAutoConfig = async () => {
  if (!activeGame.value) return

  try {
    isLoadingAuto.value = true
    const res = await autoOne({ lottery_id: activeGame.value })

    if (res.code === 200 && res.data && res.data.id) {
      const auto = res.data
      existingAuto.value = auto
      autoTotalExpectNums.value = String(auto.total_expect_nums || 1)
      autoMinGold.value = String(auto.min_gold || '')
      autoMaxGold.value = String(auto.max_gold || '')
      autoStatus.value = auto.status || 0

      // Set selected mode
      const modeId = auto.mode_id || auto.auto_id
      if (modeId) {
        const mode = customModes.value.find((m) => m.id === modeId)
        if (mode) {
          autoSelectedMode.value = mode
        }
      }
    } else {
      // No existing auto config, use defaults
      existingAuto.value = null
      autoTotalExpectNums.value = '1'
      autoMinGold.value = ''
      autoMaxGold.value = ''
      autoSelectedMode.value = null
      autoStatus.value = 0
    }
  } catch (error) {
    console.error('获取自动配置失败', error)
  } finally {
    isLoadingAuto.value = false
  }
}

// Handle auto submit (start/stop)
const handleAutoSubmit = async (status: number) => {
  if (!activeGame.value) {
    alert('请选择游戏')
    return
  }

  if (!activeGroupId.value) {
    alert('请选择玩法分组')
    return
  }

  if (!autoSelectedMode.value) {
    alert('请选择投注模式')
    return
  }

  const expectNums = parseInt(autoTotalExpectNums.value, 10)
  if (isNaN(expectNums) || expectNums < 1) {
    alert('执行期数最小为1')
    return
  }
  if (expectNums > 1440) {
    alert('执行期数最大为1440')
    return
  }

  const minGoldNum = parseInt(autoMinGold.value, 10) || 0
  const maxGoldNum = parseInt(autoMaxGold.value, 10) || 0

  if (minGoldNum < 0 || maxGoldNum < 0) {
    alert('金币数量不能为负数')
    return
  }

  try {
    isSubmittingAuto.value = true
    const res = await setAuto({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value,
      mode_id: autoSelectedMode.value.id,
      total_expect_nums: expectNums,
      min_gold: minGoldNum,
      max_gold: maxGoldNum,
      status: status
    })

    if (res.code === 200) {
      alert(status === 1 ? '自动投注已启动' : '自动投注已停止')
      autoStatus.value = status
      // Refresh config
      await fetchAutoConfig()
    } else {
      alert(res.msg || '操作失败')
    }
  } catch (error) {
    console.error('操作失败', error)
    alert('操作失败，请重试')
  } finally {
    isSubmittingAuto.value = false
  }
}

// Select auto mode
const handleSelectAutoMode = (mode: ModeItem) => {
  autoSelectedMode.value = mode
  showAutoModeSelector.value = false
}

// ====================== End Auto Bet Functions ======================

// Fetch previous period bets
const fetchPreviousPeriodBets = async () => {
  if (!activeGame.value || !activeGroupId.value || !lastExpectInfo.value?.expect_no) {
    alert('无法获取上期投注记录')
    return
  }

  try {
    const res = await betRecords({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value,
      expect_no: lastExpectInfo.value.expect_no,
      page: 1,
      pageSize: 100
    })

    if (res.code === 200 && res.data) {
      const list = res.data.list || []
      if (list.length === 0) {
        alert('上期没有投注记录')
        return
      }

      const prevBets: Record<string, number> = {}
      list.forEach((record) => {
        const betNoObj = record.bet_no
        if (betNoObj && typeof betNoObj === 'object') {
          const values = Array.isArray(betNoObj) ? betNoObj : Object.values(betNoObj)
          values.forEach((betInfo: BetNoItem) => {
            const playName = betInfo.bet_no
            const betGold = betInfo.bet_gold || 0
            if (playName) {
              prevBets[playName] = (prevBets[playName] || 0) + betGold
            }
          })
        }
      })

      const playNames = Object.keys(prevBets)
      if (playNames.length === 0) {
        alert('上期没有投注记录')
        return
      }

      selectedPlays.value = playNames
      const newAmounts: Record<string, string> = {}
      playNames.forEach((name) => {
        newAmounts[name] = String(prevBets[name])
      })
      playAmounts.value = newAmounts
    } else {
      alert('上期没有投注记录')
    }
  } catch (error) {
    console.error('获取上期投注记录失败', error)
    alert('获取上期投注记录失败')
  }
}

// Fetch my bet records for current period
const fetchMyBetRecordsForPeriod = async (expectNo: string) => {
  if (!activeGame.value || !activeGroupId.value || !expectNo) return

  try {
    const res = await betRecords({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value,
      expect_no: expectNo,
      page: 1,
      pageSize: 100
    })

    if (res.code === 200 && res.data) {
      const betAmountsMap: Record<string, number> = {}
      const list = res.data.list || []

      list.forEach((record) => {
        const betNoObj = record.bet_no
        if (betNoObj && typeof betNoObj === 'object') {
          const values = Array.isArray(betNoObj) ? betNoObj : Object.values(betNoObj)
          values.forEach((betInfo: BetNoItem) => {
            const playName = betInfo.bet_no
            const betGold = betInfo.bet_gold || 0
            if (playName) {
              betAmountsMap[playName] = (betAmountsMap[playName] || 0) + betGold
            }
          })
        }
      })
      myBetAmounts.value = betAmountsMap
    } else {
      myBetAmounts.value = {}
    }
  } catch (error) {
    console.error('获取已投注记录失败', error)
    myBetAmounts.value = {}
  }
}

// Single play amount multiplier
const handleAmountMultiplier = (play: string, multiplier: number) => {
  const currentAmount = parseInt(playAmounts.value[play] || '0', 10)
  const newAmount = Math.max(0, Math.floor(currentAmount * multiplier))
  playAmounts.value = { ...playAmounts.value, [play]: String(newAmount) }
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

// Get trend number color class (for trend chart balls)
const getTrendNumColorClass = (num: number) => {
  if (num >= 0 && num <= 5) return 'ball-green'
  if (num >= 6 && num <= 9) return 'ball-blue'
  if (num >= 10 && num <= 13) return 'ball-red'
  if (num >= 14 && num <= 17) return 'ball-orange'
  if (num >= 18 && num <= 21) return 'ball-purple'
  if (num >= 22 && num <= 27) return 'ball-cyan'
  return 'ball-gray'
}

// Trend chart settings
const trendPageSize = ref(30)
const trendRecords = ref<LotteryResultItem[]>([])
const isLoadingTrend = ref(false)

// Fetch trend data with specific page size
const fetchTrendData = async () => {
  if (!activeGame.value || !activeGroupId.value) return
  isLoadingTrend.value = true
  try {
    const res = await lotteryRecord({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value,
      page: 1,
      pageSize: trendPageSize.value
    })
    if (res.code === 200 && res.data) {
      trendRecords.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取走势数据失败:', error)
  } finally {
    isLoadingTrend.value = false
  }
}

// Change trend page size
const changeTrendPageSize = (size: number) => {
  trendPageSize.value = size
  fetchTrendData()
}

// Trend data computed from trendRecords
const trendData = computed(() => {
  return trendRecords.value
    .filter(record => record.is_opened === 1 && record.final_res)
    .map(record => {
      const finalRes = record.final_res!
      // Get the lottery number - could be in nums or sum
      let num = 0
      if (finalRes.sum !== undefined) {
        num = Number(finalRes.sum)
      } else if (finalRes.nums !== undefined) {
        if (typeof finalRes.nums === 'string') {
          num = Number(finalRes.nums)
        } else if (Array.isArray(finalRes.nums)) {
          num = Number(finalRes.nums[0])
        }
      }

      // Format time - show only time part (HH:MM:SS)
      const openTime = record.open_time || ''
      const timePart = openTime.includes(' ') ? openTime.split(' ')[1] : openTime

      // Calculate tail (尾数) - last digit of the number
      const tail = num % 10

      return {
        expectNo: record.expect_no || '',
        time: timePart,
        num: num,
        bigSmall: finalRes.bigSmall || '-',
        oddEven: finalRes.oddEven || '-',
        tailBigSmall: finalRes.tailBigSmall || '-',
        middleSide: finalRes.middleSide || '-',
        tail: finalRes.tail !== undefined ? finalRes.tail : tail,
        mod3: finalRes.mod3 !== undefined ? finalRes.mod3 : (num % 3),
        mod4: finalRes.mod4 !== undefined ? finalRes.mod4 : (num % 4),
        mod5: finalRes.mod5 !== undefined ? finalRes.mod5 : (num % 5)
      }
    })
})

// All games from API (flattened, no categories)
const allGames = ref<{ id: number; name: string; logo?: string; colorClass: string }[]>([])

// Play method groups from API
const playGroups = ref<{ id: number; name: string; info?: string; reward_num?: number; start_num?: number; game_type?: number }[]>([])

// Group config map for betMultiplier and startNum (used by mode edit 定额梭哈)
const groupConfigMap = ref<Record<number, { betMultiplier: string; startNum: number }>>({})

const activeGame = ref(0)
const activeGroupId = ref(0)
const activePanel = ref('drawtb')

// Sound notification enabled
const soundEnabled = ref(true)

// Random seed for ranking calculation (fixed per page load)
const randomSeed = ref(Math.random())

// Today's ranking - calculated based on betting data
const todayRanking = computed(() => {
  const betCount = profitLossSummary.value.bet_count
  const profit = profitLossSummary.value.profit
  const betGold = profitLossSummary.value.bet_gold

  if (betCount === 0) {
    return Math.floor(randomSeed.value * 5000) + 5000
  }

  const profitRate = betGold > 0 ? profit / betGold : 0

  let baseRank: number
  if (profitRate > 0) {
    baseRank = Math.max(1, Math.floor(2000 - profitRate * 1000))
  } else if (profitRate === 0) {
    baseRank = Math.floor(randomSeed.value * 3000) + 2000
  } else {
    baseRank = Math.min(10000, Math.floor(5000 - profitRate * 2000))
  }

  const betBonus = Math.min(500, betCount * 10)
  return Math.max(1, baseRank - betBonus)
})

// Toggle sound notification
const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
}

// Refresh page
const refreshPage = () => {
  window.location.reload()
}

// Play notification sound when result comes in
const playResultSound = () => {
  if (!soundEnabled.value) return
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const audioContext = new AudioContextClass()

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    oscillator.frequency.value = 880
    oscillator.type = 'sine'
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (e) {
    console.error('播放声音失败:', e)
  }
}

const gameInfo = ref({
  period: '',
  gameName: ''
})

// Get current game's color class for logo
const currentGameColorClass = computed(() => {
  const game = allGames.value.find(g => g.id === activeGame.value)
  return game?.colorClass || 'system'
})

// Countdown status: 'betting' | 'closing' | 'drawing'
const countdownStatus = computed(() => {
  if (countdown.value.stop > 0) return 'betting'
  if (countdown.value.draw > 0) return 'closing'
  return 'drawing'
})

// Countdown display text
const countdownText = computed(() => {
  if (countdownStatus.value === 'betting') {
    return `距封盘 ${countdown.value.stop} 秒`
  } else if (countdownStatus.value === 'closing') {
    return `距开奖 ${countdown.value.draw} 秒`
  }
  return '正在开奖中...'
})

// Whether the game is currently drawing
const isDrawing = computed(() => countdownStatus.value === 'drawing')

// Current and last expect info
const currExpectInfo = ref<ExpectInfo | null>(null)
const lastExpectInfo = ref<ExpectInfo | null>(null)

// Lottery records from API
const lotteryRecords = ref<LotteryResultItem[]>([])

// Bet records from API
const myBetRecords = ref<BetRecordItem[]>([])

// Profit loss data from API
const profitLossData = ref<ProfitLossItem[]>([])

// Profit loss summary for info bar
const profitLossSummary = ref({
  bet_count: 0,
  bet_gold: 0,
  win_gold: 0,
  profit: 0
})

// Win rate calculation
const winRate = computed(() => {
  if (profitLossSummary.value.bet_count === 0) return '0%'
  const rate = profitLossSummary.value.win_gold / profitLossSummary.value.bet_gold * 100
  return isNaN(rate) ? '0%' : rate.toFixed(1) + '%'
})

// Pagination for lottery records
const currentPage = ref(1)
const pageSize = ref(15)
const hasMore = ref(true)

// Pagination for my bet records
const betCurrentPage = ref(1)
const betPageSize = ref(15)
const betHasMore = ref(true)

// Pagination for profit/loss records
const profitCurrentPage = ref(1)
const profitPageSize = ref(15)
const profitHasMore = ref(true)

// Timer for countdown
let countdownTimer: ReturnType<typeof setInterval> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null

// Pool base
// 生成更真实的奖池金额
const getPoolBase = () => {
  const baseNum = 5738500000
  const randomPart = Math.floor(Math.random() * 100000)
  return baseNum + randomPart
}
const poolBase = getPoolBase()

// 根据期号生成伪随机数（相同期号总是返回相同的值，刷新不变）
const getSeededRandom = (expectNo: string, salt: number = 0) => {
  let seed = salt
  for (let i = 0; i < expectNo.length; i++) {
    seed += expectNo.charCodeAt(i) * (i + 1)
  }
  return ((seed * 9301 + 49297) % 233280) / 233280
}

// 根据期号生成稳定的奖池变化（已开奖记录，刷新不变）
const getPoolVariation = (expectNo: string, index: number) => {
  const variation = getSeededRandom(expectNo, 1)
  // 基于种子生成随机变化量（-500万 到 +500万）
  const baseVariation = Math.floor((variation - 0.5) * 10000000)
  // 加入一些基于index的递增/递减趋势，让奖池看起来有涨跌
  const trendVariation = (index % 5 - 2) * Math.floor(variation * 500000)
  return baseVariation + trendVariation
}

// 获取已开奖记录的奖池值（固定不变，基于期号确定）
const getFixedPool = (expectNo: string, baseValue: number) => {
  const variation = getSeededRandom(expectNo, 3)
  // 添加基于期号的固定增量（0-50000）
  const fixedIncrement = Math.floor(variation * 50000)
  return baseValue + fixedIncrement
}

// 根据奖池大小生成已开奖记录的参与人数（固定不变，最少300人起）
const getFixedJoinCount = (expectNo: string, poolValue: number, baseJoinCount: number) => {
  const variation = getSeededRandom(expectNo, 2)
  // 基础人数300-600之间
  const baseMin = 300 + Math.floor(variation * 300)
  // 基于奖池计算额外参与人数（奖池越大，人数越多）
  const poolBasedCount = Math.floor(poolValue / 100000000 * variation * 50)
  // 基础人数 + 奖池关联人数 + 原始数据
  return baseMin + poolBasedCount + Math.max(0, baseJoinCount)
}

// 当前期的奖池缓存（只增不减）
const currentPeriodPoolCache = ref<number>(0)
const currentPeriodJoinCache = ref<number>(0)
const lastTrackedPeriod = ref<string>('')  // 用于跟踪期号变化

// 已结束期号的奖池和参与数缓存（用于保持开奖前后数值一致）
const finishedPeriodCache = ref<Map<string, { pool: number; joinCount: number }>>(new Map())

// 获取当前期的奖池值（只增不减）
const getCurrentPeriodPool = (baseValue: number) => {
  const increment = Math.floor(Math.random() * 50000)
  const newValue = baseValue + increment
  if (currentPeriodPoolCache.value > 0) {
    const finalValue = Math.max(currentPeriodPoolCache.value, newValue)
    currentPeriodPoolCache.value = finalValue
    return finalValue
  }
  currentPeriodPoolCache.value = newValue
  return newValue
}

// 获取当前期的参与人数（只增不减，最少300人起）
const getCurrentPeriodJoinCount = (poolValue: number, baseJoinCount: number) => {
  const variation = Math.random()
  // 基础人数300-600之间
  const baseMin = 300 + Math.floor(variation * 300)
  // 基于奖池计算额外参与人数
  const poolBasedCount = Math.floor(poolValue / 100000000 * variation * 50)
  const baseCount = baseMin + poolBasedCount + Math.max(0, baseJoinCount)
  const increment = Math.floor(Math.random() * 15)
  const newValue = baseCount + increment
  if (currentPeriodJoinCache.value > 0) {
    const finalValue = Math.max(currentPeriodJoinCache.value, newValue)
    currentPeriodJoinCache.value = finalValue
    return finalValue
  }
  currentPeriodJoinCache.value = newValue
  return newValue
}

// Current period row (from expectInfo) - shown at top of list
const currentPeriodRow = computed(() => {
  if (!currExpectInfo.value) return null

  let status: string
  if (countdown.value.stop > 0) {
    status = 'betting'
  } else if (countdown.value.draw > 0) {
    status = 'drawing'
  } else {
    status = 'waiting'
  }

  // 当前期奖池和参与人数：投注期间动态增加，封盘后固定不变
  let currentPoolValue: number
  let currentJoinCount: number

  if (status === 'betting') {
    // 投注期间：动态增加（只增不减）
    currentPoolValue = getCurrentPeriodPool(poolBase)
    currentJoinCount = getCurrentPeriodJoinCount(currentPoolValue, 100)
  } else {
    // 封盘后：使用缓存的固定值
    currentPoolValue = currentPeriodPoolCache.value > 0 ? currentPeriodPoolCache.value : poolBase
    currentJoinCount = currentPeriodJoinCache.value > 0 ? currentPeriodJoinCache.value : 100
  }

  return {
    no: currExpectInfo.value.expect_no || '',
    date: currExpectInfo.value.action_time || '',
    nums: null,
    result: null,
    finalResRecord: '',
    calcResult: null,
    resultAttrs: [] as string[],
    specialResultText: '',
    zoneDigits: null as number[] | null,  // 特殊分组从finalResRecord解析的区位数字
    pool: currentPoolValue.toLocaleString(),
    winGold: '-',
    joinCount: currentJoinCount,
    betGold: '-',
    myWin: 0,
    status,
    isCurrent: true
  }
})

// Computed draw history from lottery records (only opened records)
const drawHistory = computed(() => {
  const openedRecords = lotteryRecords.value.filter(record => record.is_opened === 1)
  const currentGame = allGames.value.find(g => g.id === activeGame.value)
  const group = playGroups.value.find(g => g.id === activeGroupId.value)

  const historyList = openedRecords.map(record => {
    const finalRes = record.final_res
    let nums: number[] | null = null
    let result: number | null = null

    if (finalRes && finalRes.nums) {
      if (typeof finalRes.nums === 'string') {
        nums = finalRes.nums.split(',').map(n => parseInt(n.trim(), 10))
      } else if (Array.isArray(finalRes.nums)) {
        nums = finalRes.nums.map(n => parseInt(String(n), 10))
      } else if (typeof finalRes.nums === 'object') {
        nums = Object.values(finalRes.nums).map(n => parseInt(String(n), 10))
      }

      if (finalRes.sum !== undefined) {
        result = typeof finalRes.sum === 'string' ? parseInt(finalRes.sum, 10) : finalRes.sum
      } else if (nums) {
        result = nums.reduce((a, b) => a + b, 0)
      }
    }

    const memberBet = Array.isArray(record.memberBet) ? record.memberBet[0] : record.memberBet
    const myWin = memberBet?.win_gold || 0

    // 奖池金额和参与人数：优先使用缓存值（保持开奖前后一致），否则使用固定算法
    const expectNo = record.expect_no || ''
    const cachedValues = finishedPeriodCache.value.get(expectNo)

    let poolValue: number
    let joinCount: number

    if (cachedValues) {
      // 使用缓存的值（该期开奖前显示的值）
      poolValue = cachedValues.pool
      joinCount = cachedValues.joinCount
    } else {
      // 没有缓存时使用固定算法（刷新页面后或历史记录）
      const recordIndex = openedRecords.indexOf(record)
      const poolVariation = getPoolVariation(expectNo, recordIndex)
      const basePoolValue = Math.max(poolBase + (record.user_bet_gold || 0) + poolVariation, poolBase * 0.8)
      poolValue = getFixedPool(expectNo, basePoolValue)

      const baseJoinCount = (record.all_hand_person_num || 0) + (record.win_auto_person_num || 0) + (record.win_auto_robot_num || 0)
      joinCount = getFixedJoinCount(expectNo, poolValue, baseJoinCount)
    }
    const winGold = record.user_bet_win_gold || 0
    const betGold = record.bet_gold || 0

    // 计算区位结果用于列表显示
    let calcResult: { n1: number; n2: number; n3: number; total: number; zoneCount: number } | null = null
    if (record.action_no_sort) {
      const calcData = calculateVerifyFromActionNo(
        record.action_no_sort,
        group?.id || 0,
        group?.info || '',
        group?.reward_num || 28,
        group?.game_type || 0,
        currentGame?.name || '',
        activeGame.value
      )
      if (calcData) {
        calcResult = {
          n1: calcData.n1,
          n2: calcData.n2,
          n3: calcData.n3,
          total: calcData.total,
          zoneCount: calcData.zoneCount
        }
      }
    }

    // 解析finalResRecord获取属性（如 "14|大双" -> { sum: 14, attrs: "大双" }）
    // 特殊分组（号码形态）的格式是 "n1,n2,n3 | 结果文本"，如 "1,4,9 | 杂六"
    const finalResRecord = finalRes?.finalResRecord || ''
    let resultAttrs: string[] = []
    let specialResultText = ''  // 特殊分组的结果文本（如"半顺"、"杂六"、"虎"、"小单"）
    let zoneDigits: number[] | null = null  // 特殊分组从finalResRecord解析的区位数字

    // 判断当前分组是否是特殊分组
    const isSpecialGroup = group && isSpecialPlayGroup(group.name)

    if (finalResRecord) {
      const pipeIndex = finalResRecord.indexOf('|')
      if (pipeIndex !== -1) {
        const beforePipe = finalResRecord.substring(0, pipeIndex).trim()
        const attrsStr = finalResRecord.substring(pipeIndex + 1).trim()
        // 保存特殊分组的完整结果文本
        specialResultText = attrsStr

        // 对于特殊分组，解析区位数字（格式如 "1,4,9" 或 "1+4+9"）
        if (isSpecialGroup && beforePipe) {
          // 尝试解析逗号分隔的数字
          const digitParts = beforePipe.split(/[,+]/).map(s => s.trim())
          const parsedDigits = digitParts.map(s => parseInt(s, 10)).filter(n => !isNaN(n))
          if (parsedDigits.length >= 2 && parsedDigits.length <= 3) {
            zoneDigits = parsedDigits
          }
        }

        // 将属性字符串拆分成单个属性（如 "大双" -> ["大", "双"]）
        resultAttrs = attrsStr.split('').filter(c => c.trim())
        // 如果是两个字符一组的情况（如"小单"），保持原样
        if (attrsStr.length >= 2 && !attrsStr.includes(' ')) {
          resultAttrs = []
          for (let i = 0; i < attrsStr.length; i++) {
            resultAttrs.push(attrsStr[i])
          }
        }
      } else {
        // 没有 | 的情况，整个字符串就是结果
        specialResultText = finalResRecord
      }
    }

    return {
      no: record.expect_no || '',
      date: record.open_time || record.created_at || '',
      nums,
      result,
      finalResRecord,
      calcResult,
      resultAttrs,
      specialResultText,
      zoneDigits,  // 特殊分组从finalResRecord解析的区位数字
      pool: poolValue.toLocaleString(),
      winGold: winGold.toLocaleString(),
      joinCount,
      betGold: betGold.toLocaleString(),
      myWin,
      status: 'ended',
      isCurrent: false
    }
  })

  if (currentPeriodRow.value) {
    return [currentPeriodRow.value, ...historyList]
  }
  return historyList
})

// Map category ID to color class
const getCategoryColorClass = (categoryId: number, categoryTitle: string): string => {
  const title = categoryTitle.toLowerCase()
  if (title.includes('幸运')) return 'system'
  if (title.includes('宾果')) return 'bg'
  if (title.includes('比特')) return 'btc'
  if (title.includes('加拿大')) return 'jnd'
  if (title.includes('韩国')) return 'hanguo'
  if (title.includes('蛋蛋')) return 'qlq'
  if (title.includes('美国')) return 'feit'
  if (title.includes('秒开')) return 'shasec'
  return 'system'
}

// Fetch all games from API (flattened)
const fetchAllGames = async () => {
  isLoadingGames.value = true
  try {
    const res = await gameAll()
    if (res.code === 200 && res.data) {
      const { gameTypeMap = [] } = res.data

      const games: { id: number; name: string; logo?: string; colorClass: string }[] = []
      gameTypeMap.forEach((typeItem: GameTypeMapItem) => {
        const colorClass = getCategoryColorClass(typeItem.id, typeItem.title || '')
        if (typeItem.children && Array.isArray(typeItem.children)) {
          typeItem.children.forEach((game: Game) => {
            if (game.is_show === undefined || game.is_show === 1) {
              games.push({
                id: game.id,
                name: game.name,
                logo: game.logo,
                colorClass
              })
            }
          })
        }
      })

      allGames.value = games

      if (games.length > 0) {
        activeGame.value = games[0].id
        gameInfo.value.gameName = games[0].name
        await fetchPlayGroups(games[0].id)
        await fetchProfitLossData()
      }
    }
  } catch (error) {
    console.error('获取游戏列表失败:', error)
  } finally {
    isLoadingGames.value = false
  }
}

// Fetch play method groups for a game
const fetchPlayGroups = async (lotteryId: number) => {
  isLoadingPlays.value = true
  try {
    const res = await playAll({ lottery_id: lotteryId })
    if (res.code === 200 && res.data) {
      const { groupArr = [] } = res.data
      playGroups.value = groupArr
        .filter((group: any) => group.status === 1)
        .map((group: any) => ({
          id: group.id,
          name: group.name,
          info: group.info,
          reward_num: group.reward_num,
          start_num: group.start_num,
          game_type: group.game_type
        }))

      if (playGroups.value.length > 0) {
        activeGroupId.value = playGroups.value[0].id

        const promises: Promise<void>[] = [
          fetchLotteryRecords(1),
          fetchExpectInfoData()
        ]

        // If betting panel is open, also refresh play methods and modes
        if (showBettingPanel.value) {
          promises.push(fetchPlayMethodsForBetting())
          promises.push(fetchModes())
        }

        await Promise.all(promises)
      }
    }
  } catch (error) {
    console.error('获取玩法分组失败:', error)
  } finally {
    isLoadingPlays.value = false
  }
}

// Fetch lottery records
const fetchLotteryRecords = async (page: number = 1) => {
  if (!activeGame.value || !activeGroupId.value) return
  isLoadingRecords.value = true
  try {
    const res = await lotteryRecord({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value,
      page: page,
      pageSize: pageSize.value
    })
    if (res.code === 200 && res.data) {
      const list = res.data.list || []
      lotteryRecords.value = list
      currentPage.value = page
      hasMore.value = list.length >= pageSize.value
    }
  } catch (error) {
    console.error('获取开奖记录失败:', error)
  } finally {
    isLoadingRecords.value = false
  }
}

// Pagination
const prevPage = () => {
  if (currentPage.value > 1) {
    fetchLotteryRecords(currentPage.value - 1)
  }
}

const nextPage = () => {
  if (hasMore.value) {
    fetchLotteryRecords(currentPage.value + 1)
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page !== currentPage.value) {
    fetchLotteryRecords(page)
  }
}

const visiblePages = computed(() => {
  const current = currentPage.value
  const pages: number[] = []

  const start = Math.max(1, current - 2)
  const end = current + 2

  for (let i = start; i <= end; i++) {
    if (i <= current || (i === current + 1 && hasMore.value)) {
      pages.push(i)
    }
  }

  return pages
})

// Fetch expect info (current period and countdown)
const fetchExpectInfoData = async () => {
  if (!activeGame.value || !activeGroupId.value) return
  try {
    const res = await fetchExpectInfo({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value
    })
    if (res.code === 200 && res.data) {
      const newExpectNo = res.data.currExpectInfo?.expect_no || ''

      // 期号变化时：先保存旧期号的缓存值，再重置
      if (newExpectNo && newExpectNo !== lastTrackedPeriod.value) {
        // 保存旧期号的奖池和参与数到缓存（开奖后显示时使用）
        if (lastTrackedPeriod.value && currentPeriodPoolCache.value > 0) {
          finishedPeriodCache.value.set(lastTrackedPeriod.value, {
            pool: currentPeriodPoolCache.value,
            joinCount: currentPeriodJoinCache.value
          })
        }
        // 重置当前期缓存
        currentPeriodPoolCache.value = 0
        currentPeriodJoinCache.value = 0
        lastTrackedPeriod.value = newExpectNo
      }

      currExpectInfo.value = res.data.currExpectInfo || null
      lastExpectInfo.value = res.data.lastExpectInfo || null

      if (currExpectInfo.value) {
        gameInfo.value.period = currExpectInfo.value.expect_no || ''
        countdown.value = {
          stop: currExpectInfo.value.close_countdown || 0,
          draw: currExpectInfo.value.open_countdown || 0
        }
      }
    }
  } catch (error) {
    console.error('获取期号信息失败:', error)
  }
}

// Fetch my bet records
const fetchMyBetRecords = async (page: number = 1) => {
  if (!activeGame.value || !activeGroupId.value) return
  isLoadingBetRecords.value = true
  try {
    const res = await betRecords({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value,
      page: page,
      pageSize: betPageSize.value
    })
    if (res.code === 200 && res.data) {
      const list = res.data.list || []
      myBetRecords.value = list
      betCurrentPage.value = page
      betHasMore.value = list.length >= betPageSize.value
    }
  } catch (error) {
    console.error('获取投注记录失败:', error)
  } finally {
    isLoadingBetRecords.value = false
  }
}

// My bet pagination
const betPrevPage = () => {
  if (betCurrentPage.value > 1) {
    fetchMyBetRecords(betCurrentPage.value - 1)
  }
}

const betNextPage = () => {
  if (betHasMore.value) {
    fetchMyBetRecords(betCurrentPage.value + 1)
  }
}

const betGoToPage = (page: number) => {
  if (page >= 1 && page !== betCurrentPage.value) {
    fetchMyBetRecords(page)
  }
}

const betVisiblePages = computed(() => {
  const current = betCurrentPage.value
  const pages: number[] = []
  const start = Math.max(1, current - 2)
  const end = current + 2
  for (let i = start; i <= end; i++) {
    if (i <= current || (i === current + 1 && betHasMore.value)) {
      pages.push(i)
    }
  }
  return pages
})

// Fetch modes
const fetchModes = async () => {
  if (!activeGame.value || !activeGroupId.value) return
  isLoadingModes.value = true
  try {
    const res = await modeList({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value,
      page: 1,
      pageSize: 100
    })
    if (res.code === 200 && res.data) {
      customModes.value = res.data.list || []
    }
  } catch (error) {
    console.error('获取模式列表失败:', error)
  } finally {
    isLoadingModes.value = false
  }
}

// Fetch profit loss data and summary for info bar
const fetchProfitLossData = async (resetPage = false) => {
  if (!activeGame.value) return
  if (resetPage) {
    profitCurrentPage.value = 1
  }
  isLoadingProfitLoss.value = true
  try {
    const res = await profitLoss({
      lottery_id: activeGame.value,
      game_group_id: activeGroupId.value || 0,
      page: profitCurrentPage.value,
      pageSize: profitPageSize.value
    })
    if (res.code === 200 && res.data) {
      profitLossData.value = res.data.list || []
      profitHasMore.value = profitLossData.value.length >= profitPageSize.value
      const summary = (res.data.summary || res.data) as Record<string, unknown>
      if (summary) {
        profitLossSummary.value = {
          bet_count: Number(summary.bet_count) || 0,
          bet_gold: Number(summary.bet_gold) || 0,
          win_gold: Number(summary.win_gold) || 0,
          profit: Number(summary.profit) || 0
        }
      }
    }
  } catch (error) {
    console.error('获取盈亏数据失败:', error)
  } finally {
    isLoadingProfitLoss.value = false
  }
}

// Profit/loss pagination navigation
const profitPrevPage = () => {
  if (profitCurrentPage.value > 1) {
    profitCurrentPage.value--
    fetchProfitLossData()
  }
}

const profitNextPage = () => {
  if (profitHasMore.value) {
    profitCurrentPage.value++
    fetchProfitLossData()
  }
}

const profitGoToPage = (page: number) => {
  profitCurrentPage.value = page
  fetchProfitLossData()
}

const profitVisiblePages = computed(() => {
  const current = profitCurrentPage.value
  const pages: number[] = []
  const start = Math.max(1, current - 2)
  const end = current + 2
  for (let i = start; i <= end; i++) {
    if (i <= current || (i === current + 1 && profitHasMore.value)) {
      pages.push(i)
    }
  }
  return pages
})

// Fetch ranking data - 同时获取三个榜单
const fetchRankData = async () => {
  isLoadingRank.value = true
  rankDataToday.value = []
  rankDataYesterday.value = []
  rankDataWeek.value = []

  // 分别获取三个榜单，单个失败不影响其他
  const fetchWithFallback = async <T>(fetchFn: () => Promise<HttpRes<T[]>>): Promise<T[]> => {
    try {
      const res = await fetchFn()
      if (res.code === 200 && res.data) {
        return res.data
      }
    } catch (error) {
      console.error('获取排行数据失败:', error)
    }
    return []
  }

  try {
    const [todayData, yesterdayData, weekData] = await Promise.all([
      fetchWithFallback(rankToday),
      fetchWithFallback(rankYesterday),
      fetchWithFallback(rankWeek)
    ])
    rankDataToday.value = todayData as RankTodayField[]
    rankDataYesterday.value = yesterdayData as RankTodayField[]
    rankDataWeek.value = weekData as RankWeekField[]
  } finally {
    isLoadingRank.value = false
  }
}

// Get medal class for ranking
const getMedalClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'medal-gold'
    case 2:
      return 'medal-silver'
    case 3:
      return 'medal-bronze'
    default:
      return 'medal-normal'
  }
}

// Select a game
const selectGame = async (gameId: number) => {
  activeGame.value = gameId
  const game = allGames.value.find(g => g.id === gameId)
  if (game) {
    gameInfo.value.gameName = game.name
  }

  // Clear betting panel state when switching games
  selectedPlays.value = []
  playAmounts.value = {}
  activeQuick.value = null
  selectedMode.value = null
  activePlayGroup.value = null

  await fetchPlayGroups(gameId)
  await fetchProfitLossData(true)

  // Refresh data based on current active panel
  if (activePanel.value === 'mybet') {
    await fetchMyBetRecords()
  } else if (activePanel.value === 'mymodes') {
    await fetchModes()
  } else if (activePanel.value === 'myauto') {
    await fetchModes()
    await fetchAutoConfig()
  } else if (activePanel.value === 'trend') {
    await fetchTrendData()
  }
}

// Select a play group
const selectGroup = async (groupId: number) => {
  activeGroupId.value = groupId

  // Clear selected plays and amounts when switching groups
  selectedPlays.value = []
  playAmounts.value = {}
  activeQuick.value = null
  selectedMode.value = null

  // Fetch data for the new group
  const promises: Promise<void>[] = [
    fetchLotteryRecords(1),
    fetchExpectInfoData(),
    fetchProfitLossData(true)
  ]

  // If betting panel is open, also refresh play methods and modes
  if (showBettingPanel.value) {
    promises.push(fetchPlayMethodsForBetting())
    promises.push(fetchModes())
  }

  // Refresh data based on current active panel
  if (activePanel.value === 'mybet') {
    promises.push(fetchMyBetRecords())
  } else if (activePanel.value === 'mymodes') {
    promises.push(fetchModes())
  } else if (activePanel.value === 'myauto') {
    promises.push(fetchModes())
    promises.push(fetchAutoConfig())
  } else if (activePanel.value === 'trend') {
    promises.push(fetchTrendData())
  }

  await Promise.all(promises)
}

// Set active panel
const setActivePanel = async (panel: string) => {
  activePanel.value = panel

  // Close betting panel when switching to any other tab
  if (showBettingPanel.value) {
    closeBettingPanel()
  }

  if (panel === 'mybet') {
    await fetchMyBetRecords()
  } else if (panel === 'mymodes') {
    await fetchModes()
  } else if (panel === 'myauto') {
    await fetchModes() // Need modes list for selection
    await fetchAutoConfig()
  } else if (panel === 'weekgain') {
    await fetchProfitLossData(true)
  } else if (panel === 'trend') {
    await fetchTrendData()
  } else if (panel === 'ranking') {
    await fetchRankData()
  }
}

// Open betting panel
const openBettingPanel = async (periodNo: string) => {
  currentBettingPeriod.value = periodNo
  showBettingPanel.value = true

  // Reset betting state
  selectedPlays.value = []
  playAmounts.value = {}
  activeQuick.value = null
  selectedMode.value = null

  // Fetch play methods for current group
  await fetchPlayMethodsForBetting()

  // Fetch custom modes list
  await fetchModes()

  // Fetch my bet records for current period
  if (currExpectInfo.value?.expect_no) {
    await fetchMyBetRecordsForPeriod(currExpectInfo.value.expect_no)
  }
}

// Fetch play methods for betting panel
const fetchPlayMethodsForBetting = async () => {
  if (!activeGame.value) return

  try {
    const res = await playAll({ lottery_id: activeGame.value })

    if (res.code === 200 && res.data) {
      const { gamePlayMap = [], groupArr = [] } = res.data

      // Build and save group config map for betMultiplier/startNum
      const configMap: Record<number, { betMultiplier: string; startNum: number }> = {}
      groupArr.forEach((g: any) => {
        configMap[g.id] = {
          betMultiplier: g.bet_multiplier || '',
          startNum: g.start_num || 0
        }
      })
      groupConfigMap.value = configMap

      const mapItem = gamePlayMap.find((item: GamePlayMapItem) => item.id === activeGroupId.value)
      if (mapItem) {
        const config = configMap[mapItem.id] || { betMultiplier: '', startNum: 0 }
        activePlayGroup.value = {
          id: mapItem.id,
          name: mapItem.name,
          lang_name: mapItem.lang_name,
          betMultiplier: config.betMultiplier,
          startNum: config.startNum,
          plays: (mapItem.children || []).map((play: GamePlay) => ({
            id: play.id,
            name: play.name,
            lang_name: play.lang_name,
            odds: play.multiple || 0,
            minBetGold: play.min_bet_gold || 0
          }))
        }
      }
    }
  } catch (error) {
    console.error('获取玩法列表失败', error)
  }
}

// Close betting panel
const closeBettingPanel = () => {
  showBettingPanel.value = false
  selectedPlays.value = []
  playAmounts.value = {}
  activeQuick.value = null
}

// Submit bet
const submitBet = async () => {
  if (!activePlayGroup.value) {
    alert('请选择玩法分组')
    return
  }

  const bet_expect_no = currExpectInfo.value?.expect_no || ''
  const game_group_id = activePlayGroup.value.id
  const bet_no = selectedPlays.value.join(',')
  const bet_gold = selectedPlays.value.map((p) => playAmounts.value[p] || '0').join(',')
  const lottery_played_id = selectedPlays.value
    .map((playName) => {
      const playItem = activePlayGroup.value!.plays.find((item) => item.name === playName)
      return playItem ? playItem.id : ''
    })
    .filter((id) => id !== '')
    .join(',')
  const total_gold = totalBetAmount.value

  if (!bet_expect_no) {
    alert('期号信息获取失败')
    return
  }
  if (total_gold <= 0) {
    alert('请输入投注金额')
    return
  }
  if (countdown.value.stop <= 0) {
    alert('已封盘，无法投注')
    return
  }

  const payload = {
    game_group_id: String(game_group_id),
    lottery_id: String(activeGame.value),
    bet_no,
    bet_expect_no,
    bet_gold,
    lottery_played_id,
    total_gold
  }

  try {
    isSubmitting.value = true
    const res = await betGame(payload)
    if (res.code === 200) {
      alert('投注成功')

      const updated = { ...myBetAmounts.value }
      selectedPlays.value.forEach((playName) => {
        const betAmount = parseInt(playAmounts.value[playName] || '0', 10) || 0
        if (betAmount > 0) {
          updated[playName] = (updated[playName] || 0) + betAmount
        }
      })
      myBetAmounts.value = updated

      selectedPlays.value = []
      playAmounts.value = {}
      activeQuick.value = null
    } else {
      alert(res.message || '投注失败')
    }
  } catch (error) {
    console.error('投注失败：', error)
    alert('投注失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// Cancel bet
const handleCancel = () => {
  selectedPlays.value = []
  playAmounts.value = {}
  activeQuick.value = null
}

// Flag to prevent multiple API calls when drawing
const isWaitingForResult = ref(false)

// Start countdown timer
const startCountdownTimer = () => {
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(async () => {
    if (countdown.value.stop > 0) {
      countdown.value.stop--
    } else if (countdown.value.draw > 0) {
      countdown.value.draw--
    } else if (!isWaitingForResult.value) {
      isWaitingForResult.value = true
      startResultPolling()
    }
  }, 1000)
}

// Poll for result when drawing
const startResultPolling = () => {
  if (pollTimer) clearInterval(pollTimer)

  const pollForResult = async () => {
    const oldPeriod = gameInfo.value.period
    await fetchExpectInfoData()

    if (gameInfo.value.period !== oldPeriod) {
      if (pollTimer) clearInterval(pollTimer)
      isWaitingForResult.value = false
      playResultSound()
      await fetchLotteryRecords(1)
    }
  }

  pollTimer = setInterval(pollForResult, 2000)
  pollForResult()
}

// Left/Right columns for PC layout
const leftPlays = computed(() => {
  if (!activePlayGroup.value) return []
  const plays = activePlayGroup.value.plays
  const half = Math.ceil(plays.length / 2)
  return plays.slice(0, half)
})

const rightPlays = computed(() => {
  if (!activePlayGroup.value) return []
  const plays = activePlayGroup.value.plays
  const half = Math.ceil(plays.length / 2)
  return plays.slice(half)
})

// Initialize
onMounted(async () => {
  await fetchAllGames()
  startCountdownTimer()

  // Handle lottery query parameter from homepage
  const lotteryId = route.query.lottery
  if (lotteryId && allGames.value.length > 0) {
    const targetId = Number(lotteryId)
    const gameExists = allGames.value.some(g => g.id === targetId)
    if (gameExists) {
      selectGame(targetId)
    }
  }
})

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
  if (pollTimer) clearInterval(pollTimer)
})
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
                v-for="game in allGames"
                :key="game.id"
                :class="['type-item', game.colorClass, { active: activeGame === game.id }]"
                @click="selectGame(game.id)"
              >
                <a href="javascript:;">{{ game.name }}</a>
              </li>
              <li class="type-item gametop">
                <a href="/game/top"><img src="/skin/pc/wm/images/icon_top.png" width="25"> 游戏排行榜</a>
              </li>
            </ul>
          </div>

          <div class="item-row" v-if="playGroups.length > 0">
            <ul class="item-list">
              <li
                v-for="group in playGroups"
                :key="group.id"
                :class="['item-btn', { active: activeGroupId === group.id }]"
                @click="selectGroup(group.id)"
              >
                <a href="javascript:;">{{ group.name }}</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Game Content -->
        <div class="gamecontent">
          <!-- Top Info Bar -->
          <div class="top-info-bar">
            <div class="game-badge">
              <div :class="['badge-img', currentGameColorClass]"></div>
              <div class="badge-text">{{ gameInfo.gameName }}</div>
            </div>
            <div class="game-info">
              <ul class="info-list">
                <li class="info-item order-item">
                  <div>您的今日排名</div>
                  <div class="order-num"><span class="rank-value">{{ todayRanking }}</span></div>
                </li>
                <li class="info-item clock-item">
                  <span class="clock-text">
                    第<span class="clock-num">{{ gameInfo.period }}</span>期
                    <template v-if="countdownStatus === 'betting'">
                      <span class="countdown-time">{{ countdownText }}</span>
                    </template>
                    <template v-else-if="countdownStatus === 'closing'">
                      <span class="countdown-time closing">{{ countdownText }}</span>
                    </template>
                    <template v-else>
                      <span class="countdown-drawing">正在开奖中</span>
                      <img src="/skin/pc/wm/images/loading.gif" class="loading-gif">
                    </template>
                  </span>
                </li>
                <li class="info-item">参与<br><span>{{ profitLossSummary.bet_count }}</span> 期</li>
                <li class="info-item">胜率<br><span>{{ winRate }}</span></li>
                <li class="info-item">盈亏<br><span :class="['coin', profitLossSummary.profit >= 0 ? 'profit' : 'loss']">{{ profitLossSummary.profit.toLocaleString() }}</span></li>
                <li class="info-item last">有效流水<br><span class="coin">{{ profitLossSummary.bet_gold.toLocaleString() }}</span></li>
              </ul>

              <div class="sub-nav">
                <div class="nav-left">
                  <div class="sound-switch" @click="toggleSound" :title="soundEnabled ? '关闭开奖提示音' : '开启开奖提示音'">
                    <span class="switch-icon">🔔</span>
                    <span :class="['switch-track', { active: soundEnabled }]">
                      <span class="switch-thumb"></span>
                    </span>
                  </div>
                  <div class="refresh-switch" @click="refreshPage" title="刷新页面">
                    <span class="switch-icon">🔄</span>
                  </div>
                </div>
                <div class="nav-right">
                  <a href="javascript:;" :class="{ active: activePanel === 'drawtb' }" @click="setActivePanel('drawtb')">游戏列表</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'mybet' }" @click="setActivePanel('mybet')">我的投注</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'mymodes' }" @click="setActivePanel('mymodes')">投注模式</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'myauto' }" @click="setActivePanel('myauto')">自动投注</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'gamerule' }" @click="setActivePanel('gamerule')">游戏规则</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'weekgain' }" @click="setActivePanel('weekgain')">盈亏</a><span class="sep">|</span>
                  <a href="javascript:;" :class="{ active: activePanel === 'trend' }" @click="setActivePanel('trend')">走势图</a>
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
                    <!-- <th class="col-win">中奖</th> -->
                    <th class="col-join">参与数</th>
                    <th class="col-bet">投注额</th>
                    <th class="col-mywin">我的中奖</th>
                    <th class="col-btn">参与</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in drawHistory" :key="item.no" :class="{ 'current-row': item.isCurrent }">
                    <td class="col-no">{{ item.no }}</td>
                    <td class="col-date">{{ item.date }}</td>
                    <td class="col-result">
                      <!-- 幸运彩类型：直接显示开奖号码和结果，无验证按钮 -->
                      <template v-if="item.status === 'ended' && isLuckyLottery">
                        <div class="result-display result-display-center">
                          <!-- 显示开奖号码 -->
                          <template v-if="item.nums && item.nums.length > 0">
                            <span v-for="(num, idx) in item.nums" :key="idx" class="num-circle">{{ num }}</span>
                            <span class="equals-sign">=</span>
                          </template>
                          <!-- 显示和值结果 -->
                          <span class="result-circle">{{ String(item.result ?? 0).padStart(2, '0') }}</span>
                          <span v-if="item.specialResultText" class="result-text result-text-ml">{{ item.specialResultText }}</span>
                        </div>
                      </template>
                      <!-- 特殊分组（号码形态、龙虎豹、大小单双）显示样式 - 使用从finalResRecord解析的区位数字 -->
                      <template v-else-if="item.status === 'ended' && item.zoneDigits && item.zoneDigits.length > 0 && isActiveGroupSpecial">
                        <div class="result-display result-display-center">
                          <!-- 显示从finalResRecord解析的区位数字 -->
                          <span v-for="(num, idx) in item.zoneDigits" :key="idx" class="num-circle">{{ num }}</span>
                          <span class="equals-sign">=</span>
                          <!-- 结果文本标签 -->
                          <span :class="['result-text-badge', getSpecialResultClass(item.specialResultText)]">{{ item.specialResultText }}</span>
                          <!-- 验证按钮 -->
                          <button type="button" class="verify-btn" @click.stop="openVerifyModal(item)">验证</button>
                        </div>
                      </template>
                      <!-- 普通分组（和值等）显示样式 -->
                      <template v-else-if="item.status === 'ended' && item.calcResult">
                        <div class="result-display result-display-center">
                          <!-- 计算公式 -->
                          <span class="calc-formula">
                            <template v-if="item.calcResult.zoneCount === 3">
                              {{ item.calcResult.n1 }} + {{ item.calcResult.n2 }} + {{ item.calcResult.n3 }} =
                            </template>
                            <template v-else-if="item.calcResult.zoneCount === 2">
                              {{ item.calcResult.n1 }} + {{ item.calcResult.n2 }} =
                            </template>
                            <template v-else>
                              {{ item.calcResult.n1 }} =
                            </template>
                          </span>
                          <!-- 结果数字（红色圆形） -->
                          <span class="result-circle">{{ String(item.calcResult.total).padStart(2, '0') }}</span>
                          <!-- 验证按钮 -->
                          <button type="button" class="verify-btn" @click.stop="openVerifyModal(item)">验证</button>
                        </div>
                      </template>
                      <template v-else-if="item.status === 'ended' && (item.finalResRecord || item.result !== null)">
                        <div class="result-display result-display-center">
                          <!-- 显示开奖号码 -->
                          <template v-if="item.nums && item.nums.length > 0">
                            <span v-for="(num, idx) in item.nums" :key="idx" class="num-circle">{{ num }}</span>
                            <span class="equals-sign">=</span>
                          </template>
                          <!-- 显示和值结果 -->
                          <template v-if="item.result !== null">
                            <span class="result-circle">{{ String(item.result).padStart(2, '0') }}</span>
                          </template>
                          <span v-if="item.specialResultText" class="result-text result-text-ml">{{ item.specialResultText }}</span>
                          <button type="button" class="verify-btn" @click.stop="openVerifyModal(item)">验证</button>
                        </div>
                      </template>
                      <template v-else-if="item.isCurrent">
                        <span class="waiting-result">等待开奖</span>
                      </template>
                    </td>
                    <td class="col-pool"><span class="coin">{{ item.pool }}</span></td>
                    <!-- <td class="col-win"><span class="coin">{{ item.winGold }}</span></td> -->
                    <td class="col-join">{{ item.joinCount }}</td>
                    <td class="col-bet"><span class="coin">{{ item.betGold }}</span></td>
                    <td class="col-mywin"><span class="coin">{{ item.myWin }}</span></td>
                    <td class="col-btn">
                      <button type="button" v-if="item.status === 'betting'" class="join-btn" @click.stop="openBettingPanel(item.no)">参与</button>
                      <button v-else-if="item.status === 'drawing' || item.status === 'waiting'" class="drawing-btn">开奖中</button>
                      <button v-else class="end-btn">已结束</button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div class="pager">
                <a href="javascript:;" :class="{ disabled: currentPage <= 1 }" @click="prevPage">&lt;</a>
                <template v-for="page in visiblePages" :key="page">
                  <span v-if="page === currentPage" class="current"><em>{{ page }}</em></span>
                  <a v-else href="javascript:;" @click="goToPage(page)">{{ page }}</a>
                </template>
                <span v-if="hasMore" class="dots">…</span>
                <a href="javascript:;" :class="{ disabled: !hasMore }" @click="nextPage">&gt;</a>
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
                    <th>状态</th>
                    <th>投注时间</th>
                    <th>详情</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="bet in myBetHistory" :key="bet.id">
                    <td>{{ bet.no }}</td>
                    <td>{{ bet.drawTime }}</td>
                    <td>
                      <template v-if="bet.isOpened">
                        <span :class="['num-circle', getNumColorClass(String(bet.result).padStart(2, '0'))]">{{ bet.result }}</span>
                      </template>
                      <template v-else>
                        <span class="not-drawn">-</span>
                      </template>
                    </td>
                    <td><span class="coin">{{ bet.betAmount }}</span></td>
                    <td><span class="coin">{{ bet.winAmount }}</span></td>
                    <td>
                      <span :class="bet.profit < 0 ? 'loss' : 'profit'">{{ bet.profit < 0 ? bet.profit : '+' + bet.profit }}</span>
                    </td>
                    <td>
                      <span :class="['bet-status', getBetStatusClass(bet.status)]">{{ getBetStatusText(bet.status) }}</span>
                    </td>
                    <td>{{ bet.betTime }}</td>
                    <td>
                      <a href="javascript:;" class="detail-link" @click="openBetDetailModal(bet)">详情</a>
                    </td>
                  </tr>
                  <tr v-if="myBetHistory.length === 0">
                    <td colspan="9" style="text-align:center;color:#999;padding:20px;">暂无投注记录</td>
                  </tr>
                </tbody>
              </table>
              <!-- Pagination - only show when has multiple pages -->
              <div class="pager" v-if="betCurrentPage > 1 || betHasMore">
                <a href="javascript:;" :class="{ disabled: betCurrentPage <= 1 }" @click="betPrevPage">&lt;</a>
                <template v-for="page in betVisiblePages" :key="page">
                  <span v-if="page === betCurrentPage" class="current"><em>{{ page }}</em></span>
                  <a v-else href="javascript:;" @click="betGoToPage(page)">{{ page }}</a>
                </template>
                <span v-if="betHasMore" class="dots">…</span>
                <a href="javascript:;" :class="{ disabled: !betHasMore }" @click="betNextPage">&gt;</a>
              </div>
            </div>

            <!-- Bet Detail Modal -->
            <div v-if="showBetDetailModal" class="bet-detail-modal-overlay" @click.self="closeBetDetailModal">
              <div class="bet-detail-modal">
                <div class="bet-detail-modal-header">
                  <span class="modal-title">投注明细 - 第{{ currentBetDetail?.no }}期</span>
                  <span class="modal-close" @click="closeBetDetailModal">&times;</span>
                </div>
                <div class="bet-detail-modal-body">
                  <table class="bet-detail-table">
                    <thead>
                      <tr class="title-row">
                        <td>玩法</td>
                        <td>投注金豆</td>
                        <td>赔率</td>
                        <td>中奖金豆</td>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-if="Array.isArray(currentBetDetail?.betNo) && currentBetDetail.betNo.length > 0">
                        <tr v-for="(item, idx) in currentBetDetail.betNo" :key="idx" :class="['value-row', { 'win-row': item.win_gold > 0 }]">
                          <td class="col-play">{{ item.bet_no }}</td>
                          <td>{{ item.bet_gold }}</td>
                          <td>{{ item.multiple || '-' }}</td>
                          <td class="col-win">{{ item.win_gold || 0 }}</td>
                        </tr>
                      </template>
                      <template v-else-if="currentBetDetail?.betNo && typeof currentBetDetail.betNo === 'object' && Object.keys(currentBetDetail.betNo).length > 0">
                        <tr v-for="(item, key) in currentBetDetail.betNo" :key="key" :class="['value-row', { 'win-row': item.win_gold > 0 }]">
                          <td class="col-play">{{ item.bet_no }}</td>
                          <td>{{ item.bet_gold }}</td>
                          <td>{{ item.multiple || '-' }}</td>
                          <td class="col-win">{{ item.win_gold || 0 }}</td>
                        </tr>
                      </template>
                      <tr v-else>
                        <td colspan="4" class="bet-detail-empty">无投注明细</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Verify Modal - 验证弹框 -->
            <div v-if="showVerifyModal" class="verify-modal-overlay" @click.self="closeVerifyModal">
              <div class="verify-modal">
                <div class="verify-modal-header">
                  <h2>第{{ currentVerifyData?.no }}期开奖验证</h2>
                  <span class="modal-close" @click="closeVerifyModal">&times;</span>
                </div>
                <div class="verify-modal-body">
                  <table class="verify-table">
                    <tbody>
                      <!-- 官方结果 -->
                      <tr>
                        <td class="label-cell">{{ currentVerifyData?.gameName || '游戏' }}官方结果</td>
                        <td :colspan="verifyCalcData?.zoneCount || 3">
                          <div class="source-data">{{ currentVerifyData?.actionNo || '-' }}</div>
                        </td>
                      </tr>
                      <!-- 计算说明 - 3区游戏 -->
                      <template v-if="verifyCalcData && verifyCalcData.zoneCount === 3">
                        <tr>
                          <td class="label-cell" :rowspan="verifyCalcData.calcMethod === 'mod6Plus1' ? 3 : (isCurrentSpecialGroup ? 3 : 2)">计算：</td>
                          <td>一区({{ verifyCalcData.zone1Desc }})</td>
                          <td>二区({{ verifyCalcData.zone2Desc }})</td>
                          <td>三区({{ verifyCalcData.zone3Desc }})</td>
                        </tr>
                        <tr>
                          <td>和值 {{ verifyCalcData.zone1Sum }}</td>
                          <td>和值 {{ verifyCalcData.zone2Sum }}</td>
                          <td>和值 {{ verifyCalcData.zone3Sum }}</td>
                        </tr>
                        <!-- 三取余(16类)显示÷6余数+1 -->
                        <tr v-if="verifyCalcData.calcMethod === 'mod6Plus1'">
                          <td class="final-nums">{{ verifyCalcData.zone1Sum }}÷6余数+1 = {{ verifyCalcData.n1 }}</td>
                          <td class="final-nums">{{ verifyCalcData.zone2Sum }}÷6余数+1 = {{ verifyCalcData.n2 }}</td>
                          <td class="final-nums">{{ verifyCalcData.zone3Sum }}÷6余数+1 = {{ verifyCalcData.n3 }}</td>
                        </tr>
                        <!-- 特殊玩法分组显示取尾结果(28类) -->
                        <tr v-else-if="isCurrentSpecialGroup">
                          <td class="final-nums">取尾 {{ verifyCalcData.n1 }}</td>
                          <td class="final-nums">取尾 {{ verifyCalcData.n2 }}</td>
                          <td class="final-nums">取尾 {{ verifyCalcData.n3 }}</td>
                        </tr>
                      </template>
                      <!-- 计算说明 - 2区游戏（二取余） -->
                      <template v-else-if="verifyCalcData && verifyCalcData.zoneCount === 2">
                        <tr>
                          <td class="label-cell" :rowspan="3">计算：</td>
                          <td>一区({{ verifyCalcData.zone1Desc }})</td>
                          <td>二区({{ verifyCalcData.zone2Desc }})</td>
                        </tr>
                        <tr>
                          <td>和值 {{ verifyCalcData.zone1Sum }}</td>
                          <td>和值 {{ verifyCalcData.zone2Sum }}</td>
                        </tr>
                        <!-- 二取余显示÷6余数+1 -->
                        <tr>
                          <td class="final-nums">{{ verifyCalcData.zone1Sum }}÷6余数+1 = {{ verifyCalcData.n1 }}</td>
                          <td class="final-nums">{{ verifyCalcData.zone2Sum }}÷6余数+1 = {{ verifyCalcData.n2 }}</td>
                        </tr>
                      </template>
                      <!-- 计算说明 - 1区游戏（前七取尾） -->
                      <template v-else-if="verifyCalcData && verifyCalcData.zoneCount === 1">
                        <tr>
                          <td class="label-cell" :rowspan="3">计算：</td>
                          <td>{{ verifyCalcData.zone1Desc }}</td>
                        </tr>
                        <tr>
                          <td>和值 {{ verifyCalcData.zone1Sum }}</td>
                        </tr>
                        <!-- 尾数+1 -->
                        <tr>
                          <td class="final-nums">尾数+1：{{ verifyCalcData.zone1Sum % 10 }}+1 = {{ verifyCalcData.n1 }}</td>
                        </tr>
                      </template>
                      <!-- 最终结果 -->
                      <tr>
                        <td class="label-cell">结果：</td>
                        <td :colspan="verifyCalcData?.zoneCount || 3">
                          <!-- 特殊玩法分组：只显示文字结果（如：虎、小单、半顺） -->
                          <template v-if="isCurrentSpecialGroup">
                            <span class="special-result">{{ specialGroupResult || '-' }}</span>
                          </template>
                          <!-- 普通玩法分组：只显示数字计算，不显示属性描述 -->
                          <template v-else>
                            <span class="result-formula" v-if="verifyCalcData">
                              <template v-if="verifyCalcData.zoneCount === 3">
                                {{ verifyCalcData.n1 }} + {{ verifyCalcData.n2 }} + {{ verifyCalcData.n3 }} =
                              </template>
                              <template v-else-if="verifyCalcData.zoneCount === 2">
                                {{ verifyCalcData.n1 }} + {{ verifyCalcData.n2 }} =
                              </template>
                              <template v-else-if="verifyCalcData.zoneCount === 1">
                                {{ verifyCalcData.n1 - 1 }} + 1 =
                              </template>
                              <span class="result-num" :class="getNumColorClass(String(verifyCalcData.total).padStart(2, '0'))">{{ verifyCalcData.total }}</span>
                            </span>
                            <span class="result-formula" v-else>
                              <span class="result-num" :class="getNumColorClass(String(currentVerifyData?.result).padStart(2, '0'))">{{ currentVerifyData?.result ?? '-' }}</span>
                            </span>
                          </template>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- My Modes Panel -->
            <div class="panel mymodes-panel" v-show="activePanel === 'mymodes'">
              <div class="mode-toolbar">
                <button type="button" class="add-mode-btn" @click="openModeEditModal(null)">+ 添加模式</button>
              </div>
              <div class="mode-list-section">
                <table class="mode-list-table" v-if="customModes.length > 0">
                  <thead>
                    <tr>
                      <th>模式名称</th>
                      <th>投注号码</th>
                      <th>投注金额</th>
                      <th>总金额</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="mode in customModes" :key="mode.id">
                      <td>{{ mode.mode_name }}</td>
                      <td class="bet-no-cell">{{ mode.bet_no }}</td>
                      <td class="bet-gold-cell">{{ mode.bet_no_gold }}</td>
                      <td class="total-gold-cell">{{ mode.bet_gold }}</td>
                      <td class="mode-actions">
                        <button type="button" class="mode-action-btn edit-btn" @click="openModeEditModal(mode)">编辑</button>
                        <button type="button" class="mode-action-btn delete-btn" @click="handleDeleteMode(mode)">删除</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="empty-modes">暂无自定义模式</div>
              </div>
            </div>

            <!-- Mode Edit Modal -->
            <div v-if="showModeEditModal" class="mode-edit-modal-overlay" @click.self="closeModeEditModal">
              <div class="mode-edit-modal">
                <div class="mode-edit-modal-header">
                  <span class="modal-title">{{ editingMode ? '编辑模式' : '添加模式' }}</span>
                  <span class="modal-close" @click="closeModeEditModal">&times;</span>
                </div>
                <div class="mode-edit-modal-body">
                  <!-- Quick Select Buttons (same as betting page) -->
                  <div class="mode-betting-options">
                    <!-- Row 1 (only show for supported groups) -->
                    <div v-if="modeBettingOptions1.length > 0" class="options-row">
                      <span
                        v-for="opt in modeBettingOptions1"
                        :key="opt"
                        :class="['opt-btn', { active: modeActiveQuick === opt }]"
                        @click="handleModeQuickSelect(opt)"
                      >{{ opt }}</span>
                    </div>
                    <!-- Row 2 (only show for supported groups) -->
                    <div v-if="modeBettingOptions2.length > 0" class="options-row">
                      <span
                        v-for="opt in modeBettingOptions2"
                        :key="opt"
                        :class="['opt-btn', { active: modeActiveQuick === opt }]"
                        @click="handleModeQuickSelect(opt)"
                      >{{ opt }}</span>
                    </div>
                    <!-- Row 3 - Multipliers and Actions -->
                    <div class="options-row">
                      <span
                        v-for="opt in modeMultiplierOptions"
                        :key="opt"
                        :class="['opt-btn mult-btn', { active: modeSelectedMultiplier === opt }]"
                        @click="handleModeMultiplierSelect(opt)"
                      >{{ opt }}倍</span>
                      <span
                        v-for="act in modeActionButtons"
                        :key="act"
                        class="opt-btn action-btn"
                        @click="handleModeQuickSelect(act)"
                      >{{ act }}</span>
                    </div>
                    <!-- Row 4 - Chip Quick Amount + 定额梭哈 -->
                    <div class="options-row suoha-row">
                      <img
                        v-for="chip in chipConfig"
                        :key="chip.value"
                        :src="chip.img"
                        :alt="chip.display"
                        class="mode-quick-chip"
                        @click="handleModeChipSelect(chip.value)"
                      >
                      <input type="text" class="suoha-input" v-model="modeQuickAmount" placeholder="输入梭哈金额">
                      <span class="opt-btn action-btn suoha-btn" @click="handleModeFixedAllIn">定额梭哈</span>
                    </div>
                  </div>

                  <!-- Plays Grid -->
                  <div class="mode-plays-section">
                    <div v-if="isLoadingModePlays" class="loading-plays">加载玩法中...</div>
                    <div v-else class="mode-plays-grid">
                      <div
                        v-for="play in modeEditPlays"
                        :key="play.id"
                        :class="['mode-play-item', { selected: modeSelectedPlays.includes(play.name) }]"
                      >
                        <span class="play-name" @click="toggleModePlay(play)">{{ play.name }}</span>
                        <span class="play-odds">{{ (play.odds / 1000).toFixed(2) }}</span>
                        <input
                          type="number"
                          class="play-amount-input"
                          :value="modePlayAmounts[play.name] || ''"
                          @input="(e) => updateModePlayAmount(play.name, (e.target as HTMLInputElement).value)"
                          placeholder="金额"
                        >
                      </div>
                    </div>
                    <div v-if="!isLoadingModePlays && modeEditPlays.length === 0" class="no-plays">
                      暂无玩法数据
                    </div>
                  </div>
                </div>
                <div class="mode-edit-modal-footer">
                  <div class="footer-left">
                    <span>已选: <em>{{ modeSelectedPlays.length }}</em> 个</span>
                    <span>总金额: <em class="total-gold">{{ modeEditTotalAmount.toLocaleString() }}</em></span>
                  </div>
                  <div class="footer-right">
                    <input type="text" v-model="modeFormName" class="mode-name-input" placeholder="请输入模式名称" maxlength="20">
                    <button type="button" class="btn-cancel" @click="closeModeEditModal">取消</button>
                    <button type="button" class="btn-save" @click="handleSaveMode" :disabled="isSavingMode">{{ isSavingMode ? '保存中...' : '保存' }}</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Auto Bet Panel -->
            <div class="panel myauto-panel" v-show="activePanel === 'myauto'">
              <!-- Instructions Box -->
              <div class="auto-info-box">
                <h3><span class="info-icon">!</span> 自动投注设置</h3>
                <p>1、设置自动投注期数（10-1440期）、账户金上限和下限、起始自动投注模式</p>
                <p>2、确认并开始自动投注后，系统将会在你指定的期数内帮您自动投注，不论你的离线或在线都会持续运行直到期数终止或您关闭为止。</p>
                <p>3、开启后对号投注将自动关闭</p>
              </div>

              <!-- Loading State -->
              <div v-if="isLoadingAuto" class="auto-loading">加载中...</div>

              <template v-else>
                <!-- Inline Form Row -->
                <div class="auto-inline-form">
                  <div class="auto-field">
                    <label>自动投注期数</label>
                    <input type="number" v-model="autoTotalExpectNums" min="1" max="1440" placeholder="1-1440">
                  </div>
                  <div class="auto-field">
                    <label>金币下限</label>
                    <input type="number" v-model="autoMinGold" placeholder="低于停止">
                  </div>
                  <div class="auto-field">
                    <label>金币上限</label>
                    <input type="number" v-model="autoMaxGold" placeholder="高于停止">
                  </div>
                  <div class="auto-field">
                    <label>起始模式</label>
                    <select v-model="autoSelectedMode" class="auto-select">
                      <option :value="null">--选择--</option>
                      <option v-for="mode in customModes" :key="mode.id" :value="mode">{{ mode.mode_name }}</option>
                    </select>
                  </div>
                  <div class="auto-field auto-field-btn">
                    <button
                      v-if="autoStatus === 1"
                      type="button"
                      class="auto-btn stop-btn"
                      :disabled="isSubmittingAuto"
                      @click="handleAutoSubmit(0)"
                    >{{ isSubmittingAuto ? '处理中...' : '关闭' }}</button>
                    <button
                      v-else
                      type="button"
                      class="auto-btn start-btn"
                      :disabled="isSubmittingAuto || !autoSelectedMode"
                      @click="handleAutoSubmit(1)"
                    >{{ isSubmittingAuto ? '处理中...' : '开启' }}</button>
                  </div>
                  <!-- Status indicator -->
                  <div v-if="existingAuto" class="auto-status-indicator">
                    <span :class="['status-dot', autoStatus === 1 ? 'running' : 'stopped']"></span>
                    <span class="status-text">{{ autoStatus === 1 ? '运行中' : '已停止' }}</span>
                  </div>
                </div>

                <!-- Mode Table -->
                <table class="auto-mode-table" v-if="customModes.length > 0">
                  <thead>
                    <tr>
                      <th>名称</th>
                      <th>投注额</th>
                      <th>投注号码</th>
                      <th>投注金额</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="mode in customModes" :key="mode.id" :class="{ 'selected-row': autoSelectedMode?.id === mode.id }">
                      <td>{{ mode.mode_name }}</td>
                      <td>{{ mode.bet_gold }}</td>
                      <td class="mode-bet-no">{{ mode.bet_no }}</td>
                      <td class="mode-bet-gold">{{ mode.bet_no_gold }}</td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="no-modes-tip">暂无模式，请先在"投注模式"中创建</div>
              </template>
            </div>

            <!-- Week Gain Panel -->
            <div class="panel weekgain-panel" v-show="activePanel === 'weekgain'">
              <!-- Summary Section (暂时注释)
              <div class="profit-summary">
                <div class="summary-item">
                  <span class="summary-label">参与期数</span>
                  <span class="summary-value">{{ profitLossSummary.bet_count }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">投注金币</span>
                  <span class="summary-value coin">{{ profitLossSummary.bet_gold.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">中奖金币</span>
                  <span class="summary-value coin">{{ profitLossSummary.win_gold.toLocaleString() }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">盈亏</span>
                  <span :class="['summary-value', profitLossSummary.profit >= 0 ? 'profit' : 'loss']">
                    {{ profitLossSummary.profit >= 0 ? '+' : '' }}{{ profitLossSummary.profit.toLocaleString() }}
                  </span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">胜率</span>
                  <span class="summary-value">{{ winRate }}</span>
                </div>
              </div>
              -->
              <!-- Data Table -->
              <table class="draw-table profit-table">
                <thead>
                  <tr>
                    <th>统计日期</th>
                    <th>玩法</th>
                    <th>投注次数</th>
                    <th>投注金币</th>
                    <th>中奖金币</th>
                    <th>抽水</th>
                    <th>盈亏</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="isLoadingProfitLoss">
                    <tr>
                      <td colspan="7" style="text-align:center;color:#999;padding:20px;">加载中...</td>
                    </tr>
                  </template>
                  <template v-else-if="profitLossData.length === 0">
                    <tr>
                      <td colspan="7" style="text-align:center;color:#999;padding:20px;">暂无盈亏记录</td>
                    </tr>
                  </template>
                  <template v-else>
                    <tr v-for="item in profitLossData" :key="item.id">
                      <td>{{ (item.stat_date || '-').substring(0, 10) }}</td>
                      <td>{{ item.game_group_name || '-' }}</td>
                      <td>{{ item.bet_count || 0 }}</td>
                      <td><span class="coin">{{ (item.bet_gold || 0).toLocaleString() }}</span></td>
                      <td><span class="coin">{{ (item.win_gold || 0).toLocaleString() }}</span></td>
                      <td><span class="tax">{{ (item.tax_gold || 0).toLocaleString() }}</span></td>
                      <td>
                        <span :class="(item.profit || 0) >= 0 ? 'profit' : 'loss'">
                          {{ (item.profit || 0) >= 0 ? '+' : '' }}{{ (item.profit || 0).toLocaleString() }}
                        </span>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
              <!-- Pagination -->
              <div class="pager" v-if="profitCurrentPage > 1 || profitHasMore">
                <a href="javascript:;" :class="{ disabled: profitCurrentPage <= 1 }" @click="profitPrevPage">&lt;</a>
                <template v-for="page in profitVisiblePages" :key="page">
                  <span v-if="page === profitCurrentPage" class="current"><em>{{ page }}</em></span>
                  <a v-else href="javascript:;" @click="profitGoToPage(page)">{{ page }}</a>
                </template>
                <span v-if="profitHasMore" class="dots">…</span>
                <a href="javascript:;" :class="{ disabled: !profitHasMore }" @click="profitNextPage">&gt;</a>
              </div>
            </div>

            <!-- Trend Chart Panel -->
            <div class="panel trend-panel" v-show="activePanel === 'trend'">
              <div class="trend-container">
                <!-- Header with page size selector -->
                <div class="trend-header">
                  <span class="trend-title">走势图</span>
                  <span class="trend-selector">
                    最近
                    <select v-model="trendPageSize" @change="changeTrendPageSize(Number(trendPageSize))">
                      <option :value="30">30</option>
                      <option :value="50">50</option>
                      <option :value="100">100</option>
                    </select>
                    期
                  </span>
                  <button class="trend-refresh-btn" @click="fetchTrendData">刷新</button>
                </div>
                <div class="trend-table-wrapper">
                  <table class="trend-table">
                    <thead>
                      <tr>
                        <th class="col-fixed col-no">期号</th>
                        <th class="col-fixed col-time">时间</th>
                        <th v-for="n in 28" :key="n - 1" class="col-num">{{ n - 1 }}</th>
                        <th class="col-attr">大小</th>
                        <th class="col-attr">单双</th>
                        <th class="col-attr">尾大小</th>
                        <th class="col-attr">中边</th>
                        <th class="col-attr">尾数</th>
                        <th class="col-attr">3余</th>
                        <th class="col-attr">4余</th>
                        <th class="col-attr">5余</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-if="isLoadingTrend">
                        <tr>
                          <td :colspan="40" class="loading-cell">加载中...</td>
                        </tr>
                      </template>
                      <template v-else-if="trendData.length === 0">
                        <tr>
                          <td :colspan="40" class="empty-cell">暂无数据</td>
                        </tr>
                      </template>
                      <template v-else>
                        <tr v-for="item in trendData" :key="item.expectNo">
                          <td class="col-fixed col-no">{{ item.expectNo }}</td>
                          <td class="col-fixed col-time">{{ item.time }}</td>
                          <td
                            v-for="n in 28"
                            :key="n - 1"
                            class="col-num"
                            :class="{ 'highlight': item.num === (n - 1) }"
                          >
                            <span
                              v-if="item.num === (n - 1)"
                              :class="['num-ball', getTrendNumColorClass(item.num)]"
                            >{{ item.num }}</span>
                          </td>
                          <td class="col-attr">
                            <span :class="['attr-tag', item.bigSmall === '大' ? 'big' : 'small']">{{ item.bigSmall }}</span>
                          </td>
                          <td class="col-attr">
                            <span :class="['attr-tag', item.oddEven === '单' ? 'odd' : 'even']">{{ item.oddEven }}</span>
                          </td>
                          <td class="col-attr">
                            <span :class="['attr-tag', item.tailBigSmall === '尾大' ? 'tail-big' : 'tail-small']">{{ item.tailBigSmall }}</span>
                          </td>
                          <td class="col-attr">
                            <span :class="['attr-tag', item.middleSide === '中' ? 'middle' : 'side']">{{ item.middleSide }}</span>
                          </td>
                          <td class="col-attr">
                            <span class="attr-num">{{ item.tail }}</span>
                          </td>
                          <td class="col-attr">
                            <span class="attr-num">{{ item.mod3 }}</span>
                          </td>
                          <td class="col-attr">
                            <span class="attr-num">{{ item.mod4 }}</span>
                          </td>
                          <td class="col-attr">
                            <span class="attr-num">{{ item.mod5 }}</span>
                          </td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Game Rule Panel -->
            <div class="panel gamerule-panel" v-show="activePanel === 'gamerule'">
              <div class="rule-container">
                <template v-if="currentPlayGroup">
                  <div class="rule-header">
                    <h2>{{ currentGroupName }} <span class="rule-subtitle">游戏规则</span></h2>
                  </div>
                  <div class="rule-content" v-if="ruleContent">
                    <!-- HTML content -->
                    <div v-if="ruleIsHtml" v-html="ruleContent" class="rule-html"></div>
                    <!-- Plain text content -->
                    <div v-else class="rule-text">{{ ruleContent }}</div>
                  </div>
                  <div v-else class="rule-empty">暂无规则说明</div>
                </template>
                <template v-else>
                  <div class="rule-empty">请选择玩法分组查看规则</div>
                </template>
              </div>
            </div>

            <!-- Ranking Panel -->
            <div class="panel ranking-panel" v-show="activePanel === 'ranking'">
              <div class="ranking-container">
                <!-- Three columns layout -->
                <div class="ranking-columns">
                  <!-- 今日盈利榜 -->
                  <div class="ranking-column">
                    <div class="ranking-header">今日盈利榜</div>
                    <div v-if="isLoadingRank" class="ranking-loading">
                      <div v-for="i in 10" :key="`today-skeleton-${i}`" class="rank-skeleton">
                        <div class="skeleton-medal"></div>
                        <div class="skeleton-info"><div class="skeleton-name"></div><div class="skeleton-bet"></div></div>
                        <div class="skeleton-score"></div>
                      </div>
                    </div>
                    <div v-else-if="rankDataToday.length === 0" class="ranking-empty">暂无数据</div>
                    <div v-else class="ranking-list">
                      <div v-for="(item, index) in rankDataToday" :key="`today-${item.id}`" class="rank-item">
                        <span :class="['rank-medal', getMedalClass(index + 1)]">{{ index + 1 }}</span>
                        <div class="rank-info">
                          <div class="rank-name-row">
                            <img :src="`/ranking/vip/${item.member?.level || 1}.png`" alt="VIP" class="rank-vip" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                            <span class="rank-name">{{ item.member_field?.nickname || item.member?.user || '玩家' }}</span>
                          </div>
                          <div class="rank-bet">
                            <img src="/ranking/coin.png" alt="金豆" class="bet-icon" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                            <span>或 {{ item.bet_gold?.toLocaleString() || 0 }}</span>
                          </div>
                        </div>
                        <div class="rank-score">
                          <span class="score-value">{{ item.profit?.toLocaleString() || 0 }}</span>
                          <img src="/ranking/coin.png" alt="金豆" class="score-icon" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 昨日盈利榜 -->
                  <div class="ranking-column">
                    <div class="ranking-header">昨日盈利榜</div>
                    <div v-if="isLoadingRank" class="ranking-loading">
                      <div v-for="i in 10" :key="`yesterday-skeleton-${i}`" class="rank-skeleton">
                        <div class="skeleton-medal"></div>
                        <div class="skeleton-info"><div class="skeleton-name"></div><div class="skeleton-bet"></div></div>
                        <div class="skeleton-score"></div>
                      </div>
                    </div>
                    <div v-else-if="rankDataYesterday.length === 0" class="ranking-empty">暂无数据</div>
                    <div v-else class="ranking-list">
                      <div v-for="(item, index) in rankDataYesterday" :key="`yesterday-${item.id}`" class="rank-item">
                        <span :class="['rank-medal', getMedalClass(index + 1)]">{{ index + 1 }}</span>
                        <div class="rank-info">
                          <div class="rank-name-row">
                            <img :src="`/ranking/vip/${item.member?.level || 1}.png`" alt="VIP" class="rank-vip" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                            <span class="rank-name">{{ item.member_field?.nickname || item.member?.user || '玩家' }}</span>
                          </div>
                          <div class="rank-bet">
                            <img src="/ranking/coin.png" alt="金豆" class="bet-icon" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                            <span>或 {{ item.bet_gold?.toLocaleString() || 0 }}</span>
                          </div>
                        </div>
                        <div class="rank-score">
                          <span class="score-value">{{ item.profit?.toLocaleString() || 0 }}</span>
                          <img src="/ranking/coin.png" alt="金豆" class="score-icon" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 上周盈利榜 -->
                  <div class="ranking-column">
                    <div class="ranking-header">上周盈利榜</div>
                    <div v-if="isLoadingRank" class="ranking-loading">
                      <div v-for="i in 10" :key="`week-skeleton-${i}`" class="rank-skeleton">
                        <div class="skeleton-medal"></div>
                        <div class="skeleton-info"><div class="skeleton-name"></div></div>
                        <div class="skeleton-score"></div>
                      </div>
                    </div>
                    <div v-else-if="rankDataWeek.length === 0" class="ranking-empty">暂无数据</div>
                    <div v-else class="ranking-list">
                      <div v-for="item in rankDataWeek" :key="`week-${item.rank}`" class="rank-item">
                        <span :class="['rank-medal', getMedalClass(item.rank)]">{{ item.rank }}</span>
                        <div class="rank-info">
                          <div class="rank-name-row">
                            <img :src="`/ranking/vip/${item.level}.png`" alt="VIP" class="rank-vip" @error="($event.target as HTMLImageElement).style.display = 'none'" />
                            <span class="rank-name">{{ item.name }}</span>
                          </div>
                        </div>
                        <div class="rank-score">
                          <span class="score-value">{{ item.score?.toLocaleString() || 0 }}</span>
                          <img src="/ranking/coin.png" alt="金豆" class="score-icon" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    :class="['layui-btn', 'layui-btn-sm', 'layui-btn-primary', 'mymodesbtn', { active: selectedMode?.id === mode.id }]"
                    type="button"
                    @click="handleApplyMode(mode)"
                  >{{ mode.mode_name }}</button>
                  <span v-if="customModes.length === 0" class="no-modes-text">暂无自定义模式</span>
                </div>
              </fieldset>

              <!-- Betting Options (Original PC Layout) -->
              <div class="betting-options">
                <!-- Row 1 (only show for supported groups) -->
                <div v-if="bettingOptions1.length > 0" class="options-row">
                  <span
                    v-for="opt in bettingOptions1"
                    :key="opt"
                    :class="['opt-btn', { active: activeQuick === opt }]"
                    @click="handleQuickSelect(opt)"
                  >{{ opt }}</span>
                </div>
                <!-- Row 2 (only show for supported groups) -->
                <div v-if="bettingOptions2.length > 0" class="options-row">
                  <span
                    v-for="opt in bettingOptions2"
                    :key="opt"
                    :class="['opt-btn', { active: activeQuick === opt }]"
                    @click="handleQuickSelect(opt)"
                  >{{ opt }}</span>
                </div>
                <!-- Row 3 - Multipliers and Actions (always show) -->
                <div class="options-row">
                  <span
                    v-for="opt in multiplierOptions"
                    :key="opt"
                    :class="['opt-btn mult-btn', { active: selectedMultiplier === opt }]"
                    @click="handleMultiplierSelect(opt)"
                  >{{ opt }}倍</span>
                  <span
                    v-for="act in actionButtons"
                    :key="act"
                    class="opt-btn action-btn"
                    @click="handleQuickSelect(act)"
                  >{{ act }}</span>
                  <input type="text" class="suoha-input" v-model="quickAmount" placeholder="输入梭哈金额">
                  <span class="opt-btn action-btn suoha-btn" @click="handleFixedAllIn">定额梭哈</span>
                </div>
              </div>

              <!-- Period Info Bar (Original PC Layout) -->
              <div class="period-info-bar">
                <div class="period-countdown">
                  第<span class="period-num">{{ gameInfo.period }}</span>期
                  <template v-if="countdownStatus === 'betting'">
                    距<span class="time-red">{{ countdown.stop }}</span>秒停止竞猜
                  </template>
                  <template v-else-if="countdownStatus === 'closing'">
                    已停止竞猜，距<span class="time-red">{{ countdown.draw }}</span>秒开奖
                  </template>
                  <template v-else>
                    <span class="time-red">正在开奖中...</span>
                  </template>
                </div>
                <div class="bet-status">
                  <span class="next-period">{{ gameInfo.period }}</span> 期已投注:<span class="coin">{{ periodBetAmount.toLocaleString() }}</span> <span class="coin-icon">🪙</span>
                  此次总投注: <span class="coin">{{ totalBetAmount.toLocaleString() }}</span> <span class="coin-icon">🪙</span>
                </div>
                <div class="quick-bet-area">
                  <img
                    v-for="chip in chipConfig"
                    :key="chip.value"
                    :src="chip.img"
                    :alt="chip.display"
                    class="quick-bet-chip"
                    @click="handleChipSelect(chip.value)"
                  >
                  <button class="submit-bet-btn" :disabled="isSubmitting || countdown.stop <= 0 || totalBetAmount <= 0" @click="submitBet">
                    <span class="bet-icon">✏</span> {{ isSubmitting ? '提交中...' : '投注' }}
                  </button>
                </div>
              </div>

              <!-- Odds Table (Two Column Layout) -->
              <div class="odds-table-wrap" v-if="activePlayGroup">
                <table class="odds-table">
                  <thead>
                    <tr>
                      <th class="col-num">号码</th>
                      <th class="col-odds">赔率</th>
                      <th class="col-mybet">我的投注</th>
                      <th class="col-bet">投注</th>
                      <th class="col-num">号码</th>
                      <th class="col-odds">赔率</th>
                      <th class="col-mybet">我的投注</th>
                      <th class="col-bet">投注</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(left, index) in leftPlays" :key="index">
                      <!-- Left column -->
                      <td class="col-num">
                        <span
                          :class="['num-circle', { selected: selectedPlays.includes(left.name) }]"
                          @click="togglePlay(left)"
                        >{{ left.name }}</span>
                      </td>
                      <td class="col-odds">{{ (left.odds / 1000).toFixed(4) }}</td>
                      <td :class="['col-mybet', myBetAmounts[left.name] > 0 ? 'has-bet' : '']">
                        {{ myBetAmounts[left.name] > 0 ? myBetAmounts[left.name].toLocaleString() : '-' }}
                      </td>
                      <td class="col-bet">
                        <input
                          type="number"
                          class="bet-input"
                          :value="playAmounts[left.name] || ''"
                          @input="(e) => updatePlayAmount(left.name, (e.target as HTMLInputElement).value)"
                        >
                        <span class="mult-x" @click="handleAmountMultiplier(left.name, 0.5)">×0.5</span>
                        <span class="mult-x" @click="handleAmountMultiplier(left.name, 2)">×2</span>
                        <span class="mult-x" @click="handleAmountMultiplier(left.name, 10)">×10</span>
                      </td>
                      <!-- Right column -->
                      <template v-if="rightPlays[index]">
                        <td class="col-num">
                          <span
                            :class="['num-circle', { selected: selectedPlays.includes(rightPlays[index].name) }]"
                            @click="togglePlay(rightPlays[index])"
                          >{{ rightPlays[index].name }}</span>
                        </td>
                        <td class="col-odds">{{ (rightPlays[index].odds / 1000).toFixed(4) }}</td>
                        <td :class="['col-mybet', myBetAmounts[rightPlays[index].name] > 0 ? 'has-bet' : '']">
                          {{ myBetAmounts[rightPlays[index].name] > 0 ? myBetAmounts[rightPlays[index].name].toLocaleString() : '-' }}
                        </td>
                        <td class="col-bet">
                          <input
                            type="number"
                            class="bet-input"
                            :value="playAmounts[rightPlays[index].name] || ''"
                            @input="(e) => updatePlayAmount(rightPlays[index].name, (e.target as HTMLInputElement).value)"
                          >
                          <span class="mult-x" @click="handleAmountMultiplier(rightPlays[index].name, 0.5)">×0.5</span>
                          <span class="mult-x" @click="handleAmountMultiplier(rightPlays[index].name, 2)">×2</span>
                          <span class="mult-x" @click="handleAmountMultiplier(rightPlays[index].name, 10)">×10</span>
                        </td>
                      </template>
                      <template v-else>
                        <td colspan="4"></td>
                      </template>
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
  position: relative;
  overflow: hidden;
  transition: width 0.2s ease;
}

.item-btn:hover {
  width: auto;
  min-width: 95.8px;
  padding: 0 10px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-btn:hover a {
  overflow: visible;
  text-overflow: unset;
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

.badge-img.bg { background-image: url('/skin/pc/wm/images/bingo.png'); }
.badge-img.system { background-image: url('/skin/pc/wm/images/system.png'); }
.badge-img.btc { background-image: url('/skin/pc/wm/images/btc.png'); }
.badge-img.jnd { background-image: url('/skin/pc/wm/images/jnd.png'); }
.badge-img.hanguo { background-image: url('/skin/pc/wm/images/hanguo.png'); }
.badge-img.qlq { background-image: url('/skin/pc/wm/images/qlq.png'); }
.badge-img.feit { background-image: url('/skin/pc/wm/images/feit.png'); }
.badge-img.shasec { background-image: url('/skin/pc/wm/images/system.png'); }

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

.info-item.order-item { width: 150px; }
.info-item.clock-item { width: 370px; }
.info-item.clock-item .clock-text { line-height: 70px; font-weight: normal; }
.info-item.last { width: 140px; border-right: 0; }

.countdown-time { color: #006600; font-weight: bold; margin-left: 10px; }
.countdown-time.closing { color: #ff6600; }
.countdown-drawing { color: #cc0000; font-weight: bold; margin-left: 10px; }
.loading-gif { vertical-align: middle; margin-left: 5px; }

.order-num { color: #ff3000; font-size: 28px; font-weight: 700; }
.rank-value { font-size: 18px; color: #ff3000; font-weight: 700; }
.clock-num { color: #FF0000; font-size: 13px; font-weight: bold; font-family: Verdana, Arial, Helvetica, sans-serif; }

/* ==================== SUB NAVIGATION ==================== */
.sub-nav {
  height: 35px;
  line-height: 35px;
  padding: 0 10px;
  background: linear-gradient(to bottom, #F5D896, #E8C36A);
  border: 1px solid #D4A84B;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 35px;
}

.sound-switch,
.refresh-switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  height: 24px;
}

.switch-icon { font-size: 16px; margin-right: 5px; line-height: 1; }

.switch-track {
  display: inline-block;
  width: 36px;
  height: 18px;
  background: #ccc;
  border-radius: 9px;
  position: relative;
  transition: background 0.3s ease;
}

.switch-track.active { background: #f03736; }

.switch-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  transition: left 0.3s ease;
}

.switch-track.active .switch-thumb { left: 20px; }

.nav-right {
  display: flex;
  align-items: center;
  height: 35px;
}

.nav-right a {
  color: #814708;
  text-decoration: none;
  position: relative;
  font-size: 14px;
  cursor: pointer;
}

.nav-right a:hover {
  color: #5a3005;
  text-decoration: underline;
}

.nav-right a.active {
  font-weight: bold;
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

.nav-right .sep { color: #C4A050; margin: 0 8px; font-weight: normal; }

/* ==================== GAME MAIN ==================== */
.game-main { min-height: 400px; }
.panel { display: block; }

/* ==================== QUOTE BOX ==================== */
.quote-box {
  background: url('/skin/pc/wm/images/ps.gif') 15px 8px no-repeat #D4ECF7;
  color: #1d6f9f;
  padding: 10px 10px 10px 45px;
  font-size: 13px;
}

.quote-box h2 { font-size: 16px; margin: 0 0 5px 0; }

/* ==================== MODE LIST TABLE ==================== */
.mode-list-section {
  margin-top: 5px;
  overflow: hidden;
}

.mode-list-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid #e6e6e6;
  table-layout: fixed;
  margin-top: 5px;
}

.mode-list-table th {
  background: #ffbf4c;
  color: #FFF;
  font-weight: normal;
  padding: 8px 10px;
  font-size: 13px;
  text-align: center;
  border: 1px solid #ffbf4c;
}

.mode-list-table th:nth-child(1) { width: 100px; }
.mode-list-table th:nth-child(2) { width: 25%; }
.mode-list-table th:nth-child(3) { width: 35%; }
.mode-list-table th:nth-child(4) { width: 80px; }
.mode-list-table th:nth-child(5) { width: 120px; }

.mode-list-table td {
  padding: 8px 10px;
  font-size: 13px;
  text-align: center;
  border: 1px solid #e6e6e6;
  vertical-align: middle;
  word-wrap: break-word;
  word-break: break-all;
}

.mode-list-table .bet-no-cell,
.mode-list-table .bet-gold-cell {
  text-align: left;
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}

.mode-list-table .mode-actions {
  white-space: nowrap;
}

.mode-action-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin: 0 2px;
}

.mode-action-btn.edit-btn {
  background: #1E9FFF;
  color: #fff;
}

.mode-action-btn.edit-btn:hover {
  background: #1890ff;
}

.mode-action-btn.delete-btn {
  background: #FF5722;
  color: #fff;
}

.mode-action-btn.delete-btn:hover {
  background: #f44336;
}

.empty-modes {
  text-align: center;
  padding: 30px;
  color: #999;
  font-size: 14px;
}

/* ==================== MODE TOOLBAR ==================== */
.mode-toolbar {
  padding: 10px;
  background: #fff;
}

.mode-toolbar .add-mode-btn {
  padding: 6px 15px;
  background: #1E9FFF;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
}

.mode-toolbar .add-mode-btn:hover {
  background: #1890ff;
}

/* ==================== MODE EDIT MODAL ==================== */
.mode-edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.mode-edit-modal {
  background: #fff;
  border-radius: 8px;
  width: 800px;
  max-width: 90%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.mode-edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #ffbf4c;
  border-radius: 8px 8px 0 0;
}

.mode-edit-modal-header .modal-title {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
}

.mode-edit-modal-header .modal-close {
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  line-height: 1;
}

.mode-edit-modal-header .modal-close:hover {
  color: #333;
}

.mode-edit-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

/* Mode Betting Options (same style as betting page) */
.mode-betting-options {
  margin-bottom: 15px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 4px;
  border-bottom: 1px solid #e6e6e6;
}

.mode-betting-options .suoha-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-quick-chip {
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: transform 0.2s;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.mode-quick-chip:hover {
  transform: scale(1.15);
}

.mode-betting-options .suoha-input {
  width: 120px;
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 13px;
}

/* Plays Section */
.mode-plays-section {
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.mode-plays-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #e6e6e6;
}

.mode-play-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #fff;
  font-size: 12px;
}

.mode-play-item.selected {
  background: #fff3e0;
}

.mode-play-item .play-name {
  min-width: 40px;
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-play-item.selected .play-name {
  background: #ff9800;
  color: #fff;
}

.mode-play-item .play-odds {
  color: #999;
  font-size: 11px;
  min-width: 40px;
}

.mode-play-item .play-amount-input {
  width: 70px;
  padding: 4px 6px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 12px;
  text-align: center;
}

.mode-play-item.selected .play-amount-input {
  border-color: #ff9800;
}

.loading-plays, .no-plays {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* Footer */
.mode-edit-modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #e6e6e6;
  background: #fafafa;
  border-radius: 0 0 8px 8px;
}

.mode-edit-modal-footer .footer-left {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #666;
}

.mode-edit-modal-footer .footer-left em {
  font-style: normal;
  font-weight: bold;
  color: #333;
}

.mode-edit-modal-footer .footer-left .total-gold {
  color: #f03736;
  font-size: 16px;
}

.mode-edit-modal-footer .footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.mode-edit-modal-footer .mode-name-input {
  width: 150px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
}

.mode-edit-modal-footer .btn-cancel,
.mode-edit-modal-footer .btn-save {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}

.mode-edit-modal-footer .btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.mode-edit-modal-footer .btn-cancel:hover {
  background: #e0e0e0;
}

.mode-edit-modal-footer .btn-save {
  background: #1E9FFF;
  color: #fff;
}

.mode-edit-modal-footer .btn-save:hover {
  background: #1890ff;
}

.mode-edit-modal-footer .btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* ==================== AUTO BET PANEL ==================== */
.myauto-panel {
  padding: 10px;
}

.auto-loading {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* Info Box */
.auto-info-box {
  background: #D4ECF7;
  border-left: 4px solid #1E9FFF;
  padding: 12px 15px;
  margin-bottom: 10px;
}

.auto-info-box h3 {
  font-size: 14px;
  color: #1d6f9f;
  margin: 0 0 8px 0;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.auto-info-box .info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: #1E9FFF;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
}

.auto-info-box p {
  font-size: 13px;
  color: #1d6f9f;
  margin: 0;
  line-height: 1.8;
}

/* Inline Form */
.auto-inline-form {
  display: flex;
  align-items: flex-end;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  flex-wrap: wrap;
}

.auto-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.auto-field label {
  font-size: 12px;
  color: #1E9FFF;
  font-weight: 500;
}

.auto-field input,
.auto-field .auto-select {
  width: 140px;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 13px;
}

.auto-field input:focus,
.auto-field .auto-select:focus {
  border-color: #1E9FFF;
  outline: none;
}

.auto-field.auto-field-btn {
  flex-direction: row;
  align-items: flex-end;
}

.auto-btn {
  padding: 8px 25px;
  border: none;
  border-radius: 3px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.auto-btn.start-btn {
  background: #1E9FFF;
  color: #fff;
}

.auto-btn.start-btn:hover {
  background: #1890ff;
}

.auto-btn.start-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.auto-btn.stop-btn {
  background: #ff6b6b;
  color: #fff;
}

.auto-btn.stop-btn:hover {
  background: #ee5a5a;
}

.auto-btn.stop-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.auto-status-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-left: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.running {
  background: #52c41a;
  box-shadow: 0 0 6px #52c41a;
}

.status-dot.stopped {
  background: #999;
}

.status-text {
  font-size: 12px;
  color: #666;
}

/* Mode Table */
.auto-mode-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background: #fff;
  border: 1px solid #e6e6e6;
  table-layout: fixed;
}

.auto-mode-table th,
.auto-mode-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #e6e6e6;
  font-size: 13px;
  vertical-align: top;
}

.auto-mode-table th:nth-child(1) { width: 15%; }
.auto-mode-table th:nth-child(2) { width: 15%; }
.auto-mode-table th:nth-child(3) { width: 35%; }
.auto-mode-table th:nth-child(4) { width: 35%; }

.auto-mode-table th {
  background: #f5f5f5;
  color: #666;
  font-weight: 500;
}

.auto-mode-table td {
  color: #333;
}

.auto-mode-table tr:hover {
  background: #fafafa;
}

.auto-mode-table tr.selected-row {
  background: #e6f7ff;
}

.auto-mode-table .mode-bet-no,
.auto-mode-table .mode-bet-gold {
  word-wrap: break-word;
  word-break: break-all;
  white-space: normal;
}

.no-modes-tip {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 13px;
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

.draw-table td {
  padding: 8px 5px;
  font-size: 13px;
  text-align: center;
  border: 1px solid #e6e6e6;
  line-height: 1.5;
  vertical-align: middle;
}

.draw-table .col-no { width: 90px; }
.draw-table .col-date { width: 130px; white-space: nowrap; }
.draw-table .col-result { min-width: 320px; text-align: center; }
.draw-table .col-pool { width: 120px; }
.draw-table .col-win { width: 80px; }
.draw-table .col-join { width: 70px; }
.draw-table .col-bet { width: 80px; }
.draw-table .col-mywin { width: 80px; }
.draw-table .col-btn { width: 70px; }

.draw-table tr.current-row { background: #fffbe6; }
.draw-table tr.current-row td { border-color: #ffe58f; }

/* 结果显示区域 */
.result-display {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* 计算公式 */
.calc-formula {
  color: #666;
  font-size: 13px;
  font-family: 'Monaco', 'Consolas', monospace;
}

/* 结果数字红色圆形 */
.result-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
  color: #fff;
  font-size: 13px;
  font-weight: bold;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(207, 19, 34, 0.3);
}

/* 属性标签容器 */
.result-attrs {
  display: flex;
  gap: 4px;
  margin-left: 4px;
}

/* 属性标签基础样式 */
.attr-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

/* 大/龙 - 红色 */
.attr-big {
  background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
  color: #fff;
}

/* 小/虎 - 蓝色 */
.attr-small {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: #fff;
}

/* 单 - 红色 */
.attr-odd {
  background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%);
  color: #fff;
}

/* 双 - 蓝色 */
.attr-even {
  background: linear-gradient(135deg, #69c0ff 0%, #1890ff 100%);
  color: #fff;
}

/* 豹 - 金色 */
.attr-leopard {
  background: linear-gradient(135deg, #ffc53d 0%, #faad14 100%);
  color: #fff;
}

/* 形态 - 绿色 */
.attr-shape {
  background: linear-gradient(135deg, #95de64 0%, #52c41a 100%);
  color: #fff;
}

/* 默认 - 灰色 */
.attr-default {
  background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%);
  color: #595959;
}

/* 居中显示 */
.result-display-center {
  justify-content: center;
}

/* 特殊分组的数字圆圈 */
.num-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #fff;
  color: #ff7a45;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid #ff7a45;
  border-radius: 50%;
  margin: 0 2px;
}

/* 等号 */
.equals-sign {
  color: #999;
  font-size: 16px;
  margin: 0 6px;
}

/* 特殊结果文本标签 */
.result-text-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 28px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  color: #fff;
}

/* 号码形态颜色 */
.special-shunzi { background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%); }  /* 顺子 - 红色 */
.special-banshun { background: linear-gradient(135deg, #ff7a45 0%, #fa541c 100%); } /* 半顺 - 橙色 */
.special-zaliu { background: linear-gradient(135deg, #95de64 0%, #52c41a 100%); }   /* 杂六 - 绿色 */
.special-duizi { background: linear-gradient(135deg, #ffc53d 0%, #faad14 100%); }   /* 对子 - 金色 */
.special-baozi { background: linear-gradient(135deg, #b37feb 0%, #722ed1 100%); }   /* 豹子 - 紫色 */

/* 龙虎豹颜色 */
.special-long { background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%); }    /* 龙 - 红色 */
.special-hu { background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); }      /* 虎 - 蓝色 */
.special-bao { background: linear-gradient(135deg, #ffc53d 0%, #faad14 100%); }     /* 豹 - 金色 */

/* 大小单双颜色 */
.special-da { background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%); }      /* 大 - 红色 */
.special-xiao { background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); }    /* 小 - 蓝色 */
.special-dan { background: linear-gradient(135deg, #ff7875 0%, #ff4d4f 100%); }     /* 单 - 浅红 */
.special-shuang { background: linear-gradient(135deg, #69c0ff 0%, #1890ff 100%); }  /* 双 - 浅蓝 */
.special-dadan { background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%); }   /* 大单 - 红色 */
.special-dashuang { background: linear-gradient(135deg, #ff7a45 0%, #fa541c 100%); } /* 大双 - 橙色 */
.special-xiaodan { background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%); } /* 小单 - 蓝色 */
.special-xiaoshuang { background: linear-gradient(135deg, #36cfc9 0%, #13c2c2 100%); } /* 小双 - 青色 */
.special-default { background: linear-gradient(135deg, #d9d9d9 0%, #bfbfbf 100%); color: #595959; }

.result-text { color: #333; font-size: 13px; margin-right: 10px; }
.result-text-ml { margin-left: 8px; }
.waiting-result { color: #999; font-style: italic; }

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

.join-btn:hover { background: #f5a15d; }

.drawing-btn,
.end-btn {
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

.coin { color: #f03736; }
.coin.profit { color: #00aa00; }
.coin.loss { color: #cc0000; }

/* ==================== PAGER ==================== */
.pager { margin-top: 15px; font-size: 0; }

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

.pager a:hover { color: #009688; }
.pager .current { background: #009688; border-color: #009688; color: #fff; }
.pager .current em { font-style: normal; }
.pager .disabled { color: #d2d2d2; cursor: not-allowed; }
.pager .dots { border: none; background: none; }

/* ==================== BETTING PANEL ==================== */
.betting-panel { background: #fff; }

/* Custom Modes Section */
.layui-elem-field {
  margin: 10px;
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

.layui-field-box { padding: 15px; }
.mymodswrap { overflow: hidden; }

.mymodesbtn { margin-right: 10px; margin-bottom: 5px; }

.layui-btn {
  display: inline-block;
  vertical-align: middle;
  height: 30px;
  line-height: 30px;
  padding: 0 10px;
  background-color: #fff;
  color: #555;
  white-space: nowrap;
  text-align: center;
  font-size: 12px;
  border: 1px solid #c9c9c9;
  border-radius: 2px;
  cursor: pointer;
}

.layui-btn:hover { border-color: #009688; color: #009688; }
.mymodesbtn.active { border-color: #FFB800; color: #FFB800; }

/* Betting Options (Original PC Layout) */
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

.options-row:last-child { margin-bottom: 0; }

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

.opt-btn:hover { opacity: 0.9; }
.opt-btn.active { background: #f03736; }
.opt-btn.mult-btn { background: #87CEEB; }
.opt-btn.mult-btn.active { background: #4682B4; }
.opt-btn.action-btn { background: #87CEEB; }
.suoha-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 3px;
  width: 120px;
  font-size: 13px;
}
.suoha-btn { background: #f03736 !important; }

/* Quick Select Area */
.quick-select-area { padding: 10px; background: #f9f9f9; border-bottom: 1px solid #e6e6e6; }

.quick-row { margin-bottom: 8px; display: flex; flex-wrap: wrap; gap: 5px; }

.quick-btn {
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

.quick-btn:hover { opacity: 0.9; }
.quick-btn.active { background: #f03736; }
.quick-btn.special-btn { background: #87CEEB; }
.quick-btn.small { padding: 4px 8px; font-size: 12px; min-width: 35px; }
.quick-btn.mult { background: #87CEEB; }
.quick-btn.mult.active { background: #4682B4; }

/* Expanded Section */
.expanded-section { margin-top: 15px; padding: 15px; background: #fff; border: 1px solid #e6e6e6; border-radius: 4px; }
.expand-row { display: flex; gap: 20px; }
.expand-col { flex: 1; }
.expand-title { font-size: 13px; color: #666; margin-bottom: 8px; }
.expand-btns { margin-bottom: 5px; display: flex; flex-wrap: wrap; gap: 4px; }
.multiplier-section { margin-top: 15px; }

/* Expand Toggle */
.expand-toggle {
  margin-top: 10px;
  padding: 8px;
  background: #ff9800;
  color: #fff;
  text-align: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.expand-toggle:hover { background: #f57c00; }

.chip-input {
  width: 100px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 13px;
}

.chip-btn {
  padding: 8px 16px;
  background: #f03736;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 13px;
}

.chip-btn:hover { background: #d63031; }

/* Period Info Bar */
.period-info-bar {
  background: #fff;
  padding: 10px 15px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.period-countdown { font-size: 13px; color: #333; }
.period-num { color: #f03736; font-weight: bold; }
.time-red { color: #f03736; font-weight: bold; }
.bet-status { font-size: 13px; color: #333; }
.next-period { color: #FFB800; font-weight: bold; }
.coin-icon { font-size: 14px; }

.quick-bet-area {
  display: flex;
  align-items: center;
  gap: 5px;
}

.quick-bet-chip {
  width: 40px;
  height: 40px;
  cursor: pointer;
  transition: transform 0.1s;
}

.quick-bet-chip:hover {
  transform: scale(1.1);
}

.quick-bet-chip:active {
  transform: scale(0.95);
}

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

.submit-bet-btn:hover { background: #e6a600; }
.submit-bet-btn:disabled { background: #ccc; cursor: not-allowed; }
.bet-icon { font-size: 14px; }

/* Odds Table */
.odds-table-wrap { padding: 10px; }

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
.odds-table .col-mybet.has-bet { color: #f03736; font-weight: bold; }
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
  cursor: pointer;
  background: #9e9e9e;
}

.num-circle.selected { background: #ff9800; }

/* Color classes for lottery result display */
.num-green { background: #4CAF50; }
.num-blue { background: #2196F3; }
.num-red { background: #f44336; }
.num-gray { background: #9e9e9e; }

.bet-input {
  width: 80px;
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

.mult-x:hover { background: #e6e6e6; }

/* Bottom Action Bar */
.bottom-action-bar {
  display: flex;
  height: 50px;
  border-top: 1px solid #e6e6e6;
}

.cancel-btn {
  flex: 1;
  background: #2196F3;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.cancel-btn:hover { background: #1976D2; }

.submit-btn {
  flex: 1;
  background: #f03736;
  color: #fff;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.submit-btn:hover { background: #d63031; }
.submit-btn:disabled { background: #ccc; cursor: not-allowed; }

/* Back Button */
.back-btn-wrap { padding: 15px; text-align: center; }

.back-btn {
  padding: 8px 30px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.back-btn:hover { background: #e6e6e6; }

/* My Bet Table */
.mybet-table td { vertical-align: middle; }
.mybet-table .loss { color: #f03736; }
.mybet-table .profit { color: #4CAF50; }

.mybet-table .not-drawn {
  color: #999;
  font-size: 16px;
}

.mybet-table .bet-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.mybet-table .status-pending {
  background: #fff7e6;
  color: #fa8c16;
}

.mybet-table .status-settled {
  background: #e6f7e6;
  color: #52c41a;
}

.mybet-table .status-rollback {
  background: #fff1f0;
  color: #f5222d;
}

.mybet-table .status-deleted {
  background: #f0f0f0;
  color: #999;
}

.detail-link {
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

.detail-link:hover { border-color: #009688; color: #009688; }

/* Bet Detail Modal */
.bet-detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.bet-detail-modal {
  background: #fff;
  border-radius: 8px;
  min-width: 450px;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.bet-detail-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(to bottom, #F5D896, #E8C36A);
  border-bottom: 1px solid #D4A84B;
}

.bet-detail-modal-header .modal-title {
  font-size: 16px;
  font-weight: bold;
  color: #814708;
}

.bet-detail-modal-header .modal-close {
  font-size: 24px;
  color: #814708;
  cursor: pointer;
  line-height: 1;
}

.bet-detail-modal-header .modal-close:hover {
  color: #5a3005;
}

.bet-detail-modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.bet-detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.bet-detail-table td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: center;
}

.bet-detail-table .title-row td {
  background: #f5f5f5;
  font-weight: bold;
  color: #666;
}

.bet-detail-table .value-row td {
  background: #fff;
}

.bet-detail-table .value-row .col-play {
  color: #1890ff;
  font-weight: 500;
}

.bet-detail-table .value-row .col-win {
  color: #4CAF50;
}

.bet-detail-table .value-row.win-row td {
  background: #e6ffe6;
}

.bet-detail-table .value-row.win-row .col-win {
  color: #4CAF50;
  font-weight: bold;
}

.bet-detail-empty {
  color: #999;
  text-align: center;
  padding: 20px;
}

/* Verify Button - 验证按钮 */
.verify-btn {
  margin-left: 4px;
  padding: 3px 10px;
  font-size: 12px;
  color: #fff;
  background: linear-gradient(to bottom, #ff7a45, #fa541c);
  border: 1px solid #fa541c;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;
}

.verify-btn:hover {
  background: linear-gradient(to bottom, #fa541c, #d4380d);
  border-color: #d4380d;
}

/* Verify Modal - 验证弹框 */
.verify-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.verify-modal {
  background: #fff;
  border-radius: 4px;
  min-width: 550px;
  max-width: 650px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.verify-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.verify-modal-header h2 {
  font-size: 16px;
  font-weight: bold;
  color: #1e90ff;
  margin: 0;
}

.verify-modal-header .modal-close {
  font-size: 22px;
  color: #999;
  cursor: pointer;
  line-height: 1;
}

.verify-modal-header .modal-close:hover {
  color: #333;
}

.verify-modal-body {
  padding: 15px;
  max-height: 60vh;
  overflow-y: auto;
}

/* 验证表格样式 */
.verify-table {
  width: 100%;
  border-spacing: 0;
  border: 1px solid #1e90ff;
  border-collapse: collapse;
  font-size: 13px;
}

.verify-table td {
  border: 1px solid #1e90ff;
  padding: 8px 10px;
  text-align: center;
  color: #333;
}

.verify-table .label-cell {
  width: 80px;
  text-align: left;
  background: #f8f8f8;
  font-weight: 500;
  color: #333;
}

.verify-table .source-data {
  word-break: break-all;
  text-align: left;
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

.verify-table .result-formula {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  text-align: left;
}

.verify-table .result-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 13px;
  font-weight: bold;
  margin-left: 5px;
  color: #fff;
}

.verify-table .result-attrs {
  margin-left: 10px;
  font-size: 14px;
  font-weight: bold;
  color: #1e90ff;
}

.verify-table .special-result {
  font-size: 18px;
  font-weight: bold;
  color: #1e90ff;
  padding: 5px 15px;
  background: #e6f3ff;
  border-radius: 4px;
  display: inline-block;
}

.verify-table .final-nums {
  font-weight: bold;
  color: #1e90ff;
}

/* Add Mode */
.add-mode-wrap { text-align: center; padding: 50px; }

.add-mode-btn {
  display: inline-block;
  padding: 10px 30px;
  background: #1E9FFF;
  color: #fff;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
}

/* Rule Frame */
/* Game Rule Panel */
.gamerule-panel {
  padding: 10px;
}

.rule-container {
  background: #fff;
  border-radius: 4px;
  min-height: 400px;
}

.rule-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e6e6e6;
}

.rule-header h2 {
  font-size: 16px;
  color: #333;
  margin: 0;
  font-weight: bold;
}

.rule-header .rule-subtitle {
  font-size: 13px;
  font-weight: normal;
  color: #999;
  margin-left: 10px;
}

.rule-content {
  padding: 20px;
}

.rule-text {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
  white-space: pre-line;
}

.rule-html {
  font-size: 14px;
  color: #666;
  line-height: 1.8;
}

.rule-html :deep(p) {
  margin: 8px 0;
}

.rule-html :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

.rule-html :deep(td),
.rule-html :deep(th) {
  border: 1px solid #e6e6e6;
  padding: 8px 12px;
  font-size: 13px;
}

.rule-html :deep(th) {
  background: #f5f5f5;
  font-weight: 500;
}

.rule-html :deep(img) {
  max-width: 100%;
  height: auto;
}

.rule-html :deep(br) {
  display: block;
}

.rule-html :deep(ul),
.rule-html :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.rule-html :deep(li) {
  margin: 5px 0;
}

.rule-empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

/* Ranking Panel */
.ranking-panel {
  padding: 10px;
}

.ranking-container {
  background: #f5f5f5;
  border-radius: 4px;
  padding: 15px;
}

.ranking-columns {
  display: flex;
  gap: 15px;
}

.ranking-column {
  flex: 1;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.ranking-header {
  background: #fff;
  color: #e65c00;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  padding: 12px 15px;
  border-bottom: 1px solid #e8e8e8;
}

.ranking-list {
  max-height: 550px;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.rank-item:last-child {
  border-bottom: none;
}

.rank-medal {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
  margin-right: 8px;
  margin-top: 2px;
}

.medal-gold {
  background: linear-gradient(180deg, #ff8a4c 0%, #ff5722 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(255, 87, 34, 0.3);
}

.medal-silver {
  background: linear-gradient(180deg, #64b5f6 0%, #1976d2 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.3);
}

.medal-bronze {
  background: linear-gradient(180deg, #81c784 0%, #388e3c 100%);
  color: #fff;
  box-shadow: 0 2px 4px rgba(56, 142, 60, 0.3);
}

.medal-normal {
  background: #e8e8e8;
  color: #ff6600;
  font-weight: bold;
}

.rank-info {
  flex: 1;
  min-width: 0;
}

.rank-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-vip {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.rank-name {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rank-bet {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #e65c00;
  margin-top: 3px;
}

.bet-icon {
  width: 14px;
  height: 14px;
}

.rank-score {
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  margin-top: 2px;
}

.score-value {
  font-size: 14px;
  font-weight: bold;
  color: #e65c00;
}

.score-icon {
  width: 16px;
  height: 16px;
}

.ranking-loading {
  padding: 10px;
}

.rank-skeleton {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.skeleton-medal {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f0f0f0;
  margin-right: 10px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-info {
  flex: 1;
}

.skeleton-name {
  width: 80px;
  height: 14px;
  background: #f0f0f0;
  border-radius: 2px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-bet {
  width: 60px;
  height: 12px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-top: 6px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-score {
  width: 70px;
  height: 14px;
  background: #f0f0f0;
  border-radius: 2px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.ranking-empty {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

/* No modes text */
.no-modes-text {
  color: #999;
  font-size: 12px;
}

/* Profit/Loss Panel */
.weekgain-panel {
  padding: 10px;
}

.profit-summary {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 15px;
  gap: 30px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.summary-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 5px;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.summary-value.coin {
  color: #ffd700;
}

.summary-value.profit {
  color: #4ade80;
}

.summary-value.loss {
  color: #f87171;
}

.profit-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.profit-table th {
  background: #f5f5f5;
  padding: 12px 10px;
  text-align: center;
  font-weight: 500;
  color: #333;
  border-bottom: 1px solid #e6e6e6;
  font-size: 13px;
}

.profit-table td {
  padding: 12px 10px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
}

.profit-table tbody tr:hover {
  background: #fafafa;
}

.profit-table .coin {
  color: #ff9800;
  font-weight: 500;
}

.profit-table .profit {
  color: #4caf50;
  font-weight: 500;
}

.profit-table .loss {
  color: #f44336;
  font-weight: 500;
}

.profit-table .tax {
  color: #9c27b0;
  font-weight: 500;
}

/* Trend Chart Panel */
.trend-panel {
  padding: 10px;
}

.trend-container {
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e6e6e6;
}

.trend-header {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  background: linear-gradient(to bottom, #fafafa, #f0f0f0);
  border-bottom: 1px solid #e6e6e6;
  gap: 15px;
}

.trend-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.trend-selector {
  font-size: 13px;
  color: #666;
}

.trend-selector select {
  padding: 3px 6px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  font-size: 12px;
  margin: 0 4px;
  cursor: pointer;
  background: #fff;
}

.trend-selector select:focus {
  outline: none;
  border-color: #1890ff;
}

.trend-refresh-btn {
  padding: 3px 10px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.trend-refresh-btn:hover {
  background: #40a9ff;
}

.trend-table-wrapper {
  overflow-x: auto;
  max-height: 650px;
  overflow-y: auto;
}

.trend-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  min-width: 1100px;
  table-layout: fixed;
}

.trend-table thead {
  position: sticky;
  top: 0;
  z-index: 10;
}

.trend-table th {
  padding: 6px 2px;
  text-align: center;
  font-weight: 500;
  font-size: 11px;
  color: #333;
  border: 1px solid #d0d0d0;
  background: #e8e8e8;
}

/* Number column header colors - alternating by range */
.trend-table th.col-num:nth-child(n+3):nth-child(-n+8) { background: #c8e6c9; } /* 0-5 green */
.trend-table th.col-num:nth-child(n+9):nth-child(-n+12) { background: #bbdefb; } /* 6-9 blue */
.trend-table th.col-num:nth-child(n+13):nth-child(-n+16) { background: #ffcdd2; } /* 10-13 red */
.trend-table th.col-num:nth-child(n+17):nth-child(-n+20) { background: #ffe0b2; } /* 14-17 orange */
.trend-table th.col-num:nth-child(n+21):nth-child(-n+24) { background: #e1bee7; } /* 18-21 purple */
.trend-table th.col-num:nth-child(n+25):nth-child(-n+30) { background: #b2ebf2; } /* 22-27 cyan */

.trend-table td {
  padding: 4px 2px;
  text-align: center;
  border: 1px solid #e8e8e8;
  color: #666;
  height: 28px;
  vertical-align: middle;
}

/* Alternating row backgrounds for number columns */
.trend-table tbody tr:nth-child(odd) td.col-num { background: #fafafa; }
.trend-table tbody tr:nth-child(even) td.col-num { background: #fff; }

/* Light background tint for number ranges */
.trend-table td.col-num:nth-child(n+3):nth-child(-n+8) { background: rgba(200, 230, 201, 0.15); }
.trend-table td.col-num:nth-child(n+9):nth-child(-n+12) { background: rgba(187, 222, 251, 0.15); }
.trend-table td.col-num:nth-child(n+13):nth-child(-n+16) { background: rgba(255, 205, 210, 0.15); }
.trend-table td.col-num:nth-child(n+17):nth-child(-n+20) { background: rgba(255, 224, 178, 0.15); }
.trend-table td.col-num:nth-child(n+21):nth-child(-n+24) { background: rgba(225, 190, 231, 0.15); }
.trend-table td.col-num:nth-child(n+25):nth-child(-n+30) { background: rgba(178, 235, 242, 0.15); }

.trend-table .col-fixed {
  position: sticky;
  background: #fff;
  z-index: 5;
}

.trend-table .col-no {
  left: 0;
  width: 68px;
  min-width: 68px;
  color: #d32f2f;
  font-weight: 500;
  font-size: 11px;
  background: #fff9c4 !important;
}

.trend-table .col-time {
  left: 68px;
  width: 65px;
  min-width: 65px;
  color: #757575;
  font-size: 11px;
}

.trend-table thead .col-fixed {
  background: #e8e8e8;
  z-index: 15;
}

.trend-table thead .col-no {
  background: #fff59d !important;
}

.trend-table .col-num {
  width: 22px;
  min-width: 22px;
  max-width: 22px;
  padding: 2px 1px;
}

.trend-table .col-attr {
  width: 38px;
  min-width: 38px;
  padding: 2px;
  background: #f5f5f5;
}

.trend-table tbody tr:hover td {
  background: rgba(255, 235, 59, 0.2) !important;
}

.trend-table .loading-cell,
.trend-table .empty-cell {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  background: #fff !important;
}

/* Trend number balls - smaller and more compact */
.num-ball {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.ball-green { background: linear-gradient(135deg, #66bb6a, #43a047); }
.ball-blue { background: linear-gradient(135deg, #42a5f5, #1e88e5); }
.ball-red { background: linear-gradient(135deg, #ef5350, #e53935); }
.ball-orange { background: linear-gradient(135deg, #ffa726, #fb8c00); }
.ball-purple { background: linear-gradient(135deg, #ab47bc, #8e24aa); }
.ball-cyan { background: linear-gradient(135deg, #26c6da, #00acc1); }
.ball-gray { background: linear-gradient(135deg, #bdbdbd, #9e9e9e); }

/* Attribute tags - more compact */
.attr-tag {
  display: inline-block;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;
}

.attr-tag.big { background: #ffebee; color: #d32f2f; }
.attr-tag.small { background: #e3f2fd; color: #1976d2; }
.attr-tag.odd { background: #fff3e0; color: #f57c00; }
.attr-tag.even { background: #e8f5e9; color: #388e3c; }
.attr-tag.tail-big { background: #fce4ec; color: #c2185b; }
.attr-tag.tail-small { background: #e0f7fa; color: #0097a7; }
.attr-tag.middle { background: #f3e5f5; color: #7b1fa2; }
.attr-tag.side { background: #fff8e1; color: #ffa000; }

/* Attribute number (for tail and mod) - more compact */
.attr-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: linear-gradient(135deg, #e0e0e0, #bdbdbd);
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  color: #424242;
}
</style>
