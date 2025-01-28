import { request } from '@umijs/max';

// 请求的控制器名称
const controller = '/auth';


/**
 * 获取GitHub第三方授权登录
 * @returns 登录地址
 */
export async function getAuthorize(oauthCode: string) {
    return request(`${controller}/login/oauth2/${oauthCode}`, {
        method: 'GET',
    });
}
