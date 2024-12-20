import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/ai/knowledge";

/**
 * 查询AI知识库列表
 * @param query 查询参数
 */
export async function pageQueryKnowledge(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询AI知识库详细
 * @param 主键
 */
export async function getKnowledge(knowledgeId: string | number) {
    return request(`${controller}/${knowledgeId}`, {
        method: `get`
    })
}

/**
 * 新增AI知识库
 * @param data 数据参数
 */
export async function addKnowledge(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data
    })
}

/**
 * 修改AI知识库
 * @param data 数据参数
 */
export async function updateKnowledge(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data
    })
}

/**
 * 删除AI知识库
 * @param 主键
 */
export async function delKnowledge(knowledgeId: string | number) {
    return request(`${controller}/${knowledgeId}`, {
        method: `delete`
    })
}

/**
 * 导出数据
 * @param params
 */
export async function exportKnowledge(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}
