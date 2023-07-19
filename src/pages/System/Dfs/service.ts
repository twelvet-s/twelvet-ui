import {request} from '@umijs/max'
import {download} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/dfs";

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
 * @param fileIds
 */
export async function remove(fileIds: string) {
    return request(`${controller}/${fileIds}`, {
        method: 'DELETE',
    });
}

/**
 * 下载文件
 * @param fileId 文件id
 */
export async function downloadFile(fileId: string) {
    return download(`${controller}/download/${fileId}`);
}
