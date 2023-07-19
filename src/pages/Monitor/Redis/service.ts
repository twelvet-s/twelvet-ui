import {request} from '@umijs/max'

// 请求的控制器名称
const controller = "/system/monitor";

/**
 * 获取redis信息
 * @returns redis信息
 */
export async function query() {
    return request(`${controller}/redis`, {
        method: 'GET',
    });
}
