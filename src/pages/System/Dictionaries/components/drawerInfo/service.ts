import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/system/dictionaries/data";

/**
 * 新增字典
 * @param params 搜索参数
 */
export async function insert(params: Record<string, any>) {
    return request(`${controller}`, {
        method: 'POST',
        data: {
            ...params
        },
    });
}

/**
 * 删除
 * @param postIds
 */
export async function remove(postIds: (string | number)[] | string) {
    return request(`${controller}/${postIds}`, {
        method: 'DELETE',
    });
}

/**
 * 修改菜单
 * @param params 搜索参数
 */
export async function update(params: Record<string, any>) {
    return request(`${controller}`, {
        method: 'PUT',
        data: {
            ...params
        },
    });
}

/**
 * 获取分页 Data
 * @param params 搜索参数
 */
export async function pageQuery(params: Record<string, any>) {
    return request(`${controller}/pageQuery`, {
        method: 'GET',
        params: {
            ...params
        },
    });
}

/**
 * 获取指定字典信息
 * @param postId
 */
export async function getBydictCode(postId: number) {
    return request(`${controller}/${postId}`, {
        method: 'GET'
    });
}

/**
 * 导出Excel
 * @param params
 */
export async function exportExcel(params?: Record<string, any>) {
    return download(`${controller}/export`, params);
}
