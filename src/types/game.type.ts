// 游戏分类和游戏列表响应
export interface GameClassRes {
  typeArr?: GameType[];
  gameArr?: Game[];
  gameTypeMap?: GameTypeMapItem[];
}

// 游戏分类
export interface GameType {
  id: number;
  title: string;
  logo?: string;
  lang_title?: Record<string, string> | null;
  sort?: number;
  is_show?: number;
  created_at?: string;
  updated_at?: string;
}

// 游戏
export interface Game {
  id: number;
  name: string;
  logo?: string;
  game_logo?: string;
  lang_name?: Record<string, string> | null;
  game_class?: number;
  is_hot?: number;
  is_show?: number;
  info?: string;
  lang_info?: Record<string, string>;
  sort?: number;
  created_at?: string;
  updated_at?: string;
}

// 游戏分类映射项
export interface GameTypeMapItem {
  id: number;
  title: string;
  lang_title?: Record<string, string> | null;
  logo?: string;
  children: Game[];
}

// 游戏玩法列表响应
export interface gamePlayAll {
  playedArr?: GamePlay[];
  groupArr?: GamePlayGroup[];
  gamePlayMap?: GamePlayMapItem[];
}

// 游戏玩法
export interface GamePlay {
  id: number;
  name: string;
  lang_name?: Record<string, string> | null;
  lottery_id?: number;
  group_id?: number;
  multiple?: number;
  odds?: string | number;
  min_bet?: number;
  min_bet_gold?: number;
  max_bet?: number;
  max_bet_gold?: number;
  info?: string;
  lang_info?: Record<string, string> | null;
  unique_played_method?: string;
  sort?: number;
  is_show?: number;
  status?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// 玩法分组
export interface GamePlayGroup {
  id: number;
  name: string;
  lang_name?: Record<string, string> | string;
  game_class?: number;
  game_type?: number;
  reward_num?: number;
  start_num?: number;
  logo?: string;
  info?: string;
  lang_info?: Record<string, string> | null;
  status?: number;
  sort?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// 玩法映射项
export interface GamePlayMapItem {
  id: number;
  name: string;
  lang_name?: Record<string, string> | string;
  game_class?: number;
  game_type?: number;
  logo?: string;
  info?: string;
  lang_info?: Record<string, string> | null;
  children: GamePlay[];
}

// 获取玩法列表请求参数
export interface gamePlayAllDto {
  lottery_id: number;
}

// 投注请求参数
export interface BetGameDto {
  game_group_id: string | number;
  lottery_id: string | number;
  bet_no: string;
  bet_expect_no: string;
  bet_gold: string;
  lottery_played_id: string;
  total_gold: number;
}

// 期号信息
export interface ExpectInfo {
  expect_no: string;
  action_no?: string | number;
  action_time?: string;
  open_time?: string;
  close_time?: string;
  open_timestamp?: number;
  close_timestamp?: number;
  open_countdown?: number;
  close_countdown?: number;
  finalRes?: ExpectFinalRes;
  action_no_sort?: string | number;
}

// 期号开奖结果
export interface ExpectFinalRes {
  expect_no?: string;
  expectNo?: string;
  nums?: string | string[] | Record<string, string>;
  sum?: string | number;
  bigSmall?: string;
  oddEven?: string;
  shape?: string;
  lungFuPao?: string;
  [key: `finalOpenRes${number}`]: string | number | undefined;
}

// 获取期号信息请求参数
export interface ExpectInfoDto {
  lottery_id: number;
  game_group_id: number;
}

// 获取期号信息响应
export interface ExpectInfoRes {
  currExpectInfo?: ExpectInfo;
  lastExpectInfo?: ExpectInfo;
}

// 投注响应
export interface BetGameRes {
  success?: boolean;
  message?: string;
  order_id?: string | number;
}

export interface LotteryDataDto {
  lottery_id: number;
  game_group_id: number;
  page: number;
  pageSize: number;
}

export interface BetDataDto {
  page: number;
  pageSize: number;
  lottery_id: number;
  game_group_id: number;
  expect_no?: string;
}

// 开奖记录响应
export interface LotteryListRes {
  list: LotteryResultItem[];
  total?: number;
  page?: number;
  pageSize?: number;
}

// 开奖记录项
export interface LotteryResultItem {
  id?: number;
  game_type_id?: number;
  is_opened?: number;
  expect_no?: string;
  action_no?: string;
  action_no_sort?: string;
  action_no_num?: string | string[] | Record<string, string>;
  origin_data?: string;
  open_time?: string;
  close_time?: string;
  bet_gold?: number;
  win_person_num?: number;
  user_bet_gold?: number;
  user_bet_win_gold?: number;
  game_type_name?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  final_res?: LotteryFinalRes;
  memberBet?: MemberBetItem[] | MemberBetItem;
}

// 开奖结果详情
export interface LotteryFinalRes {
  expect_no?: string;
  expectNo?: string;
  nums?: string | string[] | Record<string, string>;
  sum?: number | string;
  bigSmall?: string;
  oddEven?: string;
  middleSide?: string;
  tail?: number | string;
  tailBigSmall?: string;
  mod6?: number;
  mod5?: number;
  mod4?: number;
  mod3?: number;
  shape?: string;
  lungFuPao?: string;
  finalResRecord?: string;
  [key: `finalOpenRes${number}`]: string | number | undefined;
}

// 用户在该期的投注记录
export interface MemberBetItem {
  id?: number;
  expect_no?: string;
  game_type_id?: number;
  game_group_id?: number;
  bet_gold?: number;
  win_gold?: number;
  profit?: number;
  status?: number;
  created_at?: string;
}

// 投注记录响应
export interface BetRecordRes {
  list: BetRecordItem[];
  total?: number;
  page?: number;
  pageSize?: number;
}

// 投注记录项
export interface BetRecordItem {
  id?: number;
  member_id?: number;
  game_type_id?: number;
  game_group_id?: number;
  expect_no?: string;
  bet_no?: BetNoItem[] | Record<string, BetNoItem>;
  bet_gold?: number;
  bet_no_gold?: string;
  bet_num?: number;
  win_gold?: number;
  water_gold?: number;
  bet_time?: string;
  is_opened?: number;
  is_win?: number;
  is_robot?: number;
  is_auto?: number;
  status?: number | string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  win_loss?: number;
  game_type_name?: string;
  member_name?: string;
}

// 投注号码详情
export interface BetNoItem {
  bet_no?: string;
  bet_gold?: number;
  bet_play?: string;
  multiple?: number;
  win_gold?: number;
  unique_played_method?: string;
}
