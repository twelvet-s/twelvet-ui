import {request} from '@umijs/max'

// 请求的控制器名称
const controller = "/system/menu";

/**
 * 新增菜单
 * @param params 搜索参数
 */
export async function insert(params: Record<string, any>) {
    return request(`${controller}`, {
        method: 'POST',
        data: {
            ...params
        },
    });
}

/**
 * 删除菜单
 * @param menuId 菜单ID
 */
export async function remove(menuId: number) {
    return request(`${controller}/${menuId}`, {
        method: 'DELETE',
    });
}

/**
 * 修改菜单
 * @param params 搜索参数
 */
export async function update(params: Record<string, any>) {
    return request(`${controller}`, {
        method: 'PUT',
        data: {
            ...params
        },
    });
}

/**
 * 获取菜单List Data
 * @param params 搜索参数
 */
export async function list(params: Record<string, any>) {
    return request(`${controller}/list`, {
        method: 'GET',
        params: {
            ...params
        },
    });
}

/**
 * 根据菜单ID获取信息
 * @param menuId 菜单ID
 */
export async function getInfo(menuId: number) {
    return request(`${controller}/${menuId}`, {
        method: 'GET',
    });
}
