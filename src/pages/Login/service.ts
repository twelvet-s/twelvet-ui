import TWT from '@/setting';
import { request } from '@umijs/max';

// 请求的控制器名称
const controller = '/auth';

// window.btoa('twelvet:123456') 提前加密，不要暴露
const auth = `Basic dHdlbHZldDoxMjM0NTY=`;

/**
 * 登录
 * @param params 登录参数
 * @returns
 */
export async function login(params: Record<string, any>) {
    return request(`${controller}/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: auth,
            'X-Requested-With': 'XMLHttpRequest',
            Accept: '*/*',
        },
        data: {
            ...params,
        },
        params: {
            ...params,
            grant_type: params.grantType,
            scope: 'server',
        },
    });
}

/**
 * 第三方授权登录
 * @param params 登录参数
 * @returns
 */
export async function oauth2Login(params: Record<string, any>) {
    return request(`${controller}/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: auth,
            'X-Requested-With': 'XMLHttpRequest',
            Accept: '*/*',
        },
        params: {
            ...params,
            scope: 'server',
        },
    });
}

/**
 * 获取当前用户登录信息
 * @returns
 */
export async function getCurrentUser(): Promise<any> {
    return request(`system/user/getInfo`, {
        method: 'GET',
    });
}

/**
 * 获取当前用户菜单路由
 * @returns
 */
export async function getRouters(): Promise<any> {
    return request(`system/menu/getRouters`, {
        method: 'GET',
    });
}

/**
 * 刷新令牌
 */
export async function refreshToken() {
    const formData: any = {
        refresh_token: localStorage.getItem(TWT.refreshToken),
        grant_type: 'refresh_token',
    };
    return request(`${controller}/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: auth,
        },
        // 将对象转换为查询字符串，表单请求
        data: Object.keys(formData)
            .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(formData[k])}`)
            .join('&'),
    });
}
