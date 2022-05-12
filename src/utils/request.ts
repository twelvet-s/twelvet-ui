import axios from 'axios';
import { logout } from '@/utils/twelvet';
import { Message, Notification } from '@arco-design/web-vue';
import { getToken, getRefreshToken, setToken } from '@/utils/auth';

import cache from '@/utils/cache';
import { isArray } from 'lodash';
import errorCode from './errorCode';
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { ContentType: 'application/json;charset=utf-8' },
  // 超时
  timeout: 10000,
});

/**
 * request拦截器
 */
service.interceptors.request.use(
  (config) => {
    // 是否需要设置 token
    // @ts-ignore
    const isToken: any = (config.headers || {}).isToken === false;
    // 是否需要防止数据重复提交
    // @ts-ignore
    const isRepeatSubmit: any = (config.headers || {}).repeatSubmit === false;
    if (getToken() && !isToken) {
      // 让每个请求携带自定义token 请根据实际情况自行修改
      // @ts-ignore
      config.headers.Authorization = `Bearer ${getToken()}`;
    }

    if (!isRepeatSubmit && config.method !== 'get') {
      const requestObj = {
        url: config.url,
        data:
          typeof config.data === 'object'
            ? JSON.stringify(config.data)
            : config.data,
        time: new Date().getTime(),
      };
      const sessionObj = cache.session.getJSON('sessionObj');

      if (
        sessionObj === undefined ||
        sessionObj === null ||
        sessionObj === ''
      ) {
        cache.session.setJSON('sessionObj', requestObj);
      } else {
        const sUrl = sessionObj.url; // 请求地址
        const sData = sessionObj.data; // 请求数据
        const sTime = sessionObj.time; // 请求时间
        const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
        if (
          sData === requestObj.data &&
          requestObj.time - sTime < interval &&
          sUrl === requestObj.url
        ) {
          const message = '数据正在处理，请勿重复提交';
          return Promise.reject(new Error(message));
        }
        cache.session.setJSON('sessionObj', requestObj);
      }
    }
    return config;
  },
  (error) => {
    Promise.reject(new Error(error));
  }
);
/**
 * 刷新token
 * @param url 访问URL（成功刷新后重新请求地址）
 * @param method 请求方式
 * @param responseType 请求类型
 * @param params body
 * @param params query
 * @returns
 */
const refreshToken = async (
  url: string,
  method: string,
  responseType: string,
  data: any,
  params: any
) => {
  let response;
  await axios({
    url: `/auth/oauth/token`,
    method: `POST`,
    params: {
      grant_type: `refresh_token`,
      refresh_token: getRefreshToken(),
      client_id: `twelvet`,
      client_secret: `123456`,
    },
  })
    .then((res) => {
      // 续签失败将要求重新登录
      if (res.code !== 200) {
        Notification.error('续签失败，两秒后退出！！！');

        setInterval(() => {
          logout();
        }, 2000);
        throw new Error('续签失败');
      }

      // 重新设置token
      setToken(res.access_token, res.refresh_token);
    })
    .then(async () => {
      // 重新请求本次数据
      if (url) {
        await axios({
          url,
          method,
          responseType: responseType === 'blob' ? 'blob' : 'json',
          data,
          params,
        }).then((repeatRes: any) => {
          response = repeatRes;
        });
      }
    });
  // 返回响应
  return response;
};

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.data.code || 200;
    if (code !== 200) {
      // 获取错误信息
      // @ts-ignore
      const msg = errorCode[code] || res.data.msg || errorCode.default;
      Message.error(msg);
      return Promise.reject(new Error(msg));
    }

    // 二进制数据则直接返回
    if (
      res.request.responseType === 'blob' ||
      res.request.responseType === 'arraybuffer'
    ) {
      return res.data;
    }

    return res.data;
  },
  async (error) => {
    const { response } = error;

    if (response?.data.code === 401) {
      const { config } = response;
      const { params, data, method, url, responseType } = config;
      const res = await refreshToken(url, method, responseType, data, params);
      if (res) {
        return res;
      }

      return Promise.reject(new Error(error));
    }
    let { message } = error;
    if (message === 'Network Error') {
      message = '后端接口连接异常';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    } else if (message.includes('Request failed with status code')) {
      message = `系统接口${message.substr(message.length - 3)}异常`;
    }
    Message.error(message);
    return Promise.reject(new Error(error));
  }
);

/**
 * 通用下载方法
 * @param url 地址
 * @param params 参数
 * @param filename 文件名称(空即为输出默认)
 */
export const download = (
  url: string,
  params?: { [key: string]: any },
  filename?: string
) => {
  return service(`${url}`, {
    method: 'POST',
    data: {
      ...params,
    },
    params: {
      refresh: new Date().getTime(),
    },
    responseType: 'blob',
    parseResponse: false,
  })
    .then((response) => {
      // 空的将采用默认
      if (!filename) {
        const contentDisposition = response.headers.get('content-disposition');
        if (!contentDisposition) {
          return response.blob();
        }
        const name = contentDisposition.split('filename=');
        if (isArray(name)) {
          // 获取并还原编码
          filename = decodeURIComponent(name[1]);
        } else {
          filename = 'unknown';
        }
      }

      return response.blob();
    })
    .then((blob) => {
      if ('download' in document.createElement('a')) {
        // 非IE下载
        const elink = document.createElement('a');
        elink.download = filename || 'unknown';
        elink.style.display = 'none';
        elink.href = URL.createObjectURL(blob);
        document.body.appendChild(elink);
        elink.click();
        URL.revokeObjectURL(elink.href);
        document.body.removeChild(elink);
      } else {
        // IE10+下载
        navigator.msSaveBlob(blob, filename);
      }
    })
    .catch((r) => {
      console.error(r);
    });
};

/**
 * 通用文件上传
 * @param url 地址
 * @param formData 数据对象 FormData
 * @param params 参数
 */
export const upload = (url: string, formData: FormData) => {
  return service(`${url}`, {
    method: 'POST',
    requestType: 'form',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': '*/*',
    },
    data: formData,
  });
};

export default service;
