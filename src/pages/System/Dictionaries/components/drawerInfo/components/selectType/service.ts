import {request} from '@umijs/max'

// 请求的控制器名称
const controller = "/system/dictionaries/type";

/**
 * 获取指定字典信息
 */
export async function optionSelect() {
    return request(`${controller}/optionSelect`, {
        method: 'GET'
    });
}
