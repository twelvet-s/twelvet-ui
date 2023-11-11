import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/gen/templateGroup";

/**
 * 查询模板分组列表
 * @param query 查询参数
 */
export function pageQueryGroup(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询模板分组详细
 * @param 主键
 */
export function getGroup(id: string | number) {
    return request(`${controller}/${id}`, {
        method: `get`
    })
}

/**
 * 新增模板分组
 * @param data 数据参数
 */
export function addGroup(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data
    })
}

/**
 * 修改模板分组
 * @param data 数据参数
 */
export function updateGroup(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data
    })
}

/**
 * 删除模板分组
 * @param 主键
 */
export function delGroup(id: string | number) {
    return request(`${controller}/${id}`, {
        method: `delete`
    })
}

/**
 * 导出数据
 * @param params
 */
export async function exportGroup(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}


/**
 * 查询模板列表
 * @param query 查询参数
 */
export function listQueryTemplate() {
    return request(`${controller}/queryTemplateList`, {
        method: `get`
    })
}