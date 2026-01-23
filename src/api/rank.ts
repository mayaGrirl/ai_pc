import http from '@/utils/request'
import { HttpRes } from '@/types/http.type'
import {LastWeekField, TodayField, YesterdayField} from '@/types/rank.type'

// 今日排行榜
export const rankToday = (): Promise<HttpRes<TodayField[]>> => {
  return http.get<HttpRes<TodayField[]>>('/api/app/v1/rank/today', {})
}

// 昨日排行榜
export const rankYesterday = (): Promise<HttpRes<YesterdayField[]>> => {
  return http.get<HttpRes<YesterdayField[]>>('/api/app/v1/rank/yesterday', {})
}

// 上周排行榜
export const rankWeek = (): Promise<HttpRes<LastWeekField[]>> => {
  return http.get<HttpRes<LastWeekField[]>>('/api/app/v1/rank/week', {})
}
