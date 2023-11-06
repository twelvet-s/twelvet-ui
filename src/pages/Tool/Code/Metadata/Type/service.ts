import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/gen/type";

/**
 * 查询字段类型管理列表
 * @param query 查询参数
 */
export function pageQueryType(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询字段类型管理详细
 * @param 主键
 */
export function getType(id: string | number) {
    return request(`${controller}/${id}`, {
        method: `get`
    })
}

/**
 * 新增字段类型管理
 * @param data 数据参数
 */
export function addType(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data
    })
}

/**
 * 修改字段类型管理
 * @param data 数据参数
 */
export function updateType(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data
    })
}

/**
 * 删除字段类型管理
 * @param 主键
 */
export function delType(id: string | number) {
    return request(`${controller}/${id}`, {
        method: `delete`
    })
}

/**
 * 导出数据
 * @param params
 */
export async function exportType(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}
