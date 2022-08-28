import type { RequestOptions } from '@@/plugin-request/request';
import { RequestConfig, request as httpRequest } from '@umijs/max';
import { message, notification } from 'antd';
import { getCurrentUser, refreshToken as refreshTokenService } from './pages/Login/service'
import TWT from './setting';
import { logout, setAuthority } from './utils/twelvet';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * 刷新token
 * @param url 访问URL（成功刷新后重新请求地址）
 * @param method 请求方式
 * @param responseType 请求类型
 * @param params body
 * @param params query
 * @returns 
 */
const refreshToken: Response = async (
  url: string,
  method: string,
  responseType: string,
  data: {},
  params: {}
) => {

  let response

  // 续签失败将要求重新登录
  const res = await refreshTokenService()

  if (res.code == 400) {
    notification.error({
      message: `续签失败`,
      description: `续签失败,请重新登录`,
    })
    return logout()
  }

  setAuthority(res)

  // 重新请求本次数据
  if (url) {
    await httpRequest(url, {
      method,
      responseType: responseType === 'blob' ? 'blob' : 'json',
      // 禁止自动序列化response
      parseResponse: false,
      data,
      params
    }).then((res: any) => {
      response = res
    })
  }

  // 返回响应
  return response


}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warn(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        //message.error('Response status:', error.response.status);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      const local = localStorage.getItem(TWT.accessToken)

      const { access_token } = local ? JSON.parse(local) : { access_token: '', expires_in: 0 }

      let authHeader;
      if (!config.headers?.Authorization) {
        authHeader = { ...config.headers, Authorization: `Bearer ${access_token}` }
      } else {
        authHeader = {
          ...config.headers,
        }
      }

      // 拦截请求配置，进行个性化处理。
      const url = config?.url;
      return {
        ...config,
        url: url?.charAt(0) === '/' ? `/api${url}` : `/api/${url}`,
        headers: authHeader
      };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // TODO 处理响应拦截
      return response;
    },
  ],
};
