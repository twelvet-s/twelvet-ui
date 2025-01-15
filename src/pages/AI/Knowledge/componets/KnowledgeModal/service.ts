import { request } from '@umijs/max';

// 请求的控制器名称
const controller = '/ai/knowledge';

/**
 * 查询AI知识库详细
 * @param knowledgeId
 */
export async function getKnowledge(knowledgeId: number) {
    return request(`${controller}/${knowledgeId}`, {
        method: `get`,
    });
}

/**
 * 新增AI知识库
 * @param data 数据参数
 */
export async function addKnowledge(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data,
    });
}

/**
 * 修改AI知识库
 * @param data 数据参数
 */
export async function updateKnowledge(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data,
    });
}
