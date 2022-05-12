import { clearToken } from '@/utils/auth';

/**
 * 统一退出登录操作
 */
export const logout = () => {
  // 清除access_token/refresh_token
  clearToken();
  window.location.reload();
};

/**
 * 参数处理
 * @param params 参数
 * @returns 字符串参数
 */
export function tansParams(params) {
  let result = '';
  Object.keys(params).forEach((propName) => {
    const value = params[propName];
    const part = `${encodeURIComponent(propName)}=`;
    if (value !== null && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        Object.keys(value).forEach((key) => {
          if (value[key] !== null && typeof value[key] !== 'undefined') {
            const param = `${propName}[${key}]`;
            const subPart = `${encodeURIComponent(param)}=`;
            result += `${subPart}${encodeURIComponent(value[key])}&`;
          }
        });
      } else {
        result += `${part}${encodeURIComponent(value)}&`;
      }
    }
  });
  return result;
}
