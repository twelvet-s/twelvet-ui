import { request } from '@umijs/max'
import { download } from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/ai/slice";

/**
 * 查询AI知识库文档分片列表
 * @param query 查询参数
 */
export function pageQuerySlice(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询AI知识库文档分片详细
 * @param 主键
 */
export function getSlice(sliceId: string | number) {
    return request(`${controller}/${sliceId}`, {
        method: `get`
    })
}

/**
 * 新增AI知识库文档分片
 * @param data 数据参数
 */
export function addSlice(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data
    })
}

/**
 * 修改AI知识库文档分片
 * @param data 数据参数
 */
export function updateSlice(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data
    })
}

/**
 * 删除AI知识库文档分片
 * @param 主键
 */
export function delSlice(sliceId: string | number) {
    return request(`${controller}/${sliceId}`, {
        method: `delete`
    })
}

/**
 * 导出数据
 * @param params
 */
export async function exportSlice(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}

/**
 * 查询AI知识库列表
 * @param query 查询参数
 */
export function listModelQueryDoc(query: { [key: string]: any }) {
    return request(`/ai/model/list`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询AI知识库文档列表
 * @param query 查询参数
 */
export function listDocQueryDoc(query: { [key: string]: any }) {
    return request(`/ai/doc/list`, {
        method: `get`,
        params: query
    })
}