import http from '@/utils/request'
import { HttpRes } from '@/types/http.type'
import { RankTodayField, RankWeekField } from '@/types/rank.type'

// 今日排行榜
export const rankToday = (): Promise<HttpRes<RankTodayField[]>> => {
  return http.get<HttpRes<RankTodayField[]>>('/api/app/v1/rank/today', {})
}

// 昨日排行榜
export const rankYesterday = (): Promise<HttpRes<RankTodayField[]>> => {
  return http.get<HttpRes<RankTodayField[]>>('/api/app/v1/rank/yesterday', {})
}

// 上周排行榜
export const rankWeek = (): Promise<HttpRes<RankWeekField[]>> => {
  return http.get<HttpRes<RankWeekField[]>>('/api/app/v1/rank/week', {})
}
