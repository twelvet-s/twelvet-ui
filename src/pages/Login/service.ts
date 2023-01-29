import TWT from '@/setting';
import { request } from '@umijs/max'

// 请求的控制器名称
const controller = "/auth";

const auth = 'Basic ' + window.btoa("twelvet:123456")

/**
 * 登录
 * @param params 登录参数
 * @returns
 */
export async function login(params: Record<string, any>) {
    return request(`${controller}/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: auth
        },
        data: {
            ...params
        },
        params: {
            ...params,
            grant_type: 'password',
            scope: 'server'
        }
    });
}

/**
 * 获取当前用户登录信息
 * @returns
 */
export async function getCurrentUser(): Promise<any> {
    return request(`system/user/getInfo`, {
        method: 'GET'
    })
}

/**
 * 获取当前用户菜单路由
 * @returns
 */
export async function getRouters(): Promise<any> {
    return request(`system/menu/getRouters`, {
        method: 'GET'
    })
}

/**
 * 刷新令牌
 */
export async function refreshToken() {

    return request(`${controller}/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: auth
        },
        params: {
            refresh_token: localStorage.getItem(TWT.refreshToken),
            grant_type: 'refresh_token'
        }
    })
}
