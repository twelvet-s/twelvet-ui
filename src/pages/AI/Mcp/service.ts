import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/ai/mcp";

/**
 * 查询AI MCP服务列表
 * @param query 查询参数
 */
export async function pageQueryMcp(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询AI MCP服务详细
 * @param mcpId
 */
export async function getMcp(mcpId: string | number) {
    return request(`${controller}/${mcpId}`, {
        method: `get`
    })
}

/**
 * 新增AI MCP服务
 * @param data 数据参数
 */
export async function addMcp(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data
    })
}

/**
 * 修改AI MCP服务
 * @param data 数据参数
 */
export async function updateMcp(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data
    })
}

/**
 * 删除AI MCP服务
 * @param 主键
 */
export async function delMcp(mcpId: string | number) {
    return request(`${controller}/${mcpId}`, {
        method: `delete`
    })
}

/**
 * 导出数据
 * @param params
 */
export async function exportMcp(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}
