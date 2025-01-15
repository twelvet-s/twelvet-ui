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
 * 删除AI知识库
 * @param knowledgeId
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
