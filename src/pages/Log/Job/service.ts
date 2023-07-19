import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/job/log";

/**
 * 获取分页 Data
 * @param params 搜索参数
 */
export async function pageQuery(params: Record<string, any>) {
    return request(`${controller}/pageQuery`, {
        method: 'GET',
        params: {
            ...params
        },
    });
}

/**
 * 删除数据
 * @param jobLogIds
 */
export async function remove(jobLogIds: string) {
    return request(`${controller}/${jobLogIds}`, {
        method: 'DELETE',
    });
}

/**
 * 导出Excel
 * @param params
 */
export async function exportExcel(params?: Record<string, any>) {
    return download(`${controller}/export`, params);
}

/**
 * 更改状态
 * @param params
 */
export async function changeStatus(params?: Record<string, any>) {
    return request(`${controller}/changeStatus`, {
        method: 'PUT',
        data: {
            ...params
        }
    })
}
