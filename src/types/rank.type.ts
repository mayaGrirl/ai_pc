import { CustomerField, MemberField } from './customer.type'

// 今日/昨日排行榜字段
export interface RankTodayField {
  id: number
  stat_date: string
  member_id: number
  is_robot: number
  bet_count: number
  bet_gold: number
  win_gold: number
  profit: number
  auto_bet_gold: number
  hand_bet_gold: number
  auto_bet_count: number
  hand_bet_count: number
  win_count: number
  lose_count: number
  tax_gold: number
  created_at: string
  updated_at: string
  member_field?: MemberField
  member?: CustomerField
}

// 上周排行榜字段
export interface RankWeekField {
  rank: number
  level: number
  name: string
  score: number
}
