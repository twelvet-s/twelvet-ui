import request from '@/utils/request';

/**
 * 新增客户端
 * @param params
 * @returns
 */
export function insertClientApi(data) {
  return request({
    url: `system/client/pageQuery`,
    method: 'put',
    data,
  });
}
/**
 * 获取菜单列表
 * @param params
 * @returns
 */
export function getMenuListApi(params) {
  return request({
    url: `system/menu/list`,
    method: 'get',
    params,
  });
}
