import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

/**
 * 查询部门列表
 * @param query 查询参数
 */
export function listDept(query: { [key: string]: any }) {
    return request(`/system/dept/list`, {
        method: `get`,
        params: query
    })
}

/**
 * 查询部门详细
 * @param 主键
 */
export function getDept(deptId: string | number) {
    return request(`/system/dept/${deptId}`, {
        method: `get`
    })
}

/**
 * 新增部门
 * @param data 数据参数
 */
export function addDept(data: { [key: string]: any }) {
    return request(`/system/dept`, {
        method: `post`,
        data: data
    })
}

/**
 * 修改部门
 * @param data 数据参数
 */
export function updateDept(data: { [key: string]: any }) {
    return request(`/system/dept`, {
        method: `put`,
        data: data
    })
}

/**
 * 删除部门
 * @param 主键
 */
export function delDept(deptId: string | number) {
    return request(`/system/dept/${deptId}`, {
        method: `delete`
    })
}

/**
 * 导出数据
 * @param params
 */
export async function exportDept(params?: { [key: string]: any }) {
    return download(`/system/dept/export`, params);
}
