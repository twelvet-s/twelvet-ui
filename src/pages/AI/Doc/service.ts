import { request } from '@umijs/max'
import { download, upload } from '@/utils/twelvet';

// 请求的控制器名称
const controller = "/ai/doc";

/**
 * 查询AI知识库文档列表
 * @param query 查询参数
 */
export async function pageQueryDoc(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询AI知识库文档详细
 * @param 主键
 */
export async function getDoc(docId: string | number) {
    return request(`${controller}/${docId}`, {
        method: `get`
    })
}

/**
 * 新增AI知识库文档
 * @param data 数据参数
 */
export async function addDoc(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data
    })
}

/**
 * 修改AI知识库文档
 * @param data 数据参数
 */
export async function updateDoc(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data
    })
}

/**
 * 删除AI知识库文档
 * @param 主键
 */
export async function delDoc(docId: string | number) {
    return request(`${controller}/${docId}`, {
        method: `delete`
    })
}

/**
 * 导出数据
 * @param params
 */
export async function exportDoc(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}

/**
 * 查询AI知识库列表
 * @param query 查询参数
 */
export async function listKnowledgeQueryDoc(query: { [key: string]: any }) {
    return request(`/ai/knowledge/list`, {
        method: `get`,
        params: query
    })
}

/**
 * 上传数据
 * @param formData
 */
export async function batchUpload(formData: FormData) {
    return upload(`/dfs/batchUpload`, formData);
}
