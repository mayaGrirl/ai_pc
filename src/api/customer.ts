import http from '@/utils/request'
import type { HttpRes, PageRequest } from '@/types/http.type'
import type {
  DepositRecordField,
  CustomerProfile,
  MemberCapital,
  MemberField,
  VipReceiveState,
  ReliefResponse,
  RecommendLinkKey,
  RecommendCustomer,
  ReceiveRecommendRewardDto,
  SpreadRecordField,
  PointsRecordField,
  WagesCzRecordField,
  WagesRecordField,
  SalaryWekdayTotal,
  SalaryRecordField,
  SalaryZRecordField,
  SignInStatisticsField,
  SignInRecord,
  UpdateProfileDto,
  UpdatePasswordDto,
  SetSecurityPassDto,
  CheckSecurityPass,
  UpdateNicknameDto,
  BindEmailDto,
  SettingLoginAddressDto,
  SettingLoginSmsDto,
  RedeemGiftVerifyTypeDto,
  ViewCardVerifyTypeDto,
  CustomerTransferDto,
  PackExchangeDto
} from '@/types/customer.type'

/**
 * 签到统计
 */
export const signStat = (): Promise<HttpRes<SignInStatisticsField>> => {
  return http.get('/api/app/v1/customer/sign/stat', {})
}

/**
 * 签到
 */
export const signIn = (): Promise<HttpRes<SignInStatisticsField>> => {
  return http.post('/api/app/v1/customer/sign-in', {})
}

/**
 * 签到记录
 */
export const signRecords = (data: PageRequest): Promise<HttpRes<SignInRecord[]>> => {
  return http.post('/api/app/v1/customer/sign/records', data)
}

/**
 * 积分记录
 */
export const pointsRecords = (data: PageRequest): Promise<HttpRes<PointsRecordField[]>> => {
  return http.post('/api/app/v1/points/records', data)
}

/**
 * 充值记录
 */
export const depositRecords = (data: PageRequest): Promise<HttpRes<DepositRecordField[]>> => {
  return http.post('/api/app/v1/deposit/records', data)
}

/**
 * 登录日志
 */
export const loginLogs = (params?: { pagination?: any; page?: number; pageSize?: number }): Promise<HttpRes<any>> => {
  return http.get('/api/app/v1/customer/login-logs', params || {})
}

/**
 * 更新用户资料
 */
export const updateProfile = (data: UpdateProfileDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/edit/profile', data)
}

/**
 * 返利记录
 */
export const rebateRecords = (params?: { type?: string; pagination?: any; page?: number; pageSize?: number }): Promise<HttpRes<any>> => {
  return http.get('/api/app/v1/customer/rebate-records', params || {})
}

/**
 * 提现动态记录
 */
export const withdrawalDynamics = (limit: number = 10): Promise<HttpRes<DepositRecordField[]>> => {
  return http.post('/api/app/v1/deposit/withdraw', {
    pagination: { page: 1, size: limit }
  })
}

/**
 * 获取救济数据
 */
export const getReliefData = (): Promise<HttpRes<ReliefResponse>> => {
  return http.get('/api/app/v1/customer/relief', {})
}

/**
 * 领取救济
 */
export const receiveRelief = (): Promise<HttpRes<unknown>> => {
  return http.post('/api/app/v1/customer/receive/relief', {})
}

/**
 * 会员明细（包含会员详情和余额）
 */
export const customerProfile = (): Promise<HttpRes<CustomerProfile>> => {
  return http.get('/api/app/v1/customer/mine', {})
}

/**
 * VIP会员领取福利状态
 * 0 没有领取资格
 * 1 可以领取
 * 2 已领取
 */
export const vipReceiveState = (): Promise<HttpRes<VipReceiveState>> => {
  return http.get('/api/app/v1/customer/vip/receive-state', {})
}

/**
 * VIP会员领取福利
 */
export const vipReceiveWelfare = (): Promise<HttpRes<unknown>> => {
  return http.post('/api/app/v1/vip/receive-welfare', {})
}

/**
 * 获取会员资金信息
 */
export const getMemberCapital = (): Promise<HttpRes<MemberCapital>> => {
  return http.get('/api/app/v1/member-capital/detail', {})
}

/**
 * 获取会员资料信息
 */
export const getMemberField = (): Promise<HttpRes<MemberField>> => {
  return http.get('/api/app/v1/member-field/detail', {})
}

/**
 * 存款转入转出
 */
export const memberCapitalTransfer = (data: CustomerTransferDto): Promise<HttpRes<unknown>> => {
  return http.post('/api/app/v1/member-capital/transfer', data)
}

/**
 * 获取推广邀请链接
 */
export const recommendLink = (): Promise<HttpRes<RecommendLinkKey>> => {
  return http.get('/api/app/v1/recommend/link', {})
}

/**
 * 我推广的会员
 */
export const recommendCustomers = (data: PageRequest): Promise<HttpRes<RecommendCustomer[]>> => {
  return http.post('/api/app/v1/recommend/customers', data)
}

/**
 * 一键领取推广奖励(升级 + 投注)
 */
export const receiveRecommendReward = (data: ReceiveRecommendRewardDto): Promise<HttpRes<RecommendCustomer[]>> => {
  return http.post('/api/app/v1/recommend/receive-reward', data)
}

/**
 * 推广记录
 */
export const spreadRecords = (data: PageRequest): Promise<HttpRes<SpreadRecordField[]>> => {
  return http.post('/api/app/v1/spread/records', data)
}

/**
 * 每日首次充值返利记录
 */
export const wagesCzRecords = (data: PageRequest): Promise<HttpRes<WagesCzRecordField[]>> => {
  return http.post('/api/app/v1/wages-cz/records', data)
}

/**
 * 领取首次充值奖励
 */
export const receiveWagesCz = (id: number): Promise<HttpRes<WagesCzRecordField>> => {
  return http.post(`/api/app/v1/wages-cz/receive/${id}`, {})
}

/**
 * 亏损返利记录
 */
export const wagesRecords = (data: PageRequest): Promise<HttpRes<WagesRecordField[]>> => {
  return http.post('/api/app/v1/wages/records', data)
}

/**
 * 领取亏损奖励
 */
export const receiveWages = (id: number): Promise<HttpRes<WagesRecordField>> => {
  return http.post(`/api/app/v1/wages/receive/${id}`, {})
}

/**
 * 本周累计工资
 */
export const salaryWeeklyTotal = (): Promise<HttpRes<SalaryWekdayTotal>> => {
  return http.get('/api/app/v1/salary/weekly-total', {})
}

/**
 * 工资日记录
 */
export const salaryRecords = (data: PageRequest): Promise<HttpRes<SalaryRecordField[]>> => {
  return http.post('/api/app/v1/salary/records', data)
}

/**
 * 工资领取记录
 */
export const salaryZRecords = (data: PageRequest): Promise<HttpRes<SalaryZRecordField[]>> => {
  return http.post('/api/app/v1/salary-z/records', data)
}

/**
 * 领取工资
 */
export const receiveSalaryZ = (id: number): Promise<HttpRes<SalaryZRecordField>> => {
  return http.post(`/api/app/v1/salary-z/receive/${id}`, {})
}

/**
 * 一键领取工资
 */
export const receiveSalaryZAll = (): Promise<HttpRes<[]>> => {
  return http.post('/api/app/v1/salary-z/receive-all', {})
}

/**
 * 更新昵称
 */
export const updateNickname = (data: UpdateNicknameDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/edit/nickname', data)
}

/**
 * 绑定邮箱
 */
export const bindEmail = (data: BindEmailDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/bind-email', data)
}

/**
 * 更新登录密码
 */
export const updateLoginPassword = (data: UpdatePasswordDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/edit/login-password', data)
}

/**
 * 更新二级密码
 */
export const updatePayPassword = (data: UpdatePasswordDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/edit/pay-password', data)
}

/**
 * 验证密保问题
 */
export const checkSecurityPass = (data: SetSecurityPassDto): Promise<HttpRes<CheckSecurityPass>> => {
  return http.post('/api/app/v1/customer/check/security-pass', data)
}

/**
 * 设置密保问题
 */
export const setSecurityPass = (data: SetSecurityPassDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/set/security-pass', data)
}

/**
 * 设置登录地验证
 */
export const settingLoginAddress = (data: SettingLoginAddressDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/edit/login-location', data)
}

/**
 * 设置登录短信验证
 */
export const settingLoginVerifyType = (data: SettingLoginSmsDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/edit/login-sms', data)
}

/**
 * 设置兑换礼品验证方式
 */
export const settingRedeemGiftVerifyType = (data: RedeemGiftVerifyTypeDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/edit/redeem-gift', data)
}

/**
 * 设置查看卡密验证方式
 */
export const settingViewCardVerifyType = (data: ViewCardVerifyTypeDto): Promise<HttpRes<unknown>> => {
  return http.put('/api/app/v1/customer/edit/view-card', data)
}

/**
 * 兑换红包
 */
export const packExchange = (data: PackExchangeDto): Promise<HttpRes<unknown>> => {
  return http.post('/api/app/v1/pack/exchange', data)
}

/**
 * 会员接受短信
 */
export const customerReceiveSms = (scene: string): Promise<HttpRes<unknown>> => {
  return http.get('/api/app/v1/customer/receive-sms', {scene: scene})
}
