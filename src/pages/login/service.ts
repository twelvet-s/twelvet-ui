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
    });
}