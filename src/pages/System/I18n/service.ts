import { request } from '@umijs/max';
import { download } from '@/utils/twelvet';

// 请求的控制器名称
const controller = '/system/i18n';

/**
 * 初始化国际化数据
 */
export function initI18n() {
    return request(`${controller}/init`, {
        method: `post`,
    });
}

/**
 * 查询国际化列表
 * @param query 查询参数
 */
export function pageQueryI18n(query: { [key: string]: any }) {
    return request(`${controller}/pageQuery`, {
        method: `get`,
        params: query,
    });
}

/**
 * 查询国际化详细
 * @param i18nId
 */
export function getI18n(i18nId: string | number) {
    return request(`${controller}/${i18nId}`, {
        method: `get`,
    });
}

/**
 * 新增国际化
 * @param data 数据参数
 */
export function addI18n(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `post`,
        data: data,
    });
}

/**
 * 修改国际化
 * @param data 数据参数
 */
export function updateI18n(data: { [key: string]: any }) {
    return request(`${controller}`, {
        method: `put`,
        data: data,
    });
}

/**
 * 删除国际化
 * @param 主键
 */
export function delI18n(i18nId: string | number) {
    return request(`${controller}/${i18nId}`, {
        method: `delete`,
    });
}

/**
 * 导出数据
 * @param params
 */
export async function exportI18n(params?: { [key: string]: any }) {
    return download(`${controller}/export`, params);
}
