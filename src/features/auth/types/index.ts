export interface LoginRequest {
  login_id: string;
  password?: string;
}

export interface LoginResponse {
  id: number;
  login_id: string;
  first_name: string;
  last_name: string;
  role_id: number;
  is_first_login: number; // 0 or 1
  token: string;
  refreshToken: string;
}
