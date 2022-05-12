import axios from 'axios';
import request from '@/utils/request';
import { UserState } from '@/store/modules/user/types';

export interface LoginData {
  username: string;
  password: string;
}
export interface LoginResponse {
  access_token: string;
  code: number;
  dept_id: number;
  expires_in: number;
  user_id: number;
  roles: [];
  refresh_token: string;
  scope: string;
  token_type: string;
  username: string;
}

// export function login(data: LoginData) {
//   return axios.post<LoginRes>('/api/user/login', data);
// }
export function login(data: LoginData) {
  const { username, password } = data;
  return request.post<LoginResponse>(
    `auth/oauth/token?username=${username}&password=${password}` +
      '&autoLogin=false&type=account&grant_type=password&scope=server&client_id=twelvet&client_secret=123456'
  );
}
export function logout() {
  return axios.post('/login/outLogin');
}

export function getUserInfo() {
  return axios.post<UserState>('/user/info');
}
