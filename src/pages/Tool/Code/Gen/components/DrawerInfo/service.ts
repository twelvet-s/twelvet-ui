import { request } from '@umijs/max';
import type { Key } from 'antd/lib/table/interface';

// 请求的控制器名称
const controller = '/gen';

/**
 * 获取分页 Data
 * @param params 搜索参数
 */
export async function pageQuery(params: Record<string, any>) {
    return request(`${controller}/db/list`, {
        method: 'GET',
        params: {
            ...params,
        },
    });
}

/**
 * 导入数据 Data
 * @param selectedRowKeys
 */
export async function importTable(dsName: string, selectedRowKeys: Key[]) {
    return request(`${controller}/importTable/${dsName}?tables=${selectedRowKeys}`, {
        method: 'POST',
    });
}
