import { request } from '@umijs/max';
import { download } from '@/utils/twelvet';

// 请求的控制器名称
const controller = '/ai/model';

/**
 * 查询AI大模型列表
 * @param query 查询参数
 */
export async function pageQueryModel(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query,
    });
}

/**
 * 查询AI大模型详细
 * @param modelId
 */
export async function getModel(modelId: string | number) {
    return request(`${controller}/${modelId}`, {
        method: `get`,
    });
}

/**
 * 新增AI大模型
 * @param data 数据参数
 */
export async function addModel(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data,
    });
}

/**
 * 修改AI大模型
 * @param data 数据参数
 */
export async function updateModel(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data,
    });
}

/**
 * 删除AI大模型
 * @param modelId
 */
export async function delModel(modelId: string | number) {
    return request(`${controller}/${modelId}`, {
        method: `delete`,
    });
}

/**
 * 导出数据
 * @param params
 */
export async function exportModel(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}

/**
 *
 * @param params
 */
export async function changeStatus(params: Record<string, any>) {
    return request(`${controller}/changeStatus`, {
        method: 'PUT',
        data: {
            ...params,
        },
    });
}
