/**
 * 首页数据类型枚举
 */
export enum IndexType {
  BANNER = 1,
  ANNOUNCEMENT = 2,
  ACTIVITY = 3,
  PARTNER = 4,
  HOME_POPUP = 5,
  MESSAGE = 6,
  GAME_NOTICE = 7,
  LOGIN_BANNER = 8,
  MINE_AD = 9,
}

export interface IndexInfoDto {
  type: number;
  roll?: string;
  alert?: string;
  is_expired?: string;
}

export interface IndexGameDto {
  limit?: number;
  hot_count?: number;
  new_count?: number;
}

export interface IndexDetailDto {
  id: number;
}

export interface IndexDataItem {
  id: number;
  title: string;
  lang_title?: object | [];
  roll: number;
  alert: number;
  type: number;
  content: string;
  lang_content?: object | [];
  pic: string;
  pc_pic: string;
  jump_url: string;
  start_at?: string | null;
  end_at?: string | null;
  sort: number;
  admin_id?: number;
  admin?: string;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface gameItem {
  id: number;
  name?: string;
  logo?: string;
  game_logo?: string;
  lang_name?: [];
  game_class?: number;
  is_hot?: number;
  is_show?: number;
  info?: string;
  lang_info?: [];
}

export interface IndexGameItem {
  hot?: gameItem[];
  new?: gameItem[];
}

export interface webConfig {
  app_logo: string;
  app_name: string;
  customer_link: string;
  h5_url: string;
  pc_url: string;
  pic_url: string;
  connet_qq?: string;
}
