import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/system/loginInfo";

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
    download(`${controller}/export`, params);
}
