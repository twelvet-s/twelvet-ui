import TWT from '@/setting';
import {request} from '@umijs/max'

// 请求的控制器名称
const controller = `/system`;

// 更新用户头像API
export const updateAvatar = `${TWT.action}system/user/profile/avatar`;

/**
 * 查询用户个人信息
 * @returns
 */
export function getUserProfile() {
    return request(`${controller}/user/profile`, {
        method: 'get'
    })
}

/**
 * 修改用户个人信息
 * @param data 修改内容
 * @returns
 */
export function updateUserProfile(params: Record<string, any>) {
    return request(`${controller}/user/profile`, {
        method: 'put',
        data: {
            ...params
        }
    })
}

/**
 * 用户密码重置
 * @param data 账号密码
 * @returns
 */
export function updateUserPwd(params: Record<string, any>) {
    return request(`${controller}/user/profile/updatePwd`, {
        method: 'put',
        data: {
            ...params
        }
    })
}
