import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/job/cron";

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
 * 根据ID获取任务信息
 * @param params 搜索参数
 */
export async function run(params: Record<string, any>) {
    return request(`${controller}/run`, {
        method: 'PUT',
        data: {
            ...params
        }
    });
}

/**
 * 根据ID获取任务信息
 * @param jobId
 */
export async function getByJobId({jobId}: { jobId: number }) {
    return request(`${controller}/${jobId}`, {
        method: 'GET',
    });
}

/**
 * 删除数据
 * @param infoIds
 */
export async function remove(infoIds: string) {
    return request(`${controller}/${infoIds}`, {
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

/**
 * 更改状态
 * @param params
 */
export async function insert(params?: Record<string, any>) {
    return request(`${controller}`, {
        method: 'POST',
        data: {
            ...params
        }
    })
}

/**
 * 更改状态
 * @param params
 */
export async function update(params?: Record<string, any>) {
    return request(`${controller}`, {
        method: 'PUT',
        data: {
            ...params
        }
    })
}
