import {request} from '@umijs/max'

// 请求的控制器名称
const controller = "/system/dictionaries/data/type";

/**
 * 根据字典获取信息
 * @param type
 */
export async function getDictionariesType(type: string) {
    return request(`${controller}/${type}`, {
        method: 'GET'
    });
}
