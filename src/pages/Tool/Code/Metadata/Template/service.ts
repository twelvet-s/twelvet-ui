import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/gen/template";

/**
 * 查询代码生成业务模板列表
 * @param query 查询参数
 */
export function pageQueryTemplate(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询代码生成业务模板详细
 * @param 主键
 */
export function getTemplate(id: string | number) {
    return request(`${controller}/${id}`, {
        method: `get`
    })
}

/**
 * 新增代码生成业务模板
 * @param data 数据参数
 */
export function addTemplate(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data
    })
}

/**
 * 修改代码生成业务模板
 * @param data 数据参数
 */
export function updateTemplate(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data
    })
}

/**
 * 删除代码生成业务模板
 * @param 主键
 */
export function delTemplate(id: string | number) {
    return request(`${controller}/${id}`, {
        method: `delete`
    })
}

/**
 * 导出数据
 * @param params
 */
export async function exportTemplate(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}
