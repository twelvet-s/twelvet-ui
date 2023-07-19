import {request} from '@umijs/max'
import {download, upload} from '@/utils/twelvet'

// 请求的控制器名称
const controller = "/system/user";

/**
 * 新增职员
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
 * 删除
 * @param userIds
 */
export async function remove(userIds: (string | number)[] | string) {
    return request(`${controller}/${userIds}`, {
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
 * 修改密码
 * @param params 修改密码
 */
export async function updatePassword(params: Record<string, any>) {
    return request(`${controller}/resetPwd`, {
        method: 'PUT',
        data: {
            ...params
        },
    });
}

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
 *
 * @param params
 */
export async function changeStatus(params: Record<string, any>) {
    return request(`${controller}/changeStatus`, {
        method: 'PUT',
        data: {
            ...params
        },
    });
}

/**
 * 获取指定职员信息
 * @param userId
 */
export async function getByStaffId(userId: number) {
    return request(`${controller}/${userId}`, {
        method: 'GET'
    });
}

/**
 * 获取职员新增所属信息
 */
export async function getByStaff() {
    return request(`${controller}/`, {
        method: 'GET'
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
 * 获取部门树
 */
export async function treeSelect() {
    return request(`/system/dept/treeSelect`, {
        method: 'GET'
    });
}

/**
 * 下载模板
 * @param params
 */
export async function exportTemplate(params?: Record<string, any>) {
    return download(`${controller}/exportTemplate`, params);
}

/**
 * 上传数据
 * @param formData
 */
export async function importData(formData: FormData) {
    return upload(`${controller}/importData`, formData);
}
