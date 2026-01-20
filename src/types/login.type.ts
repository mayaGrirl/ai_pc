export interface RegistrationDto {
  mobile: string;
  verify_code: string;
  password: string;
  confirm_password: string;
  recommend?: string;
}

export interface LoginDto {
  mobile: string;
  password?: string;
  code?: string;
  type: number;
}

export interface RegistrationReq {
  access_token: string;
  token_type: string;
  expires_at: number;
  mfa_sercret: string;
  qr_url: string;
}

export interface LoginReq {
  access_token?: string;
  token_type?: string;
  expires_at?: number;
  sercret?: string;
  is_set_pay_password?: boolean;
}

export interface ForgetPasswordDto {
  mobile: string;
  verify_code: string;
  password: string;
  confirm_password: string;
  [property: string]: unknown;
}

export interface ResetPasswordDto {
  confirm_password: string;
  key: string;
  password: string;
  point: string;
  verify_code: string;
  [property: string]: unknown;
}
