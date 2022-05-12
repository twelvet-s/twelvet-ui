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
 * 删除客户端
 * @param params
 * @returns
 */
export function deleteClientApi(ids: []) {
  return request({
    url: `system/client/pageQuery/${ids.join(',')}`,
    method: 'delete',
  });
}

/**
 * 修改客户端
 * @param params
 * @returns
 */
export function updateClientApi(data) {
  return request({
    url: `system/client/pageQuery`,
    method: 'put',
    data,
  });
}

/**
 * 获取客户端列表
 * @param params
 * @returns
 */
export function getClientListApi(params) {
  return request({
    url: `system/client/pageQuery`,
    method: 'get',
    params,
  });
}

/**
 * 获取客户端列表
 * @param params
 * @returns
 */
export function getClientByIdApi(clientId) {
  return request({
    url: `system/client/${clientId}`,
    method: 'get',
  });
}
