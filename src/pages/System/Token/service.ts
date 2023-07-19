import {request} from '@umijs/max'

// 请求的控制器名称
const controller = "/system";

/**
 * 获取分页 Data
 * @param params 搜索参数
 */
export async function pageQuery(params: Record<string, any>) {
    return request(`${controller}/token/pageQuery`, {
        method: 'GET',
        params: {
            ...params
        },
    });
}

/**
 * 删除数据
 * @param tokenId
 */
export async function remove(tokenId: string) {
    return request(`${controller}/token/${tokenId}`, {
        method: 'DELETE',
    });
}
