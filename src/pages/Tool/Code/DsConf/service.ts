import { request } from '@umijs/max';
import { download } from '@/utils/twelvet';

// 请求的控制器名称
const controller = '/gen/dsConf';

/**
 * 查询数据源列表
 * @param query 查询参数
 */
export function pageQueryConf(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query,
    });
}

/**
 * 查询数据源详细
 * @param 主键
 */
export function getConf(id: string | number) {
    return request(`${controller}/${id}`, {
        method: `get`,
    });
}

/**
 * 新增数据源
 * @param data 数据参数
 */
export function addConf(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data,
    });
}

/**
 * 修改数据源
 * @param data 数据参数
 */
export function updateConf(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data,
    });
}

/**
 * 删除数据源
 * @param 主键
 */
export function delConf(id: string | number) {
    return request(`${controller}/${id}`, {
        method: `delete`,
    });
}

/**
 * 导出数据
 * @param params
 */
export async function exportConf(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}
