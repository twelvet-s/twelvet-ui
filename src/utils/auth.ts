const ACCESS_TOKEN = 'TWT_access_token';
const REFRESH_TOKEN = 'TWT_refresh_token';

/**
 * 判断是否登录
 * @returns boole
 */
const isLogin = () => {
  return !!localStorage.getItem(ACCESS_TOKEN);
};

/**
 * 获取token
 * @returns ACCESS_TOKEN
 */
const getToken = () => {
  return localStorage.getItem(ACCESS_TOKEN);
};

/**
 * 获取刷新token
 * @returns REFRESH_TOKEN
 */
const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN);
};

/**
 * 设置token以及刷新token
 * @param accessToken ACCESS_TOKEN
 * @param refreshToken REFRESH_TOKEN
 */
const setToken = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN, accessToken);
  localStorage.setItem(REFRESH_TOKEN, refreshToken);
};

/**
 * 清除token以及刷新token
 */
const clearToken = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
};

export { isLogin, getToken, getRefreshToken, setToken, clearToken };
