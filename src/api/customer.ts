import http from '@/utils/request'
import type { HttpRes } from '@/types/http.type'

/**
 * 签到统计
 */
export const signStat = (): Promise<HttpRes<any>> => {
  return http.get('/api/app/v1/customer/sign-stat', {})
}

/**
 * 签到
 */
export const signIn = (): Promise<HttpRes<any>> => {
  return http.post('/api/app/v1/customer/sign-in', {})
}

/**
 * 签到记录
 */
export const signRecords = (params?: { page?: number; pageSize?: number }): Promise<HttpRes<any>> => {
  return http.get('/api/app/v1/customer/sign-records', params || {})
}

/**
 * 积分记录
 */
export const pointsRecords = (params?: { pagination?: any; page?: number; pageSize?: number }): Promise<HttpRes<any>> => {
  return http.get('/api/app/v1/customer/points-records', params || {})
}

/**
 * 充值记录
 */
export const depositRecords = (params?: { pagination?: any; page?: number; pageSize?: number }): Promise<HttpRes<any>> => {
  return http.get('/api/app/v1/customer/deposit-records', params || {})
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
export const updateProfile = (data: any): Promise<HttpRes<any>> => {
  return http.post('/api/app/v1/customer/update-profile', data)
}

/**
 * 返利记录
 */
export const rebateRecords = (params?: { type?: string; pagination?: any; page?: number; pageSize?: number }): Promise<HttpRes<any>> => {
  return http.get('/api/app/v1/customer/rebate-records', params || {})
}
