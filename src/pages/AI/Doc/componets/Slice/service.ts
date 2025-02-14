import { request } from '@umijs/max';

// 请求的控制器名称
const controller = '/ai/slice';

/**
 * 查询AI知识库文档分片列表
 * @param query 查询参数
 */
export async function pageQuerySlice(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query,
    });
}

/**
 * 查询AI知识库文档分片详细
 * @param sliceId
 */
export async function getSlice(sliceId: number) {
    return request(`${controller}/${sliceId}`, {
        method: `get`,
    });
}

/**
 * 修改AI知识库文档分片
 * @param data 数据参数
 */
export async function updateSlice(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data,
    });
}
