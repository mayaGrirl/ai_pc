// 管理员 / 用户基础信息
export interface MemberField {
  aid?: number;
  qq?: string | null;
  nickname?: string | null;
  birthday?: number;
  signature?: string | null;
  realname?: string | null;
  gender?: number;
  alipay?: string | null;
  wchat?: string | null;
  address?: string | null;
  sign?: string | null;
  mobile?: string | null;
  email?: string | null;
}

// 会员余额
export interface MemberCapital {
  cid?: number;
  money?: string | null;
  gold?: number;
  points?: number;
  bankpoints?: number;
  blessing?: number;
  bill?: string | null;
  bond?: string | null;
  frozen?: number | null;
  signin?: number;
  signins?: number;
  experience?: number;
  next_level?: number;
  udapoints?: number;
}

// 用户基础信息
export interface CustomerField {
  id?: number;
  sid?: number;
  user?: string | null;
  mobile?: string | null;
  phone?: string | null;
  securitypass?: string | null;
  email?: string | null;
  spread_code?: string | null;
  gid?: number;
  gid_label?: string | null;
  level?: number;
  nw?: number;
  vip: number;
  vip_label?: string | null;
  vipStime?: number;
  vipEtime?: number;
  avatar?: string | null;
  avatar_url?: string | null;
  regtime?: number;
  reg_ip?: string | null;
  reg_address?: string | null;
  last_login_time?: number;
  last_login_ip?: string | null;
  last_login_address?: string | null;
  login_sun?: number;
  status?: number;
  tjr?: number;
  tgall?: number;
  isLogin?: number;
  address1?: string | null;
  address2?: string | null;
  loginVerifyType?: string | null;
  isMobile?: number;
  prizeVerifyType?: string | null;
  selectcardVerifyType?: string | null;
  sc?: number;
  cz?: number;
  czf?: number;
  tz?: number;
  tzf?: number;
  zcf?: number;
  scf?: number;
  ksf?: number;
  xm?: number;
  points?: number;
  // Additional fields from MemberField and MemberCapital
  nickname?: string | null;
  bankpoints?: number;
  bank_balance?: number;
  frozen?: number | null;
  experience?: number;
  blessing?: number;
}

// 会员明细
export interface CustomerProfile {
  customer: CustomerField;
  member_field: MemberField;
  member_capital: MemberCapital;
}

// Block数据
export interface BlockField {
  id?: number;
  identifier?: string | null;
  language?: string | null;
  title?: string | null;
  content_type?: number;
  content?: string | null;
  status?: number;
  disable_action?: string | null;
  operator_user_id?: number;
  operator_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
