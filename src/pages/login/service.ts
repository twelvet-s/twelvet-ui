import TWT from '@/setting';
import { request } from 'umi'

// 请求的控制器名称
const controller = "/auth";

/**
 * 登录
 * @param params 登录参数
 * @returns 
 */
export async function login(params: { [key: string]: any }) {
    return request(`${controller}/oauth/token`, {
        method: 'POST',
        data: {
            ...params
        },
        params: {
            ...params,
            grant_type: 'password',
            scope: 'server',
            client_id: 'twelvet',
            client_secret: '123456'
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
 * 刷新令牌
 * @param params 登录参数
 */
export async function refreshToken() {

    return request(`${controller}/oauth/token`, {
        method: 'POST',
        params: {
            refresh_token: localStorage.getItem(TWT.refreshToken),
            grant_type: 'refresh_token',
            scope: 'server',
            client_id: 'twelvet',
            client_secret: '123456'
        }
    })
}

/**
 * 刷新Token
 * @returns 
 */
export async function refreshTokenService(): Promise<any> {
    return request(`/auth/oauth/token`, {
        method: `POST`,
        params: {
            grant_type: `refresh_token`,
            refresh_token: localStorage.getItem(TWT.refreshToken),
            client_id: `twelvet`,
            client_secret: `123456`
        }
    });
}